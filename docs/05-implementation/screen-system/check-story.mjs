import {SEASON2_UNITS as U,SEASON2_LESSONS as L,unitBoss,narratorStage,bossFogLevel} from '../shared/story-season2.js';
const PETS=['cowdi','flippy','pingu','owlbert','mimi','bamboo','bamboo_spirit','storm'];const HUM=['mai','minh','lan','tom','khoa','ong_tu'];
let err=0;const w=s=>s.trim().split(/\s+/).length;
const chk=(o,where)=>{if(o.vi&&w(o.vi)>25){err++;console.log('VI>25',where,w(o.vi))} if(o.en&&w(o.en)>8){err++;console.log('EN>8',where,o.en)}};
for(const[id,u]of Object.entries(U)){chk(u.arrival,id);chk(u.epilogue,id);for(const[k,v]of Object.entries(u.boss.lines)){[].concat(v).forEach(x=>chk(x,id+'.'+k))}
 if(!PETS.includes(u.boss.pet)||!PETS.includes(u.boss.alt)){err++;console.log('pet?',id)}
 const n=Object.values(L).filter(l=>l.unit===id).length; if(n!==u.landmarks.length){err++;console.log('landmarks',id)}}
const seen={};for(const[id,l]of Object.entries(L)){chk({vi:l.introVi,en:l.introEn},id);
 if(![...PETS,...HUM].includes(l.npc)){err++;console.log('npc?',id,l.npc)}
 for(const s of ['intro','listen','read','write','speak','boss']){const x=l.slots[s];if(!x){err++;console.log('slot',id,s);continue}chk(x,id+'.'+s);if(seen[x.vi]){err++;console.log('dup',id,s)}seen[x.vi]=1}}
console.log('boss swap',unitBoss('int-u1','flippy').pet,'narr',narratorStage('storm','cowdi',2),narratorStage('cowdi','cowdi',2),'fog',bossFogLevel('int-u3',['clothing','house']),bossFogLevel('int-u3',[],true));
console.log('errors',err,'lessons',Object.keys(L).length);
