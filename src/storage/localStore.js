import localforage from 'localforage'

const store = localforage.createInstance({
  name: 'd522-dashboard'
})

export async function saveEntityState(entityId, stateObj){
  const key = `entity:${entityId}`
  const existing = (await store.getItem(key)) || []
  existing.push({ts: Date.now(), state: stateObj})
  // keep last 1000 points to avoid unbounded growth on low-powered devices
  const trimmed = existing.slice(-1000)
  await store.setItem(key, trimmed)
}

export async function getEntityHistory(entityId){
  const key = `entity:${entityId}`
  return (await store.getItem(key)) || []
}

export async function listEntities(){
  const keys = []
  await store.iterate((value, key) => { if (key && key.startsWith('entity:')) keys.push(key.replace('entity:', '')) })
  return keys
}

export async function exportAll(){
  const out = {}
  await store.iterate((value, key) => { out[key] = value })
  return out
}

// Settings helpers: save runtime settings like WebSocket URL and access token
const SETTINGS_KEY = 'settings'

export async function saveSettings(obj){
  await store.setItem(SETTINGS_KEY, obj)
}

export async function getSettings(){
  return (await store.getItem(SETTINGS_KEY)) || {}
}

export async function clearSettings(){
  await store.removeItem(SETTINGS_KEY)
}
