// EQ profiles per instrument type
export const EQ_PROFILES = {
    kick: [
        { type: 'highpass',  freq: 30,   Q: 0.7,  gain: 0  },
        { type: 'peaking',   freq: 60,   Q: 1.0,  gain: 3  },
        { type: 'peaking',   freq: 3500, Q: 2.0,  gain: 2  },
        { type: 'highshelf', freq: 8000, Q: 0.7,  gain: -2 },
    ],
    snare: [
        { type: 'highpass',  freq: 100,  Q: 0.7,  gain: 0  },
        { type: 'peaking',   freq: 200,  Q: 1.5,  gain: -3 },
        { type: 'peaking',   freq: 1200, Q: 1.2,  gain: 2  },
        { type: 'peaking',   freq: 8000, Q: 0.8,  gain: 3  },
    ],
    hihat: [
        { type: 'highpass',  freq: 3000,  Q: 0.7, gain: 0  },
        { type: 'peaking',   freq: 8000,  Q: 1.0, gain: 2  },
        { type: 'highshelf', freq: 12000, Q: 0.7, gain: 1  },
    ],
    bass: [
        { type: 'highpass', freq: 25,  Q: 0.7,  gain: 0  },
        { type: 'peaking',  freq: 80,  Q: 1.2,  gain: 2  },
        { type: 'peaking',  freq: 250, Q: 1.5,  gain: -2 },
        { type: 'peaking',  freq: 800, Q: 1.0,  gain: 1  },
    ],
    clap: [
        { type: 'highpass',  freq: 200,  Q: 0.7, gain: 0 },
        { type: 'peaking',   freq: 1000, Q: 1.0, gain: 2 },
        { type: 'highshelf', freq: 6000, Q: 0.7, gain: 3 },
    ],
    perc: [
        { type: 'highpass', freq: 80,  Q: 0.7, gain: 0 },
        { type: 'peaking',  freq: 500, Q: 1.2, gain: 2 },
    ],
    loop: [
        { type: 'highpass', freq: 40,   Q: 0.7, gain: 0 },
        { type: 'peaking',  freq: 100,  Q: 1.0, gain: 1 },
        { type: 'peaking',  freq: 3000, Q: 0.8, gain: 1 },
    ],
    crash: [
        { type: 'highpass',  freq: 1000, Q: 0.7, gain: 0 },
        { type: 'highshelf', freq: 8000, Q: 0.7, gain: 2 },
    ],
    fx: [
        { type: 'peaking',   freq: 200,  Q: 1.0, gain: 1 },
        { type: 'highshelf', freq: 6000, Q: 0.7, gain: 2 },
    ],
    other: []
};

// Compressor profiles per instrument type
export const COMP_PROFILES = {
    kick:  { threshold: -18, knee: 6,  ratio: 4, attack: 0.025, release: 0.100 },
    snare: { threshold: -20, knee: 6,  ratio: 5, attack: 0.008, release: 0.120 },
    hihat: { threshold: -24, knee: 3,  ratio: 3, attack: 0.002, release: 0.050 },
    bass:  { threshold: -18, knee: 8,  ratio: 4, attack: 0.020, release: 0.200 },
    clap:  { threshold: -20, knee: 4,  ratio: 6, attack: 0.003, release: 0.100 },
    perc:  { threshold: -22, knee: 6,  ratio: 4, attack: 0.005, release: 0.080 },
    loop:  { threshold: -16, knee: 10, ratio: 3, attack: 0.015, release: 0.150 },
    crash: { threshold: -24, knee: 8,  ratio: 2, attack: 0.030, release: 0.300 },
    fx:    { threshold: -20, knee: 8,  ratio: 2, attack: 0.020, release: 0.200 },
    other: { threshold: -20, knee: 6,  ratio: 3, attack: 0.010, release: 0.150 },
};

export const DEFAULT_SAMPLE_NAMES = [
    'KICK', 'SNARE', 'C_HIHAT', 'O_HIHAT', 'TOM', 'PERC', 'CLAP', 'CRASH'
];

export const LOADABLE_EXTS = ['wav', 'aif', 'mp3', 'ogg'];

export const MENU_STRUCTURE = {
    main: [
        { id: 'mastering', title: 'MASTERING' }
    ],
    mastering: [
        { id: 'lowEq',      title: 'LOW EQ',     paramId: 'lowEq'      },
        { id: 'highEq',     title: 'HIGH EQ',    paramId: 'highEq'     },
        { id: 'compThresh', title: 'COMP THRES', paramId: 'compThresh' },
        { id: 'compRatio',  title: 'COMP RATIO', paramId: 'compRatio'  },
        { id: 'saturation', title: 'SATURATION', paramId: 'saturation' }
    ]
};
