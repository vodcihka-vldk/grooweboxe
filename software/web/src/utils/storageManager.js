/**
 * StorageManager - File system and project management for GrooveBoxe Web
 * Handles project loading/saving, sample management, and file operations
 */

class StorageManager {
  constructor() {
    this.projects = new Map()
    this.samples = new Map()
    this.currentProject = null
  }

  async init() {
    // Initialize IndexedDB for persistent storage
    if (!('indexedDB' in window)) {
      throw new Error('IndexedDB not supported')
    }
    
    await this.initDatabase()
    await this.loadProjects()
  }

  async initDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('GrooveBoxe', 1)
      
      request.onerror = () => reject(request.error)
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result
        
        // Create object stores
        if (!db.objectStoreNames.contains('projects')) {
          const projectsStore = db.createObjectStore('projects', { keyPath: 'id' })
          projectsStore.createIndex('name', 'name', { unique: false })
        }
        
        if (!db.objectStoreNames.contains('samples')) {
          const samplesStore = db.createObjectStore('samples', { keyPath: 'id' })
          samplesStore.createIndex('name', 'name', { unique: false })
          samplesStore.createIndex('projectId', 'projectId', { unique: false })
        }
        
        if (!db.objectStoreNames.contains('patterns')) {
          const patternsStore = db.createObjectStore('patterns', { keyPath: 'id' })
          patternsStore.createIndex('projectId', 'projectId', { unique: false })
        }
      }
      
      request.onsuccess = () => resolve(request.result)
    })
  }

  async loadProjects() {
    const db = await this.getDatabase()
    const transaction = db.transaction(['projects'], 'readonly')
    const store = transaction.objectStore('projects')
    
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => {
        this.projects.clear()
        request.result.forEach(project => {
          this.projects.set(project.id, project)
        })
        resolve(request.result)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async saveProject(project) {
    const db = await this.getDatabase()
    const transaction = db.transaction(['projects'], 'readwrite')
    const store = transaction.objectStore('projects')
    
    return new Promise((resolve, reject) => {
      const request = store.put(project)
      request.onsuccess = () => {
        this.projects.set(project.id, project)
        resolve(project)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async loadProject(projectId) {
    const db = await this.getDatabase()
    const transaction = db.transaction(['projects'], 'readonly')
    const store = transaction.objectStore('projects')
    
    return new Promise((resolve, reject) => {
      const request = store.get(projectId)
      request.onsuccess = () => {
        const project = request.result
        if (project) {
          this.currentProject = project
          resolve(project)
        } else {
          reject(new Error('Project not found'))
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async deleteProject(projectId) {
    const db = await this.getDatabase()
    const transaction = db.transaction(['projects'], 'readwrite')
    const store = transaction.objectStore('projects')
    
    return new Promise((resolve, reject) => {
      const request = store.delete(projectId)
      request.onsuccess = () => {
        this.projects.delete(projectId)
        resolve()
      }
      request.onerror = () => reject(request.error)
    })
  }

  async listProjects() {
    const db = await this.getDatabase()
    const transaction = db.transaction(['projects'], 'readonly')
    const store = transaction.objectStore('projects')
    
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async saveSample(projectId, file) {
    const arrayBuffer = await file.arrayBuffer()
    const sample = {
      id: this.generateId(),
      projectId: projectId,
      name: file.name,
      type: file.type,
      size: file.size,
      data: arrayBuffer,
      createdAt: new Date().toISOString()
    }
    
    const db = await this.getDatabase()
    const transaction = db.transaction(['samples'], 'readwrite')
    const store = transaction.objectStore('samples')
    
    return new Promise((resolve, reject) => {
      const request = store.put(sample)
      request.onsuccess = () => {
        this.samples.set(sample.id, sample)
        resolve(sample)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async loadSample(sampleId) {
    const db = await this.getDatabase()
    const transaction = db.transaction(['samples'], 'readonly')
    const store = transaction.objectStore('samples')
    
    return new Promise((resolve, reject) => {
      const request = store.get(sampleId)
      request.onsuccess = () => {
        const sample = request.result
        if (sample) {
          resolve(sample)
        } else {
          reject(new Error('Sample not found'))
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async listSamples(projectId) {
    const db = await this.getDatabase()
    const transaction = db.transaction(['samples'], 'readonly')
    const store = transaction.objectStore('samples')
    const index = store.index('projectId')
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(projectId)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async deleteSample(sampleId) {
    const db = await this.getDatabase()
    const transaction = db.transaction(['samples'], 'readwrite')
    const store = transaction.objectStore('samples')
    
    return new Promise((resolve, reject) => {
      const request = store.delete(sampleId)
      request.onsuccess = () => {
        this.samples.delete(sampleId)
        resolve()
      }
      request.onerror = () => reject(request.error)
    })
  }

  async savePattern(projectId, pattern) {
    const db = await this.getDatabase()
    const transaction = db.transaction(['patterns'], 'readwrite')
    const store = transaction.objectStore('patterns')
    
    const patternData = {
      id: pattern.id || this.generateId(),
      projectId: projectId,
      name: pattern.name || `Pattern ${Date.now()}`,
      steps: pattern.steps || this.createEmptyPattern(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    return new Promise((resolve, reject) => {
      const request = store.put(patternData)
      request.onsuccess = () => resolve(patternData)
      request.onerror = () => reject(request.error)
    })
  }

  async loadPattern(patternId) {
    const db = await this.getDatabase()
    const transaction = db.transaction(['patterns'], 'readonly')
    const store = transaction.objectStore('patterns')
    
    return new Promise((resolve, reject) => {
      const request = store.get(patternId)
      request.onsuccess = () => {
        const pattern = request.result
        if (pattern) {
          resolve(pattern)
        } else {
          reject(new Error('Pattern not found'))
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async listPatterns(projectId) {
    const db = await this.getDatabase()
    const transaction = db.transaction(['patterns'], 'readonly')
    const store = transaction.objectStore('patterns')
    const index = store.index('projectId')
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(projectId)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async deletePattern(patternId) {
    const db = await this.getDatabase()
    const transaction = db.transaction(['patterns'], 'readwrite')
    const store = transaction.objectStore('patterns')
    
    return new Promise((resolve, reject) => {
      const request = store.delete(patternId)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  createEmptyPattern() {
    const steps = []
    for (let i = 0; i < 64; i++) {
      steps.push({
        step: i,
        channels: [false, false, false, false, false, false, false, false],
        params: {
          volume: [0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8],
          pan: [0, 0, 0, 0, 0, 0, 0, 0],
          pitch: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
        }
      })
    }
    return steps
  }

  createNewProject(name = 'New Project') {
    const project = {
      id: this.generateId(),
      name: name,
      description: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      channels: this.createDefaultChannels(),
      patterns: [],
      samples: []
    }
    
    return project
  }

  createDefaultChannels() {
    const channels = []
    for (let i = 0; i < 8; i++) {
      channels.push({
        id: i,
        name: `Channel ${i + 1}`,
        sampleId: null,
        volume: 0.8,
        pan: 0,
        pitch: 1.0,
        effects: {
          compressor: {
            threshold: -24,
            ratio: 4,
            attack: 0.01,
            release: 0.1
          },
          delay: {
            time: 0.25,
            feedback: 0.3,
            wet: 0.2
          },
          reverb: {
            decay: 1.5,
            wet: 0.2
          },
          bitcrusher: {
            bits: 16,
            wet: 0
          }
        },
        filter: {
          cutoff: 20000,
          resonance: 1.0
        }
      })
    }
    return channels
  }

  async exportProject(projectId) {
    const project = await this.loadProject(projectId)
    const patterns = await this.listPatterns(projectId)
    const samples = await this.listSamples(projectId)
    
    // Convert sample data to base64 for JSON export
    const exportData = {
      ...project,
      patterns: patterns,
      samples: samples.map(sample => ({
        ...sample,
        data: this.arrayBufferToBase64(sample.data)
      }))
    }
    
    return JSON.stringify(exportData, null, 2)
  }

  async importProject(jsonData) {
    const importData = JSON.parse(jsonData)
    
    // Save project
    const project = await this.saveProject(importData)
    
    // Save patterns
    for (const pattern of importData.patterns) {
      await this.savePattern(project.id, pattern)
    }
    
    // Save samples
    for (const sample of importData.samples) {
      const sampleData = {
        ...sample,
        data: this.base64ToArrayBuffer(sample.data)
      }
      
      const db = await this.getDatabase()
      const transaction = db.transaction(['samples'], 'readwrite')
      const store = transaction.objectStore('samples')
      
      await new Promise((resolve, reject) => {
        const request = store.put(sampleData)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    }
    
    return project
  }

  arrayBufferToBase64(buffer) {
    let binary = ''
    const bytes = new Uint8Array(buffer)
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  base64ToArrayBuffer(base64) {
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
  }

  generateId() {
    return 'gbx_' + Math.random().toString(36).substr(2, 9)
  }

  async getDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('GrooveBoxe', 1)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
}

export { StorageManager }