// ============================================
// COWDI PET — Pet Registry & Game Data
// Thêm pet mới = thêm 1 entry vào PET_REGISTRY
// ============================================

// ── Pet Registry ─────────────────────────────────────────────────────────────
export const PET_REGISTRY = {
  cowdi: {
    id: 'cowdi',
    name: 'Cowdi',
    species: 'Bò sữa',
    emoji: '🐮',
    element: 'neutral',
    rarity: 'starter',
    baseStats: { speech: 5, intelligence: 5, perception: 5, creativity: 5 },
    description: 'Chú bò hiền lành yêu tiếng Anh, luôn đồng hành cùng bạn từ ngày đầu.',
    evolutions: [
      { stage: 0, name: 'Trứng Cowdi', xp: 0, emoji: '🥚' },
      { stage: 1, name: 'Baby Cowdi', xp: 100, emoji: '🐄' },
      { stage: 2, name: 'Junior Cowdi', xp: 500, emoji: '🐮' },
      { stage: 3, name: 'Super Cowdi', xp: 1200, emoji: '🦬' },
      { stage: 4, name: 'Legendary Cowdi', xp: 2500, emoji: '👑' },
    ],
    unlockCondition: null, // Starter — có sẵn
    chatMessages: {
      happy: [
        'Chào bạn! Hôm nay mình học gì nhé? 🐮',
        'Moo~ Bạn đã ôn bài chưa? 📚',
        'Cố lên! Cowdi tin bạn! 💪',
        'Mỗi ngày một ít, bạn sẽ giỏi thôi! 🌟',
        'Hay quá! Tiếp tục học nhé! 🎉',
      ],
      sad: [
        'Moo... Cowdi nhớ bạn lắm 😢',
        'Cowdi hơi buồn... Học bài đi nha 🥺',
        'Sao lâu không thấy bạn vậy...? 😿',
      ],
      sick: [
        'Cowdi ốm rồi... Cần bạn giúp 🤒',
        'Moo... Cowdi yếu lắm... Học 1 bài thôi nha 😷',
      ],
    },
  },

  foxie: {
    id: 'foxie',
    name: 'Foxie',
    species: 'Cáo lửa',
    emoji: '🦊',
    element: 'fire',
    rarity: 'common',
    baseStats: { speech: 3, intelligence: 8, perception: 4, creativity: 5 },
    description: 'Cáo thông minh, giỏi ngữ pháp, thích giải đố.',
    evolutions: [
      { stage: 0, name: 'Trứng Foxie', xp: 0, emoji: '🥚' },
      { stage: 1, name: 'Baby Foxie', xp: 100, emoji: '🦊' },
      { stage: 2, name: 'Junior Foxie', xp: 500, emoji: '🦊' },
      { stage: 3, name: 'Super Foxie', xp: 1200, emoji: '🔥' },
      { stage: 4, name: 'Legendary Foxie', xp: 2500, emoji: '👑' },
    ],
    unlockCondition: { type: 'lessons', value: 5 },
    chatMessages: {
      happy: [
        'Hmm, câu này dễ mà! 🦊',
        'Foxie thích ngữ pháp lắm! Học cùng nha! 📖',
        'Thông minh lắm! Foxie nể bạn! 🧠',
        'Giải đố cùng Foxie nhé! ✨',
      ],
      sad: ['Foxie buồn quá... Lâu rồi không ai giải đố 😢', 'Foxie nhớ bạn... 🥺'],
      sick: ['Foxie ốm mất rồi... 🤒'],
    },
  },

  pingu: {
    id: 'pingu',
    name: 'Pingu',
    species: 'Chim cánh cụt',
    emoji: '🐧',
    element: 'water',
    rarity: 'common',
    baseStats: { speech: 4, intelligence: 4, perception: 8, creativity: 4 },
    description: 'Cánh cụt chăm chỉ, thính giác siêu nhạy, yêu âm nhạc.',
    evolutions: [
      { stage: 0, name: 'Trứng Pingu', xp: 0, emoji: '🥚' },
      { stage: 1, name: 'Baby Pingu', xp: 100, emoji: '🐧' },
      { stage: 2, name: 'Junior Pingu', xp: 500, emoji: '🐧' },
      { stage: 3, name: 'Super Pingu', xp: 1200, emoji: '🧊' },
      { stage: 4, name: 'Legendary Pingu', xp: 2500, emoji: '👑' },
    ],
    unlockCondition: { type: 'quizzes', value: 10, category: 'listening' },
    chatMessages: {
      happy: [
        'Nghe này nghe này! 🎵',
        'Pingu nghe rõ lắm nè! 👂',
        'Luyện nghe cùng Pingu nhé! 🐧',
      ],
      sad: ['Pingu lạnh quá... Học bài cho ấm nha 🥶'],
      sick: ['Pingu ốm rồi... 😷'],
    },
  },

  leafy: {
    id: 'leafy',
    name: 'Leafy',
    species: 'Rùa lá',
    emoji: '🐢',
    element: 'nature',
    rarity: 'common',
    baseStats: { speech: 8, intelligence: 4, perception: 4, creativity: 4 },
    description: 'Rùa kiên nhẫn, nhớ từ vựng rất giỏi, chậm mà chắc.',
    evolutions: [
      { stage: 0, name: 'Trứng Leafy', xp: 0, emoji: '🥚' },
      { stage: 1, name: 'Baby Leafy', xp: 100, emoji: '🐢' },
      { stage: 2, name: 'Junior Leafy', xp: 500, emoji: '🐢' },
      { stage: 3, name: 'Super Leafy', xp: 1200, emoji: '🌿' },
      { stage: 4, name: 'Legendary Leafy', xp: 2500, emoji: '👑' },
    ],
    unlockCondition: { type: 'words', value: 50 },
    chatMessages: {
      happy: [
        'Chậm mà chắc! Học từ mới nào! 🐢',
        'Leafy nhớ hết từ rồi đó! 🌿',
        'Từ vựng là sức mạnh! 📝',
      ],
      sad: ['Leafy buồn... Lâu rồi không học từ mới 🥺'],
      sick: ['Leafy ốm rồi... 😷'],
    },
  },

  sparky: {
    id: 'sparky',
    name: 'Sparky',
    species: 'Rồng nhỏ',
    emoji: '🐉',
    element: 'fire',
    rarity: 'rare',
    baseStats: { speech: 4, intelligence: 5, perception: 4, creativity: 8 },
    description: 'Rồng nhỏ đầy năng lượng, sáng tạo vô hạn, thích viết câu.',
    evolutions: [
      { stage: 0, name: 'Trứng Sparky', xp: 0, emoji: '🥚' },
      { stage: 1, name: 'Baby Sparky', xp: 100, emoji: '🐉' },
      { stage: 2, name: 'Junior Sparky', xp: 500, emoji: '🐉' },
      { stage: 3, name: 'Super Sparky', xp: 1200, emoji: '🔥' },
      { stage: 4, name: 'Legendary Sparky', xp: 2500, emoji: '👑' },
    ],
    unlockCondition: { type: 'streak', value: 7 },
    chatMessages: {
      happy: [
        'Rawr~! Viết câu cùng Sparky! 🐉',
        'Sparky đầy sáng tạo hôm nay! ✨',
        'Lửa cháy trong tim! 🔥',
      ],
      sad: ['Sparky hết lửa rồi... 😢'],
      sick: ['Sparky ốm... không phun lửa được 🤒'],
    },
  },

  mimi: {
    id: 'mimi',
    name: 'Mimi',
    species: 'Mèo mây',
    emoji: '🐱',
    element: 'cosmic',
    rarity: 'rare',
    baseStats: { speech: 4, intelligence: 7, perception: 7, creativity: 3 },
    description: 'Mèo thần bí từ thiên hà xa xôi, giỏi phân tích và lắng nghe.',
    evolutions: [
      { stage: 0, name: 'Trứng Mimi', xp: 0, emoji: '🥚' },
      { stage: 1, name: 'Baby Mimi', xp: 100, emoji: '🐱' },
      { stage: 2, name: 'Junior Mimi', xp: 500, emoji: '🐱' },
      { stage: 3, name: 'Super Mimi', xp: 1200, emoji: '🌙' },
      { stage: 4, name: 'Legendary Mimi', xp: 2500, emoji: '👑' },
    ],
    unlockCondition: { type: 'perfectQuizzes', value: 3 },
    chatMessages: {
      happy: [
        'Meo~ Mimi thấy bạn giỏi lắm! 🐱',
        'Ngôi sao lấp lánh! ⭐',
        'Mimi tin bạn sẽ hoàn hảo! 💫',
      ],
      sad: ['Mimi buồn... Meo meo... 😿'],
      sick: ['Mimi ốm rồi... 🤒'],
    },
  },

  owlbert: {
    id: 'owlbert',
    name: 'Owlbert',
    species: 'Cú vọ',
    emoji: '🦉',
    element: 'nature',
    rarity: 'rare',
    baseStats: { speech: 3, intelligence: 10, perception: 4, creativity: 4 },
    description: 'Cú vọ thông thái, bậc thầy ngữ pháp, biết mọi quy tắc.',
    evolutions: [
      { stage: 0, name: 'Trứng Owlbert', xp: 0, emoji: '🥚' },
      { stage: 1, name: 'Baby Owlbert', xp: 100, emoji: '🦉' },
      { stage: 2, name: 'Junior Owlbert', xp: 500, emoji: '🦉' },
      { stage: 3, name: 'Super Owlbert', xp: 1200, emoji: '📚' },
      { stage: 4, name: 'Legendary Owlbert', xp: 2500, emoji: '👑' },
    ],
    unlockCondition: { type: 'quizzes', value: 15, category: 'grammar' },
    chatMessages: {
      happy: [
        'Hoo hoo! Ngữ pháp là nghệ thuật! 🦉',
        'Owlbert biết tất cả quy tắc! 📖',
        'Thông thái như Owlbert! 🎓',
      ],
      sad: ['Hoo... Owlbert cô đơn 😢'],
      sick: ['Owlbert ốm... 🤒'],
    },
  },

  flippy: {
    id: 'flippy',
    name: 'Flippy',
    species: 'Cá heo',
    emoji: '🐬',
    element: 'water',
    rarity: 'rare',
    baseStats: { speech: 7, intelligence: 3, perception: 7, creativity: 4 },
    description: 'Cá heo vui vẻ, giao tiếp tuyệt vời, nghe hiểu siêu nhanh.',
    evolutions: [
      { stage: 0, name: 'Trứng Flippy', xp: 0, emoji: '🥚' },
      { stage: 1, name: 'Baby Flippy', xp: 100, emoji: '🐬' },
      { stage: 2, name: 'Junior Flippy', xp: 500, emoji: '🐬' },
      { stage: 3, name: 'Super Flippy', xp: 1200, emoji: '🌊' },
      { stage: 4, name: 'Legendary Flippy', xp: 2500, emoji: '👑' },
    ],
    unlockCondition: { type: 'words', value: 100 },
    chatMessages: {
      happy: [
        'Splash! Học từ mới nào! 🐬',
        'Flippy nói tiếng Anh giỏi lắm! 🌊',
        'Đại dương kiến thức! 💙',
      ],
      sad: ['Flippy buồn... 😢'],
      sick: ['Flippy ốm... 🤒'],
    },
  },

  leo: {
    id: 'leo',
    name: 'Leo',
    species: 'Sư tử',
    emoji: '🦁',
    element: 'fire',
    rarity: 'epic',
    baseStats: { speech: 6, intelligence: 6, perception: 6, creativity: 6 },
    description: 'Sư tử dũng mãnh, mạnh mẽ toàn diện, vua của muôn loài.',
    evolutions: [
      { stage: 0, name: 'Trứng Leo', xp: 0, emoji: '🥚' },
      { stage: 1, name: 'Baby Leo', xp: 100, emoji: '🦁' },
      { stage: 2, name: 'Junior Leo', xp: 500, emoji: '🦁' },
      { stage: 3, name: 'Super Leo', xp: 1200, emoji: '🔥' },
      { stage: 4, name: 'Legendary Leo', xp: 2500, emoji: '👑' },
    ],
    unlockCondition: { type: 'xp', value: 1000 },
    chatMessages: {
      happy: [
        'ROAR! Leo mạnh lắm! 🦁',
        'Vua muôn loài đây! 👑',
        'Sức mạnh đến từ kiến thức! 💪',
      ],
      sad: ['Leo buồn... Gầm nhẹ thôi 😢'],
      sick: ['Leo ốm rồi... 🤒'],
    },
  },

  bamboo: {
    id: 'bamboo',
    name: 'Bamboo',
    species: 'Gấu trúc',
    emoji: '🐼',
    element: 'nature',
    rarity: 'epic',
    baseStats: { speech: 9, intelligence: 4, perception: 5, creativity: 5 },
    description: 'Gấu trúc dễ thương, bậc thầy giao tiếp, nói chuyện suốt ngày.',
    evolutions: [
      { stage: 0, name: 'Trứng Bamboo', xp: 0, emoji: '🥚' },
      { stage: 1, name: 'Baby Bamboo', xp: 100, emoji: '🐼' },
      { stage: 2, name: 'Junior Bamboo', xp: 500, emoji: '🐼' },
      { stage: 3, name: 'Super Bamboo', xp: 1200, emoji: '🎋' },
      { stage: 4, name: 'Legendary Bamboo', xp: 2500, emoji: '👑' },
    ],
    unlockCondition: { type: 'lessons', value: 8 },
    chatMessages: {
      happy: [
        'Nom nom! Bamboo ăn tre và học! 🐼',
        'Bamboo nói giỏi lắm nè! 🎋',
        'Giao tiếp là sức mạnh! 💚',
      ],
      sad: ['Bamboo buồn... Đói tre 😢'],
      sick: ['Bamboo ốm... 🤒'],
    },
  },

  storm: {
    id: 'storm',
    name: 'Storm',
    species: 'Đại bàng',
    emoji: '🦅',
    element: 'cosmic',
    rarity: 'epic',
    baseStats: { speech: 4, intelligence: 4, perception: 7, creativity: 8 },
    description: 'Đại bàng kiên cường, bay qua mọi giông bão, sáng tạo vô tận.',
    evolutions: [
      { stage: 0, name: 'Trứng Storm', xp: 0, emoji: '🥚' },
      { stage: 1, name: 'Baby Storm', xp: 100, emoji: '🦅' },
      { stage: 2, name: 'Junior Storm', xp: 500, emoji: '🦅' },
      { stage: 3, name: 'Super Storm', xp: 1200, emoji: '⚡' },
      { stage: 4, name: 'Legendary Storm', xp: 2500, emoji: '👑' },
    ],
    unlockCondition: { type: 'streak', value: 30 },
    chatMessages: {
      happy: [
        'Bay cao cùng Storm! 🦅',
        'Bão tố không thể cản! ⚡',
        'Kiên trì là sức mạnh! 💨',
      ],
      sad: ['Storm buồn... Trời yên gió lặng 😢'],
      sick: ['Storm ốm... Không bay được 🤒'],
    },
  },

  shadow: {
    id: 'shadow',
    name: 'Shadow',
    species: 'Sói bóng',
    emoji: '🐺',
    element: 'cosmic',
    rarity: 'epic',
    baseStats: { speech: 3, intelligence: 8, perception: 4, creativity: 8 },
    description: 'Sói huyền bí, trí tuệ sâu sắc, sáng tạo trong bóng tối.',
    evolutions: [
      { stage: 0, name: 'Trứng Shadow', xp: 0, emoji: '🥚' },
      { stage: 1, name: 'Baby Shadow', xp: 100, emoji: '🐺' },
      { stage: 2, name: 'Junior Shadow', xp: 500, emoji: '🐺' },
      { stage: 3, name: 'Super Shadow', xp: 1200, emoji: '🌑' },
      { stage: 4, name: 'Legendary Shadow', xp: 2500, emoji: '👑' },
    ],
    unlockCondition: { type: 'quizzes', value: 50 },
    chatMessages: {
      happy: [
        'Awoo~ Shadow giỏi lắm! 🐺',
        'Bóng tối che giấu sức mạnh! 🌑',
        'Trí tuệ và sáng tạo! ✨',
      ],
      sad: ['Shadow cô đơn... 😢'],
      sick: ['Shadow ốm... 🤒'],
    },
  },

  prisma: {
    id: 'prisma',
    name: 'Prisma',
    species: 'Kỳ lân',
    emoji: '🦄',
    element: 'cosmic',
    rarity: 'legendary',
    baseStats: { speech: 8, intelligence: 8, perception: 8, creativity: 8 },
    description: 'Kỳ lân huyền thoại, tỏa sáng bởi kiến thức toàn diện.',
    evolutions: [
      { stage: 0, name: 'Trứng Prisma', xp: 0, emoji: '🥚' },
      { stage: 1, name: 'Baby Prisma', xp: 100, emoji: '🦄' },
      { stage: 2, name: 'Junior Prisma', xp: 500, emoji: '🦄' },
      { stage: 3, name: 'Super Prisma', xp: 1200, emoji: '🌈' },
      { stage: 4, name: 'Legendary Prisma', xp: 2500, emoji: '👑' },
    ],
    unlockCondition: { type: 'xp', value: 2500 },
    chatMessages: {
      happy: [
        'Cầu vồng kiến thức! 🌈',
        'Prisma tỏa sáng! 🦄',
        'Huyền thoại đây rồi! ✨',
      ],
      sad: ['Prisma mờ nhạt... 😢'],
      sick: ['Prisma ốm... Mất sắc màu... 🤒'],
    },
  },

  draco: {
    id: 'draco',
    name: 'Draco',
    species: 'Rồng cổ đại',
    emoji: '🐲',
    element: 'fire',
    rarity: 'legendary',
    baseStats: { speech: 9, intelligence: 9, perception: 9, creativity: 9 },
    description: 'Rồng cổ đại, bậc thầy vạn vật, chỉ xuất hiện khi thu thập đủ tất cả.',
    evolutions: [
      { stage: 0, name: 'Trứng Draco', xp: 0, emoji: '🥚' },
      { stage: 1, name: 'Baby Draco', xp: 100, emoji: '🐲' },
      { stage: 2, name: 'Junior Draco', xp: 500, emoji: '🐲' },
      { stage: 3, name: 'Super Draco', xp: 1200, emoji: '🔥' },
      { stage: 4, name: 'Legendary Draco', xp: 2500, emoji: '👑' },
    ],
    unlockCondition: { type: 'collection', value: 14 },
    chatMessages: {
      happy: [
        'ROARRRR! Draco bậc thầy đây! 🐲',
        'Rồng cổ đại thức giấc! 🔥',
        'Sức mạnh tối thượng! ⚡',
      ],
      sad: ['Draco buồn... Gầm nhẹ... 😢'],
      sick: ['Draco ốm... 🤒'],
    },
  },

  pumpkin: {
    id: 'pumpkin',
    name: 'Pumpkin',
    species: 'Bí ngô ma',
    emoji: '🎃',
    element: 'cosmic',
    rarity: 'event',
    baseStats: { speech: 6, intelligence: 6, perception: 6, creativity: 6 },
    description: 'Bí ngô phép thuật từ lễ hội Halloween, mang bonus XP đặc biệt.',
    evolutions: [
      { stage: 0, name: 'Trứng Pumpkin', xp: 0, emoji: '🥚' },
      { stage: 1, name: 'Baby Pumpkin', xp: 100, emoji: '🎃' },
      { stage: 2, name: 'Junior Pumpkin', xp: 500, emoji: '🎃' },
      { stage: 3, name: 'Super Pumpkin', xp: 1200, emoji: '👻' },
      { stage: 4, name: 'Legendary Pumpkin', xp: 2500, emoji: '👑' },
    ],
    unlockCondition: { type: 'event', eventId: 'halloween' },
    chatMessages: {
      happy: [
        'Boo! Hù bạn đó! 🎃',
        'Trick or Treat! Học tiếng Anh nào! 👻',
        'Halloween vui vẻ! 🎃',
      ],
      sad: ['Pumpkin héo rồi... 😢'],
      sick: ['Pumpkin ốm... 🤒'],
    },
  },
};

// ── Shop Items ───────────────────────────────────────────────────────────────
export const SHOP_ITEMS = [
  // Hats
  { id: 'hat_graduation', name: 'Mũ tốt nghiệp', category: 'hat', emoji: '🎓', price: 50, description: 'Học giỏi xứng đáng!' },
  { id: 'hat_crown', name: 'Vương miện', category: 'hat', emoji: '👑', price: 200, description: 'Vua của kiến thức!' },
  { id: 'hat_cowboy', name: 'Nón cao bồi', category: 'hat', emoji: '🤠', price: 80, description: 'Yeehaw! Phiêu lưu!' },
  { id: 'hat_wizard', name: 'Mũ phù thủy', category: 'hat', emoji: '🧙', price: 150, description: 'Ma thuật tiếng Anh!' },
  { id: 'hat_santa', name: 'Mũ Noel', category: 'hat', emoji: '🎅', price: 120, description: 'Ho ho ho!' },
  { id: 'hat_party', name: 'Mũ tiệc', category: 'hat', emoji: '🥳', price: 60, description: 'Party time!' },

  // Outfits
  { id: 'outfit_hero', name: 'Áo siêu nhân', category: 'outfit', emoji: '🦸', price: 150, description: 'Siêu anh hùng ngôn ngữ!' },
  { id: 'outfit_explorer', name: 'Áo thám hiểm', category: 'outfit', emoji: '🧭', price: 120, description: 'Khám phá kiến thức!' },
  { id: 'outfit_wizard', name: 'Áo phù thủy', category: 'outfit', emoji: '🔮', price: 200, description: 'Phép thuật tiếng Anh!' },
  { id: 'outfit_sport', name: 'Áo thể thao', category: 'outfit', emoji: '⚽', price: 80, description: 'Năng động!' },
  { id: 'outfit_star', name: 'Áo ngôi sao', category: 'outfit', emoji: '⭐', price: 300, description: 'Tỏa sáng!' },

  // Rooms (backgrounds)
  { id: 'room_library', name: 'Thư viện', category: 'room', emoji: '📚', price: 150, description: 'Thiên đường sách!' },
  { id: 'room_beach', name: 'Bãi biển', category: 'room', emoji: '🏖️', price: 200, description: 'Học bên bờ biển!' },
  { id: 'room_space', name: 'Vũ trụ', category: 'room', emoji: '🚀', price: 300, description: 'Học giữa ngân hà!' },
  { id: 'room_forest', name: 'Rừng xanh', category: 'room', emoji: '🌲', price: 180, description: 'Yên bình thiên nhiên!' },
  { id: 'room_castle', name: 'Lâu đài', category: 'room', emoji: '🏰', price: 500, description: 'Lâu đài kiến thức!' },

  // Effects
  { id: 'effect_bubbles', name: 'Bong bóng', category: 'effect', emoji: '🫧', price: 100, description: 'Bong bóng bay xung quanh!' },
  { id: 'effect_stars', name: 'Sao sáng', category: 'effect', emoji: '✨', price: 150, description: 'Lấp lánh!' },
  { id: 'effect_leaves', name: 'Lá rơi', category: 'effect', emoji: '🍃', price: 120, description: 'Lá bay nhẹ nhàng!' },
  { id: 'effect_fire', name: 'Ngọn lửa', category: 'effect', emoji: '🔥', price: 200, description: 'Cháy bỏng đam mê!' },
  { id: 'effect_snow', name: 'Tuyết rơi', category: 'effect', emoji: '❄️', price: 180, description: 'Tuyết trắng xóa!' },

  // Food (temporary boosts)
  { id: 'food_pizza', name: 'Pizza XP', category: 'food', emoji: '🍕', price: 50, description: '+30 Năng lượng!' },
  { id: 'food_milk', name: 'Sữa thần', category: 'food', emoji: '🥛', price: 80, description: '+20 tất cả nhu cầu!' },
  { id: 'food_cake', name: 'Bánh sinh nhật', category: 'food', emoji: '🎂', price: 100, description: '+40 Vui vẻ!' },
  { id: 'food_apple', name: 'Táo thần', category: 'food', emoji: '🍎', price: 60, description: '+30 Sức khỏe!' },
  { id: 'food_book', name: 'Sách phép', category: 'food', emoji: '📖', price: 70, description: '+30 Kiến thức!' },
];

// ── Quest Templates ──────────────────────────────────────────────────────────
export const DAILY_QUESTS = [
  { id: 'daily_lesson', title: '🐮 Cho pet ăn sáng', desc: 'Hoàn thành 1 bài học', reward: 10, check: (u) => u.dailyTasks?.lessonDone },
  { id: 'daily_quiz', title: '🎮 Chơi cùng pet', desc: 'Hoàn thành 1 quiz', reward: 10, check: (u) => u.quizzesCompleted > 0 },
  { id: 'daily_vocab', title: '📖 Kể chuyện cho pet', desc: 'Ôn 5 từ vựng', reward: 10, check: (u) => u.dailyTasks?.vocabDone },
];

export const WEEKLY_QUESTS = [
  { id: 'weekly_lessons', title: '📚 Tuần học chăm', desc: 'Hoàn thành 3 bài học trong tuần', reward: 50, target: 3 },
  { id: 'weekly_streak', title: '🔥 Streak bền bỉ', desc: 'Duy trì streak 7 ngày', reward: 100, check: (u) => u.streak >= 7 },
  { id: 'weekly_perfect', title: '💯 Quiz Master', desc: 'Đạt 3 perfect quiz trong tuần', reward: 80, target: 3 },
];

// ── Element Colors ───────────────────────────────────────────────────────────
export const ELEMENT_COLORS = {
  neutral: { bg: '#F0F0F0', text: '#666', name: 'Trung tính' },
  fire:    { bg: '#FFE0D0', text: '#E0527E', name: 'Lửa' },
  water:   { bg: '#D0E8FF', text: '#4A90D9', name: 'Nước' },
  nature:  { bg: '#D0F0D0', text: '#2E8B57', name: 'Thiên nhiên' },
  cosmic:  { bg: '#E8D0FF', text: '#8B5CF6', name: 'Vũ trụ' },
};

export const RARITY_COLORS = {
  starter:   { bg: '#F0F0F0', text: '#888', name: '⭐ Starter' },
  common:    { bg: '#E8F5E9', text: '#4CAF50', name: '⭐ Phổ biến' },
  rare:      { bg: '#E3F2FD', text: '#2196F3', name: '⭐⭐ Hiếm' },
  epic:      { bg: '#F3E5F5', text: '#9C27B0', name: '⭐⭐⭐ Sử thi' },
  legendary: { bg: '#FFF8E1', text: '#FF8F00', name: '⭐⭐⭐⭐ Huyền thoại' },
  event:     { bg: '#FBE9E7', text: '#E64A19', name: '🎃 Sự kiện' },
};

// ── Skill metadata ───────────────────────────────────────────────────────────
export const SKILL_META = {
  speech:       { icon: '🗣️', name: 'Giao tiếp', color: '#4CAF50' },
  intelligence: { icon: '🧠', name: 'Trí tuệ',   color: '#2196F3' },
  perception:   { icon: '👂', name: 'Thính giác', color: '#9C27B0' },
  creativity:   { icon: '✍️', name: 'Sáng tạo',  color: '#FF9800' },
};

// ── Helper: Quiz category → Pet skill ────────────────────────────────────────
export const QUIZ_TO_SKILL = {
  vocab:     'speech',
  grammar:   'intelligence',
  listening: 'perception',
  sentences: 'creativity',
};

// ── Helper: Get current evolution stage ──────────────────────────────────────
export function getPetEvolution(speciesId, totalXP) {
  const species = PET_REGISTRY[speciesId];
  if (!species) return null;
  let current = species.evolutions[0];
  for (const evo of species.evolutions) {
    if (totalXP >= evo.xp) current = evo;
    else break;
  }
  return current;
}

// ── Helper: Calculate power score ────────────────────────────────────────────
const EVOLUTION_MULTIPLIER = [0.5, 0.8, 1.0, 1.3, 1.5];
const RARITY_BONUS = { starter: 1.0, common: 1.0, rare: 1.1, epic: 1.2, legendary: 1.3, event: 1.1 };

export function calculatePowerScore(petInstance, species) {
  if (!petInstance || !species) return 0;
  const { speech = 0, intelligence = 0, perception = 0, creativity = 0 } = petInstance.skills;
  const base = speech + intelligence + perception + creativity;
  const evoMul = EVOLUTION_MULTIPLIER[petInstance.evolution] ?? 1.0;
  const rarMul = RARITY_BONUS[species.rarity] ?? 1.0;
  return Math.floor(base * evoMul * rarMul);
}

// ── Helper: Get skill level (1-10) ──────────────────────────────────────────
export function getSkillLevel(value) {
  if (value >= 200) return 10;
  if (value >= 160) return 9;
  if (value >= 130) return 8;
  if (value >= 100) return 7;
  if (value >= 75) return 6;
  if (value >= 55) return 5;
  if (value >= 40) return 4;
  if (value >= 28) return 3;
  if (value >= 15) return 2;
  return 1;
}

// ── Helper: Check unlock condition ───────────────────────────────────────────
export function checkUnlockCondition(condition, userData, petData) {
  if (!condition) return true; // Starter
  switch (condition.type) {
    case 'xp':
      return (userData.totalXP || 0) >= condition.value;
    case 'lessons':
      return (userData.lessonsCompleted || 0) >= condition.value;
    case 'words':
      return (userData.wordsLearned || 0) >= condition.value;
    case 'streak':
      return (userData.streak || 0) >= condition.value;
    case 'quizzes':
      return (userData.quizzesCompleted || 0) >= condition.value;
    case 'perfectQuizzes':
      return (userData.perfectQuizzes || 0) >= condition.value;
    case 'collection':
      return Object.keys(petData.collection || {}).length >= condition.value;
    case 'event': {
      // Halloween: tháng 10, Christmas: tháng 12
      const month = new Date().getMonth();
      if (condition.eventId === 'halloween') return month === 9; // October
      if (condition.eventId === 'christmas') return month === 11; // December
      return false;
    }
    default:
      return false;
  }
}

// ── Helper: Get pet mood ─────────────────────────────────────────────────────
export function getPetMood(needs) {
  if (!needs) return 'happy';
  const vals = Object.values(needs);
  const min = Math.min(...vals);
  if (min < 15) return 'sick';
  if (min < 40) return 'sad';
  return 'happy';
}

// ── Helper: Get random message ───────────────────────────────────────────────
export function getPetMessage(speciesId, mood) {
  const species = PET_REGISTRY[speciesId];
  if (!species) return 'Moo~';
  const msgs = species.chatMessages[mood] || species.chatMessages.happy;
  return msgs[Math.floor(Math.random() * msgs.length)];
}

// ── New Pet Achievements ─────────────────────────────────────────────────────
export const PET_ACHIEVEMENTS = [
  { id: 'first_pet', icon: '🥚', title: 'Pet đầu tiên', desc: 'Nhận pet đầu tiên', check: (_, p) => Object.keys(p.collection || {}).length >= 1 },
  { id: 'pet_collector_5', icon: '📦', title: 'Nhà sưu tập', desc: 'Sở hữu 5 pet', check: (_, p) => Object.keys(p.collection || {}).length >= 5 },
  { id: 'pet_collector_10', icon: '🏆', title: 'Đại sưu tập', desc: 'Sở hữu 10 pet', check: (_, p) => Object.keys(p.collection || {}).length >= 10 },
  { id: 'pet_collector_all', icon: '🐲', title: 'Bậc thầy pet', desc: 'Sở hữu tất cả pet', check: (_, p) => Object.keys(p.collection || {}).length >= Object.keys(PET_REGISTRY).length },
  { id: 'pet_evolution_3', icon: '⚡', title: 'Tiến hóa!', desc: 'Tiến hóa pet lên giai đoạn 3', check: (_, p) => Object.values(p.collection || {}).some(pet => pet.evolution >= 3) },
  { id: 'pet_evolution_4', icon: '👑', title: 'Huyền thoại!', desc: 'Tiến hóa pet lên giai đoạn cuối', check: (_, p) => Object.values(p.collection || {}).some(pet => pet.evolution >= 4) },
  { id: 'pet_power_100', icon: '💪', title: 'Sức mạnh 100', desc: 'Pet đạt 100 Power Score', check: (_, p) => {
    for (const pet of Object.values(p.collection || {})) {
      const species = PET_REGISTRY[pet.speciesId];
      if (species && calculatePowerScore(pet, species) >= 100) return true;
    }
    return false;
  }},
  { id: 'pet_coins_500', icon: '💰', title: 'Triệu phú', desc: 'Tích lũy 500 coins', check: (_, p) => (p.totalCoinsEarned || 0) >= 500 },
];
