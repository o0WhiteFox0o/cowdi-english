// Sinh keyframe cho 30+ động tác từ hàm nguồn -> shared/pet-motion.js
import { SRC } from './src-clips.js';
import { writeFileSync } from 'fs';
const CHN=['rot','dx','dy','sx','sy','head','crown','cskew','armL','armR','mouth','lookX','lookY','glow','eyes'];
const DEF={rot:0,dx:0,dy:0,sx:1,sy:1,head:0,crown:0,cskew:0,armL:0,armR:0,mouth:0,lookX:0,lookY:0,glow:0};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const CLIPS={};
for(const [name,[dur,loop,fn]] of Object.entries(SRC)){const n=clamp(Math.round(dur*5)+1,5,13),tr={};
 for(let i=0;i<n;i++){const p=i/(n-1),t=+(p*dur).toFixed(3),v=fn(loop&&i===n-1?0:p,1);
  for(const c of CHN){if(!(c in v))continue;(tr[c]??=[]).push([t,c==='eyes'?v[c]:+(+v[c]).toFixed(3),c==='eyes'?'step':'smooth'])}}
 for(const c of Object.keys(tr)){if(c==='eyes')tr[c]=tr[c].filter((k,i,a)=>i===0||k[1]!==a[i-1][1]);else if(tr[c].every(k=>Math.abs(k[1]-DEF[c])<1e-3))delete tr[c]}
 CLIPS[name]={dur,loop:!!loop,tracks:tr}}
const META={
 idle:{pr:0},look_around:{pr:0},fidget:{pr:0,fx:[['sun',.3,.8]]},sleepy:{pr:0},sleep:{pr:0,fx:['z']},wake_up:{pr:2},
 attentive:{pr:0},think:{pr:1,fx:['dots']},cheer_small:{pr:2,burst:'spark'},cheer_big:{pr:3,burst:'confetti'},dance:{pr:3,burst:'confetti'},
 encourage:{pr:2},listen:{pr:1,fx:['wave'],level:'mic'},talk:{pr:1,level:'voice'},proud:{pr:3,burst:'spark'},
 tap_head:{pr:2,burst:'heart'},tap_body:{pr:2},drag:{pr:5},dizzy:{pr:3,fx:['stars']},wave:{pr:1},
 eat:{pr:2,fx:[['crumb',.25,.9]],food:true},greet_return:{pr:3,burst:'heart'},evolve:{pr:4,burst:'spark'},
 prop_listening:{pr:0,prop:'phones',fx:['note']},prop_speaking:{pr:0,prop:'notes',fx:['note']},prop_reading:{pr:0,prop:'book'},prop_writing:{pr:0,prop:'pencil',fx:['doodle']},
 battle_ready:{pr:0},attack:{pr:2},crit:{pr:3,burst:'spark'},dodge:{pr:2},hit:{pr:2,tint:true},win:{pr:3,burst:'confetti'},lose_proud:{pr:3}
};
CLIPS.drag={dur:1,loop:true,tracks:{armL:[[0,70,'smooth'],[.5,85,'smooth'],[1,70,'smooth']],armR:[[0,75,'smooth'],[.5,60,'smooth'],[1,75,'smooth']],eyes:[[0,'wide','step']],mouth:[[0,.5,'smooth']]}};
const out=`// Khung chuyển động chung cho mọi pet — Cowdi English
// File sinh bởi tools/bake-clips.mjs. Chỉnh động tác bằng trang /pet-editor/ rồi dán JSON vào shared/pet-motion-edits.js,
// không sửa tay các keyframe dưới đây.
// Mỗi kênh: [giây, giá trị, kiểu chuyển 'smooth'|'linear'|'step'].

/** Nhịp (tempo) và biên độ (amp) theo cấp tiến hoá C1–C5 */
export const STAGE_FACTORS = [[1.25,1.3],[1.15,1.15],[1,1],[0.92,0.9],[0.85,0.8]];

/** Tính cách theo nhóm loài: [nhịp, biên độ] */
export const GROUP_FACTORS = { farm:[1,1.1], herb:[0.85,0.9], hunter:[1.15,1], sea:[0.9,1], sky:[0.9,1], dragon:[0.8,1.2], spirit:[0.75,1] };

/** Mốc gắn bó theo tổng điểm Nghe+Nói+Đọc+Viết của pet (pet.skills) */
export const BOND_TIERS = [
  { min: 0,    key: 'new',     labelVi: 'Mới quen' },
  { min: 60,   key: 'known',   labelVi: 'Quen nhau' },   // vẫy chào, mắt nhìn theo ngón tay
  { min: 200,  key: 'friend',  labelVi: 'Bạn thân' },    // fidget, greet_return
  { min: 500,  key: 'buddy',   labelVi: 'Cạ cứng' },     // cử chỉ theo kỹ năng mạnh nhất
  { min: 1200, key: 'soulmate',labelVi: 'Tri kỷ' },      // nhảy khi xong bài, hào quang nhẹ
];

/** Thông tin chạy của từng clip: pr = ưu tiên, fx = hiệu ứng, prop = đạo cụ */
export const CLIP_META = ${JSON.stringify(META)};

/** Keyframe của từng clip */
export const CLIPS = ${JSON.stringify(CLIPS)};
`;
writeFileSync(new URL('../shared/pet-motion.js', import.meta.url), out);
console.log(Object.keys(CLIPS).length,'clips');
writeFileSync(new URL('../public/pet-editor/clips.json', import.meta.url), JSON.stringify(CLIPS));
