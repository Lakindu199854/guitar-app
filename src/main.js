import './style.css';
import { NOTES, noteAt, randomPosition } from './game.js';
const labels=['E','B','G','D','A','E'];
const flats={1:'D♭',3:'E♭',6:'G♭',8:'A♭',10:'B♭'};
let limit=10,score=0,active=false,target=null,deadline=0,ticker=null, bests={};
try { bests=JSON.parse(localStorage.getItem('fret-sprout-bests') || '{}') || {}; } catch {}
const app=document.querySelector('#app');
app.innerHTML=`
<header><a class="brand" href="./"><span class="brand-icon">♧</span> fret<span>sprout</span><span class="brand-dot"></span></a><span class="header-note">A little practice. A lot of possibility.</span><button class="help-button" id="help">? <span>How to play</span></button></header>
<main><div class="intro"><div class="eyebrow"><span></span> MAKE MUSIC, ONE NOTE AT A TIME</div><h1>Small notes.<br><em>Big discoveries.</em></h1><p>Get to know your guitar, one little challenge at a time.<br>Find the glowing fret. Name the note. Keep growing.</p><div class="intro-decoration" aria-hidden="true">♫<span>✦</span></div></div>
<div class="game-layout"><section class="board-card"><div class="card-heading"><div><span class="small-label">YOUR PLAYGROUND</span><h2>The fretboard</h2></div><span class="tuning"><span></span> Standard tuning</span></div><div class="note-hint-tools"><span class="small-label">HOLD A NOTE TO FIND ITS FRETS</span><div class="note-hints" role="group" aria-label="Find natural notes on the fretboard">${['A','B','C','D','E','F','G'].map(n=>`<button type="button" class="note-hint" data-hint-note="${n}" aria-label="Hold to show all ${n} notes" aria-pressed="false">${n}</button>`).join('')}</div></div><div class="board-instruction" id="instruction"><span class="instruction-icon">✦</span><span>Ready to find your first note? Hit <strong>Start playing</strong>.</span></div>
<div class="board-tools"><button type="button" id="reveal-notes" class="reveal-button" aria-label="Hold to show natural notes on the fretboard" aria-pressed="false">✧ Hold to see natural notes</button><span>C · D · E · F · G · A · B</span></div>
<div class="fret-scroll"><div class="fretboard-wrap"><div class="fret-numbers"><span></span>${Array.from({length:12},(_,i)=>`<span>${i+1}</span>`).join('')}</div><div class="fretboard">${labels.map((n,s)=>`<div class="string-row"><span class="string-label">${n}<small>${s===0?'high':s===5?'low':''}</small></span>${Array.from({length:12},(_,f)=>`<div class="fret-cell" data-string="${s}" data-fret="${f+1}"><div class="string-line" style="height:${1+s*.45}px"></div><span class="target-dot"></span>${!NOTES[noteAt(s,f+1)].includes('♯')?`<span class="natural-note" data-natural-note="${NOTES[noteAt(s,f+1)]}">${NOTES[noteAt(s,f+1)]}</span>`:''}${s===2&&[3,5,7,9].includes(f+1)?'<span class="inlay"></span>':''}${f===11&&[1,4].includes(s)?'<span class="inlay"></span>':''}</div>`).join('')}</div>`).join('')}</div><div class="board-bottom"><span>↑ THINNEST STRING</span><span>12 FRETS · 6 STRINGS · ENDLESS POSSIBILITIES</span></div></div></div>
<div class="board-footer"><span><span class="legend-dot"></span> Your mystery note</span><span>Every fret is a fresh adventure <span class="tiny-star">✧</span></span></div></section>
<aside class="play-card"><div class="score-row"><div><span class="small-label">YOUR SCORE</span><div class="score" id="score">0<span>notes</span></div></div><div class="best"><span>♕ PERSONAL BEST</span><strong id="best">0</strong></div></div><div class="timer-head"><span id="timer-label">TIME PER NOTE</span><span id="time">10<span>s</span></span></div><div class="timer-track"><div id="timer-bar"></div></div><fieldset id="limits"><legend>Choose your pace</legend><div class="pace-options">${[5,10,15,30].map(n=>`<button type="button" data-limit="${n}" class="pace ${n===10?'selected':''}" aria-pressed="${n===10}">${n}s</button>`).join('')}</div><p id="pace-note">A little time to think. A little room to grow.</p></fieldset><button id="start" class="start-button"><span>Start playing</span><span>↗</span></button><p class="start-caption" id="caption">Your next favorite habit starts here.</p></aside>
<section class="notes-card"><div class="notes-heading"><div><span class="small-label">NAME THAT NOTE</span><h2>What do you hear with your eyes?</h2></div><span class="keyboard-hint">Choose the matching note below ↓</span></div><div class="note-grid">${NOTES.map((n,i)=>`<button class="note ${flats[i]?'accidental':''}" data-note="${i}" disabled><span>${n}</span>${flats[i]?`<small>${flats[i]}</small>`:'<small>natural</small>'}</button>`).join('')}</div><div class="note-tip"><span>☀</span> A little tip: sharps (♯) and flats (♭) can be two names for the same note.</div></section></div>
<div class="bottom-message"><span>✧</span> No pressure. Just practice. Every try helps you grow.</div><footer><span>MADE FOR CURIOUS MINDS & LITTLE MUSICIANS</span><span>Keep picking. Keep learning. <span>♧</span></span></footer></main>
<dialog id="help-dialog"><button id="close-help" aria-label="Close instructions">×</button><span class="small-label">A NEW LITTLE ADVENTURE</span><h2>Let’s learn the fretboard.</h2><p>Choose a time limit, then press <strong>Start playing</strong>. A random spot on one of the six strings and twelve frets will glow.</p><p>Select its note below. A correct answer earns one point and resets your timer. A wrong answer or running out of time ends the round.</p><p>The top string is high E. Tuning from top to bottom is <strong>E · B · G · D · A · E</strong>. Each fret raises the note one half step. Sharp and flat names on the same button are equivalent. Hold one of the A–G buttons above the board to find every fret for that note, or hold the all-notes button to see every natural note. Release the button to hide the labels.</p><p>Your personal best for each pace is saved in this browser. Play again as often as you like!</p></dialog>`;
const $=s=>document.querySelector(s);
const hintButtons=[...document.querySelectorAll('.note-hint'),$('#reveal-notes')];
const heldHints=new Map();
const fretboard=$('.fretboard');
function renderHints(){
  const current=[...heldHints.values()].at(-1);
  fretboard.classList.toggle('show-natural-notes',current==='all');
  fretboard.classList.toggle('show-selected-note',Boolean(current&&current!=='all'));
  fretboard.querySelectorAll('.natural-note').forEach(marker=>{
    const matches=marker.dataset.naturalNote===current;
    marker.classList.toggle('matching-note',matches);
    marker.parentElement.classList.toggle('hinted',matches);
  });
  hintButtons.forEach(button=>button.setAttribute('aria-pressed',String(heldHints.has(button))));
}
function setHint(button,held){
  if(held)heldHints.set(button,button.dataset.hintNote||'all');
  else heldHints.delete(button);
  renderHints();
}
hintButtons.forEach(button=>{
  button.addEventListener('pointerdown',event=>{
    if(event.button!==0)return;
    button.setPointerCapture?.(event.pointerId);
    setHint(button,true);
  });
  for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,()=>setHint(button,false));
  button.addEventListener('keydown',event=>{
    if(event.key===' '||event.key==='Enter'){event.preventDefault();setHint(button,true);}
  });
  button.addEventListener('keyup',event=>{
    if(event.key===' '||event.key==='Enter'){event.preventDefault();setHint(button,false);}
  });
  button.addEventListener('blur',()=>setHint(button,false));
});
function clearHints(){heldHints.clear();renderHints();}
window.addEventListener('blur',clearHints);
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearHints();});
function best(){ $('#best').textContent=Number(bests[limit])||0; }
function displayTime(ms){ $('#time').innerHTML=`${active?Math.max(0,ms/1000).toFixed(1):limit}<span>s</span>`; $('#timer-bar').style.width=`${Math.max(0,Math.min(100,ms/(limit*1000)*100))}%`; $('#timer-bar').classList.toggle('urgent',active&&ms<3000); }
function highlight(){ document.querySelectorAll('.fret-cell').forEach(c=>{const on=target&&Number(c.dataset.string)===target.string&&Number(c.dataset.fret)===target.fret;c.classList.toggle('highlight',!!on);if(on)c.setAttribute('aria-label',`${labels[target.string]} string, fret ${target.fret}, mystery note`);else c.removeAttribute('aria-label');}); }
function next(){target=randomPosition();deadline=performance.now()+limit*1000;highlight();$('#instruction').innerHTML=`<span class="instruction-icon">✦</span><span>Find the note on <strong>${target.string===0?'high E':target.string===5?'low E':labels[target.string]} string, fret ${target.fret}</strong>.</span>`;displayTime(limit*1000);}
function end(reason){active=false;document.body.classList.remove('playing');clearInterval(ticker);const answer=NOTES[noteAt(target.string,target.fret)];$('#instruction').innerHTML=`<span class="instruction-icon">${reason==='timeout'?'◷':'♡'}</span><span>${reason==='timeout'?'Time’s up!':'Good try!'} That note was <strong>${answer}${flats[noteAt(target.string,target.fret)]?' / '+flats[noteAt(target.string,target.fret)]:''}</strong>. You found ${score} ${score===1?'note':'notes'}!</span>`;$('#start').innerHTML='<span>Play again</span><span>↗</span>';$('#start').disabled=false;document.querySelectorAll('.note').forEach(b=>b.disabled=true);document.querySelectorAll('.pace').forEach(b=>b.disabled=false);$('#caption').textContent='A fresh start. You’ve got this.';$('#timer-label').textContent='ROUND COMPLETE';$('#instruction').setAttribute('role','status');}
$('#start').onclick=()=>{score=0;active=true;document.body.classList.add('game-started','playing');$('#score').innerHTML='0<span>notes</span>';document.querySelectorAll('.note').forEach(b=>{b.disabled=false;b.classList.remove('correct');});document.querySelectorAll('.pace').forEach(b=>b.disabled=true);$('#start').innerHTML='<span>You’re growing!</span><span>✦</span>';$('#start').disabled=true;$('#caption').textContent='One point per note. Keep the streak alive.';$('#timer-label').textContent='TIME LEFT';next();clearInterval(ticker);ticker=setInterval(()=>{const remaining=deadline-performance.now();displayTime(remaining);if(remaining<=0)end('timeout');},50);};
document.querySelectorAll('.note').forEach(b=>b.onclick=()=>{if(!active)return;if(performance.now()>=deadline){end('timeout');return;}if(Number(b.dataset.note)!==noteAt(target.string,target.fret)){end('wrong');return;}score++;$('#score').innerHTML=`${score}<span>notes</span>`;if(score>(Number(bests[limit])||0)){bests[limit]=score;try{localStorage.setItem('fret-sprout-bests',JSON.stringify(bests));}catch{}best();}b.classList.add('correct');setTimeout(()=>b.classList.remove('correct'),250);next();});
document.querySelectorAll('.pace').forEach(b=>b.onclick=()=>{if(active)return;limit=Number(b.dataset.limit);document.querySelectorAll('.pace').forEach(p=>{p.classList.toggle('selected',p===b);p.setAttribute('aria-pressed',String(p===b));});displayTime(limit*1000);best();$('#pace-note').textContent=limit===5?'A speedy challenge for confident explorers.':limit===30?'Take your time. There’s plenty to discover.':'A little time to think. A little room to grow.';});
$('#help').onclick=()=>$('#help-dialog').showModal();$('#close-help').onclick=()=>$('#help-dialog').close();$('#help-dialog').addEventListener('click',e=>{if(e.target===$('#help-dialog'))$('#help-dialog').close();});best();
