import{r as m,j as e}from"./react-nTLHQtbJ.js";import{I as i,E as x,u as je,c as ve,a as fe,b as ue,k as be,P as te,g as Ne,v as we,w as ye,d as ke,x as Ee,y as Se,D as ze,z as k,r as C,R as P,m as Fe,q as Ie,p as Ce,h as Pe,S as Te,s as Ae}from"./index-CAXehutl.js";import{L as E}from"./router-CvLzYUuu.js";import{B as S,S as ne}from"./CollectionPage-Dt2Qo0aU.js";import"./react-dom-Dp7c0bxT.js";import"./vendor-DSXEjpE4.js";import"./data-lessons-Dm-NVry5.js";import"./data-vocab-BtRUsb5n.js";function Le({oldEvo:l,newEvo:g,petName:T,onComplete:N,onSkip:A}){const[r,w]=m.useState("intro");m.useEffect(()=>{const v=setTimeout(()=>w("flashing"),500),d=setTimeout(()=>w("reveal"),3e3),f=setTimeout(()=>{w("done"),N&&N()},3800);return()=>{clearTimeout(v),clearTimeout(d),clearTimeout(f)}},[]);const c=r==="reveal"||r==="done"?g:l;return e.jsxs("div",{className:"cowdi-evo-overlay",role:"dialog","aria-label":"Pet đang tiến hóa",children:[e.jsx("div",{className:`cowdi-evo-rays ${r}`}),e.jsx("div",{className:"cowdi-evo-sparkles",children:Array.from({length:14}).map((v,d)=>e.jsx("span",{className:"cowdi-evo-spark",style:{left:`${d*73%100}%`,top:`${d*41%100}%`,animationDelay:`${d*137%1800}ms`},children:e.jsx(i,{name:"sparkles",size:22})},d))}),e.jsxs("div",{className:`cowdi-evo-stage ${r}`,children:[e.jsxs("div",{className:"cowdi-evo-pet-wrap",children:[c!=null&&c.image?e.jsx("img",{src:c.image,alt:c.name,className:"cowdi-evo-pet-img",draggable:!1}):e.jsx("span",{className:"cowdi-evo-pet-emoji emoji-big",children:e.jsx(x,{e:(c==null?void 0:c.emoji)||"🥚",size:144})}),e.jsx("div",{className:"cowdi-evo-flash"})]}),e.jsxs("div",{className:"cowdi-evo-caption",children:[r==="intro"&&e.jsxs("span",{children:[T||(l==null?void 0:l.name)," đang tiến hóa…"]}),r==="flashing"&&e.jsx("span",{children:"Một luồng sáng bao trùm…"}),(r==="reveal"||r==="done")&&e.jsxs("span",{className:"cowdi-evo-newname",children:[e.jsx(i,{name:"party",size:28})," ",g==null?void 0:g.name,"!"]})]})]}),e.jsx("button",{type:"button",className:"cowdi-evo-skip",onClick:A,children:"Bỏ qua ›"}),e.jsx("style",{children:`
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
      `})]})}function Ke(){var $,K,G,H,Q,X,U,V,W,q,J,Z,ee,se,ae,ie;je(Te["/pet"]);const{petData:l,getActivePetWithDecay:g,feedPet:T,renamePet:N,useFood:A,completeDailyQuest:r,addCoins:w,evolvePet:L}=ve(),{userData:c,refreshWallet:v}=fe(),{user:d}=ue(),f=be(),[ce,R]=m.useState(!1),[z,O]=m.useState(""),[F,B]=m.useState(!1),[n,u]=m.useState(null),[le,D]=m.useState(!1),[oe,re]=m.useState(""),a=g(),o=a?te[a.speciesId]:null,t=a&&o?Ne(a.speciesId,a.evolution):null,p=o&&t&&o.evolutions[t.stage+1]||null,j=a?we(a):null,_=a?ye(a):0,y=a?ke(a.needs):"happy",de=o?Ee(a.speciesId,y):"",me=c.wallet||{milk:c.availableXP||0,gem:0,stone:0},b=a?Se(a,me):{ok:!1,checks:[]};async function pe(){if(!(!b.ok||F||!l.activePetId)){B(!0);try{const s=await L(l.activePetId);s.ok?(v&&await v(),u({stage:"animation",oldEvo:t,newEvo:p,petName:a.customName}),f("Tiến hóa thành công! 🎉","success")):f(s.error||"Tiến hóa thất bại.","danger")}catch{f("Lỗi mạng khi tiến hóa.","danger")}finally{B(!1)}}}function he(){var h;if(!n)return;const s=`Cowdi của mình vừa tiến hóa thành ${((h=n.newEvo)==null?void 0:h.name)||"pet mới"}! 🎉
Học tiếng Anh chung cho vui nha 🐾`;re(s),u(null),D(!0)}const M=m.useMemo(()=>ze.map(s=>({...s,done:l.dailyQuests.completed.includes(s.id),canClaim:s.check(c)&&!l.dailyQuests.completed.includes(s.id)})),[l.dailyQuests,c]),xe=M.every(s=>s.done);if(m.useMemo(()=>k.filter(s=>s.category==="food"&&l.ownedItems.includes(s.id)),[l.ownedItems]),!a||!o)return e.jsxs("div",{className:"text-center py-5 fade-in",children:[e.jsx("div",{style:{fontSize:"5rem"},className:"emoji-big",children:e.jsx(i,{name:"egg",size:96})}),e.jsx("h2",{className:"fw-bold mt-3",children:"Đang tải pet..."})]});function Y(){z.trim()&&N(l.activePetId,z.trim()),R(!1)}return e.jsxs("div",{className:"fade-in",children:[e.jsx("div",{className:"text-center mb-4",children:e.jsxs("h2",{className:"fw-bold",children:[e.jsx("span",{className:"me-2",children:e.jsx(i,{name:"paw",size:32})}),"Pet của bạn"]})}),e.jsxs("div",{className:"pet-display-card mb-4",children:[e.jsxs("div",{className:`pet-stage-container ${y}`,children:[e.jsx("div",{className:"pet-floating-decor",children:(($=a.cosmetics)==null?void 0:$.effect)&&e.jsx("span",{className:"pet-effect-icon",children:e.jsx(x,{e:((K=k.find(s=>s.id===a.cosmetics.effect))==null?void 0:K.emoji)||"",size:30})})}),((G=a.cosmetics)==null?void 0:G.hat)&&e.jsx("div",{className:"pet-hat-img",children:e.jsx(x,{e:((H=k.find(s=>s.id===a.cosmetics.hat))==null?void 0:H.emoji)||"",size:42})}),e.jsx("div",{className:"pet-image-wrapper",children:t!=null&&t.image?e.jsx("img",{src:t.image,alt:t.name,className:"pet-character-img",draggable:!1}):e.jsx("div",{className:"pet-emoji-fallback emoji-big",children:e.jsx(x,{e:(t==null?void 0:t.emoji)||o.emoji,size:110})})}),((Q=a.cosmetics)==null?void 0:Q.outfit)&&e.jsx("div",{className:"pet-outfit-badge",children:e.jsx(x,{e:((X=k.find(s=>s.id===a.cosmetics.outfit))==null?void 0:X.emoji)||"",size:28})}),e.jsx("div",{className:"pet-mood-indicator",children:e.jsx(i,{name:y==="happy"?"smile":y==="sad"?"sad":"sick",size:26})})]}),e.jsxs("div",{className:"pet-info-section",children:[e.jsx("div",{className:"pet-name-area",children:ce?e.jsxs("div",{className:"d-flex justify-content-center gap-2",children:[e.jsx("input",{type:"text",className:"form-control form-control-sm pet-name-input",value:z,onChange:s=>O(s.target.value),maxLength:20,autoFocus:!0,onKeyDown:s=>s.key==="Enter"&&Y()}),e.jsx("button",{className:"btn btn-sm btn-cowdi-primary",onClick:Y,children:"✓"})]}):e.jsxs("h3",{className:"pet-name",children:[a.customName,e.jsx("button",{className:"btn btn-sm btn-link text-muted ms-1",onClick:()=>{R(!0),O(a.customName)},title:"Đổi tên",children:e.jsx(i,{name:"pencil",size:16})})]})}),e.jsxs("div",{className:"pet-badges",children:[e.jsx("span",{className:"pet-badge",style:{background:(U=C[o.element])==null?void 0:U.bg,color:(V=C[o.element])==null?void 0:V.text},children:(W=C[o.element])==null?void 0:W.name}),e.jsx("span",{className:"pet-badge",style:{background:(q=P[o.rarity])==null?void 0:q.bg,color:(J=P[o.rarity])==null?void 0:J.text},children:(Z=P[o.rarity])==null?void 0:Z.name}),e.jsxs("span",{className:"pet-badge pet-badge-power",children:[e.jsx(i,{name:"bolt",size:14})," ",_]})]}),e.jsx("div",{className:"pet-evolution-label",children:(t==null?void 0:t.name)||"Trứng"}),e.jsxs("div",{className:"pet-speech-bubble",children:[e.jsx("div",{className:"pet-speech-arrow"}),e.jsx("p",{className:"mb-0",children:e.jsx(Fe,{children:de})})]})]})]}),j&&e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:e.jsx(i,{name:"bolt",size:22})}),e.jsx("span",{children:"Chỉ số chiến đấu"}),e.jsxs("span",{className:"badge bg-primary ms-auto",children:["Lực chiến: ",_]})]}),e.jsxs("div",{className:"row g-2 text-center",children:[e.jsx("div",{className:"col-3",children:e.jsxs("div",{className:"p-2 border rounded bg-light d-flex flex-column align-items-center",children:[e.jsx("img",{src:S.hp,alt:"HP",style:{width:24,height:24,objectFit:"contain"},className:"mb-1"}),e.jsx("div",{className:"small text-muted fw-bold",children:"HP"}),e.jsx("div",{className:"fs-5 fw-bold text-success",children:j.hp})]})}),e.jsx("div",{className:"col-3",children:e.jsxs("div",{className:"p-2 border rounded bg-light d-flex flex-column align-items-center",children:[e.jsx("img",{src:S.atk,alt:"ATK",style:{width:24,height:24,objectFit:"contain"},className:"mb-1"}),e.jsx("div",{className:"small text-muted fw-bold",children:"ATK"}),e.jsx("div",{className:"fs-5 fw-bold text-danger",children:j.atk})]})}),e.jsx("div",{className:"col-3",children:e.jsxs("div",{className:"p-2 border rounded bg-light d-flex flex-column align-items-center",children:[e.jsx("img",{src:S.def,alt:"DEF",style:{width:24,height:24,objectFit:"contain"},className:"mb-1"}),e.jsx("div",{className:"small text-muted fw-bold",children:"DEF"}),e.jsx("div",{className:"fs-5 fw-bold text-primary",children:j.def.toFixed(1)})]})}),e.jsx("div",{className:"col-3",children:e.jsxs("div",{className:"p-2 border rounded bg-light d-flex flex-column align-items-center",children:[e.jsx("img",{src:S.agi,alt:"AGI",style:{width:24,height:24,objectFit:"contain"},className:"mb-1"}),e.jsx("div",{className:"small text-muted fw-bold",children:"AGI"}),e.jsx("div",{className:"fs-5 fw-bold text-warning",children:j.agi.toFixed(1)})]})})]}),e.jsxs("div",{className:"small text-muted text-center mt-2",children:["Sát thương chí mạng: ",e.jsxs("span",{className:"fw-bold",children:["×",j.critMult.toFixed(2)]})]})]}),p?e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:e.jsx(i,{name:"sparkle",size:22})}),e.jsxs("span",{children:["Tiến hóa tiếp theo: ",p.name]})]}),e.jsxs("div",{className:"pet-evo-preview d-flex align-items-center gap-3 mb-3",children:[p.image?e.jsx("img",{src:p.image,alt:p.name,className:"pet-evo-next-img",style:{width:64,height:64,objectFit:"contain"}}):e.jsx("span",{className:"pet-evo-next-emoji",children:e.jsx(x,{e:p.emoji,size:48})}),e.jsxs("div",{children:[e.jsx("div",{className:"fw-bold fs-5",children:p.name}),e.jsxs("div",{className:"small text-muted",children:["Cấp ",(t==null?void 0:t.stage)??0," → Cấp ",((t==null?void 0:t.stage)??0)+1]})]})]}),e.jsxs("div",{className:"mb-3",children:[e.jsx("div",{className:"small fw-bold text-muted mb-2",children:"Điều kiện tiến hóa:"}),e.jsx("div",{className:"d-flex flex-column gap-2",children:b.checks.map((s,h)=>e.jsxs("div",{className:"d-flex justify-content-between align-items-center small p-2 rounded border bg-light",children:[e.jsxs("span",{children:[s.key==="milk"&&"🥛 Sữa",s.key==="gem"&&"💎 Gem",s.key==="stone"&&"🪨 Đá nguyên tố",s.key==="totalSkills"&&"📚 Tổng điểm 4 kỹ năng",s.kind==="skill"&&`🎯 Kỹ năng ${s.key}`]}),e.jsxs("span",{className:s.ok?"text-success fw-bold":"text-danger fw-bold",children:[s.have," / ",s.need," ",s.ok?"✓":"✗"]})]},h))})]}),e.jsx("button",{type:"button",className:`btn w-100 py-2 fw-bold ${b.ok?"btn-success":"btn-secondary"}`,disabled:!b.ok||F,onClick:pe,children:F?"Đang tiến hóa...":b.ok?"✨ Tiến hóa ngay!":"Chưa đủ điều kiện"})]}):e.jsx("div",{className:"pet-section-card mb-3 text-center py-3",children:e.jsx("span",{className:"badge bg-warning text-dark fs-6",children:"👑 Pet đã đạt cấp tối đa"})}),e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:e.jsx(i,{name:"heart",size:22})}),e.jsx("span",{children:"Trạng thái"})]}),e.jsx("div",{className:"pet-needs-grid",children:[{key:"energy",icon:"🍎",label:"Năng lượng",color:"#4CAF50",gradient:"linear-gradient(90deg, #66BB6A, #43A047)"},{key:"happiness",icon:"😊",label:"Vui vẻ",color:"#FFC107",gradient:"linear-gradient(90deg, #FFD54F, #FFC107)"},{key:"health",icon:"💤",label:"Sức khỏe",color:"#EF5350",gradient:"linear-gradient(90deg, #EF5350, #E53935)"},{key:"knowledge",icon:"📚",label:"Kiến thức",color:"#AB47BC",gradient:"linear-gradient(90deg, #CE93D8, #AB47BC)"}].map(s=>e.jsxs("div",{className:"pet-need-item",children:[e.jsx("div",{className:"pet-need-icon",children:e.jsx(x,{e:s.icon,size:26})}),e.jsxs("div",{className:"pet-need-info",children:[e.jsxs("div",{className:"pet-need-label",children:[e.jsx("span",{children:s.label}),e.jsxs("span",{className:a.needs[s.key]<30?"pet-need-critical":"",children:[a.needs[s.key],"%"]})]}),e.jsx("div",{className:"pet-need-bar",children:e.jsx("div",{className:"pet-need-fill",style:{width:`${a.needs[s.key]}%`,background:a.needs[s.key]<30?"#EF5350":s.gradient}})})]})]},s.key))})]}),e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:e.jsx(i,{name:"chart",size:22})}),e.jsx("span",{children:"Kỹ năng"})]}),e.jsx("div",{className:"pet-skills-grid",children:Object.entries(Ie).map(([s,h])=>{const I=a.skills[s]||0,ge=Ae(I);return e.jsxs("div",{className:"pet-skill-card",style:{"--skill-color":h.color},children:[e.jsx("div",{className:"pet-skill-icon",children:ne[s]?e.jsx("img",{src:ne[s],alt:h.name,style:{width:34,height:34,objectFit:"contain"}}):e.jsx(i,{name:Ce[s],size:30})}),e.jsxs("div",{className:"pet-skill-level",children:["Lv.",ge]}),e.jsx("div",{className:"pet-skill-name",children:h.name}),e.jsx("div",{className:"pet-skill-bar",children:e.jsx("div",{className:"pet-skill-fill",style:{width:`${Math.min(100,I%50*2)}%`}})}),e.jsxs("div",{className:"pet-skill-pts",children:[I," pts"]})]},s)})})]}),e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:e.jsx(i,{name:"clipboard",size:22})}),e.jsx("span",{children:"Nhiệm vụ hàng ngày"}),xe&&e.jsx("span",{className:"pet-badge-done",children:"Hoàn thành!"})]}),M.map(s=>e.jsxs("div",{className:`pet-quest-item ${s.done?"done":""}`,children:[e.jsx("span",{className:"pet-quest-check",children:e.jsx(i,{name:s.done?"check":"square",size:20})}),e.jsxs("div",{className:"pet-quest-info",children:[e.jsx("div",{className:"pet-quest-title",children:s.title}),e.jsx("div",{className:"pet-quest-desc",children:s.desc})]}),s.canClaim?e.jsxs("button",{className:"pet-quest-claim",onClick:()=>r(s.id),children:["+",s.reward," 🥛 Sữa"]}):e.jsxs("span",{className:"pet-quest-reward",children:["+",s.reward," 🥛"]})]},s.id))]}),e.jsxs("div",{className:"pet-quick-actions",children:[e.jsxs(E,{to:d!=null&&d.is_admin?"/lessons":"/",className:"pet-action-card",children:[e.jsx("div",{className:"pet-action-icon",children:e.jsx(i,{name:"grad",size:36})}),e.jsx("div",{className:"pet-action-label",children:"Học bài"}),e.jsxs("div",{className:"pet-action-hint",children:["+",e.jsx(i,{name:"apple",size:12})," +Skills"]})]}),e.jsxs(E,{to:"/practice",className:"pet-action-card",children:[e.jsx("div",{className:"pet-action-icon",children:e.jsx(i,{name:"gamepad",size:36})}),e.jsx("div",{className:"pet-action-label",children:"Luyện tập"}),e.jsxs("div",{className:"pet-action-hint",children:["+",e.jsx(i,{name:"smile",size:12})," +Skills"]})]}),e.jsxs(E,{to:"/collection",className:"pet-action-card",children:[e.jsx("div",{className:"pet-action-icon",children:e.jsx(i,{name:"box",size:36})}),e.jsx("div",{className:"pet-action-label",children:"Bộ sưu tập"}),e.jsxs("div",{className:"pet-action-hint",children:[Object.keys(l.collection).length,"/",Object.keys(te).length," pet"]})]}),e.jsxs(E,{to:"/shop",className:"pet-action-card",children:[e.jsx("div",{className:"pet-action-icon",children:e.jsx(i,{name:"bag",size:36})}),e.jsx("div",{className:"pet-action-label",children:"Cửa hàng"}),e.jsxs("div",{className:"pet-action-hint",children:["🥛 ",(((ee=c.wallet)==null?void 0:ee.milk)||c.availableXP||0).toLocaleString("vi-VN")]})]})]}),(n==null?void 0:n.stage)==="animation"&&e.jsx(Le,{oldEvo:n.oldEvo,newEvo:n.newEvo,petName:n.petName,onComplete:()=>u(s=>s&&{...s,stage:"result"}),onSkip:()=>u(s=>s&&{...s,stage:"result"})}),(n==null?void 0:n.stage)==="result"&&e.jsxs("div",{className:"cowdi-evo-result-overlay",role:"dialog",children:[e.jsxs("div",{className:"cowdi-evo-result-card",children:[e.jsxs("div",{className:"cowdi-evo-result-title",children:[e.jsx(i,{name:"party",size:24})," ",n.petName," vừa tiến hóa!"]}),e.jsx("div",{className:"cowdi-evo-result-pet",children:(se=n.newEvo)!=null&&se.image?e.jsx("img",{src:n.newEvo.image,alt:n.newEvo.name}):e.jsx("span",{style:{fontSize:"6rem"},className:"emoji-big",children:e.jsx(x,{e:((ae=n.newEvo)==null?void 0:ae.emoji)||"✨",size:96})})}),e.jsx("div",{className:"cowdi-evo-result-name",children:(ie=n.newEvo)==null?void 0:ie.name}),e.jsxs("div",{className:"cowdi-evo-result-actions",children:[e.jsxs("button",{type:"button",className:"btn btn-cowdi-primary fw-bold",onClick:he,children:[e.jsx(i,{name:"gift",size:18})," Khoe & mời bạn"]}),e.jsx("button",{type:"button",className:"btn btn-outline-secondary",onClick:()=>u(null),children:"Đóng"})]})]}),e.jsx("style",{children:`
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
          `})]}),e.jsx(Pe,{open:le,onClose:()=>D(!1),prefilledMessage:oe})]})}export{Ke as default};
