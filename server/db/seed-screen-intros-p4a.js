/**
 * 36 câu dẫn bản nháp (status = 'draft') cho Hệ thống Màn học Đợt 4a.
 * 3 mã mới (F-02, F-04, F-05) × 3 vùng (BD, TG, VS) × 4 câu = 36 dòng.
 * Tuân thủ chặt REGION_BRIEF, HUMAN_CAST, ≤ 25 chữ tiếng Việt, không nhắc Gem/tiền, không đổ lỗi.
 */

export const P4A_INTRO_CODES = ['F-02', 'F-04', 'F-05'];
export const P4A_INTRO_REGIONS = ['BD', 'TG', 'VS'];

const RAW_P4A_INTROS = {
  'F-02': {
    BD: [
      'Bến gỗ Bến Đò Ông Tư đang chờ từng chữ cái! Con ghép đúng chính tả để xếp hàng lên đò cùng bò nha!',
      'Ông Tư chuẩn bị nhổ neo sang Cù Lao rồi! Con nghe từ và chọn từng chữ cái ghép cho chuẩn nhé!',
      'Sương sớm phủ nhẹ mặt sông Bến Đò. Con nhìn nghĩa rồi ghép đủ chữ cái của từ cùng Cowdi nha!',
      'Mỗi chữ cái ghép đúng là thêm nhịp chèo cho chiếc đò. Cùng bò hoàn thành các từ mới hôm nay nhé!',
    ],
    TG: [
      'Gió lộng trên cánh đồng Tháp Gió làm các chữ cái bay lơ lửng! Con chạm ghép lại thành từ đúng nha!',
      'Mimi đứng dưới chân Tháp Gió cổ vũ con đấy! Nghe phát âm rồi chọn từng chữ cái ghép đúng nhé!',
      'Owlbert trộn sẵn các chữ cái bên cánh quạt Tháp Gió. Con ghép chính tả thật gọn gàng cùng Cowdi nha!',
      'Storm vừa gửi sáu từ mới giữa làn gió Tháp Gió. Con chạm đúng thứ tự chữ cái cùng bò nhé!',
    ],
    VS: [
      'Giữa Vườn Sữa xanh mát, cùng Cowdi nhìn hình và ghép từng chữ cái cho tròn chính tả nha!',
      'Bamboo xếp sẵn bảng chữ cái bên rừng trúc Vườn Sữa. Con bấm loa nghe rồi ghép từ đúng nhé!',
      'Đàn gà ở Vườn Sữa đang tò mò xem con ghép chữ đấy! Chọn đúng từng chữ cái cùng bò nha!',
      'Bamboo Spirit gửi tặng con sáu từ quen ở Vườn Sữa. Chạm chữ cái ghép thành từ chuẩn cùng Cowdi nhé!',
    ],
  },

  'F-04': {
    BD: [
      'Chiếc đò ngang của ông Tư đã sẵn sàng bên bến gỗ! Nghe mẫu, đếm ba hai một rồi đọc to nhé!',
      'Sương sớm trên mặt sông Bến Đò sẽ tan nhanh khi con đọc to, rõ từng câu tiếng Anh cùng bò nha!',
      'Ông Tư khen ai phát âm rõ trên Bến Đò lắm! Con nghe kỹ câu mẫu rồi gọi pet qua sông nhé!',
      'Đứng bên bến gỗ hướng sang Cù Lao, con nghe mẫu rồi tự tin nói to từng câu cùng Cowdi nha!',
    ],
    TG: [
      'Gió trên Tháp Gió thổi lộng lắm! Con nghe câu mẫu rồi đọc thật to để gọi pet vượt gió nha!',
      'Mimi và Owlbert đang lắng nghe con dưới chân Tháp Gió. Đếm ba hai một xong mình đọc rõ câu nhé!',
      'Storm bảo chỉ cần nói to, rõ nhịp là vượt gió Tháp Gió dễ ợt! Cùng Cowdi luyện nói từng câu nha!',
      'Cánh quạt Tháp Gió quay đều theo giọng đọc của con kìa! Nghe mẫu chậm nếu cần rồi đọc lại nhé!',
    ],
    VS: [
      'Giữa Vườn Sữa yên tĩnh, con nghe mẫu rồi đọc to giúp pet nhảy qua từng tảng đá nhé!',
      'Bamboo đứng bên rừng trúc Vườn Sữa cổ vũ con nói tiếng Anh thật tự tin! Đếm xong mình đọc nha!',
      'Đàn gà ở Vườn Sữa im lặng lắng nghe con phát âm rồi! Nghe kỹ câu mẫu rồi đọc theo cùng bò nhé!',
      'Bamboo Spirit dẫn lối qua dòng suối nhỏ ở Vườn Sữa. Con đọc rõ từng câu giúp Cowdi vượt qua nha!',
    ],
  },

  'F-05': {
    BD: [
      'Sương sớm Bến Đò Ông Tư che mất vài từ trong đoạn văn rồi! Nghe từ rồi chạm đúng ô sương nha!',
      'Ông Tư nhờ con tìm các từ ẩn trong làn sương trên bến gỗ. Sương tan hết mình trả lời câu hỏi nhé!',
      'Mặt sông sang Cù Lao bảng lảng sương mù. Con nghe kỹ từng từ rồi chạm giải sương cùng Cowdi nha!',
      'Mỗi lần chạm đúng từ khóa là màn sương Bến Đò mỏng đi hẳn. Cùng bò săn chữ rồi đọc hiểu nhé!',
    ],
    TG: [
      'Làn gió Tháp Gió cuốn sương che mất mấy từ khóa trong bài đọc! Con nghe rồi chạm mở chữ nha!',
      'Owlbert đánh dấu sẵn các ô sương tại Tháp Gió. Con nghe phát âm rồi tìm đúng vị trí từ cùng bò nhé!',
      'Mimi bảo tìm hết từ khóa trong sương xong mình đọc bản dịch rất dễ hiểu! Bắt đầu cùng Cowdi nha!',
      'Storm quét bớt mây trên cánh đồng Tháp Gió, còn các ô sương trong đoạn văn nhờ con mở hết nhé!',
    ],
    VS: [
      'Vườn Sữa sáng nay có vài cụm sương che mất từ khóa trong bài đọc. Nghe từ rồi chạm mở cùng bò nha!',
      'Bamboo giấu vài từ mới sau lớp sương bên rừng trúc Vườn Sữa. Con nghe kỹ rồi tìm đúng ô chữ nhé!',
      'Đàn gà ở Vườn Sữa thích xem con giải sương cho đoạn văn lắm! Mở hết từ rồi trả lời hai câu nha!',
      'Cowdi và Bamboo Spirit cùng con săn từ khóa tại Vườn Sữa. Chạm đúng ô sương để chữ sáng vàng nhé!',
    ],
  },
};

export function buildP4aSeedIntros() {
  const rows = [];
  for (const code of P4A_INTRO_CODES) {
    const codeKey = code.replace('-', '');
    for (const region of P4A_INTRO_REGIONS) {
      const list = RAW_P4A_INTROS[code]?.[region] || [];
      list.forEach((textVi, idx) => {
        const num = String(idx + 1).padStart(2, '0');
        rows.push({
          id: `DN-${codeKey}-${region}-${num}`,
          screenCode: code,
          region,
          textVi,
          status: 'draft',
        });
      });
    }
  }
  return rows;
}

export const P4A_SEED_INTROS = buildP4aSeedIntros();
