// shared/human-cast.js — Dàn nhân vật người (STORY-BIBLE-IMPLEMENTATION 1.3b).
// Không thêm nhân vật người mới vào bài học nếu chưa có trong bảng này.
export const HUMAN_CAST = {
  mai:    { nameVi: 'Mai',      roleVi: 'em gái Minh, khoảng 6 tuổi; nhân vật chính Mùa 1 (Mới học)' },
  minh:   { nameVi: 'Minh',     roleVi: 'học sinh THCS; nhân vật chính Mùa 2 (Trung bình)' },
  lan:    { nameVi: 'Lan',      roleVi: 'bạn cùng lớp của Minh; nhân vật chính thứ hai Mùa 2' },
  tom:    { nameVi: 'thầy Tom', roleVi: 'giáo viên ở trường Minh và Lan; người nói tiếng Anh, không gắn quốc tịch' },
  khoa:   { nameVi: 'anh Khoa', roleVi: 'anh trai Minh, sinh viên; nhân vật chính Mùa 3 (Luyện thi)' },
  ong_tu: { nameVi: 'ông Tư',   roleVi: 'chèo đò ngang ở Bến Đò; người lớn học từ cháu' },
};

// Ai được làm "NPC" trong màn Mở ải / câu dẫn: người trong HUMAN_CAST
// hoặc pet chủ nhà của vùng (REGIONS[region].hosts). Không ai khác.
export function isValidNpc(npcId, region, REGIONS) {
  if (HUMAN_CAST[npcId]) return true;
  return !!REGIONS[region]?.hosts?.includes(npcId);
}
