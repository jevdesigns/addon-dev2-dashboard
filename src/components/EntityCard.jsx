/**
 * Example Entity Card Component
 * Demonstrates how to display an entity and call services (e.g., light toggle, climate set temp)
 */
import React, { useState } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Slider from '@mui/material/Slider'
import { useHass } from '../contexts/HassContext'
import { toggleLight, turnOnLight, turnOffLight, setClimateTemperature } from '../api/haServices'

/**
 * @param {object} entity - entity object from HA (e.g., {entity_id, state, attributes: {...}})
 */
export default function EntityCard({ entity }) {
  const hass = useHass()
  const [brightness, setBrightness] = useState(null)
  const [loading, setLoading] = useState(false)

  if (!entity) return null

  const { entity_id, state, attributes = {} } = entity
  const domain = entity_id?.split('.')[0] || 'unknown'

  const handleToggleLight = async () => {
    setLoading(true)
    try {
      await toggleLight(hass, entity_id)
    } catch (err) {
      console.error('Toggle light failed:', err)
    }
    setLoading(false)
  }

  const handleSetBrightness = async (val) => {
    setBrightness(val)
    setLoading(true)
    try {
      // Convert 0-100 to HA brightness 0-255
      const haBrightness = Math.round((val / 100) * 255)
      await turnOnLight(hass, entity_id, haBrightness)
    } catch (err) {
      console.error('Set brightness failed:', err)
    }
    setLoading(false)
  }

  const handleSetTemp = async (val) => {
    setLoading(true)
    try {
      await setClimateTemperature(hass, entity_id, val)
    } catch (err) {
      console.error('Set temperature failed:', err)
    }
    setLoading(false)
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">{entity_id}</Typography>
        <Typography variant="body2" color="textSecondary">
          {state} {attributes?.unit_of_measurement ? ` ${attributes.unit_of_measurement}` : ''}
        </Typography>

        {domain === 'light' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption">Brightness</Typography>
            <Slider
              value={brightness !== null ? brightness : (attributes.brightness ? (attributes.brightness / 255) * 100 : 50)}
              onChange={(_, val) => handleSetBrightness(val)}
              min={0}
              max={100}
              step={1}
              marks={[{ value: 0, label: 'Off' }, { value: 100, label: 'Max' }]}
              disabled={loading}
            />
          </Box>
        )}

        {domain === 'climate' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption">Target Temperature</Typography>
            <Slider
              value={attributes.target_temperature || 20}
              onChange={(_, val) => handleSetTemp(val)}
              min={16}
              max={30}
              step={0.5}
              marks={[{ value: 16, label: '16°' }, { value: 30, label: '30°' }]}
              disabled={loading}
            />
          </Box>
        )}
      </CardContent>

      <CardActions>
        {domain === 'light' && (
          <>
            <Button size="small" onClick={handleToggleLight} disabled={loading}>
              {state === 'on' ? 'Turn Off' : 'Turn On'}
            </Button>
          </>
        )}
        {domain === 'climate' && (
          <Typography variant="caption">Set target temp using slider above</Typography>
        )}
      </CardActions>
    </Card>
  )
}
