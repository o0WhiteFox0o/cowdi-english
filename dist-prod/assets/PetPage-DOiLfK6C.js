import{r as o,j as e}from"./react-nTLHQtbJ.js";import{I as t,E as x,u as be,c as Ne,a as we,b as ye,m as ke,P as ce,g as Ee,y as Se,z as ze,d as Fe,A as Ie,B as Ce,D as Te,F as E,h as Pe,t as Ae,i as Re,w as A,R,p as Le,v as Oe,s as Be,j as _e,S as De,o as $e}from"./index-F8olof3X.js";import{L as S}from"./router-CvLzYUuu.js";import{B as z,S as oe}from"./CollectionPage-CWgoTpYF.js";import"./react-dom-Dp7c0bxT.js";import"./vendor-DSXEjpE4.js";import"./data-lessons-Dm-NVry5.js";import"./data-vocab-BtRUsb5n.js";function Me({oldEvo:c,newEvo:g,petName:L,onComplete:N,onSkip:F}){const[m,w]=o.useState("intro");o.useEffect(()=>{const v=setTimeout(()=>w("flashing"),500),p=setTimeout(()=>w("reveal"),3e3),f=setTimeout(()=>{w("done"),N&&N()},3800);return()=>{clearTimeout(v),clearTimeout(p),clearTimeout(f)}},[]);const l=m==="reveal"||m==="done"?g:c;return e.jsxs("div",{className:"cowdi-evo-overlay",role:"dialog","aria-label":"Pet đang tiến hóa",children:[e.jsx("div",{className:`cowdi-evo-rays ${m}`}),e.jsx("div",{className:"cowdi-evo-sparkles",children:Array.from({length:14}).map((v,p)=>e.jsx("span",{className:"cowdi-evo-spark",style:{left:`${p*73%100}%`,top:`${p*41%100}%`,animationDelay:`${p*137%1800}ms`},children:e.jsx(t,{name:"sparkles",size:22})},p))}),e.jsxs("div",{className:`cowdi-evo-stage ${m}`,children:[e.jsxs("div",{className:"cowdi-evo-pet-wrap",children:[l!=null&&l.image?e.jsx("img",{src:l.image,alt:l.name,className:"cowdi-evo-pet-img",draggable:!1}):e.jsx("span",{className:"cowdi-evo-pet-emoji emoji-big",children:e.jsx(x,{e:(l==null?void 0:l.emoji)||"🥚",size:144})}),e.jsx("div",{className:"cowdi-evo-flash"})]}),e.jsxs("div",{className:"cowdi-evo-caption",children:[m==="intro"&&e.jsxs("span",{children:[L||(c==null?void 0:c.name)," đang tiến hóa…"]}),m==="flashing"&&e.jsx("span",{children:"Một luồng sáng bao trùm…"}),(m==="reveal"||m==="done")&&e.jsxs("span",{className:"cowdi-evo-newname",children:[e.jsx(t,{name:"party",size:28})," ",g==null?void 0:g.name,"!"]})]})]}),e.jsx("button",{type:"button",className:"cowdi-evo-skip",onClick:F,children:"Bỏ qua ›"}),e.jsx("style",{children:`
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
      `})]})}function We(){var H,Q,X,U,V,W,J,Z,q,ee,se,ae,ie,te,ne,le;be(De["/pet"]);const{petData:c,getActivePetWithDecay:g,feedPet:L,renamePet:N,useFood:F,completeDailyQuest:m,addCoins:w,evolvePet:O}=Ne(),{userData:l,refreshWallet:v}=we(),{user:p}=ye(),f=ke(),[re,B]=o.useState(!1),[I,_]=o.useState(""),[C,D]=o.useState(!1),y=o.useRef(null),[i,j]=o.useState(null),[de,$]=o.useState(!1),[me,pe]=o.useState(""),a=g(),d=a?ce[a.speciesId]:null,n=a&&d?Ee(a.speciesId,a.evolution):null,h=d&&n&&d.evolutions[n.stage+1]||null,u=a?Se(a):null,M=a?ze(a):0,k=a?Fe(a.needs):"happy",he=d?Ie(a.speciesId,k):"",xe=l.wallet||{milk:l.availableXP||0,gem:0,stone:0},b=a?Ce(a,xe):{ok:!1,checks:[]};async function ge(){if(!(!b.ok||C||!c.activePetId)){D(!0);try{const s=await O(c.activePetId);s.ok?(v&&await v(),j({stage:"animation",oldEvo:n,newEvo:h,petName:a.customName}),f("Tiến hóa thành công! 🎉","success")):f(s.error||"Tiến hóa thất bại.","danger")}catch{f("Lỗi mạng khi tiến hóa.","danger")}finally{D(!1)}}}function fe(){var r;if(!i)return;const s=`Cowdi của mình vừa tiến hóa thành ${((r=i.newEvo)==null?void 0:r.name)||"pet mới"}! 🎉
Học tiếng Anh chung cho vui nha 🐾`;pe(s),j(null),$(!0)}const Y=o.useMemo(()=>Te.map(s=>({...s,done:c.dailyQuests.completed.includes(s.id),canClaim:s.check(l)&&!c.dailyQuests.completed.includes(s.id)})),[c.dailyQuests,l]),ue=Y.every(s=>s.done),K=o.useMemo(()=>E.filter(s=>s.category==="food"&&c.ownedItems.includes(s.id)),[c.ownedItems]),T=o.useRef(a==null?void 0:a.evolution);o.useEffect(()=>{var s;a&&(T.current!=null&&a.evolution>T.current&&((s=y.current)==null||s.emit("evolve_ok",{stage:a.evolution+1})),T.current=a.evolution)},[a==null?void 0:a.evolution]),o.useEffect(()=>{var s;if((i==null?void 0:i.stage)==="animation"&&i.newEvo){const r=(i.newEvo.stage??((a==null?void 0:a.evolution)||0))+1;(s=y.current)==null||s.emit("evolve_ok",{stage:r})}},[i]);function ve(s){var r;!s||!a||F(s.id)&&((r=y.current)==null||r.emit("feed"),f(`${a.customName} rất thích ${s.name}!`,"success"))}if(!a||!d)return e.jsxs("div",{className:"text-center py-5 fade-in",children:[e.jsx("div",{style:{fontSize:"5rem"},className:"emoji-big",children:e.jsx(t,{name:"egg",size:96})}),e.jsx("h2",{className:"fw-bold mt-3",children:"Đang tải pet..."})]});function G(){I.trim()&&N(c.activePetId,I.trim()),B(!1)}return e.jsxs("div",{className:"fade-in",children:[e.jsx("div",{className:"text-center mb-4",children:e.jsxs("h2",{className:"fw-bold",children:[e.jsx("span",{className:"me-2",children:e.jsx(t,{name:"paw",size:32})}),"Pet của bạn"]})}),e.jsxs("div",{className:"pet-display-card mb-4",children:[e.jsxs("div",{className:`pet-stage-container ${k}`,children:[e.jsx("div",{className:"pet-floating-decor",children:((H=a.cosmetics)==null?void 0:H.effect)&&e.jsx("span",{className:"pet-effect-icon",children:e.jsx(x,{e:((Q=E.find(s=>s.id===a.cosmetics.effect))==null?void 0:Q.emoji)||"",size:30})})}),((X=a.cosmetics)==null?void 0:X.hat)&&e.jsx("div",{className:"pet-hat-img",children:e.jsx(x,{e:((U=E.find(s=>s.id===a.cosmetics.hat))==null?void 0:U.emoji)||"",size:42})}),e.jsx("div",{className:"pet-image-wrapper",children:e.jsx(Pe,{ref:y,petId:a.speciesId,stage:(a.evolution||0)+1,group:d.group,bond:Re(a.skills),topSkill:Ae(a.skills),mode:"home",fallbackSrc:n==null?void 0:n.image,alt:(n==null?void 0:n.name)||a.customName,className:"pet-character-img"})}),((V=a.cosmetics)==null?void 0:V.outfit)&&e.jsx("div",{className:"pet-outfit-badge",children:e.jsx(x,{e:((W=E.find(s=>s.id===a.cosmetics.outfit))==null?void 0:W.emoji)||"",size:28})}),e.jsx("div",{className:"pet-mood-indicator",children:e.jsx(t,{name:k==="happy"?"smile":k==="sad"?"sad":"sick",size:26})})]}),e.jsxs("div",{className:"pet-info-section",children:[e.jsx("div",{className:"pet-name-area",children:re?e.jsxs("div",{className:"d-flex justify-content-center gap-2",children:[e.jsx("input",{type:"text",className:"form-control form-control-sm pet-name-input",value:I,onChange:s=>_(s.target.value),maxLength:20,autoFocus:!0,onKeyDown:s=>s.key==="Enter"&&G()}),e.jsx("button",{className:"btn btn-sm btn-cowdi-primary",onClick:G,children:"✓"})]}):e.jsxs("h3",{className:"pet-name",children:[a.customName,e.jsx("button",{className:"btn btn-sm btn-link text-muted ms-1",onClick:()=>{B(!0),_(a.customName)},title:"Đổi tên",children:e.jsx(t,{name:"pencil",size:16})})]})}),e.jsxs("div",{className:"pet-badges",children:[e.jsx("span",{className:"pet-badge",style:{background:(J=A[d.element])==null?void 0:J.bg,color:(Z=A[d.element])==null?void 0:Z.text},children:(q=A[d.element])==null?void 0:q.name}),e.jsx("span",{className:"pet-badge",style:{background:(ee=R[d.rarity])==null?void 0:ee.bg,color:(se=R[d.rarity])==null?void 0:se.text},children:(ae=R[d.rarity])==null?void 0:ae.name}),e.jsxs("span",{className:"pet-badge pet-badge-power",children:[e.jsx(t,{name:"bolt",size:14})," ",M]})]}),e.jsx("div",{className:"pet-evolution-label",children:(n==null?void 0:n.name)||"Trứng"}),e.jsxs("div",{className:"pet-speech-bubble",children:[e.jsx("div",{className:"pet-speech-arrow"}),e.jsx("p",{className:"mb-0",children:e.jsx(Le,{children:he})})]})]})]}),u&&e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:e.jsx(t,{name:"bolt",size:22})}),e.jsx("span",{children:"Chỉ số chiến đấu"}),e.jsxs("span",{className:"badge bg-primary ms-auto",children:["Lực chiến: ",M]})]}),e.jsxs("div",{className:"row g-2 text-center",children:[e.jsx("div",{className:"col-3",children:e.jsxs("div",{className:"p-2 border rounded bg-light d-flex flex-column align-items-center",children:[e.jsx("img",{src:z.hp,alt:"HP",style:{width:24,height:24,objectFit:"contain"},className:"mb-1"}),e.jsx("div",{className:"small text-muted fw-bold",children:"HP"}),e.jsx("div",{className:"fs-5 fw-bold text-success",children:u.hp})]})}),e.jsx("div",{className:"col-3",children:e.jsxs("div",{className:"p-2 border rounded bg-light d-flex flex-column align-items-center",children:[e.jsx("img",{src:z.atk,alt:"ATK",style:{width:24,height:24,objectFit:"contain"},className:"mb-1"}),e.jsx("div",{className:"small text-muted fw-bold",children:"ATK"}),e.jsx("div",{className:"fs-5 fw-bold text-danger",children:u.atk})]})}),e.jsx("div",{className:"col-3",children:e.jsxs("div",{className:"p-2 border rounded bg-light d-flex flex-column align-items-center",children:[e.jsx("img",{src:z.def,alt:"DEF",style:{width:24,height:24,objectFit:"contain"},className:"mb-1"}),e.jsx("div",{className:"small text-muted fw-bold",children:"DEF"}),e.jsx("div",{className:"fs-5 fw-bold text-primary",children:u.def.toFixed(1)})]})}),e.jsx("div",{className:"col-3",children:e.jsxs("div",{className:"p-2 border rounded bg-light d-flex flex-column align-items-center",children:[e.jsx("img",{src:z.agi,alt:"AGI",style:{width:24,height:24,objectFit:"contain"},className:"mb-1"}),e.jsx("div",{className:"small text-muted fw-bold",children:"AGI"}),e.jsx("div",{className:"fs-5 fw-bold text-warning",children:u.agi.toFixed(1)})]})})]}),e.jsxs("div",{className:"small text-muted text-center mt-2",children:["Sát thương chí mạng: ",e.jsxs("span",{className:"fw-bold",children:["×",u.critMult.toFixed(2)]})]})]}),h?e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:e.jsx(t,{name:"sparkle",size:22})}),e.jsxs("span",{children:["Tiến hóa tiếp theo: ",h.name]})]}),e.jsxs("div",{className:"pet-evo-preview d-flex align-items-center gap-3 mb-3",children:[h.image?e.jsx("img",{src:h.image,alt:h.name,className:"pet-evo-next-img",style:{width:64,height:64,objectFit:"contain"}}):e.jsx("span",{className:"pet-evo-next-emoji",children:e.jsx(x,{e:h.emoji,size:48})}),e.jsxs("div",{children:[e.jsx("div",{className:"fw-bold fs-5",children:h.name}),e.jsxs("div",{className:"small text-muted",children:["Cấp ",(n==null?void 0:n.stage)??0," → Cấp ",((n==null?void 0:n.stage)??0)+1]})]})]}),e.jsxs("div",{className:"mb-3",children:[e.jsx("div",{className:"small fw-bold text-muted mb-2",children:"Điều kiện tiến hóa:"}),e.jsx("div",{className:"d-flex flex-column gap-2",children:b.checks.map((s,r)=>e.jsxs("div",{className:"d-flex justify-content-between align-items-center small p-2 rounded border bg-light",children:[e.jsxs("span",{children:[s.key==="milk"&&"🥛 Sữa",s.key==="gem"&&"💎 Gem",s.key==="stone"&&"🪨 Đá nguyên tố",s.key==="totalSkills"&&"📚 Tổng điểm 4 kỹ năng",s.kind==="skill"&&`🎯 Kỹ năng ${s.key}`]}),e.jsxs("span",{className:s.ok?"text-success fw-bold":"text-danger fw-bold",children:[s.have," / ",s.need," ",s.ok?"✓":"✗"]})]},r))})]}),e.jsx("button",{type:"button",className:`btn w-100 py-2 fw-bold ${b.ok?"btn-success":"btn-secondary"}`,disabled:!b.ok||C,onClick:ge,children:C?"Đang tiến hóa...":b.ok?"✨ Tiến hóa ngay!":"Chưa đủ điều kiện"})]}):e.jsx("div",{className:"pet-section-card mb-3 text-center py-3",children:e.jsx("span",{className:"badge bg-warning text-dark fs-6",children:"👑 Pet đã đạt cấp tối đa"})}),e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:e.jsx(t,{name:"heart",size:22})}),e.jsx("span",{children:"Trạng thái"})]}),e.jsx("div",{className:"pet-needs-grid",children:[{key:"energy",icon:"🍎",label:"Năng lượng",color:"#4CAF50",gradient:"linear-gradient(90deg, #66BB6A, #43A047)"},{key:"happiness",icon:"😊",label:"Vui vẻ",color:"#FFC107",gradient:"linear-gradient(90deg, #FFD54F, #FFC107)"},{key:"health",icon:"💤",label:"Sức khỏe",color:"#EF5350",gradient:"linear-gradient(90deg, #EF5350, #E53935)"},{key:"knowledge",icon:"📚",label:"Kiến thức",color:"#AB47BC",gradient:"linear-gradient(90deg, #CE93D8, #AB47BC)"}].map(s=>e.jsxs("div",{className:"pet-need-item",children:[e.jsx("div",{className:"pet-need-icon",children:e.jsx(x,{e:s.icon,size:26})}),e.jsxs("div",{className:"pet-need-info",children:[e.jsxs("div",{className:"pet-need-label",children:[e.jsx("span",{children:s.label}),e.jsxs("span",{className:a.needs[s.key]<30?"pet-need-critical":"",children:[a.needs[s.key],"%"]})]}),e.jsx("div",{className:"pet-need-bar",children:e.jsx("div",{className:"pet-need-fill",style:{width:`${a.needs[s.key]}%`,background:a.needs[s.key]<30?"#EF5350":s.gradient}})})]})]},s.key))}),K.length>0&&e.jsx("div",{className:"d-flex flex-wrap gap-2 mt-3 pt-2 border-top",children:K.map(s=>e.jsxs("button",{type:"button",className:"btn btn-sm btn-outline-cowdi d-inline-flex align-items-center gap-1",onClick:()=>ve(s),children:[e.jsx(x,{e:s.emoji,size:16})," Cho ăn ",s.name]},s.id))})]}),e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:e.jsx(t,{name:"chart",size:22})}),e.jsx("span",{children:"Kỹ năng"})]}),e.jsx("div",{className:"pet-skills-grid",children:Object.entries(Oe).map(([s,r])=>{const P=a.skills[s]||0,je=$e(P);return e.jsxs("div",{className:"pet-skill-card",style:{"--skill-color":r.color},children:[e.jsx("div",{className:"pet-skill-icon",children:oe[s]?e.jsx("img",{src:oe[s],alt:r.name,style:{width:34,height:34,objectFit:"contain"}}):e.jsx(t,{name:Be[s],size:30})}),e.jsxs("div",{className:"pet-skill-level",children:["Lv.",je]}),e.jsx("div",{className:"pet-skill-name",children:r.name}),e.jsx("div",{className:"pet-skill-bar",children:e.jsx("div",{className:"pet-skill-fill",style:{width:`${Math.min(100,P%50*2)}%`}})}),e.jsxs("div",{className:"pet-skill-pts",children:[P," pts"]})]},s)})})]}),e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:e.jsx(t,{name:"clipboard",size:22})}),e.jsx("span",{children:"Nhiệm vụ hàng ngày"}),ue&&e.jsx("span",{className:"pet-badge-done",children:"Hoàn thành!"})]}),Y.map(s=>e.jsxs("div",{className:`pet-quest-item ${s.done?"done":""}`,children:[e.jsx("span",{className:"pet-quest-check",children:e.jsx(t,{name:s.done?"check":"square",size:20})}),e.jsxs("div",{className:"pet-quest-info",children:[e.jsx("div",{className:"pet-quest-title",children:s.title}),e.jsx("div",{className:"pet-quest-desc",children:s.desc})]}),s.canClaim?e.jsxs("button",{className:"pet-quest-claim",onClick:()=>m(s.id),children:["+",s.reward," 🥛 Sữa"]}):e.jsxs("span",{className:"pet-quest-reward",children:["+",s.reward," 🥛"]})]},s.id))]}),e.jsxs("div",{className:"pet-quick-actions",children:[e.jsxs(S,{to:p!=null&&p.is_admin?"/lessons":"/",className:"pet-action-card",children:[e.jsx("div",{className:"pet-action-icon",children:e.jsx(t,{name:"grad",size:36})}),e.jsx("div",{className:"pet-action-label",children:"Học bài"}),e.jsxs("div",{className:"pet-action-hint",children:["+",e.jsx(t,{name:"apple",size:12})," +Skills"]})]}),e.jsxs(S,{to:"/practice",className:"pet-action-card",children:[e.jsx("div",{className:"pet-action-icon",children:e.jsx(t,{name:"gamepad",size:36})}),e.jsx("div",{className:"pet-action-label",children:"Luyện tập"}),e.jsxs("div",{className:"pet-action-hint",children:["+",e.jsx(t,{name:"smile",size:12})," +Skills"]})]}),e.jsxs(S,{to:"/collection",className:"pet-action-card",children:[e.jsx("div",{className:"pet-action-icon",children:e.jsx(t,{name:"box",size:36})}),e.jsx("div",{className:"pet-action-label",children:"Bộ sưu tập"}),e.jsxs("div",{className:"pet-action-hint",children:[Object.keys(c.collection).length,"/",Object.keys(ce).length," pet"]})]}),e.jsxs(S,{to:"/shop",className:"pet-action-card",children:[e.jsx("div",{className:"pet-action-icon",children:e.jsx(t,{name:"bag",size:36})}),e.jsx("div",{className:"pet-action-label",children:"Cửa hàng"}),e.jsxs("div",{className:"pet-action-hint",children:["🥛 ",(((ie=l.wallet)==null?void 0:ie.milk)||l.availableXP||0).toLocaleString("vi-VN")]})]})]}),(i==null?void 0:i.stage)==="animation"&&e.jsx(Me,{oldEvo:i.oldEvo,newEvo:i.newEvo,petName:i.petName,onComplete:()=>j(s=>s&&{...s,stage:"result"}),onSkip:()=>j(s=>s&&{...s,stage:"result"})}),(i==null?void 0:i.stage)==="result"&&e.jsxs("div",{className:"cowdi-evo-result-overlay",role:"dialog",children:[e.jsxs("div",{className:"cowdi-evo-result-card",children:[e.jsxs("div",{className:"cowdi-evo-result-title",children:[e.jsx(t,{name:"party",size:24})," ",i.petName," vừa tiến hóa!"]}),e.jsx("div",{className:"cowdi-evo-result-pet",children:(te=i.newEvo)!=null&&te.image?e.jsx("img",{src:i.newEvo.image,alt:i.newEvo.name}):e.jsx("span",{style:{fontSize:"6rem"},className:"emoji-big",children:e.jsx(x,{e:((ne=i.newEvo)==null?void 0:ne.emoji)||"✨",size:96})})}),e.jsx("div",{className:"cowdi-evo-result-name",children:(le=i.newEvo)==null?void 0:le.name}),e.jsxs("div",{className:"cowdi-evo-result-actions",children:[e.jsxs("button",{type:"button",className:"btn btn-cowdi-primary fw-bold",onClick:fe,children:[e.jsx(t,{name:"gift",size:18})," Khoe & mời bạn"]}),e.jsx("button",{type:"button",className:"btn btn-outline-secondary",onClick:()=>j(null),children:"Đóng"})]})]}),e.jsx("style",{children:`
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
          `})]}),e.jsx(_e,{open:de,onClose:()=>$(!1),prefilledMessage:me})]})}export{We as default};
