import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createStore } from 'vuex'
import App from './App.vue'
import Home from './components/Home.vue'
import Sequencer from './components/Sequencer.vue'
import Browser from './components/Browser.vue'
import AudioParams from './components/AudioParams.vue'
import ChannelParams from './components/ChannelParams.vue'

// Import Tone.js
import * as Tone from 'tone'

// Import MIDI handling
import { Midi } from 'midi-file'

// Import Web Audio API utilities
import { AudioEngine } from './utils/audioEngine'
import { StorageManager } from './utils/storageManager'
import { CommunicationManager } from './utils/communicationManager'

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/sequencer', component: Sequencer },
    { path: '/browser', component: Browser },
    { path: '/audio-params', component: AudioParams },
    { path: '/channel-params/:channel', component: ChannelParams }
  ]
})

// Create store
const store = createStore({
  state: {
    // Audio engine state
    audioEngine: null,
    isPlaying: false,
    bpm: 120,
    currentPattern: 0,
    
    // Project state
    project: {
      name: 'New Project',
      patterns: [],
      samples: [],
      channels: []
    },
    
    // Communication state
    isConnected: false,
    deviceInfo: null,
    
    // UI state
    currentScreen: 'home',
    selectedChannel: 0,
    selectedPattern: 0
  },
  
  mutations: {
    SET_AUDIO_ENGINE(state, engine) {
      state.audioEngine = engine
    },
    
    SET_PLAYING(state, isPlaying) {
      state.isPlaying = isPlaying
    },
    
    SET_BPM(state, bpm) {
      state.bpm = bpm
      if (state.audioEngine) {
        state.audioEngine.setBPM(bpm)
      }
    },
    
    SET_PROJECT(state, project) {
      state.project = project
    },
    
    SET_CONNECTION(state, isConnected) {
      state.isConnected = isConnected
    },
    
    SET_DEVICE_INFO(state, info) {
      state.deviceInfo = info
    },
    
    SET_SCREEN(state, screen) {
      state.currentScreen = screen
    },
    
    SET_CHANNEL(state, channel) {
      state.selectedChannel = channel
    },
    
    SET_PATTERN(state, pattern) {
      state.selectedPattern = pattern
    }
  },
  
  actions: {
    async initAudioEngine({ commit }) {
      try {
        const engine = new AudioEngine()
        await engine.init()
        commit('SET_AUDIO_ENGINE', engine)
      } catch (error) {
        console.error('Failed to initialize audio engine:', error)
      }
    },
    
    async connectToDevice({ commit }) {
      try {
        const comm = new CommunicationManager()
        await comm.connect()
        const info = await comm.getDeviceInfo()
        commit('SET_CONNECTION', true)
        commit('SET_DEVICE_INFO', info)
      } catch (error) {
        console.error('Failed to connect to device:', error)
      }
    },
    
    async loadProject({ commit }, projectId) {
      try {
        const storage = new StorageManager()
        const project = await storage.loadProject(projectId)
        commit('SET_PROJECT', project)
      } catch (error) {
        console.error('Failed to load project:', error)
      }
    },
    
    async saveProject({ state }) {
      try {
        const storage = new StorageManager()
        await storage.saveProject(state.project)
      } catch (error) {
        console.error('Failed to save project:', error)
      }
    }
  },
  
  getters: {
    currentChannel: (state) => {
      return state.project.channels[state.selectedChannel] || {}
    },
    
    currentPatternData: (state) => {
      return state.project.patterns[state.selectedPattern] || {}
    }
  }
})

// Create app
const app = createApp(App)
app.use(router)
app.use(store)
app.mount('#app')

// Initialize global utilities
window.AudioEngine = Tone
window.Midi = Midi