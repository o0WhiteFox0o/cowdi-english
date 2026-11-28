import{r as l,j as e}from"./react-CNvHvvCs.js";import{I as i,E as u,u as Se,c as ze,a as Fe,b as Ce,n as Ie,e as Te,P as he,g as Pe,X as Ae,Y as Re,d as Oe,Z as Le,_ as Be,$ as k,i as $e,t as De,j as Me,K as O,a0 as L,z as Ye,y as Ke,k as Ge,S as He,s as Qe}from"./index-DqeZKZWl.js";import{L as z}from"./router-Czaw9YMG.js";import{C as xe}from"./cosmetics-data-DOQEgjO6.js";import{P as Xe}from"./PetSpeech-B0NK7FGv.js";import{B as F,S as ue}from"./CollectionPage-DqPSZ69Q.js";import"./react-dom-CxvtPLOl.js";import"./vendor-DVzZvczY.js";import"./data-lessons-D9Ob1R43.js";import"./data-vocab-DnLIfkrT.js";function Ue({oldEvo:o,newEvo:f,petName:B,onComplete:_,onSkip:C}){const[m,E]=l.useState("intro");l.useEffect(()=>{const w=setTimeout(()=>E("flashing"),500),p=setTimeout(()=>E("reveal"),3e3),v=setTimeout(()=>{E("done"),_&&_()},3800);return()=>{clearTimeout(w),clearTimeout(p),clearTimeout(v)}},[]);const c=m==="reveal"||m==="done"?f:o;return e.jsxs("div",{className:"cowdi-evo-overlay",role:"dialog","aria-label":"Pet đang tiến hóa",children:[e.jsx("div",{className:`cowdi-evo-rays ${m}`}),e.jsx("div",{className:"cowdi-evo-sparkles",children:Array.from({length:14}).map((w,p)=>e.jsx("span",{className:"cowdi-evo-spark",style:{left:`${p*73%100}%`,top:`${p*41%100}%`,animationDelay:`${p*137%1800}ms`},children:e.jsx(i,{name:"sparkles",size:22})},p))}),e.jsxs("div",{className:`cowdi-evo-stage ${m}`,children:[e.jsxs("div",{className:"cowdi-evo-pet-wrap",children:[c!=null&&c.image?e.jsx("img",{src:c.image,alt:c.name,className:"cowdi-evo-pet-img",draggable:!1}):e.jsx("span",{className:"cowdi-evo-pet-emoji emoji-big",children:e.jsx(u,{e:(c==null?void 0:c.emoji)||"🥚",size:144})}),e.jsx("div",{className:"cowdi-evo-flash"})]}),e.jsxs("div",{className:"cowdi-evo-caption",children:[m==="intro"&&e.jsxs("span",{children:[B||(o==null?void 0:o.name)," đang tiến hóa…"]}),m==="flashing"&&e.jsx("span",{children:"Một luồng sáng bao trùm…"}),(m==="reveal"||m==="done")&&e.jsxs("span",{className:"cowdi-evo-newname",children:[e.jsx(i,{name:"party",size:28})," ",f==null?void 0:f.name,"!"]})]})]}),e.jsx("button",{type:"button",className:"cowdi-evo-skip",onClick:C,children:"Bỏ qua ›"}),e.jsx("style",{children:`
        .cowdi-evo-overlay {
          position: fixed; inset: 0; z-index: 1200;
          background: radial-gradient(circle at 50% 50%, #1a1330 0%, #060410 70%);
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
          animation: cowdiEvoFadeIn 0.3s ease-out;
        }
        @keyframes cowdiEvoFadeIn { from { opacity: 0; } to { opacity: 1; } }

        .cowdi-evo-rays {
          position: absolute; inset: -25%;
          background: conic-gradient(from 0deg,
            rgba(255,255,255,0.0) 0deg, rgba(255,221,87,0.35) 12deg,
            rgba(255,255,255,0.0) 24deg, rgba(120,200,255,0.30) 36deg,
            rgba(255,255,255,0.0) 48deg, rgba(255,221,87,0.35) 60deg,
            rgba(255,255,255,0.0) 72deg);
          animation: cowdiEvoSpin 6s linear infinite;
          opacity: 0.6;
          mix-blend-mode: screen;
        }
        .cowdi-evo-rays.flashing { animation-duration: 1.5s; opacity: 0.95; }
        .cowdi-evo-rays.reveal   { animation-duration: 3s;   opacity: 0.85; }
        @keyframes cowdiEvoSpin { to { transform: rotate(360deg); } }

        .cowdi-evo-sparkles { position: absolute; inset: 0; pointer-events: none; }
        .cowdi-evo-spark {
          position: absolute; font-size: 1.4rem;
          animation: cowdiEvoSparkFloat 1.8s ease-in-out infinite;
          opacity: 0;
          filter: drop-shadow(0 0 6px #fff8a8);
        }
        @keyframes cowdiEvoSparkFloat {
          0%   { opacity: 0; transform: translateY(20px) scale(0.4); }
          50%  { opacity: 1; transform: translateY(-10px) scale(1.1); }
          100% { opacity: 0; transform: translateY(-40px) scale(0.6); }
        }

        .cowdi-evo-stage {
          position: relative; z-index: 2;
          display: flex; flex-direction: column; align-items: center; gap: 24px;
        }
        .cowdi-evo-pet-wrap {
          position: relative; width: 220px; height: 220px;
          display: flex; align-items: center; justify-content: center;
        }
        .cowdi-evo-pet-img {
          width: 100%; height: 100%; object-fit: contain;
          filter: drop-shadow(0 8px 24px rgba(0,0,0,0.6));
          animation: cowdiEvoBob 1.4s ease-in-out infinite;
        }
        .cowdi-evo-pet-emoji {
          font-size: 9rem; line-height: 1;
          animation: cowdiEvoBob 1.4s ease-in-out infinite;
        }
        @keyframes cowdiEvoBob {
          0%, 100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-10px) scale(1.04); }
        }

        /* Flash overlay – white silhouette pulse during flashing phase */
        .cowdi-evo-flash {
          position: absolute; inset: 0;
          background: #fff; border-radius: 50%;
          opacity: 0; pointer-events: none;
          mix-blend-mode: screen;
        }
        .cowdi-evo-stage.flashing .cowdi-evo-flash {
          animation: cowdiEvoFlash 0.35s ease-in-out infinite alternate;
        }
        .cowdi-evo-stage.flashing .cowdi-evo-pet-img,
        .cowdi-evo-stage.flashing .cowdi-evo-pet-emoji {
          animation: cowdiEvoFlashShake 0.35s ease-in-out infinite alternate;
          filter: brightness(2) drop-shadow(0 0 30px #fff8a8);
        }
        @keyframes cowdiEvoFlash {
          from { opacity: 0; transform: scale(0.9); }
          to   { opacity: 0.85; transform: scale(1.15); }
        }
        @keyframes cowdiEvoFlashShake {
          0%   { transform: translateX(-6px) scale(1); }
          100% { transform: translateX(6px)  scale(1.08); }
        }

        /* Reveal: scale up burst */
        .cowdi-evo-stage.reveal .cowdi-evo-pet-img,
        .cowdi-evo-stage.reveal .cowdi-evo-pet-emoji {
          animation: cowdiEvoReveal 0.8s cubic-bezier(.2,1.4,.4,1) forwards;
        }
        @keyframes cowdiEvoReveal {
          0%   { transform: scale(0.4) rotate(-20deg); opacity: 0; filter: brightness(3); }
          60%  { transform: scale(1.25) rotate(8deg);  opacity: 1; filter: brightness(1.4); }
          100% { transform: scale(1) rotate(0); opacity: 1; filter: brightness(1); }
        }

        .cowdi-evo-caption {
          color: #fff; font-weight: 700; font-size: 1.15rem;
          text-shadow: 0 2px 8px rgba(0,0,0,0.6);
          letter-spacing: 0.5px;
          text-align: center; min-height: 1.8em;
        }
        .cowdi-evo-newname {
          font-size: 1.6rem;
          background: linear-gradient(90deg, #ffd86b, #ff9a3c);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: cowdiEvoNamePop 0.6s ease-out;
        }
        @keyframes cowdiEvoNamePop {
          0%   { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1);   opacity: 1; }
        }

        .cowdi-evo-skip {
          position: absolute; top: 18px; right: 18px;
          background: rgba(255,255,255,0.12);
          color: #fff; border: 1px solid rgba(255,255,255,0.25);
          padding: 6px 14px; border-radius: 999px; font-size: 0.9rem;
          backdrop-filter: blur(8px);
          cursor: pointer;
        }
        .cowdi-evo-skip:hover { background: rgba(255,255,255,0.22); }
      `})]})}const be={room_beach:"linear-gradient(180deg, rgba(79, 195, 247, 0.35) 0%, rgba(255, 224, 130, 0.5) 100%), url('/image/icons-ui/cosmetics/bg_beach.webp') center / cover no-repeat",room_forest:"linear-gradient(180deg, rgba(129, 199, 132, 0.35) 0%, rgba(200, 230, 201, 0.5) 100%), url('/image/icons-ui/cosmetics/bg_forest.webp') center / cover no-repeat",room_volcano:"linear-gradient(180deg, rgba(239, 83, 80, 0.35) 0%, rgba(255, 205, 210, 0.5) 100%), url('/image/icons-ui/cosmetics/bg_volcano.webp') center / cover no-repeat",room_bamboo:"linear-gradient(180deg, rgba(174, 213, 129, 0.35) 0%, rgba(220, 237, 200, 0.5) 100%), url('/image/icons-ui/cosmetics/bg_bamboo.webp') center / cover no-repeat",room_space:"linear-gradient(180deg, rgba(26, 35, 126, 0.6) 0%, rgba(40, 53, 147, 0.75) 100%), url('/image/icons-ui/cosmetics/bg_space.webp') center / cover no-repeat",room_ocean:"linear-gradient(180deg, rgba(2, 119, 189, 0.45) 0%, rgba(3, 155, 229, 0.6) 100%), url('/image/icons-ui/cosmetics/bg_ocean.webp') center / cover no-repeat",room_deep_sea:"linear-gradient(180deg, rgba(2, 119, 189, 0.45) 0%, rgba(3, 155, 229, 0.6) 100%), url('/image/icons-ui/cosmetics/bg_ocean.webp') center / cover no-repeat",room_library:"url('/image/background_character/bg_library.webp') center / cover no-repeat",room_collection:"url('/image/background_character/bg_collection.webp') center / cover no-repeat",room_game_category:"url('/image/background_character/bg_game_category.webp') center / cover no-repeat",room_discovery:"url('/image/background_character/bg_discovery.webp') center / cover no-repeat",room_latest_updates:"url('/image/background_character/bg_latest_updates.webp') center / cover no-repeat",room_featured_events:"url('/image/background_character/bg_featured_events.webp') center / cover no-repeat"};function ns(){var Z,J,q,ee,se,ae,te,ie,ne,oe;Se(He["/pet"]);const{petData:o,getActivePetWithDecay:f,feedPet:B,renamePet:_,useFood:C,completeDailyQuest:m,addCoins:E,evolvePet:$}=ze(),{userData:c,refreshWallet:w}=Fe(),{user:p}=Ce(),v=Ie(),[fe,D]=l.useState(!1),[I,M]=l.useState(""),[T,Y]=l.useState(!1),K=l.useRef(null),{register:G,dispatch:h,speech:P}=Te();l.useEffect(()=>{const s=G("pet",K);return h("screen_enter",{screen:"pet"}),s},[G,h]);const[t,N]=l.useState(null),[ve,H]=l.useState(!1),[je,we]=l.useState(""),a=f();o.activePetId||a!=null&&a.instanceId;const d=a?he[a.speciesId]:null,n=a&&d?Pe(a.speciesId,a.evolution):null,x=d&&n&&d.evolutions[n.stage+1]||null,j=a?Ae(a):null,Q=a?Re(a):0,A=a?Oe(a.needs):"happy",X=P&&P.slot==="pet"?P:null,Ne=c.wallet||{milk:c.availableXP||0,gem:0,stone:0},y=a?Le(a,Ne):{ok:!1,checks:[]};async function ye(){if(!(!y.ok||T||!o.activePetId)){Y(!0);try{const s=await $(o.activePetId);s.ok?(w&&await w(),N({stage:"animation",oldEvo:n,newEvo:x,petName:a.customName}),v("Tiến hóa thành công! 🎉","success")):v(s.error||"Tiến hóa thất bại.","danger")}catch{v("Lỗi mạng khi tiến hóa.","danger")}finally{Y(!1)}}}function ke(){var r;if(!t)return;const s=`Cowdi của mình vừa tiến hóa thành ${((r=t.newEvo)==null?void 0:r.name)||"pet mới"}! 🎉
Học tiếng Anh chung cho vui nha 🐾`;we(s),N(null),H(!0)}const U=l.useMemo(()=>Be.map(s=>({...s,done:o.dailyQuests.completed.includes(s.id),canClaim:s.check(c)&&!o.dailyQuests.completed.includes(s.id)})),[o.dailyQuests,c]),_e=U.every(s=>s.done),W=l.useMemo(()=>k.filter(s=>s.category==="food"&&o.ownedItems.includes(s.id)),[o.ownedItems]),R=l.useRef(a==null?void 0:a.evolution);l.useEffect(()=>{a&&(R.current!=null&&a.evolution>R.current&&h("evolve_ok",{stage:a.evolution+1}),R.current=a.evolution)},[a==null?void 0:a.evolution,h]),l.useEffect(()=>{if((t==null?void 0:t.stage)==="animation"&&t.newEvo){const s=(t.newEvo.stage??((a==null?void 0:a.evolution)||0))+1;h("evolve_ok",{stage:s})}},[t,h]);function Ee(s){!s||!a||C(s.id)&&(h("feed"),v(`${a.customName} rất thích ${s.name}!`,"success"))}if(!a||!d)return e.jsxs("div",{className:"text-center py-5 fade-in",children:[e.jsx("div",{style:{fontSize:"5rem"},className:"emoji-big",children:e.jsx(i,{name:"egg",size:96})}),e.jsx("h2",{className:"fw-bold mt-3",children:"Đang tải pet..."})]});function V(){I.trim()&&_(o.activePetId,I.trim()),D(!1)}return e.jsxs("div",{className:"fade-in",children:[e.jsx("div",{className:"text-center mb-4",children:e.jsxs("h2",{className:"fw-bold",children:[e.jsx("span",{className:"me-2",children:e.jsx(i,{name:"paw",size:32})}),"Pet của bạn"]})}),e.jsxs("div",{className:"pet-display-card mb-4",children:[(()=>{var S,ce,le,re,de,me,pe,ge;const s=(S=a==null?void 0:a.cosmetics)==null?void 0:S.room,r=s?xe[s]||k.find(g=>g.id===s):null,b=s&&be[s]||(r==null?void 0:r.bgStyle)||(s==="room_beach"?be.room_beach:void 0);return e.jsxs("div",{className:`pet-stage-container ${A} ${b?"has-custom-bg":""}`,style:{background:b||void 0,transition:"background 0.3s ease"},children:[e.jsx("div",{className:"pet-floating-decor",children:((ce=a.cosmetics)==null?void 0:ce.effect)&&e.jsx("span",{className:"pet-effect-icon",children:e.jsx(u,{e:((le=xe[a.cosmetics.effect])==null?void 0:le.emoji)||((re=k.find(g=>g.id===a.cosmetics.effect))==null?void 0:re.emoji)||"",size:30})})}),((de=a.cosmetics)==null?void 0:de.hat)&&e.jsx("div",{className:"pet-hat-img",children:e.jsx(u,{e:((me=k.find(g=>g.id===a.cosmetics.hat))==null?void 0:me.emoji)||"",size:42})}),e.jsx("div",{className:"pet-image-wrapper",children:e.jsx($e,{ref:K,petId:a.speciesId,stage:(a.evolution||0)+1,group:d.group,bond:Me(a.skills),topSkill:De(a.skills),mode:"home",canvasBubble:!1,fallbackSrc:n==null?void 0:n.image,alt:(n==null?void 0:n.name)||a.customName,className:"pet-character-img",onClip:g=>g==="tap"&&h("pet_tap")})}),((pe=a.cosmetics)==null?void 0:pe.outfit)&&e.jsx("div",{className:"pet-outfit-badge",children:e.jsx(u,{e:((ge=k.find(g=>g.id===a.cosmetics.outfit))==null?void 0:ge.emoji)||"",size:28})}),e.jsx("div",{className:"pet-mood-indicator",children:e.jsx(i,{name:A==="happy"?"smile":A==="sad"?"sad":"sick",size:26})})]})})(),e.jsxs("div",{className:"pet-info-section",children:[e.jsx("div",{className:"pet-name-area",children:fe?e.jsxs("div",{className:"d-flex justify-content-center gap-2",children:[e.jsx("input",{type:"text",className:"form-control form-control-sm pet-name-input",value:I,onChange:s=>M(s.target.value),maxLength:20,autoFocus:!0,onKeyDown:s=>s.key==="Enter"&&V()}),e.jsx("button",{className:"btn btn-sm btn-cowdi-primary",onClick:V,children:"✓"})]}):e.jsxs("h3",{className:"pet-name",children:[a.customName,e.jsx("button",{className:"btn btn-sm btn-link text-muted ms-1",onClick:()=>{D(!0),M(a.customName)},title:"Đổi tên",children:e.jsx(i,{name:"pencil",size:16})})]})}),e.jsxs("div",{className:"pet-badges",children:[e.jsx("span",{className:"pet-badge",style:{background:(Z=O[d.element])==null?void 0:Z.bg,color:(J=O[d.element])==null?void 0:J.text},children:(q=O[d.element])==null?void 0:q.name}),e.jsx("span",{className:"pet-badge",style:{background:(ee=L[d.rarity])==null?void 0:ee.bg,color:(se=L[d.rarity])==null?void 0:se.text},children:(ae=L[d.rarity])==null?void 0:ae.name}),e.jsxs("span",{className:"pet-badge pet-badge-power",children:[e.jsx(i,{name:"bolt",size:14})," ",Q]})]}),e.jsx("div",{className:"pet-evolution-label",children:(n==null?void 0:n.name)||"Trứng"}),e.jsx("div",{style:{maxWidth:320,margin:"8px auto 0",minHeight:44},children:X?e.jsx(Xe,{speech:X,placement:"top"}):e.jsxs("div",{className:"text-muted small",children:["Chạm vào ",a.customName," để chơi cùng nha!"]})})]})]}),j&&e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:e.jsx(i,{name:"bolt",size:22})}),e.jsx("span",{children:"Chỉ số chiến đấu"}),e.jsxs("span",{className:"badge bg-primary ms-auto",children:["Lực chiến: ",Q]})]}),e.jsxs("div",{className:"row g-2 text-center",children:[e.jsx("div",{className:"col-6 col-sm-3",children:e.jsxs("div",{className:"p-2 border rounded bg-light d-flex flex-column align-items-center",children:[e.jsx("img",{src:F.hp,alt:"HP",style:{width:24,height:24,objectFit:"contain"},className:"mb-1"}),e.jsx("div",{className:"small text-muted fw-bold",children:"HP"}),e.jsx("div",{className:"fs-5 fw-bold text-success",children:j.hp})]})}),e.jsx("div",{className:"col-6 col-sm-3",children:e.jsxs("div",{className:"p-2 border rounded bg-light d-flex flex-column align-items-center",children:[e.jsx("img",{src:F.atk,alt:"ATK",style:{width:24,height:24,objectFit:"contain"},className:"mb-1"}),e.jsx("div",{className:"small text-muted fw-bold",children:"ATK"}),e.jsx("div",{className:"fs-5 fw-bold text-danger",children:j.atk})]})}),e.jsx("div",{className:"col-6 col-sm-3",children:e.jsxs("div",{className:"p-2 border rounded bg-light d-flex flex-column align-items-center",children:[e.jsx("img",{src:F.def,alt:"DEF",style:{width:24,height:24,objectFit:"contain"},className:"mb-1"}),e.jsx("div",{className:"small text-muted fw-bold",children:"DEF"}),e.jsx("div",{className:"fs-5 fw-bold text-primary",children:j.def.toFixed(1)})]})}),e.jsx("div",{className:"col-6 col-sm-3",children:e.jsxs("div",{className:"p-2 border rounded bg-light d-flex flex-column align-items-center",children:[e.jsx("img",{src:F.agi,alt:"AGI",style:{width:24,height:24,objectFit:"contain"},className:"mb-1"}),e.jsx("div",{className:"small text-muted fw-bold",children:"AGI"}),e.jsx("div",{className:"fs-5 fw-bold text-warning",children:j.agi.toFixed(1)})]})})]}),e.jsxs("div",{className:"small text-muted text-center mt-2",children:["Sát thương chí mạng: ",e.jsxs("span",{className:"fw-bold",children:["×",j.critMult.toFixed(2)]})]})]}),x?e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:e.jsx(i,{name:"sparkle",size:22})}),e.jsxs("span",{children:["Tiến hóa tiếp theo: ",x.name]})]}),e.jsxs("div",{className:"pet-evo-preview d-flex align-items-center gap-3 mb-3",children:[x.image?e.jsx("img",{src:x.image,alt:x.name,className:"pet-evo-next-img",style:{width:64,height:64,objectFit:"contain"}}):e.jsx("span",{className:"pet-evo-next-emoji",children:e.jsx(u,{e:x.emoji,size:48})}),e.jsxs("div",{children:[e.jsx("div",{className:"fw-bold fs-5",children:x.name}),e.jsxs("div",{className:"small text-muted",children:["Cấp ",(n==null?void 0:n.stage)??0," → Cấp ",((n==null?void 0:n.stage)??0)+1]})]})]}),e.jsxs("div",{className:"mb-3",children:[e.jsx("div",{className:"small fw-bold text-muted mb-2",children:"Điều kiện tiến hóa:"}),e.jsx("div",{className:"d-flex flex-column gap-2",children:y.checks.map((s,r)=>e.jsxs("div",{className:"d-flex justify-content-between align-items-center small p-2 rounded border bg-light",children:[e.jsxs("span",{children:[s.key==="milk"&&"🥛 Sữa",s.key==="gem"&&"💎 Gem",s.key==="stone"&&"🪨 Đá nguyên tố",s.key==="totalSkills"&&"📚 Tổng điểm 4 kỹ năng",s.kind==="skill"&&`🎯 Kỹ năng ${s.key}`]}),e.jsxs("span",{className:s.ok?"text-success fw-bold":"text-danger fw-bold",children:[s.have," / ",s.need," ",s.ok?"✓":"✗"]})]},r))})]}),e.jsx("button",{type:"button",className:`btn w-100 py-2 fw-bold ${y.ok?"btn-success":"btn-secondary"}`,disabled:!y.ok||T,onClick:ye,children:T?"Đang tiến hóa...":y.ok?"✨ Tiến hóa ngay!":"Chưa đủ điều kiện"})]}):e.jsx("div",{className:"pet-section-card mb-3 text-center py-3",children:e.jsx("span",{className:"badge bg-warning text-dark fs-6",children:"👑 Pet đã đạt cấp tối đa"})}),e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:e.jsx(i,{name:"heart",size:22})}),e.jsx("span",{children:"Trạng thái"})]}),e.jsx("div",{className:"pet-needs-grid",children:[{key:"energy",icon:"🍎",label:"Năng lượng",color:"#4CAF50",gradient:"linear-gradient(90deg, #66BB6A, #43A047)"},{key:"happiness",icon:"😊",label:"Vui vẻ",color:"#FFC107",gradient:"linear-gradient(90deg, #FFD54F, #FFC107)"},{key:"health",icon:"💤",label:"Sức khỏe",color:"#EF5350",gradient:"linear-gradient(90deg, #EF5350, #E53935)"},{key:"knowledge",icon:"📚",label:"Kiến thức",color:"#AB47BC",gradient:"linear-gradient(90deg, #CE93D8, #AB47BC)"}].map(s=>e.jsxs("div",{className:"pet-need-item",children:[e.jsx("div",{className:"pet-need-icon",children:e.jsx(u,{e:s.icon,size:26})}),e.jsxs("div",{className:"pet-need-info",children:[e.jsxs("div",{className:"pet-need-label",children:[e.jsx("span",{children:s.label}),e.jsxs("span",{className:a.needs[s.key]<30?"pet-need-critical":"",children:[a.needs[s.key],"%"]})]}),e.jsx("div",{className:"pet-need-bar",children:e.jsx("div",{className:"pet-need-fill",style:{width:`${a.needs[s.key]}%`,background:a.needs[s.key]<30?"#EF5350":s.gradient}})})]})]},s.key))}),W.length>0&&e.jsx("div",{className:"d-flex flex-wrap gap-2 mt-3 pt-2 border-top",children:W.map(s=>e.jsxs("button",{type:"button",className:"btn btn-sm btn-outline-cowdi d-inline-flex align-items-center gap-1",onClick:()=>Ee(s),children:[e.jsx(u,{e:s.emoji,size:16})," Cho ăn ",s.name]},s.id))})]}),e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:e.jsx(i,{name:"chart",size:22})}),e.jsx("span",{children:"Kỹ năng"})]}),e.jsx("div",{className:"pet-skills-grid",children:Object.entries(Ye).map(([s,r])=>{const b=a.skills[s]||0,S=Qe(b);return e.jsxs("div",{className:"pet-skill-card",style:{"--skill-color":r.color},children:[e.jsx("div",{className:"pet-skill-icon",children:ue[s]?e.jsx("img",{src:ue[s],alt:r.name,style:{width:34,height:34,objectFit:"contain"}}):e.jsx(i,{name:Ke[s],size:30})}),e.jsxs("div",{className:"pet-skill-level",children:["Lv.",S]}),e.jsx("div",{className:"pet-skill-name",children:r.name}),e.jsx("div",{className:"pet-skill-bar",children:e.jsx("div",{className:"pet-skill-fill",style:{width:`${Math.min(100,b%50*2)}%`}})}),e.jsxs("div",{className:"pet-skill-pts",children:[b," pts"]})]},s)})})]}),e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:e.jsx(i,{name:"clipboard",size:22})}),e.jsx("span",{children:"Nhiệm vụ hàng ngày"}),_e&&e.jsx("span",{className:"pet-badge-done",children:"Hoàn thành!"})]}),U.map(s=>e.jsxs("div",{className:`pet-quest-item ${s.done?"done":""}`,children:[e.jsx("span",{className:"pet-quest-check",children:e.jsx(i,{name:s.done?"check":"square",size:20})}),e.jsxs("div",{className:"pet-quest-info",children:[e.jsx("div",{className:"pet-quest-title",children:s.title}),e.jsx("div",{className:"pet-quest-desc",children:s.desc})]}),s.canClaim?e.jsxs("button",{className:"pet-quest-claim",onClick:()=>m(s.id),children:["+",s.reward," 🥛 Sữa"]}):e.jsxs("span",{className:"pet-quest-reward",children:["+",s.reward," 🥛"]})]},s.id))]}),e.jsxs("div",{className:"pet-quick-actions",children:[e.jsxs(z,{to:p!=null&&p.is_admin?"/lessons":"/",className:"pet-action-card",children:[e.jsx("div",{className:"pet-action-icon",children:e.jsx(i,{name:"grad",size:36})}),e.jsx("div",{className:"pet-action-label",children:"Học bài"}),e.jsxs("div",{className:"pet-action-hint",children:["+",e.jsx(i,{name:"apple",size:12})," +Skills"]})]}),e.jsxs(z,{to:"/practice",className:"pet-action-card",children:[e.jsx("div",{className:"pet-action-icon",children:e.jsx(i,{name:"gamepad",size:36})}),e.jsx("div",{className:"pet-action-label",children:"Luyện tập"}),e.jsxs("div",{className:"pet-action-hint",children:["+",e.jsx(i,{name:"smile",size:12})," +Skills"]})]}),e.jsxs(z,{to:"/collection",className:"pet-action-card",children:[e.jsx("div",{className:"pet-action-icon",children:e.jsx(i,{name:"box",size:36})}),e.jsx("div",{className:"pet-action-label",children:"Bộ sưu tập"}),e.jsxs("div",{className:"pet-action-hint",children:[Object.keys(o.collection).length,"/",Object.keys(he).length," pet"]})]}),e.jsxs(z,{to:`/shop?from=pet&pet=${o.activePetId||""}`,className:"pet-action-card",children:[e.jsx("div",{className:"pet-action-icon",children:e.jsx(i,{name:"bag",size:36})}),e.jsx("div",{className:"pet-action-label",children:"Cửa hàng"}),e.jsxs("div",{className:"pet-action-hint",children:["🥛 ",(((te=c.wallet)==null?void 0:te.milk)||c.availableXP||0).toLocaleString("vi-VN")]})]})]}),(t==null?void 0:t.stage)==="animation"&&e.jsx(Ue,{oldEvo:t.oldEvo,newEvo:t.newEvo,petName:t.petName,onComplete:()=>N(s=>s&&{...s,stage:"result"}),onSkip:()=>N(s=>s&&{...s,stage:"result"})}),(t==null?void 0:t.stage)==="result"&&e.jsxs("div",{className:"cowdi-evo-result-overlay",role:"dialog",children:[e.jsxs("div",{className:"cowdi-evo-result-card",children:[e.jsxs("div",{className:"cowdi-evo-result-title",children:[e.jsx(i,{name:"party",size:24})," ",t.petName," vừa tiến hóa!"]}),e.jsx("div",{className:"cowdi-evo-result-pet",children:(ie=t.newEvo)!=null&&ie.image?e.jsx("img",{src:t.newEvo.image,alt:t.newEvo.name}):e.jsx("span",{style:{fontSize:"6rem"},className:"emoji-big",children:e.jsx(u,{e:((ne=t.newEvo)==null?void 0:ne.emoji)||"✨",size:96})})}),e.jsx("div",{className:"cowdi-evo-result-name",children:(oe=t.newEvo)==null?void 0:oe.name}),e.jsxs("div",{className:"cowdi-evo-result-actions",children:[e.jsxs("button",{type:"button",className:"btn btn-cowdi-primary fw-bold",onClick:ke,children:[e.jsx(i,{name:"gift",size:18})," Khoe & mời bạn"]}),e.jsx("button",{type:"button",className:"btn btn-outline-secondary",onClick:()=>N(null),children:"Đóng"})]})]}),e.jsx("style",{children:`
            .cowdi-evo-result-overlay {
              position: fixed; inset: 0; z-index: 1201;
              background: rgba(10, 6, 20, 0.78);
              display: flex; align-items: center; justify-content: center;
              padding: 20px;
              animation: cowdiEvoResultIn 0.3s ease-out;
            }
            @keyframes cowdiEvoResultIn { from { opacity: 0; } to { opacity: 1; } }
            .cowdi-evo-result-card {
              background: linear-gradient(180deg, #fff 0%, #fff7e3 100%);
              border-radius: 20px;
              padding: 28px 24px;
              max-width: 360px; width: 100%;
              text-align: center;
              box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 4px rgba(255,215,100,0.4);
              animation: cowdiEvoResultPop 0.45s cubic-bezier(.2,1.4,.4,1);
            }
            @keyframes cowdiEvoResultPop {
              0%   { transform: scale(0.7) translateY(20px); opacity: 0; }
              100% { transform: scale(1) translateY(0); opacity: 1; }
            }
            .cowdi-evo-result-title {
              font-size: 1.15rem; font-weight: 700; color: #6a3d00;
              margin-bottom: 14px;
            }
            .cowdi-evo-result-pet {
              width: 180px; height: 180px; margin: 0 auto 12px;
              display: flex; align-items: center; justify-content: center;
              background: radial-gradient(circle, #fffbe4 0%, transparent 70%);
            }
            .cowdi-evo-result-pet img {
              width: 100%; height: 100%; object-fit: contain;
              filter: drop-shadow(0 6px 14px rgba(0,0,0,0.2));
              animation: cowdiEvoResultBob 2s ease-in-out infinite;
            }
            @keyframes cowdiEvoResultBob {
              0%, 100% { transform: translateY(0); }
              50%      { transform: translateY(-8px); }
            }
            .cowdi-evo-result-name {
              font-size: 1.4rem; font-weight: 800;
              background: linear-gradient(90deg, #ff8c42, #ff5e62);
              -webkit-background-clip: text; background-clip: text;
              -webkit-text-fill-color: transparent;
              margin-bottom: 18px;
            }
            .cowdi-evo-result-actions {
              display: flex; flex-direction: column; gap: 10px;
            }
            .cowdi-evo-result-actions .btn { padding: 10px 18px; border-radius: 12px; }
          `})]}),e.jsx(Ge,{open:ve,onClose:()=>H(!1),prefilledMessage:je})]})}export{ns as default};
