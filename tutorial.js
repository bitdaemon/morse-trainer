/* Welcome tutorial */
(()=>{
const STEPS=[
 {icon:`<span class="t-dot"></span><span class="t-dash"></span>`,title:"Welcome to Dit",
  body:`Learn Morse code by ear, the way operators do. It takes a few minutes a day.<br><br>The app has <b>five tabs</b> at the bottom. Here's what each one does.`},
 {icon:"◉",tab:"learn",title:"1 · Learn: listen",
  body:`Here you <b>just listen</b>; there's nothing to type.<ul><li>Press <b>▶ Play</b> to hear the letter. The bars show its pattern: short = dit, long = dah.</li><li><b>‹ ›</b> move between letters.</li><li>The grid shows your letters. You start with <b>K</b> and <b>M</b>; dim squares are locked.</li></ul>`},
 {icon:"◎",tab:"copy",title:"2 · Copy: test yourself",
  body:`<ul><li>Press <b>Start</b>. A letter plays.</li><li>Type it in the <b>"Type here…"</b> box (click the box first). No Enter needed.</li><li>Green = right. Red shows the correct answer. The next letter plays automatically.</li></ul>`},
 {icon:"🔓",tab:"copy",title:"3 · Unlocking new letters",
  body:`New letters unlock <b>on the Copy tab</b>.<br><br>Once every letter you have reaches <b>90% accuracy</b> over your recent attempts, the next letter unlocks and you'll see 🎉.<br><br>The thin bar under each letter on <b>Learn</b> shows how close it is. You can make this easier or harder in <b>Settings</b>.`},
 {icon:"⏺",tab:"send",title:"4 · Send: key it yourself",
  body:`<ul><li>Hold <b>Space</b> or press and hold the round button.</li><li><b>Short press = dit</b>, <b>longer press = dah</b>.</li><li>Pause briefly to finish a letter; pause longer for a space.</li><li>Send the word shown at the top.</li></ul><b>Tip:</b> start at 10–12 WPM in Settings. The timing is much more forgiving.`},
 {icon:"⑂",tab:"tree",title:"5 · Tree: see the code",
  body:`Every letter is a path from the top.<ul><li><b>Circle = dit</b>, <b>bar = dah</b>.</li><li>Key with Space and watch your path light up.</li><li>Tap any letter to hear it.</li></ul>`},
 {icon:"⚙",tab:"settings",title:"6 · Settings",
  body:`<ul><li><b>Speed (WPM)</b>: how fast characters sound.</li><li><b>Farnsworth</b>: adds extra space between letters while you learn.</li><li><b>Tone & volume</b>.</li><li><b>Unlocking rules</b>: accuracy needed and how many recent attempts count.</li><li><b>Themes</b>: nine colour schemes.</li></ul>`},
 {icon:"🎧",title:"You're ready",
  body:`<b>Suggested routine:</b> play K and M a few times on <b>Learn</b>, then spend 10 minutes on <b>Copy</b>. Repeat daily.<br><br>Reopen this guide any time with the <b>?</b> button at the top.`}
];
const ov=document.createElement("div");ov.className="tut";ov.innerHTML=`<div class="tut-card" role="dialog" aria-modal="true" aria-labelledby="tutTitle">
 <button class="tut-x" aria-label="Close">✕</button>
 <div class="tut-icon"></div><h2 id="tutTitle"></h2><div class="tut-body"></div>
 <div class="tut-dots"></div>
 <div class="tut-nav"><button class="btn ghost tut-back">Back</button><button class="btn primary tut-next">Next</button></div>
 <button class="tut-skip">Skip tutorial</button></div>`;
document.body.appendChild(ov);
let i=0;const q=s=>ov.querySelector(s);
function show(){const s=STEPS[i];q(".tut-icon").innerHTML=s.icon;q("#tutTitle").textContent=s.title;q(".tut-body").innerHTML=s.body;
 q(".tut-dots").innerHTML=STEPS.map((_,k)=>`<i class="${k===i?"on":""}"></i>`).join("");
 q(".tut-back").style.visibility=i?"visible":"hidden";q(".tut-next").textContent=i===STEPS.length-1?"Start learning":"Next";
 q(".tut-skip").style.visibility=i===STEPS.length-1?"hidden":"visible";
 if(s.tab)document.querySelector(`.tabs button[data-view="${s.tab}"]`).click();
 const c=q(".tut-card");c.classList.remove("swap");void c.offsetWidth;c.classList.add("swap")}
function open(){i=0;ov.classList.add("open");show()}
function close(){ov.classList.remove("open");S.onboarded=true;save();document.querySelector('.tabs button[data-view="learn"]').click()}
q(".tut-next").onclick=()=>i<STEPS.length-1?(i++,show()):close();
q(".tut-back").onclick=()=>{if(i){i--;show()}};
q(".tut-x").onclick=close;q(".tut-skip").onclick=close;
addEventListener("keydown",e=>{if(!ov.classList.contains("open"))return;if(e.key==="Escape")close();if(e.key==="ArrowRight")q(".tut-next").click();if(e.key==="ArrowLeft")q(".tut-back").click();if(e.code==="Space")e.stopImmediatePropagation()},true);
document.getElementById("helpBtn").onclick=open;
const sb=document.getElementById("tutAgain");if(sb)sb.onclick=open;
if(!S.onboarded)setTimeout(open,300);
})();
