/* 공통 시트 — 공통기억 시각화 허브 */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmtN=n=>{if(n==null||n==='')return'-';n=+n;return n>=1e8?(n/1e8).toFixed(1).replace(/\.0$/,'')+'억':n>=1e4?(n/1e4).toFixed(n>=1e5?0:1).replace(/\.0$/,'')+'만':n.toLocaleString()};
const pct=x=>x==null?'-':(x*100).toFixed(x<.01?2:1)+'%';
// 수치·강조어 형광펜
function hl(s){let h=esc(s);
 h=h.replace(/\*\*(.+?)\*\*/g,'<mark>$1</mark>');
 h=h.replace(/(\d[\d,\.]*\s?(?:%|만\s?원|억\s?원|천\s?원|원|만|억|천|배|명|개|일|장|컷|초|분|위|점|건|회|자|주|px|x\d+)?)/g,'<b class="n">$1</b>');
 h=h.replace(/(검증 안 됨|검증 불가|금지|절대|필수|핵심|수정금지|하지 않음|보장)/g,'<mark class="p">$1</mark>');
 return h}
const CATC={'인스타툰':'mint','카드뉴스':'blue','한장형':'purple','릴스':'orange','기타':'wine'};
const REG={KR:'🇰🇷 한국',JP:'🇯🇵 일본',TW:'🇹🇼 대만',US:'🇺🇸 미국',GL:'🌐 해외'};
const LS=localStorage;
let D=window.D||{};D.accBy={};(D.acc||[]).forEach(a=>D.accBy[a.h]=a);
/* ---------- 메뉴 ---------- */
const MENU=[
 ['🏠 대시보드','#ffd84d',[['home','한눈에 보기 · 명령어'],['prompts','📋 프롬프트 전체 복사']]],
 ['🖼 인스타 게시물 보드','#3ee6c4',[['b_all','전체 게시물'],['b_toon','인스타툰'],['b_card','카드뉴스'],['b_one','한장형'],['b_reel','릴스·기타 계정']]],
 ['👤 계정 분석','#6aa8ff',[['accs','계정 카드 (전체)'],['cmp_toon','📊 툰 비교'],['cmp_card','📊 카드뉴스·한장형 비교'],['grp_theme','🗂 주제별 묶음'],['grp_target','🎯 타깃별 묶음']]],
 ['📚 SNS 팩 (공통기억)','#b892ff',[['p_toon_an','인스타툰 분석'],['p_toon_mk','인스타툰 제작 (비율·컷)'],['p_card','카드뉴스·캐러셀'],['p_reels','릴스'],['p_thread','스레드'],['plan30','📅 30일 스레드 캘린더'],['p_side','부업강의·수익화'],['p_ebook','전자책'],['p_wadiz','와디즈 카피'],['p_ops','운영일반·계정분석 원문'],['p_yt','유튜브 자동프로그램'],['p_accs','계정 모음표 (팩 원문)']]],
 ['💰 혜민 투자 인스타','#ffa04d',[['hm','전략 대시보드'],['hm_week','📅 주간 7슬롯 기획판']]],
];
const ITEMS={};MENU.forEach(([g,c,a])=>a.forEach(([k,n])=>ITEMS[k]={n,g,c}));
function buildSide(){
 const cnt={b_all:(D.posts||[]).length,accs:(D.acc||[]).length,b_toon:cntCat('인스타툰'),b_card:cntCat('카드뉴스'),b_one:cntCat('한장형'),b_reel:cntCat('릴스')+cntCat('기타')};
 $('#side').innerHTML='<div class="logo">공통 시트<small>공통기억 × 인스타 실측 허브</small></div>'+MENU.map(([g,c,a])=>'<div class="grp" style="color:'+c+'">'+g+'</div>'+a.map(([k,n])=>'<a class="mi" data-k="'+k+'">'+n+(cnt[k]!=null?'<span class="c">'+cnt[k]+'</span>':'')+'</a>').join('')).join('');
 $$('#side .mi').forEach(e=>e.onclick=()=>{location.hash=e.dataset.k;if(innerWidth<700)document.body.classList.remove('open')});
}
function cntCat(c){return (D.posts||[]).filter(p=>(D.accBy[p.a]||{}).cat===c).length}
/* ---------- 공통 ---------- */
function copyBtn(text){return '<button class="cp" data-cp="'+esc(text)+'">복사</button>'}
document.addEventListener('click',e=>{const b=e.target.closest('button.cp');if(b){e.stopPropagation();const t=b.dataset.cp!=null&&b.dataset.cp!==''?b.dataset.cp:(b.closest('.blk,.cmd,.copyhost')?.querySelector('pre,code')?.innerText||'');navigator.clipboard.writeText(t).then(()=>{b.classList.add('ok');b.textContent='복사됨';setTimeout(()=>{b.classList.remove('ok');b.textContent='복사'},1200)})}});
function modal(html){$('#mod .in').innerHTML=html;$('#mod').classList.add('on');$('#mod').scrollTop=0}
function closeMod(){$('#mod').classList.remove('on')}
function backAcc(){closeMod();if(location.hash.startsWith('#acc:'))location.hash=window.lastV||'accs'}
function tools(html){$('#tools').innerHTML=html||''}
function md(s){try{return window.marked?marked.parse(s||''):'<pre>'+fmtPre(s)+'</pre>'}catch(e){return '<pre>'+fmtPre(s)+'</pre>'}}
function loadScript(src){return new Promise(r=>{const s=document.createElement('script');s.src=src;s.onload=r;s.onerror=r;document.body.appendChild(s)})}
/* ---------- 라우터 ---------- */
async function route(){let k=location.hash.slice(1)||'home';if(k.startsWith('acc:')){const h=decodeURIComponent(k.slice(4));if(!$('#view').innerHTML){window.lastV=window.curV='accs';await go('accs')}openAcc(h);return}
 if(!ITEMS[k])k='home';window.lastV=k;closeMod();if(window.curV===k&&$('#view').innerHTML)return;window.curV=k;await go(k)}
async function go(k){$$('#side .mi').forEach(e=>e.classList.toggle('on',e.dataset.k===k));const it=ITEMS[k];$('#top h1').innerHTML='<span style="color:'+it.c+'">●</span> '+it.n;tools('');window.scrollTo(0,0);
 const V=VIEWS[k]||VIEWS[k.split('_')[0]];if(k.startsWith('p_'))return viewPack(k);await V(k)}
const VIEWS={};
/* ---------- 홈 ---------- */
VIEWS.home=()=>{const A=D.acc||[],P=D.posts||[];const toon=A.filter(a=>a.cat==='인스타툰');
 const topToon=[...toon].sort((a,b)=>(b.followers||0)-(a.followers||0)).slice(0,6);
 const k=(v,l,c)=>'<div class="kpi t-'+c+'"><div class="v">'+v+'</div><div class="k">'+l+'</div></div>';
 let h='<div class="grid g6" style="margin-bottom:8px">'+k(A.length,'벤치마킹 계정','mint')+k(P.length,'ego 수집 게시물 (썸네일·캡션)','blue')+k(toon.length,'툰 계정','green')+k(A.filter(a=>a.cat==='카드뉴스').length,'카드뉴스 계정','purple')+k((D.pack||[]).reduce((s,x)=>s+x.convs.length,0),'SNS 팩 대화 분석','orange')+k((D.pack||[]).reduce((s,x)=>s+x.convs.reduce((t,c)=>t+c.blocks.length,0),0),'📌 복사형 블록·프롬프트','wine')+'</div>';
 h+='<div class="grid" style="grid-template-columns:1.35fr 1fr 1fr">';
 h+='<div class="sec t-navy"><h2>📋 복사해서 쓸 명령 <small>Hermes/Claude에 그대로 붙여넣기 · ○○만 바꾸기</small></h2>'+(D.cmds||[]).map(c=>'<div class="cmd"><span class="w">'+esc(c[0])+'</span><code>'+esc(c[1])+'</code>'+copyBtn(c[1])+'</div>').join('')+'</div>';
 h+='<div class="sec t-mint"><h2>🏆 툰 팔로워 TOP <small>ego 실측 · '+esc(D.fetched||'')+'</small></h2>'+bars(topToon,a=>a.followers,a=>'<a href="#acc:'+encodeURIComponent(a.h)+'">@'+esc(a.h)+'</a> <span class="muted small">'+esc(a.themeG||'')+'</span>','#3ee6c4')+
  '<h2 style="margin-top:8px">💬 팔로워 대비 반응(평균 좋아요/팔로워) TOP</h2>'+bars([...toon].filter(a=>a.stats&&a.stats.er!=null).sort((a,b)=>b.stats.er-a.stats.er).slice(0,6),a=>a.stats.er,a=>'<a href="#acc:'+encodeURIComponent(a.h)+'">@'+esc(a.h)+'</a>','#ffd84d',pct)+'</div>';
 h+='<div class="sec t-purple"><h2>🧭 바로가기</h2><div class="grid g2">'+[['b_toon','🖼 툰 게시물 보드','썸네일·캡션·좋아요 정렬','mint'],['cmp_toon','📊 툰 비교','팔로워·반응률 · 주제/타깃 묶음','blue'],['grp_theme','🗂 주제별 묶음','경제·직장인·연애·수익화…','green'],['plan30','📅 30일 스레드 캘린더','수정금지 30일 규격 플랜','yellow'],['hm','💰 혜민 투자 인스타','퍼널·5계정·상품·법적경계','orange'],['p_toon_mk','✏️ 인스타툰 제작','비율·컷·프롬프트','purple'],['p_card','🗞 카드뉴스','표지·규격·자동화','wine'],['prompts','📋 프롬프트 전체','📌 블록 검색·복사','navy']].map(x=>'<a class="kpi t-'+x[3]+'" href="#'+x[0]+'" style="text-decoration:none"><div style="font-weight:800;color:#fff">'+x[1]+'</div><div class="k">'+x[2]+'</div></a>').join('')+'</div>'+
  '<div class="note" style="margin-top:6px">⚠ 팩 속 수치(매출·조회수 등)는 과거 GPT 대화 기록값 — <mark class="p">검증 안 됨</mark>. 팔로워·게시물·좋아요는 ego 실측(비로그인 공개값, 수집 시각 표시).</div></div>';
 h+='</div>';$('#view').innerHTML=h};
function bars(arr,val,label,color,f){const mx=Math.max(...arr.map(val),1);return '<table class="t">'+arr.map(a=>'<tr><td style="width:44%">'+label(a)+'</td><td><div class="bar"><i style="width:'+(val(a)/mx*100)+'%;background:'+color+'"></i></div></td><td class="r nowrap"><b class="n">'+(f||fmtN)(val(a))+'</b></td></tr>').join('')+'</table>'}
/* ---------- 게시물 보드 ---------- */
let G={cols:+LS.cols||7,key:LS.gkey||'l',desc:true,acc:'',q:''};
VIEWS.b=(k)=>{const pre={b_all:null,b_toon:['인스타툰'],b_card:['카드뉴스'],b_one:['한장형'],b_reel:['릴스','기타']}[k];G.acc='';
 const themes=[...new Set((D.acc||[]).filter(a=>!pre||pre.includes(a.cat)).map(a=>a.themeG).filter(Boolean))].sort();
 const targets=[...new Set((D.acc||[]).filter(a=>!pre||pre.includes(a.cat)).flatMap(a=>a.targets||[]))].sort();
 tools('<span class="lab">열</span><input type="range" id="gc" min="3" max="14" value="'+G.cols+'"><b id="gcn">'+G.cols+'</b>'+
 '<span class="lab">정렬</span><select id="gk"><option value="l">좋아요</option><option value="c">댓글</option><option value="v">릴스 조회</option><option value="er">좋아요/팔로워</option><option value="cr">댓글율(댓글/좋아요)</option><option value="d">최신순</option><option value="f">계정 팔로워</option></select><button id="gd">내림 ▼</button>'+
 (pre&&pre.length==1?'':'<select id="gf"><option value="">전체 형식</option>'+['인스타툰','카드뉴스','한장형','릴스','기타'].map(x=>'<option value="'+x+'">'+catL(x)+'</option>').join('')+'</select>')+
 '<select id="gt"><option value="">전체 주제</option>'+themes.map(x=>'<option>'+esc(x)+'</option>').join('')+'</select>'+
 '<select id="gg"><option value="">전체 타깃</option>'+targets.map(x=>'<option>'+esc(x)+'</option>').join('')+'</select>'+
 '<select id="gr"><option value="">전 지역</option>'+Object.entries(REG).map(([a,b])=>'<option value="'+a+'">'+b+'</option>').join('')+'</select>'+
 '<select id="gy"><option value="">전 유형</option><option value="car">슬라이드</option><option value="vid">릴스·영상</option><option value="img">단일 이미지</option></select>'+
 '<input type="search" id="gq" placeholder="계정·본문 검색" size="12"><button id="gx" class="hide">계정해제</button>'+
 '<button id="gcap">캡션 ▸</button><select id="gar"><option value="">4:5</option><option value="sq">1:1</option><option value="full">원본</option></select><span id="gcnt" class="lab"></span>');
 $('#gk').value=G.key;
 const rer=()=>renderGal(pre);
 $('#gc').oninput=e=>{G.cols=+e.target.value;LS.cols=G.cols;$('#gcn').textContent=G.cols;$('#gal').style.gridTemplateColumns='repeat('+G.cols+',minmax(0,1fr))'};
 $('#gk').onchange=e=>{G.key=e.target.value;LS.gkey=G.key;rer()};$('#gd').onclick=()=>{G.desc=!G.desc;rer()};
 ['#gf','#gt','#gg','#gr','#gy'].forEach(s=>$(s)&&($(s).onchange=rer));$('#gq').oninput=rer;$('#gx').onclick=()=>{G.acc='';rer()};
 $('#gcap').onclick=()=>{document.body.classList.toggle('showcap');$('#gcap').classList.toggle('on');$('#gcap').textContent=document.body.classList.contains('showcap')?'캡션 ▾':'캡션 ▸'};
 $('#gar').onchange=e=>{document.body.classList.remove('sq','full');if(e.target.value)document.body.classList.add(e.target.value)};
 $('#view').innerHTML='<div id="gal"></div>';rer();
 $('#gal').onclick=e=>{const a=e.target.closest('.ac');if(a){if(e.altKey||a.dataset.go){location.hash='acc:'+encodeURIComponent(a.dataset.a);return}G.acc=a.dataset.a;rer();scrollTo(0,0);return}const m=e.target.closest('.m');if(m)m.closest('.pc').classList.toggle('open')};
};
function postVal(p,k){const a=D.accBy[p.a]||{};if(k==='er')return a.followers&&p.l!=null?p.l/a.followers:-1;if(k==='cr')return p.l?(p.c||0)/p.l:-1;if(k==='f')return a.followers||0;if(k==='d')return p.d||'';const v=p[k];return v==null?-1:v}
function renderGal(pre){let arr=(D.posts||[]).filter(p=>{const a=D.accBy[p.a]||{};if(pre&&!pre.includes(a.cat))return false;
  const f=$('#gf')?.value,t=$('#gt').value,g=$('#gg').value,r=$('#gr').value,y=$('#gy').value,q=$('#gq').value.trim().toLowerCase();
  if(f&&a.cat!==f)return false;if(t&&a.themeG!==t)return false;if(g&&!(a.targets||[]).includes(g))return false;if(r&&a.region!==r)return false;if(y&&p.t!==y)return false;if(G.acc&&p.a!==G.acc)return false;
  if(q&&!((p.a+' '+(a.name||'')+' '+(p.cap||'')+' '+(p.orig||'')).toLowerCase().includes(q)))return false;return true});
 arr.sort((x,y)=>{const A=postVal(x,G.key),B=postVal(y,G.key);const c=A<B?-1:A>B?1:0;return G.desc?-c:c});
 $('#gd').textContent=G.desc?'내림 ▼':'오름 ▲';$('#gx').classList.toggle('hide',!G.acc);$('#gcnt').textContent=arr.length+'개'+(G.acc?' · @'+G.acc:'');
 $('#gal').style.gridTemplateColumns='repeat('+G.cols+',minmax(0,1fr))';
 $('#gal').innerHTML=arr.slice(0,1500).map((p,i)=>{const a=D.accBy[p.a]||{};const u='https://www.instagram.com/'+(p.k==='reel'?'reel':'p')+'/'+p.sc+'/';
  const er=a.followers&&p.l!=null?p.l/a.followers:null;
  return '<div class="pc"><span class="tag">'+(i+1)+' '+(REG[a.region]||'').slice(0,4)+'</span><span class="fmt">'+(p.t==='vid'?'🎬':p.t==='car'?'🗂':'🖼')+(p.pin?'📌':'')+'</span><a class="th" href="'+u+'" target="_blank" rel="noopener"><img loading="lazy" src="'+p.img+'" alt=""></a><div class="b">'+
  '<div class="m" title="클릭: 캡션 펼치기">'+(p.v!=null?'<span class="vw">▶'+fmtN(p.v)+'</span>':'')+'<span class="lk">♥'+(p.l==null?'숨김':fmtN(p.l))+'</span><span class="cm">💬'+fmtN(p.c)+'</span>'+(er!=null?'<span class="muted" title="좋아요/팔로워">'+pct(er)+'</span>':'')+'</div>'+
  '<div class="r1"><span class="ac" data-a="'+esc(p.a)+'" title="클릭: 이 계정만 / Alt+클릭: 계정 상세">@'+esc(p.a)+'</span></div><div class="r1 muted small">'+esc(p.d||'')+' · <span class="chip c-'+(CATC[a.cat]||'wine')+'">'+esc(catL(a.cat||''))+'</span><a href="#acc:'+encodeURIComponent(p.a)+'">상세↗</a></div>'+
  '<div class="cap">'+(p.orig?'<span class="pill">🇰🇷 번역</span> ':'')+esc(p.cap||'')+(p.orig?'<details class="orig"><summary>원문 보기 ('+esc(p.lang)+')</summary><div>'+esc(p.orig)+'</div></details>':'')+'</div></div></div>'}).join('')}
/* ---------- 계정 카드 ---------- */
let AF={cat:'',theme:'',target:'',region:'',sort:'followers',q:''};
VIEWS.accs=()=>{const A=D.acc||[];
 tools('<select id="afd"><option value="">전체 분야</option><option>투자</option><option>AI·창업</option><option>기타</option></select><select id="af"><option value="">전체 형식</option>'+['인스타툰','카드뉴스','한장형','릴스','기타'].map(x=>'<option value="'+x+'">'+catL(x)+'</option>').join('')+'</select><select id="at"><option value="">전체 주제</option>'+[...new Set(A.map(a=>a.themeG).filter(Boolean))].sort().map(x=>'<option>'+esc(x)+'</option>').join('')+'</select><select id="ag"><option value="">전체 타깃</option>'+[...new Set(A.flatMap(a=>a.targets||[]))].sort().map(x=>'<option>'+esc(x)+'</option>').join('')+'</select><select id="ar"><option value="">전 지역</option>'+Object.entries(REG).map(([a,b])=>'<option value="'+a+'">'+b+'</option>').join('')+'</select><span class="lab">정렬</span><select id="as"><option value="followers">팔로워</option><option value="er">좋아요/팔로워</option><option value="avgL">평균 좋아요</option><option value="avgV">평균 조회(추정)</option><option value="avgC">평균 댓글</option><option value="postsN">게시물 수</option><option value="h">이름</option></select><input type="search" id="aq" placeholder="계정·주제 검색" size="14"><span id="acnt" class="lab"></span>');
 ['#afd','#af','#at','#ag','#ar','#as'].forEach(s=>$(s).onchange=renderAccs);$('#aq').oninput=renderAccs;$('#view').innerHTML='<div id="acl" class="grid g4"></div>';renderAccs()};
function aVal(a,k){if(k==='avgV'){const ps=byAcc[a.h]||[];return ps.length?ps.reduce((t,p)=>t+p.ev,0)/ps.length:-1}if(k==='avgC')return a.stats?.avgC??-1;if(k==='er')return a.stats?.er??-1;if(k==='avgL')return a.stats?.avgL??-1;if(k==='h')return a.h;return a[k]??-1}
function accCard(a){const th=(a.top||[]).slice(0,3).map(sc=>{const p=D.postBy[a.h+'/'+sc];return p?'<img loading="lazy" src="'+p.img+'">':''}).join('');
 return '<div class="ac-card t-'+(CATC[a.cat]||'wine')+'" data-h="'+esc(a.h)+'"><img class="pf" loading="lazy" src="'+(a.pf||'')+'" onerror="this.style.visibility=\'hidden\'"><div style="min-width:0;flex:1"><div class="nm">@'+esc(a.h)+' <span class="muted small">'+esc(a.name||'')+'</span></div>'+
 '<div class="st"><span class="fol">팔로워 <b>'+fmtN(a.followers)+'</b></span> · 게시물 '+fmtN(a.postsN)+(a.stats&&a.stats.avgL!=null?' · 평균♥ <b>'+fmtN(Math.round(a.stats.avgL))+'</b> · <span title="평균 좋아요/팔로워">'+pct(a.stats.er)+'</span>':'')+'</div>'+
 '<div><span class="chip c-'+(CATC[a.cat]||'wine')+'">'+esc(catL(a.cat))+'</span><span class="chip">'+(REG[a.region]||'')+'</span>'+(a.themeG?'<span class="chip c-yellow">'+esc(a.themeG)+'</span>':'')+(a.targets||[]).map(t=>'<span class="chip c-green">'+esc(t)+'</span>').join('')+'</div>'+
 '<div class="pt tp">'+esc(a.topic||'')+'</div>'+(a.note?'<div class="note">⚠ '+esc(a.note)+'</div>':'')+'<div class="ths">'+th+'</div></div></div>'}
function renderAccs(){let A=(D.acc||[]).filter(a=>(!$('#af').value||a.cat===$('#af').value)&&(!$('#afd').value||a.field===$('#afd').value)&&(!$('#at').value||a.themeG===$('#at').value)&&(!$('#ag').value||(a.targets||[]).includes($('#ag').value))&&(!$('#ar').value||a.region===$('#ar').value));
 const q=$('#aq').value.trim().toLowerCase();if(q)A=A.filter(a=>(a.h+' '+a.name+' '+a.topic+' '+(a.bio||'')).toLowerCase().includes(q));
 const k=$('#as').value;A.sort((x,y)=>{const a=aVal(x,k),b=aVal(y,k);return k==='h'?(a<b?-1:1):(b>a?1:b<a?-1:0)});
 $('#acnt').textContent=A.length+'개';$('#acl').innerHTML=A.map(accCard).join('');$$('#acl .ac-card').forEach(e=>e.onclick=()=>location.hash='acc:'+encodeURIComponent(e.dataset.h))}
async function openAcc(h){const a=D.accBy[h];if(!a)return;if(!(window.ACC_MD&&ACC_MD[h]))await loadScript('data/acc/'+encodeURIComponent(h)+'.js');
 const posts=(D.posts||[]).filter(p=>p.a===h).sort((x,y)=>(y.l??-1)-(x.l??-1));const s=a.stats||{};
 const kv=(k,v)=>'<div class="kpi t-navy"><div class="v" style="font-size:16px">'+v+'</div><div class="k">'+k+'</div></div>';
 let html='<button class="x" onclick="backAcc()">✕ 닫기</button><div style="display:flex;gap:10px;align-items:center;margin-bottom:6px"><img src="'+(a.pf||'')+'" style="width:64px;height:64px;border-radius:50%;object-fit:cover"><div><div style="font-size:17px;font-weight:900">@'+esc(h)+' <span class="muted" style="font-size:13px">'+esc(a.name||'')+'</span> <a href="https://www.instagram.com/'+esc(h)+'/" target="_blank">인스타 열기↗</a></div>'+
 '<div><span class="chip c-'+(CATC[a.cat]||'wine')+'">'+esc(catL(a.cat))+'</span><span class="chip">'+(REG[a.region]||'')+'</span>'+(a.themeG?'<span class="chip c-yellow">'+esc(a.themeG)+'</span>':'')+(a.targets||[]).map(t=>'<span class="chip c-green">'+esc(t)+'</span>').join('')+'</div><div class="small" style="white-space:pre-wrap;color:#c8d1e4">'+esc(a.bio||'')+'</div>'+(a.note?'<div class="warn">⚠ '+esc(a.note)+'</div>':'')+'</div></div>';
 html+='<div class="grid g6" style="margin-bottom:6px">'+kv('팔로워 (ego 실측)',fmtN(a.followers))+kv('게시물 수',fmtN(a.postsN))+kv('최근 '+(s.n||0)+'개 평균 좋아요',s.avgL==null?'~'+fmtN(Math.round((byAcc[h]||[]).reduce((t,p)=>t+p.el,0)/Math.max(1,(byAcc[h]||[]).length)))+' (추정)':fmtN(Math.round(s.avgL)))+kv('평균 좋아요/팔로워',s.er==null?(a.followers?'~'+pct((byAcc[h]||[]).reduce((t,p)=>t+p.el,0)/Math.max(1,(byAcc[h]||[]).length)/a.followers):'-'):pct(s.er))+kv('평균 댓글',s.avgC==null?'-':fmtN(Math.round(s.avgC)))+kv('형식 비율 (슬라이드/영상/단일)',(s.mix||'-'))+'</div>';
 html+='<div class="grid g2"><div class="sec t-mint"><h2>🧠 공통기억 분석 <small>accounts/ 원문 · 수치 검증 안 됨</small></h2><div><b>주제:</b> '+hl(a.topic||'')+'</div>'+(a.mem?.point?.length?'<div><b>벤치마킹 포인트:</b> '+a.mem.point.map(hl).join(' / ')+'</div>':'')+(a.mem?.nums?.length?'<div class="note">기록 수치: '+a.mem.nums.map(hl).join(' / ')+'</div>':'')+'</div>'+
 '<div class="sec t-blue"><h2>🔎 최근 게시물 분석 <small>ego 수집 '+esc(a.fetched||'')+' 기준 자동 요약</small></h2>'+(a.ai?'<div class="sum">'+hl(a.ai)+'</div>':'')+(a.kw?.length?'<div>'+a.kw.map(w=>'<span class="chip c-purple">'+esc(w)+'</span>').join('')+'</div>':'')+(s.cad?'<div class="note">업로드 간격 중앙값 약 <b class="n">'+s.cad+'일</b> · 최근 게시 '+esc(s.last||'')+'</div>':'')+'</div></div>';
 html+='<div class="sec t-navy"><h2>🖼 최근 게시물 (좋아요순) <small>클릭하면 인스타 원본</small></h2><div class="grid" style="grid-template-columns:repeat(6,minmax(0,1fr))">'+posts.map(p=>{const u='https://www.instagram.com/'+(p.k==='reel'?'reel':'p')+'/'+p.sc+'/';return '<div class="pc open"><a class="th" href="'+u+'" target="_blank"><img loading="lazy" src="'+p.img+'"></a><div class="b"><div class="m">'+(p.v!=null?'<span class="vw">▶'+fmtN(p.v)+'</span>':'')+'<span class="lk">♥'+(p.l==null?'숨김':fmtN(p.l))+'</span><span class="cm">💬'+fmtN(p.c)+'</span><span class="muted">'+esc(p.d||'')+'</span></div><div class="cap" style="max-height:120px">'+(p.orig?'<span class="pill">🇰🇷 번역</span> ':'')+esc(p.cap||'')+(p.orig?'<details class="orig"><summary>원문</summary><div>'+esc(p.orig)+'</div></details>':'')+'</div></div></div>'}).join('')+'</div></div>';
 html+='<details class="blk" open><summary>📄 공통기억 원문 분석 (accounts/'+esc((a.mem?.files||[]).join(', '))+')</summary><div class="md" style="padding:6px 9px;max-height:none">'+md((window.ACC_MD||{})[h]||'(원문 없음)')+'</div></details>';
 modal(html)}
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#mod').classList.contains('on'))backAcc()});
/* ---------- 비교 ---------- */
let CMP={by:'themeG',sort:'followers'};
VIEWS.cmp=(k)=>{const cats=k==='cmp_toon'?['인스타툰']:['카드뉴스','한장형'];
 tools('<span class="lab">묶기</span><button data-by="themeG">주제별</button><button data-by="target">타깃별</button><button data-by="region">지역별</button><button data-by="">묶지 않기</button><span class="lab">정렬</span><select id="cs"><option value="followers">팔로워</option><option value="er">좋아요/팔로워</option><option value="avgL">평균 좋아요</option><option value="avgC">평균 댓글</option><option value="postsN">게시물</option></select>');
 const r=()=>renderCmp(cats);$$('#tools button[data-by]').forEach(b=>{b.classList.toggle('on',b.dataset.by===CMP.by);b.onclick=()=>{CMP.by=b.dataset.by;$$('#tools button[data-by]').forEach(x=>x.classList.toggle('on',x===b));r()}});$('#cs').value=CMP.sort;$('#cs').onchange=e=>{CMP.sort=e.target.value;r()};r()};
function renderCmp(cats){const A=(D.acc||[]).filter(a=>cats.includes(a.cat));const mxF=Math.max(...A.map(a=>a.followers||0)),mxE=Math.max(...A.map(a=>a.stats?.er||0));
 const groups={};A.forEach(a=>{const ks=CMP.by==='target'?(a.targets?.length?a.targets:['기타']):[CMP.by?(CMP.by==='region'?REG[a.region]:a[CMP.by])||'기타':'전체'];ks.forEach(g=>(groups[g]=groups[g]||[]).push(a))});
 const sv=a=>CMP.sort==='followers'?a.followers||0:CMP.sort==='postsN'?a.postsN||0:(a.stats?.[CMP.sort]??-1);
 const cols=['mint','blue','purple','orange','green','wine','yellow','navy'];
 const gcol={};Object.keys(groups).forEach((g,i)=>gcol[g]=['#3ee6c4','#6aa8ff','#b892ff','#ffa04d','#5fe08a','#ff6f9e','#ffd84d','#8ab4ff'][i%8]);
 const allS=[...A].sort((x,y)=>sv(y)-sv(x));const mxS=Math.max(...allS.map(sv),1e-9);const gOf=a=>CMP.by==='target'?(a.targets||['기타'])[0]:CMP.by?(CMP.by==='region'?REG[a.region]:a[CMP.by])||'기타':'전체';
 let h='<div class="note">팔로워·게시물·좋아요·댓글 = ego 실측(최근 공개 게시물 최대 12개, 고정 게시물 포함, 좋아요 숨김 게시물 제외). 공통기억 수치(매출 등)는 <mark class="p">검증 안 됨</mark>.</div>';
 h+='<div class="sec t-navy"><h2>📊 전체 순위 — '+esc($('#cs').selectedOptions[0].text)+' <small>막대 색 = 묶음</small> '+Object.keys(groups).map(g=>'<span class="chip" style="border-color:'+gcol[g]+';color:'+gcol[g]+'">'+esc(g)+'</span>').join('')+'</h2><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 14px">'+allS.map((a,i)=>{const v=sv(a);return '<div style="display:flex;gap:6px;align-items:center;font-size:11.5px;border-bottom:1px solid #ffffff0d"><span class="muted" style="width:18px;text-align:right">'+(i+1)+'</span><a style="width:130px;flex:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" href="#acc:'+encodeURIComponent(a.h)+'">@'+esc(a.h)+'</a><div class="bar" style="flex:1"><i style="width:'+(Math.max(v,0)/mxS*100)+'%;background:'+gcol[gOf(a)]+'"></i></div><b class="n" style="width:56px;text-align:right">'+(CMP.sort==='er'?pct(v<0?null:v):v<0?'숨김':fmtN(Math.round(v)))+'</b></div>'}).join('')+'</div></div><div class="grid g2">';
 Object.entries(groups).sort((a,b)=>b[1].reduce((s,x)=>s+(x.followers||0),0)-a[1].reduce((s,x)=>s+(x.followers||0),0)).forEach(([g,arr],gi)=>{arr.sort((x,y)=>sv(y)-sv(x));
  const tot=arr.reduce((s,x)=>s+(x.followers||0),0);
  h+='<div class="sec t-'+cols[gi%cols.length]+'"><h2>'+esc(g)+' <small>'+arr.length+'개 · 팔로워 합 '+fmtN(tot)+'</small></h2><table class="t"><tr><th>계정</th><th>팔로워</th><th class="r">게시물</th><th class="r">평균♥</th><th class="r">평균💬</th><th>♥/팔로워</th><th>수익구조·포인트 (공통기억)</th></tr>'+
  arr.map(a=>{const s=a.stats||{};return '<tr><td class="nowrap"><a href="#acc:'+encodeURIComponent(a.h)+'"><img src="'+(a.pf||'')+'" style="width:18px;height:18px;border-radius:50%;vertical-align:middle;object-fit:cover"> @'+esc(a.h)+'</a><div class="muted small">'+esc(a.name||'')+'</div></td><td style="min-width:110px"><div class="bar"><i style="width:'+((a.followers||0)/mxF*100)+'%;background:#3ee6c4"></i></div><b class="n">'+fmtN(a.followers)+'</b></td><td class="r">'+fmtN(a.postsN)+'</td><td class="r">'+(s.avgL==null?'숨김':fmtN(Math.round(s.avgL)))+'</td><td class="r">'+(s.avgC==null?'-':fmtN(Math.round(s.avgC)))+'</td><td style="min-width:80px"><div class="bar"><i style="width:'+((s.er||0)/mxE*100)+'%;background:#ffd84d"></i></div>'+pct(s.er)+'</td><td class="small"><div class="pt2" title="'+esc((a.mem?.point||[]).join(' / ')||a.topic||'')+'">'+hl((a.mem?.point||[]).join(' / ')||a.topic||'')+'</div></td></tr>'}).join('')+'</table></div>'});
 $('#view').innerHTML=h+'</div>'}
/* ---------- 묶음 ---------- */
VIEWS.grp=(k)=>{const by=k==='grp_theme'?'themeG':'target';const A=(D.acc||[]).filter(a=>['인스타툰','카드뉴스','한장형'].includes(a.cat));const groups={};
 A.forEach(a=>{const ks=by==='target'?(a.targets?.length?a.targets:['기타']):[a.themeG||'기타'];ks.forEach(g=>(groups[g]=groups[g]||[]).push(a))});
 tools('<span class="lab">인스타툰·카드뉴스·한장형만 (릴스·브랜드 광고 계정 제외) · 카드 클릭 → 계정 상세</span>');const cols=['mint','blue','purple','orange','green','wine','yellow','navy'];
 $('#view').innerHTML=Object.entries(groups).sort((a,b)=>b[1].length-a[1].length).map(([g,arr],i)=>'<div class="sec t-'+cols[i%8]+'"><h2>'+esc(g)+' <small>'+arr.length+'개 계정 · 팔로워 합 '+fmtN(arr.reduce((s,x)=>s+(x.followers||0),0))+'</small></h2><div class="grid g4">'+arr.sort((x,y)=>(y.followers||0)-(x.followers||0)).map(accCard).join('')+'</div></div>').join('');
 $$('.ac-card').forEach(e=>e.onclick=()=>location.hash='acc:'+encodeURIComponent(e.dataset.h))};
/* ---------- SNS 팩 ---------- */
const PACKMAP={p_toon_an:['2.','mint'],p_toon_mk:['3.','green'],p_card:['4.','blue'],p_reels:['5.','orange'],p_thread:['1-B.','purple'],p_side:['7.','yellow'],p_ebook:['7-B.','wine'],p_wadiz:['8.','wine'],p_ops:['0.','navy'],p_yt:['6.','blue'],p_accs:['1.','mint']};
function convCard(c,col,open){const f=c.fields||{};
 const L=(t,arr,cl)=>arr&&arr.length?'<div class="lst t-'+cl+(arr.length>6?' more':'')+'"><h4>'+t+' <span class="muted">'+arr.length+'</span></h4><ul>'+arr.map(x=>'<li>'+(t.includes('결정')?'<mark class="g">'+hl(x)+'</mark>':hl(x))+'</li>').join('')+'</ul>'+(arr.length>6?'<span class="mb" onclick="this.parentNode.classList.toggle(\'more\');this.textContent=this.parentNode.classList.contains(\'more\')?\'▾ 더보기\':\'▴ 접기\'">▾ 더보기</span>':'')+'</div>':'';
 return '<div class="cv'+(open?'':' fold')+'"><div class="hd t-'+col+'" onclick="this.parentNode.classList.toggle(\'fold\')"><span class="st">'+'★'.repeat(c.stars)+'</span><span>'+esc(c.title)+'</span><span class="muted small" style="margin-left:auto">📌'+c.blocks.length+' · 규칙'+((f.규칙||[]).length)+' · 결정'+((f.결정||[]).length)+' ▾</span></div><div class="bd">'+
 (f.요약?'<div class="sum">'+f.요약.map(hl).join('<br>')+'</div>':'')+
 '<div class="cols3">'+L('📏 규칙',f.규칙,'mint')+L('✅ 결정',f.결정,'blue')+L('💜 선호',f.선호,'purple')+'</div>'+
 c.blocks.map(b=>'<details class="blk"><summary>📌 '+esc(b.t)+copyBtn('')+'</summary><pre>'+fmtPre(b.code)+'</pre></details>').join('')+
 (f['확인 필요']?'<div class="warn">⚠ 확인 필요: '+f['확인 필요'].map(hl).join(' / ')+'</div>':'')+
 (f.링크?'<div class="note">🔗 '+f.링크.join(' ').replace(/\[(\d+)\]\((https?:[^)]+)\)/g,(m,n,u)=>'<a href="'+esc(u)+'" target="_blank">['+n+']</a>')+'</div>':'')+
 (f.캡처?'<div class="note">🖼 '+esc(f.캡처.join(' ').replace(/^- 🖼 /,''))+' (로컬 공통기억 VIEW/media — 공개 저장소에는 미포함)</div>':'')+
 (f.원문?'<div class="note">원문: '+esc(f.원문.join(' '))+'</div>':'')+(c.extra?'<details class="blk"><summary>기타 원문</summary><div class="md" style="padding:6px">'+md(c.extra)+'</div></details>':'')+'</div></div>'}
function viewPack(k){const [pre,col]=PACKMAP[k];const S=(D.pack||[]).find(s=>s.title.startsWith(pre+' '));if(!S){$('#view').innerHTML='없음';return}
 tools('<button id="pall">모두 펼치기</button><button id="pnone">모두 접기</button><input type="search" id="pq" placeholder="이 섹션 검색" size="16"><span class="lab">'+esc(S.title)+'</span>');
 let h=S.intro?'<div class="sec t-'+col+'"><div class="md">'+md(S.intro)+'</div></div>':'';
 h+=S.convs.map((c,i)=>convCard(c,col,i<2)).join('');$('#view').innerHTML=h;
 $('#pall').onclick=()=>$$('.cv').forEach(c=>c.classList.remove('fold'));$('#pnone').onclick=()=>$$('.cv').forEach(c=>c.classList.add('fold'));
 $('#pq').oninput=e=>{const q=e.target.value.trim().toLowerCase();$$('.cv').forEach(c=>{const m=!q||c.innerText.toLowerCase().includes(q);c.classList.toggle('hide',!m);if(q&&m)c.classList.remove('fold')})}}
/* ---------- 프롬프트 전체 ---------- */
VIEWS.prompts=()=>{const all=[];(D.pack||[]).forEach(s=>s.convs.forEach(c=>c.blocks.forEach(b=>all.push({s:s.title,c:c.title,b}))));
 tools('<input type="search" id="pq" placeholder="프롬프트·카피 검색" size="20"><select id="ps"><option value="">전체 섹션</option>'+(D.pack||[]).filter(s=>s.convs.length).map(s=>'<option>'+esc(s.title)+'</option>').join('')+'</select><span id="pcnt" class="lab"></span>');
 const r=()=>{const q=$('#pq').value.trim().toLowerCase(),ss=$('#ps').value;const f=all.filter(x=>(!ss||x.s===ss)&&(!q||(x.b.t+' '+x.b.code+' '+x.c).toLowerCase().includes(q)));$('#pcnt').textContent=f.length+'개';
  $('#view').innerHTML='<div class="grid g2">'+f.map(x=>'<details class="blk"><summary>📌 '+esc(x.b.t)+' <span class="muted small">'+esc(x.s.replace(/\(.*\)/,''))+' › '+esc(x.c.slice(0,30))+'</span>'+copyBtn('')+'</summary><pre>'+fmtPre(x.b.code)+'</pre></details>').join('')+'</div>'};
 $('#pq').oninput=r;$('#ps').onchange=r;r()};
/* ---------- 30일 캘린더 ---------- */
VIEWS.plan30=()=>{const P=D.plan30;if(!P){$('#view').innerHTML='데이터 없음';return}
 const wc=['blue','green','orange','purple','wine'];const wcol=['#6aa8ff','#5fe08a','#ffa04d','#b892ff','#ff6f9e'];
 let h='<div class="grid g3"><div class="sec t-yellow"><h2>⚠️ 수정금지 30일 규격 플랜 <small>MVP 체험 → 유료 전환 고객 선별</small></h2>'+P.rules.map(r=>'<div>• '+hl(r)+'</div>').join('')+'</div>';
 h+='<div class="sec t-navy"><h2>📊 주차별 콘텐츠 비율</h2>'+P.weeks.map((w,i)=>'<div style="margin:3px 0"><b style="color:'+wcol[i]+'">'+w.w+'</b> <span class="small">'+esc(w.goal)+'</span><div class="stack">'+[['성장',w.r[0],'#3ee6c4'],['신뢰',w.r[1],'#6aa8ff'],['전환',w.r[2],'#ffd84d'],['피드백',w.r[3],'#ff6f9e']].map(x=>'<i style="width:'+x[1]+'%;background:'+x[2]+'">'+x[0]+' '+x[1]+'</i>').join('')+'</div></div>').join('')+'<div class="note">30일 전체: 성장 45 / 신뢰 25 / 전환 20 / 피드백 10 (GPT 제안, 근거 미검증)</div></div>';
 h+='<div class="sec t-mint"><h2>📮 하루 기본 발행량</h2>'+P.daily.map(x=>'<span class="chip c-mint">'+esc(x)+'</span>').join('')+'<div class="note" style="margin-top:4px">하루 1개 주제 → 짧은 글 4개 → 카드뉴스 1개 → 긴 글 1개(또는 예약)</div></div></div>';
 h+='<div class="sec t-navy"><h2>📅 Day 1~30 캘린더 <small>칸 클릭 → 그날 프롬프트 복사</small></h2><div class="cal">'+['1','2','3','4','5','6','7'].map(d=>'<div class="dh">'+d+'일차</div>').join('');
 for(let d=1;d<=30;d++){const x=P.days.find(y=>y.d===d)||{};const w=Math.min(4,Math.floor((d-1)/7));const st=P.steps.filter(s=>d>=s.a&&d<=s.b).map(s=>s.n);
  h+='<div class="day t-'+wc[w]+'" data-d="'+d+'"><span class="dn">Day '+d+'</span><span class="ph">'+st.map(n=>'<span class="pill">'+n+'</span>').join(' ')+'</span><div class="tp">'+esc(x.title||'')+'</div><div class="sb">'+esc(x.topic||'')+'</div></div>'}
 h+='<div class="day t-wine" data-d="M2"><span class="dn">2개월차</span><div class="tp">이긴 콘텐츠 복제</div><div class="sb">잘 된 주제만 반복·변형, 반응 없는 플랫폼 축소</div></div></div><div class="note">원문: 02_normalized/…6a1a8902 (2026-06-03 대화) Day 1~30 · pill 숫자 = 그날 걸친 10단계 실행표 단계 · 색 = 주차.</div></div>';
 h+='<div class="grid g2"><div class="sec t-blue"><h2>🪜 10단계 실행표 <small>표 하나만 (사용자 지정)</small></h2><table class="t"><tr><th>단계</th><th>기간</th><th>할 일</th><th>핵심 포인트</th><th>성공 기준</th></tr>'+P.steps.map(s=>'<tr><td class="nowrap"><b>'+s.n+'단계</b></td><td class="nowrap">'+esc(s.p)+'</td><td>'+hl(s.todo)+'</td><td class="small">'+hl(s.pt)+'</td><td class="small"><mark class="g">'+hl(s.ok)+'</mark></td></tr>').join('')+'</table></div>';
 h+='<div class="sec t-purple"><h2>📐 플랫폼별 글 규격표 <small>사용자 원문</small></h2><table class="t"><tr><th>플랫폼</th><th>최대</th><th>인기 권장 길이</th><th>이미지</th></tr>'+P.spec.map(r=>'<tr>'+r.map((c,i)=>'<td'+(i==0?' class="nowrap"':'')+'>'+(i==0?'<b>'+esc(c)+'</b>':hl(c))+'</td>').join('')+'</tr>').join('')+'</table><h2 style="margin-top:6px">🗣 플랫폼별 말투·발행 수</h2><table class="t"><tr><th>플랫폼</th><th>역할</th><th>말투</th><th>발행</th></tr>'+P.tone.map(r=>'<tr>'+r.map((c,i)=>'<td'+(i==0?' class="nowrap"':'')+'>'+(i==0?'<b>'+esc(c)+'</b>':hl(c))+'</td>').join('')+'</tr>').join('')+'</table></div></div>';
 $('#view').innerHTML=h;
 $$('.day').forEach(e=>e.onclick=()=>{const d=+e.dataset.d;const x=P.days.find(y=>y.d===d);if(!x){return}modal('<button class="x" onclick="closeMod()">✕</button><h2 style="margin:0 0 4px">Day '+d+' — '+esc(x.title)+'</h2><div class="sum"><b>주제:</b> '+hl(x.topic)+'</div><details class="blk" open><summary>📌 프롬프트'+copyBtn('')+'</summary><pre>'+fmtPre(x.prompt)+'</pre></details>')})};
/* ---------- 혜민 ---------- */
VIEWS.hm=()=>{const H=D.hm;let h='<div class="note">출처: 공통기억 STRATEGY_혜민_투자인스타 + PACK_06 §7 (2026-10-17~20 대화 28개 메시지). 점수·매출은 <mark class="p">기획용 가정값, 실적 아님</mark>. 법률 내용은 과거 기획상 주의사항 — 출시 전 별도 확인.</div>';
 h+='<div class="sec t-orange"><h2>🔁 수익 퍼널</h2><div class="flow">'+H.funnel.map((x,i)=>(i?'<span class="ar">→</span>':'')+'<div class="st t-'+['blue','mint','green','yellow','orange','wine','purple','navy'][i%8]+'"><b>'+(i+1)+'. '+esc(x[0])+'</b><span>'+esc(x[1])+'</span></div>').join('')+'</div></div>';
 h+='<div class="grid g3"><div class="sec t-navy"><h2>🎭 포맷별 역할</h2><div class="grid g2">'+H.roles.map((x,i)=>'<div class="kpi t-'+['blue','orange','mint','purple','wine','green'][i]+'"><div style="font-weight:900;color:#fff">'+esc(x[0])+'</div><div class="k">'+hl(x[1])+'</div></div>').join('')+'</div><div class="note">하루 7개 = 독립 주제 7개가 아니라 <mark>핵심 주제 1~2개의 매체별 변환 슬롯</mark>. 초반엔 일부만 시험 → 실측으로 확대.</div></div>';
 h+='<div class="sec t-blue"><h2>🏅 5개 계정 수익성 (기획 점수)</h2>'+bars(H.acc5,a=>a[2],a=>'<b>'+esc(a[0])+'</b> <span class="muted small">'+esc(a[1])+'</span>','#6aa8ff',v=>v+'점')+'<div class="note">가중치: '+H.weights.map(w=>esc(w[0])+' <b class="n">'+w[1]+'</b>').join(' · ')+'</div><div class="note"><mark class="g">결정</mark>: 처음엔 주식 전문가 + ETF 동행형 2개부터, 검증형 계정은 1개만 · 나머지는 편안한 생활금융 브랜드</div></div>';
 h+='<div class="sec t-green"><h2>💵 상품 순위 (월 기여액 가정)</h2>'+bars(H.products,a=>a[3],a=>esc(a[0])+' <span class="muted small">'+esc(a[1])+' × '+esc(a[2])+'</span>','#5fe08a',v=>v+'만')+'<div class="note">모두 가정값. 유료 리딩·1:1 종목상담은 등록·신고 검토 전 판매 제외.</div></div></div>';
 h+='<div class="grid g3"><div class="sec t-purple"><h2>🌍 세계관 「숫자로 지키는 사람들」</h2><table class="t"><tr><th>계정</th><th>무대</th><th>역할</th><th>첫 무료 → 첫 유료</th></tr>'+H.world.map(r=>'<tr><td class="nowrap"><b>'+esc(r[0])+'</b></td><td>'+esc(r[1])+'</td><td>'+esc(r[2])+'</td><td class="small">'+hl(r[3])+'</td></tr>').join('')+'</table></div>';
 h+='<div class="sec t-yellow"><h2>⏰ 데일리 시황 리포트 타임라인 <small>카페 구조 벤치마킹</small></h2><table class="t">'+H.daily.map(r=>'<tr><td class="nowrap"><b class="n">'+r[0]+'</b></td><td class="muted small">'+esc(r[1])+'</td><td>→ '+esc(r[2])+'</td></tr>').join('')+'</table></div>';
 h+='<div class="sec t-wine"><h2>🔴 법적 경계</h2><table class="t">'+H.legal.map(r=>'<tr><td>'+esc(r[0])+'</td><td class="small">'+(/규제|위험|검토/.test(r[1])?'<mark class="p">'+esc(r[1])+'</mark>':esc(r[1]))+'</td></tr>').join('')+'</table></div></div>';
 h+='<div class="grid g3"><div class="sec t-mint"><h2>🧪 첫 30일 검증</h2>'+H.first30.map((r,i)=>'<div class="kpi t-'+['blue','green','orange','purple'][i]+'" style="margin-bottom:3px"><b class="n">'+esc(r[0])+'</b> <b>'+esc(r[1])+'</b><div class="k">확인: '+esc(r[2])+'</div></div>').join('')+'</div>';
 h+='<div class="sec t-navy"><h2>📏 KPI (조회수 하나가 아님)</h2><table class="t"><tr><th>KPI</th><th>계산</th><th>목적</th></tr>'+H.kpi.map(r=>'<tr><td class="nowrap"><b>'+esc(r[0])+'</b></td><td class="small">'+esc(r[1])+'</td><td class="small">'+esc(r[2])+'</td></tr>').join('')+'</table></div>';
 h+='<div class="sec t-orange"><h2>🗂 기획 시트 15탭 · 주제 예시</h2>'+H.tabs.map(t=>'<span class="chip c-orange">'+esc(t)+'</span>').join('')+'<div style="margin-top:5px">'+H.topics.map(t=>'<span class="chip c-yellow">'+esc(t)+'</span>').join('')+'</div><div class="note">과거 GPT가 "시트 15탭 반영 완료"라고 했으나 외부 시트 미검증 · 5개월/150일·1,050 슬롯은 계획값.</div></div></div>';
 h+='<div class="sec t-blue"><h2>🎬 계정별 4~6화 이어가기</h2><table class="t"><tr><th>계정</th><th>4화</th><th>5화</th><th>6화</th></tr>'+H.eps.map(r=>'<tr>'+r.map((c,i)=>'<td'+(i?'':' class="nowrap"')+'>'+(i?esc(c):'<b>'+esc(c)+'</b>')+'</td>').join('')+'</tr>').join('')+'</table></div>';
 h+=H.prompts.map(p=>'<details class="blk"><summary>📋 '+esc(p[0])+copyBtn('')+'</summary><pre>'+fmtPre(p[1])+'</pre></details>').join('');
 $('#view').innerHTML=h};
VIEWS.hm_week=()=>{const H=D.hm;const days=['월','화','수','목','금','토','일'];
 let h='<div class="sec t-orange"><h2>📅 주간 7슬롯 기획판 <small>하루 7개 = 핵심 주제 1~2개의 매체별 변환 · 빈칸 템플릿</small></h2><div class="note">아래 명령을 복사해 Hermes/Claude에 붙이면 이 표를 채운 다음 주 계획을 받습니다.</div><div class="cmd copyhost"><span class="w">다음 주 7개 기획</span><code>'+esc(H.weekCmd)+'</code>'+copyBtn(H.weekCmd)+'</div></div>';
 h+='<div class="sec t-navy" style="overflow:auto"><table class="t"><tr><th>슬롯</th><th>역할</th>'+days.map(d=>'<th>'+d+'</th>').join('')+'</tr>'+H.slots.map((s,i)=>'<tr><td class="nowrap"><span class="chip c-'+['blue','orange','mint','purple','green','wine','yellow'][i]+'">'+esc(s[0])+'</span></td><td class="small">'+esc(s[1])+'</td>'+days.map((d,j)=>'<td class="small muted">'+esc((H.sample[j]||{})[i]||'')+'</td>').join('')+'</tr>').join('')+'</table><div class="note">회색 글씨 = 공통기억 주제 예시로 채운 샘플 (증권계좌 보안·사칭 문자·부모님 스마트폰 금융설정·고배당 함정·월배당 vs 총수익률·ETF 입문·고정비 점검).</div></div>';
 $('#view').innerHTML=h};
/* ---------- 시작 ---------- */
D.postBy={};(D.posts||[]).forEach(p=>D.postBy[p.a+'/'+p.sc]=p);
buildSide();window.addEventListener('hashchange',route);
$('#mb').onclick=()=>document.body.classList.toggle(innerWidth<700?'open':'unpin');
$('#mod').onclick=e=>{if(e.target.id==='mod')backAcc()};

/* =================== v2 =================== */
const SHORT={'인스타툰':'툰'};function catL(c){return SHORT[c]||c}
function sd(d){const m=(d||'').match(/^(\d{4})-(\d{2})-(\d{2})/);return m?m[1].slice(2)+'.'+(+m[2])+'.'+(+m[3]):(d||'')}
const INV=['경제·재테크','주식·ETF','시사·경제뉴스','생활금융·절약','부동산'];
(D.acc||[]).forEach(a=>{a.field=a.themeG==='AI·창업·크리에이터'||(/AI|GPT|인공지능/.test(a.topic||'')&&!INV.includes(a.themeG))?'AI·창업':INV.includes(a.themeG)?'투자':'기타'});
const byAcc={};(D.posts||[]).forEach(p=>(byAcc[p.a]=byAcc[p.a]||[]).push(p));
/* ---- 추정 모델 ---- */
function med(a){a=a.filter(x=>x!=null&&isFinite(x)).sort((x,y)=>x-y);return a.length?a[a.length>>1]:null}
(function estimate(){const catR={},catE={},accR={};
 Object.entries(byAcc).forEach(([h,ps])=>{const a=D.accBy[h]||{};const r=med(ps.filter(p=>p.l>0&&p.c>0).map(p=>p.l/p.c));if(r){accR[h]=ps.filter(p=>p.l>0&&p.c>0).length>=2?r:null;(catR[a.cat]=catR[a.cat]||[]).push(r)}
  const e=med(ps.filter(p=>p.l>0&&a.followers).map(p=>p.l/a.followers));if(e)(catE[a.cat]=catE[a.cat]||[]).push(e)});
 const gR=med(Object.values(catR).flat())||15,gE=med(Object.values(catE).flat())||.01;
 const RATE={vid:.035,car:.04,img:.045};
 (D.posts||[]).forEach(p=>{const a=D.accBy[p.a]||{};
  if(p.l>0){p.el=p.l;p.eL=false}else{const r=accR[p.a]||med(catR[a.cat]||[])||gR;const e=med(catE[a.cat]||[])||gE;p.el=Math.round(p.c>0?p.c*r:(a.followers||0)*e);p.eL=true}
  if(p.v>0){p.ev=p.v;p.eV=false}else{p.ev=Math.round(p.el/RATE[p.t||'img']);p.eV=true}
  p.es=Math.round(p.ev*(p.t==='vid'?.006:.005))}) })();
const EST_NOTE='~ = 추정값. 인스타는 조회·공유 수를 공개하지 않아 계산: 조회≈좋아요÷(릴스 3.5%·슬라이드 4%·단일 4.5%), 숨김 좋아요≈댓글×계정 평균 좋아요/댓글 비(없으면 팔로워×분류 중앙값), 공유≈조회×0.5~0.6%. 릴스 실조회·공개 좋아요·댓글은 실측.';
const SORTS={ev:'조회수(추정)',el:'좋아요',c:'댓글',es:'공유(추정)',d:'최신순',er:'좋아요/팔로워',f:'계정 팔로워'};
function pv(p,k){const a=D.accBy[p.a]||{};if(k==='er')return a.followers?p.el/a.followers:-1;if(k==='f')return a.followers||0;if(k==='d')return p.d||'';return p[k]==null?-1:p[k]}
function sortPosts(arr,k,desc){return [...arr].sort((x,y)=>{const A=pv(x,k),B=pv(y,k);const c=A<B?-1:A>B?1:0;return desc?-c:c})}
function mline(p){const f=(v,e)=>v==null?'-':(e?'~':'')+fmtN(Math.round(v));
 return '<span class="mv mv-ev" title="조회수'+(p.eV?' (추정)':' (실측)')+'">▶'+f(p.ev,p.eV)+'</span><span class="mv mv-el" title="좋아요'+(p.eL?' (숨김→추정)':'')+'">♥'+f(p.el,p.eL)+'</span><span class="mv mv-c" title="댓글">💬'+(p.c==null?'-':fmtN(p.c))+'</span><span class="mv mv-es" title="공유 (추정)">↗'+f(p.es,true)+'</span>'}
const LISTS={};let LC=0;function reg(arr){const id='l'+(++LC);LISTS[id]=arr;return id}
function postCard(p,i,lid){const a=D.accBy[p.a]||{};const cap=(p.orig?'<span class="pill">🇰🇷 번역</span> ':'')+esc(p.cap||'');
 return '<div class="pc"><span class="tag">'+(i+1)+'</span><span class="fmt">'+(p.t==='vid'?'🎬':p.t==='car'?'🗂':'🖼')+(p.pin?'📌':'')+'</span><div class="th" data-lid="'+lid+'" data-i="'+i+'" title="클릭: 미리보기"><img loading="lazy" src="'+p.img+'" alt=""></div><div class="b"><div class="m">'+mline(p)+'</div><div class="r1 muted small"><span class="dt">'+sd(p.d)+'</span> <span class="idn"><span class="ac" data-a="'+esc(p.a)+'">@'+esc(p.a)+'</span></span> <span class="fol">👥'+fmtN(a.followers)+'</span> <span class="tg" title="제목·설명 펼치기/접기">글▾</span></div><div class="cap">'+cap+(p.orig?'<details class="orig"><summary>원문 ('+esc(p.lang)+')</summary><div>'+esc(p.orig)+'</div></details>':'')+'</div></div></div>'}
function gallery(arr,cols,extra){const id=reg(arr);return '<div class="gg" style="grid-template-columns:repeat('+cols+',minmax(0,1fr))">'+arr.map((p,i)=>postCard(p,i,id)).join('')+'</div>'}
/* ---- 미리보기(라이트박스) ---- */
const LB={list:[],i:0};
function openLB(list,i){LB.list=list;LB.i=i;drawLB();$('#lb').classList.add('on')}
function closeLB(){$('#lb').classList.remove('on');$('#lb').innerHTML=''}
function drawLB(){const p=LB.list[LB.i];if(!p)return;const a=D.accBy[p.a]||{};const kind=p.k==='reel'?'reel':'p';const u='https://www.instagram.com/'+kind+'/'+p.sc+'/';
 $('#lb').innerHTML='<div class="lbx"><button class="lbc">✕</button><button class="lbn" data-d="-1">◀</button><div class="lbm" style="background-image:url('+p.img+')"><iframe src="'+u+'embed/" loading="lazy" allowfullscreen></iframe></div><button class="lbn" data-d="1">▶</button><div class="lbs"><div class="muted small">'+(LB.i+1)+' / '+LB.list.length+' · ← → 이동 · Esc 닫기</div><div style="font-weight:900;font-size:14px">@'+esc(p.a)+' <span class="muted">'+esc(a.name||'')+'</span></div><div class="m lbmm">'+mline(p)+'</div><div class="small muted">'+sd(p.d)+' · 팔로워 '+fmtN(a.followers)+' · <a href="'+u+'" target="_blank">인스타에서 열기↗</a></div><div class="note">'+EST_NOTE+'</div><div class="lcap">'+(p.orig?'<span class="pill">🇰🇷 번역</span> ':'')+esc(p.cap||'')+(p.orig?'<details class="orig"><summary>원문 ('+esc(p.lang)+')</summary><div>'+esc(p.orig)+'</div></details>':'')+'</div></div></div>'}
document.addEventListener('click',e=>{
 const th=e.target.closest('.th[data-lid]');if(th){e.preventDefault();openLB(LISTS[th.dataset.lid],+th.dataset.i);return}
 const tg=e.target.closest('.pc .tg');if(tg){tg.closest('.pc').classList.toggle('open');return}
 const ac=e.target.closest('.pc .ac');if(ac){if(window.curV&&curV.startsWith('b_')&&$('#ga')){$('#ga').value=ac.dataset.a;renderBoard();scrollTo(0,0)}else{closeLB();location.hash='acc:'+encodeURIComponent(ac.dataset.a)}return}
 if(e.target.closest('#lb')){const n=e.target.closest('.lbn');if(n){LB.i=(LB.i+ +n.dataset.d+LB.list.length)%LB.list.length;drawLB()}else if(e.target.closest('.lbc')||e.target.id==='lb')closeLB()}},true);
window.addEventListener('keydown',e=>{if(!$('#lb').classList.contains('on'))return;if(e.key==='Escape'){closeLB();e.stopImmediatePropagation()}else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){LB.i=(LB.i+(e.key==='ArrowRight'?1:-1)+LB.list.length)%LB.list.length;drawLB()}},true);
/* ---- 강조 (노랑 숫자 · 빨강 위험/핵심 · 시안 키워드) ---- */
const RED=/(금지|절대|하지 않|못 함|필수|반드시|위험|규제|주의|제외|거부|보장|검증 안 됨|검증 불가|미검증|수정금지)/g,KEYW=/(핵심|결정|목표|전략|퍼널|CTA|후킹|훅|저장|공유|전환|팔로우|수익화|차별화|무료|유료)/g,NUMRE=/(\d[\d,\.]*\s?(?:%|만\s?원|억\s?원|천\s?원|원|만|억|천|배|명|개|일|장|컷|초|분|위|점|건|회|자|주|px)?)/g;
function tagSafe(h,fn){return h.split(/(<[^>]+>)/).map(t=>t[0]==='<'?t:fn(t)).join('')}
function hl(s){let h=esc(s).replace(/\*\*(.+?)\*\*/g,'<mark>$1</mark>');return tagSafe(h,t=>t.replace(NUMRE,'<b class="n">$1</b>').replace(RED,'<u class="rd">$1</u>').replace(KEYW,'<span class="ky">$1</span>'))}
function fmtPre(t){return esc(t).split('\n').map(l=>{let h=l;const head=/^\s*#{1,4}\s/.test(l)||(/[:：]\s*$/.test(l)&&l.length<70)||/^\s*(STEP|Step|ROLE|GOAL|TASK|RULES|OUTPUT)\b/.test(l);
 h=h.replace(/^(\s*)([-*•])\s/,'$1<span class="bl">●</span> ').replace(/^(\s*)(\d+[\.\)])\s/,'$1<span class="nm">$2</span> ');
 h=tagSafe(h,x=>x.replace(/([①-⑩❶-❿🔴🟢🔹★☆✅☑▶◆■□])/g,'<span class="nm">$1</span>').replace(/(&quot;[^&]{2,80}?&quot;|“[^”]{2,80}”)/g,'<span class="q">$1</span>').replace(/(\[[^\]\n]{1,24}\])/g,'<span class="ph">$1</span>').replace(NUMRE,'<b class="n">$1</b>').replace(RED,'<u class="rd">$1</u>'));
 return head?'<span class="hd1">'+h+'</span>':h}).join('\n')}
/* ---- 팩 카드 ---- */
function convCard(c,col,open){const f=c.fields||{};
 const L=(t,arr,cl,ic)=>arr&&arr.length?'<div class="lst t-'+cl+(arr.length>6?' more':'')+'"><h4>'+t+' <span class="muted">'+arr.length+'</span></h4><ul>'+arr.map(x=>{let hh=hl(x);if(t.includes('결정')){const i=x.indexOf(':');hh=i>0&&i<40?'<span class="dcy">'+esc(x.slice(0,i))+'</span>'+hl(x.slice(i)):'<span class="dcy">'+hh+'</span>'}return '<li><span class="ic">'+ic+'</span>'+hh+'</li>'}).join('')+'</ul>'+(arr.length>6?'<span class="mb" onclick="this.parentNode.classList.toggle(\'more\');this.textContent=this.parentNode.classList.contains(\'more\')?\'▾ 더보기\':\'▴ 접기\'">▾ 더보기</span>':'')+'</div>':'';
 return '<div class="cv'+(open?'':' fold')+'"><div class="hd t-'+col+'" onclick="this.parentNode.classList.toggle(\'fold\')"><span class="st">'+'★'.repeat(c.stars)+'</span><span>'+esc(c.title)+'</span><span class="muted small" style="margin-left:auto">📌'+c.blocks.length+' · 📏'+((f.규칙||[]).length)+' · 🔴'+((f.결정||[]).length)+' ▾</span></div><div class="bd">'+
 (f.요약?'<div class="sum">'+f.요약.map(hl).join('<br>')+'</div>':'')+
 '<div class="cols3">'+L('📏 규칙',f.규칙,'mint','📏')+L('🔴 결정',f.결정,'wine','🔴')+L('💜 선호',f.선호,'purple','💜')+'</div>'+
 c.blocks.map(b=>'<details class="blk"><summary>📌 '+esc(b.t)+copyBtn('')+'</summary><pre>'+fmtPre(b.code)+'</pre></details>').join('')+
 (f['확인 필요']?'<div class="warn">⚠ 확인 필요: '+f['확인 필요'].map(hl).join(' / ')+'</div>':'')+
 (f.링크?'<div class="note">🔗 '+f.링크.join(' ').replace(/\[(\d+)\]\((https?:[^)]+)\)/g,(m,n,u)=>'<a href="'+esc(u)+'" target="_blank">['+n+']</a>')+'</div>':'')+
 (f.캡처?'<div class="note">🖼 '+esc(f.캡처.join(' ').replace(/^- 🖼 /,''))+' (공통기억 VIEW/media — 공개 저장소 미포함)</div>':'')+
 (f.원문?'<div class="note">원문: '+esc(f.원문.join(' '))+'</div>':'')+(c.extra?'<details class="blk"><summary>기타 원문</summary><div class="md" style="padding:6px">'+md(c.extra)+'</div></details>':'')+'</div></div>'}
/* ---- 게시물 보드 ---- */
G.key='ev';G.desc=true;G.cols=+LS.cols2||6;
function capBtns(){return '<button id="gset">👁 표시 ▾</button>'}
function bindCap(){ensureSet()}
const sortOpts=()=>Object.entries(SORTS).map(([k,v])=>'<option value="'+k+'">'+v+'</option>').join('');
let BP=null;
VIEWS.b=(k)=>{const pre={b_all:null,b_toon:['인스타툰'],b_card:['카드뉴스'],b_one:['한장형'],b_reel:['릴스','기타'],b_ai:['인스타툰','카드뉴스','한장형']}[k];BP={pre,fld:k==='b_ai'?'AI·창업':'',lab:{b_all:'전체 게시물',b_toon:'툰',b_card:'카드뉴스',b_one:'한장형',b_ai:'AI·창업 계정',b_reel:'릴스·기타'}[k]};
 const pool=(D.acc||[]).filter(a=>(!pre||pre.includes(a.cat))&&(!BP.fld||a.field===BP.fld)&&(byAcc[a.h]||[]).length);
 const themes=[...new Set(pool.map(a=>a.themeG).filter(Boolean))].sort(),targets=[...new Set(pool.flatMap(a=>a.targets||[]))].sort();
 tools('<span class="lab">열</span><input type="range" id="gc" min="3" max="14" value="'+G.cols+'"><b id="gcn">'+G.cols+'</b><span class="lab">정렬</span><select id="gk">'+sortOpts()+'</select><button id="gd">내림 ▼</button>'+
 ((pre&&pre.length==1)||BP.fld?'':'<select id="gf"><option value="">전체 형식</option>'+['인스타툰','카드뉴스','한장형','릴스','기타'].map(x=>'<option value="'+x+'">'+catL(x)+'</option>').join('')+'</select>')+
 (BP.fld?'':'<select id="gfd"><option value="">전체 분야</option><option>투자</option><option>AI·창업</option><option>기타</option></select>')+
 '<select id="gt"><option value="">전체 주제</option>'+themes.map(x=>'<option>'+esc(x)+'</option>').join('')+'</select><select id="gg"><option value="">전체 타깃</option>'+targets.map(x=>'<option>'+esc(x)+'</option>').join('')+'</select>'+
 '<select id="gr"><option value="">전 지역</option>'+Object.entries(REG).map(([a,b])=>'<option value="'+a+'">'+b+'</option>').join('')+'</select><select id="gy"><option value="">전 유형</option><option value="car">슬라이드</option><option value="vid">릴스·영상</option><option value="img">단일 이미지</option></select>'+
 '<select id="ga"><option value="">전체 계정 ('+pool.length+')</option>'+pool.sort((x,y)=>(y.followers||0)-(x.followers||0)).map(a=>'<option value="'+esc(a.h)+'">@'+esc(a.h)+' '+fmtN(a.followers)+'</option>').join('')+'</select>'+
 '<input type="search" id="gq" placeholder="검색" size="10">'+capBtns()+'<span id="gcnt" class="lab"></span><span class="lab" title="'+esc(EST_NOTE)+'" style="cursor:help">ⓘ 추정(~) 기준</span>');
 $('#gk').value=G.key;
 $('#gc').oninput=e=>{G.cols=+e.target.value;LS.cols2=G.cols;$('#gcn').textContent=G.cols;$('#gal .gg').style.gridTemplateColumns='repeat('+G.cols+',minmax(0,1fr))'};
 $('#gk').onchange=e=>{G.key=e.target.value;renderBoard()};$('#gd').onclick=()=>{G.desc=!G.desc;renderBoard()};
 ['#gf','#gfd','#gt','#gg','#gr','#gy','#ga'].forEach(s=>$(s)&&($(s).onchange=renderBoard));$('#gq').oninput=renderBoard;bindCap();
 $('#view').innerHTML='<div class="note" style="margin:0 0 4px">'+EST_NOTE+'</div><div id="bhead" class="bhead"></div><div id="gal"></div>';renderBoard()};
function renderBoard(){const {pre,fld}=BP;const f=$('#gf')?.value,fd=$('#gfd')?.value||fld,t=$('#gt').value,g=$('#gg').value,r=$('#gr').value,y=$('#gy').value,ac=$('#ga').value,q=$('#gq').value.trim().toLowerCase();
 let arr=(D.posts||[]).filter(p=>{const a=D.accBy[p.a]||{};if(pre&&!pre.includes(a.cat))return false;if(f&&a.cat!==f)return false;if(fd&&a.field!==fd)return false;if(t&&a.themeG!==t)return false;if(g&&!(a.targets||[]).includes(g))return false;if(r&&a.region!==r)return false;if(y&&p.t!==y)return false;if(ac&&p.a!==ac)return false;
  if(q&&!((p.a+' '+(a.name||'')+' '+(p.cap||'')+' '+(p.orig||'')).toLowerCase().includes(q)))return false;return true});
 arr=sortPosts(arr,G.key,G.desc).slice(0,1500);$('#gd').textContent=G.desc?'내림 ▼':'오름 ▲';$('#gcnt').textContent=arr.length+'개';$('#bhead').innerHTML='<b style="font-size:14px;color:#fff">'+esc(BP.lab||'')+'</b> <span class="muted small">'+arr.length+'개 게시물</span> '+hdrSum(arr);
 $('#gal').innerHTML=gallery(arr,G.cols)}
/* ---- 묶음 ---- */
let GS={cols:6,key:'ev'};
VIEWS.grp=(k)=>{const by=k==='grp_theme'?'themeG':'target';const A=(D.acc||[]).filter(a=>['인스타툰','카드뉴스','한장형'].includes(a.cat));const groups={};
 A.forEach(a=>{const ks=by==='target'?(a.targets?.length?a.targets:['기타']):[a.themeG||'기타'];ks.forEach(g=>(groups[g]=groups[g]||[]).push(a))});
 tools('<span class="lab">열</span><input type="range" id="gc" min="3" max="12" value="'+GS.cols+'"><b id="gcn">'+GS.cols+'</b><span class="lab">정렬</span><select id="gk">'+sortOpts()+'</select><button id="gd">내림 ▼</button>'+capBtns()+'<span class="lab">그룹마다 상위 12개 · 툰·카드뉴스·한장형</span>');
 $('#gk').value=GS.key;const cols=['mint','blue','purple','orange','green','wine','yellow','navy'];
 const r=()=>{$('#gd').textContent=G.desc?'내림 ▼':'오름 ▲';$('#view').innerHTML='<div class="note">'+EST_NOTE+'</div>'+Object.entries(groups).sort((a,b)=>b[1].length-a[1].length).map(([g,arr],i)=>{const hs=new Set(arr.map(a=>a.h));const ps=sortPosts((D.posts||[]).filter(p=>hs.has(p.a)),GS.key,G.desc).slice(0,12);
  return '<div class="sec t-'+cols[i%8]+'"><h2>'+esc(g)+' <small>'+arr.length+'개 계정 · 팔로워 합 '+fmtN(arr.reduce((s,x)=>s+(x.followers||0),0))+' · 게시물 상위 '+ps.length+'</small> '+hdrSum(ps)+'</h2>'+gallery(ps,GS.cols)+'<details class="blk"><summary>👤 계정 '+arr.length+'개 보기</summary><div class="grid g4" style="padding:5px">'+arr.sort((x,y)=>(y.followers||0)-(x.followers||0)).map(accCard).join('')+'</div></details></div>'}).join('');
  $$('.ac-card').forEach(e=>e.onclick=()=>location.hash='acc:'+encodeURIComponent(e.dataset.h))};
 $('#gc').oninput=e=>{GS.cols=+e.target.value;$('#gcn').textContent=GS.cols;$$('.gg').forEach(x=>x.style.gridTemplateColumns='repeat('+GS.cols+',minmax(0,1fr))')};
 $('#gk').onchange=e=>{GS.key=e.target.value;r()};$('#gd').onclick=()=>{G.desc=!G.desc;r()};bindCap();r()};
/* ---- 계정 상세 ---- */
let MS='ev';
async function openAcc(h){const a=D.accBy[h];if(!a)return;if(!(window.ACC_MD&&ACC_MD[h]))await loadScript('data/acc/'+encodeURIComponent(h)+'.js?v=2');
 const s=a.stats||{};const kv=(k,v)=>'<div class="kpi t-navy"><div class="v" style="font-size:16px">'+v+'</div><div class="k">'+k+'</div></div>';
 let html='<button class="x" onclick="backAcc()">✕ 닫기</button><div class="sxbar"><span class="muted small">표시:</span><label><input type="checkbox" data-sx="kpi"> 숫자 요약</label><label><input type="checkbox" data-sx="mem"> 공통기억 분석</label><label><input type="checkbox" data-sx="ai"> 최근 게시물 요약</label><label><input type="checkbox" data-sx="grid"> 최근 게시물 12</label><label><input type="checkbox" data-sx="raw"> 원문 분석</label></div><div style="display:flex;gap:10px;align-items:center;margin-bottom:6px"><img src="'+(a.pf||'')+'" style="width:64px;height:64px;border-radius:50%;object-fit:cover"><div><div style="font-size:17px;font-weight:900">@'+esc(h)+' <span class="muted" style="font-size:13px">'+esc(a.name||'')+'</span> <a href="https://www.instagram.com/'+esc(h)+'/" target="_blank">인스타 열기↗</a></div>'+
 '<div><span class="chip c-'+(CATC[a.cat]||'wine')+'">'+esc(catL(a.cat))+'</span><span class="chip">'+(REG[a.region]||'')+'</span><span class="chip c-orange">'+esc(a.field)+'</span>'+(a.themeG?'<span class="chip c-yellow">'+esc(a.themeG)+'</span>':'')+(a.targets||[]).map(t=>'<span class="chip c-green">'+esc(t)+'</span>').join('')+'</div><div class="small" style="white-space:pre-wrap;color:#c8d1e4">'+esc(a.bio||'')+'</div>'+(a.note?'<div class="warn">⚠ '+esc(a.note)+'</div>':'')+'</div></div>';
 html+='<div class="grid g6 sx sx-kpi" style="margin-bottom:6px">'+kv('<span class="fol">팔로워 (ego 실측)</span>','<span class="fol">'+fmtN(a.followers)+'</span>')+kv('게시물 수',fmtN(a.postsN))+kv('최근 '+(s.n||0)+'개 평균 좋아요',s.avgL==null?'~'+fmtN(Math.round((byAcc[h]||[]).reduce((t,p)=>t+p.el,0)/Math.max(1,(byAcc[h]||[]).length)))+' (추정)':fmtN(Math.round(s.avgL)))+kv('평균 좋아요/팔로워',s.er==null?(a.followers?'~'+pct((byAcc[h]||[]).reduce((t,p)=>t+p.el,0)/Math.max(1,(byAcc[h]||[]).length)/a.followers):'-'):pct(s.er))+kv('평균 댓글',s.avgC==null?'-':fmtN(Math.round(s.avgC)))+kv('슬라이드/영상/단일',(s.mix||'-'))+'</div>';
 html+='<div class="grid g2"><div class="sec sx sx-mem t-mint"><h2>🧠 공통기억 분석 <small>accounts/ 원문 · 수치 검증 안 됨</small></h2><div><b>주제:</b> '+hl(a.topic||'')+'</div>'+(a.mem?.point?.length?'<div><b>벤치마킹 포인트:</b> '+a.mem.point.map(hl).join(' / ')+'</div>':'')+(a.mem?.nums?.length?'<div class="note">기록 수치: '+a.mem.nums.map(hl).join(' / ')+'</div>':'')+'</div>'+
 '<div class="sec sx sx-ai t-blue"><h2>🔎 최근 게시물 분석 <small>ego 수집 '+esc(a.fetched||'')+' 기준 자동 요약</small></h2>'+(a.ai?'<div class="sum">'+hl(a.ai)+'</div>':'')+(a.kw?.length?'<div>'+a.kw.map(w=>'<span class="chip c-purple">'+esc(w)+'</span>').join('')+'</div>':'')+(s.cad?'<div class="note">업로드 간격 중앙값 약 <b class="n">'+s.cad+'일</b> · 최근 게시 '+esc(sd(s.last||''))+'</div>':'')+'</div></div>';
 html+='<div class="sec sx sx-grid t-navy"><h2>🖼 최근 게시물 상위 12 <small>사진 클릭 → 미리보기(◀▶)</small> '+hdrSum(sortPosts(byAcc[h]||[],'el',true).slice(0,12))+' <select id="ms">'+sortOpts()+'</select> <button id="mcap" class="'+(document.body.classList.contains('showcap')?'on':'')+'">제목·설명 '+(document.body.classList.contains('showcap')?'▾':'▸')+'</button></h2><div id="mg"></div><div class="note">'+EST_NOTE+'</div></div>';
 html+='<details class="blk sx sx-raw" open><summary>📄 공통기억 원문 분석 (accounts/'+esc((a.mem?.files||[]).join(', '))+')</summary><div class="md" style="padding:6px 9px">'+md((window.ACC_MD||{})[h]||'(원문 없음)')+'</div></details>';
 modal(html);const draw=()=>{$('#mg').innerHTML=gallery(sortPosts(byAcc[h]||[],MS,true).slice(0,12),6)};$('#ms').value=MS;$('#ms').onchange=e=>{MS=e.target.value;draw()};$('#mcap').onclick=()=>{document.body.classList.toggle('showcap');$('#mcap').classList.toggle('on');$('#mcap').textContent='제목·설명 '+(document.body.classList.contains('showcap')?'▾':'▸')};draw()}
/* ---- 주간 7슬롯 (색·강조) ---- */
VIEWS.hm_week=()=>{const H=D.hm;const days=['월','화','수','목','금','토','일'],dc=['#6aa8ff','#5fe08a','#ffd84d','#ffa04d','#ff6f9e','#b892ff','#3ee6c4'],sc=['blue','orange','mint','purple','green','wine','yellow'];
 const KW=['보안','사칭','부모님','고배당','월배당','총수익률','ETF','고정비','투표','무료','체크','카드','비교','30초','60초','1분','실사례','가이드','점검'];
 const kwHL=t=>{let h=esc(t);let i=0;KW.forEach(k=>{h=tagSafe(h,x=>x.split(k).join('<mark class="k'+(KW.indexOf(k)%4)+'">'+k+'</mark>'))});return tagSafe(h,x=>x.replace(NUMRE,'<b class="n">$1</b>')).replace(/(&quot;[^&]{2,60}?&quot;)/g,'<span class="q">$1</span>')};
 let h='<div class="sec t-orange"><h2>📅 주간 7슬롯 기획판 <small>하루 7개 = 핵심 주제 1~2개의 매체별 변환 · 샘플은 공통기억 주제 예시</small></h2><div class="cmd copyhost"><span class="w">다음 주 7개 기획</span><code>'+esc(H.weekCmd)+'</code>'+copyBtn(H.weekCmd)+'</div></div>';
 h+='<div class="sec t-navy" style="overflow:auto"><table class="t wk"><tr><th>슬롯</th><th>역할</th>'+days.map((d,i)=>'<th style="color:'+dc[i]+';border-bottom:2px solid '+dc[i]+'">'+d+'요일</th>').join('')+'</tr>'+H.slots.map((s,i)=>'<tr><td class="nowrap"><span class="chip c-'+sc[i]+'">'+['🗂','🎬','🐯','💬','📱','🧵','📺'][i]+' '+esc(s[0])+'</span></td><td class="small" style="color:#ffd84d">'+esc(s[1])+'</td>'+days.map((d,j)=>'<td class="small" style="background:'+dc[j]+'12">'+kwHL((H.sample[j]||{})[i]||'')+'</td>').join('')+'</tr>').join('')+'</table></div>';
 $('#view').innerHTML=h};
/* ---- 메뉴/레이아웃 ---- */
(function(){const NM=[['💰 혜민 투자 인스타','#ffa04d',[['hm','전략 대시보드 (분석)'],['hm_week','📅 주간 7슬롯 기획판']]],
 ['🏠 대시보드','#ffd84d',[['home','한눈에 보기 · 명령어'],['prompts','📋 프롬프트 전체 복사']]],
 ['🖼 게시물 보드','#3ee6c4',[['b_all','전체'],['b_toon','툰'],['b_card','카드뉴스'],['b_one','한장형'],['b_ai','🤖 AI·창업'],['b_reel','릴스·기타 계정']]],
 ['👤 계정 분석','#6aa8ff',[['accs','계정 카드 (전체)'],['cmp_toon','📊 툰 비교'],['cmp_card','📊 카드뉴스·한장형 비교'],['grp_theme','🗂 주제별 묶음'],['grp_target','🎯 타깃별 묶음']]],
 MENU.find(m=>m[0].startsWith('📚'))];
 MENU.length=0;NM.forEach(m=>MENU.push(m));Object.keys(ITEMS).forEach(k=>delete ITEMS[k]);MENU.forEach(([g,c,a])=>a.forEach(([k,n])=>ITEMS[k]={n,g,c}));
 buildSide();
 if(innerWidth<760)document.body.classList.add('sidehide');
 $('#mb').onclick=()=>document.body.classList.toggle('sidehide');
 })();

/* ===== v3: 섹션 요약 · 표시 설정 ===== */
function hdrSum(ps){if(!ps||!ps.length)return '';
 const nn=a=>a.filter(x=>x!=null&&isFinite(x));const av=a=>{a=nn(a);return a.length?a.reduce((s,x)=>s+x,0)/a.length:null};const mx=a=>{a=nn(a);return a.length?Math.max(...a):null};
 const L=ps.map(p=>p.el),V=ps.map(p=>p.ev),C=ps.map(p=>p.c),S=ps.map(p=>p.es);
 const seg=(cls,label,val,est)=>val==null?'':'<span class="mv '+cls+'">'+label+(est?'~':'')+fmtN(Math.round(val))+'</span>';
 const lE=ps.some(p=>p.eL);
 return '<span class="bsum">('+[seg('mv-el','평균 ♥',av(L),lE),seg('mv-el','최고 ♥',mx(L),lE),seg('mv-ev','평균 ▶',av(V),1),seg('mv-ev','최고 ▶',mx(V),1),seg('mv-c','평균 💬',av(C),0),seg('mv-es','평균 ↗',av(S),1)].filter(Boolean).join(' · ')+')</span>'}
const SKEY='gs_show3';const SDEF={cap:false,id:true,dt:true,fol:true,tp:true,ev:true,el:true,c:true,es:true};
let SET=Object.assign({},SDEF);try{Object.assign(SET,JSON.parse(localStorage[SKEY]||'{}'))}catch(e){}
const SLAB=[['cap','제목·설명 (글)'],['id','계정 ID'],['dt','날짜'],['fol','팔로워'],['tp','계정 소개(주제)'],['ev','조회수(추정)'],['el','좋아요'],['c','댓글'],['es','공유(추정)']];
function applySet(){const b=document.body.classList;b.toggle('showcap',!!SET.cap);b.toggle('noid',!SET.id);b.toggle('nodt',!SET.dt);b.toggle('nofol',!SET.fol);b.toggle('notp',!SET.tp);['ev','el','c','es'].forEach(k=>b.toggle('nomv-'+k,!SET[k]));
 try{localStorage[SKEY]=JSON.stringify(SET)}catch(e){}
 const p=$('#spanel');if(p)p.querySelectorAll('input[data-k]').forEach(i=>i.checked=!!SET[i.dataset.k])}
function ensureSet(){if(!$('#spanel')){const p=document.createElement('div');p.id='spanel';p.innerHTML='<div class="sp-h">👁 표시 항목 <span class="muted small">끄면 숨김 · 자동 저장</span></div>'+SLAB.map(([k,l])=>'<label><input type="checkbox" data-k="'+k+'"> '+l+'</label>').join('')+'<div class="sp-f"><button id="sp-all">전부 켜기</button><button id="sp-def">기본값</button></div>';document.body.appendChild(p)}applySet()}
document.addEventListener('change',e=>{const i=e.target.closest&&e.target.closest('#spanel input[data-k]');if(i){SET[i.dataset.k]=i.checked;applySet()}});
document.addEventListener('click',e=>{
 if(e.target.closest('#gset')){ensureSet();$('#spanel').classList.toggle('on');return}
 if(e.target.id==='sp-all'){Object.keys(SDEF).forEach(k=>SET[k]=true);applySet();return}
 if(e.target.id==='sp-def'){Object.assign(SET,SDEF);applySet();return}
 if($('#spanel')&&!e.target.closest('#spanel'))$('#spanel').classList.remove('on')},true);
ensureSet();

const SXKEY='gs_acc_sx';let SX={};try{SX=JSON.parse(localStorage[SXKEY]||'{}')}catch(e){}
function applySX(){['kpi','mem','ai','grid','raw'].forEach(k=>document.body.classList.toggle('nosx-'+k,SX[k]===false));document.querySelectorAll('#mod input[data-sx]').forEach(i=>i.checked=SX[i.dataset.sx]!==false)}
document.addEventListener('change',e=>{const i=e.target.closest&&e.target.closest('#mod input[data-sx]');if(i){SX[i.dataset.sx]=i.checked;try{localStorage[SXKEY]=JSON.stringify(SX)}catch(_){}applySX()}});
const _openAccOrig=openAcc;openAcc=async function(h){await _openAccOrig(h);applySX()};
/* 시작: 설정(SET) 초기화 뒤에 라우팅 */
window.curV=null;route();
