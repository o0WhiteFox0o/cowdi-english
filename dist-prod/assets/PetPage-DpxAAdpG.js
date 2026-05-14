import{r as p,j as e}from"./react-nTLHQtbJ.js";import{L as y}from"./router-CxCaNF6T.js";import{a as re,u as de,b as pe,P as S,g as X,e as me,j as he,k as xe,D as ge,l as k,E as C,R as F,d as ve,I as fe,f as ue}from"./index-Dhr2B2uU.js";import"./react-dom-Dp7c0bxT.js";import"./vendor-DSXEjpE4.js";import"./data-lessons-BwBf1fcF.js";import"./data-vocab-BtRUsb5n.js";function be({oldEvo:c,newEvo:x,petName:I,onComplete:b,onSkip:T}){const[d,j]=p.useState("intro");p.useEffect(()=>{const v=setTimeout(()=>j("flashing"),500),m=setTimeout(()=>j("reveal"),3e3),w=setTimeout(()=>{j("done"),b&&b()},3800);return()=>{clearTimeout(v),clearTimeout(m),clearTimeout(w)}},[]);const t=d==="reveal"||d==="done"?x:c;return e.jsxs("div",{className:"cowdi-evo-overlay",role:"dialog","aria-label":"Pet đang tiến hóa",children:[e.jsx("div",{className:`cowdi-evo-rays ${d}`}),e.jsx("div",{className:"cowdi-evo-sparkles",children:Array.from({length:14}).map((v,m)=>e.jsx("span",{className:"cowdi-evo-spark",style:{left:`${m*73%100}%`,top:`${m*41%100}%`,animationDelay:`${m*137%1800}ms`},children:"✨"},m))}),e.jsxs("div",{className:`cowdi-evo-stage ${d}`,children:[e.jsxs("div",{className:"cowdi-evo-pet-wrap",children:[t!=null&&t.image?e.jsx("img",{src:t.image,alt:t.name,className:"cowdi-evo-pet-img",draggable:!1}):e.jsx("span",{className:"cowdi-evo-pet-emoji",children:(t==null?void 0:t.emoji)||"🥚"}),e.jsx("div",{className:"cowdi-evo-flash"})]}),e.jsxs("div",{className:"cowdi-evo-caption",children:[d==="intro"&&e.jsxs("span",{children:[I||(c==null?void 0:c.name)," đang tiến hóa…"]}),d==="flashing"&&e.jsx("span",{children:"Một luồng sáng bao trùm…"}),(d==="reveal"||d==="done")&&e.jsxs("span",{className:"cowdi-evo-newname",children:["🎉 ",x==null?void 0:x.name,"!"]})]})]}),e.jsx("button",{type:"button",className:"cowdi-evo-skip",onClick:T,children:"Bỏ qua ›"}),e.jsx("style",{children:`
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
      `})]})}function Se(){var L,Y,$,M,O,_,K,Q,H,U,V,W,G,J,Z;const{petData:c,getActivePetWithDecay:x,feedPet:I,renamePet:b,useFood:T,completeDailyQuest:d,addCoins:j,feedXPToPet:R}=re(),{userData:t}=de(),v=pe(),[m,w]=p.useState(!1),[E,z]=p.useState(""),[i,f]=p.useState(null),[q,A]=p.useState(!1),[ee,se]=p.useState("");function P(s,h={}){const r=x(),u=r?S[r.speciesId]:null,oe=r&&u?X(r.speciesId,r.totalXpEarned):null,g=R(s);if(!g.ok)return g.reason==="insufficient"&&v("Không đủ XP trong ví!","warning"),g;if(g.evolved&&u){const ce=u.evolutions.find(le=>le.stage===g.newEvoStage)||X(r.speciesId,(r.totalXpEarned||0)+s);f({stage:"animation",oldEvo:oe,newEvo:ce,petName:r.customName})}else h.silent||v(`+${s} XP cho Pet`,"success");return g}function ae(){var h;if(!i)return;const s=`Cowdi của mình vừa tiến hóa thành ${((h=i.newEvo)==null?void 0:h.name)||"pet mới"}! 🎉
Học tiếng Anh chung cho vui nha 🐾`;se(s),f(null),A(!0)}const a=x(),o=a?S[a.speciesId]:null,n=a&&o?X(a.speciesId,a.totalXpEarned):null,l=o==null?void 0:o.evolutions.find(s=>s.xp>((a==null?void 0:a.totalXpEarned)||0)),te=a&&o?me(a,o):0,N=a?he(a.needs):"happy",ie=o?xe(a.speciesId,N):"",B=p.useMemo(()=>ge.map(s=>({...s,done:c.dailyQuests.completed.includes(s.id),canClaim:s.check(t)&&!c.dailyQuests.completed.includes(s.id)})),[c.dailyQuests,t]),ne=B.every(s=>s.done);if(p.useMemo(()=>k.filter(s=>s.category==="food"&&c.ownedItems.includes(s.id)),[c.ownedItems]),!a||!o)return e.jsxs("div",{className:"text-center py-5 fade-in",children:[e.jsx("div",{style:{fontSize:"5rem"},children:"🥚"}),e.jsx("h2",{className:"fw-bold mt-3",children:"Đang tải pet..."})]});function D(){E.trim()&&b(c.activePetId,E.trim()),w(!1)}return e.jsxs("div",{className:"fade-in",children:[e.jsx("div",{className:"text-center mb-4",children:e.jsxs("h2",{className:"fw-bold",children:[e.jsx("span",{className:"me-2",children:"🐾"}),"Pet của bạn"]})}),e.jsxs("div",{className:"pet-display-card mb-4",children:[e.jsxs("div",{className:`pet-stage-container ${N}`,children:[e.jsx("div",{className:"pet-floating-decor",children:((L=a.cosmetics)==null?void 0:L.effect)&&e.jsx("span",{className:"pet-effect-icon",children:((Y=k.find(s=>s.id===a.cosmetics.effect))==null?void 0:Y.emoji)||""})}),(($=a.cosmetics)==null?void 0:$.hat)&&e.jsx("div",{className:"pet-hat-img",children:((M=k.find(s=>s.id===a.cosmetics.hat))==null?void 0:M.emoji)||""}),e.jsx("div",{className:"pet-image-wrapper",children:n!=null&&n.image?e.jsx("img",{src:n.image,alt:n.name,className:"pet-character-img",draggable:!1}):e.jsx("div",{className:"pet-emoji-fallback",children:(n==null?void 0:n.emoji)||o.emoji})}),((O=a.cosmetics)==null?void 0:O.outfit)&&e.jsx("div",{className:"pet-outfit-badge",children:((_=k.find(s=>s.id===a.cosmetics.outfit))==null?void 0:_.emoji)||""}),e.jsx("div",{className:"pet-mood-indicator",children:N==="happy"?"😊":N==="sad"?"😢":"🤒"})]}),e.jsxs("div",{className:"pet-info-section",children:[e.jsx("div",{className:"pet-name-area",children:m?e.jsxs("div",{className:"d-flex justify-content-center gap-2",children:[e.jsx("input",{type:"text",className:"form-control form-control-sm pet-name-input",value:E,onChange:s=>z(s.target.value),maxLength:20,autoFocus:!0,onKeyDown:s=>s.key==="Enter"&&D()}),e.jsx("button",{className:"btn btn-sm btn-cowdi-primary",onClick:D,children:"✓"})]}):e.jsxs("h3",{className:"pet-name",children:[a.customName,e.jsx("button",{className:"btn btn-sm btn-link text-muted ms-1",onClick:()=>{w(!0),z(a.customName)},title:"Đổi tên",children:"✏️"})]})}),e.jsxs("div",{className:"pet-badges",children:[e.jsx("span",{className:"pet-badge",style:{background:(K=C[o.element])==null?void 0:K.bg,color:(Q=C[o.element])==null?void 0:Q.text},children:(H=C[o.element])==null?void 0:H.name}),e.jsx("span",{className:"pet-badge",style:{background:(U=F[o.rarity])==null?void 0:U.bg,color:(V=F[o.rarity])==null?void 0:V.text},children:(W=F[o.rarity])==null?void 0:W.name}),e.jsxs("span",{className:"pet-badge pet-badge-power",children:["⚡ ",te]})]}),e.jsx("div",{className:"pet-evolution-label",children:(n==null?void 0:n.name)||"Trứng"}),e.jsxs("div",{className:"pet-speech-bubble",children:[e.jsx("div",{className:"pet-speech-arrow"}),e.jsx("p",{className:"mb-0",children:ie})]})]})]}),l&&e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:"⚡"}),e.jsx("span",{children:"Tiến hóa tiếp theo"})]}),e.jsxs("div",{className:"pet-evo-preview",children:[l.image?e.jsx("img",{src:l.image,alt:l.name,className:"pet-evo-next-img"}):e.jsx("span",{className:"pet-evo-next-emoji",children:l.emoji}),e.jsx("span",{className:"pet-evo-next-name",children:l.name})]}),e.jsx("div",{className:"pet-progress-bar",children:e.jsx("div",{className:"pet-progress-fill",style:{width:`${Math.min(100,(a.totalXpEarned-((n==null?void 0:n.xp)||0))/(l.xp-((n==null?void 0:n.xp)||0))*100)}%`}})}),e.jsxs("div",{className:"pet-progress-text",children:[a.totalXpEarned," / ",l.xp," XP"]})]}),e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:"✨"}),e.jsx("span",{children:"Cho Pet ăn XP"}),e.jsxs("span",{className:"pet-badge ms-auto",style:{background:"#FFF3CD",color:"#856404"},children:["⭐ Ví: ",t.availableXP||0]})]}),e.jsx("div",{className:"text-muted small mb-2",children:"XP bạn kiếm được qua học tập có thể “cho Pet ăn” để trực tiếp tăng tiến độ tiến hóa (1 XP = 1 điểm tiến hóa). Tổng XP sự nghiệp (lên cấp user / bảng xếp hạng) vẫn được giữ nguyên."}),e.jsxs("div",{className:"d-flex flex-wrap gap-2",children:[[50,200,500].map(s=>e.jsxs("button",{type:"button",className:"btn btn-sm btn-warning fw-bold",disabled:(t.availableXP||0)<s,onClick:()=>{P(s)},children:["+",s," XP"]},s)),l&&(t.availableXP||0)>=l.xp-(a.totalXpEarned||0)&&e.jsxs("button",{type:"button",className:"btn btn-sm btn-success fw-bold",onClick:()=>{const s=l.xp-(a.totalXpEarned||0);P(s,{silent:!0})},children:["⚡ Tiến hóa ngay (",l.xp-(a.totalXpEarned||0)," XP)"]}),e.jsxs("button",{type:"button",className:"btn btn-sm btn-outline-warning fw-bold",disabled:(t.availableXP||0)<=0,onClick:()=>{const s=t.availableXP||0;P(s)},children:["Tiêu tất cả (",t.availableXP||0,")"]})]})]}),e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:"💗"}),e.jsx("span",{children:"Trạng thái"})]}),e.jsx("div",{className:"pet-needs-grid",children:[{key:"energy",icon:"🍎",label:"Năng lượng",color:"#4CAF50",gradient:"linear-gradient(90deg, #66BB6A, #43A047)"},{key:"happiness",icon:"😊",label:"Vui vẻ",color:"#FFC107",gradient:"linear-gradient(90deg, #FFD54F, #FFC107)"},{key:"health",icon:"💤",label:"Sức khỏe",color:"#EF5350",gradient:"linear-gradient(90deg, #EF5350, #E53935)"},{key:"knowledge",icon:"📚",label:"Kiến thức",color:"#AB47BC",gradient:"linear-gradient(90deg, #CE93D8, #AB47BC)"}].map(s=>e.jsxs("div",{className:"pet-need-item",children:[e.jsx("div",{className:"pet-need-icon",children:s.icon}),e.jsxs("div",{className:"pet-need-info",children:[e.jsxs("div",{className:"pet-need-label",children:[e.jsx("span",{children:s.label}),e.jsxs("span",{className:a.needs[s.key]<30?"pet-need-critical":"",children:[a.needs[s.key],"%"]})]}),e.jsx("div",{className:"pet-need-bar",children:e.jsx("div",{className:"pet-need-fill",style:{width:`${a.needs[s.key]}%`,background:a.needs[s.key]<30?"#EF5350":s.gradient}})})]})]},s.key))})]}),e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:"📊"}),e.jsx("span",{children:"Kỹ năng"})]}),e.jsx("div",{className:"pet-skills-grid",children:Object.entries(ve).map(([s,h])=>{const r=a.skills[s]||0,u=ue(r);return e.jsxs("div",{className:"pet-skill-card",style:{"--skill-color":h.color},children:[e.jsx("div",{className:"pet-skill-icon",children:h.icon}),e.jsxs("div",{className:"pet-skill-level",children:["Lv.",u]}),e.jsx("div",{className:"pet-skill-name",children:h.name}),e.jsx("div",{className:"pet-skill-bar",children:e.jsx("div",{className:"pet-skill-fill",style:{width:`${Math.min(100,r%50*2)}%`}})}),e.jsxs("div",{className:"pet-skill-pts",children:[r," pts"]})]},s)})})]}),e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:"📋"}),e.jsx("span",{children:"Nhiệm vụ hàng ngày"}),ne&&e.jsx("span",{className:"pet-badge-done",children:"Hoàn thành!"})]}),B.map(s=>e.jsxs("div",{className:`pet-quest-item ${s.done?"done":""}`,children:[e.jsx("span",{className:"pet-quest-check",children:s.done?"✅":"⬜"}),e.jsxs("div",{className:"pet-quest-info",children:[e.jsx("div",{className:"pet-quest-title",children:s.title}),e.jsx("div",{className:"pet-quest-desc",children:s.desc})]}),s.canClaim?e.jsxs("button",{className:"pet-quest-claim",onClick:()=>d(s.id),children:["+",s.reward,"🪙"]}):e.jsxs("span",{className:"pet-quest-reward",children:[s.reward,"🪙"]})]},s.id))]}),e.jsxs("div",{className:"pet-quick-actions",children:[e.jsxs(y,{to:"/lessons",className:"pet-action-card",children:[e.jsx("div",{className:"pet-action-icon",children:"🎓"}),e.jsx("div",{className:"pet-action-label",children:"Học bài"}),e.jsx("div",{className:"pet-action-hint",children:"+🍎 +Skills"})]}),e.jsxs(y,{to:"/practice",className:"pet-action-card",children:[e.jsx("div",{className:"pet-action-icon",children:"🎮"}),e.jsx("div",{className:"pet-action-label",children:"Luyện tập"}),e.jsx("div",{className:"pet-action-hint",children:"+😊 +Skills"})]}),e.jsxs(y,{to:"/collection",className:"pet-action-card",children:[e.jsx("div",{className:"pet-action-icon",children:"📦"}),e.jsx("div",{className:"pet-action-label",children:"Bộ sưu tập"}),e.jsxs("div",{className:"pet-action-hint",children:[Object.keys(c.collection).length,"/",Object.keys(S).length," pet"]})]}),e.jsxs(y,{to:"/shop",className:"pet-action-card",children:[e.jsx("div",{className:"pet-action-icon",children:"🛍️"}),e.jsx("div",{className:"pet-action-label",children:"Cửa hàng"}),e.jsxs("div",{className:"pet-action-hint",children:[c.coins,"🪙"]})]})]}),(i==null?void 0:i.stage)==="animation"&&e.jsx(be,{oldEvo:i.oldEvo,newEvo:i.newEvo,petName:i.petName,onComplete:()=>f(s=>s&&{...s,stage:"result"}),onSkip:()=>f(s=>s&&{...s,stage:"result"})}),(i==null?void 0:i.stage)==="result"&&e.jsxs("div",{className:"cowdi-evo-result-overlay",role:"dialog",children:[e.jsxs("div",{className:"cowdi-evo-result-card",children:[e.jsxs("div",{className:"cowdi-evo-result-title",children:["🎉 ",i.petName," vừa tiến hóa!"]}),e.jsx("div",{className:"cowdi-evo-result-pet",children:(G=i.newEvo)!=null&&G.image?e.jsx("img",{src:i.newEvo.image,alt:i.newEvo.name}):e.jsx("span",{style:{fontSize:"6rem"},children:((J=i.newEvo)==null?void 0:J.emoji)||"✨"})}),e.jsx("div",{className:"cowdi-evo-result-name",children:(Z=i.newEvo)==null?void 0:Z.name}),e.jsxs("div",{className:"cowdi-evo-result-actions",children:[e.jsx("button",{type:"button",className:"btn btn-cowdi-primary fw-bold",onClick:ae,children:"🎁 Khoe & mời bạn"}),e.jsx("button",{type:"button",className:"btn btn-outline-secondary",onClick:()=>f(null),children:"Đóng"})]})]}),e.jsx("style",{children:`
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
          `})]}),e.jsx(fe,{open:q,onClose:()=>A(!1),prefilledMessage:ee})]})}export{Se as default};
