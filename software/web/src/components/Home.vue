<template>
  <div class="home">
    <div class="hero-section">
      <div class="hero-content">
        <h1>GrooveBoxe Web Interface</h1>
        <p class="hero-subtitle">
          Professional groovebox sampler with 8 channels, real-time effects, 
          and pattern-based sequencing
        </p>
        <div class="hero-actions">
          <router-link to="/sequencer" class="btn btn-primary btn-large">
            Open Sequencer
          </router-link>
          <router-link to="/browser" class="btn btn-secondary btn-large">
            Browse Files
          </router-link>
        </div>
      </div>
    </div>

    <div class="features-section">
      <div class="container">
        <h2>Key Features</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🎵</div>
            <h3>8-Channel Audio Engine</h3>
            <p>Independent channels with individual effects processing, 
               sample playback, and parameter control</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🎛️</div>
            <h3>Real-time Effects</h3>
            <p>Compressor, delay, reverb, and bitcrusher effects 
               with real-time parameter control</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🥁</div>
            <h3>Pattern Sequencer</h3>
            <p>8×64 step patterns with parameter locks, 
               pattern chaining, and real-time editing</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">💾</div>
            <h3>File Management</h3>
            <p>MicroSD card support with project management, 
               sample organization, and pattern storage</p>
          </div>
        </div>
      </div>
    </div>

    <div class="specs-section">
      <div class="container">
        <h2>Technical Specifications</h2>
        <div class="specs-grid">
          <div class="spec-group">
            <h3>Audio</h3>
            <ul>
              <li>Sample Rate: 44.1kHz</li>
              <li>Bit Depth: 16-bit</li>
              <li>Channels: 8 independent</li>
              <li>Effects: 4 real-time processors</li>
              <li>Sample Format: WAV, AIFF</li>
            </ul>
          </div>
          
          <div class="spec-group">
            <h3>Sequencing</h3>
            <ul>
              <li>Steps per Pattern: 64</li>
              <li>Patterns per Project: 8</li>
              <li>Pattern Chaining: Yes</li>
              <li>BPM Range: 40-200</li>
              <li>Parameter Locks: Per step</li>
            </ul>
          </div>
          
          <div class="spec-group">
            <h3>Storage</h3>
            <ul>
              <li>MicroSD Card Support</li>
              <li>File System: FAT16</li>
              <li>Max Card Size: 2GB</li>
              <li>Project Format: .gbproj</li>
              <li>Pattern Format: .gbpat</li>
            </ul>
          </div>
          
          <div class="spec-group">
            <h3>Connectivity</h3>
            <ul>
              <li>USB MIDI: Input/Output</li>
              <li>Audio I/O: 1/4" TRS</li>
              <li>Power: 12V DC</li>
              <li>Display: OLED/TFT</li>
              <li>Controls: Encoders + Buttons</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <div class="container">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <button class="btn btn-primary" @click="createNewProject">
            New Project
          </button>
          <button class="btn btn-secondary" @click="loadProject">
            Load Project
          </button>
          <button class="btn" @click="exportProject">
            Export Project
          </button>
          <button class="btn" @click="importProject">
            Import Project
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  methods: {
    createNewProject() {
      this.$store.dispatch('createNewProject')
      this.$router.push('/sequencer')
    },
    
    async loadProject() {
      try {
        const storage = new (await import('../utils/storageManager')).StorageManager()
        const projects = await storage.listProjects()
        
        if (projects.length > 0) {
          const project = projects[0] // For demo, load first project
          await this.$store.dispatch('loadProject', project.id)
          this.$router.push('/sequencer')
        } else {
          alert('No projects found. Create a new project first.')
        }
      } catch (error) {
        console.error('Failed to load project:', error)
        alert('Failed to load project.')
      }
    },
    
    exportProject() {
      const project = this.$store.state.project
      const blob = new Blob([JSON.stringify(project, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${project.name}.gbproj`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
    
    importProject() {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.gbproj,application/json'
      input.onchange = async (e) => {
        const file = e.target.files[0]
        if (file) {
          try {
            const text = await file.text()
            const project = JSON.parse(text)
            this.$store.commit('SET_PROJECT', project)
            alert('Project imported successfully!')
          } catch (error) {
            console.error('Failed to import project:', error)
            alert('Failed to import project. Invalid file format.')
          }
        }
      }
      input.click()
    }
  }
}
</script>

<style scoped>
.home {
  min-height: 100%;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  padding: 4rem 0;
  text-align: center;
  border-bottom: 1px solid var(--border-color);
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

.hero-content h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--primary-color), #6610f2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--muted-color);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
}

/* Features Section */
.features-section {
  padding: 4rem 0;
  background-color: var(--bg-color);
}

.features-section h2 {
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2.5rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
}

.feature-card h3 {
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.feature-card p {
  color: var(--muted-color);
  line-height: 1.6;
}

/* Specs Section */
.specs-section {
  padding: 4rem 0;
  background-color: var(--surface-color);
}

.specs-section h2 {
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2.5rem;
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.spec-group {
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 2rem;
}

.spec-group h3 {
  margin-bottom: 1.5rem;
  color: var(--primary-color);
  font-size: 1.25rem;
}

.spec-group ul {
  list-style: none;
  padding: 0;
}

.spec-group li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
  color: var(--muted-color);
}

.spec-group li:last-child {
  border-bottom: none;
}

/* Quick Actions */
.quick-actions {
  padding: 4rem 0;
  background-color: var(--bg-color);
}

.quick-actions h2 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn-large {
    width: 100%;
    max-width: 300px;
  }
  
  .specs-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>