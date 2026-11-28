/**
 * 156 câu dẫn bản nháp (status = 'draft') cho Hệ thống Màn học Đợt 3.
 * 13 mã (OPEN + 7 T + 5 F) × 3 vùng (BD, TG, VS) × 4 câu = 156 dòng.
 * Tuân thủ chặt REGION_BRIEF, HUMAN_CAST, ≤ 25 chữ tiếng Việt, không nhắc Gem/tiền, không đổ lỗi.
 */

export const P3_INTRO_CODES = [
  'OPEN',
  'T-01', 'T-02', 'T-04', 'T-05', 'T-06', 'T-07', 'T-08',
  'F-01', 'F-03', 'F-06', 'F-08', 'F-09',
];

export const P3_INTRO_REGIONS = ['BD', 'TG', 'VS'];

const RAW_INTROS = {
  OPEN: {
    BD: [
      'Sương sớm phủ kín Bến Đò Ông Tư rồi! Cùng bò vượt ải giúp ông Tư chở khách qua sông nha!',
      'Bến gỗ sáng nay mờ sương quá. Con đi cùng Cowdi giải sương để chiếc đò sang Cù Lao nhé!',
      'Khách đang đợi bên bờ sông kìa! Con giúp bò và ông Tư hoàn thành ải này để mở đường đò nha!',
      'Mặt sông Bến Đò Ông Tư đang yên ả lắm. Sẵn sàng vượt ải cùng bò cho sương tan biến chưa nào?',
    ],
    TG: [
      'Gió lộng trên Tháp Gió đang thổi mạnh lắm! Cùng bò, Mimi và Owlbert vượt qua ải này nhé!',
      'Các cánh quạt Tháp Gió đang chờ làn gió trong lành. Con cùng Cowdi giải sương cho vùng đất nha!',
      'Storm vừa báo có đám sương ghé ngang cánh đồng Tháp Gió. Bắt đầu vượt ải cùng bò nào!',
      'Mimi và Owlbert đang đợi con dưới chân Tháp Gió. Cùng bò chinh phục đủ các màn hôm nay nhé!',
    ],
    VS: [
      'Sáng nay sương ghé thăm Vườn Sữa trên cù lao rồi! Cùng Cowdi và Bamboo vượt ải cho vườn sáng nhé!',
      'Đàn gà ở Vườn Sữa đang ríu rít gọi con kìa! Vào ải cùng bò học vui rồi giải sương nha!',
      'Rừng trúc của Bamboo hôm nay hơi mờ sương. Con đồng hành cùng Cowdi vượt ải này thật tự tin nhé!',
      'Bamboo Spirit đang vẫy tay chào con tại Vườn Sữa. Cùng bò bắt đầu hành trình ải học mới nào!',
    ],
  },

  'T-01': {
    BD: [
      'Ngồi trên bến gỗ Bến Đò Ông Tư, cùng bò xem kỹ từng từ mới trước khi đò rời bến nhé!',
      'Ông Tư vừa gửi danh sách từ mới bên bờ sông. Con nghe phát âm rồi nhớ nghĩa cùng Cowdi nha!',
      'Sương sớm còn nhẹ, tranh thủ nhìn rõ từng từ mới với bò để lát nữa vượt sông thật dễ nhé!',
      'Mỗi từ mới như một mái chèo giúp đò đi nhanh hơn. Con xem và nghe kỹ cùng bò nha!',
    ],
    TG: [
      'Đứng dưới chân Tháp Gió, cùng bò làm quen từng từ mới trước khi gió thổi mạnh lên nhé!',
      'Owlbert mang bảng từ vựng mới tới Tháp Gió rồi. Con nghe rõ âm và xem ví dụ cùng bò nha!',
      'Mimi bảo học chắc từ mới là bí quyết đi nhanh qua cánh đồng Tháp Gió. Bắt đầu với Cowdi nhé!',
      'Gió mát ở Tháp Gió giúp đầu óc tỉnh táo lắm. Con xem lần lượt từng từ mới cùng bò nha!',
    ],
    VS: [
      'Giữa Vườn Sữa xanh mát, cùng Cowdi làm quen bộ từ vựng mới hôm nay thật thong thả nhé!',
      'Bamboo vừa treo bảng từ mới bên rừng trúc Vườn Sữa. Con bấm nghe từng từ cùng bò nha!',
      'Đàn gà ở Vườn Sữa đang yên lặng nghe con đọc từ mới đấy. Xem kỹ nghĩa từng từ cùng bò nhé!',
      'Mỗi từ mới ở Vườn Sữa đều có ví dụ quen thuộc. Con ngắm thẻ và nghe phát âm cùng Cowdi nha!',
    ],
  },

  'T-02': {
    BD: [
      'Gió sông Bến Đò Ông Tư thổi nhẹ qua từng tấm thẻ. Con nghe, đoán nghĩa rồi lật kiểm tra cùng bò nha!',
      'Ông Tư xếp sẵn xấp thẻ từ trên mũi đò. Con thử nhớ nghĩa trước khi lật thẻ cùng Cowdi nhé!',
      'Mặt sông lấp lánh như những tấm thẻ từ. Nghe kỹ rồi lật xem mình nhớ chuẩn chưa nha!',
      'Đợi khách xuống đò ở Bến Đò Ông Tư, cùng bò lật nhanh vài tấm flashcard cho thật nhớ nhé!',
    ],
    TG: [
      'Cánh quạt Tháp Gió quay đều, thẻ từ cũng sẵn sàng lật mở! Con đoán nghĩa trước cùng bò nha!',
      'Mimi thách con nghe phát âm ở Tháp Gió rồi đoán nghĩa trước khi lật thẻ đấy. Thử cùng Cowdi nhé!',
      'Owlbert cất từng nghĩa tiếng Việt sau mặt thẻ. Gió Tháp Gió thổi tới đâu, con lật chuẩn tới đó nha!',
      'Storm xếp thẻ ngay ngắn trên cánh đồng Tháp Gió. Nghe âm thật rõ rồi chạm lật thẻ cùng bò nhé!',
    ],
    VS: [
      'Dưới bóng rừng trúc Vườn Sữa, cùng bò lật từng thẻ từ xem con nhớ được bao nhiêu rồi nha!',
      'Bamboo chuẩn bị bộ thẻ flashcard bên cạnh Vườn Sữa. Nghe phát âm xong hãy lật kiểm tra nhé!',
      'Đàn gà ở Vườn Sữa cũng tò mò mặt sau tấm thẻ lắm! Con đoán nghĩa rồi chạm lật cùng Cowdi nha!',
      'Ở Vườn Sữa yên bình, lật thẻ chậm rãi sẽ nhớ từ rất lâu. Bắt đầu lượt thẻ cùng bò nhé!',
    ],
  },

  'T-04': {
    BD: [
      'Trên chuyến đò ngang của ông Tư, cùng bò đọc kỹ đoạn văn ngắn rồi trả lời câu hỏi nhé!',
      'Ông Tư kể một câu chuyện nhỏ bên bến gỗ Bến Đò. Con đọc cẩn thận rồi chọn ý đúng cùng Cowdi nha!',
      'Chạm vào từ in đậm trong bài đọc để nghe lại giữa tiếng sóng sông Bến Đò Ông Tư nhé!',
      'Đò trôi êm trên sông sang Cù Lao. Con đọc trọn đoạn văn rồi giải câu hỏi hiểu bài cùng bò nha!',
    ],
    TG: [
      'Owlbert gửi con một đoạn văn thú vị tại Tháp Gió. Đọc kỹ từng câu rồi trả lời cùng bò nhé!',
      'Ngồi nghỉ dưới bóng Tháp Gió, cùng Cowdi đọc đoạn văn ngắn và tìm chi tiết trả lời câu hỏi nha!',
      'Mimi đã đánh dấu các từ quan trọng trong bài đọc Tháp Gió. Con bấm xem nghĩa khi cần nhé!',
      'Gió lộng trên cánh đồng Tháp Gió không làm con phân tâm đâu. Đọc kỹ đoạn văn cùng bò nào!',
    ],
    VS: [
      'Bamboo viết một bài đọc ngắn bên rừng trúc Vườn Sữa. Con đọc chậm rồi trả lời câu hỏi cùng bò nhé!',
      'Ngồi giữa Vườn Sữa nghe đàn gà kêu, cùng Cowdi đọc đoạn văn và tìm đáp án thật chính xác nha!',
      'Các từ mới đều xuất hiện trong đoạn văn Vườn Sữa này đấy. Con đọc kỹ rồi chọn ý đúng nhé!',
      'Bamboo Spirit vừa mở trang sách giữa Vườn Sữa. Cùng bò đọc hiểu trọn vẹn đoạn văn hôm nay nha!',
    ],
  },

  'T-05': {
    BD: [
      'Khách trên Bến Đò Ông Tư đang nói tiếng Anh kìa! Con nghe câu thật kỹ rồi chọn nghĩa đúng nha!',
      'Tiếng sóng sông êm lắm, dễ nghe câu mẫu hơn nhiều. Con nghe xong chọn nghĩa tiếng Việt cùng bò nhé!',
      'Ông Tư nhờ con dịch giúp câu khách vừa nói trên bến gỗ. Nghe lại hoặc nghe chậm nếu cần nha!',
      'Lắng nghe từng câu bên chiếc đò sang Cù Lao rồi chọn đúng nghĩa với Cowdi nhé!',
    ],
    TG: [
      'Gió ở Tháp Gió mang theo câu tiếng Anh từ xa. Con lắng nghe thật kỹ rồi chọn nghĩa đúng nha!',
      'Mimi đang đọc mẫu câu trên cánh đồng Tháp Gió. Con nghe kỹ rồi bấm chọn nghĩa tiếng Việt nhé!',
      'Owlbert bảo có thể bấm nút nghe chậm bất cứ lúc nào ở Tháp Gió. Tập trung nghe cùng bò nha!',
      'Storm gửi mấy câu tiếng Anh qua làn gió Tháp Gió. Nghe rõ từng chữ rồi chọn nghĩa đúng nhé!',
    ],
    VS: [
      'Giữa Vườn Sữa yên tĩnh, lắng nghe câu mẫu rồi chọn nghĩa tiếng Việt thật chuẩn cùng bò nha!',
      'Cowdi sẽ đọc rõ từng câu ngay tại Vườn Sữa. Con nghe xong chọn đúng nghĩa bên dưới nhé!',
      'Bên rừng trúc của Bamboo vang lên câu tiếng Anh rất rõ. Nghe kỹ rồi chọn đáp án đúng nha!',
      'Đàn gà ở Vườn Sữa đang trật tự nghe cùng con đấy. Lắng nghe câu rồi chọn nghĩa chuẩn nhé!',
    ],
  },

  'T-06': {
    BD: [
      'Đứng trên bến gỗ Bến Đò Ông Tư, con nghe câu mẫu rồi đọc to theo cho vang khắp mặt sông nhé!',
      'Ông Tư thích nghe con luyện nói tiếng Anh lắm! Bấm mic rồi đọc rõ từng từ cùng bò nha!',
      'Khách qua sông Cù Lao đang mỉm cười nghe con nói kìa. Nghe mẫu trước rồi đọc to theo nhé!',
      'Nói to rõ ràng ở Bến Đò Ông Tư sẽ giúp sương sớm tan nhanh hơn đấy. Cùng Cowdi luyện nói nào!',
    ],
    TG: [
      'Nói to lên giữa cánh đồng Tháp Gió nào! Nghe câu mẫu rồi bấm mic đọc thật rõ cùng bò nhé!',
      'Owlbert đang lắng nghe giọng phát âm của con ở Tháp Gió. Cứ tự tin đọc rõ từng âm nha!',
      'Mimi cổ vũ con nói thật tự nhiên dưới làn gió Tháp Gió. Nghe chậm trước nếu muốn nhé!',
      'Giọng con đọc chuẩn sẽ vang xa cùng cánh quạt Tháp Gió. Bắt đầu luyện nói với Cowdi nào!',
    ],
    VS: [
      'Ở Vườn Sữa, đàn gà và Bamboo rất thích nghe con đọc tiếng Anh! Bấm mic nói theo cùng bò nhé!',
      'Cowdi đọc mẫu một câu giữa Vườn Sữa, con đọc lại thật rõ ràng từng chữ nha!',
      'Rừng trúc Vườn Sữa vang giọng đọc của con sẽ vui lắm đấy. Tự tin nói theo câu mẫu nhé!',
      'Bamboo Spirit đang vỗ tay chờ con luyện nói tại Vườn Sữa. Nghe kỹ rồi bật mic nha!',
    ],
  },

  'T-07': {
    BD: [
      'Sương dày đang tụ lại ở Bến Đò Ông Tư! Trả lời các câu hỏi tổng hợp để giúp đò cập bến nhé!',
      'Chặng cuối tại Bến Đò Ông Tư tới rồi! Cùng bò vượt qua bài tổng hợp để giải sương trên sông nha!',
      'Ông Tư đã sẵn sàng nhổ neo sang Cù Lao. Con làm thật chắc các câu tổng hợp cùng Cowdi nhé!',
      'Vượt qua loạt câu hỏi cuối ở Bến Đò Ông Tư là sương sớm tan ngay. Bình tĩnh chọn đáp án đúng nha!',
    ],
    TG: [
      'Mây sương đang chắn cánh quạt Tháp Gió! Cùng bò giải hết loạt câu tổng hợp để đón gió về nhé!',
      'Owlbert và Mimi tin con sẽ vượt qua chặng cuối ở Tháp Gió. Đọc kỹ từng câu hỏi nha!',
      'Cánh đồng Tháp Gió sắp sáng bừng rồi! Làm thật chắc bài kiểm tra tổng hợp cùng Cowdi nhé!',
      'Storm đang giữ gió chờ con hoàn thành chặng cuối Tháp Gió. Chọn đáp án cẩn thận nha!',
    ],
    VS: [
      'Sương mù còn vương cuối Vườn Sữa kìa! Trả lời chuẩn các câu tổng hợp để vườn sáng lên nhé!',
      'Bamboo và đàn gà ở Vườn Sữa đang cổ vũ con ở chặng cuối! Bình tĩnh chọn từng đáp án đúng nha!',
      'Chặng tổng kết tại Vườn Sữa đã sẵn sàng. Cùng Cowdi hoàn thành thật tốt để qua ải nhé!',
      'Bamboo Spirit chúc con trả lời thật chuẩn loạt câu hỏi cuối ở Vườn Sữa. Cố lên nha!',
    ],
  },

  'T-08': {
    BD: [
      'Trên bến gỗ Bến Đò Ông Tư, con hãy ghép hoặc gõ lại câu tiếng Anh đúng theo nghĩa tiếng Việt nhé!',
      'Ông Tư cần viết vài câu chỉ đường cho khách qua sông. Con xếp câu thật chuẩn cùng bò nha!',
      'Mỗi câu viết đúng là một tấm ván chắc chắn ở Bến Đò Ông Tư. Cần xem lại thì mở Ngữ pháp nhé!',
      'Nhìn kỹ nghĩa tiếng Việt bên sông Cù Lao rồi xếp từng từ thành câu hoàn chỉnh cùng Cowdi nha!',
    ],
    TG: [
      'Gió Tháp Gió thổi xáo trộn thứ tự các từ mất rồi! Con xếp hoặc gõ lại thành câu đúng nhé!',
      'Owlbert mang mấy câu tiếng Việt trên Tháp Gió nhờ con viết sang tiếng Anh. Thử sức cùng bò nha!',
      'Mimi đã chuẩn bị sẵn mẹo ngữ pháp nếu con cần ở Tháp Gió. Xếp từng từ thật cẩn thận nhé!',
      'Viết chuẩn từng câu dưới chân Tháp Gió để cánh quạt quay nhanh hơn nha! Bắt đầu với Cowdi thôi!',
    ],
    VS: [
      'Bên rừng trúc Vườn Sữa, con hãy xếp hoặc gõ lại câu tiếng Anh khớp với nghĩa tiếng Việt nhé!',
      'Bamboo vừa ghi vài câu chuyện nhỏ ở Vườn Sữa. Con chuyển sang câu tiếng Anh cùng bò nha!',
      'Đừng vội nhé, ở Vườn Sữa con luôn mở được bảng Ngữ pháp để kiểm tra trước khi ghép câu đấy!',
      'Cowdi cùng con luyện viết mấy câu quen thuộc ngay tại Vườn Sữa. Làm từng câu thật chắc nha!',
    ],
  },

  'F-01': {
    BD: [
      'Chiếc đò của ông Tư lướt nhẹ qua sương sớm, từng tấm thẻ từ hiện ra trước mắt con nè!',
      'Ngồi êm trên bến gỗ Bến Đò Ông Tư xem trình chiếu từ mới nhé! Chạm thẻ để dừng bất cứ lúc nào!',
      'Sông Cù Lao trôi chậm rãi như nhịp trình chiếu từ mới. Nghe kỹ từ và ví dụ cùng bò nha!',
      'Ông Tư bật đèn bến đò chiếu rõ từng từ mới. Con giữ nút loa nếu muốn nghe đọc chậm nhé!',
    ],
    TG: [
      'Gió Tháp Gió đưa từng thẻ từ bay qua thật êm! Con xem và nghe trình chiếu cùng bò nha!',
      'Owlbert mở màn trình chiếu từ mới ngay dưới chân Tháp Gió. Chạm thẻ bất cứ lúc nào để dừng nhé!',
      'Mimi chỉnh tốc độ đọc vừa vặn cho con ở Tháp Gió. Ngắm hình và nghe ví dụ cùng Cowdi nha!',
      'Từng thẻ từ hiện ra theo nhịp cánh quạt Tháp Gió. Nhìn 4 chấm kỹ năng dưới thẻ cùng bò nhé!',
    ],
    VS: [
      'Ánh nắng Vườn Sữa chiếu lên từng thẻ từ mới kìa! Con ngồi nghe trình chiếu thật thoải mái nhé!',
      'Cowdi tự tay trình chiếu từng từ mới giữa Vườn Sữa. Chạm thẻ để dừng hoặc giữ loa nghe chậm nha!',
      'Rừng trúc của Bamboo yên tĩnh lắm, rất hợp xem trình chiếu từ mới. Nghe kỹ cả câu ví dụ nhé!',
      'Đàn gà ở Vườn Sữa xếp hàng xem thẻ từ cùng con đấy. Thả lỏng và lắng nghe với bò nha!',
    ],
  },

  'F-03': {
    BD: [
      'Gió sông mang lời chào của Ông Tư vang lên kìa! Nghe kỹ rồi chọn đúng từ nha!',
      'Từ vựng đang hiện trên mặt sông Bến Đò Ông Tư! Nghe âm rồi chọn đúng từ giúp bò nhé!',
      'Sương sớm làm mấy chữ trên bến gỗ mờ đi rồi! Con lắng nghe rồi nhận diện đúng cùng Cowdi nha!',
      'Khách qua sông Cù Lao gọi tên từng từ kìa! Nghe kỹ rồi chọn đúng từ tiếng Anh nhé!',
    ],
    TG: [
      'Gió lộng ở Tháp Gió mang theo âm thanh từng từ! Nghe kỹ rồi chọn đúng giúp bò nha!',
      'Mimi đọc vang từng từ từ đỉnh Tháp Gió. Con nghe phát âm rồi chọn đúng đáp án nhé!',
      'Owlbert đọc to từng từ giữa Tháp Gió. Chọn đúng liền 3 câu để tạo combo cùng Cowdi nha!',
      'Storm khuấy gió làm chữ bay lên cao kìa! Nghe rõ rồi giúp bò chọn đúng từ nhé!',
    ],
    VS: [
      'Đàn gà ở Vườn Sữa kêu tên từng bạn. Nghe kỹ rồi chọn đúng từ nha!',
      'Âm thanh từ vựng đang vang nhẹ trên Vườn Sữa! Con lắng nghe rồi chọn đúng giúp Cowdi nha!',
      'Bamboo đọc từng từ mới bên rừng trúc Vườn Sữa. Nghe kỹ rồi nhận diện thật chuẩn nhé!',
      'Giữa Vườn Sữa rộn ràng, con giữ nút loa nếu cần nghe chậm rồi chọn đúng từ tiếng Anh nha!',
    ],
  },

  'F-06': {
    BD: [
      'Boss Sương Bến Đò Ông Tư đang chắn ngang mặt sông! Trả lời đúng để đẩy lùi sương giúp đò qua nhé!',
      'Đám sương dày nhất ở Bến Đò Ông Tư xuất hiện rồi! Con cùng pet tấn công giải sương nha!',
      'Ông Tư đang cầm sào đợi phía sau! Trả lời chuẩn từng câu để Boss Sương tan biến trên sông nhé!',
      'Đừng ngại Boss Sương ở Bến Đò Ông Tư nha! Trả lời đúng 3 câu liền là pet tung kỹ năng ngay!',
    ],
    TG: [
      'Boss Sương Tháp Gió đang cản cánh quạt quay! Cùng pet trả lời đúng để thổi bay đám sương nhé!',
      'Mimi và Owlbert đứng cổ vũ bên dưới Tháp Gió. Đánh trúng câu hỏi để Boss Sương lùi bước nha!',
      'Gió Tháp Gió đang dồn sức cho pet của con! Trả lời thật chắc để giải sạch sương mù nhé!',
      'Storm gọi gió hỗ trợ rồi! Đúng liên tiếp 3 câu để kích kỹ năng pet đẩy lùi Boss Sương Tháp Gió nha!',
    ],
    VS: [
      'Boss Sương Vườn Sữa đang che mất nắng trên cù lao! Cùng Cowdi trả lời đúng để giải sương nhé!',
      'Bamboo và đàn gà đang chờ Vườn Sữa sáng lại! Mỗi câu đúng của con làm Boss Sương yếu hẳn đi nha!',
      'Trận giải sương cuối cùng tại Vườn Sữa bắt đầu! Bình tĩnh chọn đáp án đúng cùng pet nhé!',
      'Bamboo Spirit cổ vũ con trước Boss Sương Vườn Sữa. Trọn điểm là Boss tan biến hoàn toàn luôn nha!',
    ],
  },

  'F-08': {
    BD: [
      'Trên bãi cỏ gần Bến Đò Ông Tư có 12 thẻ từ đang úp. Lật tìm đúng 6 cặp nghĩa cùng bò nha!',
      'Sương sớm che mất mặt thẻ bên bờ sông rồi. Con lật từng cặp tiếng Anh và nghĩa giúp ông Tư nhé!',
      'Nhớ vị trí từng thẻ trên bờ cỏ Bến Đò Ông Tư sẽ ghép đúng ngay lần đầu đấy. Thử cùng Cowdi nha!',
      'Đợi đò cập bến Cù Lao, mình chơi lật cặp thẻ từ trên đồng cỏ cho thật thuộc bài nhé!',
    ],
    TG: [
      'Cánh đồng dưới chân Tháp Gió giấu 6 cặp thẻ từ! Lật lên nghe âm rồi ghép đúng cặp cùng bò nha!',
      'Mimi úp 12 tấm thẻ giữa cỏ xanh Tháp Gió. Con nhớ vị trí thật khéo để ghép chuẩn từng cặp nhé!',
      'Owlbert sẽ gợi ý nếu con lật hụt hai lần liên tiếp ở Tháp Gió. Cứ thoải mái chơi cùng Cowdi nha!',
      'Gió Tháp Gió khẽ rung những thẻ cỏ. Lật đúng 6 cặp từ và nghĩa để mở đường tiếp theo nhé!',
    ],
    VS: [
      'Bãi cỏ Vườn Sữa hôm nay có 6 cặp thẻ ẩn mình kìa! Chạm lật từng thẻ để ghép đúng cặp nhé!',
      'Đàn gà ở Vườn Sữa làm úp mấy tấm thẻ từ mất rồi. Con lật ghép lại từng cặp giúp Cowdi nha!',
      'Bên rừng trúc của Bamboo, mỗi thẻ tiếng Anh lật lên sẽ tự đọc to. Ghép đủ 6 cặp thật vui nhé!',
      'Vườn Sữa xanh mướt có 12 ô cỏ bí mật. Con lật khéo léo để nối đúng từ với nghĩa nha!',
    ],
  },

  'F-09': {
    BD: [
      'Chiếc đò của ông Tư đang đợi chữ lên khoang! Chạm từng từ đúng thứ tự để đò chở câu qua sông nha!',
      'Bến gỗ Bến Đò Ông Tư có vài từ nhiễu lạc vào đó. Chọn đúng từ xếp lên đò cùng bò nhé!',
      'Mỗi câu xếp chuẩn là đò của ông Tư lướt êm sang Cù Lao. Mở Ngữ pháp xem mẹo khi cần nha!',
      'Xếp đủ các từ tiếng Anh lên chiếc đò Bến Đò Ông Tư rồi nghe cả câu vang trên sông nhé!',
    ],
    TG: [
      'Chiếc đò nhỏ gần cánh đồng Tháp Gió chờ con xếp từ thành câu đúng! Chạm từng thẻ trên bến nha!',
      'Gió Tháp Gió mang thêm hai từ nhiễu lên bến đấy. Chọn thật chuẩn từng từ xếp lên đò cùng bò nhé!',
      'Owlbert đã để sẵn mẹo ngữ pháp nếu con xếp nhầm vị trí. Thử ghép câu lên đò thật gọn nha!',
      'Xếp chuẩn từng từ trên bến Tháp Gió để đò chở trọn câu tiếng Anh sang bờ bên kia nhé!',
    ],
    VS: [
      'Bến nước bên Vườn Sữa có chiếc đò chở câu đang đợi! Xếp đúng thứ tự từ cho đò chạy cùng bò nha!',
      'Bamboo xếp sẵn các thẻ từ trên bến Vườn Sữa cùng hai từ nhiễu. Con chọn đúng từ đưa lên đò nhé!',
      'Đàn gà ở Vườn Sữa đứng xem đò chở câu qua sông kìa! Xếp đủ câu đúng là đò lướt đi ngay nha!',
      'Cowdi cổ vũ con ghép từng câu tiếng Anh lên đò tại Vườn Sữa. Xem nút Ngữ pháp bất cứ khi nào cần nhé!',
    ],
  },
};

export function buildP3SeedIntros() {
  const rows = [];
  for (const code of P3_INTRO_CODES) {
    const codeKey = code.replace('-', '');
    for (const region of P3_INTRO_REGIONS) {
      const list = RAW_INTROS[code]?.[region] || [];
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

export const P3_SEED_INTROS = buildP3SeedIntros();
