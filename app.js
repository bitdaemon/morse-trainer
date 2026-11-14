const MORSE={A:".-",B:"-...",C:"-.-.",D:"-..",E:".",F:"..-.",G:"--.",H:"....",I:"..",J:".---",K:"-.-",L:".-..",M:"--",N:"-.",O:"---",P:".--.",Q:"--.-",R:".-.",S:"...",T:"-",U:"..-",V:"...-",W:".--",X:"-..-",Y:"-.--",Z:"--..",0:"-----",1:".----",2:"..---",3:"...--",4:"....-",5:".....",6:"-....",7:"--...",8:"---..",9:"----.",".":".-.-.-",",":"--..--","?":"..--..","/":"-..-."};
const REV=Object.fromEntries(Object.entries(MORSE).map(([k,v])=>[v,k]));
const KOCH="KMURESNAPTLWI.JZ=FOY,VG5/Q92H38B?47C1D60X".replace("=","").split("");
const WORDS=["PARIS","CQ","QTH","RIG","ANT","WX","73","SOS","HELLO","MORSE","RADIO","TEST","NAME","DE","QRZ"];
const $=s=>document.querySelector(s);
const store={load(){try{return JSON.parse(localStorage.getItem("dit"))||{}}catch{return{}}},save(s){try{localStorage.setItem("dit",JSON.stringify(s))}catch{}}};
let S=Object.assign({wpm:20,eff:10,tone:600,vol:.5,grp:1,theme:"midnight",win:20,minN:10,thr:90,level:2,stats:{},streak:0,best:0,copied:0,right:0},store.load());
const save=()=>store.save(S);
// migrate old cumulative stats {r,n} to rolling history {h:[1,0,...]}
for(const c in S.stats){const s=S.stats[c];if(!s.h){const n=Math.min(s.n||0,50),r=Math.round(n*((s.r||0)/(s.n||1)));s.h=Array(n-r).fill(0).concat(Array(r).fill(1));delete s.r;delete s.n}}
function acc(c){const h=(S.stats[c]&&S.stats[c].h||[]).slice(-S.win);const r=h.reduce((x,y)=>x+y,0);return{n:h.length,r,p:h.length?r/h.length:0}}
function record(c,ok){const s=S.stats[c]||(S.stats[c]={h:[]});s.h.push(ok?1:0);if(s.h.length>50)s.h.shift()}

/* ---------- audio ---------- */
let ctx,osc,gain;
function audio(){if(!ctx){ctx=new (window.AudioContext||window.webkitAudioContext)();gain=ctx.createGain();gain.gain.value=0;gain.connect(ctx.destination);osc=ctx.createOscillator();osc.type="sine";osc.connect(gain);osc.start()}osc.frequency.value=S.tone;if(ctx.state==="suspended")ctx.resume();return ctx}
const unit=()=>1.2/S.wpm;
function farnsGap(){const u=unit(),e=Math.min(S.eff,S.wpm);const ta=(60/e-31*u)/19*1;return Math.max(ta,u)} // per-unit stretched gap
let playToken=0;
function play(text,onSym){const c=audio();const tok=++playToken;const u=unit(),g=farnsGap();let t=c.currentTime+.05;const ramp=.004,events=[];
 gain.gain.cancelScheduledValues(0);gain.gain.setValueAtTime(0,t);
 [...text.toUpperCase()].forEach(ch=>{if(ch===" "){t+=7*g-3*g;return}const code=MORSE[ch];if(!code)return;
  [...code].forEach((s,i)=>{const d=s==="."?u:3*u;gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(S.vol,t+ramp);gain.gain.setValueAtTime(S.vol,t+d-ramp);gain.gain.linearRampToValueAtTime(0,t+d);events.push([t,d,ch,i]);t+=d+u});
  t+=3*g-u});
 if(onSym)events.forEach(([st,d,ch,i])=>{setTimeout(()=>tok===playToken&&onSym(ch,i,true),(st-c.currentTime)*1000);setTimeout(()=>tok===playToken&&onSym(ch,i,false),(st+d-c.currentTime)*1000)});
 return new Promise(r=>setTimeout(()=>r(tok===playToken),(t-c.currentTime)*1000))}
function stop(){playToken++;if(gain){gain.gain.cancelScheduledValues(0);gain.gain.setValueAtTime(0,ctx.currentTime)}}

/* ---------- nav ---------- */
document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>{stop();document.querySelectorAll(".tabs button").forEach(x=>x.classList.toggle("on",x===b));document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===b.dataset.view));if(b.dataset.view==="copy")$("#copyInput").focus()});

/* ---------- learn ---------- */
let li=0;
function renderLearn(){const ch=KOCH[li];$("#learnChar").textContent=ch;$("#learnPattern").innerHTML=[...MORSE[ch]].map(s=>`<i class="${s==="."?"d":"a"}"></i>`).join("");
 $("#kochLevel").textContent="Level "+S.level;
 $("#charGrid").innerHTML=KOCH.map((c,i)=>{const st=acc(c);const p=Math.round(st.p*100);return`<div class="cell ${i>=S.level?"locked":""}" data-i="${i}" style="--p:${p}%">${c}</div>`}).join("");
 document.querySelectorAll(".cell:not(.locked)").forEach(el=>el.onclick=()=>{li=+el.dataset.i;renderLearn();playLearn()})}
function playLearn(){const bars=$("#learnPattern").children;play(KOCH[li],(c,i,on)=>bars[i]&&bars[i].classList.toggle("lit",on))}
$("#learnPlay").onclick=playLearn;
$("#learnPrev").onclick=()=>{li=(li-1+S.level)%S.level;renderLearn();playLearn()};
$("#learnNext").onclick=()=>{li=(li+1)%S.level;renderLearn();playLearn()};

/* ---------- copy ---------- */
const wave=$("#wave");wave.innerHTML="<b></b>".repeat(28);
let anim;function waveOn(on){wave.classList.toggle("on",on);cancelAnimationFrame(anim);const bs=[...wave.children];const f=()=>{bs.forEach(b=>b.style.height=(on?8+Math.random()*44:8)+"px");if(on)anim=requestAnimationFrame(f)};f()}
let current="";
function pick(){const pool=KOCH.slice(0,S.level);// weight weak chars
 const w=pool.map(c=>{const s=acc(c);return 1+(s.n?(1-s.p)*4:2)});let out="";
 for(let k=0;k<S.grp;k++){let x=Math.random()*w.reduce((a,b)=>a+b),i=0;while((x-=w[i])>0)i++;out+=pool[i]}return out}
async function round(){current=pick();$("#copyInput").value="";$("#copyFeedback").className="feedback";$("#copyFeedback").textContent="Listening…";
 play(current,(c,i,on)=>waveOn(on)).then(()=>waveOn(false));$("#copyInput").focus()}
$("#copyStart").onclick=()=>{$("#copyStart").textContent="Skip";round()};
$("#copyReplay").onclick=()=>current&&play(current,(c,i,on)=>waveOn(on));
$("#copyInput").addEventListener("input",e=>{const v=e.target.value.toUpperCase();if(v.length<current.length)return;
 const ok=v===current;[...current].forEach((c,i)=>record(c,v[i]===c));
 S.copied++;if(ok){S.right++;S.streak++;S.best=Math.max(S.best,S.streak)}else S.streak=0;
 const fb=$("#copyFeedback");fb.className="feedback "+(ok?"ok":"bad");fb.textContent=ok?"✓ "+current:`✗ It was ${current}  (${[...current].map(c=>MORSE[c]).join(" ")})`;
 levelCheck();save();updateStats();setTimeout(round,ok?700:1800)});
function levelCheck(){const pool=KOCH.slice(0,S.level);if(pool.every(c=>{const s=acc(c);return s.n>=S.minN&&s.p*100>=S.thr})&&S.level<KOCH.length){S.level++;$("#copyFeedback").textContent+="  · New char: "+KOCH[S.level-1]+" 🎉";renderLearn()}}
function updateStats(){$("#accPct").textContent=S.copied?Math.round(S.right/S.copied*100)+"%":"—";$("#copyCount").textContent=S.copied;$("#bestStreak").textContent=S.best;$("#streak").textContent="🔥 "+S.streak;$("#wpmBadge").textContent=S.wpm+" WPM"}

/* ---------- send ---------- */
let down=0,sym="",gapT,wordT,txt="";
const keyEl=$("#key");
function kd(e){e&&e.preventDefault();if(down)return;audio();down=performance.now();clearTimeout(gapT);clearTimeout(wordT);keyEl.classList.add("down");gain.gain.cancelScheduledValues(0);gain.gain.setTargetAtTime(S.vol,ctx.currentTime,.003)}
function ku(e){e&&e.preventDefault();if(!down)return;const d=(performance.now()-down)/1000;down=0;keyEl.classList.remove("down");gain.gain.setTargetAtTime(0,ctx.currentTime,.003);
 sym+=d<unit()*2?".":"-";$("#tape").textContent=txt.split("").map(c=>MORSE[c]||"/").join(" ")+" "+sym;
 gapT=setTimeout(()=>{txt+=REV[sym]||"?";sym="";render();wordT=setTimeout(()=>{if(!txt.endsWith(" "))txt+=" ";render()},unit()*5000)},unit()*2500)}
function render(){$("#decoded").innerHTML=txt||"&nbsp;";const t=$("#sendTarget").textContent;if(txt.trim()===t){$("#decoded").style.color="var(--acc)";setTimeout(newWord,1200)}else $("#decoded").style.color=""}
function newWord(){txt="";sym="";$("#tape").textContent="";$("#decoded").innerHTML="&nbsp;";$("#decoded").style.color="";$("#sendTarget").textContent=WORDS[Math.random()*WORDS.length|0]}
keyEl.addEventListener("pointerdown",kd);["pointerup","pointerleave","pointercancel"].forEach(ev=>keyEl.addEventListener(ev,ku));
addEventListener("keydown",e=>{if(e.code==="Space"&&$("#send").classList.contains("active")&&!e.repeat)kd(e)});
addEventListener("keyup",e=>{if(e.code==="Space"&&$("#send").classList.contains("active"))ku(e)});
$("#sendClear").onclick=()=>{txt="";sym="";$("#tape").textContent="";render()};$("#sendNew").onclick=newWord;

/* ---------- settings ---------- */
[["wpm","wpmOut"],["win","winOut"],["minN","minOut"],["thr","thrOut"],["eff","effOut"],["tone","toneOut"],["vol"],["grp","grpOut"]].forEach(([id,out])=>{const el=$("#"+id);el.value=S[id];if(out)$("#"+out).textContent=S[id];
 el.oninput=()=>{S[id]=+el.value;if(id==="win"&&S.minN>S.win){S.minN=S.win;$("#minN").value=S.minN;$("#minOut").textContent=S.minN}if(id==="minN"&&S.minN>S.win){S.win=S.minN;$("#win").value=S.win;$("#winOut").textContent=S.win}if(id==="wpm"&&S.eff>S.wpm){S.eff=S.wpm;$("#eff").value=S.eff;$("#effOut").textContent=S.eff}if(out)$("#"+out).textContent=el.value;save();updateStats();renderLearn()}});
$("#reset").onclick=()=>{if(confirm("Reset all progress?")){Object.assign(S,{level:2,stats:{},streak:0,best:0,copied:0,right:0});save();renderLearn();updateStats()}};

/* ---------- themes ---------- */
const THEMES={midnight:["Midnight","#0b0f14","#e6edf3","#3ee6a8","#2bb3ff"],daylight:["Daylight","#f4f6f9","#14202b","#0a9f6e","#1f7ae0"],
 phosphor:["Phosphor","#030a04","#a8ffb8","#39ff6a","#1fd65a"],amber:["Amber CRT","#0e0904","#ffd9a0","#ffb000","#ff7a1a"],
 nord:["Nord","#2e3440","#eceff4","#88c0d0","#81a1c1"],dracula:["Dracula","#1e1f29","#f8f8f2","#ff79c6","#bd93f9"],
 ocean:["Ocean","#06141f","#dff3ff","#4dd0e1","#5b8cff"],sunset:["Sunset","#1a0f17","#ffe8ee","#ff8a5c","#ff4f8b"],mono:["Mono","#000000","#ffffff","#ffffff","#bbbbbb"]};
function applyTheme(t){if(!THEMES[t])t="midnight";S.theme=t;document.documentElement.dataset.theme=t;
 document.querySelector("meta[name=theme-color]").content=THEMES[t][1];
 document.querySelectorAll(".theme").forEach(b=>b.classList.toggle("on",b.dataset.t===t))}
$("#themes").innerHTML=Object.entries(THEMES).map(([k,[n,bg,tx,a1,a2]])=>`<button class="theme" data-t="${k}" style="--t-bg:${bg};--t-text:${tx}"><span class="sw"><i style="background:${a1}"></i><i style="background:${a2}"></i><i style="background:${tx}"></i></span>${n}</button>`).join("");
document.querySelectorAll(".theme").forEach(b=>b.onclick=()=>{applyTheme(b.dataset.t);save()});
applyTheme(S.theme);

renderLearn();updateStats();
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
