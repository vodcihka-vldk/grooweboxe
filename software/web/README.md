# GrooveBoxe Web Interface

This directory contains the web-based interface for the GrooveBoxe hardware groovebox sampler. The web interface provides a browser-based alternative to the hardware controls, allowing for project management, sample editing, and pattern creation.

## Project Structure

```
software/web/
├── package.json              # Project dependencies and scripts
├── vite.config.js            # Vite build configuration
├── index.html                # Main HTML file
├── src/
│   ├── main.js               # Application entry point
│   ├── App.vue               # Root Vue component
│   ├── router/
│   │   └── index.js          # Vue Router configuration
│   ├── store/
│   │   └── index.js          # Vuex store configuration
│   ├── components/           # Vue components
│   │   ├── Home.vue          # Home/dashboard component
│   │   ├── Sequencer.vue     # Pattern sequencer interface
│   │   ├── Browser.vue       # File browser interface
│   │   ├── AudioParams.vue   # Audio parameter controls
│   │   └── ChannelParams.vue # Individual channel parameters
│   └── utils/                # Utility classes
│       ├── audioEngine.js    # Web Audio API wrapper
│       ├── storageManager.js # IndexedDB storage management
│       └── communicationManager.js # Web Serial API communication
└── public/                   # Static assets
    ├── icons/                # Application icons
    └── samples/              # Default sample files
```

## Features

### Audio Engine
- **Web Audio API Integration**: Full-featured audio engine using Tone.js
- **8-Channel Processing**: Independent channel processing with effects
- **Real-time Effects**: Compressor, delay, reverb, and bitcrusher effects
- **Sample Playback**: WAV and AIFF sample support with pitch and filter controls

### Project Management
- **IndexedDB Storage**: Persistent local storage for projects and samples
- **Project Export/Import**: JSON-based project format for sharing
- **Sample Management**: Upload, organize, and manage audio samples
- **Pattern Storage**: Save and load pattern sequences

### Hardware Communication
- **Web Serial API**: Direct communication with ESP32 hardware
- **Real-time Sync**: Synchronize web interface with hardware device
- **Firmware Updates**: Upload new firmware to the device
- **Device Monitoring**: Monitor device status and performance

### User Interface
- **Vue.js Framework**: Modern, reactive user interface
- **Responsive Design**: Works on desktop and mobile devices
- **Drag & Drop**: Intuitive sample and file management
- **Real-time Visualization**: Audio meters and pattern visualization

## Installation

### Prerequisites

1. **Node.js**: Version 16 or higher
2. **Modern Browser**: Chrome, Firefox, Safari, or Edge with Web Serial API support
3. **ESP32 Device**: Connected via USB for hardware communication

### Setup

1. Install dependencies:
   ```bash
   cd software/web
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open browser to `http://localhost:3000`

## Usage

### Basic Operation

1. **Connect to Device**: Click "Connect" to establish communication with the ESP32
2. **Create Project**: Start a new project or load an existing one
3. **Upload Samples**: Drag and drop audio files to upload to the device
4. **Create Patterns**: Use the sequencer to create step-based patterns
5. **Adjust Parameters**: Modify channel and effect parameters
6. **Play**: Start playback and hear your creation

### Hardware Communication

The web interface communicates with the ESP32 hardware via Web Serial API:

- **Automatic Detection**: Detects common USB-to-Serial converters (CP2102, CH340)
- **Baud Rate**: 115200 baud for reliable communication
- **Message Protocol**: JSON-based message passing
- **Error Handling**: Automatic reconnection and error recovery

### Project Format

Projects are stored in a JSON format that includes:

```json
{
  "id": "project_id",
  "name": "Project Name",
  "channels": [...],
  "patterns": [...],
  "samples": [...]
}
```

## Development

### Adding New Components

1. Create Vue component in `src/components/`
2. Add route in `src/router/index.js`
3. Update navigation in `src/App.vue`
4. Add styles using CSS-in-JS or scoped styles

### Audio Processing

The audio engine is built on Tone.js:

```javascript
import * as Tone from 'tone'

// Create audio context
const context = new Tone.Context()

// Create effects chain
const compressor = new Tone.Compressor()
const delay = new Tone.FeedbackDelay()
const reverb = new Tone.Reverb()

// Connect chain
compressor.connect(delay)
delay.connect(reverb)
reverb.connect(context.destination)
```

### Storage Management

Use the StorageManager for persistent data:

```javascript
import { StorageManager } from './utils/storageManager'

const storage = new StorageManager()
await storage.init()

// Save project
await storage.saveProject(project)

// Load project
const project = await storage.loadProject(projectId)
```

### Hardware Communication

Use the CommunicationManager for device interaction:

```javascript
import { CommunicationManager } from './utils/communicationManager'

const comm = new CommunicationManager()
await comm.connect()

// Send message
await comm.sendMessage('play')

// Listen for data
comm.on('data', (message) => {
  console.log('Received:', message)
})
```

## Browser Support

### Required Features

- **Web Audio API**: For audio processing
- **Web Serial API**: For hardware communication
- **IndexedDB**: For local storage
- **ES6+**: Modern JavaScript features

### Supported Browsers

- **Chrome**: Version 89+ (recommended)
- **Edge**: Version 89+
- **Firefox**: Version 98+ (limited Web Serial support)
- **Safari**: Version 14.1+ (limited Web Serial support)

### Fallbacks

For browsers without Web Serial API:
- Hardware communication is disabled
- Local storage and audio processing still work
- Mock device data for testing

## Performance

### Audio Performance

- **Buffer Size**: 1024 samples for low latency
- **Sample Rate**: 44.1kHz for high quality
- **Memory Management**: Automatic cleanup of unused samples
- **CPU Optimization**: Efficient effect processing

### Web Interface Performance

- **Vite Build**: Fast development and production builds
- **Code Splitting**: Lazy loading of components
- **Caching**: Aggressive caching of static assets
- **Optimization**: Tree shaking and minification

## Security

### Web Serial API

- **User Permission**: Requires explicit user permission
- **Secure Context**: Only works over HTTPS or localhost
- **Device Filtering**: Only connects to known device IDs

### File Handling

- **File Type Validation**: Only accepts audio files
- **Size Limits**: Maximum 10MB per sample
- **Sanitization**: File names are sanitized

## Troubleshooting

### Common Issues

1. **Web Serial Not Available**
   - Use Chrome or Edge browser
   - Enable "Experimental Web Platform features" flag
   - Check USB connection

2. **Audio Not Working**
   - Check browser permissions for microphone/audio
   - Ensure no other audio applications are using the audio device
   - Try refreshing the page

3. **Connection Problems**
   - Check USB cable and connections
   - Try different USB port
   - Restart the ESP32 device

### Debug Mode

Enable debug logging:

```javascript
// In main.js
localStorage.debug = 'grooveboxe:*'
```

### Error Reporting

Errors are logged to browser console and can be:
- Copied and shared for support
- Saved to local storage for later analysis
- Reported via GitHub issues

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes following coding standards
4. Add tests for new functionality
5. Update documentation
6. Submit pull request

## License

This web interface is licensed under the MIT License. See the LICENSE file for details.

## Support

For support and questions:

- Create an issue in the project repository
- Check the browser console for error messages
- Review the hardware documentation
- Consult the Vue.js and Tone.js documentation