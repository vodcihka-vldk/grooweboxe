/**
 * CommunicationManager - Web Serial API wrapper for GrooveBoxe
 * Handles communication with the ESP32 hardware device
 */

class CommunicationManager {
  constructor() {
    this.port = null
    this.reader = null
    this.writer = null
    this.isConnected = false
    this.deviceInfo = null
    
    // Message queue for reliable communication
    this.messageQueue = []
    this.isProcessingQueue = false
    
    // Event listeners
    this.listeners = {
      data: [],
      error: [],
      connect: [],
      disconnect: []
    }
  }

  async connect() {
    try {
      // Request serial port access
      if (!('serial' in navigator)) {
        throw new Error('Web Serial API not supported')
      }
      
      this.port = await navigator.serial.requestPort({
        filters: [
          { usbVendorId: 0x10C4, usbProductId: 0xEA60 }, // CP2102
          { usbVendorId: 0x1A86, usbProductId: 0x7523 }  // CH340
        ]
      })
      
      // Open port with configuration
      await this.port.open({
        baudRate: 115200,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
      })
      
      this.isConnected = true
      this.deviceInfo = {
        vendorId: this.port.getInfo().usbVendorId,
        productId: this.port.getInfo().usbProductId,
        connected: true
      }
      
      // Set up communication
      await this.setupCommunication()
      
      this.emit('connect', this.deviceInfo)
      console.log('Connected to GrooveBoxe device')
      
    } catch (error) {
      this.emit('error', error)
      throw error
    }
  }

  async disconnect() {
    if (this.reader) {
      await this.reader.cancel()
    }
    
    if (this.port) {
      await this.port.close()
    }
    
    this.isConnected = false
    this.deviceInfo = null
    this.emit('disconnect')
    console.log('Disconnected from GrooveBoxe device')
  }

  async setupCommunication() {
    // Set up reader
    this.reader = this.port.readable.getReader()
    
    // Set up writer
    this.writer = this.port.writable.getWriter()
    
    // Start reading messages
    this.readLoop()
  }

  async readLoop() {
    try {
      while (true) {
        const { value, done } = await this.reader.read()
        
        if (done) {
          break
        }
        
        // Process received data
        this.processMessage(value)
      }
    } catch (error) {
      this.emit('error', error)
    } finally {
      this.reader.releaseLock()
    }
  }

  processMessage(data) {
    try {
      const decoder = new TextDecoder()
      const message = decoder.decode(data)
      
      // Parse JSON message
      const parsed = JSON.parse(message)
      
      // Handle different message types
      switch (parsed.type) {
        case 'device_info':
          this.deviceInfo = { ...this.deviceInfo, ...parsed.data }
          this.emit('data', parsed)
          break
          
        case 'pattern_data':
          this.emit('pattern_data', parsed.data)
          break
          
        case 'channel_data':
          this.emit('channel_data', parsed.data)
          break
          
        case 'audio_status':
          this.emit('audio_status', parsed.data)
          break
          
        case 'error':
          this.emit('error', new Error(parsed.message))
          break
          
        default:
          this.emit('data', parsed)
      }
    } catch (error) {
      console.error('Failed to parse message:', error)
    }
  }

  async sendMessage(type, data = {}) {
    const message = {
      type: type,
      timestamp: Date.now(),
      data: data
    }
    
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(JSON.stringify(message) + '\n')
    
    try {
      await this.writer.write(dataBuffer)
    } catch (error) {
      this.emit('error', error)
      throw error
    }
  }

  async getDeviceInfo() {
    await this.sendMessage('get_device_info')
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout waiting for device info'))
      }, 5000)
      
      const handler = (data) => {
        if (data.type === 'device_info') {
          clearTimeout(timeout)
          this.off('data', handler)
          resolve(data.data)
        }
      }
      
      this.on('data', handler)
    })
  }

  async loadProject(projectId) {
    await this.sendMessage('load_project', { projectId: projectId })
  }

  async saveProject(project) {
    await this.sendMessage('save_project', { project: project })
  }

  async play() {
    await this.sendMessage('play')
  }

  async stop() {
    await this.sendMessage('stop')
  }

  async setBPM(bpm) {
    await this.sendMessage('set_bpm', { bpm: bpm })
  }

  async setChannelVolume(channelId, volume) {
    await this.sendMessage('set_channel_volume', {
      channelId: channelId,
      volume: volume
    })
  }

  async setChannelPan(channelId, pan) {
    await this.sendMessage('set_channel_pan', {
      channelId: channelId,
      pan: pan
    })
  }

  async setChannelPitch(channelId, pitch) {
    await this.sendMessage('set_channel_pitch', {
      channelId: channelId,
      pitch: pitch
    })
  }

  async setChannelSample(channelId, sampleId) {
    await this.sendMessage('set_channel_sample', {
      channelId: channelId,
      sampleId: sampleId
    })
  }

  async setPattern(patternId, steps) {
    await this.sendMessage('set_pattern', {
      patternId: patternId,
      steps: steps
    })
  }

  async loadPattern(patternId) {
    await this.sendMessage('load_pattern', { patternId: patternId })
  }

  async savePattern(pattern) {
    await this.sendMessage('save_pattern', { pattern: pattern })
  }

  async uploadSample(sampleId, sampleData) {
    // Split large samples into chunks
    const chunkSize = 1024
    const chunks = []
    
    for (let i = 0; i < sampleData.length; i += chunkSize) {
      chunks.push(sampleData.slice(i, i + chunkSize))
    }
    
    // Send sample header
    await this.sendMessage('upload_sample_start', {
      sampleId: sampleId,
      totalChunks: chunks.length,
      totalSize: sampleData.length
    })
    
    // Send chunks
    for (let i = 0; i < chunks.length; i++) {
      await this.sendMessage('upload_sample_chunk', {
        sampleId: sampleId,
        chunkIndex: i,
        chunkData: chunks[i],
        isLast: i === chunks.length - 1
      })
      
      // Small delay between chunks to prevent buffer overflow
      await new Promise(resolve => setTimeout(resolve, 10))
    }
  }

  async downloadSample(sampleId) {
    await this.sendMessage('download_sample', { sampleId: sampleId })
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout waiting for sample download'))
      }, 30000)
      
      let sampleData = []
      let totalChunks = 0
      let receivedChunks = 0
      
      const handler = (data) => {
        if (data.type === 'sample_chunk') {
          if (data.data.sampleId === sampleId) {
            sampleData[data.data.chunkIndex] = data.data.chunkData
            receivedChunks++
            
            if (data.data.isLast) {
              clearTimeout(timeout)
              this.off('data', handler)
              
              // Combine chunks
              const combined = new Uint8Array(data.data.totalSize)
              let offset = 0
              for (let i = 0; i < sampleData.length; i++) {
                combined.set(sampleData[i], offset)
                offset += sampleData[i].length
              }
              
              resolve(combined)
            }
          }
        }
      }
      
      this.on('data', handler)
    })
  }

  // Event system
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback)
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in event listener:', error)
        }
      })
    }
  }

  // Utility methods
  isDeviceConnected() {
    return this.isConnected && this.port && this.port.readable && this.port.writable
  }

  getPortInfo() {
    if (this.port) {
      return this.port.getInfo()
    }
    return null
  }

  // Error handling
  async handleError(error) {
    console.error('Communication error:', error)
    this.emit('error', error)
    
    // Attempt to reconnect
    if (this.isConnected) {
      try {
        await this.disconnect()
        setTimeout(() => this.connect(), 1000)
      } catch (reconnectError) {
        console.error('Failed to reconnect:', reconnectError)
      }
    }
  }
}

export { CommunicationManager }