// The 26 capability demos — the `D` object from reference/ai-ui-patterns.html,
// generated from it rather than retyped, so the markup, copy, timing and
// interactions are the source's own.
//
// Four kinds of edit were made, and nothing else:
//
//   1. Every class carries a `dm-` prefix, in the markup and in the selectors
//      the code queries. Scoping under `.ai-demo` alone wasn't enough: this
//      project already has a global `.row` (a bottom rule) and a global `.field`
//      (a flex column, which stacked Ghost Text's typed words above its
//      suggestion). A prefix stops a house rule reaching in, and stops a demo
//      rule reaching out.
//   2. Voice's inline <style> @keyframes moved into global.css as `dm-pulse`,
//      for the same reason — a keyframe name has no scope.
//   3. Five literal colours became tokens so the dark theme can move them: the
//      accepted tag's white, two skeleton greys, the Undo toast's text and link.
//      Each token's light value is the literal it replaced, so light mode is
//      unchanged. The illustration paint (the room in Object Highlights, the
//      thumbnails in Picks for a Reason, the avatar) stays literal: it stands for a
//      photo, and a photo doesn't change with the theme. The avatar's letter is
//      pinned dark for that reason.
//   4. Copy, to the house voice in src/components/ai/CLAUDE.md: British spelling
//      (Summarise), day-first dates (4 Mar 2026), "annual leave" for "vacation
//      days", no frame labelled "Assistant", and no first-person product voice —
//      "What can I help with?" is now "What would you like to do?". What a
//      person typed ("I'll review the deck") keeps its "I"; that is them.
//
// Each entry is { html, init?, run?, try? }. `init` wires the interactions and
// runs on every mount; `run` is the animation and runs once the demo starts.
// DemoStage owns both — see it for when "starts" is.
import { $, $$, wait, type, RM } from "./runtime.js";

export const DEMOS = {
 stream:{html:`<div class="dm-d dm-col">
   <div class="dm-bub dm-me">Write a tagline for a running app</div>
   <div class="dm-bub dm-ai"><span class="dm-t"></span><span class="dm-caret"></span></div>
   <div class="dm-acts"><button class="dm-mini">Stop</button></div></div>`,
  async run(r){
    const ok = await type($('.dm-t',r),'Every mile, a little more you. Built for the runs you almost skipped.',r,30);
    if(!ok) return; $('.dm-caret',r).remove();
    $('.dm-acts',r).innerHTML='<button class="dm-mini dm-fade">Copy</button><button class="dm-mini dm-fade">Regenerate</button>';
  }},
 starters:{try:true, html:`<div class="dm-d dm-col" style="align-items:center;text-align:center">
   <div style="font-size:16px;font-weight:600">What would you like to do?</div>
   <div class="dm-acts" style="justify-content:center">
     <button class="dm-chip">Plan a sprint review</button><button class="dm-chip">Summarise this week</button><button class="dm-chip">Draft release notes</button></div>
   <div class="dm-field" style="width:100%;text-align:left"><span class="dm-in dm-ph">Ask anything</span></div></div>`,
  init(r){ $$('.dm-chip',r).forEach(c=>c.onclick=()=>{const i=$('.dm-in',r);i.textContent=c.textContent;i.classList.remove('dm-ph');}); }},
 ghost:{try:true, html:`<div class="dm-d dm-col">
   <div class="dm-field" tabindex="0" style="min-height:76px"><span class="dm-typed"></span><span class="dm-ghost"></span></div>
   <div class="dm-lbl dm-hint" style="visibility:hidden"><kbd>Tab</kbd> or click to accept</div></div>`,
  async run(r){
    const ok = await type($('.dm-typed',r),"Thanks for the update. I'll review the deck",r,35); if(!ok) return;
    await wait(300); $('.dm-ghost',r).textContent=' and send notes by Friday.'; $('.dm-hint',r).style.visibility='visible';
  },
  init(r){
    const accept=()=>{const g=$('.dm-ghost',r); if(!g.textContent) return; const s=document.createElement('span'); s.className='dm-accepted'; s.textContent=g.textContent; $('.dm-typed',r).after(s); g.textContent=''; $('.dm-hint',r).style.visibility='hidden';};
    const f=$('.dm-field',r); f.addEventListener('keydown',e=>{if(e.key==='Tab'&&$('.dm-ghost',r).textContent){e.preventDefault();accept();}}); $('.dm-ghost',r).onclick=accept;
  }},
 selbar:{try:true, html:`<div class="dm-d dm-col">
   <div class="dm-panel dm-acts" style="align-self:flex-start;padding:4px;gap:2px;border-radius:10px">
     <button class="dm-mini" data-v="will launch the feature" style="border:0">Shorten</button>
     <button class="dm-mini" data-v="is excited to launch the feature" style="border:0">Friendlier</button>
     <button class="dm-mini" data-v="ha decidido lanzar la función" style="border:0">Translate</button></div>
   <p style="margin:0;font-size:14px">Our team <span class="dm-sel">has made the decision to move forward with launching the feature</span> next week.</p></div>`,
  init(r){ $$('[data-v]',r).forEach(b=>b.onclick=()=>{const s=$('.dm-sel,.dm-tint',r); s.className='dm-tint dm-fade'; s.textContent=b.dataset.v;}); }},
 variants:{try:true, html:`<div class="dm-d dm-col"><div class="dm-lbl">Subject line, pick one</div>
   ${['Your March report is ready','3 things that changed in March','March, in one minute'].map(t=>`<button class="dm-ai-box dm-opt" style="text-align:left;display:flex;justify-content:space-between;border:1.5px solid transparent">${t}<span class="dm-check" hidden>✓</span></button>`).join('')}</div>`,
  init(r){ $$('.dm-opt',r).forEach(o=>o.onclick=()=>{ $$('.dm-opt',r).forEach(x=>{x.style.borderColor='transparent';$('.dm-check',x).hidden=true;}); o.style.borderColor='var(--ink)'; $('.dm-check',o).hidden=false; }); }},
 regen:{try:true, html:`<div class="dm-d dm-col">
   <div class="dm-bub dm-ai dm-t" style="max-width:100%;min-height:58px"></div>
   <div class="dm-acts"><button class="dm-mini dm-prev" aria-label="Previous version">‹</button><span class="dm-ver dm-lbl"></span><button class="dm-mini dm-next" aria-label="Next version">›</button><button class="dm-mini dm-regen">Regenerate</button></div></div>`,
  init(r){
    const v=['Welcome aboard. Here\'s what to set up first.','Glad you\'re here. Three quick steps to get going.'];let i=1;
    const show=()=>{$('.dm-t',r).textContent=v[i];$('.dm-ver',r).textContent=`${i+1} / ${v.length}`;};
    $('.dm-prev',r).onclick=()=>{i=Math.max(0,i-1);show();}; $('.dm-next',r).onclick=()=>{i=Math.min(v.length-1,i+1);show();};
    $('.dm-regen',r).onclick=async()=>{ if(v.length>=4) return; $('.dm-t',r).textContent='…'; await wait(500); v.push(['You\'re in. Let\'s make your first project together.','Hi there. Start with your profile, then invite your team.'][v.length-2]); i=v.length-1; show(); };
    show();
  }},
 tldr:{html:`<div class="dm-d dm-col">
   <button class="dm-ai-box dm-head" style="display:flex;justify-content:space-between;font-weight:600;border-radius:10px 10px 0 0"><span>Summary</span><span class="dm-arrow">Show</span></button>
   <ul class="dm-ai-box dm-sum" style="margin:-8px 0 0;padding:4px 12px 10px 28px;border-radius:0 0 10px 10px;display:none"></ul>
   <div class="dm-sk" style="width:92%"></div><div class="dm-sk" style="width:80%"></div><div class="dm-sk" style="width:86%"></div><div class="dm-sk" style="width:60%"></div></div>`,
  async run(r){
    const ul=$('.dm-sum',r), items=['Launch moved to May 12','Onboarding design needs two more weeks','Budget approved, no changes'];
    await wait(500); if(!r.isConnected) return; ul.style.display='block'; $('.dm-arrow',r).textContent='Hide';
    for(const t of items){ if(!r.isConnected) return; const li=document.createElement('li'); li.className='dm-fade'; li.textContent=t; ul.append(li); await wait(350); }
  },
  init(r){ $('.dm-head',r).onclick=()=>{const u=$('.dm-sum',r);const open=u.style.display!=='none';u.style.display=open?'none':'block';$('.dm-arrow',r).textContent=open?'Show':'Hide';}; }},
 cite:{try:true, html:`<div class="dm-d dm-col">
   <div class="dm-ai-box">Q3 revenue grew 12%<button class="dm-mini dm-c" data-s="Q3 financial report, page 4" style="padding:0 6px;margin:0 2px;font-size:10px;vertical-align:2px">1</button>, mostly from enterprise renewals<button class="dm-mini dm-c" data-s="Sales review deck, slide 9" style="padding:0 6px;margin:0 2px;font-size:10px;vertical-align:2px">2</button>.</div>
   <div class="dm-panel dm-src dm-lbl" style="font-size:12px">Select a number to see its source</div></div>`,
  init(r){ $$('.dm-c',r).forEach(c=>c.onclick=()=>{ $$('.dm-c',r).forEach(x=>x.style.borderColor=''); c.style.borderColor='var(--ai)'; const s=$('.dm-src',r); s.innerHTML=`<div style="color:var(--ink);font-weight:600">${c.dataset.s}</div><div class="dm-sk" style="width:90%;margin-top:6px"></div><div class="dm-sk" style="width:70%;margin-top:4px;background:var(--ai-tint)"></div>`; }); }},
 tags:{try:true, html:`<div class="dm-d"><div class="dm-panel dm-col">
   <div class="dm-lbl">Acme Billing</div><div style="font-weight:600">Invoice #4821 is 15 days overdue</div>
   <div class="dm-acts">${['Billing','Urgent'].map(t=>`<span class="dm-tg" style="display:inline-flex;align-items:center;gap:4px;border:1px dashed var(--ai);background:var(--ai-tint);border-radius:999px;padding:2px 4px 2px 10px;font-size:12px">${t}<button class="dm-ok" aria-label="Accept ${t}" style="padding:0 4px">✓</button><button class="dm-no" aria-label="Remove ${t}" style="padding:0 4px;color:var(--muted)">✕</button></span>`).join('')}<span class="dm-lbl">Suggested</span></div></div></div>`,
  init(r){ $$('.dm-tg',r).forEach(t=>{ $('.dm-ok',t).onclick=()=>{t.style.border='1px solid var(--ink)';t.style.background='var(--surface)';t.style.paddingRight='10px';$$('button',t).forEach(b=>b.remove());}; $('.dm-no',t).onclick=()=>t.remove(); }); }},
 autofill:{html:`<div class="dm-d dm-row" style="align-items:stretch;max-width:320px">
   <div class="dm-panel dm-col" style="width:42%;gap:6px;font-size:11px"><b>Blue Bottle</b><div class="dm-sk"></div><div class="dm-sk" style="width:70%"></div><span>4 Mar 2026</span><div class="dm-sk" style="width:80%"></div><b>Total $18.40</b></div>
   <div class="dm-col" style="flex:1;gap:6px">${['Merchant','Date','Amount'].map(l=>`<div><div class="dm-lbl">${l}</div><div class="dm-field dm-f" style="min-height:28px;padding:5px 9px"></div></div>`).join('')}<div class="dm-lbl dm-note" style="visibility:hidden">Filled from receipt. Check before saving.</div></div></div>`,
  async run(r){
    const v=['Blue Bottle','4 Mar 2026','$18.40'], f=$$('.dm-f',r); await wait(400);
    for(let i=0;i<3;i++){ if(!r.isConnected) return; f[i].style.background='var(--ai-tint)'; f[i].style.borderColor='transparent'; f[i].textContent=v[i]; f[i].classList.add('dm-fade'); await wait(450); }
    if(r.isConnected) $('.dm-note',r).style.visibility='visible';
  }},
 answer:{html:`<div class="dm-d dm-col">
   <div class="dm-field"><span class="dm-q"></span></div>
   <div class="dm-ai-box dm-ans" style="visibility:hidden"><b>25 days a year</b>, plus public holidays where you work.<div class="dm-lbl" style="margin-top:4px">From: Time-off policy</div></div>
   <div class="dm-res dm-col" style="gap:5px;visibility:hidden"><div class="dm-sk" style="width:60%;background:var(--sk-2)"></div><div class="dm-sk" style="width:90%"></div><div class="dm-sk" style="width:55%;background:var(--sk-2);margin-top:4px"></div><div class="dm-sk" style="width:84%"></div></div></div>`,
  async run(r){
    if(!await type($('.dm-q',r),'how much annual leave do I get?',r,32)) return; await wait(400); if(!r.isConnected) return;
    $('.dm-ans',r).style.visibility='visible'; $('.dm-ans',r).classList.add('dm-fade'); await wait(300); $('.dm-res',r).style.visibility='visible';
  }},
 because:{html:`<div class="dm-d dm-col"><div style="font-weight:600">Because you saved “Ceramics 101”</div>
   <div class="dm-row">${[['Glazing basics','#d8cfc4'],['Wheel throwing','#c9d3cf'],['Kiln safety','#d6d0dc']].map(([t,c])=>`<div style="flex:1"><div style="height:64px;border-radius:10px;background:${c}"></div><div style="font-size:12px;margin-top:4px">${t}</div></div>`).join('')}</div></div>`},
 anomaly:{html:`<div class="dm-d dm-col"><div class="dm-panel">
   <div class="dm-lbl">Daily sign-ups</div>
   <svg viewBox="0 0 280 80" width="100%" aria-hidden="true"><polyline class="dm-ln" fill="none" stroke="var(--ink)" stroke-width="2" stroke-linejoin="round"/><circle class="dm-dot" r="9" fill="none" stroke="var(--ai)" stroke-width="2" opacity="0"/></svg></div>
   <div class="dm-ai-box dm-co" style="visibility:hidden">Sign-ups fell 38% on Tuesday. Checkout errors spiked at the same time.</div></div>`,
  async run(r){
    const v=[40,43,45,44,48,50,29,46,49,52], pts=v.map((y,i)=>[10+i*29,92-y*1.5]);
    const ln=$('.dm-ln',r); ln.setAttribute('points',pts.map(p=>p.join(',')).join(' '));
    const len=ln.getTotalLength?ln.getTotalLength():600; ln.style.strokeDasharray=len; ln.style.strokeDashoffset=len;
    ln.style.transition=RM?'none':'stroke-dashoffset 1s ease'; await wait(50); ln.style.strokeDashoffset=0; await wait(1000); if(!r.isConnected) return;
    const d=$('.dm-dot',r); d.setAttribute('cx',pts[6][0]); d.setAttribute('cy',pts[6][1]); d.setAttribute('opacity',1);
    await wait(300); const c=$('.dm-co',r); c.style.visibility='visible'; c.classList.add('dm-fade');
  }},
 nudge:{try:true, html:`<div class="dm-d dm-col">
   <div class="dm-ai-box dm-nb" style="visibility:hidden"><div>3 tickets describe the same login bug.</div><div class="dm-acts" style="margin-top:8px"><button class="dm-btn dm-primary dm-m">Merge tickets</button><button class="dm-btn dm-x">Dismiss</button></div></div>
   ${['#212 Can\'t sign in on Safari','#215 Login loops back','#218 Stuck after password'].map(t=>`<div class="dm-panel dm-tk" style="padding:8px 10px;font-size:12px">${t}</div>`).join('')}</div>`,
  async run(r){ await wait(600); if(!r.isConnected) return; const b=$('.dm-nb',r); b.style.visibility='visible'; b.classList.add('dm-fade'); },
  init(r){ $('.dm-m',r).onclick=()=>{ $$('.dm-tk',r).slice(1).forEach(t=>t.remove()); $('.dm-nb',r).innerHTML='Merged into #212. <button class="dm-mini">Undo</button>'; }; $('.dm-x',r).onclick=()=>$('.dm-nb',r).style.visibility='hidden'; }},
 plan:{html:`<div class="dm-d"><div class="dm-panel dm-col">
   <div style="font-weight:600">Sending payment reminders</div>
   ${['Find overdue invoices','Draft 12 reminder emails','Schedule for Monday 9 am'].map(t=>`<div class="dm-row dm-st" style="color:var(--muted)"><span class="dm-ic" style="width:16px;text-align:center">○</span>${t}</div>`).join('')}</div></div>`,
  async run(r){
    for(const s of $$('.dm-st',r)){ if(!r.isConnected) return; s.style.color='var(--ink)'; $('.dm-ic',s).textContent='◌'; $('.dm-ic',s).style.color='var(--ai)'; await wait(900); if(!r.isConnected) return; $('.dm-ic',s).textContent='✓'; $('.dm-ic',s).style.color='var(--ok)'; }
  }},
 approve:{try:true, html:`<div class="dm-d"><div class="dm-panel dm-col">
   <div style="font-weight:600">Ready to send 12 reminder emails</div><div class="dm-lbl">To overdue accounts, from billing@loka.com</div>
   <div class="dm-ai-box" style="font-size:12px">Hi Dana, a quick reminder that invoice #4821 is now 15 days overdue…</div>
   <div class="dm-acts dm-out"><button class="dm-btn">Edit emails</button><button class="dm-btn dm-primary dm-go">Send emails</button></div></div></div>`,
  init(r){ $('.dm-go',r).onclick=()=>{ $('.dm-out',r).innerHTML='<span class="dm-check dm-fade">✓ Sent 12 emails</span>'; }; }},
 clarify:{try:true, html:`<div class="dm-d dm-col">
   <div class="dm-bub dm-me">Book a room for the design review</div>
   <div class="dm-bub dm-ai">Sure. Which day works?</div>
   <div class="dm-acts dm-ch"><button class="dm-chip">Today</button><button class="dm-chip">Tomorrow</button><button class="dm-chip">Pick a date</button></div></div>`,
  init(r){ $$('.dm-ch .dm-chip',r).forEach(c=>c.onclick=async()=>{ const box=$('.dm-ch',r); box.outerHTML=`<div class="dm-bub dm-me dm-fade">${c.textContent}</div>`; await wait(400); const a=document.createElement('div'); a.className='dm-bub dm-ai dm-fade'; a.textContent=`Booked Room 4 for ${c.textContent.toLowerCase()==='pick a date'?'Thursday':c.textContent.toLowerCase()}, 2 to 3 pm.`; ($('.dm-d',r)||r).append(a); }); }},
 copilot:{html:`<div class="dm-d dm-row" style="max-width:330px;align-items:stretch;height:170px">
   <div class="dm-col" style="flex:1;gap:6px;padding-top:6px"><div style="font-weight:600;font-size:12px">Q3 plan</div><div class="dm-sk"></div><div class="dm-sk" style="width:80%"></div><div class="dm-sk" style="width:90%"></div><div class="dm-sk" style="width:60%"></div></div>
   <div class="dm-panel dm-col" style="width:58%;gap:6px;padding:8px"><div class="dm-lbl">Using Q3 plan</div>
   <div class="dm-bub dm-me" style="font-size:12px">What are the risks?</div><div class="dm-bub dm-ai dm-a" style="font-size:12px;visibility:hidden">Two: hiring delays and the API migration.</div>
   <div class="dm-field" style="margin-top:auto;min-height:26px;padding:4px 8px"><span class="dm-ph" style="font-size:11px">Ask about this doc</span></div></div></div>`,
  async run(r){ await wait(700); if(!r.isConnected) return; const a=$('.dm-a',r); a.style.visibility='visible'; a.classList.add('dm-fade'); }},
 voice:{html:`<div class="dm-d dm-col" style="align-items:center;text-align:center">
   <div style="position:relative;width:52px;height:52px"><span class="dm-ring" style="position:absolute;inset:0;border-radius:50%;background:var(--ai-tint);animation:dm-pulse 1.4s ease-out infinite"></span><span style="position:absolute;inset:8px;border-radius:50%;background:var(--ai);display:grid;place-items:center;color:#fff;font-size:16px">●</span></div>
   <div class="dm-tr" style="font-size:15px;min-height:44px"></div><div class="dm-lbl dm-st">Listening…</div></div>`,
  async run(r){
    const w='Remind me to call Ana after the standup tomorrow'.split(' '), tr=$('.dm-tr',r);
    for(let i=0;i<w.length;i++){ if(!r.isConnected) return; tr.innerHTML=w.slice(0,i).join(' ')+` <span style="color:var(--muted)">${w[i]}</span>`; await wait(260); }
    tr.textContent=w.join(' '); $('.dm-st',r).textContent='Done'; $('.dm-ring',r).style.animation='none';
  }},
 detect:{html:`<div class="dm-d" style="max-width:320px"><svg viewBox="0 0 280 150" width="100%" aria-label="Room photo with detected objects">
   <rect width="280" height="150" rx="10" fill="#e9e6e1"/><rect y="128" width="280" height="22" fill="#d9d4cc"/>
   <rect x="44" y="48" width="8" height="52" fill="#8a7a68"/><rect x="44" y="88" width="48" height="10" fill="#8a7a68"/><rect x="48" y="98" width="5" height="30" fill="#8a7a68"/><rect x="84" y="98" width="5" height="30" fill="#8a7a68"/>
   <rect x="150" y="100" width="30" height="28" fill="#b98b6b"/><circle cx="158" cy="86" r="14" fill="#7d9a7b"/><circle cx="172" cy="80" r="16" fill="#6c8a6a"/>
   <rect x="236" y="48" width="4" height="80" fill="#555"/><polygon points="224,48 252,48 246,30 230,30" fill="#e0c36a"/>
   <g class="dm-bx"></g></svg></div>`,
  async run(r){
    const g=$('.dm-bx',r), b=[['Chair',38,40,60,92],['Plant',138,60,48,70],['Lamp',218,24,40,106]];
    for(const [t,x,y,w,h] of b){ if(!r.isConnected) return; g.insertAdjacentHTML('beforeend',`<g class="dm-fade"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="none" stroke="#6b4eff" stroke-width="2"/><rect x="${x}" y="${y-14}" width="${t.length*6+10}" height="14" rx="3" fill="#6b4eff"/><text x="${x+5}" y="${y-4}" font-size="10" fill="#fff" font-family="-apple-system,system-ui,sans-serif">${t}</text></g>`); await wait(450); }
  }},
 translate:{try:true, html:`<div class="dm-d"><div class="dm-panel dm-col">
   <div class="dm-row"><span style="width:24px;height:24px;border-radius:50%;background:#d6d0dc;color:#1d1d1f;display:grid;place-items:center;font-size:11px">L</span><b>Lucía</b></div>
   <div class="dm-txt">Me encanta la nueva navegación, pero el botón de guardar es difícil de encontrar.</div>
   <div class="dm-row"><button class="dm-mini dm-tg">Show translation</button><span class="dm-lbl dm-info"></span></div></div></div>`,
  init(r){ let on=false; const es='Me encanta la nueva navegación, pero el botón de guardar es difícil de encontrar.', en='I love the new navigation, but the save button is hard to find.';
    $('.dm-tg',r).onclick=()=>{ on=!on; const t=$('.dm-txt',r); t.textContent=on?en:es; t.className=on?'dm-txt dm-ai-box dm-fade':'dm-txt'; $('.dm-tg',r).textContent=on?'Show original':'Show translation'; $('.dm-info',r).textContent=on?'Translated from Spanish':''; }; }},

 conf:{html:`<div class="dm-d"><div class="dm-panel dm-col" style="gap:0">
   ${[['Vendor','Acme Inc.',1],['Amount','$1,240.00',1],['Due date','3 Mar?',0]].map(([k,v,ok])=>`<div class="dm-row" style="justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line)"><span class="dm-lbl" style="width:60px">${k}</span><span class="dm-tint" style="flex:1">${v}</span><span style="font-size:11px;color:${ok?'var(--ok)':'var(--warn)'};${ok?'':'background:var(--warn-tint);border-radius:999px;padding:1px 8px'}">${ok?'● Sure':'● Check this'}</span></div>`).join('')}
   <div class="dm-lbl" style="padding-top:8px">The date was smudged on the scan.</div></div></div>`},
 feedback:{try:true, html:`<div class="dm-d dm-col">
   <div class="dm-ai-box">To reduce churn, start with a check-in at day 30, when most cancellations happen.</div>
   <div class="dm-acts dm-fb"><button class="dm-mini dm-up" aria-label="Good response">👍</button><button class="dm-mini dm-down" aria-label="Bad response">👎</button></div></div>`,
  init(r){ $('.dm-up',r).onclick=()=>$('.dm-fb',r).innerHTML='<span class="dm-lbl dm-fade">Thanks for the feedback</span>';
    $('.dm-down',r).onclick=()=>{ $('.dm-fb',r).innerHTML='<span class="dm-lbl">What went wrong?</span>'+['Not accurate','Too long','Off topic'].map(t=>`<button class="dm-chip dm-fade">${t}</button>`).join(''); $$('.dm-fb .dm-chip',r).forEach(c=>c.onclick=()=>$('.dm-fb',r).innerHTML='<span class="dm-lbl dm-fade">Thanks. This helps improve answers.</span>'); }; }},
 diff:{try:true, html:`<div class="dm-d dm-col"><div class="dm-panel dm-tx" style="font-size:14px">We <del style="color:var(--bad)">will be able to</del> <ins style="text-decoration:none" class="dm-tint">can</ins> ship the update <del style="color:var(--bad)">in the near future</del> <ins style="text-decoration:none" class="dm-tint">next week</ins>.</div>
   <div class="dm-acts dm-ac"><button class="dm-btn dm-primary dm-y">Accept all</button><button class="dm-btn dm-n">Reject</button></div></div>`,
  init(r){ $('.dm-y',r).onclick=()=>{ $$('del',r).forEach(d=>d.remove()); $('.dm-ac',r).innerHTML='<span class="dm-check">✓ Changes applied</span> <button class="dm-mini">Undo</button>'; };
    $('.dm-n',r).onclick=()=>{ $$('ins',r).forEach(d=>d.remove()); $$('del',r).forEach(d=>{d.style.color='';d.style.textDecoration='none';}); $('.dm-ac',r).innerHTML='<span class="dm-lbl">Kept your original</span>'; }; }},
 why:{try:true, html:`<div class="dm-d dm-col"><div class="dm-panel">
   <div class="dm-lbl">Recommended</div><div style="font-weight:600;margin:2px 0 6px">Design critique template</div>
   <button class="dm-mini dm-w">Why this?</button><div class="dm-ex"></div></div></div>`,
  init(r){ $('.dm-w',r).onclick=()=>{ $('.dm-ex',r).innerHTML='<div class="dm-ai-box dm-fade" style="margin-top:8px">You opened 4 critique docs this month.<div style="margin-top:6px"><button class="dm-mini">Show fewer like this</button></div></div>'; }; }},
 undo:{try:true, html:`<div class="dm-d dm-col" style="height:170px">
   ${['Receipts','Newsletters','Team'].map((t,i)=>`<div class="dm-row" style="justify-content:space-between;font-size:12px"><span>📁 ${t}</span><span class="dm-lbl dm-n">${[9,11,4][i]}</span></div>`).join('')}
   <div class="dm-toast" style="margin-top:auto;background:var(--ink);color:var(--on-ink);border-radius:10px;padding:9px 12px;display:flex;justify-content:space-between;align-items:center;visibility:hidden"><span class="dm-m">Sorted 24 emails into 3 folders</span><button class="dm-u" style="color:var(--ai-on-ink);font-weight:600">Undo</button></div></div>`,
  async run(r){ await wait(500); if(!r.isConnected) return; const t=$('.dm-toast',r); t.style.visibility='visible'; t.classList.add('dm-fade'); },
  init(r){ $('.dm-u',r).onclick=()=>{ $$('.dm-n',r).forEach(n=>n.textContent='0'); $('.dm-m',r).textContent='Moved 24 emails back to Inbox'; $('.dm-u',r).remove(); }; }},
};
