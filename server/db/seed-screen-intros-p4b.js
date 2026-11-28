/**
 * 36 câu dẫn bản nháp (status = 'draft') cho Hệ thống Màn học Đợt 4b.
 * 3 mã mới (F-07, F-10, F-11) × 3 vùng (BD, TG, VS) × 4 câu = 36 dòng.
 * Tuân thủ chặt REGION_BRIEF, HUMAN_CAST, ≤ 25 chữ tiếng Việt, không nhắc Gem/tiền, không đổ lỗi.
 */

export const P4B_INTRO_CODES = ['F-07', 'F-10', 'F-11'];
export const P4B_INTRO_REGIONS = ['BD', 'TG', 'VS'];

const RAW_P4B_INTROS = {
  'F-07': {
    BD: [
      'Trên Bến Đò Ông Tư có ghe hàng đang đậu kìa! Con nghe khách đặt rồi chọn đúng giỏ giao nha!',
      'Khách bên bờ sông đang gọi đặt hàng mang sang Cù Lao. Con nghe kỹ số lượng rồi chọn giỏ nhé!',
      'Sương sớm trên sông đã dịu rồi! Con nghe đơn hàng của khách và chọn giỏ chuẩn cùng Cowdi nha!',
      'Ông Tư cổ vũ con giao đủ sáu đơn hàng thật nhanh trên bến gỗ. Giữ nút loa để nghe chậm nhé!',
    ],
    TG: [
      'Dưới chân Tháp Gió có phiên chợ nhỏ thật vui! Con nghe kỹ đơn hàng rồi chọn đúng giỏ nhé!',
      'Mimi đứng đếm giúp con số lượng từng món trên cánh đồng Tháp Gió. Nghe thật rõ rồi chọn nha!',
      'Owlbert nhắc con chú ý cả tên món và số lượng nhé! Cùng Cowdi giao chuẩn từng giỏ hàng nào!',
      'Storm mang đơn hàng theo làn gió Tháp Gió tới rồi! Con lắng nghe rồi chọn giỏ thật nhanh nha!',
    ],
    VS: [
      'Giữa Vườn Sữa xanh mát, khách đang gọi đặt từng giỏ hàng kìa! Con nghe rõ rồi chọn đúng nhé!',
      'Bamboo chuẩn bị sẵn bốn giỏ hàng bên rừng trúc Vườn Sữa. Nghe thật kỹ số lượng cùng bò nha!',
      'Đàn gà ở Vườn Sữa đứng xem con chọn giỏ hàng đấy! Nghe số đếm rồi chạm đúng giỏ nhé!',
      'Cowdi và Bamboo Spirit cổ vũ con hoàn thành đủ sáu lượt nghe đếm số lượng tại Vườn Sữa nha!',
    ],
  },

  'F-10': {
    BD: [
      'Ông Tư đang ngồi chờ trò chuyện cùng con trên bến gỗ Bến Đò! Nghe câu hỏi rồi đáp lại nhé!',
      'Chiếc đò ngang sang Cù Lao êm ả lắm, rất hợp luyện hội thoại tiếng Anh cùng ông Tư và bò nha!',
      'Sương sớm trên mặt sông làm cuộc trò chuyện thêm ấm áp. Con nghe kỹ câu hỏi rồi tự tin đáp nhé!',
      'Mỗi câu trả lời rõ ràng giúp ông Tư hiểu tiếng Anh hơn đấy! Cùng Cowdi trò chuyện thật vui nha!',
    ],
    TG: [
      'Dưới bóng cánh quạt Tháp Gió, cùng bò luyện đối đáp tiếng Anh thật tự nhiên qua từng câu hỏi nhé!',
      'Mimi và Owlbert đang lắng nghe màn hội thoại của con tại Tháp Gió đấy! Tự tin trả lời to rõ nha!',
      'Gió lộng trên cánh đồng Tháp Gió mang theo câu hỏi mới. Con nghe kỹ rồi đáp theo gợi ý cùng bò nhé!',
      'Storm cổ vũ con nói trọn vẹn câu trả lời tại Tháp Gió. Bấm nghe lại câu hỏi nếu con cần nha!',
    ],
    VS: [
      'Giữa Vườn Sữa yên bình, cùng Cowdi trò chuyện tiếng Anh thật tự tin qua từng lượt hỏi đáp nhé!',
      'Bên rừng trúc Vườn Sữa, Bamboo chăm chú nghe con trả lời từng câu hỏi tiếng Anh đấy! Bắt đầu nha!',
      'Đàn gà ở Vườn Sữa đang trật tự nghe con tập hội thoại rồi! Nói to, rõ theo gợi ý cùng bò nhé!',
      'Bamboo Spirit gửi tặng con những câu giao tiếp gần gũi tại Vườn Sữa. Nghe câu hỏi rồi đáp ngay nha!',
    ],
  },

  'F-11': {
    BD: [
      'Trên bến gỗ Bến Đò Ông Tư có xấp thẻ Đúng hay Sai kìa! Con đọc kỹ câu rồi chọn nhanh nhé!',
      'Ông Tư nhờ con kiểm tra xem mấy câu tiếng Anh này đúng hay sai trước khi đò sang Cù Lao nha!',
      'Chạm vào câu để nghe đọc giữa tiếng sóng sông Bến Đò, rồi vuốt trái hoặc phải thật gọn gàng nhé!',
      'Sương sớm Bến Đò sẽ tan nhanh khi con phân biệt chuẩn từng thẻ Đúng hay Sai cùng Cowdi nha!',
    ],
    TG: [
      'Gió Tháp Gió thổi tới xấp thẻ Đúng hay Sai mới tinh! Con đọc cẩn thận rồi chọn đáp án nhé!',
      'Owlbert kiểm tra xem con nhận ra câu nào đúng, câu nào sai tại Tháp Gió đấy! Chạm hoặc vuốt thẻ nha!',
      'Mimi đứng cổ vũ con dưới chân Tháp Gió. Đọc kỹ nghĩa từng câu rồi bấm nút Đúng hay Sai nhé!',
      'Storm bảo chỉ cần đọc kỹ từng chữ là vượt gọn màn Đúng hay Sai ở Tháp Gió. Thử cùng bò nha!',
    ],
    VS: [
      'Giữa Vườn Sữa xanh mát, cùng Cowdi đọc từng tấm thẻ và phân biệt thật chuẩn Đúng hay Sai nhé!',
      'Bamboo đặt sẵn bộ thẻ Đúng hay Sai bên rừng trúc Vườn Sữa. Con vuốt trái là Sai, phải là Đúng nha!',
      'Đàn gà ở Vườn Sữa tò mò xem con chọn đúng hết không kìa! Chạm vào câu để nghe phát âm nhé!',
      'Bamboo Spirit sẵn sàng giải thích ngay nếu con chọn nhầm tại Vườn Sữa. Đọc kỹ rồi trả lời cùng bò nha!',
    ],
  },
};

export function buildP4bSeedIntros() {
  const rows = [];
  for (const code of P4B_INTRO_CODES) {
    const codeKey = code.replace('-', '');
    for (const region of P4B_INTRO_REGIONS) {
      const list = RAW_P4B_INTROS[code]?.[region] || [];
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

export const P4B_SEED_INTROS = buildP4bSeedIntros();
