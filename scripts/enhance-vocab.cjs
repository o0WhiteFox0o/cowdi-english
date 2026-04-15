/**
 * Script sinh dữ liệu bổ sung cho từ vựng:
 * - memoryTip: Mẹo ghi nhớ (liên tưởng, gợi nhớ)
 * - context: Ngữ cảnh sử dụng thực tế
 * - related: Từ liên quan (đồng nghĩa, trái nghĩa, cùng họ từ)
 */

// Memory tips database - gợi nhớ cho từ phổ biến
const MEMORY_TIPS = {
  // Body parts
  'Head': 'Tưởng tượng chiếc head-phone (tai nghe) đặt trên đầu bạn',
  'Face': 'Facebook = Face (khuôn mặt) + Book → sách ảnh khuôn mặt',
  'Eye': 'Chữ "eye" đọc giống "ai" → AI có mắt nhìn thấy mọi thứ',
  'Ear': 'Ear → Earphone (tai nghe) → dùng cho tai',
  'Nose': 'Nose đọc gần giống "nâu" → mũi chó nâu rất thính',
  'Mouth': 'Mouse (chuột) + th → miệng chuột nhỏ xíu',
  'Tooth': 'Toothbrush = Tooth (răng) + Brush (chải) → bàn chải răng',
  'Tongue': 'Tongue → Tung (lưỡi tung thức ăn)',
  'Lip': 'Lipstick = Lip (môi) + Stick → thỏi son môi',
  'Cheek': 'Cheek gần giống "cheeky" → em bé má phúng phính hay cheeky (nghịch ngợm)',
  'Chin': 'Chin có 4 chữ → cằm ở dưới cùng giống hàng cuối',
  'Forehead': 'Fore (trước) + Head (đầu) → phần trước của đầu = trán',
  'Eyebrow': 'Eye (mắt) + Brow → hàng lông phía trên mắt',
  'Eyelash': 'Eye (mắt) + Lash (sợi) → sợi lông mi',
  'Neck': 'Necklace = Neck (cổ) + Lace → dây chuyền đeo cổ',
  'Shoulder': 'Should + er → vai nên (should) mạnh mẽ',
  'Arm': 'Arm = Cánh tay, cũng có nghĩa "vũ khí" → tay là vũ khí',
  'Elbow': 'El + Bow (cung) → khuỷu tay cong như cung',
  'Wrist': 'Wristwatch = Wrist (cổ tay) + Watch → đồng hồ đeo cổ tay',
  'Hand': 'Handsome = Hand (tay) + Some → bàn tay đẹp',
  'Finger': 'Fingerprint = Finger (ngón tay) + Print → dấu vân tay',
  'Thumb': 'Thumbs up 👍 = giơ ngón cái',
  'Palm': 'Palm cũng có nghĩa "cây cọ" → lòng bàn tay phẳng như lá cọ',
  'Chest': 'Chessboard → chest ~ bàn cờ đặt trước ngực',
  'Back': 'Backpack = Back (lưng) + Pack → ba lô đeo trên lưng',
  'Stomach': 'Sto + mach → dạ dày "máy" tiêu hóa',
  'Waist': 'Waist gần giống "waste" → đừng lãng phí (waste) eo thon!',
  'Hip': 'Hip-hop → điệu nhảy lắc hông',
  'Leg': 'LEGO → xếp hình từ chân (leg) lên',
  'Knee': 'K im lặng → "knee" đọc là /niː/ giống "nee"',
  'Ankle': 'Ankle bracelet → vòng mắt cá chân',
  'Foot': 'Football = Foot (chân) + Ball → đá bóng bằng chân',
  'Toe': 'Toe nhỏ bé → ngón chân nhỏ xinh',
  'Skin': 'Skincare = Skin (da) + Care → chăm sóc da',
  'Bone': 'Bone → đọc gần giống "bôn" (chạy) → xương giúp chạy',
  'Muscle': 'Muscle → Mussel (con trai biển) → cơ bắp cứng như vỏ trai',
  'Blood': 'Blood bank → ngân hàng máu',
  'Heart': 'Heart ❤️ → biểu tượng trái tim quen thuộc',
  'Brain': 'Brainstorm = Brain (não) + Storm → bão não = suy nghĩ mạnh',
  'Lung': 'Lung → "lùng" → phổi lùng bắt oxy',

  // Appearance
  'Tall': 'Tall → "tôn" → người cao được tôn trọng',
  'Short': 'Short → quần short ngắn → ngắn/thấp',
  'Fat': '3 chữ ngắn → mập tròn',
  'Thin': 'Thin có chữ "i" mảnh khảnh → gầy',
  'Slim': 'Slim → S-line → đường cong mảnh mai',
  'Muscular': 'Muscle + ular → đầy cơ bắp',
  'Chubby': 'Chubby → "chả bi" → em bé tròn như viên chả',
  'Handsome': 'Hand + Some → bàn tay đẹp → đẹp trai',
  'Beautiful': 'Beauty + ful → đầy vẻ đẹp',
  'Pretty': 'Pretty → "pri-ti" → xinh đẹp',
  'Cute': 'Cute → "kiut" → dễ thương (từ rất phổ biến)',
  'Ugly': 'Ugly → "ugh" + ly → ugh! xấu',
  'Curly': 'Curly → curl (cuộn) → tóc xoăn cuộn',
  'Straight': 'Straight → thẳng (tóc thẳng)',
  'Bald': 'Ball + d → đầu tròn như quả bóng → hói',
  'Blonde': 'Blonde → tóc vàng (kiểu phương Tây)',
  'Freckle': 'Freckle → "free-kle" → tàn nhang tự do mọc',
  'Wrinkle': 'Wrinkle → "rinkle" → nếp nhăn',
  'Scar': 'Scar → "sca" → sẹo (scary = đáng sợ vì sẹo)',
  'Beard': 'Bear + d → gấu có râu',
  'Moustache': 'Mou (mouth) + stache → râu ở miệng',

  // Personality
  'Kind': 'Kindergarten = Kind (tử tế) + Garten → nơi nuôi dạy tử tế',
  'Honest': 'Honest → "ôn-nít" → trung thực',
  'Brave': 'Brave → "bờ-rây-vờ" → dũng cảm như hiệp sĩ',
  'Smart': 'Smartphone = Smart (thông minh) + Phone',
  'Lazy': 'Lazy → "lây-zi" → lười biếng, nằm dài',
  'Shy': 'Shy → "sai" → ngại nói sai → nhút nhát',
  'Generous': 'Gene + rous → gene hào phóng',
  'Patient': 'Patient cũng có nghĩa "bệnh nhân" → bệnh nhân phải kiên nhẫn',
  'Stubborn': 'Stub + born → sinh ra cứng đầu',
  'Selfish': 'Self + ish → chỉ nghĩ đến bản thân',
  'Humble': 'Humble → "hâm-bồ" → khiêm tốn',
  'Jealous': 'Jealous → "giê-lớt" → ghen tị',
  'Confident': 'Con + fident → con tin tưởng → tự tin',
  'Creative': 'Create + ive → sáng tạo',
  'Friendly': 'Friend + ly → thân thiện như bạn bè',
  'Cheerful': 'Cheer + ful → đầy niềm vui',
  'Serious': 'Serious → "si-ri-ớt" → nghiêm túc',
  'Talkative': 'Talk + ative → hay nói',
  'Quiet': 'Quiet → "quai-ớt" → im lặng',
  'Polite': 'Po + lite (nhẹ) → nhẹ nhàng → lịch sự',

  // Family
  'Father': 'Father → Fa → bố',
  'Mother': 'Mother → Mom → mẹ',
  'Parents': 'Parent → Pa + rent → bố mẹ',
  'Sibling': 'Sib + ling → anh chị em ruột',
  'Brother': 'Bro + ther → anh/em trai',
  'Sister': 'Sis + ter → chị/em gái',
  'Grandfather': 'Grand + Father → ông nội/ngoại',
  'Grandmother': 'Grand + Mother → bà nội/ngoại',
  'Uncle': 'Uncle Sam → chú Sam (biểu tượng Mỹ)',
  'Aunt': 'Aunt → "ăn" + t → dì/cô thường hay "ăn"',
  'Cousin': 'Cousin → "cờ-zin" → anh chị em họ',
  'Nephew': 'Ne + phew → phù, cháu trai nghịch quá',
  'Niece': 'Niece → "nít" → cháu gái nhỏ',
  'Husband': 'Hus + band → ban nhạc của nhà → chồng',
  'Wife': 'WiFi → Wi-Fe → vợ yêu',
  'Son': 'Son → "sun" (mặt trời) → con trai là mặt trời',
  'Daughter': 'Daughter → "đo-tơ" → con gái',
  'Baby': 'Baby → em bé (từ cực phổ biến)',
  'Twin': 'Twin → TWO + in → 2 trong 1 → sinh đôi',
  'Relative': 'Relate + ive → có liên quan → họ hàng',

  // Emotions
  'Happy': 'Happy → "hé-pi" → vui vẻ, biểu tượng 😊',
  'Sad': 'Sad → 3 chữ ngắn → buồn đến không nói nổi',
  'Angry': 'Angry Bird → chim giận dữ 🐦',
  'Scared': 'Scare + d → đáng sợ → sợ hãi',
  'Surprised': 'Sur + prised → quá bất ngờ!',
  'Excited': 'Excite + d → hào hứng, phấn khích',
  'Tired': 'Tire (lốp xe) + d → lốp xẹp = mệt mỏi',
  'Bored': 'Bore + d → buồn chán, board (tấm ván) → cứng nhắc',
  'Nervous': 'Nerve (dây thần kinh) + ous → căng thẳng thần kinh',
  'Proud': 'Proud → "prau-đ" → tự hào',
  'Lonely': 'Lone + ly → một mình → cô đơn',
  'Worried': 'Worry + ed → lo lắng',
  'Confused': 'Con + fuse (cầu chì) + d → cháy cầu chì → bối rối',
  'Embarrassed': 'Em + barr + assed → xấu hổ che mặt',
  'Disappointed': 'Dis (không) + appoint (bổ nhiệm) → không được bổ nhiệm → thất vọng',

  // Occupation  
  'Doctor': 'Doctor → "đốc-tơ" → bác sĩ (rất quen thuộc)',
  'Teacher': 'Teach + er → người dạy → giáo viên',
  'Engineer': 'Engine + er → người làm động cơ → kỹ sư',
  'Nurse': 'Nurse → "nớt" → y tá chăm sóc',
  'Lawyer': 'Law + yer → người của luật → luật sư',
  'Farmer': 'Farm + er → người ở nông trại → nông dân',
  'Chef': 'Chef → "sép" → đầu bếp (tiếng Pháp)',
  'Pilot': 'Pilot → "pai-lớt" → phi công lái máy bay',
  'Firefighter': 'Fire (lửa) + Fighter (chiến sĩ) → lính cứu hỏa',
  'Police': 'Police → "pô-lít" → cảnh sát',

  // Food
  'Rice': 'Rice → "rai-x" → cơm (thực phẩm châu Á)',
  'Bread': 'Bread → "brét" → bánh mì',
  'Noodle': 'Noodle → "nú-đồ" → mì/phở',
  'Egg': 'Egg → 3 chữ tròn như quả trứng',
  'Meat': 'Meat → Meet (gặp) → gặp miếng thịt ngon',
  'Chicken': 'Chicken → "chích-ken" → gà',
  'Beef': 'Beef → "bíp" → thịt bò',
  'Pork': 'Pork → "poóc" → thịt heo',
  'Fish': 'Fish → "phít" → cá',
  'Shrimp': 'Shrimp → "s-rim" → tôm nhỏ',
  'Vegetable': 'Vege + table → rau trên bàn ăn',
  'Fruit': 'Fruit → "phru-ớt" → trái cây',
  'Soup': 'Soup → "xúp" → súp/canh',
  'Salad': 'Salad → "xa-lát" → rau trộn',
  'Cake': 'Cake → "kây-kờ" → bánh ngọt 🎂',
  'Cookie': 'Cook + ie → nấu nhỏ → bánh quy',
  'Candy': 'Candy → "ken-đi" → kẹo ngọt 🍬',
  'Chocolate': 'Choco + late → sô-cô-la (quá quen)',
  'Sugar': 'Sugar → "su-gơ" → đường',
  'Salt': 'Salt → "xon" → muối',
  'Pepper': 'Pepper → "pé-pơ" → tiêu/ớt',
  'Sauce': 'Sauce → "xốt" → nước sốt',
  'Butter': 'Butter → "bơ-tơ" → bơ',
  'Cheese': 'Cheese → "chít" → phô mai 🧀',
  'Milk': 'Milk → "min" → sữa 🥛',

  // Drinks
  'Water': 'Water → "uo-tơ" → nước (cơ bản nhất)',
  'Tea': 'Tea → "ti" → trà',
  'Coffee': 'Coffee → "co-phi" → cà phê ☕',
  'Juice': 'Juice → "giiu-x" → nước ép',
  'Beer': 'Beer → "bia" → bia (nghe gần giống)',
  'Wine': 'Wine → "oai-n" → rượu vang 🍷',
  'Soda': 'Soda → nước ngọt có ga',

  // House
  'House': 'House → "hao-x" → nhà',
  'Room': 'Room → "rum" → phòng',
  'Kitchen': 'Kitchen → "kít-chừn" → nhà bếp',
  'Bedroom': 'Bed + Room → phòng có giường → phòng ngủ',
  'Bathroom': 'Bath + Room → phòng tắm',
  'Door': 'Door → "đo" → cửa ra vào',
  'Window': 'Window → "uin-đâu" → cửa sổ (Windows OS)',
  'Table': 'Table → "tây-bồ" → bàn',
  'Chair': 'Chair → "che" → ghế',
  'Bed': 'Bed → "bét" → giường',
  'Lamp': 'Lamp → "lam-p" → đèn',
  'Mirror': 'Mirror → "mi-rơ" → gương soi',
  'Clock': 'Clock → "clốc" → đồng hồ treo tường',
  'Stairs': 'Stairs → Stair (bậc) → cầu thang',
  'Roof': 'Roof → "rúp" → mái nhà',
  'Floor': 'Floor → "pho" → sàn nhà',
  'Wall': 'Wall → "uon" → tường (Firewall = tường lửa)',
  'Garden': 'Garden → "gác-đừn" → vườn (Kindergarten)',
  'Fence': 'Fence → "phen-x" → hàng rào',
  'Garage': 'Garage → "ga-ra" → nhà xe',

  // Transportation
  'Car': 'Car → "ca" → xe hơi (Cartoon = phim hoạt hình)',
  'Bus': 'Bus → "bớt" → xe buýt',
  'Train': 'Train cũng có nghĩa "huấn luyện" → tàu lửa',
  'Bicycle': 'Bi + cycle (vòng) → 2 vòng → xe đạp',
  'Motorcycle': 'Motor + Cycle → xe máy',
  'Airplane': 'Air (không khí) + Plane (mặt phẳng) → máy bay',
  'Ship': 'Ship → "sip" → tàu thủy',
  'Boat': 'Boat → "bâu-t" → thuyền nhỏ',
  'Taxi': 'Taxi → "tắc-xi" → taxi (từ mượn)',
  'Subway': 'Sub (dưới) + Way (đường) → đường ngầm',
  'Helicopter': 'Heli + copter → trực thăng',
  'Truck': 'Truck → "trắc" → xe tải',

  // Animals
  'Dog': 'Dog → "đọc" → chó (hot dog = xúc xích)',
  'Cat': 'Cat → "két" → mèo',
  'Bird': 'Bird → "bớt" → chim (Angry Bird)',
  'Fish': 'Fish → "phít" → cá',
  'Horse': 'Horse → "hóo-x" → ngựa',
  'Cow': 'Cow → "cao" → bò sữa 🐄',
  'Pig': 'Pig → "píc" → heo/lợn',
  'Sheep': 'Sheep → "sip" → cừu (Sleep → ngủ, đếm cừu)',
  'Chicken': 'Chicken → "chích-ken" → gà',
  'Duck': 'Duck → "đắc" → vịt (Donald Duck)',
  'Rabbit': 'Rabbit → "ré-bít" → thỏ',
  'Elephant': 'Elephant → "e-lờ-phần" → voi',
  'Lion': 'Lion → "lai-ơn" → sư tử (Lion King)',
  'Tiger': 'Tiger → "tai-gơ" → hổ',
  'Bear': 'Bear → "be" → gấu (Teddy Bear)',
  'Monkey': 'Monkey → "măng-ki" → khỉ',
  'Snake': 'Snake → "x-nây-k" → rắn 🐍',
  'Frog': 'Frog → "phrọc" → ếch',
  'Butterfly': 'Butter (bơ) + Fly (bay) → bươm bướm bay nhẹ như bơ',
  'Ant': 'Ant → "en-t" → kiến (nhỏ bé)',

  // Nature
  'Sun': 'Sun → "xơn" → mặt trời ☀️',
  'Moon': 'Moon → "mun" → mặt trăng 🌙',
  'Star': 'Star → "xta" → ngôi sao ⭐',
  'Cloud': 'Cloud → "clao-đ" → mây (iCloud)',
  'Rain': 'Rain → "rây-n" → mưa 🌧️',
  'Snow': 'Snow → "x-nâu" → tuyết ❄️',
  'Wind': 'Wind → "uin-đ" → gió 💨',
  'Storm': 'Storm → "x-tom" → bão 🌪️',
  'River': 'River → "ri-vơ" → sông',
  'Mountain': 'Mountain → "mao-tần" → núi ⛰️',
  'Ocean': 'Ocean → "ô-shần" → đại dương 🌊',
  'Forest': 'Forest → "pho-rết" → rừng 🌲',
  'Tree': 'Tree → "tri" → cây 🌳',
  'Flower': 'Flower → "phờ-lao-ơ" → hoa 🌸',
  'Grass': 'Grass → "grát" → cỏ 🌿',
  'Lake': 'Lake → "lây-k" → hồ',
  'Beach': 'Beach → "bít-ch" → bãi biển 🏖️',
  'Island': 'Island → "ai-lần-đ" → đảo (chữ s im lặng)',
  'Desert': 'Desert → "đe-zớt" → sa mạc (Dessert = tráng miệng, thêm 1 chữ s)',
  'Waterfall': 'Water (nước) + Fall (rơi) → thác nước',

  // Numbers
  'Zero': 'Zero → "zi-rô" → số 0',
  'One': 'One → "oăn" → số 1',
  'Two': 'Two → "tu" → số 2 (chữ w im lặng)',
  'Three': 'Three → "thri" → số 3',
  'Ten': 'Ten → "ten" → số 10',
  'Hundred': 'Hundred → "hăn-đrết" → số 100',
  'Thousand': 'Thousand → "thao-zần-đ" → số 1000',
  'Million': 'Million → "mi-li-ần" → triệu',
  'First': 'First → "phớt" → thứ nhất',
  'Second': 'Second → "xe-cần-đ" → thứ hai (cũng = giây)',
  'Third': 'Third → "thớt" → thứ ba',

  // Love
  'Love': 'Love → "lớp" → tình yêu ❤️',
  'Kiss': 'Kiss → "kít" → nụ hôn 💋',
  'Hug': 'Hug → "hắc" → ôm 🤗',
  'Date': 'Date → "đây-t" → hẹn hò (cũng = ngày tháng)',
  'Wedding': 'Wed + ding → tiếng chuông (ding) đám cưới',
  'Marriage': 'Marry + age → tuổi kết hôn',
  'Couple': 'Couple → "cớ-pồ" → cặp đôi',
  'Romance': 'Roman + ce → lãng mạn kiểu La Mã',
  'Heart': 'Heart → trái tim 💕',
  'Valentine': 'Valentine → Ngày tình nhân 14/2',

  // Sports
  'Football': 'Foot (chân) + Ball (bóng) → bóng đá ⚽',
  'Basketball': 'Basket (rổ) + Ball → bóng rổ 🏀',
  'Tennis': 'Tennis → "ten-nít" → quần vợt 🎾',
  'Swimming': 'Swim + ming → bơi lội 🏊',
  'Running': 'Run + ning → chạy bộ 🏃',
  'Volleyball': 'Volley + Ball → bóng chuyền 🏐',
  'Badminton': 'Badminton → "bát-min-tần" → cầu lông 🏸',
  'Boxing': 'Box + ing → đấm bốc 🥊',
  'Cycling': 'Cycle + ing → đạp xe 🚴',
  'Yoga': 'Yoga → "iô-ga" → yoga (từ tiếng Phạn)',

  // Countries
  'Vietnam': 'Vietnam → Việt Nam 🇻🇳 (quê hương)',
  'Japan': 'Japan → "Gia-pan" → Nhật Bản 🇯🇵',
  'Korea': 'Korea → Hàn Quốc 🇰🇷 (K-pop)',
  'China': 'China → "Chai-na" → Trung Quốc 🇨🇳',
  'America': 'America → "Ơ-me-ri-ca" → Mỹ 🇺🇸',
  'England': 'England → "Ing-lần-đ" → Anh 🇬🇧',
  'France': 'France → "Phờ-ran-x" → Pháp 🇫🇷',
  'Thailand': 'Thai + Land → đất nước Thái 🇹🇭',
  'Australia': 'Australia → "Ớt-trây-li-a" → Úc 🇦🇺',

  // Holidays
  'Christmas': 'Christ + mas → ngày của Chúa → Giáng sinh 🎄',
  'Halloween': 'Hallow + een → Lễ hội ma 🎃',
  'Birthday': 'Birth (sinh) + Day (ngày) → sinh nhật 🎂',
  'New Year': 'New (mới) + Year (năm) → Năm mới 🎆',
  'Valentine': 'Valentine → Ngày tình nhân 💝',
  'Easter': 'Easter → "ít-tơ" → Lễ Phục Sinh 🐣',
  'Thanksgiving': 'Thanks (cảm ơn) + Giving (cho) → Lễ Tạ Ơn 🦃',

  // Public places
  'School': 'School → "x-cun" → trường học 🏫',
  'Hospital': 'Hospital → "hót-pi-tồ" → bệnh viện 🏥',
  'Bank': 'Bank → "beng-k" → ngân hàng 🏦',
  'Library': 'Library → "lai-brơ-ri" → thư viện 📚',
  'Museum': 'Museum → "miu-zi-ầm" → bảo tàng 🏛️',
  'Market': 'Market → "ma-kít" → chợ/siêu thị',
  'Restaurant': 'Restaurant → "ret-tô-răng" → nhà hàng 🍽️',
  'Airport': 'Air (không) + Port (cảng) → sân bay ✈️',
  'Station': 'Station → "x-tây-shần" → ga/trạm',
  'Church': 'Church → "chớt-ch" → nhà thờ ⛪',
  'Park': 'Park cũng có nghĩa "đỗ xe" → công viên 🌳',
  'Cinema': 'Cinema → "xi-nơ-ma" → rạp chiếu phim 🎬',
  'Hotel': 'Hotel → "hô-ten" → khách sạn 🏨',
  'Pharmacy': 'Pharma + cy → nhà thuốc 💊',
  'Post office': 'Post (gửi) + Office (văn phòng) → bưu điện 📮',
};

// Context database - ngữ cảnh sử dụng
const CONTEXT_TIPS = {
  // Body parts - situations
  'Head': '💡 Dùng khi: nói về sức khỏe (headache - đau đầu), trang phục (headband)',
  'Face': '💡 Dùng khi: mô tả người (face to face - đối mặt), công nghệ (Face ID)',
  'Eye': '💡 Dùng khi: mô tố ngoại hình, idiom: "keep an eye on" = để ý, trông chừng',
  'Ear': '💡 Dùng khi: nói về nghe, idiom: "play it by ear" = tùy cơ ứng biến',
  'Nose': '💡 Dùng khi: mô tả, idiom: "follow your nose" = đi thẳng',
  'Mouth': '💡 Dùng khi: ăn uống, idiom: "word of mouth" = truyền miệng',
  'Hand': '💡 Dùng khi: giúp đỡ ("give me a hand" = giúp tôi), bắt tay (handshake)',
  'Heart': '💡 Dùng khi: tình cảm, idiom: "learn by heart" = học thuộc lòng',
  'Brain': '💡 Dùng khi: trí tuệ, idiom: "brainstorm" = động não',
  'Back': '💡 Dùng khi: vị trí (in the back), idiom: "behind someone\'s back" = sau lưng ai',
  'Shoulder': '💡 Dùng khi: idiom: "shoulder to shoulder" = sát cánh, "cold shoulder" = lạnh nhạt',
  'Leg': '💡 Dùng khi: di chuyển, idiom: "break a leg!" = chúc may mắn (trên sân khấu)',
  'Knee': '💡 Dùng khi: vận động, idiom: "on your knees" = quỳ xuống',
  'Finger': '💡 Dùng khi: chỉ trỏ, idiom: "cross your fingers" = cầu may',
  'Foot': '💡 Dùng khi: đi chân, idiom: "on foot" = đi bộ, "put your foot down" = kiên quyết',

  // General contexts
  'Tall': '💡 Dùng cho người và vật cao: tall building, tall tree',
  'Short': '💡 Dùng cho chiều cao (short person) và chiều dài (short hair, short film)',
  'Fat': '💡 Cẩn thận: chỉ dùng với vật/động vật, gọi người là "fat" không lịch sự → dùng "overweight"',
  'Thin': '💡 Trung tính, nhưng "skinny" (gầy trơ xương) mang nghĩa tiêu cực hơn',
  'Beautiful': '💡 Dùng cho phụ nữ, phong cảnh. Đàn ông dùng "handsome"',
  'Pretty': '💡 Dùng cho phụ nữ, trẻ em. Cũng là trạng từ: "pretty good" = khá tốt',
  'Handsome': '💡 Chủ yếu dùng cho đàn ông. "Handsome salary" = lương hậu hĩnh',

  // Food contexts
  'Rice': '💡 "Cooked rice" = cơm, "Rice field" = ruộng lúa, "Fried rice" = cơm chiên',
  'Bread': '💡 Không đếm được! Nói "a piece/loaf of bread", không nói "a bread"',
  'Egg': '💡 Đa dạng: fried egg (trứng ốp), boiled egg (trứng luộc), scrambled egg (trứng xào)',
  'Chicken': '💡 Con gà = a chicken (đếm được), thịt gà = chicken (không đếm được)',
  'Vegetable': '💡 Thường dùng số nhiều: "vegetables" → Eat your vegetables!',
  'Fruit': '💡 Tập hợp: "fruit" (không số nhiều); các loại: "fruits" → exotic fruits',

  // Drink contexts
  'Water': '💡 Không đếm được! "a glass/bottle of water". "Water" cũng = tưới cây',
  'Coffee': '💡 "A cup of coffee". Loại: black coffee, iced coffee, latte, cappuccino',
  'Tea': '💡 "A cup of tea". Idiom: "not my cup of tea" = không phải gu của tôi',
  'Juice': '💡 "Orange juice" (nước cam), "Apple juice" (nước táo). Tính từ: "juicy" = mọng nước',

  // House contexts
  'Kitchen': '💡 Nơi nấu ăn. "Kitchen appliances" = thiết bị nhà bếp (tủ lạnh, lò vi sóng...)',
  'Bedroom': '💡 "Master bedroom" = phòng ngủ chính. "Spare bedroom" = phòng khách ngủ',
  'Bathroom': '💡 Ở Mỹ, "bathroom" = nhà vệ sinh. Ở Anh dùng "toilet" hoặc "loo"',
  'Door': '💡 Idiom: "next door" = nhà bên cạnh, "behind closed doors" = kín, bí mật',
  'Window': '💡 Idiom: "window shopping" = đi ngắm hàng không mua',

  // Emotions
  'Happy': '💡 Đồng nghĩa: glad, joyful, cheerful. Trái nghĩa: sad, unhappy',
  'Sad': '💡 Đồng nghĩa: unhappy, upset. Mạnh hơn: depressed, heartbroken',
  'Angry': '💡 Đồng nghĩa: mad, furious. Nhẹ hơn: annoyed, irritated',
  'Scared': '💡 = afraid = frightened. "Scared of" + danh từ: I\'m scared of spiders',
  'Tired': '💡 "Tired of" = chán: I\'m tired of waiting. "Exhausted" = kiệt sức',
  'Bored': '💡 Bored (buồn chán) ≠ Boring (gây chán). I\'m bored / The movie is boring',
  'Nervous': '💡 Dùng trước thi cử, phỏng vấn, thuyết trình: I feel nervous about the exam',
  'Excited': '💡 "Excited about" = hào hứng với: I\'m excited about the trip!',
  'Surprised': '💡 "Surprised at/by" = ngạc nhiên. Surprise party = tiệc bất ngờ',
};

// Related words database
const RELATED_WORDS = {
  'Head': 'headache, headband, headline, headquarters',
  'Face': 'facial, Facebook, face-to-face, surface',
  'Eye': 'eyesight, eyebrow, eyelash, eyeglasses',
  'Ear': 'earring, earphone, earbud, earworm',
  'Nose': 'nosy, nostril, nose-bleed',
  'Mouth': 'mouthwash, mouthful, mouth-watering',
  'Tooth': 'teeth (số nhiều), toothbrush, toothpaste, toothache',
  'Hand': 'handful, handshake, handmade, handy',
  'Heart': 'heartbeat, heartbreak, heartfelt, sweetheart',
  'Brain': 'brainy, brainstorm, brainwash, no-brainer',
  'Leg': 'legacy, legend, leggings',
  'Foot': 'feet (số nhiều), footprint, footwear, barefoot',
  'Finger': 'fingerprint, fingertip, fingernail',
  'Back': 'backbone, backpack, background, feedback',
  'Blood': 'bloody, bloodstream, blood pressure',
  'Bone': 'backbone, boneless',
  'Muscle': 'muscular, mussel (con trai)',
  'Skin': 'skincare, skinny, thick-skinned',

  'Tall': '↔️ short. Tương tự: high, lofty',
  'Short': '↔️ tall/long. Tương tự: brief, little',
  'Fat': '↔️ thin/slim. Tương tự: chubby, overweight, obese',
  'Thin': '↔️ fat/thick. Tương tự: slim, slender, skinny',
  'Beautiful': '≈ pretty, gorgeous, stunning. ↔️ ugly',
  'Handsome': '≈ good-looking, attractive. Dùng cho nam',
  'Cute': '≈ adorable, lovely, sweet',

  'Happy': '≈ glad, joyful, cheerful, delighted. ↔️ sad, unhappy',
  'Sad': '≈ unhappy, sorrowful, melancholy. ↔️ happy, cheerful',
  'Angry': '≈ mad, furious, annoyed, irritated. ↔️ calm, peaceful',
  'Scared': '≈ afraid, frightened, terrified. ↔️ brave, fearless',
  'Tired': '≈ exhausted, weary, fatigued. ↔️ energetic, refreshed',
  'Bored': '≈ uninterested, tedious. ↔️ excited, interested',
  'Excited': '≈ thrilled, enthusiastic, eager. ↔️ bored, indifferent',
  'Nervous': '≈ anxious, worried, tense. ↔️ calm, relaxed',
  'Surprised': '≈ amazed, astonished, shocked. ↔️ expected',
  'Proud': '≈ satisfied, fulfilled. ↔️ ashamed, humble',
  'Lonely': '≈ alone, isolated, solitary. ↔️ social, accompanied',

  'Kind': '≈ nice, gentle, generous. ↔️ mean, cruel',
  'Honest': '≈ truthful, sincere, frank. ↔️ dishonest, deceitful',
  'Brave': '≈ courageous, fearless, bold. ↔️ cowardly, timid',
  'Smart': '≈ clever, intelligent, bright. ↔️ dumb, stupid',
  'Lazy': '≈ idle, sluggish. ↔️ hardworking, diligent',
  'Shy': '≈ timid, bashful, reserved. ↔️ outgoing, bold',
  'Friendly': '≈ warm, sociable, approachable. ↔️ unfriendly, hostile',
  'Confident': '≈ self-assured, bold. ↔️ insecure, timid',
  'Creative': '≈ imaginative, innovative, inventive',
  'Patient': '≈ tolerant, enduring. ↔️ impatient',
  'Selfish': '≈ self-centered, greedy. ↔️ selfless, generous',
  'Stubborn': '≈ obstinate, headstrong. ↔️ flexible, open-minded',

  'Father': '= dad, daddy, papa. Họ: fatherhood, fatherland',
  'Mother': '= mom, mommy, mama. Họ: motherhood, motherland',
  'Brother': 'brotherhood, brotherly',
  'Sister': 'sisterhood, sisterly',
  'Baby': '= infant. Họ: babysit, baby shower',
  'Husband': '= spouse (chung). ↔️ wife',
  'Wife': '= spouse (chung). ↔️ husband. Số nhiều: wives',

  'Doctor': '= physician. Họ: doctorate, medical doctor (MD)',
  'Teacher': '= instructor, educator. Họ: teach, teaching',
  'Engineer': 'engineering, engine, mechanical engineer',
  'Nurse': 'nursing, nursery',
  'Lawyer': '= attorney. Họ: law, lawsuit, lawful',
  'Chef': '= cook. Head chef, sous chef',

  'Rice': 'rice field, rice noodle, fried rice, sticky rice',
  'Bread': 'breadcrumb, bread basket, white/wheat bread',
  'Egg': 'egg white, egg yolk, eggshell, eggplant',
  'Chicken': 'chicken breast, chicken wing, chicken soup, roast chicken',
  'Vegetable': 'veggie (informal), vegetarian, vegan',
  'Fruit': 'fruitful, fruity, fruit juice, dried fruit',
  'Sugar': 'sugary, sugar-free, brown sugar',
  'Salt': 'salty, salt water, Himalayan salt',
  'Milk': 'milky, milkshake, milk tea, almond milk',
  'Coffee': 'coffeehouse, coffee bean, coffee break',
  'Water': 'waterfall, waterproof, underwater, watermelon',
  'Tea': 'teapot, teacup, tea bag, green tea, herbal tea',

  'House': 'household, housework, housekeeper, greenhouse',
  'Room': 'roommate, bedroom, bathroom, classroom',
  'Door': 'doorbell, doorstep, doorway, indoor/outdoor',
  'Window': 'windowsill, window seat, stained glass window',
  'Table': 'tablecloth, timetable, table tennis',

  'Football': 'footballer, football field, American football',
  'Swimming': 'swimmer, swimming pool, swim, swimsuit',
  'Running': 'runner, run, running shoes, marathon',

  'Car': 'carpool, car park, car wash, racing car',
  'Bus': 'bus stop, bus driver, school bus, minibus',
  'Train': 'train station, training, high-speed train',
  'Bicycle': 'bike (viết tắt), cycling, cyclist',
  'Airplane': '= plane, aircraft. Airport, airline',

  'Dog': 'doggy, puppy, hot dog, underdog',
  'Cat': 'kitten, kitty, catfish, catnap',
  'Bird': 'birdsong, birdhouse, early bird',
  'Elephant': 'elephantine. Idiom: "elephant in the room" = vấn đề hiển nhiên mà không ai nhắc',
  'Lion': 'lioness (sư tử cái), lion cub (sư tử con), Lion King',
  'Monkey': 'monkey bars, monkey wrench. Idiom: "monkey around" = nghịch ngợm',
  'Butterfly': 'butterflies in my stomach = lo lắng, hồi hộp',

  'Sun': 'sunny, sunshine, sunflower, sunburn, sunset, sunrise',
  'Moon': 'moonlight, full moon, half moon, moonshine',
  'Star': 'starfish, starlight, stardom, superstar',
  'Rain': 'rainy, rainbow, raincoat, rainforest, rainfall',
  'Snow': 'snowy, snowman, snowflake, snowball',
  'Wind': 'windy, windmill, window, windshield',
  'River': 'riverbank, riverside, river delta',
  'Mountain': 'mountainous, mountaineer, mountain bike',
  'Ocean': 'oceanic, Pacific Ocean, Atlantic Ocean',
  'Forest': 'forestry, rainforest, deforestation',
  'Tree': 'treehouse, treetop, family tree, Christmas tree',
  'Flower': 'flowering, flowerpot, sunflower, wildflower',

  'Love': 'lovely, lover, beloved, lovesick',
  'Kiss': 'kisser, kissing, goodbye kiss',
  'Wedding': 'wed, wedding ring, wedding dress, bride, groom',

  'School': 'schoolmate, schoolwork, schoolyard, preschool',
  'Hospital': 'hospitalize, hospitality',
  'Bank': 'banker, banking, bank account, piggy bank',
  'Library': 'librarian, book library, digital library',
};

// ── Main script ──────────────────────────────────────────────────────────
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'vocab-topics.js');
let content = fs.readFileSync(filePath, 'utf8');

// For each word object, add memoryTip, context, related if we have data
let modified = 0;
let total = 0;

// Match all word entries: { word: 'Xxx', phonetic: ..., meaning: ..., example: ..., illustration: ... }
content = content.replace(
  /\{\s*word:\s*'([^']+)',\s*phonetic:\s*'([^']*)',\s*meaning:\s*'([^']*)',\s*example:\s*'([^']*)',\s*illustration:\s*'([^']*)'\s*\}/g,
  (match, word, phonetic, meaning, example, illustration) => {
    total++;
    const tip = MEMORY_TIPS[word];
    const ctx = CONTEXT_TIPS[word];
    const rel = RELATED_WORDS[word];

    if (tip || ctx || rel) {
      modified++;
      let result = `{ word: '${word}', phonetic: '${phonetic}', meaning: '${meaning}', example: '${example}', illustration: '${illustration}'`;
      if (tip) result += `, memoryTip: '${tip.replace(/'/g, "\\'")}'`;
      if (ctx) result += `, context: '${ctx.replace(/'/g, "\\'")}'`;
      if (rel) result += `, related: '${rel.replace(/'/g, "\\'")}'`;
      result += ' }';
      return result;
    }
    return match;
  }
);

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Done! ${modified}/${total} words enhanced with memory aids.`);
