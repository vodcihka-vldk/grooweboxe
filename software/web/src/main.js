import { createApp } from 'vue';
import App from './App.vue';

// Import all styles
import './assets/styles/variables.css';
import './assets/styles/base.css';
import './assets/styles/screen.css';
import './assets/styles/knobs.css';
import './assets/styles/transport.css';
import './assets/styles/sequencer.css';
import './assets/styles/channels.css';
import './assets/styles/master.css';
import './assets/styles/modals.css';

const app = createApp(App);
app.mount('#app');
