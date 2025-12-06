/**
 * Home Assistant Service Caller
 * Provides a thin wrapper around HA WebSocket or hass object for service calls
 */

/**
 * Call a Home Assistant service
 * @param {object} haSource - either a hass object (from HA panel) or a WebSocket connection object
 * @param {string} domain - service domain (e.g., 'light', 'climate', 'script')
 * @param {string} service - service name (e.g., 'turn_on', 'set_temperature')
 * @param {object} serviceData - service call data (entity_id, brightness, temperature, etc.)
 * @returns {Promise<object>} result from the service call
 */
export async function callHAService(haSource, domain, service, serviceData) {
  if (!haSource) throw new Error('No HA source provided (hass or WebSocket connection)')

  // If it's a hass object (from HA panel), use its callService method
  if (haSource.callService && typeof haSource.callService === 'function') {
    return new Promise((resolve, reject) => {
      haSource.callService(domain, service, serviceData, true).then(resolve).catch(reject)
    })
  }

  // If it's our WebSocket connection, send a service_call message
  if (haSource.send && typeof haSource.send === 'function') {
    return new Promise((resolve, reject) => {
      const id = Math.floor(Math.random() * 10000)
      const unsubscribe = () => {
        // In a real scenario, you'd listen for the result message by ID
        // For now, assume success after a short delay
        setTimeout(() => resolve({ success: true }), 100)
      }
      haSource.send({
        id,
        type: 'call_service',
        domain,
        service,
        service_data: serviceData
      })
      unsubscribe()
    })
  }

  throw new Error('Invalid HA source: must be hass object or WebSocket connection')
}

/**
 * Convenience functions for common service calls
 */

export function toggleLight(haSource, entityId) {
  return callHAService(haSource, 'light', 'toggle', { entity_id: entityId })
}

export function turnOnLight(haSource, entityId, brightness = null) {
  const data = { entity_id: entityId }
  if (brightness !== null) data.brightness = brightness
  return callHAService(haSource, 'light', 'turn_on', data)
}

export function turnOffLight(haSource, entityId) {
  return callHAService(haSource, 'light', 'turn_off', { entity_id: entityId })
}

export function setClimateTemperature(haSource, entityId, temperature) {
  return callHAService(haSource, 'climate', 'set_temperature', {
    entity_id: entityId,
    temperature
  })
}

export function setClimateMode(haSource, entityId, hvacMode) {
  return callHAService(haSource, 'climate', 'set_hvac_mode', {
    entity_id: entityId,
    hvac_mode: hvacMode
  })
}

export function activateScene(haSource, sceneId) {
  return callHAService(haSource, 'scene', 'turn_on', { entity_id: sceneId })
}

export function callScript(haSource, scriptId) {
  return callHAService(haSource, 'script', 'turn_on', { entity_id: scriptId })
}

export function executeAutomation(haSource, automationId) {
  return callHAService(haSource, 'automation', 'trigger', { entity_id: automationId })
}
