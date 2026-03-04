/**
 * AudioEngine - Web Audio API wrapper for GrooveBoxe
 * Provides audio processing, effects, and channel management
 */

class AudioEngine {
  constructor() {
    this.context = null
    this.masterGain = null
    this.channels = []
    this.sequencer = null
    this.isPlaying = false
    this.bpm = 120
    this.transport = null
    
    // Effects chain
    this.compressor = null
    this.delay = null
    this.reverb = null
    this.bitcrusher = null
    
    // Timing
    this.currentStep = 0
    this.patternLength = 64
    this.stepDuration = 0
    
    // Audio buffers
    this.sampleBuffers = new Map()
  }

  async init() {
    // Initialize Web Audio Context
    this.context = new (window.AudioEngine.getContext || AudioContext)()
    
    // Create master output
    this.masterGain = this.context.createGain()
    this.masterGain.gain.value = 0.8
    this.masterGain.connect(this.context.destination)
    
    // Initialize effects
    await this.initEffects()
    
    // Initialize channels
    this.initChannels()
    
    // Initialize transport
    this.initTransport()
    
    console.log('Audio Engine initialized')
  }

  async initEffects() {
    // Compressor
    this.compressor = new window.AudioEngine.Compressor({
      threshold: -24,
      knee: 30,
      ratio: 12,
      attack: 0.003,
      release: 0.25
    })
    
    // Delay
    this.delay = new window.AudioEngine.FeedbackDelay({
      delayTime: 0.25,
      feedback: 0.5,
      wet: 0.3
    })
    
    // Reverb
    this.reverb = new window.AudioEngine.Reverb({
      decay: 2,
      wet: 0.3
    })
    
    // Bitcrusher
    this.bitcrusher = new window.AudioEngine.BitCrusher({
      bits: 8,
      wet: 0.5
    })
    
    // Connect effects chain
    this.compressor.connect(this.delay)
    this.delay.connect(this.reverb)
    this.reverb.connect(this.bitcrusher)
    this.bitcrusher.connect(this.masterGain)
  }

  initChannels() {
    for (let i = 0; i < 8; i++) {
      const channel = {
        id: i,
        name: `Channel ${i + 1}`,
        sample: null,
        gain: this.context.createGain(),
        pan: this.context.createStereoPanner(),
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
        params: {
          volume: 0.8,
          pan: 0,
          pitch: 1.0,
          filterCutoff: 20000,
          filterResonance: 1.0
        }
      }
      
      // Connect channel to master
      channel.gain.connect(channel.pan)
      channel.pan.connect(this.compressor)
      
      this.channels.push(channel)
    }
  }

  initTransport() {
    this.transport = window.AudioEngine.Transport
    this.transport.bpm.value = this.bpm
    this.transport.timeSignature = [4, 4]
    
    // Create sequencer loop
    this.sequencer = new window.AudioEngine.Loop((time) => {
      this.triggerStep(time)
    }, this.stepDuration)
  }

  setBPM(bpm) {
    this.bpm = bpm
    if (this.transport) {
      this.transport.bpm.value = bpm
      this.updateStepDuration()
    }
  }

  updateStepDuration() {
    // Calculate step duration based on BPM
    const beatsPerSecond = this.bpm / 60
    const beatDuration = 1 / beatsPerSecond
    this.stepDuration = beatDuration / 4 // 16th notes
  }

  async loadSample(channelId, file) {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer)
      
      this.channels[channelId].sample = audioBuffer
      this.sampleBuffers.set(channelId, audioBuffer)
      
      console.log(`Loaded sample for channel ${channelId}`)
    } catch (error) {
      console.error('Failed to load sample:', error)
    }
  }

  playSample(channelId, time = 0) {
    const channel = this.channels[channelId]
    if (!channel.sample) return

    const source = this.context.createBufferSource()
    source.buffer = channel.sample
    source.connect(channel.gain)
    
    // Apply pitch
    source.playbackRate.value = channel.params.pitch
    
    // Apply filter
    const filter = this.context.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = channel.params.filterCutoff
    filter.Q.value = channel.params.filterResonance
    source.connect(filter)
    filter.connect(channel.gain)
    
    // Apply effects
    this.applyChannelEffects(channel, filter)
    
    source.start(time)
    
    // Schedule release if sample has a defined duration
    if (channel.sample.duration < 2) {
      source.stop(time + channel.sample.duration)
    }
  }

  applyChannelEffects(channel, inputNode) {
    // Create channel-specific effects
    const channelCompressor = new window.AudioEngine.Compressor(channel.effects.compressor)
    const channelDelay = new window.AudioEngine.FeedbackDelay(channel.effects.delay)
    const channelReverb = new window.AudioEngine.Reverb(channel.effects.reverb)
    const channelBitcrusher = new window.AudioEngine.BitCrusher(channel.effects.bitcrusher)
    
    // Connect effects chain
    inputNode.connect(channelCompressor)
    channelCompressor.connect(channelDelay)
    channelDelay.connect(channelReverb)
    channelReverb.connect(channelBitcrusher)
    channelBitcrusher.connect(channel.gain)
  }

  triggerStep(time) {
    // This would be called by the sequencer to trigger active steps
    // Implementation depends on the current pattern and step
    
    if (this.isPlaying) {
      // Trigger active channels for current step
      this.currentStep = (this.currentStep + 1) % this.patternLength
      
      // Update UI or trigger samples based on pattern data
      this.$emit('stepTriggered', {
        step: this.currentStep,
        time: time
      })
    }
  }

  start() {
    if (!this.context) return
    
    this.context.resume()
    this.transport.start()
    this.sequencer.start()
    this.isPlaying = true
  }

  stop() {
    if (!this.context) return
    
    this.transport.stop()
    this.sequencer.stop()
    this.isPlaying = false
    this.currentStep = 0
  }

  togglePlay() {
    if (this.isPlaying) {
      this.stop()
    } else {
      this.start()
    }
  }

  setChannelVolume(channelId, volume) {
    const channel = this.channels[channelId]
    if (channel) {
      channel.params.volume = Math.max(0, Math.min(1, volume))
      channel.gain.gain.value = channel.params.volume
    }
  }

  setChannelPan(channelId, pan) {
    const channel = this.channels[channelId]
    if (channel) {
      channel.params.pan = Math.max(-1, Math.min(1, pan))
      channel.pan.pan.value = channel.params.pan
    }
  }

  setChannelPitch(channelId, pitch) {
    const channel = this.channels[channelId]
    if (channel) {
      channel.params.pitch = Math.max(0.5, Math.min(2.0, pitch))
    }
  }

  setChannelFilter(channelId, cutoff, resonance) {
    const channel = this.channels[channelId]
    if (channel) {
      channel.params.filterCutoff = Math.max(20, Math.min(20000, cutoff))
      channel.params.filterResonance = Math.max(0.1, Math.min(10, resonance))
    }
  }

  setMasterVolume(volume) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume))
    }
  }

  getChannel(channelId) {
    return this.channels[channelId] || null
  }

  getAllChannels() {
    return this.channels
  }

  dispose() {
    if (this.transport) {
      this.transport.stop()
    }
    if (this.sequencer) {
      this.sequencer.dispose()
    }
    if (this.context) {
      this.context.close()
    }
  }
}

export { AudioEngine }