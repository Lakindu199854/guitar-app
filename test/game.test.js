import { test } from 'node:test';
import assert from 'node:assert/strict';
import { noteAt, randomPosition, OPEN } from '../src/game.js';
test('standard tuning and octave at fret twelve on all six strings',()=>{assert.deepEqual(OPEN,[4,11,7,2,9,4]);for(let s=0;s<6;s++){assert.equal(noteAt(s,12),OPEN[s]);for(let f=1;f<=12;f++)assert.equal(noteAt(s,f),(OPEN[s]+f)%12);}});
test('known guitar notes including sharps and naturals',()=>{assert.equal(noteAt(0,1),5);assert.equal(noteAt(5,3),7);assert.equal(noteAt(4,3),0);assert.equal(noteAt(2,4),11);assert.equal(noteAt(1,2),1);});
test('every one of the 72 positions is independently reachable',()=>{for(let s=0;s<6;s++)for(let f=1;f<=12;f++){let calls=0;const position=randomPosition(()=>calls++===0?(s+.5)/6:(f-.5)/12);assert.deepEqual(position,{string:s,fret:f});}});
test('random selection respects boundary values',()=>{assert.deepEqual(randomPosition(()=>0),{string:0,fret:1});assert.deepEqual(randomPosition(()=>.999999),{string:5,fret:12});});
