/* Morse dichotomic tree — PCB card style */
(()=>{
const N={ // [x,y]
 "":[205,62],T:[170,100],M:[120,100],O:[70,100],E:[235,100],I:[275,100],S:[315,100],H:[352,100],
 G:[120,150],Q:[70,150],Z:[120,198],
 N:[170,242],K:[120,242],Y:[70,242],C:[120,290],
 D:[170,338],X:[118,338],B:[170,384],
 A:[235,242],R:[275,242],L:[315,242],W:[235,338],P:[275,338],J:[235,384],
 U:[275,150],F:[275,198],V:[315,150]};
const codeOf=Object.fromEntries(Object.entries(MORSE).filter(([k])=>N[k]).map(([k,v])=>[v,k]));
const letterCode=c=>c===""?"":MORSE[c];
const svgNS="http://www.w3.org/2000/svg";
const svg=document.getElementById("treeSvg");
let html=`<rect x="8" y="8" width="384" height="420" rx="22" class="pcb-card"/>
<circle cx="372" cy="28" r="9" class="pcb-hole"/>
<text x="40" y="44" class="pcb-title">MORSE</text><text x="248" y="44" class="pcb-title">CODE</text>`;
// traces
const traces=[];
Object.keys(N).forEach(c=>{if(!c)return;const code=letterCode(c),pc=codeOf[code.slice(0,-1)]??"";const [x1,y1]=N[pc],[x2,y2]=N[c];
 const d=(x1===x2||y1===y2)?`M${x1},${y1}L${x2},${y2}`:`M${x1},${y1}L${x1},${y2}L${x2},${y2}`;
 traces.push(`<path d="${d}" class="pcb-trace" data-to="${code}"/>`)});
html+=traces.join("");
// antenna
html+=`<path d="M205,62 L193,40 L217,40 Z" class="pcb-ant"/><path d="M198,48 h14 M201,54 h8" class="pcb-ant-l"/>`;
// nodes
Object.keys(N).forEach(c=>{if(!c)return;const code=letterCode(c),[x,y]=N[c],dah=code.endsWith("-");
 // vertical bars for dahs on the E-branch (dah goes down there)
 const vertical=dah&&code[0]==="."&&!["A"].includes("_");
 const shape=dah?(code[0]==="."?`<rect x="${x-7}" y="${y-13}" width="14" height="26" rx="2"/>`:`<rect x="${x-14}" y="${y-7}" width="28" height="14" rx="2"/>`)
                :`<circle cx="${x}" cy="${y}" r="10"/>`;
 // label placement
 const lp={O:[0,-16],M:[0,-16],T:[0,-16],E:[0,-16],I:[0,-16],S:[0,-16],H:[0,-16],Q:[0,22],G:[22,5],Z:[20,5],Y:[0,-14],K:[0,-14],N:[22,-6],C:[20,5],
  D:[20,-8],X:[-26,5],B:[-20,5],A:[-20,22],R:[0,24],L:[22,5],W:[-20,8],P:[22,5],J:[-20,6],U:[-20,5],F:[22,5],V:[22,5]}[c]||[0,-16];
 html+=`<g class="pcb-node" data-code="${code}" data-ch="${c}">${shape}<text x="${x+lp[0]}" y="${y+lp[1]}" class="pcb-lbl">${c}</text></g>`});
html+=`<g class="pcb-speaker" transform="translate(205,412)"><circle r="5"/><path d="M-11,-8 a12,12 0 0,0 0,16 M11,-8 a12,12 0 0,1 0,16 M-17,-12 a19,19 0 0,0 0,24 M17,-12 a19,19 0 0,1 0,24"/></g>`;
svg.innerHTML=html;

function light(code){svg.querySelectorAll(".lit").forEach(e=>e.classList.remove("lit","end"));
 for(let i=1;i<=code.length;i++){const p=code.slice(0,i);svg.querySelectorAll(`[data-to="${p}"],[data-code="${p}"]`).forEach(e=>e.classList.add("lit"))}
 const end=svg.querySelector(`.pcb-node[data-code="${code}"]`);if(end)end.classList.add("end")}

// tap a node: play + animate path
svg.querySelectorAll(".pcb-node").forEach(g=>g.addEventListener("click",()=>{const code=g.dataset.code;light("");
 let built="";play(g.dataset.ch,(c,i,on)=>{if(on){built=code.slice(0,i+1);light(built)}}).then(ok=>{if(ok)setTimeout(()=>light(""),900)});
 $("#treeOut").textContent=g.dataset.ch+"  "+code.replace(/\./g,"·").replace(/-/g,"–")}));

// keying on the tree
let down=0,sym="",gapT,wordT,txt="";const key=$("#treeKey");
function kd(e){e&&e.preventDefault();if(down)return;audio();stop();down=performance.now();clearTimeout(gapT);clearTimeout(wordT);key.classList.add("down");gain.gain.cancelScheduledValues(0);gain.gain.setTargetAtTime(S.vol,ctx.currentTime,.003)}
function ku(e){e&&e.preventDefault();if(!down)return;const d=(performance.now()-down)/1000;down=0;key.classList.remove("down");gain.gain.setTargetAtTime(0,ctx.currentTime,.003);
 sym+=d<unit()*2?".":"-";light(sym);$("#treeOut").textContent=(codeOf[sym]||"?")+"  "+sym.replace(/\./g,"·").replace(/-/g,"–");
 gapT=setTimeout(()=>{txt+=REV[sym]||"?";sym="";$("#treeText").textContent=txt;setTimeout(()=>{if(!sym)light("")},400);
  wordT=setTimeout(()=>{if(txt&&!txt.endsWith(" "))txt+=" ";$("#treeText").textContent=txt},unit()*5000)},unit()*2500)}
key.addEventListener("pointerdown",kd);["pointerup","pointerleave","pointercancel"].forEach(ev=>key.addEventListener(ev,ku));
const active=()=>$("#tree").classList.contains("active");
addEventListener("keydown",e=>{if(e.code==="Space"&&active()&&!e.repeat)kd(e)});
addEventListener("keyup",e=>{if(e.code==="Space"&&active())ku(e)});
$("#treeClear").onclick=()=>{txt="";sym="";$("#treeText").innerHTML="&nbsp;";$("#treeOut").innerHTML="&nbsp;";light("")};
})();
