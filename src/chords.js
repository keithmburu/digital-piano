import Note from "tonal/note";
import { getSetting } from "./settings";
import Midi from "@tonaljs/midi";

const FLAT_HTML = "<span class='flat'>♭</span>";
const SHARP_HTML = "<span class='sharp'>♯</span>";

const LATIN_NOTES = {
  C: "Do",
  "C#": "Di",
  "Db": "Ra",
  D: "Re",
  "D#": "Ri",
  "Eb": "Me",
  E: "Mi",
  F: "Fa" ,
  "F#": "Fi",
  "Gb": "Se",
  G: "Sol",
  "G#": "Si",
  "Ab": "Le",
  A: "La",
  "A#": "Li",
  "Bb": "Te",
  B: "Ti",
}

const SOLFEGE = {
  0 : ["Do"],
  1 : ["Di", "Ra"],
  2 : ["Re"],
  3 : ["Ri", "Me"],
  4 : ["Mi"],
  5 : ["Fa"],
  6 : ["Fi", "Se"],
  7 : ["Sol"],
  8 : ["Si", "Le"],
  9 : ["La"],
  10 : ["Li", "Te"],
  11 : ["Ti"],
}

export function chordToHtml(chord) {
  return `
      <span class="key">${keyToHtml(chord.tonic)}</span> 
      <span class="chordname">${chordNameToHtml(chord.name)}</span><span class="bassnote">${chordBassToHtml(chord.mod)}</span>
    `;
}

export function keyToHtml(name) {
  const tokens = Note.tokenize(name);

  return `${keyName(tokens[0], tokens[1])}${tokens[2]}${tokens[3]}`;
}

function altToHtml(sharpOrFlat) {
  if (!sharpOrFlat) return '';
  if (sharpOrFlat === '#') return SHARP_HTML;
  if (sharpOrFlat === 'b') return FLAT_HTML;
  return sharpOrFlat;
}

function chordNameToHtml(name) {
  return chordName(name)
    .replace(/b(\d)/g, `${FLAT_HTML}$1`)
    .replace(/#/g, SHARP_HTML);
}


function chordBassToHtml(mod) {
  if (!mod) return '';
  const bass = mod.replace(/^\//, '');

  return `/${
      keyToHtml(bass)
        .replace(/b(\d)/g, `${FLAT_HTML}$1`)
        .replace(/#/g, SHARP_HTML)
    }`;
}

function keyName(name, accidental) {
  if (getSetting("solfege") !== "None") {
    let tonic;
    if (getSetting('solfege') === "fixedDo") {
      tonic = 'C';
    } else{
      tonic = getSetting("key");
      if (tonic.substring(tonic.length-1, tonic.length) === 'm') {
        tonic = tonic.substring(0, tonic.length-1);
      }
    }
    let tonic_midi = Midi.toMidi(tonic+"0");
    let note_midi = Midi.toMidi(name+accidental+"1");
    let solfege;
    if (SOLFEGE[-(tonic_midi - note_midi) % 12].length == 1) {
      solfege = SOLFEGE[-(tonic_midi - note_midi) % 12];
    } else {
      if (accidental === '#') {
        solfege = SOLFEGE[-(tonic_midi - note_midi) % 12][0];
      } else {
        solfege = SOLFEGE[-(tonic_midi - note_midi) % 12][1];
      }
    }
    return solfege;
  } else {
    return name + altToHtml(accidental);
  }
}

function chordName(name) {
  return name.substr(0,1) === 'M' ? name.substr(1) : name;
} 
