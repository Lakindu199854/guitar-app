export const NOTES = ['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
export const OPEN = [4,11,7,2,9,4];
export function noteAt(string, fret) { return (OPEN[string] + fret) % 12; }
export function randomPosition(random = Math.random) { return { string: Math.floor(random() * 6), fret: 1 + Math.floor(random() * 12) }; }
