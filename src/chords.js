import Note from 'tonal/note';
import { getSetting } from './settings';

const FLAT_HTML = '<span class="flat">♭</span>';
const SHARP_HTML = '<span class="sharp">♯</span>';

const LATIN_NOTES = {
  C: 'Do',
  'C#': 'Di',
  'Db': 'Ra',
  D: 'Re',
  'D#': 'Ri',
  'Eb': 'Me',
  E: 'Mi',
  F: 'Fa' ,
  'F#': 'Fi',
  'Gb': 'Se',
  G: 'Sol',
  'G#': 'Si',
  'Ab': 'Le',
  A: 'La',
  'A#': 'Li',
  'Bb': 'Te',
  B: 'Ti',
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
  const latinNotationEnabled = getSetting('latinNotationEnabled');
  if (latinNotationEnabled) {
    return LATIN_NOTES[name + accidental];
  } else {
    return name + altToHtml(accidental);
  }
}

function chordName(name) {
  return name.substr(0,1) === 'M' ? name.substr(1) : name;
} 
