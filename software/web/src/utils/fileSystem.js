import { LOADABLE_EXTS } from './constants.js';

export const FILESYSTEM = {
    name: 'USB Drive',
    type: 'dir',
    children: [
        {
            name: 'Drums',
            type: 'dir',
            children: [
                {
                    name: 'Kicks',
                    type: 'dir',
                    children: [
                        { name: 'Kick_Analog_01', type: 'file', ext: 'wav' },
                        { name: 'Kick_Analog_02', type: 'file', ext: 'wav' },
                        { name: 'Kick_808_Deep',  type: 'file', ext: 'wav' },
                        { name: 'Kick_Punchy',    type: 'file', ext: 'aif' },
                        { name: 'Kick_Distorted', type: 'file', ext: 'wav' },
                    ]
                },
                {
                    name: 'Snares',
                    type: 'dir',
                    children: [
                        { name: 'Snare_Crispy',  type: 'file', ext: 'wav' },
                        { name: 'Snare_Acoustic', type: 'file', ext: 'wav' },
                        { name: 'Snare_Rim',     type: 'file', ext: 'wav' },
                        { name: 'Snare_Fat',     type: 'file', ext: 'aif' },
                    ]
                },
                {
                    name: 'HiHats',
                    type: 'dir',
                    children: [
                        { name: 'HH_Closed_01',   type: 'file', ext: 'wav' },
                        { name: 'HH_Open_Sizzle', type: 'file', ext: 'wav' },
                        { name: 'HH_Pedal',       type: 'file', ext: 'wav' },
                    ]
                },
                { name: 'Clap_Classic', type: 'file', ext: 'wav' },
                { name: 'Clap_808',     type: 'file', ext: 'wav' },
                { name: 'Perc_Conga',   type: 'file', ext: 'wav' },
            ]
        },
        {
            name: 'Bass',
            type: 'dir',
            children: [
                {
                    name: 'Synth Bass',
                    type: 'dir',
                    children: [
                        { name: 'Bass_Sub_Deep', type: 'file', ext: 'wav' },
                        { name: 'Bass_Acid_303', type: 'file', ext: 'wav' },
                        { name: 'Bass_Reese',    type: 'file', ext: 'aif' },
                        { name: 'Bass_Moog',     type: 'file', ext: 'wav' },
                    ]
                },
                {
                    name: 'Electric Bass',
                    type: 'dir',
                    children: [
                        { name: 'EBass_Fingered', type: 'file', ext: 'wav' },
                        { name: 'EBass_Slap_A',   type: 'file', ext: 'wav' },
                        { name: 'EBass_Plucked',  type: 'file', ext: 'aif' },
                    ]
                },
                { name: 'Bass_One_Shot', type: 'file', ext: 'wav' },
            ]
        },
        {
            name: 'Loops',
            type: 'dir',
            children: [
                {
                    name: '120 BPM',
                    type: 'dir',
                    children: [
                        { name: 'Loop_Drum_Funky', type: 'file', ext: 'wav' },
                        { name: 'Loop_Perc_120',   type: 'file', ext: 'wav' },
                        { name: 'Loop_Full_Break', type: 'file', ext: 'wav' },
                    ]
                },
                {
                    name: '140 BPM',
                    type: 'dir',
                    children: [
                        { name: 'Loop_Amen_140',   type: 'file', ext: 'wav' },
                        { name: 'Loop_Jungle_140', type: 'file', ext: 'wav' },
                        { name: 'Loop_Techno_140', type: 'file', ext: 'aif' },
                        { name: 'Loop_House_140',  type: 'file', ext: 'wav' },
                    ]
                },
                { name: 'Loop_Chill_Vibe', type: 'file', ext: 'wav' },
            ]
        },
        {
            name: 'FX',
            type: 'dir',
            children: [
                {
                    name: 'Risers',
                    type: 'dir',
                    children: [
                        { name: 'Riser_8bar',       type: 'file', ext: 'wav' },
                        { name: 'Riser_Synth_4bar', type: 'file', ext: 'wav' },
                        { name: 'Riser_Noise',      type: 'file', ext: 'wav' },
                    ]
                },
                {
                    name: 'Impacts',
                    type: 'dir',
                    children: [
                        { name: 'Impact_Boom',    type: 'file', ext: 'wav' },
                        { name: 'Impact_Sub_Hit', type: 'file', ext: 'wav' },
                        { name: 'Impact_Crash',   type: 'file', ext: 'aif' },
                    ]
                },
                { name: 'FX_Downlifter',  type: 'file', ext: 'wav' },
                { name: 'FX_Sweep_White', type: 'file', ext: 'wav' },
                { name: 'FX_Stutter',     type: 'file', ext: 'wav' },
            ]
        },
        { name: 'project_beat_01', type: 'file', ext: 'grv' },
        { name: 'project_techno',  type: 'file', ext: 'grv' },
    ]
};

export function getFolderNode(folderPath) {
    let node = FILESYSTEM;
    for (const step of folderPath) {
        node = node.children[step];
    }
    return node;
}

export function getFolderItems(folderPath) {
    const node = getFolderNode(folderPath);
    const items = [];
    if (folderPath.length > 0) {
        items.push({ name: '..', type: 'back' });
    }
    if (node.children) {
        items.push(...node.children);
    }
    return items;
}

export function getFolderPathNames(folderPath) {
    return folderPath.map((stepIdx, depth) => {
        let node = FILESYSTEM;
        for (let d = 0; d <= depth; d++) {
            if (d < depth) node = node.children[folderPath[d]];
            else node = node.children[stepIdx];
        }
        return node.name;
    });
}

export { LOADABLE_EXTS };
