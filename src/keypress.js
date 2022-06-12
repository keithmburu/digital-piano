import { noteOn, noteOff } from './events';
import Midi from '@tonaljs/midi';
import * as Tone from 'tone';
import { getSetting } from './settings';

export const modalChords = {
    diatonicMajor : {
        0 : ["M3", "P5", "M7", "P8M2"],
        2 : ["m3", "P5", "M6", "P8M2"],
        4 : ["m3", "P5", "m7", "P8m2"],
        5 : ["M3", "P5", "M7", "P8M2"],
        7 : ["M3", "P5", "m7", "P8m2"],
        9 : ["m3", "P5", "m7"],
        11 : ["m3", "TT", "m7"]
    },
    diatonicMinor : {
        0 : ["m3", "P5", "M6", "P8M2"],
        2 : ["m3", "TT", "M6"],
        3 : ["M3", "P5", "M7", "P8M2"],
        5 : ["m3", "P5", "M6", "P8M2"],
        7 : ["M3", "P5", "m7", "P8m2"],
        8 : ["M3", "P5", "M7", "P8M2"],
        11 : ["m3", "TT", "M6"]
    },
    Major : {
        0 : ["M3", "P5", "M7", "P8M2"],
    },
    minor : {
        0 : ["m3", "P5", "m7", "P8M2"],
    },
    MajorPentatonic : {
        0 : ["M2", "M3", "P5", "M6"],
        2 : ["M2", "P4", "P5", "m7"],
        4 : ["m3", "P4", "m6", "m7"],
        7 : ["M2", "P4", "P5", "M6"],
        9 : ["m3", "P4", "P5", "m7"]
    },
    minorPentatonic : {
        0 : ["m3", "P4", "P5", "m7"],
        3 : ["M2", "M3", "P5", "M6"],
        5 : ["M2", "P5", "P4", "m7"],
        7 : ["m3", "P4", "m6", "m7"],
        10 : ["M2", "P4", "P5", "M6"]
    },
    MajorBlues : {
        0 : ["M2", "m3", "M3", "P5", "M6"],
        2 : ["m2", "M2", "P4", "P5", "m7"],
        3 : ["m2", "M3", "TT", "M6", "M7"],
        4 : ["m3", "P4", "m6", "m7", "M7"],
        7 : ["M2", "P4", "P5", "m6", "M6"],
        9 : ["m3", "P4", "TT", "P5", "m7"]
    },
    minorBlues : {
        0 : ["m3", "P4", "TT", "P5", "m7"],
        3 : ["M2", "m3", "M3", "P5", "M6"],
        5 : ["m2", "M2", "P5", "P4", "m7"],
        6 : ["m2", "M3", "TT", "M6", "M7"],
        7 : ["m3", "P4", "m6", "m7", "M7"],
        10 : ["M2", "P4", "P5", "m6", "M6"]
    },
    Quartal : {
        0 : ["P4", "m7", "P8m3", "P8m6"]
    },
    Quintal : {
        0 : ["P5", "P8M2", "P8M6", "P8P8M3"]
    },
    Overtones : {
        0 : ["P8", "P8P5", "P8P8", "P8P8M3", "P8P8P5"],
    },
    Undertones : {
        0 : ["-P8", "-P8P5", "-P8P8", "-P8P8M3", "-P8P8P5"],
    }
}

const intervals = {
    m2 : 1,
    M2 : 2,
    m3 : 3,
    M3 : 4,
    P4 : 5,
    TT : 6,
    P5 : 7,
    m6 : 8,
    M6 : 9,
    m7 : 10,
    M7 : 11,
    P8 : 12
}

export function keypress() {
    document.addEventListener('click', (e)=>{
        let currElm = e.target;
        if (currElm.closest("div") && currElm.closest('g')) {
            if (currElm.closest("div").id === "keyboard" && currElm.closest('g').id.substring(0, 5) === "note-") {
                if (getSetting("chordal")) {
                    playChord(currElm.closest('g').id);
                } else {
                    playNote(currElm.closest('g').id);
                }
            }
        }
    });
}

const playNote = async (id) => {
    let duration = getSetting("sustain")? 5 : 0.3;
    let midi = parseInt(id.substring(5, id.length));
    let note = Midi.midiToNoteName(midi); 
    await Tone.start();
    const synth = new Tone.Synth().toDestination();
    if (getSetting("modulation")) {
        const autoFilter = new Tone.AutoFilter(4).start();
        synth.chain(autoFilter, Tone.Destination);
    }
    if (getSetting("distortion")) {
        const distortion = new Tone.Distortion(0.4).toDestination();
        synth.connect(distortion);
    }
    const now = Tone.now();
    noteOn(midi);
    synth.triggerAttack(note, now);
    noteOff(midi, duration);
    synth.triggerRelease(now + duration);
}

const playChord = async (id) => {
    let duration = getSetting("sustain")? 5 : 0.5;
    let midi = [];
    midi.push(parseInt(id.substring(5, id.length)));
    const key = getSetting('key');
    let tonic;
    let newKey = key;
    let mode;
    let modeOption = getSetting('modeOptions');
    let modeChoice;
    if (modeOption == "highlight" || modeOption == "None") {
        mode = "";
    } else {
        modeChoice = getSetting(modeOption);
        if (modeChoice == 'None') {
            mode = "";
        } else if (modeChoice == 'Minor') {
            mode = "minor";
        } else if (modeChoice == 'Major') {
            mode = "Major";
        } else if (modeChoice == "Quartal") {
            mode = "Quartal";
        } else if (modeChoice == "Quintal") {
            mode = "Quintal";
        } else if (modeChoice == "Overtones") {
            mode = "Overtones";
        } else if (modeChoice == "Undertones") {
            mode = "Undertones";
        } else {
            if (key.slice(key.length-1, key.length) == 'm') {
                newKey = key.slice(0, key.length-1);
                if (modeChoice == "Diatonic") {
                    mode = "diatonicMinor";
                }  else if (modeChoice == 'Pentatonic') {
                    mode = "minorPentatonic";
                } else if (modeChoice == 'Blues') {
                    mode = "minorBlues";
                } 
            } else {
                if (modeChoice == "Diatonic") {
                    mode = "diatonicMajor";
                } else if (modeChoice == "Pentatonic") {
                    mode = "MajorPentatonic";
                } else if (modeChoice == "Blues") {
                    mode = "MajorBlues";
                }
            }
        }
    }
    console.log(mode);
    if (mode != "") {
        tonic = newKey + "0";
        let tonic_midi = Midi.toMidi(tonic);
        if (-(tonic_midi - midi[0]) % 12 in modalChords[mode] || mode == "Quartal"|| mode == "Quintal" || mode == "Overtones" || mode == "Undertones" || mode == "Major" || mode == "minor") { 
            let offset;
            if (mode == "Quartal" || mode == "Quintal" || mode == "Overtones" || mode == "Undertones" || mode == "Major" || mode == "minor") { 
                offset = 0;
            } else {
                offset = -(tonic_midi - midi[0]) % 12;
            }
            let chordIntervals = modalChords[mode][offset];
            let numNotes = 2;
            if (getSetting("extensions")) {
                numNotes = chordIntervals.length;
            }
            for (let i = 0; i < numNotes; i++) {
                if ((mode != "MajorPentatonic" && mode != "minorPentatonic" && mode != "MajorBlues" && mode != "minorBlues") || i % 2 == 1) {
                    let chordInterval = chordIntervals[i];
                    let multiplier = 1;
                    if (chordInterval.substring(0, 1) == "-") {
                        chordInterval = chordInterval.substring(1, chordInterval.length);
                        multiplier = -1;
                    }
                    if (chordInterval.length >= 2) {
                        let interval = 0;
                        while (chordInterval.length >= 2) {
                            interval += multiplier*intervals[chordInterval.substring(0, 2)];
                            chordInterval = chordInterval.substring(2, chordInterval.length);
                        }
                        midi.push(midi[0] + interval);
                    } else {
                        midi.push(midi[0] + multiplier*intervals[chordInterval]);
                    }
                }
            }
        } else {  
            midi.push(midi[0] + 4);
            midi.push(midi[1] + 3);
        }
    }
    let notes = [];
    for (let i = 0; i < midi.length; i++) {
        notes.push(Midi.midiToNoteName(midi[i]));
    }
    await Tone.start();
    let synth = new Tone.PolySynth(Tone.Synth).toDestination();
    if (getSetting("modulation")) {
        const autoFilter = new Tone.AutoFilter(8).start();
        synth.chain(autoFilter, Tone.Destination);
    }
    if (getSetting("distortion")) {
        const distortion = new Tone.Distortion(0.25).toDestination();
        synth.connect(distortion);
    }
    const now = Tone.now();
    let wait;
    if (getSetting("arpeggio")) {
        wait = 0.2 * midi.length;
        for (let i = 0; i < midi.length; i++) {
            noteOn(midi[i], i * 0.2);
            synth.triggerAttack(notes[i], now + (i * 0.2));
            noteOff(midi[i], duration + wait);
        }
    } else {
        wait = 0;
        for (let i = 0; i < midi.length; i++) {
            noteOn(midi[i], 0);
        }
        synth.triggerAttack(notes, now);
    }
    synth.triggerRelease(notes, now + duration + wait);
    for (let i = 0; i < midi.length; i++) {
        noteOff(midi[i], duration + wait);
    }
}
