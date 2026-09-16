import{r as x,j as e}from"./react-nTLHQtbJ.js";import{I as i,E as p,u as pe,b as xe,a as he,c as ge,P as C,i as F,j as je,p as fe,q as ve,D as ue,r as E,s as X,R as I,f as be,k as we,l as se,t as Ne,S as ye,m as ke}from"./index-Dhfw3dbQ.js";import{L as z}from"./router-CxCaNF6T.js";import"./react-dom-Dp7c0bxT.js";import"./vendor-DSXEjpE4.js";import"./data-lessons-BVXBF808.js";import"./data-vocab-BtRUsb5n.js";function Ee({oldEvo:l,newEvo:j,petName:T,onComplete:w,onSkip:R}){const[m,N]=x.useState("intro");x.useEffect(()=>{const v=setTimeout(()=>N("flashing"),500),h=setTimeout(()=>N("reveal"),3e3),y=setTimeout(()=>{N("done"),w&&w()},3800);return()=>{clearTimeout(v),clearTimeout(h),clearTimeout(y)}},[]);const t=m==="reveal"||m==="done"?j:l;return e.jsxs("div",{className:"cowdi-evo-overlay",role:"dialog","aria-label":"Pet đang tiến hóa",children:[e.jsx("div",{className:`cowdi-evo-rays ${m}`}),e.jsx("div",{className:"cowdi-evo-sparkles",children:Array.from({length:14}).map((v,h)=>e.jsx("span",{className:"cowdi-evo-spark",style:{left:`${h*73%100}%`,top:`${h*41%100}%`,animationDelay:`${h*137%1800}ms`},children:e.jsx(i,{name:"sparkles",size:22})},h))}),e.jsxs("div",{className:`cowdi-evo-stage ${m}`,children:[e.jsxs("div",{className:"cowdi-evo-pet-wrap",children:[t!=null&&t.image?e.jsx("img",{src:t.image,alt:t.name,className:"cowdi-evo-pet-img",draggable:!1}):e.jsx("span",{className:"cowdi-evo-pet-emoji emoji-big",children:e.jsx(p,{e:(t==null?void 0:t.emoji)||"🥚",size:144})}),e.jsx("div",{className:"cowdi-evo-flash"})]}),e.jsxs("div",{className:"cowdi-evo-caption",children:[m==="intro"&&e.jsxs("span",{children:[T||(l==null?void 0:l.name)," đang tiến hóa…"]}),m==="flashing"&&e.jsx("span",{children:"Một luồng sáng bao trùm…"}),(m==="reveal"||m==="done")&&e.jsxs("span",{className:"cowdi-evo-newname",children:[e.jsx(i,{name:"party",size:28})," ",j==null?void 0:j.name,"!"]})]})]}),e.jsx("button",{type:"button",className:"cowdi-evo-skip",onClick:R,children:"Bỏ qua ›"}),e.jsx("style",{children:`
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
      `})]})}function Te(){var Y,$,M,_,K,Q,H,G,U,V,W,q,J,Z,ee;pe(ye["/pet"]);const{petData:l,getActivePetWithDecay:j,feedPet:T,renamePet:w,useFood:R,completeDailyQuest:m,addCoins:N,feedXPToPet:L}=xe(),{userData:t}=he(),v=ge(),[h,y]=x.useState(!1),[P,O]=x.useState(""),[n,u]=x.useState(null),[ae,A]=x.useState(!1),[ie,te]=x.useState("");function S(s,g={}){const d=j(),b=d?C[d.speciesId]:null,re=d&&b?F(d.speciesId,d.totalXpEarned):null,f=L(s);if(!f.ok)return f.reason==="insufficient"&&v("Không đủ XP trong ví!","warning"),f;if(f.evolved&&b){const de=b.evolutions.find(me=>me.stage===f.newEvoStage)||F(d.speciesId,(d.totalXpEarned||0)+s);u({stage:"animation",oldEvo:re,newEvo:de,petName:d.customName})}else g.silent||v(`+${s} XP cho Pet`,"success");return f}function ne(){var g;if(!n)return;const s=`Cowdi của mình vừa tiến hóa thành ${((g=n.newEvo)==null?void 0:g.name)||"pet mới"}! 🎉
Học tiếng Anh chung cho vui nha 🐾`;te(s),u(null),A(!0)}const a=j(),c=a?C[a.speciesId]:null,o=a&&c?F(a.speciesId,a.totalXpEarned):null,r=c==null?void 0:c.evolutions.find(s=>s.xp>((a==null?void 0:a.totalXpEarned)||0)),oe=a&&c?je(a,c):0,k=a?fe(a.needs):"happy",ce=c?ve(a.speciesId,k):"",B=x.useMemo(()=>ue.map(s=>({...s,done:l.dailyQuests.completed.includes(s.id),canClaim:s.check(t)&&!l.dailyQuests.completed.includes(s.id)})),[l.dailyQuests,t]),le=B.every(s=>s.done);if(x.useMemo(()=>E.filter(s=>s.category==="food"&&l.ownedItems.includes(s.id)),[l.ownedItems]),!a||!c)return e.jsxs("div",{className:"text-center py-5 fade-in",children:[e.jsx("div",{style:{fontSize:"5rem"},className:"emoji-big",children:e.jsx(i,{name:"egg",size:96})}),e.jsx("h2",{className:"fw-bold mt-3",children:"Đang tải pet..."})]});function D(){P.trim()&&w(l.activePetId,P.trim()),y(!1)}return e.jsxs("div",{className:"fade-in",children:[e.jsx("div",{className:"text-center mb-4",children:e.jsxs("h2",{className:"fw-bold",children:[e.jsx("span",{className:"me-2",children:e.jsx(i,{name:"paw",size:32})}),"Pet của bạn"]})}),e.jsxs("div",{className:"pet-display-card mb-4",children:[e.jsxs("div",{className:`pet-stage-container ${k}`,children:[e.jsx("div",{className:"pet-floating-decor",children:((Y=a.cosmetics)==null?void 0:Y.effect)&&e.jsx("span",{className:"pet-effect-icon",children:e.jsx(p,{e:(($=E.find(s=>s.id===a.cosmetics.effect))==null?void 0:$.emoji)||"",size:30})})}),((M=a.cosmetics)==null?void 0:M.hat)&&e.jsx("div",{className:"pet-hat-img",children:e.jsx(p,{e:((_=E.find(s=>s.id===a.cosmetics.hat))==null?void 0:_.emoji)||"",size:42})}),e.jsx("div",{className:"pet-image-wrapper",children:o!=null&&o.image?e.jsx("img",{src:o.image,alt:o.name,className:"pet-character-img",draggable:!1}):e.jsx("div",{className:"pet-emoji-fallback emoji-big",children:e.jsx(p,{e:(o==null?void 0:o.emoji)||c.emoji,size:110})})}),((K=a.cosmetics)==null?void 0:K.outfit)&&e.jsx("div",{className:"pet-outfit-badge",children:e.jsx(p,{e:((Q=E.find(s=>s.id===a.cosmetics.outfit))==null?void 0:Q.emoji)||"",size:28})}),e.jsx("div",{className:"pet-mood-indicator",children:e.jsx(i,{name:k==="happy"?"smile":k==="sad"?"sad":"sick",size:26})})]}),e.jsxs("div",{className:"pet-info-section",children:[e.jsx("div",{className:"pet-name-area",children:h?e.jsxs("div",{className:"d-flex justify-content-center gap-2",children:[e.jsx("input",{type:"text",className:"form-control form-control-sm pet-name-input",value:P,onChange:s=>O(s.target.value),maxLength:20,autoFocus:!0,onKeyDown:s=>s.key==="Enter"&&D()}),e.jsx("button",{className:"btn btn-sm btn-cowdi-primary",onClick:D,children:"✓"})]}):e.jsxs("h3",{className:"pet-name",children:[a.customName,e.jsx("button",{className:"btn btn-sm btn-link text-muted ms-1",onClick:()=>{y(!0),O(a.customName)},title:"Đổi tên",children:e.jsx(i,{name:"pencil",size:16})})]})}),e.jsxs("div",{className:"pet-badges",children:[e.jsx("span",{className:"pet-badge",style:{background:(H=X[c.element])==null?void 0:H.bg,color:(G=X[c.element])==null?void 0:G.text},children:(U=X[c.element])==null?void 0:U.name}),e.jsx("span",{className:"pet-badge",style:{background:(V=I[c.rarity])==null?void 0:V.bg,color:(W=I[c.rarity])==null?void 0:W.text},children:(q=I[c.rarity])==null?void 0:q.name}),e.jsxs("span",{className:"pet-badge pet-badge-power",children:[e.jsx(i,{name:"bolt",size:14})," ",oe]})]}),e.jsx("div",{className:"pet-evolution-label",children:(o==null?void 0:o.name)||"Trứng"}),e.jsxs("div",{className:"pet-speech-bubble",children:[e.jsx("div",{className:"pet-speech-arrow"}),e.jsx("p",{className:"mb-0",children:e.jsx(be,{children:ce})})]})]})]}),r&&e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:e.jsx(i,{name:"bolt",size:22})}),e.jsx("span",{children:"Tiến hóa tiếp theo"})]}),e.jsxs("div",{className:"pet-evo-preview",children:[r.image?e.jsx("img",{src:r.image,alt:r.name,className:"pet-evo-next-img"}):e.jsx("span",{className:"pet-evo-next-emoji",children:e.jsx(p,{e:r.emoji,size:36})}),e.jsx("span",{className:"pet-evo-next-name",children:r.name})]}),e.jsx("div",{className:"pet-progress-bar",children:e.jsx("div",{className:"pet-progress-fill",style:{width:`${Math.min(100,(a.totalXpEarned-((o==null?void 0:o.xp)||0))/(r.xp-((o==null?void 0:o.xp)||0))*100)}%`}})}),e.jsxs("div",{className:"pet-progress-text",children:[a.totalXpEarned," / ",r.xp," XP"]})]}),e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:e.jsx(i,{name:"sparkles",size:22})}),e.jsx("span",{children:"Cho Pet ăn XP"}),e.jsxs("span",{className:"pet-badge ms-auto",style:{background:"#FFF3CD",color:"#856404"},children:[e.jsx(i,{name:"star",size:14})," Ví: ",t.availableXP||0]})]}),e.jsx("div",{className:"text-muted small mb-2",children:"XP bạn kiếm được qua học tập có thể “cho Pet ăn” để trực tiếp tăng tiến độ tiến hóa (1 XP = 1 điểm tiến hóa). Tổng XP sự nghiệp (lên cấp user / bảng xếp hạng) vẫn được giữ nguyên."}),e.jsxs("div",{className:"d-flex flex-wrap gap-2",children:[[50,200,500].map(s=>e.jsxs("button",{type:"button",className:"btn btn-sm btn-warning fw-bold",disabled:(t.availableXP||0)<s,onClick:()=>{S(s)},children:["+",s," XP"]},s)),r&&(t.availableXP||0)>=r.xp-(a.totalXpEarned||0)&&e.jsxs("button",{type:"button",className:"btn btn-sm btn-success fw-bold",onClick:()=>{const s=r.xp-(a.totalXpEarned||0);S(s,{silent:!0})},children:[e.jsx(i,{name:"bolt",size:14})," Tiến hóa ngay (",r.xp-(a.totalXpEarned||0)," XP)"]}),e.jsxs("button",{type:"button",className:"btn btn-sm btn-outline-warning fw-bold",disabled:(t.availableXP||0)<=0,onClick:()=>{const s=t.availableXP||0;S(s)},children:["Tiêu tất cả (",t.availableXP||0,")"]})]})]}),e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:e.jsx(i,{name:"heart",size:22})}),e.jsx("span",{children:"Trạng thái"})]}),e.jsx("div",{className:"pet-needs-grid",children:[{key:"energy",icon:"🍎",label:"Năng lượng",color:"#4CAF50",gradient:"linear-gradient(90deg, #66BB6A, #43A047)"},{key:"happiness",icon:"😊",label:"Vui vẻ",color:"#FFC107",gradient:"linear-gradient(90deg, #FFD54F, #FFC107)"},{key:"health",icon:"💤",label:"Sức khỏe",color:"#EF5350",gradient:"linear-gradient(90deg, #EF5350, #E53935)"},{key:"knowledge",icon:"📚",label:"Kiến thức",color:"#AB47BC",gradient:"linear-gradient(90deg, #CE93D8, #AB47BC)"}].map(s=>e.jsxs("div",{className:"pet-need-item",children:[e.jsx("div",{className:"pet-need-icon",children:e.jsx(p,{e:s.icon,size:26})}),e.jsxs("div",{className:"pet-need-info",children:[e.jsxs("div",{className:"pet-need-label",children:[e.jsx("span",{children:s.label}),e.jsxs("span",{className:a.needs[s.key]<30?"pet-need-critical":"",children:[a.needs[s.key],"%"]})]}),e.jsx("div",{className:"pet-need-bar",children:e.jsx("div",{className:"pet-need-fill",style:{width:`${a.needs[s.key]}%`,background:a.needs[s.key]<30?"#EF5350":s.gradient}})})]})]},s.key))})]}),e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:e.jsx(i,{name:"chart",size:22})}),e.jsx("span",{children:"Kỹ năng"})]}),e.jsx("div",{className:"pet-skills-grid",children:Object.entries(we).map(([s,g])=>{const d=a.skills[s]||0,b=ke(d);return e.jsxs("div",{className:"pet-skill-card",style:{"--skill-color":g.color},children:[e.jsx("div",{className:"pet-skill-icon",children:se[s]?e.jsx(i,{name:se[s],size:30}):e.jsx(p,{e:g.icon,size:30})}),e.jsxs("div",{className:"pet-skill-level",children:["Lv.",b]}),e.jsx("div",{className:"pet-skill-name",children:g.name}),e.jsx("div",{className:"pet-skill-bar",children:e.jsx("div",{className:"pet-skill-fill",style:{width:`${Math.min(100,d%50*2)}%`}})}),e.jsxs("div",{className:"pet-skill-pts",children:[d," pts"]})]},s)})})]}),e.jsxs("div",{className:"pet-section-card mb-3",children:[e.jsxs("div",{className:"pet-section-header",children:[e.jsx("span",{className:"pet-section-icon",children:e.jsx(i,{name:"clipboard",size:22})}),e.jsx("span",{children:"Nhiệm vụ hàng ngày"}),le&&e.jsx("span",{className:"pet-badge-done",children:"Hoàn thành!"})]}),B.map(s=>e.jsxs("div",{className:`pet-quest-item ${s.done?"done":""}`,children:[e.jsx("span",{className:"pet-quest-check",children:e.jsx(i,{name:s.done?"check":"square",size:20})}),e.jsxs("div",{className:"pet-quest-info",children:[e.jsx("div",{className:"pet-quest-title",children:s.title}),e.jsx("div",{className:"pet-quest-desc",children:s.desc})]}),s.canClaim?e.jsxs("button",{className:"pet-quest-claim",onClick:()=>m(s.id),children:["+",s.reward,e.jsx(i,{name:"coin",size:14})]}):e.jsxs("span",{className:"pet-quest-reward",children:[s.reward,e.jsx(i,{name:"coin",size:14})]})]},s.id))]}),e.jsxs("div",{className:"pet-quick-actions",children:[e.jsxs(z,{to:"/lessons",className:"pet-action-card",children:[e.jsx("div",{className:"pet-action-icon",children:e.jsx(i,{name:"grad",size:36})}),e.jsx("div",{className:"pet-action-label",children:"Học bài"}),e.jsxs("div",{className:"pet-action-hint",children:["+",e.jsx(i,{name:"apple",size:12})," +Skills"]})]}),e.jsxs(z,{to:"/practice",className:"pet-action-card",children:[e.jsx("div",{className:"pet-action-icon",children:e.jsx(i,{name:"gamepad",size:36})}),e.jsx("div",{className:"pet-action-label",children:"Luyện tập"}),e.jsxs("div",{className:"pet-action-hint",children:["+",e.jsx(i,{name:"smile",size:12})," +Skills"]})]}),e.jsxs(z,{to:"/collection",className:"pet-action-card",children:[e.jsx("div",{className:"pet-action-icon",children:e.jsx(i,{name:"box",size:36})}),e.jsx("div",{className:"pet-action-label",children:"Bộ sưu tập"}),e.jsxs("div",{className:"pet-action-hint",children:[Object.keys(l.collection).length,"/",Object.keys(C).length," pet"]})]}),e.jsxs(z,{to:"/shop",className:"pet-action-card",children:[e.jsx("div",{className:"pet-action-icon",children:e.jsx(i,{name:"bag",size:36})}),e.jsx("div",{className:"pet-action-label",children:"Cửa hàng"}),e.jsxs("div",{className:"pet-action-hint",children:[l.coins,e.jsx(i,{name:"coin",size:12})]})]})]}),(n==null?void 0:n.stage)==="animation"&&e.jsx(Ee,{oldEvo:n.oldEvo,newEvo:n.newEvo,petName:n.petName,onComplete:()=>u(s=>s&&{...s,stage:"result"}),onSkip:()=>u(s=>s&&{...s,stage:"result"})}),(n==null?void 0:n.stage)==="result"&&e.jsxs("div",{className:"cowdi-evo-result-overlay",role:"dialog",children:[e.jsxs("div",{className:"cowdi-evo-result-card",children:[e.jsxs("div",{className:"cowdi-evo-result-title",children:[e.jsx(i,{name:"party",size:24})," ",n.petName," vừa tiến hóa!"]}),e.jsx("div",{className:"cowdi-evo-result-pet",children:(J=n.newEvo)!=null&&J.image?e.jsx("img",{src:n.newEvo.image,alt:n.newEvo.name}):e.jsx("span",{style:{fontSize:"6rem"},className:"emoji-big",children:e.jsx(p,{e:((Z=n.newEvo)==null?void 0:Z.emoji)||"✨",size:96})})}),e.jsx("div",{className:"cowdi-evo-result-name",children:(ee=n.newEvo)==null?void 0:ee.name}),e.jsxs("div",{className:"cowdi-evo-result-actions",children:[e.jsxs("button",{type:"button",className:"btn btn-cowdi-primary fw-bold",onClick:ne,children:[e.jsx(i,{name:"gift",size:18})," Khoe & mời bạn"]}),e.jsx("button",{type:"button",className:"btn btn-outline-secondary",onClick:()=>u(null),children:"Đóng"})]})]}),e.jsx("style",{children:`
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
          `})]}),e.jsx(Ne,{open:ae,onClose:()=>A(!1),prefilledMessage:ie})]})}export{Te as default};
