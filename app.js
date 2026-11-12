'use strict';
/* 寸止めゲーム — メトロノーム連動エッジングゲーム（男性向け／女性向け） */
const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => [...el.querySelectorAll(s)];

/* ---------- 難易度 ---------- */
const DIFF = {
  easy:   { label:'やさしい', stroke:.50, slow:.30, stop:.20, allow:85 },
  normal: { label:'ふつう',   stroke:.60, slow:.20, stop:.20, allow:70 },
  hard:   { label:'きびしい', stroke:.70, slow:.15, stop:.15, allow:50 },
  oni:    { label:'鬼',       stroke:.80, slow:.10, stop:.10, allow:30 },
};
const ENDINGS = { lottery:'抽選', allow:'必ずイッていい', deny:'必ずお預け', handsfree:'手放し射精', continuous:'連続（何度でも）', extension:'延長戦' };
const INSTLEN = { standard:[8,20], long:[60,120], verylong:[120,300] };

/* ---------- 指示プール（男性向け＝女性の命令口調／女性向け＝男性の命令口調） ---------- */
const POOL = {
male: [
  {type:'stroke', text:'速くしごきなさい', sub:'拍に合わせて、速くよ'},
  {type:'stroke', text:'もっと速くしなさい', sub:'テンポを上げて。イッちゃダメ'},
  {type:'stroke', text:'根元から先まで、大きくしごきなさい', sub:'大きく、速くよ'},
  {type:'stroke', text:'両手で包んでしごきなさい', sub:'両手で包んで、上下に動かすの'},
  {type:'stroke', text:'利き手で速くしごきなさい', sub:'いつもの手で。もっと速く'},
  {type:'stroke', text:'左手だけでしごきなさい', sub:'左手だけよ。右手はダメ'},
  {type:'stroke', text:'右手だけでしごきなさい', sub:'右手だけよ。左手はダメ'},
  {type:'stroke', text:'強く握って、速くしごきなさい', sub:'握りは強めに。拍に合わせて'},
  {type:'stroke', text:'ゆるく握って、速く滑らせなさい', sub:'ゆるく、滑らかに、速くよ'},
  {type:'stroke', text:'上下に大きく、速くしごきなさい', sub:'大胆にやって。でも寸止めは守るのよ'},
  {type:'slow', text:'ゆっくりしごきなさい', sub:'焦らすの。1拍に1往復よ'},
  {type:'slow', text:'もっとゆっくり', sub:'止まりそうなくらい、ゆっくりよ'},
  {type:'slow', text:'ゆっくりひねりながらしごきなさい', sub:'ひねりを加えて、焦らして'},
  {type:'slow', text:'先をゆっくり撫で回しなさい', sub:'ゆっくり、ねっとりとよ'},
  {type:'slow', text:'根元をゆっくり握りなさい', sub:'握っては離して、焦らすの'},
  {type:'slow', text:'寸止めギリギリで、ゆっくりしごきなさい', sub:'イク寸前の感覚を保つのよ'},
  {type:'stop', text:'手を離しなさい', sub:'終わるまで触っちゃダメ'},
  {type:'stop', text:'寸止めよ。手を離して耐えなさい', sub:'耐えられたら「寸止めした」を押しなさい'},
  {type:'stop', text:'触らないで。深呼吸しなさい', sub:'息を整えて、引くのを待ちなさい'},
  {type:'stop', text:'手は頭の後ろ', sub:'絶対に触らないで'},
  {type:'stop', text:'そのまま固まっていなさい', sub:'動かない。触らない。分かった？'},
  {type:'nipple', text:'乳首だけ触りなさい', sub:'本体には触らないで。乳首だけで焦らすの'},
  {type:'nipple', text:'乳首をつまみなさい', sub:'つまんで転がして。本体はダメ'},
  {type:'nipple', text:'両方の乳首を同時に触りなさい', sub:'両手で乳首だけよ'},
  {type:'nipple', text:'乳首を爪先で弾きなさい', sub:'軽く弾いて、焦らして'},
  {type:'special', text:'亀頭だけを撫でなさい', sub:'先だけに集中よ'},
  {type:'special', text:'先だけを指でくるくる回しなさい', sub:'円を描くの。先だけよ'},
  {type:'special', text:'裏筋だけをなぞりなさい', sub:'弱いところだけ、丁寧にね'},
  {type:'special', text:'亀頭を包んで回しなさい', sub:'掌で包んで、回すの'},
  {type:'special', text:'先だけを軽く叩きなさい', sub:'リズムよく、先だけよ'},
],
female: [
  {type:'stroke', text:'速く擦れ', sub:'拍に合わせて、速くだ'},
  {type:'stroke', text:'もっと速く、円を描け', sub:'テンポを上げろ。イくなよ'},
  {type:'stroke', text:'指全体で大きく擦れ', sub:'大きく円を描いて、速く'},
  {type:'stroke', text:'二本指で速く上下に動かせ', sub:'拍に合わせて上下だ'},
  {type:'stroke', text:'利き手で速く擦れ', sub:'いつもの手で。もっと速く'},
  {type:'stroke', text:'左手だけで擦れ', sub:'左手だけだ。右手は使うな'},
  {type:'stroke', text:'右手だけで擦れ', sub:'右手だけだ。左手は使うな'},
  {type:'stroke', text:'強めに圧をかけて速く擦れ', sub:'圧は強めに。拍に合わせろ'},
  {type:'stroke', text:'軽く触れて速く滑らせろ', sub:'表面を滑らかに、速くだ'},
  {type:'stroke', text:'おもちゃを当てて速くしろ', sub:'使うなら一番弱い振動からだぞ'},
  {type:'slow', text:'ゆっくり擦れ', sub:'焦らせ。1拍に1往復だ'},
  {type:'slow', text:'もっとゆっくり、円を描け', sub:'止まりそうなくらいゆっくりだ'},
  {type:'slow', text:'まわりをゆっくりなぞれ', sub:'中心は避けろ。焦らすんだ'},
  {type:'slow', text:'圧をかけては離せ', sub:'押して、離して、焦らせ'},
  {type:'slow', text:'入口のまわりをゆっくり触れ', sub:'ゆっくり、ねっとりとだ'},
  {type:'slow', text:'寸止めギリギリでゆっくり擦れ', sub:'イク寸前の感覚を保て'},
  {type:'stop', text:'手を離せ', sub:'終わるまで触るな'},
  {type:'stop', text:'寸止めだ。手を離して耐えろ', sub:'耐えたら「寸止めした」を押せ'},
  {type:'stop', text:'触るな。深呼吸しろ', sub:'息を整えて、引くのを待て'},
  {type:'stop', text:'手は頭の後ろだ', sub:'絶対に触るな'},
  {type:'stop', text:'そのまま固まってろ', sub:'動くな。触るな'},
  {type:'nipple', text:'乳首だけ触れ', sub:'下には触るな。乳首だけで焦らせ'},
  {type:'nipple', text:'乳首をつまめ', sub:'つまんで転がせ。下はダメだ'},
  {type:'nipple', text:'両方の乳首を同時に触れ', sub:'両手で乳首だけだ'},
  {type:'nipple', text:'乳首を爪先で弾け', sub:'軽く弾いて、焦らせ'},
  {type:'special', text:'クリだけを撫でろ', sub:'一点だけに集中しろ'},
  {type:'special', text:'クリを指でくるくる回せ', sub:'小さく円を描け'},
  {type:'special', text:'クリの左側だけを触れ', sub:'弱い側だけだ。丁寧に'},
  {type:'special', text:'フードの上から先だけ触れ', sub:'直接触るな。上からだ'},
  {type:'special', text:'先だけを軽く弾け', sub:'リズムよく、先だけだ'},
]};

/* ---------- 状態 ---------- */
const state = {
  audience:'male', preset:'standard',
  durationMin:10, durationMode:'fixed', customMin:12,
  difficulty:'normal', ending:'lottery', handsFree:false,
  allowWindowSec:10, restMode:'random', restMin:8, restMax:16,
  instLen:'standard',
  metro:true, metroVolume:70, metroSound:'click', voice:false, vibe:true,
  slide:true, slideSec:8, pipGuide:true,
  disabledInst:new Set(),
};
let mediaItems = []; // {url, kind:'img'|'video'}
let pendingSync = null; // {seed, start}

/* ---------- ユーティリティ ---------- */
const rand = (a,b)=> a + Math.random()*(b-a);
const randi = (a,b)=> Math.floor(rand(a,b+1));
function mulberry32(seed){ return function(){ seed|=0; seed = seed+0x6D2B79F5|0; let t = Math.imul(seed^seed>>>15, 1|seed); t = t+Math.imul(t^t>>>7, 61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const fmt = sec => `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(Math.floor(sec%60)).padStart(2,'0')}`;
let toastTimer=null;
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.remove('hidden'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.add('hidden'), 3200); }
function encodeSettings(){ return btoa(unescape(encodeURIComponent(JSON.stringify({...state, disabledInst:[...state.disabledInst]})))); }
function decodeSettings(s){ try{ const o=JSON.parse(decodeURIComponent(escape(atob(s)))); return {...o, disabledInst:new Set(o.disabledInst||[])}; }catch(e){ return null; } }
function saveSettings(){ try{ localStorage.setItem('edgegame-settings', JSON.stringify({...state, disabledInst:[...state.disabledInst]})); }catch(e){} }
function loadSettings(){ try{ const o=JSON.parse(localStorage.getItem('edgegame-settings')||'null'); if(o) Object.assign(state, o, {disabledInst:new Set(o.disabledInst||[])}); }catch(e){} }

/* ---------- 画面遷移 ---------- */
const VIEWS = ['view-age','view-settings','view-wait','view-remote','view-game','view-result'];
function show(id){ VIEWS.forEach(v=>$('#'+v).classList.toggle('hidden', v!==id)); $('#siteHeader').style.display = id==='view-game' ? 'none':'flex'; $('#newsBar').style.display = (id==='view-game'||id==='view-remote') ? 'none':'flex'; window.scrollTo(0,0); }

/* ---------- 設定UIの反映 ---------- */
function enabledPool(){ return POOL[state.audience].filter((_,i)=>!state.disabledInst.has(state.audience+':'+i)); }
function durationLabel(){
  if(state.durationMode==='random') return 'ランダム';
  if(state.durationMode==='custom') return state.customMin+'分';
  return state.durationMin+'分';
}
function updateSummary(){
  const d = DIFF[state.difficulty];
  const line = `${durationLabel()} ・ ${d.label} ・ ${ENDINGS[state.ending]} ・ 指示 ${enabledPool().length}種類`;
  $('#summaryLine').textContent = line;
  $('#presetHint').textContent = line.replace(' ・ 指示 '+enabledPool().length+'種類','') + '（現在）';
  const verb = state.audience==='male' ? 'しごく' : '刺激する';
  $('#difficultyHint').textContent = `${verb}${Math.round(d.stroke*10)}割 ・ ゆっくり${Math.round(d.slow*10)}割 ・ 触らない${Math.round(d.stop*10)}割。最後にイケる確率 ${d.allow}%`;
  const bar = $('#ratioBar');
  bar.children[0].style.width = (d.stroke*100)+'%';
  bar.children[1].style.width = (d.slow*100)+'%';
  bar.children[2].style.width = (d.stop*100)+'%';
  $('#legendRate').textContent = d.allow + '%';
  $('#restHint').textContent = state.restMode==='random'
    ? `「寸止めした」のあとに待つ時間が、${state.restMin}〜${state.restMax}秒の間で毎回変わる`
    : `「寸止めした」のあとに ${state.restMin}秒 待つ（固定）`;
  saveSettings();
}
function markChips(container, attr, value){ $$(container+' .chip').forEach(c=>c.classList.toggle('selected', String(c.dataset[attr])===String(value))); }

function applyStateToUI(){
  $$('.aud-btn, .aud-chip').forEach(b=>b.classList.toggle('selected', b.dataset.aud===state.audience));
  markChips('#presetChips','preset',state.preset);
  markChips('#durationChips','min', state.durationMode==='random'?'random': state.durationMode==='custom'?'custom': state.durationMin);
  $('#customMinRow').classList.toggle('hidden', state.durationMode!=='custom');
  $('#customMin').value = state.customMin;
  markChips('#difficultyChips','diff',state.difficulty);
  markChips('#endingChips','ending',state.ending);
  $('#handsFreeToggle').checked = state.handsFree;
  markChips('#allowWindowChips','sec',state.allowWindowSec);
  markChips('#restModeChips','restmode',state.restMode);
  markChips('#restRangeChips','range', state.restMin+','+state.restMax);
  $('#restMin').value = state.restMin; $('#restMax').value = state.restMax;
  markChips('#instLenChips','instlen',state.instLen);
  $('#metroToggle').checked = state.metro; $('#metroVolume').value = state.metroVolume;
  markChips('#metroSoundChips','sound',state.metroSound);
  $('#voiceToggle').checked = state.voice; $('#vibeToggle').checked = state.vibe;
  $('#slideToggle').checked = state.slide; $('#slideSec').value = state.slideSec;
  $('#pipGuideToggle').checked = state.pipGuide;
  // 性別で変わる文言
  const male = state.audience==='male';
  $('#legendSpecial').textContent = male ? '亀頭だけ' : 'クリだけ';
  $('#handsFreeTitle').textContent = male ? '許可が出たら「手放し射精」で終わる' : '許可が出たら「手放し」で終わる';
  $('#handsFreeDesc').textContent = male ? '出していいが、出る瞬間に手を離して、触らずに垂らす' : 'イっていいが、イク瞬間に手を離して、触らずに震える';
  $$('#endingChips .chip').forEach(c=>{ if(c.dataset.ending==='handsfree') c.textContent = male ? '手放し射精' : '手放しフィニッシュ'; });
  $('.explain-text').textContent = male
    ? '画面が数秒ごとに「速く」「ゆっくり」「手を離せ」と指示を出します。そのとおりにしごいて、時間が来るまでイカずに耐える。時間が来たら抽選で、「イッていい」の許可が出るか、お預けになるか。要するに、いつ出していいかを画面に決めてもらう一人遊びで、海外では「エッジング」として定番になっています。'
    : '画面が数秒ごとに「速く」「ゆっくり」「手を離せ」と指示を出します。そのとおりに触って、時間が来るまでイカずに耐える。時間が来たら抽選で、「イッていい」の許可が出るか、お預けになるか。要するに、いつイッていいかを画面に決めてもらう一人遊びで、海外では「エッジング」として定番になっています。';
  buildInstructionList();
  updateSummary();
}
function setAudience(a){ state.audience=a; state.disabledInst.clear(); applyStateToUI(); }

function buildInstructionList(){
  const wrap = $('#instructionList'); wrap.innerHTML='';
  const names = {stroke:'しごく', slow:'ゆっくり', stop:'触らない', nipple:'乳首だけ', special: state.audience==='male'?'亀頭だけ':'クリだけ'};
  POOL[state.audience].forEach((ins,i)=>{
    const key = state.audience+':'+i;
    const b = document.createElement('button');
    b.className = 'inst-item' + (state.disabledInst.has(key)?' off':'');
    b.innerHTML = `<span>${ins.text} <small style="color:var(--muted)">${ins.sub}</small></span><span class="inst-tag tag-${ins.type}">${names[ins.type]}</span>`;
    b.addEventListener('click', ()=>{
      if(state.disabledInst.has(key)){ state.disabledInst.delete(key); }
      else { if(enabledPool().length<=1){ toast('最低1種類は必要です'); return; } state.disabledInst.add(key); }
      buildInstructionList(); updateSummary();
    });
    wrap.appendChild(b);
  });
}

/* ---------- 設定UIイベント ---------- */
function initSettingsUI(){
  $$('.aud-btn, .aud-chip').forEach(b=>b.addEventListener('click', ()=>setAudience(b.dataset.aud)));
  $('#presetChips').addEventListener('click', e=>{
    const c = e.target.closest('.chip'); if(!c) return;
    state.preset = c.dataset.preset;
    if(state.preset==='beginner'){ state.durationMode='fixed'; state.durationMin=5; state.difficulty='easy'; state.ending='lottery'; state.instLen='standard'; }
    if(state.preset==='standard'){ state.durationMode='fixed'; state.durationMin=10; state.difficulty='normal'; state.ending='lottery'; state.instLen='standard'; }
    if(state.preset==='long'){ state.durationMode='fixed'; state.durationMin=20; state.difficulty='normal'; state.ending='lottery'; state.instLen='long'; }
    applyStateToUI();
  });
  $('#durationChips').addEventListener('click', e=>{
    const c = e.target.closest('.chip'); if(!c) return;
    const v = c.dataset.min;
    if(v==='random'){ state.durationMode='random'; }
    else if(v==='custom'){ state.durationMode='custom'; }
    else { state.durationMode='fixed'; state.durationMin=+v; }
    state.preset=''; applyStateToUI();
  });
  $('#customMin').addEventListener('change', e=>{ state.customMin = Math.min(120, Math.max(1, +e.target.value||12)); updateSummary(); });
  $('#difficultyChips').addEventListener('click', e=>{ const c=e.target.closest('.chip'); if(c){ state.difficulty=c.dataset.diff; applyStateToUI(); } });
  $('#endingChips').addEventListener('click', e=>{ const c=e.target.closest('.chip'); if(c){ state.ending=c.dataset.ending; applyStateToUI(); } });
  $('#handsFreeToggle').addEventListener('change', e=>{ state.handsFree=e.target.checked; updateSummary(); });
  $('#allowWindowChips').addEventListener('click', e=>{ const c=e.target.closest('.chip'); if(c){ state.allowWindowSec=+c.dataset.sec; applyStateToUI(); } });
  $('#restModeChips').addEventListener('click', e=>{ const c=e.target.closest('.chip'); if(c){ state.restMode=c.dataset.restmode; applyStateToUI(); } });
  $('#restRangeChips').addEventListener('click', e=>{ const c=e.target.closest('.chip'); if(c){ const [a,b]=c.dataset.range.split(',').map(Number); state.restMin=a; state.restMax=b; applyStateToUI(); } });
  const restInput = ()=>{ let a=+$('#restMin').value||8, b=+$('#restMax').value||16; if(b<a) [a,b]=[b,a]; state.restMin=a; state.restMax=b; markChips('#restRangeChips','range', a+','+b); updateSummary(); };
  $('#restMin').addEventListener('change', restInput); $('#restMax').addEventListener('change', restInput);
  $('#instLenChips').addEventListener('click', e=>{ const c=e.target.closest('.chip'); if(c){ state.instLen=c.dataset.instlen; applyStateToUI(); } });
  $('#metroToggle').addEventListener('change', e=>{ state.metro=e.target.checked; updateSummary(); });
  $('#metroVolume').addEventListener('input', e=>{ state.metroVolume=+e.target.value; });
  $('#metroSoundChips').addEventListener('click', e=>{ const c=e.target.closest('.chip'); if(c){ state.metroSound=c.dataset.sound; applyStateToUI(); click(); } });
  $('#voiceToggle').addEventListener('change', e=>{ state.voice=e.target.checked; updateSummary(); });
  $('#vibeToggle').addEventListener('change', e=>{ state.vibe=e.target.checked; updateSummary(); });
  $('#slideToggle').addEventListener('change', e=>{ state.slide=e.target.checked; updateSummary(); });
  $('#slideSec').addEventListener('change', e=>{ state.slideSec=Math.min(60,Math.max(3,+e.target.value||8)); });
  $('#pipGuideToggle').addEventListener('change', e=>{ state.pipGuide=e.target.checked; updateSummary(); });

  // タブ
  $('#tabs').addEventListener('click', e=>{
    const t = e.target.closest('.tab'); if(!t) return;
    $$('#tabs .tab').forEach(x=>x.classList.toggle('active', x===t));
    $$('.tab-panel').forEach(p=>p.classList.toggle('hidden', p.dataset.panel!==t.dataset.tab));
  });
  // 設定検索
  $('#settingSearch').addEventListener('input', e=>{
    const q = e.target.value.trim();
    $$('#tabs .tab').forEach(x=>x.classList.toggle('active', x.dataset.tab==='play'));
    $$('.tab-panel').forEach(p=>p.classList.toggle('hidden', p.dataset.panel!=='play'));
    $$('.searchable').forEach(g=>{
      const hit = !q || (g.dataset.keywords+' '+g.textContent).includes(q);
      g.classList.toggle('hidden', !hit);
    });
  });
  // 画像・動画
  $('#mediaInput').addEventListener('change', e=>{
    mediaItems.forEach(m=>URL.revokeObjectURL(m.url)); mediaItems=[];
    [...e.target.files].forEach(f=>{
      mediaItems.push({ url:URL.createObjectURL(f), kind: f.type.startsWith('video') ? 'video':'img' });
    });
    $('#mediaCount').textContent = mediaItems.length ? `${mediaItems.length}件 選択中（端末内のみで再生されます）` : '未選択';
    if(mediaItems.length) toast('スライドショーの準備ができました');
  });
  $('#noticeClose').addEventListener('click', ()=>$('#noticeBox').classList.add('hidden'));
  $('#noticeGotoMedia').addEventListener('click', ()=>{
    $$('#tabs .tab').forEach(x=>x.classList.toggle('active', x.dataset.tab==='media'));
    $$('.tab-panel').forEach(p=>p.classList.toggle('hidden', p.dataset.panel!=='media'));
  });
  $('#newsClose').addEventListener('click', ()=>$('#newsBar').classList.add('hidden'));
  $('#newsFemale').addEventListener('click', ()=>{ setAudience('female'); show('view-age'); toast('女性向けに切り替えました'); });
  $('#logoHome').addEventListener('click', e=>{ e.preventDefault(); stopGame(false); show(sessionStorage.getItem('age-ok') ? 'view-settings':'view-age'); });
  $('#menuBtn').addEventListener('click', ()=>toast('男性向け／女性向けの切り替えは設定画面からできます'));

  // リンク作成
  $('#makeSyncLink').addEventListener('click', ()=>{
    const seed = randi(1, 2147483646); const start = Date.now()+120000;
    const url = `${location.origin}${location.pathname}#mode=sync&seed=${seed}&start=${start}&s=${encodeSettings()}`;
    $('#syncLinkOut').textContent = url;
    navigator.clipboard?.writeText(url).then(()=>toast('2人用リンクをコピーしました。相手に送ってください'));
    pendingSync = {seed, start};
    toast('あなたもこのリンクの開始時刻に自動で始まります（設定画面の「はじめる」ではなく、このまま待機します）');
    enterWait(pendingSync);
  });
  $('#makeRemoteLink').addEventListener('click', ()=>{
    const url = `${location.origin}${location.pathname}#role=remote&s=${encodeSettings()}`;
    $('#remoteLinkOut').textContent = url;
    navigator.clipboard?.writeText(url).then(()=>toast('遠隔リンクをコピーしました'));
  });
  $('#waitCancel').addEventListener('click', ()=>{ pendingSync=null; show('view-settings'); });
}

/* ---------- 音（Web Audio メトロノーム） ---------- */
let actx=null;
function audio(){ if(!actx) actx = new (window.AudioContext||window.webkitAudioContext)(); if(actx.state==='suspended') actx.resume(); return actx; }
function click(){
  if(!state.metro) return;
  try{
    const ctx = audio(); const t = ctx.currentTime;
    const osc = ctx.createOscillator(); const g = ctx.createGain();
    const freq = state.metroSound==='beep' ? 880 : state.metroSound==='wood' ? 420 : 1200;
    osc.frequency.value = freq; osc.type = state.metroSound==='beep' ? 'sine':'square';
    g.gain.setValueAtTime(state.metroVolume/100*0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t+0.07);
    osc.connect(g).connect(ctx.destination); osc.start(t); osc.stop(t+0.08);
  }catch(e){}
}
function speak(text){
  if(!state.voice || !('speechSynthesis' in window)) return;
  try{ const u = new SpeechSynthesisUtterance(text); u.lang='ja-JP'; u.rate=1.05; speechSynthesis.cancel(); speechSynthesis.speak(u); }catch(e){}
}

/* ---------- ゲームエンジン ---------- */
const game = {
  running:false, paused:false, timer:null, beatTimer:null, slideTimer:null,
  startAt:0, totalSec:600, phase:null, phaseEnd:0, edges:0, extended:false,
  rng:Math.random, lastPhaseText:'', finaleTimer:null, phaseCounted:false,
  remoteOverride:null, startedWall:0,
};
const bc = ('BroadcastChannel' in window) ? new BroadcastChannel('edgegame-remote') : null;

function phaseDurationFor(type){
  if(type==='stop') return state.restMode==='random' ? rand(state.restMin, state.restMax) : state.restMin;
  const [a,b] = INSTLEN[state.instLen];
  return rand(a,b);
}
function genPhase(){
  const d = DIFF[state.difficulty];
  const pool = enabledPool();
  const byType = t => pool.filter(p=>p.type===t);
  let r = game.rng(); let type;
  if(r < d.stroke){
    const sub = game.rng();
    type = sub < .70 ? 'stroke' : sub < .85 ? 'nipple' : 'special';
    if(!byType(type).length) type='stroke';
  } else if(r < d.stroke + d.slow) type='slow'; else type='stop';
  if(!byType(type).length) type = pool[0].type;
  const cands = byType(type);
  let ins = cands[Math.floor(game.rng()*cands.length)];
  if(cands.length>1 && ins.text===game.lastPhaseText) ins = cands[(cands.indexOf(ins)+1)%cands.length];
  game.lastPhaseText = ins.text;
  const bpm = type==='stroke' ? randi(126,150) : type==='slow' ? randi(58,72) : type==='nipple' ? 84 : type==='special' ? randi(90,104) : 0;
  return { ...ins, dur: phaseDurationFor(type), bpm };
}
function allowRate(){ return Math.min(100, DIFF[state.difficulty].allow + Math.min(20, game.edges*5)); }

function startGame(opts={}){
  audio(); // ユーザー操作の中でAudioContextを解放
  let total;
  if(state.durationMode==='random') total = randi(5,20)*60;
  else if(state.durationMode==='custom') total = state.customMin*60;
  else total = state.durationMin*60;
  game.totalSec = total; game.edges = 0; game.extended = false; game.phaseCounted=false;
  game.rng = opts.seed ? mulberry32(opts.seed) : Math.random;
  game.startedWall = opts.startAt || Date.now();
  game.startAt = performance.now();
  game.running = true; game.paused = false; game.remoteOverride = null;
  show('view-game');
  $('#finale').classList.add('hidden');
  ['phaseLabel','phaseText','phaseSub','pulseDot'].forEach(id=>$('#'+id).classList.remove('hidden'));
  $('#edgeBtn').textContent = '寸止めした';
  if(state.pipGuide) $('#pipHint').textContent = 'ほかの動画を見ながら遊ぶ場合は「小窓」ボタンで指示を切り出せます。';
  startSlideshow();
  nextPhase(true);
  clearInterval(game.timer); game.timer = setInterval(tick, 200);
  bc?.postMessage({kind:'status', phase:'開始', remainSec: game.totalSec, edges:0});
}
function nextPhase(first=false){
  if(game.remoteOverride && performance.now() < game.remoteOverride.until){
    game.phase = game.remoteOverride.phase;
  } else {
    game.remoteOverride = null;
    game.phase = genPhase();
  }
  game.phaseCounted = false;
  game.phaseEnd = performance.now() + game.phase.dur*1000;
  renderPhase();
  if(!first) { /* 継続 */ }
}
function renderPhase(){
  const p = game.phase; if(!p) return;
  const stage = $('#stage');
  stage.className = 'stage c-' + p.type;
  const labels = {stroke:'しごく', slow:'ゆっくり', stop:'触らない', nipple:'乳首だけ', special: state.audience==='male'?'亀頭だけ':'クリだけ'};
  const colors = {stroke:'#2fe08c', slow:'#f2c94c', stop:'#ff5566', nipple:'#ff9fd2', special:'#7cc4ff'};
  $('#pulseDot').style.background = colors[p.type]; $('#pulseDot').style.color = colors[p.type];
  $('#phaseLabel').textContent = labels[p.type];
  $('#phaseText').textContent = p.text;
  $('#phaseSub').textContent = p.type==='stop' ? p.sub : `${p.sub}（${p.bpm} BPM）`;
  $('#edgeBtn').disabled = !(p.type==='stop' && !game.phaseCounted);
  speak(p.text);
  if(state.vibe && navigator.vibrate) navigator.vibrate(p.type==='stop' ? [120,60,120] : 80);
  scheduleBeats();
  bc?.postMessage({kind:'status', phase:p.text, remainSec: Math.max(0,(game.totalSec*1000-(performance.now()-game.startAt))/1000|0), edges: game.edges});
}
function scheduleBeats(){
  clearInterval(game.beatTimer);
  const p = game.phase; if(!p || !p.bpm || !state.metro) { if(p && p.bpm) beatLoop(p.bpm); return; }
  beatLoop(p.bpm);
}
function beatLoop(bpm){
  clearInterval(game.beatTimer);
  const interval = 60000/bpm;
  const dot = $('#pulseDot');
  const doBeat = ()=>{ click(); dot.classList.remove('beat'); void dot.offsetWidth; dot.classList.add('beat'); };
  doBeat(); game.beatTimer = setInterval(doBeat, interval);
}
function tick(){
  if(!game.running || game.paused) return;
  const elapsed = (performance.now()-game.startAt)/1000;
  const remain = game.totalSec - elapsed;
  $('#gameClock').textContent = `${fmt(Math.min(elapsed, game.totalSec))} / ${fmt(game.totalSec)}`;
  $('#progressFill').style.width = Math.min(100, elapsed/game.totalSec*100)+'%';
  $('#gameMeta').textContent = `寸止め ${game.edges}回 ・ 許可率 ${allowRate()}%`;
  if(game.phase){
    const left = (game.phaseEnd - performance.now())/1000;
    $('#phaseBarFill').style.width = Math.max(0, left/game.phase.dur*100)+'%';
    $('#phaseCount').textContent = left>0 ? Math.ceil(left)+'秒' : '';
    if(left<=0) nextPhase();
  }
  if(remain<=0) finishGame();
}
function startSlideshow(){
  clearInterval(game.slideTimer);
  const wrap = $('#slideWrap');
  if(!state.slide || !mediaItems.length){ wrap.classList.add('hidden'); return; }
  wrap.classList.remove('hidden');
  let idx = 0;
  const showOne = ()=>{
    const m = mediaItems[idx % mediaItems.length]; idx++;
    const img = $('#slideImg'), vid = $('#slideVideo');
    if(m.kind==='video'){ img.classList.add('hidden'); vid.classList.remove('hidden'); vid.src=m.url; vid.play().catch(()=>{}); }
    else { vid.classList.add('hidden'); img.classList.remove('hidden'); img.src=m.url; }
  };
  showOne(); game.slideTimer = setInterval(showOne, state.slideSec*1000);
}
function cleanupGame(){
  clearInterval(game.timer); clearInterval(game.beatTimer); clearInterval(game.slideTimer); clearInterval(game.finaleTimer);
  game.running=false;
  const vid = $('#slideVideo'); vid.pause(); vid.removeAttribute('src');
  if('speechSynthesis' in window) speechSynthesis.cancel();
}
function stopGame(toSettings=true){ cleanupGame(); if(toSettings) show('view-settings'); }

function finishGame(forced=null){
  if(!game.running) return;
  cleanupGame();
  let allowed;
  if(forced==='allow') allowed = true;
  else if(forced==='deny') allowed = false;
  else if(state.ending==='allow' || state.ending==='continuous') allowed = true;
  else if(state.ending==='deny') allowed = false;
  else allowed = Math.random()*100 < allowRate(); // 抽選／手放し射精／延長戦
  const handsFreeFinish = state.handsFree || state.ending==='handsfree';
  if(allowed) runFinale(handsFreeFinish);
  else showResult(false, handsFreeFinish);
}
function runFinale(handsFreeFinish){
  show('view-game');
  game.running = false;
  clearInterval(game.beatTimer);
  ['pulseDot'].forEach(id=>$('#'+id).classList.add('hidden'));
  const maleCmd = state.audience==='male';
  $('#phaseLabel').textContent = '許可';
  $('#phaseText').textContent = maleCmd ? 'イッていいわよ！' : 'イッていいぞ！';
  $('#phaseSub').textContent = handsFreeFinish
    ? (maleCmd ? '手を離して出しなさい。触らずに垂らすのよ' : '手を離してイけ。触らずに震えてろ')
    : (maleCmd ? `${state.allowWindowSec}秒以内にイきなさい` : `${state.allowWindowSec}秒以内にイけ`);
  $('#phaseCount').textContent='';
  const fin = $('#finale'); fin.classList.remove('hidden');
  $('#finaleText').textContent = handsFreeFinish ? (maleCmd ? '手放しで出しなさい' : '手放しでイけ') : (maleCmd ? 'イッていいわよ' : 'イッていいぞ');
  const t0 = performance.now(); const total = state.allowWindowSec*1000;
  game.finaleTimer = setInterval(()=>{
    const left = total - (performance.now()-t0);
    $('#finaleBarFill').style.width = Math.max(0, left/total*100)+'%';
    $('#finaleCount').textContent = Math.max(0, Math.ceil(left/1000))+'秒';
    if(state.metro && left>0 && Math.ceil(left/1000)!==Math.ceil((left+100)/1000)) click();
    if(left<=0){ clearInterval(game.finaleTimer); showResult(true, handsFreeFinish); }
  }, 100);
  speak(state.audience==='male' ? 'イッていいわよ' : 'イッていいぞ');
  if(state.vibe && navigator.vibrate) navigator.vibrate([200,80,200]);
}
function showResult(allowed, handsFreeFinish){
  show('view-result');
  const rate = allowRate();
  $('#resultStats').textContent = `時間 ${fmt(game.totalSec)} ・ 寸止め ${game.edges}回 ・ 最終許可率 ${rate}%`;
  $('#againBtn').classList.toggle('hidden', !(allowed && state.ending==='continuous'));
  $('#extendBtn').classList.toggle('hidden', allowed);
  const maleVoice = state.audience==='male';
  if(allowed){
    $('#resultKicker').textContent = '許可';
    $('#resultTitle').textContent = maleVoice ? 'イッていいわよ' : 'イッていいぞ';
    $('#resultText').textContent = handsFreeFinish
      ? (maleVoice ? '許可よ。最後は手を離したまま、思い切り出しなさい。よく頑張ったわね。' : '許可だ。最後は手を離したまま、思い切りイけ。よく頑張ったな。')
      : (maleVoice ? '許可よ。よく耐えたわ。思い切りイきなさい。おつかれさま。' : '許可だ。よく耐えた。思い切りイけ。おつかれさま。');
  } else {
    $('#resultKicker').textContent = '結果';
    $('#resultTitle').textContent = 'お預け';
    $('#resultText').textContent = state.ending==='extension' && !game.extended
      ? (maleVoice ? '抽選はお預け。でも延長戦モードよ。下のボタンで +3分 の延長戦に入りなさい。' : '抽選はお預けだ。ただし延長戦モードだ。下のボタンで +3分 の延長戦に入れ。')
      : (maleVoice ? '今回は許可しないわ。ここで終わり。寸止めはそういうものでしょ。物足りなければ延長戦で確率を上げ直しなさい。' : '今回は許可しない。ここで終わりだ。寸止めはそういうものだ。物足りなければ延長戦で確率を上げ直せ。');
  }
  bc?.postMessage({kind:'status', phase: allowed?'許可：イッていい':'結果：お預け', remainSec:0, edges:game.edges});
}

/* ---------- ゲーム画面の操作 ---------- */
function initGameUI(){
  $('#edgeBtn').addEventListener('click', ()=>{
    if(!game.phase || game.phase.type!=='stop' || game.phaseCounted) return;
    game.phaseCounted = true; game.edges++;
    $('#edgeBtn').disabled = true;
    toast(`寸止め ${game.edges}回目。許可率が ${allowRate()}% になりました`);
    bc?.postMessage({kind:'status', phase: game.phase.text, remainSec: Math.max(0, game.totalSec - (performance.now()-game.startAt)/1000|0), edges: game.edges});
  });
  $('#pauseBtn').addEventListener('click', ()=>{
    if(!game.running) return;
    if(!game.paused){
      game.paused = true; game.pauseStart = performance.now(); clearInterval(game.beatTimer);
      $('#pauseBtn').textContent = '再開'; $('#phaseSub').textContent = '一時停止中';
    } else {
      const shift = performance.now()-game.pauseStart;
      game.startAt += shift; game.phaseEnd += shift; game.paused=false;
      $('#pauseBtn').textContent = '一時停止'; renderPhase();
    }
  });
  $('#quitBtn').addEventListener('click', ()=>{ stopGame(true); toast('中止しました。無理はしないでください'); });
  $('#pipBtn').addEventListener('click', async ()=>{
    const stage = $('#stage');
    if(window.documentPictureInPicture){
      try{
        const pip = await documentPictureInPicture.requestWindow({width:360, height:420});
        [...document.styleSheets].forEach(sh=>{ try{ const s=document.createElement('style'); s.textContent=[...sh.cssRules].map(r=>r.cssText).join(''); pip.document.head.appendChild(s);}catch(e){} });
        pip.document.body.appendChild(stage);
        pip.addEventListener('pagehide', ()=>{ $('#view-game').appendChild(stage); }, {once:true});
        toast('小窓に切り出しました');
      }catch(e){ toast('小窓を開けませんでした'); }
    } else {
      toast('このブラウザは小窓（ピクチャ・イン・ピクチャ）に未対応です');
    }
  });
  $('#extendBtn').addEventListener('click', ()=>{
    game.extended = true;
    // 延長戦： 合計時間を +3分 して再開（経過はリセットし、寸止め回数は引き継ぐ）
    const keepEdges = game.edges;
    startGame(); game.edges = keepEdges; game.totalSec = 180; game.extended = true;
    toast('延長戦： 3分追加。寸止め回数は引き継ぎます');
  });
  $('#againBtn').addEventListener('click', ()=>startGame());
  $('#backSettingsBtn').addEventListener('click', ()=>show('view-settings'));
  $$('[data-start]').forEach(b=>b.addEventListener('click', ()=>{ pendingSync=null; startGame(); }));
  $('#ageStart').addEventListener('click', ()=>{
    sessionStorage.setItem('age-ok','1');
    if(pendingSync) enterWait(pendingSync); else show('view-settings');
  });
}

/* ---------- 2人同期 ---------- */
let waitTimer=null;
function enterWait(sync){
  show('view-wait');
  clearInterval(waitTimer);
  const upd = ()=>{
    const left = sync.start - Date.now();
    $('#waitCount').textContent = left>0 ? `開始まで あと ${Math.ceil(left/1000)}秒` : 'まもなく開始…';
    if(left<=0){ clearInterval(waitTimer); pendingSync=null; startGame({seed: sync.seed, startAt: sync.start}); }
  };
  upd(); waitTimer = setInterval(upd, 250);
}

/* ---------- 遠隔 ---------- */
function initRemote(){
  if(!bc) return;
  bc.onmessage = e=>{
    const m = e.data||{};
    if(!$('#view-remote').classList.contains('hidden') && m.kind==='status'){
      $('#remoteStatus').textContent = `相手の状態： ${m.phase} ・ 残り ${fmt(m.remainSec||0)} ・ 寸止め ${m.edges}回`;
    }
    if(game.running && m.kind==='cmd'){
      if(m.cmd==='allow') finishGame('allow');
      else if(m.cmd==='deny') finishGame('deny');
      else if(m.cmd==='resume'){ game.remoteOverride=null; nextPhase(); }
      else {
        const map = {fast:'stroke', slow:'slow', stop:'stop', nipple:'nipple', special:'special'};
        const type = map[m.cmd]; if(!type) return;
        const pool = enabledPool().filter(p=>p.type===type);
        const ins = pool.length ? pool[0] : {text: type==='stop'?'手を離して':'速く', sub:'遠隔からの指示', type};
        const bpm = type==='stroke'?140: type==='slow'?64: type==='nipple'?84: type==='special'?96:0;
        game.remoteOverride = { phase:{...ins, type, dur:20, bpm}, until: performance.now()+20000 };
        nextPhase();
        toast('遠隔の指示が来ました');
      }
    }
  };
  $$('#view-remote [data-cmd]').forEach(b=>b.addEventListener('click', ()=>{
    bc.postMessage({kind:'cmd', cmd:b.dataset.cmd});
    toast('指示を送りました： ' + b.textContent);
  }));
}

/* ---------- 起動 ---------- */
function boot(){
  loadSettings();
  // URLパラメータ
  const q = new URLSearchParams(location.search);
  if(q.get('mode')==='male' || q.get('mode')==='female') state.audience = q.get('mode');
  const hash = new URLSearchParams(location.hash.replace(/^#/, ''));
  const s = hash.get('s'); if(s){ const o = decodeSettings(s); if(o) Object.assign(state, o); }
  initSettingsUI(); initGameUI(); initRemote();
  applyStateToUI();
  if(hash.get('role')==='remote'){ show('view-remote'); bc?.postMessage({kind:'hello'}); return; }
  if(hash.get('mode')==='sync' && hash.get('seed') && hash.get('start')){
    pendingSync = { seed:+hash.get('seed'), start:+hash.get('start') };
  }
  if(sessionStorage.getItem('age-ok')){
    if(pendingSync) enterWait(pendingSync); else show('view-settings');
  } else show('view-age');
}
document.addEventListener('DOMContentLoaded', boot);
