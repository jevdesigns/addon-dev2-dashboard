#!/usr/bin/env node
// Simple local publish server for the D522 dashboard.
// Listens on localhost and accepts POST /publish with JSON { id, title, html, kiosk }
// Requires Authorization: Bearer <token> header which is validated against VITE_HA_TOKEN in .env

const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const path = require('path')
const child_process = require('child_process')
require('dotenv').config({path: path.join(process.cwd(), '.env')})

const app = express()
app.use(bodyParser.json({limit: '10mb'}))

const PORT = process.env.PUBLISH_SERVER_PORT || 5000
const EXPECTED = process.env.VITE_HA_TOKEN || ''

function auth(req, res, next){
  const h = req.get('authorization') || ''
  if (!h.startsWith('Bearer ')) return res.status(401).json({error:'missing bearer'})
  const token = h.slice(7)
  if (!EXPECTED) {
    console.warn('No VITE_HA_TOKEN configured in .env — accepting any token (insecure)')
    return next()
  }
  if (token !== EXPECTED) return res.status(403).json({error:'bad token'})
  next()
}

app.post('/publish', auth, async (req, res) => {
  try{
    const {id, title, html, kiosk} = req.body
    if (!id || !html) return res.status(400).json({error:'id and html required'})

    const outDir = path.join(process.cwd(), 'dist', 'published', id)
    fs.mkdirSync(outDir, {recursive:true})
    const outFile = path.join(outDir, 'index.html')
    fs.writeFileSync(outFile, html, 'utf8')

    // Optionally write a metadata file
    const meta = { id, title: title || id, kiosk: !!kiosk, publishedAt: new Date().toISOString() }
    fs.writeFileSync(path.join(outDir, 'meta.json'), JSON.stringify(meta, null, 2), 'utf8')

    // Also update a 'kiosk-latest' shortcut so Home Assistant can point to a stable URL
    try{
      const latestDir = path.join(process.cwd(), 'dist', 'published', 'kiosk-latest')
      if (fs.existsSync(latestDir)) {
        fs.rmSync(latestDir, { recursive: true, force: true })
      }
      fs.mkdirSync(latestDir, { recursive: true })
      fs.writeFileSync(path.join(latestDir, 'index.html'), html, 'utf8')
      fs.writeFileSync(path.join(latestDir, 'meta.json'), JSON.stringify(Object.assign({}, meta, {alias: 'kiosk-latest'}), null, 2), 'utf8')
      console.log('Updated kiosk-latest published copy')
    }catch(e){ console.warn('failed to update kiosk-latest copy', e) }

    // Run atomic deploy (sync) to push dist/ to HA
    console.log('Running deploy-atomic.ps1 to push dist/ to target...')
    const ps = child_process.spawn('powershell', ['-NoProfile','-ExecutionPolicy','Bypass','-File','./deploy-atomic.ps1'], {cwd: process.cwd(), stdio: 'inherit'})
    ps.on('close', (code) => {
      if (code === 0) res.json({ok:true, meta})
      else res.status(500).json({error:'deploy failed', code})
    })
  }catch(e){
    console.error(e)
    res.status(500).json({error: String(e)})
  }
})

// List published kiosks
app.get('/published', auth, (req, res) => {
  try{
    const pubRoot = path.join(process.cwd(), 'dist', 'published')
    if (!fs.existsSync(pubRoot)) return res.json([])
    const items = fs.readdirSync(pubRoot, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => {
      const id = d.name
      const metaPath = path.join(pubRoot, id, 'meta.json')
      let meta = { id }
      try{ if (fs.existsSync(metaPath)) meta = Object.assign(meta, JSON.parse(fs.readFileSync(metaPath,'utf8'))) }catch(e){}
      return meta
    })
    res.json(items)
  }catch(e){ console.error(e); res.status(500).json({error: String(e)}) }
})

// Set a published kiosk as the latest (manual override)
app.post('/set-latest', auth, (req, res) => {
  try{
    const { id } = req.body
    if (!id) return res.status(400).json({ error: 'id required' })
    const pubRoot = path.join(process.cwd(), 'dist', 'published')
    const src = path.join(pubRoot, id)
    const dst = path.join(pubRoot, 'kiosk-latest')
    if (!fs.existsSync(src)) return res.status(404).json({ error: 'source not found' })
    if (fs.existsSync(dst)) fs.rmSync(dst, { recursive: true, force: true })
    // copy src -> dst
    const copyRecursive = (s, d) => {
      fs.mkdirSync(d, { recursive: true })
      for (const e of fs.readdirSync(s, { withFileTypes: true })){
        const sPath = path.join(s, e.name)
        const dPath = path.join(d, e.name)
        if (e.isDirectory()) copyRecursive(sPath, dPath)
        else fs.copyFileSync(sPath, dPath)
      }
    }
    copyRecursive(src, dst)
    // run deploy to push change
    const ps = child_process.spawn('powershell', ['-NoProfile','-ExecutionPolicy','Bypass','-File','./deploy-atomic.ps1'], {cwd: process.cwd(), stdio: 'inherit'})
    ps.on('close', (code) => {
      if (code === 0) res.json({ ok: true, id })
      else res.status(500).json({ error: 'deploy failed', code })
    })
  }catch(e){ console.error(e); res.status(500).json({ error: String(e) }) }
})

app.get('/', (req,res)=> res.send('D522 publish server running'))

app.listen(PORT, () => console.log(`Publish server listening on http://localhost:${PORT}`))
