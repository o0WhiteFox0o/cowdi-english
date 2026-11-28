// shared/story-season2.js — Kịch bản dẫn nhập Mùa 2 "Trò chuyện", unit int-u1..int-u3.
// Nguồn: Story Bible v1.0 (mục 3.2 Sương Câm, 4.3 cung C1→C5, 5.1–5.5, 6.2, 6.4, 7.2, 8).
// Bản đọc cho người: KICH-BAN-DAN-NHAP-MUA2-U1-U3-v1.0.md. Sonny duyệt trước khi bật.
//
// LUẬT HÌNH PET (Sonny chốt 28/11/2026):
//  - Pet đồng hành của người học: hiện đúng cấp hiện tại của pet đó.
//  - Pet KHÁC dẫn truyện (narrator): chỉ dùng hình cấp C4 (Super) hoặc C5 (Legendary). Mặc định C4.
//  - Boss: luôn là pet cấp C5 (Legendary) gắn với cốt truyện vùng, phủ lớp Sương Câm; giải sương thì hiện màu thật.
//  - Nếu boss trùng loài với pet đồng hành của người học → dùng `boss.alt`.
//
// Mọi câu: vi ≤ 25 chữ; en ≤ 8 từ, trình độ A2, ưu tiên dùng từ của bài (Story Bible 8.3: cấp 2 = tiếng Anh A2 có phụ đề Việt).
// `{pet}` = tên pet đồng hành của người học.

// Cấp tính theo C1..C5. Trong src/data/pets.js: evolutions[i].stage = C - 1
// (C4 Super = stage 3 = evolutions[3], C5 Legendary = stage 4 = evolutions[4]).
export const NARRATOR_STAGE = 4; // C4 Super
export const BOSS_STAGE = 5;     // C5 Legendary
export const evolutionIndex = (cLevel) => Math.min(4, Math.max(0, cLevel - 1));

export const SEASON2_UNITS = {
  'int-u1': {
    region: 'BD',
    episodeVi: 'Tập 1 · Chuyến đò đầu tiên',
    premiseVi: 'Thầy Tom vừa cập Bến Đò Ông Tư. Sương Câm phủ bến, ai cũng ngại mở lời chào người lạ.',
    seasonThreadVi: 'Minh lần đầu dám chào thầy Tom bằng tiếng Anh.',
    arrival: { by: 'ong_tu', vi: 'Sương phủ kín bến rồi. Thầy Tom mới tới mà chưa ai dám chào.', en: 'Hello! Welcome to the river.' },
    landmarks: ['Bến gỗ', 'Ghế khách trên đò', 'Cờ hiệu mũi đò', 'Cọc đếm khách'],
    boss: {
      pet: 'flippy', stage: BOSS_STAGE, alt: 'pingu',
      lieVi: 'Hỏi lại là xấu hổ.',
      hushVi: 'Flippy ngược sông lên đón thầy Tom. Sương làm Flippy ngại hỏi lại, nên ai nói gì cũng gật đầu cho qua dù không hiểu.',
      lines: {
        enter: { vi: 'Flippy gật gù trong sương: "Yes… yes… yes…" mà mắt thì ngơ ngác.', en: 'Yes… yes… yes…' },
        hit: [
          { vi: 'Đúng rồi! Sương quanh Flippy mỏng đi một chút.' },
          { vi: 'Flippy ngẩng lên nghe con nói kìa!' },
          { vi: 'Con nói rõ quá, Flippy thôi gật bừa rồi!' },
        ],
        wrong: [
          { vi: 'Flippy lại gật cho qua. Không sao, mình nói lại nha!' },
          { vi: 'Sương dày thêm chút xíu. Sai cũng được, thử tiếp nào!' },
        ],
        retreat: { vi: 'Flippy lùi xuống sông, sương quanh bến tan thêm một khúc.' },
        freed: { vi: 'Flippy cười toe: hỏi lại không xấu hổ chút nào!', en: 'Could you say that again?' },
        fail: { vi: 'Flippy vẫn gật gù trong sương. Ôn lại rồi mình quay lại nha!' },
      },
      clueVi: 'Sương rút về phía tây, nơi Rừng Tràm. Xa xa có tiếng hú rất khẽ, rồi tắt.',
    },
    epilogue: { by: 'ong_tu', vi: 'Ông học được chữ "Hello" từ con đó. Học từ cháu cũng là học!', en: 'Thank you! See you later!' },
  },

  'int-u2': {
    region: 'TG',
    episodeVi: 'Tập 2 · Lá thư không tới',
    premiseVi: 'Tháp Gió là nơi gửi thư của cù lao. Thư lớp thầy Tom kẹt trên đỉnh tháp vì ai viết sai một chữ cũng bị gạch đỏ.',
    seasonThreadVi: 'Minh gửi được lá thư tiếng Anh đầu tiên dù còn lỗi.',
    arrival: { by: 'storm', vi: 'Gió vẫn thổi mà thư không bay được. Sương kẹt trên đỉnh tháp rồi!', en: "Let's do it together." },
    landmarks: ['Hòm thư lớp học', 'Chong chóng đo gió', 'Bảng tin nghề nghiệp', 'Sân tập dưới chân tháp'],
    boss: {
      pet: 'owlbert', stage: BOSS_STAGE, alt: 'mimi',
      lieVi: 'Đúng luật là đủ.',
      hushVi: 'Owlbert là thủ thư Tháp Gió. Sương làm Owlbert gạch đỏ mọi chữ sai, nên không ai dám viết thư nữa và tháp im lặng.',
      lines: {
        enter: { vi: 'Owlbert cầm bút đỏ, lẩm bẩm: "Sai… sai… sai…" Cả tháp im phăng phắc.', en: 'Wrong… wrong… wrong…' },
        hit: [
          { vi: 'Đúng ý rồi! Mắt Owlbert sáng lên một chút.' },
          { vi: 'Owlbert dừng bút, đọc lại câu của con kìa.' },
          { vi: 'Một lá thư vừa bay khỏi tháp!' },
        ],
        wrong: [
          { vi: 'Owlbert gạch một nét. Không sao, mình viết tiếp nha!' },
          { vi: 'Sai một chút thôi, ý của con vẫn rõ mà. Thử lại nào!' },
        ],
        retreat: { vi: 'Owlbert bay vào thư viện, ôm theo một lá thư chưa gạch.' },
        freed: { vi: 'Owlbert gác bút đỏ: hỏi ý người viết trước, rồi mới sửa.', en: 'What do you mean?' },
        fail: { vi: 'Sương còn quanh đỉnh tháp. Ôn lại rồi mình leo lên tiếp nha!' },
      },
      clueVi: 'Trong chồng thư có một lá không tên, nét chữ như vết cào trên thân tràm.',
    },
    epilogue: { by: 'storm', vi: 'Thư bay hết rồi! Lần sau mình cùng đi đưa thư nha.', en: "Let's do it together!" },
  },

  'int-u3': {
    region: 'VS',
    episodeVi: 'Tập 3 · Rừng trúc không lên tiếng',
    premiseVi: 'Sương Câm lấy mất tiếng của Linh Trúc, linh hồn rừng trúc sau Vườn Sữa. Bamboo nói liên tục để khỏi nghe sự im lặng.',
    seasonThreadVi: 'Minh mời Lan về nhà mới và nói tiếng Anh cả buổi.',
    arrival: { by: 'bamboo', vi: 'Rừng trúc im quá, mình phải nói liên tục cho đỡ sợ!', en: 'How do you feel?' },
    homecoming: { by: 'cowdi', vi: 'Về nhà rồi! Mà sao Vườn Sữa im ắng vậy ta?', en: 'Tell me more!' },
    landmarks: ['Dây phơi đồ', 'Ngôi nhà mái đỏ', 'Lối vào rừng trúc', 'Sân hội cuối tuần'],
    boss: {
      pet: 'bamboo_spirit', stage: BOSS_STAGE, alt: 'bamboo',
      lieVi: 'Rừng cần im lặng mới bình yên.',
      hushVi: 'Linh Trúc tin rằng rừng phải im mới yên. Sương lấy mất tiếng của Linh Trúc, cả rừng không ai gọi nhau nữa.',
      lines: {
        enter: { vi: 'Linh Trúc mở miệng mà không ra tiếng. Lá trúc đứng im.', en: '…' },
        hit: [
          { vi: 'Con nói rồi! Một cây trúc rung lá đáp lại.' },
          { vi: 'Nghe kìa, có tiếng lá rì rào!' },
          { vi: 'Linh Trúc quay về phía tiếng của con.' },
        ],
        wrong: [
          { vi: 'Lá trúc còn im. Nói tiếp nha, sai cũng được!' },
          { vi: 'Không sao đâu. Tiếng nhỏ cũng là tiếng mà!' },
        ],
        retreat: { vi: 'Linh Trúc lùi vào rừng, nhưng lá trúc đã bắt đầu rì rào.' },
        freed: { vi: 'Linh Trúc cất tiếng: rừng sống nhờ tiếng gọi nhau.', en: 'Can you hear me?' },
        fail: { vi: 'Rừng vẫn còn im. Ôn lại rồi mình quay lại gọi nha!' },
      },
      clueVi: 'Sương rút về phía Rừng Tràm. Lần này tiếng hú gần hơn, rồi lại tắt.',
    },
    epilogue: { by: 'bamboo', vi: 'Mình im một chút… và nghe thấy cả rừng. Cảm ơn con!', en: 'How do you feel now?' },
  },
};

// slots: intro (Màn 1) · listen · read · write · speak · boss. Mỗi bài một câu dẫn riêng cho mỗi slot.
export const SEASON2_LESSONS = {
  // ── int-u1 · Bến Đò Ông Tư ──────────────────────────────────────────────
  greetings: {
    unit: 'int-u1', npc: 'ong_tu', landmark: 0,
    sceneVi: 'Thầy Tom lên bờ. Minh và Lan ngại chào. Sáng mai là ngày đầu lớp thầy Tom (đoạn đọc).',
    introVi: 'Thầy Tom vừa cập bến mà sương nuốt hết lời chào. Con giúp Minh, Lan chào thầy cho đúng nha!',
    introEn: 'Good morning! Nice to meet you.',
    slots: {
      intro:  { vi: 'Lời chào rơi xuống sông hết rồi. Mình gặp lại từng lời chào nha!', en: 'Hello! Hi! Good morning!' },
      listen: { vi: 'Khách trên bến nói gì đó mà sương che mất. Con nghe giùm ông nha!', en: 'Nice to meet you!' },
      read:   { vi: 'Sương xoá chữ trên tấm bảng chào khách. Đọc kỹ rồi tìm lại nha!', en: 'Welcome! Please sit here.' },
      write:  { vi: 'Bảng gỗ ở bến mất chữ rồi. Con viết lại lời chào giùm ông nha!', en: 'Good morning, Mr. Tom!' },
      speak:  { vi: 'Đò sắp chạy rồi! Con chào thầy Tom thật to nha!', en: "Hello! I'm Minh." },
      boss:   { vi: 'Có ai đứng gật gù mãi trong sương kìa. Mình lại gần hỏi thử nha!', en: 'Excuse me, are you okay?' },
    },
    afterVi: 'Bến gỗ sáng lên! Thầy Tom chào lại cả lớp.',
  },
  family: {
    unit: 'int-u1', npc: 'lan', landmark: 1,
    sceneVi: 'Trên đò, Lan cho Minh xem ảnh gia đình (đoạn đọc). Sương làm mờ tấm ảnh.',
    introVi: 'Trên đò, Lan cho Minh xem ảnh gia đình. Sương làm mờ tấm ảnh rồi, con giúp hai bạn giới thiệu nha!',
    introEn: 'This is my mother.',
    slots: {
      intro:  { vi: 'Ai trong tấm ảnh vậy ta? Mình gặp từng người thân nha!', en: 'Father, mother, brother, sister.' },
      listen: { vi: 'Lan kể về gia đình mà gió sông thổi lạc chữ. Nghe kỹ nha!', en: 'This is my father.' },
      read:   { vi: 'Mặt sau tấm ảnh ghi tên mọi người, mà sương che rồi. Đọc thử nha!', en: 'My grandfather and grandmother.' },
      write:  { vi: 'Lan muốn viết lời giới thiệu gia đình gửi thầy Tom. Ghép giúp bạn nha!', en: 'I have one brother.' },
      speak:  { vi: 'Ông Tư hỏi: "Ai đây con?" Con trả lời giùm Lan nha!', en: 'She is my mother.' },
      boss:   { vi: 'Sương lại kéo về phía mũi đò. Có ai đang đứng im ở đó…', en: 'Who is that?' },
    },
    afterVi: 'Ghế khách trên đò sáng lên! Ông Tư nhớ tên cả nhà Lan rồi.',
  },
  colors: {
    unit: 'int-u1', npc: 'lan', landmark: 2,
    sceneVi: 'Đò chở gánh áo đi chợ; Lan chọn áo (đoạn đọc). Cờ hiệu mũi đò mất màu.',
    introVi: 'Cờ hiệu trên đò mất hết màu trong sương. Con giúp Lan gọi lại tên từng màu nha!',
    introEn: 'What color do you like?',
    slots: {
      intro:  { vi: 'Màu sắc trốn vào sương rồi. Mình gặp lại từng màu nha!', en: 'Red, blue, yellow, green.' },
      listen: { vi: 'Cô bán áo trên đò gọi tên màu, mà sương che mất. Nghe giùm Lan nha!', en: 'I like the blue shirt.' },
      read:   { vi: 'Tấm bảng giá áo bị phai chữ. Đọc kỹ tìm màu nha!', en: 'It is a pink T-shirt.' },
      write:  { vi: 'Lan muốn ghi màu áo cho bé Mai. Ghép chữ giúp Lan nha!', en: 'Mai loves pink and purple.' },
      speak:  { vi: 'Hỏi thầy Tom thích màu gì đi con!', en: 'What color do you like?' },
      boss:   { vi: 'Cờ vừa có màu thì sương xám lại cuộn tới…', en: 'Where are the colors?' },
    },
    afterVi: 'Cờ hiệu bay đủ màu rồi! Chiếc đò sáng rực giữa sông.',
  },
  numbers: {
    unit: 'int-u1', npc: 'ong_tu', landmark: 3,
    sceneVi: 'Ông Tư đếm khách và hàng; Minh đếm đồ trong cặp (đoạn đọc).',
    introVi: 'Khách lên đò đông quá mà sương làm ông đếm lộn. Con đếm giúp ông trước khi đò chạy nha!',
    introEn: 'How many people are there?',
    slots: {
      intro:  { vi: 'Mình gặp lại các con số nha, từ zero tới hundred!', en: 'One, two, three…' },
      listen: { vi: 'Khách nói số vé mà ông nghe không rõ. Con nghe giúp nha!', en: 'Two tickets, please.' },
      read:   { vi: 'Sổ đếm khách của ông bị sương thấm ướt. Đọc lại giúp ông nha!', en: 'There are twelve people.' },
      write:  { vi: 'Ông cần ghi số khách lên cọc gỗ. Con viết giúp ông nha!', en: 'Fifteen people on the boat.' },
      speak:  { vi: 'Bé Mai hỏi con mấy tuổi kìa. Trả lời bằng tiếng Anh nha!', en: 'I am … years old.' },
      boss:   { vi: 'Đủ khách rồi, nhưng giữa sông có ai cứ gật đầu mãi trong sương…', en: 'Hello? Are you okay?' },
    },
    afterVi: 'Cọc đếm khách sáng lên! Đò rời bến, sương mỏng dần.',
  },

  // ── int-u2 · Tháp Gió ───────────────────────────────────────────────────
  school: {
    unit: 'int-u2', npc: 'storm', landmark: 0,
    sceneVi: 'Thầy Tom gửi lịch kiểm tra qua Storm; thư bị sương xoá. Minh và Lan trước giờ kiểm tra (đoạn đọc).',
    introVi: 'Thầy Tom gửi lịch kiểm tra qua Storm, mà sương xoá hết chữ trong thư. Con giúp viết lại nha!',
    introEn: 'The exam is in the classroom.',
    slots: {
      intro:  { vi: 'Mình gặp lại đồ dùng ở trường nha: book, pencil, desk…', en: 'Book, pencil, notebook.' },
      listen: { vi: 'Thầy Tom đọc lịch học theo gió. Con nghe kỹ giúp Minh nha!', en: 'English is my favorite subject.' },
      read:   { vi: 'Lá thư của thầy bị sương phủ mấy chỗ. Đọc tìm chữ nha!', en: 'The library is next to the classroom.' },
      write:  { vi: 'Storm chờ thư mới để bay đi. Con ghép câu giúp thầy nha!', en: 'The pencil is on the desk.' },
      speak:  { vi: 'Lan tìm không ra cây bút chì. Con nói cho Lan biết nó ở đâu nha!', en: 'Your pencil is on the desk.' },
      boss:   { vi: 'Thư lên tới đỉnh tháp thì bị giữ lại. Có ai đang gạch đỏ từng chữ…', en: 'Who is in the tower?' },
    },
    afterVi: 'Hòm thư lớp học sáng lên! Storm bay đi đưa thư rồi.',
  },
  weather: {
    unit: 'int-u2', npc: 'mimi', landmark: 1,
    sceneVi: 'Mimi từ nơi rất xa tới, hỏi thời tiết ở cù lao; Minh và Lan lên kế hoạch cuối tuần (đoạn đọc).',
    introVi: 'Mimi từ nơi rất xa tới, chưa biết gọi thời tiết ở đây. Con kể Mimi nghe trời hôm nay nha!',
    introEn: "What's the weather like today?",
    slots: {
      intro:  { vi: 'Nắng, mưa, gió, mây… mình gặp từng kiểu trời nha!', en: 'Sunny, rainy, windy, cloudy.' },
      listen: { vi: 'Chong chóng trên tháp đang báo thời tiết. Nghe giùm Mimi nha!', en: 'It is sunny and warm.' },
      read:   { vi: 'Bảng dự báo của tháp mờ sương rồi. Đọc xem cuối tuần ra sao nha!', en: 'Sunday may be cloudy.' },
      write:  { vi: 'Mimi muốn ghi thời tiết vào sổ tay. Con ghép giúp nha!', en: 'It is windy today.' },
      speak:  { vi: 'Mimi hỏi con thích mùa nào nhất. Trả lời Mimi nha!', en: 'I like spring.' },
      boss:   { vi: 'Gió đổi hướng, kéo sương lên đỉnh tháp…', en: 'The fog is coming!' },
    },
    afterVi: 'Chong chóng quay tít! Mimi nhớ được cả bốn mùa rồi.',
  },
  jobs: {
    unit: 'int-u2', npc: 'khoa', landmark: 2,
    sceneVi: 'Bảng tin dưới chân tháp mất tên nghề; lớp Minh kể ước mơ nghề nghiệp (đoạn đọc).',
    introVi: 'Bảng tin dưới chân tháp mất hết tên nghề. Con cùng anh Khoa gắn lại cho đúng nha!',
    introEn: 'What does your father do?',
    slots: {
      intro:  { vi: 'Mình gặp các nghề quen nha: doctor, nurse, chef…', en: 'Doctor, nurse, farmer.' },
      listen: { vi: 'Storm đọc thư mời các cô chú làm nghề. Nghe kỹ nha!', en: 'He is an engineer.' },
      read:   { vi: 'Mấy tấm thẻ nghề bị sương phủ. Đọc tìm đúng nghề nha!', en: 'A farmer grows rice.' },
      write:  { vi: 'Anh Khoa viết thiệp cảm ơn cô y tá. Ghép giúp anh nha!', en: 'She is a nurse.' },
      speak:  { vi: 'Anh Khoa hỏi con muốn làm nghề gì. Trả lời anh nha!', en: 'I want to be a pilot.' },
      boss:   { vi: 'Tấm thiệp vừa viết xong đã bị gạch đỏ. Ai vậy ta?', en: 'Is it wrong?' },
    },
    afterVi: 'Bảng tin nghề sáng lên! Ai cũng tìm được thư của mình.',
  },
  body: {
    unit: 'int-u2', npc: 'lan', landmark: 3,
    sceneVi: 'Giờ thể dục của thầy Tom dưới chân tháp (đoạn đọc).',
    introVi: 'Gió lộng dưới chân tháp, thầy Tom cho cả lớp khởi động. Con giúp Lan làm đúng lời thầy nha!',
    introEn: 'Raise your arm, please.',
    slots: {
      intro:  { vi: 'Mình gặp các bộ phận cơ thể nha: head, arm, leg…', en: 'Head, eye, ear, nose.' },
      listen: { vi: 'Thầy Tom hô theo gió. Nghe đúng bộ phận nha!', en: 'Turn your head slowly.' },
      read:   { vi: 'Tấm hướng dẫn khởi động bị sương che. Đọc tìm chữ nha!', en: 'Stretch your legs.' },
      write:  { vi: 'Lan ghi lại bài khởi động. Con ghép giúp Lan nha!', en: 'Wash your hands.' },
      speak:  { vi: 'Minh bị đau chân rồi. Con nói giúp Minh với thầy nha!', en: 'My foot hurts.' },
      boss:   { vi: 'Khởi động xong rồi! Giờ mình leo lên đỉnh tháp nha!', en: "Let's go up the tower!" },
    },
    afterVi: 'Sân tập sáng lên! Cả lớp đứng chờ dưới chân tháp.',
  },

  // ── int-u3 · Vườn Sữa ───────────────────────────────────────────────────
  clothing: {
    unit: 'int-u3', npc: 'mai', landmark: 0,
    sceneVi: 'Mai giúp anh Minh soạn đồ đi Đà Lạt (đoạn đọc); dây phơi đồ ở Vườn Sữa mờ sương.',
    introVi: 'Mai soạn đồ cho anh Minh đi Đà Lạt, mà sương làm Mai quên tên quần áo. Con giúp Mai nha!',
    introEn: 'Bring a warm jacket.',
    slots: {
      intro:  { vi: 'Dây phơi đầy quần áo nè. Mình gặp tên từng món nha!', en: 'Shirt, jeans, socks, hat.' },
      listen: { vi: 'Anh Minh gọi ra vườn cần mang gì. Nghe giúp Mai nha!', en: 'Two pairs of socks, please.' },
      read:   { vi: 'Tờ danh sách đồ bị sương làm nhoè. Đọc lại giúp Mai nha!', en: 'Da Lat gets cold at night.' },
      write:  { vi: 'Mai muốn ghi tên đồ dán lên vali. Con ghép chữ giúp nha!', en: 'My shoes are by the door.' },
      speak:  { vi: 'Mai hỏi: "Anh đang mặc gì vậy?" Con trả lời giùm nha!', en: 'I am wearing a T-shirt.' },
      boss:   { vi: 'Gió từ rừng trúc thổi tới, lạnh và im lặng lạ thường…', en: 'Why is it so quiet?' },
    },
    afterVi: 'Dây phơi đồ sáng lên! Vali của anh Minh đã đủ đồ.',
  },
  house: {
    unit: 'int-u3', npc: 'minh', landmark: 1,
    sceneVi: 'Minh dẫn Lan xem nhà mới mái đỏ cạnh Vườn Sữa (đoạn đọc).',
    introVi: 'Nhà mới của Minh ở cạnh Vườn Sữa. Sương che tên các phòng, con dẫn Lan đi xem giùm Minh nha!',
    introEn: 'Welcome to our new house!',
    slots: {
      intro:  { vi: 'Mình gặp tên các phòng và đồ đạc nha!', en: 'Kitchen, bedroom, living room.' },
      listen: { vi: 'Minh nói phòng nào ở đâu, mà sương che mất. Nghe kỹ nha!', en: 'The kitchen is next to the living room.' },
      read:   { vi: 'Bản vẽ ngôi nhà bị sương phủ. Đọc tìm đúng phòng nha!', en: 'There is a big sofa.' },
      write:  { vi: 'Minh viết thiệp mời Lan tới chơi. Ghép câu giúp Minh nha!', en: 'There are six chairs.' },
      speak:  { vi: 'Lan hỏi phòng ngủ ở đâu. Con chỉ đường cho Lan nha!', en: 'Walk up the stairs.' },
      boss:   { vi: 'Nhìn qua cửa sổ, rừng trúc đứng im phăng phắc. Không một tiếng lá…', en: 'Listen… nothing.' },
    },
    afterVi: 'Ngôi nhà mái đỏ sáng đèn! Lan thích khu vườn nhỏ lắm.',
  },
  emotions: {
    unit: 'int-u3', npc: 'bamboo', landmark: 2,
    sceneVi: 'Lan hồi hộp trước buổi thuyết trình (đoạn đọc); Bamboo nói liên tục vì sợ rừng im.',
    introVi: 'Bamboo nói liên tục vì sợ rừng im. Con giúp Bamboo gọi đúng tên từng cảm xúc nha!',
    introEn: 'How do you feel?',
    slots: {
      intro:  { vi: 'Vui, buồn, lo, tự hào… mình gặp từng cảm xúc nha!', en: 'Happy, sad, nervous, proud.' },
      listen: { vi: 'Lá trúc rì rào kể tâm trạng các bạn. Nghe giùm Bamboo nha!', en: 'I feel nervous.' },
      read:   { vi: 'Lan viết nhật ký trước buổi thuyết trình, sương che mất chữ. Đọc giúp nha!', en: 'I am grateful for your support.' },
      write:  { vi: 'Bamboo muốn viết lời động viên cho Lan. Ghép giúp nha!', en: 'Stay calm and be confident.' },
      speak:  { vi: 'Bamboo hỏi hôm nay con thấy sao. Kể Bamboo nghe nha!', en: 'I feel happy today.' },
      boss:   { vi: 'Suỵt… Bamboo vừa im lặng, và nghe thấy một tiếng gọi rất nhỏ…', en: 'Did you hear that?' },
    },
    afterVi: 'Lối vào rừng trúc sáng lên! Bamboo học được cách lắng nghe.',
  },
  hobbies: {
    unit: 'int-u3', npc: 'cowdi', landmark: 3,
    sceneVi: 'Vườn Sữa mở hội sở thích cuối tuần; Lan và Minh kể sở thích (đoạn đọc).',
    introVi: 'Cuối tuần, Vườn Sữa mở hội sở thích. Kể Cowdi nghe con thích làm gì nha!',
    introEn: 'Tell me more!',
    slots: {
      intro:  { vi: 'Vẽ, bơi, nấu ăn… mình gặp các sở thích nha!', en: 'Reading, cooking, swimming.' },
      listen: { vi: 'Các bạn ở hội kể sở thích. Nghe kỹ giúp Cowdi nha!', en: 'I enjoy playing chess.' },
      read:   { vi: 'Tờ đăng ký câu lạc bộ bị sương nhoè. Đọc giúp nha!', en: 'Lan loves reading and drawing.' },
      write:  { vi: 'Cowdi muốn ghi sở thích của con vào sổ. Ghép giúp nha!', en: 'I am good at swimming.' },
      speak:  { vi: 'Cowdi hỏi cuối tuần con hay làm gì. Kể nghe đi!', en: 'I go cycling on Sunday.' },
      boss:   { vi: 'Cả vườn đã lên tiếng rồi. Giờ tới lượt rừng trúc…', en: "Let's go into the forest." },
    },
    afterVi: 'Sân hội sáng lên! Đàn gà cũng ríu rít theo.',
  },
};

// ── Hàm dùng chung ─────────────────────────────────────────────────────────

// Cấp hình hiển thị cho một nhân vật pet trong cảnh dẫn truyện.
// companionId: loài pet đồng hành; companionC: cấp hiện tại theo C1..C5 (= pet.stage + 1). Trả về C-level.
export function narratorStage(petId, companionId, companionC) {
  if (petId === companionId) return companionC; // pet của người học: đúng cấp hiện tại
  return NARRATOR_STAGE;                        // pet khác: C4 trở lên, không bao giờ thấp hơn
}

// Boss của unit, đổi sang `alt` nếu trùng loài với pet đồng hành.
export function unitBoss(unitId, companionId) {
  const b = SEASON2_UNITS[unitId]?.boss;
  if (!b) return null;
  return { ...b, pet: b.pet === companionId ? b.alt : b.pet, stage: BOSS_STAGE };
}

// Câu dẫn của một màn trong bài: ưu tiên kịch bản bài → (gọi nơi khác) kho screen_intro theo mã × vùng.
export function lessonSlotIntro(lessonId, slot) {
  return SEASON2_LESSONS[lessonId]?.slots?.[slot] || null;
}

// Mức sương quanh boss trong unit: 1 = dày nhất. Mỗi bài qua làm mỏng 1/4; qua kiểm tra unit = giải sương (0).
export function bossFogLevel(unitId, passedLessonIds = [], checkpointPassed = false) {
  if (checkpointPassed) return 0;
  const ids = Object.entries(SEASON2_LESSONS).filter(([, l]) => l.unit === unitId).map(([id]) => id);
  if (!ids.length) return 1;
  const done = ids.filter((id) => passedLessonIds.includes(id)).length;
  return Math.max(0.15, 1 - done / ids.length);
}
