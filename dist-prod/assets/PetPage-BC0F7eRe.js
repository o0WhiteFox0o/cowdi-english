import{r as o,j as e}from"./react-CNvHvvCs.js";import{I as t,E as g,u as Fe,c as Ce,a as Ie,b as Pe,n as Te,e as Ae,P as ge,g as Re,B as Le,D as Oe,d as _e,F as Be,H as De,J as w,i as $e,t as Me,j as Ye,y as R,R as L,w as Ke,v as He,k as Ge,S as Qe,p as Xe}from"./index-BcfUUhdk.js";import{L as E}from"./router-Czaw9YMG.js";import{C as fe}from"./cosmetics-data-C5pLg8ot.js";import{P as We}from"./PetSpeech-C53zJM7T.js";import{B as S,S as ue}from"./CollectionPage-C7HANpo8.js";import"./react-dom-CxvtPLOl.js";import"./vendor-DVzZvczY.js";import"./data-lessons-CFhX3z5T.js";import"./data-vocab-BtRUsb5n.js";function Ue({oldEvo:l,newEvo:f,petName:O,onComplete:y,onSkip:z}){const[d,k]=o.useState("intro");o.useEffect(()=>{const j=setTimeout(()=>k("flashing"),500),m=setTimeout(()=>k("reveal"),3e3),u=setTimeout(()=>{k("done"),y&&y()},3800);return()=>{clearTimeout(j),clearTimeout(m),clearTimeout(u)}},[]);const c=d==="reveal"||d==="done"?f:l;return e.jsxs("div",{className:"cowdi-evo-overlay",role:"dialog","aria-label":"Pet đang tiến hóa",children:[e.jsx("div",{className:`cowdi-evo-rays ${d}`}),e.jsx("div",{className:"cowdi-evo-sparkles",children:Array.from({length:14}).map((j,m)=>e.jsx("span",{className:"cowdi-evo-spark",style:{left:`${m*73%100}%`,top:`${m*41%100}%`,animationDelay:`${m*137%1800}ms`},children:e.jsx(t,{name:"sparkles",size:22})},m))}),e.jsxs("div",{className:`cowdi-evo-stage ${d}`,children:[e.jsxs("div",{className:"cowdi-evo-pet-wrap",children:[c!=null&&c.image?e.jsx("img",{src:c.image,alt:c.name,className:"cowdi-evo-pet-img",draggable:!1}):e.jsx("span",{className:"cowdi-evo-pet-emoji emoji-big",children:e.jsx(g,{e:(c==null?void 0:c.emoji)||"🥚",size:144})}),e.jsx("div",{className:"cowdi-evo-flash"})]}),e.jsxs("div",{className:"cowdi-evo-caption",children:[d==="intro"&&e.jsxs("span",{children:[O||(l==null?void 0:l.name)," đang tiến hóa…"]}),d==="flashing"&&e.jsx("span",{children:"Một luồng sáng bao trùm…"}),(d==="reveal"||d==="done")&&e.jsxs("span",{className:"cowdi-evo-newname",children:[e.jsx(t,{name:"party",size:28})," ",f==null?void 0:f.name,"!"]})]})]}),e.jsx("button",{type:"button",className:"cowdi-evo-skip",onClick:z,children:"Bỏ qua ›"}),e.jsx("style",{children:`
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
      `})]})}function ls(){var U,V,J,Z,q,ee,se,ae,ie,te,ne,le,ce,oe,re,de,me,pe,he,xe;Fe(Qe["/pet"]);const{petData:l,getActivePetWithDecay:f,feedPet:O,renamePet:y,useFood:z,completeDailyQuest:d,addCoins:k,evolvePet:_}=Ce(),{userData:c,refreshWallet:j}=Ie(),{user:m}=Pe(),u=Te(),[ve,B]=o.useState(!1),[F,D]=o.useState(""),[C,$]=o.useState(!1),M=o.useRef(null),{register:Y,dispatch:p,speech:I}=Ae();o.useEffect(()=>{const s=Y("pet",M);return p("screen_enter",{screen:"pet"}),s},[Y,p]);const[i,b]=o.useState(null),[je,K]=o.useState(!1),[be,Ne]=o.useState(""),a=f(),r=a?ge[a.speciesId]:null,n=a&&r?Re(a.speciesId,a.evolution):null,h=r&&n&&r.evolutions[n.stage+1]||null,v=a?Le(a):null,H=a?Oe(a):0,P=a?_e(a.needs):"happy",G=I&&I.slot==="pet"?I:null,we=c.wallet||{milk:c.availableXP||0,gem:0,stone:0},N=a?Be(a,we):{ok:!1,checks:[]};async function ye(){if(!(!N.ok||C||!l.activePetId)){$(!0);try{const s=await _(l.activePetId);s.ok?(j&&await j(),b({stage:"animation",oldEvo:n,newEvo:h,petName:a.customName}),u("Tiến hóa thành công! 🎉","success")):u(s.error||"Tiến hóa thất bại.","danger")}catch{u("Lỗi mạng khi tiến hóa.","danger")}finally{$(!1)}}}function ke(){var x;if(!i)return;const s=`Cowdi của mình vừa tiến hóa thành ${((x=i.newEvo)==null?void 0:x.name)||"pet mới"}! 🎉
Học tiếng Anh chung cho vui nha 🐾`;Ne(s),b(null),K(!0)}const Q=o.useMemo(()=>De.map(s=>({...s,done:l.dailyQuests.completed.includes(s.id),canClaim:s.check(c)&&!l.dailyQuests.completed.includes(s.id)})),[l.dailyQuests,c]),Ee=Q.every(s=>s.done),X=o.useMemo(()=>w.filter(s=>s.category==="food"&&l.ownedItems.includes(s.id)),[l.ownedItems]),T=o.useRef(a==null?void 0:a.evolution);o.useEffect(()=>{a&&(T.current!=null&&a.evolution>T.current&&p("evolve_ok",{stage:a.evolution+1}),T.current=a.evolution)},[a==null?void 0:a.evolution,p]),o.useEffect(()=>{if((i==null?void 0:i.stage)==="animation"&&i.newEvo){const s=(i.newEvo.stage??((a==null?void 0:a.evolution)||0))+1;p("evolve_ok",{stage:s})}},[i,p]);function Se(s){!s||!a||z(s.id)&&(p("feed"),u(`${a.customName} rất thích ${s.name}!`,"success"))}if(!a||!r)return e.jsxs("div",{className:"text-center py-5 fade-in",children:[e.jsx("div",{style:{fontSize:"5rem"},className:"emoji-big",children:e.jsx(t,{name:"egg",size:96})}),e.jsx("h2",{className:"fw-bold mt-3",children:"Đang tải pet..."})]});function W(){F.trim()&&y(l.activePetId,F.trim()),B(!1)}return e.jsxs("div",{className:"fade-in",children:[e.jsx("div",{className:"text-center mb-4",children:e.jsxs("h2",{className:"fw-bold",children:[e.jsx("span",{className:"me-2",children:e.jsx(t,{name:"paw",size:32})}),"Pet của bạn"]})}),e.jsxs("div",{className:"pet-display-card mb-4",children:[e.jsxs("div",{className:`pet-stage-container ${P}`,style:{background:(U=a.cosmetics)!=null&&U.room&&(((V=fe[a.cosmetics.room])==null?void 0:V.bgStyle)||((J=w.find(s=>s.id===a.cosmetics.room))==null?void 0:J.bgStyle))||void 0,transition:"background 0.3s ease"},children:[e.jsx("div",{className:"pet-floating-decor",children:((Z=a.cosmetics)==null?void 0:Z.effect)&&e.jsx("span",{className:"pet-effect-icon",children:e.jsx(g,{e:((q=fe[a.cosmetics.effect])==null?void 0:q.emoji)||((ee=w.find(s=>s.id===a.cosmetics.effect))==null?void 0:ee.emoji)||"",size:30})})}),((se=a.cosmetics)==null?void 0:se.hat)&&e.jsx("div",{className:"pet-hat-img",children:e.jsx(g,{e:((ae=w.find(s=>s.id===a.cosmetics.hat))==null?void 0:ae.emoji)||"",size:42})}),e.jsx("div",{className:"pet-image-wrapper",children:e.jsx($e,{ref:M,petId:a.speciesId,stage:(a.evolution||0)+1,group:r.group,bond:Ye(a.skills),topSkill:Me(a.skills),mode:"home",canvasBubble:!1,fallbackSrc:n==null?void 0:n.image,alt:(n==null?void 0:n.name)||a.customName,className:"pet-character-img",onClip:s=>s==="tap"&&p("pet_tap")})}),((ie=a.cosmetics)==null?void 0:ie.outfit)&&e.jsx("div",{className:"pet-outfit-badge",children:e.jsx(g,{e:((te=w.find(s=>s.id===a.cosmetics.outfit))==null?void 0:te.emoji)||"",size:28})}),e.jsx("div",{className:"pet-mood-indicator",children:e.jsx(t,{name:P==="happy"?"smile":P==="sad"?"sad":"sick",size:26})})]}),e.jsxs("div",{className:"pet-info-section",children:[e.jsx("div",{className:"pet-name-area",children:ve?e.jsxs("div",{className:"d-flex justify-content-center gap-2",children:[e.jsx("input",{type:"text",className:"form-control form-control-sm pet-name-input",value:F,onChange:s=>D(s.target.value),maxLength:20,autoFocus:!0,onKeyDown:s=>s.key==="Enter"&&W()}),e.jsx("button",{className:"btn btn-sm btn-cowdi-primary",onClick:W,children:"✓"})]}):e.jsxs("h3",{className:"pet-name",children:[a.customName,e.jsx("button",{className:"btn btn-sm btn-link text-muted ms-1",onClick:()=>{B(!0),D(a.customName)},title:"Đổi tên",children:e.jsx(t,{name:"pencil",size:16})})]})}),e.jsxs("div",{className:"pet-badges",children:[e.jsx("span",{className:"pet-badge",style:{background:(ne=R[r.element])==null?void 0:ne.bg,color:(le=R[r.element])==null?void 0:le.text},children:(ce=R[r.element])==null?void 0:ce.name}),e.jsx("span",{className:"pet-badge",style:{background:(oe=L[r.rarity])==null?void 0:oe.bg,color:(re=L[r.rarity])==null?void 0:re.text},children:(de=L[r.rarity])==null?void 0:de.name}),e.jsxs("span",{className:"pet-badge pet-badge-power",children:[e.jsx(t,{name:"bolt",size:14})," ",H]})]}),e.jsx("div",{className:"pet-evolution-label",children:(n==null?void 0:n.name)||"Trứng"}),e.jsx("div",{style:{maxWidth:320,margin:"8px auto 0",minHeight:44},children:G?e.jsx(We,{speech:G,placement:"top"}):e.jsxs("div",{className:"text-muted small",children:["Chạm vào ",a.customName," để chơi cùng nha!"]})})]})]}),v&&e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:e.jsx(t,{name:"bolt",size:22})}),e.jsx("span",{children:"Chỉ số chiến đấu"}),e.jsxs("span",{className:"badge bg-primary ms-auto",children:["Lực chiến: ",H]})]}),e.jsxs("div",{className:"row g-2 text-center",children:[e.jsx("div",{className:"col-6 col-sm-3",children:e.jsxs("div",{className:"p-2 border rounded bg-light d-flex flex-column align-items-center",children:[e.jsx("img",{src:S.hp,alt:"HP",style:{width:24,height:24,objectFit:"contain"},className:"mb-1"}),e.jsx("div",{className:"small text-muted fw-bold",children:"HP"}),e.jsx("div",{className:"fs-5 fw-bold text-success",children:v.hp})]})}),e.jsx("div",{className:"col-6 col-sm-3",children:e.jsxs("div",{className:"p-2 border rounded bg-light d-flex flex-column align-items-center",children:[e.jsx("img",{src:S.atk,alt:"ATK",style:{width:24,height:24,objectFit:"contain"},className:"mb-1"}),e.jsx("div",{className:"small text-muted fw-bold",children:"ATK"}),e.jsx("div",{className:"fs-5 fw-bold text-danger",children:v.atk})]})}),e.jsx("div",{className:"col-6 col-sm-3",children:e.jsxs("div",{className:"p-2 border rounded bg-light d-flex flex-column align-items-center",children:[e.jsx("img",{src:S.def,alt:"DEF",style:{width:24,height:24,objectFit:"contain"},className:"mb-1"}),e.jsx("div",{className:"small text-muted fw-bold",children:"DEF"}),e.jsx("div",{className:"fs-5 fw-bold text-primary",children:v.def.toFixed(1)})]})}),e.jsx("div",{className:"col-6 col-sm-3",children:e.jsxs("div",{className:"p-2 border rounded bg-light d-flex flex-column align-items-center",children:[e.jsx("img",{src:S.agi,alt:"AGI",style:{width:24,height:24,objectFit:"contain"},className:"mb-1"}),e.jsx("div",{className:"small text-muted fw-bold",children:"AGI"}),e.jsx("div",{className:"fs-5 fw-bold text-warning",children:v.agi.toFixed(1)})]})})]}),e.jsxs("div",{className:"small text-muted text-center mt-2",children:["Sát thương chí mạng: ",e.jsxs("span",{className:"fw-bold",children:["×",v.critMult.toFixed(2)]})]})]}),h?e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:e.jsx(t,{name:"sparkle",size:22})}),e.jsxs("span",{children:["Tiến hóa tiếp theo: ",h.name]})]}),e.jsxs("div",{className:"pet-evo-preview d-flex align-items-center gap-3 mb-3",children:[h.image?e.jsx("img",{src:h.image,alt:h.name,className:"pet-evo-next-img",style:{width:64,height:64,objectFit:"contain"}}):e.jsx("span",{className:"pet-evo-next-emoji",children:e.jsx(g,{e:h.emoji,size:48})}),e.jsxs("div",{children:[e.jsx("div",{className:"fw-bold fs-5",children:h.name}),e.jsxs("div",{className:"small text-muted",children:["Cấp ",(n==null?void 0:n.stage)??0," → Cấp ",((n==null?void 0:n.stage)??0)+1]})]})]}),e.jsxs("div",{className:"mb-3",children:[e.jsx("div",{className:"small fw-bold text-muted mb-2",children:"Điều kiện tiến hóa:"}),e.jsx("div",{className:"d-flex flex-column gap-2",children:N.checks.map((s,x)=>e.jsxs("div",{className:"d-flex justify-content-between align-items-center small p-2 rounded border bg-light",children:[e.jsxs("span",{children:[s.key==="milk"&&"🥛 Sữa",s.key==="gem"&&"💎 Gem",s.key==="stone"&&"🪨 Đá nguyên tố",s.key==="totalSkills"&&"📚 Tổng điểm 4 kỹ năng",s.kind==="skill"&&`🎯 Kỹ năng ${s.key}`]}),e.jsxs("span",{className:s.ok?"text-success fw-bold":"text-danger fw-bold",children:[s.have," / ",s.need," ",s.ok?"✓":"✗"]})]},x))})]}),e.jsx("button",{type:"button",className:`btn w-100 py-2 fw-bold ${N.ok?"btn-success":"btn-secondary"}`,disabled:!N.ok||C,onClick:ye,children:C?"Đang tiến hóa...":N.ok?"✨ Tiến hóa ngay!":"Chưa đủ điều kiện"})]}):e.jsx("div",{className:"pet-section-card mb-3 text-center py-3",children:e.jsx("span",{className:"badge bg-warning text-dark fs-6",children:"👑 Pet đã đạt cấp tối đa"})}),e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:e.jsx(t,{name:"heart",size:22})}),e.jsx("span",{children:"Trạng thái"})]}),e.jsx("div",{className:"pet-needs-grid",children:[{key:"energy",icon:"🍎",label:"Năng lượng",color:"#4CAF50",gradient:"linear-gradient(90deg, #66BB6A, #43A047)"},{key:"happiness",icon:"😊",label:"Vui vẻ",color:"#FFC107",gradient:"linear-gradient(90deg, #FFD54F, #FFC107)"},{key:"health",icon:"💤",label:"Sức khỏe",color:"#EF5350",gradient:"linear-gradient(90deg, #EF5350, #E53935)"},{key:"knowledge",icon:"📚",label:"Kiến thức",color:"#AB47BC",gradient:"linear-gradient(90deg, #CE93D8, #AB47BC)"}].map(s=>e.jsxs("div",{className:"pet-need-item",children:[e.jsx("div",{className:"pet-need-icon",children:e.jsx(g,{e:s.icon,size:26})}),e.jsxs("div",{className:"pet-need-info",children:[e.jsxs("div",{className:"pet-need-label",children:[e.jsx("span",{children:s.label}),e.jsxs("span",{className:a.needs[s.key]<30?"pet-need-critical":"",children:[a.needs[s.key],"%"]})]}),e.jsx("div",{className:"pet-need-bar",children:e.jsx("div",{className:"pet-need-fill",style:{width:`${a.needs[s.key]}%`,background:a.needs[s.key]<30?"#EF5350":s.gradient}})})]})]},s.key))}),X.length>0&&e.jsx("div",{className:"d-flex flex-wrap gap-2 mt-3 pt-2 border-top",children:X.map(s=>e.jsxs("button",{type:"button",className:"btn btn-sm btn-outline-cowdi d-inline-flex align-items-center gap-1",onClick:()=>Se(s),children:[e.jsx(g,{e:s.emoji,size:16})," Cho ăn ",s.name]},s.id))})]}),e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:e.jsx(t,{name:"chart",size:22})}),e.jsx("span",{children:"Kỹ năng"})]}),e.jsx("div",{className:"pet-skills-grid",children:Object.entries(Ke).map(([s,x])=>{const A=a.skills[s]||0,ze=Xe(A);return e.jsxs("div",{className:"pet-skill-card",style:{"--skill-color":x.color},children:[e.jsx("div",{className:"pet-skill-icon",children:ue[s]?e.jsx("img",{src:ue[s],alt:x.name,style:{width:34,height:34,objectFit:"contain"}}):e.jsx(t,{name:He[s],size:30})}),e.jsxs("div",{className:"pet-skill-level",children:["Lv.",ze]}),e.jsx("div",{className:"pet-skill-name",children:x.name}),e.jsx("div",{className:"pet-skill-bar",children:e.jsx("div",{className:"pet-skill-fill",style:{width:`${Math.min(100,A%50*2)}%`}})}),e.jsxs("div",{className:"pet-skill-pts",children:[A," pts"]})]},s)})})]}),e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:e.jsx(t,{name:"clipboard",size:22})}),e.jsx("span",{children:"Nhiệm vụ hàng ngày"}),Ee&&e.jsx("span",{className:"pet-badge-done",children:"Hoàn thành!"})]}),Q.map(s=>e.jsxs("div",{className:`pet-quest-item ${s.done?"done":""}`,children:[e.jsx("span",{className:"pet-quest-check",children:e.jsx(t,{name:s.done?"check":"square",size:20})}),e.jsxs("div",{className:"pet-quest-info",children:[e.jsx("div",{className:"pet-quest-title",children:s.title}),e.jsx("div",{className:"pet-quest-desc",children:s.desc})]}),s.canClaim?e.jsxs("button",{className:"pet-quest-claim",onClick:()=>d(s.id),children:["+",s.reward," 🥛 Sữa"]}):e.jsxs("span",{className:"pet-quest-reward",children:["+",s.reward," 🥛"]})]},s.id))]}),e.jsxs("div",{className:"pet-quick-actions",children:[e.jsxs(E,{to:m!=null&&m.is_admin?"/lessons":"/",className:"pet-action-card",children:[e.jsx("div",{className:"pet-action-icon",children:e.jsx(t,{name:"grad",size:36})}),e.jsx("div",{className:"pet-action-label",children:"Học bài"}),e.jsxs("div",{className:"pet-action-hint",children:["+",e.jsx(t,{name:"apple",size:12})," +Skills"]})]}),e.jsxs(E,{to:"/practice",className:"pet-action-card",children:[e.jsx("div",{className:"pet-action-icon",children:e.jsx(t,{name:"gamepad",size:36})}),e.jsx("div",{className:"pet-action-label",children:"Luyện tập"}),e.jsxs("div",{className:"pet-action-hint",children:["+",e.jsx(t,{name:"smile",size:12})," +Skills"]})]}),e.jsxs(E,{to:"/collection",className:"pet-action-card",children:[e.jsx("div",{className:"pet-action-icon",children:e.jsx(t,{name:"box",size:36})}),e.jsx("div",{className:"pet-action-label",children:"Bộ sưu tập"}),e.jsxs("div",{className:"pet-action-hint",children:[Object.keys(l.collection).length,"/",Object.keys(ge).length," pet"]})]}),e.jsxs(E,{to:`/shop?from=pet&pet=${l.activePetId||""}`,className:"pet-action-card",children:[e.jsx("div",{className:"pet-action-icon",children:e.jsx(t,{name:"bag",size:36})}),e.jsx("div",{className:"pet-action-label",children:"Cửa hàng"}),e.jsxs("div",{className:"pet-action-hint",children:["🥛 ",(((me=c.wallet)==null?void 0:me.milk)||c.availableXP||0).toLocaleString("vi-VN")]})]})]}),(i==null?void 0:i.stage)==="animation"&&e.jsx(Ue,{oldEvo:i.oldEvo,newEvo:i.newEvo,petName:i.petName,onComplete:()=>b(s=>s&&{...s,stage:"result"}),onSkip:()=>b(s=>s&&{...s,stage:"result"})}),(i==null?void 0:i.stage)==="result"&&e.jsxs("div",{className:"cowdi-evo-result-overlay",role:"dialog",children:[e.jsxs("div",{className:"cowdi-evo-result-card",children:[e.jsxs("div",{className:"cowdi-evo-result-title",children:[e.jsx(t,{name:"party",size:24})," ",i.petName," vừa tiến hóa!"]}),e.jsx("div",{className:"cowdi-evo-result-pet",children:(pe=i.newEvo)!=null&&pe.image?e.jsx("img",{src:i.newEvo.image,alt:i.newEvo.name}):e.jsx("span",{style:{fontSize:"6rem"},className:"emoji-big",children:e.jsx(g,{e:((he=i.newEvo)==null?void 0:he.emoji)||"✨",size:96})})}),e.jsx("div",{className:"cowdi-evo-result-name",children:(xe=i.newEvo)==null?void 0:xe.name}),e.jsxs("div",{className:"cowdi-evo-result-actions",children:[e.jsxs("button",{type:"button",className:"btn btn-cowdi-primary fw-bold",onClick:ke,children:[e.jsx(t,{name:"gift",size:18})," Khoe & mời bạn"]}),e.jsx("button",{type:"button",className:"btn btn-outline-secondary",onClick:()=>b(null),children:"Đóng"})]})]}),e.jsx("style",{children:`
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
          `})]}),e.jsx(Ge,{open:je,onClose:()=>K(!1),prefilledMessage:be})]})}export{ls as default};
