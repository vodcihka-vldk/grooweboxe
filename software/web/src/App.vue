<template>
  <div id="app">
    <!-- Navigation Header -->
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">GrooveBoxe Web</h1>
        <div class="header-controls">
          <div class="connection-status" :class="{ connected: isConnected }">
            {{ isConnected ? 'Connected' : 'Disconnected' }}
          </div>
          <div class="bpm-control">
            <label for="bpm-input">BPM:</label>
            <input 
              id="bpm-input"
              type="number" 
              :value="bpm" 
              @input="updateBPM"
              min="40" 
              max="200"
              class="bpm-input"
            />
          </div>
          <button 
            class="play-btn" 
            :class="{ playing: isPlaying }"
            @click="togglePlay"
          >
            {{ isPlaying ? 'Stop' : 'Play' }}
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="app-main">
      <router-view></router-view>
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="footer-content">
        <span class="version">v1.0.0</span>
        <div class="footer-links">
          <router-link to="/browser">File Browser</router-link>
          <router-link to="/audio-params">Audio Params</router-link>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  computed: {
    isPlaying() {
      return this.$store.state.isPlaying
    },
    bpm() {
      return this.$store.state.bpm
    },
    isConnected() {
      return this.$store.state.isConnected
    }
  },
  methods: {
    togglePlay() {
      this.$store.dispatch('togglePlay')
    },
    
    updateBPM(event) {
      const bpm = parseInt(event.target.value)
      if (bpm >= 40 && bpm <= 200) {
        this.$store.commit('SET_BPM', bpm)
      }
    }
  }
}
</script>

<style>
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --bg-color: #1a1a1a;
  --surface-color: #2d2d2d;
  --text-color: #ffffff;
  --muted-color: #888888;
  --border-color: #444444;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: var(--bg-color);
  color: var(--text-color);
  height: 100vh;
  display: flex;
  flex-direction: column;
}

#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* Header Styles */
.app-header {
  background-color: var(--surface-color);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.app-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.connection-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: var(--danger-color);
  color: white;
  transition: background-color 0.3s ease;
}

.connection-status.connected {
  background-color: var(--success-color);
}

.bpm-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bpm-input {
  width: 80px;
  padding: 0.25rem 0.5rem;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  color: var(--text-color);
  border-radius: 4px;
  font-size: 0.875rem;
}

.bpm-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.play-btn {
  padding: 0.5rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.play-btn:hover {
  background-color: #0056b3;
  transform: translateY(-1px);
}

.play-btn.playing {
  background-color: var(--danger-color);
}

.play-btn.playing:hover {
  background-color: #c82333;
}

/* Main Content */
.app-main {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

/* Footer */
.app-footer {
  background-color: var(--surface-color);
  border-top: 1px solid var(--border-color);
  padding: 1rem;
  margin-top: auto;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  font-size: 0.875rem;
  color: var(--muted-color);
}

.footer-links {
  display: flex;
  gap: 1rem;
}

.footer-links a {
  color: var(--muted-color);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: var(--text-color);
}

/* Router Link Styles */
.router-link-active {
  color: var(--primary-color);
  font-weight: 500;
}

/* Utility Classes */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.card {
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  background-color: transparent;
  color: var(--text-color);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.btn:hover {
  background-color: var(--bg-color);
  border-color: var(--primary-color);
}

.btn-primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: var(--secondary-color);
  border-color: var(--secondary-color);
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.text-muted {
  color: var(--muted-color);
}

.text-primary {
  color: var(--primary-color);
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .header-controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .app-main {
    padding: 1rem;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>