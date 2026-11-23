import{r as c,j as e}from"./react-nTLHQtbJ.js";import{I as i,E as x,u as re,c as de,a as me,m as pe,P as Z,g as xe,r as he,d as ge,x as ue,D as fe,y,h as ve,t as je,i as be,z as F,R as I,p as we,C as Ne,s as ye,v as q,j as ke,S as Ee,o as ze}from"./index-BfCjLWN_.js";import{L as k}from"./router-BTF2H5Ji.js";import"./react-dom-Dp7c0bxT.js";import"./vendor-DSXEjpE4.js";import"./data-lessons-oskXA3-_.js";import"./data-vocab-BtRUsb5n.js";function Se({oldEvo:o,newEvo:h,petName:R,onComplete:f,onSkip:E}){const[d,v]=c.useState("intro");c.useEffect(()=>{const j=setTimeout(()=>v("flashing"),500),p=setTimeout(()=>v("reveal"),3e3),u=setTimeout(()=>{v("done"),f&&f()},3800);return()=>{clearTimeout(j),clearTimeout(p),clearTimeout(u)}},[]);const m=d==="reveal"||d==="done"?h:o;return e.jsxs("div",{className:"cowdi-evo-overlay",role:"dialog","aria-label":"Pet đang tiến hóa",children:[e.jsx("div",{className:`cowdi-evo-rays ${d}`}),e.jsx("div",{className:"cowdi-evo-sparkles",children:Array.from({length:14}).map((j,p)=>e.jsx("span",{className:"cowdi-evo-spark",style:{left:`${p*73%100}%`,top:`${p*41%100}%`,animationDelay:`${p*137%1800}ms`},children:e.jsx(i,{name:"sparkles",size:22})},p))}),e.jsxs("div",{className:`cowdi-evo-stage ${d}`,children:[e.jsxs("div",{className:"cowdi-evo-pet-wrap",children:[m!=null&&m.image?e.jsx("img",{src:m.image,alt:m.name,className:"cowdi-evo-pet-img",draggable:!1}):e.jsx("span",{className:"cowdi-evo-pet-emoji emoji-big",children:e.jsx(x,{e:(m==null?void 0:m.emoji)||"🥚",size:144})}),e.jsx("div",{className:"cowdi-evo-flash"})]}),e.jsxs("div",{className:"cowdi-evo-caption",children:[d==="intro"&&e.jsxs("span",{children:[R||(o==null?void 0:o.name)," đang tiến hóa…"]}),d==="flashing"&&e.jsx("span",{children:"Một luồng sáng bao trùm…"}),(d==="reveal"||d==="done")&&e.jsxs("span",{className:"cowdi-evo-newname",children:[e.jsx(i,{name:"party",size:28})," ",h==null?void 0:h.name,"!"]})]})]}),e.jsx("button",{type:"button",className:"cowdi-evo-skip",onClick:E,children:"Bỏ qua ›"}),e.jsx("style",{children:`
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
      `})]})}function Ae(){var $,B,D,Y,_,M,K,Q,H,U,G,V,X,W,J;re(Ee["/pet"]);const{petData:o,getActivePetWithDecay:h,feedPet:R,renamePet:f,useFood:E,completeDailyQuest:d,addCoins:v}=de(),{userData:z}=me(),m=pe(),[j,p]=c.useState(!1),[u,T]=c.useState(""),b=c.useRef(null),[t,w]=c.useState(null),[ee,P]=c.useState(!1),[se,ae]=c.useState("");function ie(){var r;if(!t)return;const s=`Cowdi của mình vừa tiến hóa thành ${((r=t.newEvo)==null?void 0:r.name)||"pet mới"}! 🎉
Học tiếng Anh chung cho vui nha 🐾`;ae(s),w(null),P(!0)}const a=h(),n=a?Z[a.speciesId]:null,l=a&&n?xe(a.speciesId,a.evolution):null,g=n&&l&&n.evolutions[l.stage+1]||null,te=a&&n?he(a,n):0,N=a?ge(a.needs):"happy",ne=n?ue(a.speciesId,N):"",O=c.useMemo(()=>fe.map(s=>({...s,done:o.dailyQuests.completed.includes(s.id),canClaim:s.check(z)&&!o.dailyQuests.completed.includes(s.id)})),[o.dailyQuests,z]),oe=O.every(s=>s.done),A=c.useMemo(()=>y.filter(s=>s.category==="food"&&o.ownedItems.includes(s.id)),[o.ownedItems]),S=c.useRef(a==null?void 0:a.evolution);c.useEffect(()=>{var s;a&&(S.current!=null&&a.evolution>S.current&&((s=b.current)==null||s.emit("evolve_ok",{stage:a.evolution+1})),S.current=a.evolution)},[a==null?void 0:a.evolution]),c.useEffect(()=>{var s;if((t==null?void 0:t.stage)==="animation"&&t.newEvo){const r=(t.newEvo.stage??((a==null?void 0:a.evolution)||0))+1;(s=b.current)==null||s.emit("evolve_ok",{stage:r})}},[t]);function ce(s){var r;!s||!a||E(s.id)&&((r=b.current)==null||r.emit("feed"),m(`${a.customName} rất thích ${s.name}!`,"success"))}if(!a||!n)return e.jsxs("div",{className:"text-center py-5 fade-in",children:[e.jsx("div",{style:{fontSize:"5rem"},className:"emoji-big",children:e.jsx(i,{name:"egg",size:96})}),e.jsx("h2",{className:"fw-bold mt-3",children:"Đang tải pet..."})]});function L(){u.trim()&&f(o.activePetId,u.trim()),p(!1)}return e.jsxs("div",{className:"fade-in",children:[e.jsx("div",{className:"text-center mb-4",children:e.jsxs("h2",{className:"fw-bold",children:[e.jsx("span",{className:"me-2",children:e.jsx(i,{name:"paw",size:32})}),"Pet của bạn"]})}),e.jsxs("div",{className:"pet-display-card mb-4",children:[e.jsxs("div",{className:`pet-stage-container ${N}`,children:[e.jsx("div",{className:"pet-floating-decor",children:(($=a.cosmetics)==null?void 0:$.effect)&&e.jsx("span",{className:"pet-effect-icon",children:e.jsx(x,{e:((B=y.find(s=>s.id===a.cosmetics.effect))==null?void 0:B.emoji)||"",size:30})})}),((D=a.cosmetics)==null?void 0:D.hat)&&e.jsx("div",{className:"pet-hat-img",children:e.jsx(x,{e:((Y=y.find(s=>s.id===a.cosmetics.hat))==null?void 0:Y.emoji)||"",size:42})}),e.jsx("div",{className:"pet-image-wrapper",children:e.jsx(ve,{ref:b,petId:a.speciesId,stage:(a.evolution||0)+1,group:n.group,bond:be(a.skills),topSkill:je(a.skills),mode:"home",fallbackSrc:l==null?void 0:l.image,alt:(l==null?void 0:l.name)||a.customName,className:"pet-character-img"})}),((_=a.cosmetics)==null?void 0:_.outfit)&&e.jsx("div",{className:"pet-outfit-badge",children:e.jsx(x,{e:((M=y.find(s=>s.id===a.cosmetics.outfit))==null?void 0:M.emoji)||"",size:28})}),e.jsx("div",{className:"pet-mood-indicator",children:e.jsx(i,{name:N==="happy"?"smile":N==="sad"?"sad":"sick",size:26})})]}),e.jsxs("div",{className:"pet-info-section",children:[e.jsx("div",{className:"pet-name-area",children:j?e.jsxs("div",{className:"d-flex justify-content-center gap-2",children:[e.jsx("input",{type:"text",className:"form-control form-control-sm pet-name-input",value:u,onChange:s=>T(s.target.value),maxLength:20,autoFocus:!0,onKeyDown:s=>s.key==="Enter"&&L()}),e.jsx("button",{className:"btn btn-sm btn-cowdi-primary",onClick:L,children:"✓"})]}):e.jsxs("h3",{className:"pet-name",children:[a.customName,e.jsx("button",{className:"btn btn-sm btn-link text-muted ms-1",onClick:()=>{p(!0),T(a.customName)},title:"Đổi tên",children:e.jsx(i,{name:"pencil",size:16})})]})}),e.jsxs("div",{className:"pet-badges",children:[e.jsx("span",{className:"pet-badge",style:{background:(K=F[n.element])==null?void 0:K.bg,color:(Q=F[n.element])==null?void 0:Q.text},children:(H=F[n.element])==null?void 0:H.name}),e.jsx("span",{className:"pet-badge",style:{background:(U=I[n.rarity])==null?void 0:U.bg,color:(G=I[n.rarity])==null?void 0:G.text},children:(V=I[n.rarity])==null?void 0:V.name}),e.jsxs("span",{className:"pet-badge pet-badge-power",children:[e.jsx(i,{name:"bolt",size:14})," ",te]})]}),e.jsx("div",{className:"pet-evolution-label",children:(l==null?void 0:l.name)||"Trứng"}),e.jsxs("div",{className:"pet-speech-bubble",children:[e.jsx("div",{className:"pet-speech-arrow"}),e.jsx("p",{className:"mb-0",children:e.jsx(we,{children:ne})})]})]})]}),g&&e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:e.jsx(i,{name:"bolt",size:22})}),e.jsx("span",{children:"Tiến hóa tiếp theo"})]}),e.jsxs("div",{className:"pet-evo-preview",children:[g.image?e.jsx("img",{src:g.image,alt:g.name,className:"pet-evo-next-img"}):e.jsx("span",{className:"pet-evo-next-emoji",children:e.jsx(x,{e:g.emoji,size:36})}),e.jsx("span",{className:"pet-evo-next-name",children:g.name})]}),e.jsxs("div",{className:"pet-progress-text",children:["Tiến hoá bằng ",Object.values(Ne).map(s=>`${s.labelVi} ${s.icon}`).join(", ")," — sắp ra mắt."]})]}),e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:e.jsx(i,{name:"heart",size:22})}),e.jsx("span",{children:"Trạng thái"})]}),e.jsx("div",{className:"pet-needs-grid",children:[{key:"energy",icon:"🍎",label:"Năng lượng",color:"#4CAF50",gradient:"linear-gradient(90deg, #66BB6A, #43A047)"},{key:"happiness",icon:"😊",label:"Vui vẻ",color:"#FFC107",gradient:"linear-gradient(90deg, #FFD54F, #FFC107)"},{key:"health",icon:"💤",label:"Sức khỏe",color:"#EF5350",gradient:"linear-gradient(90deg, #EF5350, #E53935)"},{key:"knowledge",icon:"📚",label:"Kiến thức",color:"#AB47BC",gradient:"linear-gradient(90deg, #CE93D8, #AB47BC)"}].map(s=>e.jsxs("div",{className:"pet-need-item",children:[e.jsx("div",{className:"pet-need-icon",children:e.jsx(x,{e:s.icon,size:26})}),e.jsxs("div",{className:"pet-need-info",children:[e.jsxs("div",{className:"pet-need-label",children:[e.jsx("span",{children:s.label}),e.jsxs("span",{className:a.needs[s.key]<30?"pet-need-critical":"",children:[a.needs[s.key],"%"]})]}),e.jsx("div",{className:"pet-need-bar",children:e.jsx("div",{className:"pet-need-fill",style:{width:`${a.needs[s.key]}%`,background:a.needs[s.key]<30?"#EF5350":s.gradient}})})]})]},s.key))}),A.length>0&&e.jsx("div",{className:"d-flex flex-wrap gap-2 mt-3 pt-2 border-top",children:A.map(s=>e.jsxs("button",{type:"button",className:"btn btn-sm btn-outline-cowdi d-inline-flex align-items-center gap-1",onClick:()=>ce(s),children:[e.jsx(x,{e:s.emoji,size:16})," Cho ăn ",s.name]},s.id))})]}),e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:e.jsx(i,{name:"chart",size:22})}),e.jsx("span",{children:"Kỹ năng"})]}),e.jsx("div",{className:"pet-skills-grid",children:Object.entries(ye).map(([s,r])=>{const C=a.skills[s]||0,le=ze(C);return e.jsxs("div",{className:"pet-skill-card",style:{"--skill-color":r.color},children:[e.jsx("div",{className:"pet-skill-icon",children:q[s]?e.jsx(i,{name:q[s],size:30}):e.jsx(x,{e:r.icon,size:30})}),e.jsxs("div",{className:"pet-skill-level",children:["Lv.",le]}),e.jsx("div",{className:"pet-skill-name",children:r.name}),e.jsx("div",{className:"pet-skill-bar",children:e.jsx("div",{className:"pet-skill-fill",style:{width:`${Math.min(100,C%50*2)}%`}})}),e.jsxs("div",{className:"pet-skill-pts",children:[C," pts"]})]},s)})})]}),e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:e.jsx(i,{name:"clipboard",size:22})}),e.jsx("span",{children:"Nhiệm vụ hàng ngày"}),oe&&e.jsx("span",{className:"pet-badge-done",children:"Hoàn thành!"})]}),O.map(s=>e.jsxs("div",{className:`pet-quest-item ${s.done?"done":""}`,children:[e.jsx("span",{className:"pet-quest-check",children:e.jsx(i,{name:s.done?"check":"square",size:20})}),e.jsxs("div",{className:"pet-quest-info",children:[e.jsx("div",{className:"pet-quest-title",children:s.title}),e.jsx("div",{className:"pet-quest-desc",children:s.desc})]}),s.canClaim?e.jsxs("button",{className:"pet-quest-claim",onClick:()=>d(s.id),children:["+",s.reward,e.jsx(i,{name:"coin",size:14})]}):e.jsxs("span",{className:"pet-quest-reward",children:[s.reward,e.jsx(i,{name:"coin",size:14})]})]},s.id))]}),e.jsxs("div",{className:"pet-quick-actions",children:[e.jsxs(k,{to:"/lessons",className:"pet-action-card",children:[e.jsx("div",{className:"pet-action-icon",children:e.jsx(i,{name:"grad",size:36})}),e.jsx("div",{className:"pet-action-label",children:"Học bài"}),e.jsxs("div",{className:"pet-action-hint",children:["+",e.jsx(i,{name:"apple",size:12})," +Skills"]})]}),e.jsxs(k,{to:"/practice",className:"pet-action-card",children:[e.jsx("div",{className:"pet-action-icon",children:e.jsx(i,{name:"gamepad",size:36})}),e.jsx("div",{className:"pet-action-label",children:"Luyện tập"}),e.jsxs("div",{className:"pet-action-hint",children:["+",e.jsx(i,{name:"smile",size:12})," +Skills"]})]}),e.jsxs(k,{to:"/collection",className:"pet-action-card",children:[e.jsx("div",{className:"pet-action-icon",children:e.jsx(i,{name:"box",size:36})}),e.jsx("div",{className:"pet-action-label",children:"Bộ sưu tập"}),e.jsxs("div",{className:"pet-action-hint",children:[Object.keys(o.collection).length,"/",Object.keys(Z).length," pet"]})]}),e.jsxs(k,{to:"/shop",className:"pet-action-card",children:[e.jsx("div",{className:"pet-action-icon",children:e.jsx(i,{name:"bag",size:36})}),e.jsx("div",{className:"pet-action-label",children:"Cửa hàng"}),e.jsxs("div",{className:"pet-action-hint",children:[o.coins,e.jsx(i,{name:"coin",size:12})]})]})]}),(t==null?void 0:t.stage)==="animation"&&e.jsx(Se,{oldEvo:t.oldEvo,newEvo:t.newEvo,petName:t.petName,onComplete:()=>w(s=>s&&{...s,stage:"result"}),onSkip:()=>w(s=>s&&{...s,stage:"result"})}),(t==null?void 0:t.stage)==="result"&&e.jsxs("div",{className:"cowdi-evo-result-overlay",role:"dialog",children:[e.jsxs("div",{className:"cowdi-evo-result-card",children:[e.jsxs("div",{className:"cowdi-evo-result-title",children:[e.jsx(i,{name:"party",size:24})," ",t.petName," vừa tiến hóa!"]}),e.jsx("div",{className:"cowdi-evo-result-pet",children:(X=t.newEvo)!=null&&X.image?e.jsx("img",{src:t.newEvo.image,alt:t.newEvo.name}):e.jsx("span",{style:{fontSize:"6rem"},className:"emoji-big",children:e.jsx(x,{e:((W=t.newEvo)==null?void 0:W.emoji)||"✨",size:96})})}),e.jsx("div",{className:"cowdi-evo-result-name",children:(J=t.newEvo)==null?void 0:J.name}),e.jsxs("div",{className:"cowdi-evo-result-actions",children:[e.jsxs("button",{type:"button",className:"btn btn-cowdi-primary fw-bold",onClick:ie,children:[e.jsx(i,{name:"gift",size:18})," Khoe & mời bạn"]}),e.jsx("button",{type:"button",className:"btn btn-outline-secondary",onClick:()=>w(null),children:"Đóng"})]})]}),e.jsx("style",{children:`
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
          `})]}),e.jsx(ke,{open:ee,onClose:()=>P(!1),prefilledMessage:se})]})}export{Ae as default};
