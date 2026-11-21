import { useState, useMemo, useEffect, useRef } from 'react';
import Icon from '../../components/Icon';
import Emoji from '../../components/Emoji';
import {
  getImageOverrides,
  setImageOverride,
  resetImageOverride,
  resetAllImageOverrides,
  setAllImageOverrides,
} from '../../utils/imageOverrides';

// Master data danh mục toàn bộ tài nguyên hình ảnh của Cowdi English
const MASTER_IMAGE_ITEMS = [
  // ── 1. Thẻ con Subtopics: Human ──
  { id: 'human-body', type: 'subtopic', topicId: 'human', titleEn: 'Body Parts', titleVi: 'Bộ phận cơ thể', defaultUrl: '/image/subtopics/human/body.webp', hasFile: true, bg: '#FED7AA', border: '#EA580C', banner: '#C2410C' },
  { id: 'human-appearance', type: 'subtopic', topicId: 'human', titleEn: 'Appearance', titleVi: 'Ngoại hình', defaultUrl: '/image/subtopics/human/appearance.webp', hasFile: true, bg: '#FCE7F3', border: '#DB2777', banner: '#BE185D' },
  { id: 'human-personality', type: 'subtopic', topicId: 'human', titleEn: 'Personality', titleVi: 'Tính cách', defaultUrl: '/image/subtopics/human/personality.webp', hasFile: true, bg: '#DDD6FE', border: '#7C3AED', banner: '#6D28D9' },
  { id: 'human-emotions', type: 'subtopic', topicId: 'human', titleEn: 'Emotions', titleVi: 'Cảm xúc', defaultUrl: '/image/subtopics/human/emotions.webp', hasFile: true, bg: '#BAE6FD', border: '#0284C7', banner: '#0369A1' },
  { id: 'human-family', type: 'subtopic', topicId: 'human', titleEn: 'Family', titleVi: 'Gia đình', defaultUrl: '/image/subtopics/human/family.webp', hasFile: true, bg: '#FED7AA', border: '#EA580C', banner: '#C2410C' },
  { id: 'human-lifecycle', type: 'subtopic', topicId: 'human', titleEn: 'Life Stages', titleVi: 'Giai đoạn sống', defaultUrl: '/image/subtopics/human/lifecycle.webp', hasFile: true, bg: '#A7F3D0', border: '#059669', banner: '#047857' },
  { id: 'human-more', type: 'subtopic', topicId: 'human', titleEn: 'More', titleVi: 'Mở rộng', defaultUrl: '/image/subtopics/human/more.webp', hasFile: true, bg: '#FEF08A', border: '#CA8A04', banner: '#A16207' },

  // ── 2. Thẻ con Subtopics: Eating ──
  { id: 'eating-fruits', type: 'subtopic', topicId: 'eating', titleEn: 'Fruits', titleVi: 'Trái cây', defaultUrl: '/image/subtopics/eating/fruits.webp', hasFile: true, bg: '#FED7AA', border: '#EA580C', banner: '#C2410C' },
  { id: 'eating-vegetables', type: 'subtopic', topicId: 'eating', titleEn: 'Vegetables', titleVi: 'Rau củ', defaultUrl: '/image/subtopics/eating/vegetables.webp', hasFile: true, bg: '#BBF7D0', border: '#16A34A', banner: '#15803D' },
  { id: 'eating-meat-seafood', type: 'subtopic', topicId: 'eating', titleEn: 'Meat & Seafood', titleVi: 'Thịt & Hải sản', defaultUrl: '/image/subtopics/eating/meat_seafood.webp', hasFile: true, bg: '#FED7AA', border: '#E11D48', banner: '#BE123C' },
  { id: 'eating-cooking', type: 'subtopic', topicId: 'eating', titleEn: 'Cooking', titleVi: 'Nấu ăn & Gia vị', defaultUrl: '/image/subtopics/eating/cooking.webp', hasFile: true, bg: '#FEF08A', border: '#CA8A04', banner: '#A16207' },
  { id: 'eating-meals', type: 'subtopic', topicId: 'eating', titleEn: 'Meals', titleVi: 'Bữa ăn & Món ăn', defaultUrl: '/image/subtopics/eating/meals.webp', hasFile: true, bg: '#FED7AA', border: '#D97706', banner: '#B45309' },
  { id: 'eating-taste', type: 'subtopic', topicId: 'eating', titleEn: 'Taste', titleVi: 'Vị & Kết cấu', defaultUrl: '/image/subtopics/eating/taste.webp', hasFile: true, bg: '#FEF08A', border: '#CA8A04', banner: '#A16207' },
  { id: 'eating-more', type: 'subtopic', topicId: 'eating', titleEn: 'More', titleVi: 'Mở rộng', defaultUrl: '/image/subtopics/eating/more.webp', hasFile: true, bg: '#BAE6FD', border: '#0284C7', banner: '#0369A1' },

  // ── 3. Thẻ con Subtopics: Drinking ──
  { id: 'drinking-hot', type: 'subtopic', topicId: 'drinking', titleEn: 'Hot Drinks', titleVi: 'Đồ uống nóng', defaultUrl: '/image/subtopics/drinking/hot.webp', hasFile: true, bg: '#FED7AA', border: '#EA580C', banner: '#C2410C' },
  { id: 'drinking-cold', type: 'subtopic', topicId: 'drinking', titleEn: 'Cold Drinks', titleVi: 'Đồ uống lạnh', defaultUrl: '/image/subtopics/drinking/cold.webp', hasFile: true, bg: '#BAE6FD', border: '#0284C7', banner: '#0369A1' },
  { id: 'drinking-dairy', type: 'subtopic', topicId: 'drinking', titleEn: 'Dairy & Milk', titleVi: 'Sữa & Chế phẩm', defaultUrl: '/image/subtopics/drinking/dairy.webp', hasFile: true, bg: '#E0E7FF', border: '#4F46E5', banner: '#4338CA' },
  { id: 'drinking-actions', type: 'subtopic', topicId: 'drinking', titleEn: 'Drinking', titleVi: 'Hành động uống', defaultUrl: '/image/subtopics/drinking/actions.webp', hasFile: true, bg: '#CFFAFE', border: '#0891B2', banner: '#0E7490' },
  { id: 'drinking-more', type: 'subtopic', topicId: 'drinking', titleEn: 'More', titleVi: 'Mở rộng', defaultUrl: '/image/subtopics/drinking/more.webp', hasFile: true, bg: '#FEF08A', border: '#CA8A04', banner: '#A16207' },

  // ── 4. Thẻ con Subtopics: House ──
  { id: 'house-rooms', type: 'subtopic', topicId: 'house', titleEn: 'Rooms', titleVi: 'Các phòng', defaultUrl: '/image/subtopics/house/rooms.webp', hasFile: true, bg: '#FFEDD5', border: '#EA580C', banner: '#C2410C' },
  { id: 'house-furniture', type: 'subtopic', topicId: 'house', titleEn: 'Furniture', titleVi: 'Nội thất', defaultUrl: '/image/subtopics/house/furniture.webp', hasFile: true, bg: '#DCFCE7', border: '#16A34A', banner: '#15803D' },
  { id: 'house-appliances', type: 'subtopic', topicId: 'house', titleEn: 'Appliances', titleVi: 'Thiết bị gia dụng', defaultUrl: '/image/subtopics/house/appliances.webp', hasFile: true, bg: '#CFFAFE', border: '#0891B2', banner: '#0E7490' },
  { id: 'house-chores', type: 'subtopic', topicId: 'house', titleEn: 'Housework', titleVi: 'Việc nhà', defaultUrl: '/image/subtopics/house/chores.webp', hasFile: true, bg: '#F3E8FF', border: '#9333EA', banner: '#7E22CE' },
  { id: 'house-more', type: 'subtopic', topicId: 'house', titleEn: 'More', titleVi: 'Mở rộng', defaultUrl: '/image/subtopics/house/more.webp', hasFile: true, bg: '#FEF08A', border: '#CA8A04', banner: '#A16207' },

  // ── 5. Thẻ con Subtopics: Transportation ──
  { id: 'transport-vehicles', type: 'subtopic', topicId: 'transportation', titleEn: 'Vehicles', titleVi: 'Phương tiện', defaultUrl: '/image/subtopics/transportation/vehicles.webp', hasFile: true, bg: '#FED7AA', border: '#EA580C', banner: '#C2410C' },
  { id: 'transport-road', type: 'subtopic', topicId: 'transportation', titleEn: 'Road Traffic', titleVi: 'Đường & Giao thông', defaultUrl: '/image/subtopics/transportation/road.webp', hasFile: true, bg: '#FEF08A', border: '#CA8A04', banner: '#A16207' },
  { id: 'transport-actions', type: 'subtopic', topicId: 'transportation', titleEn: 'Travel', titleVi: 'Hành động đi lại', defaultUrl: '/image/subtopics/transportation/actions.webp', hasFile: true, bg: '#BAE6FD', border: '#0284C7', banner: '#0369A1' },
  { id: 'transportation-more', type: 'subtopic', topicId: 'transportation', titleEn: 'More', titleVi: 'Mở rộng', defaultUrl: '/image/subtopics/transportation/more.webp', hasFile: true, bg: '#E2E8F0', border: '#475569', banner: '#334155' },

  // ── 6. Thẻ con Subtopics: Love ──
  { id: 'love-feelings', type: 'subtopic', topicId: 'love', titleEn: 'Feelings', titleVi: 'Cảm xúc yêu', defaultUrl: '/image/subtopics/love/feelings.webp', hasFile: true, bg: '#FCE7F3', border: '#DB2777', banner: '#BE185D' },
  { id: 'love-relationships', type: 'subtopic', topicId: 'love', titleEn: 'Relationships', titleVi: 'Mối quan hệ', defaultUrl: '/image/subtopics/love/relationships.webp', hasFile: true, bg: '#FFE4E6', border: '#E11D48', banner: '#BE123C' },
  { id: 'love-dating', type: 'subtopic', topicId: 'love', titleEn: 'Dating', titleVi: 'Hẹn hò & Kết hôn', defaultUrl: '/image/subtopics/love/dating.webp', hasFile: true, bg: '#F3E8FF', border: '#9333EA', banner: '#7E22CE' },
  { id: 'love-more', type: 'subtopic', topicId: 'love', titleEn: 'More', titleVi: 'Mở rộng', defaultUrl: '/image/subtopics/love/more.webp', hasFile: true, bg: '#FDF2F8', border: '#EC4899', banner: '#DB2777' },

  // ── 7. Thẻ con Subtopics: Numbers ──
  { id: 'numbers-basic', type: 'subtopic', topicId: 'numbers', titleEn: 'Cardinal', titleVi: 'Số đếm cơ bản', defaultUrl: '/image/subtopics/numbers/basic.webp', hasFile: false, bg: '#E0E7FF', border: '#4F46E5', banner: '#4338CA' },
  { id: 'numbers-ordinal', type: 'subtopic', topicId: 'numbers', titleEn: 'Ordinal', titleVi: 'Số thứ tự', defaultUrl: '/image/subtopics/numbers/ordinal.webp', hasFile: true, bg: '#DCFCE7', border: '#16A34A', banner: '#15803D' },
  { id: 'numbers-math', type: 'subtopic', topicId: 'numbers', titleEn: 'Math', titleVi: 'Toán & Đo lường', defaultUrl: '/image/subtopics/numbers/math.webp', hasFile: true, bg: '#F5F3FF', border: '#7C3AED', banner: '#6D28D9' },
  { id: 'numbers-more', type: 'subtopic', topicId: 'numbers', titleEn: 'More', titleVi: 'Mở rộng', defaultUrl: '/image/subtopics/numbers/more.webp', hasFile: false, bg: '#FEF08A', border: '#CA8A04', banner: '#A16207' },

  // ── 8. Thẻ con Subtopics: Sports ──
  { id: 'sports-types', type: 'subtopic', topicId: 'sports', titleEn: 'Sports', titleVi: 'Các môn thể thao', defaultUrl: '/image/subtopics/sports/types.webp', hasFile: true, bg: '#DCFCE7', border: '#16A34A', banner: '#15803D' },
  { id: 'sports-actions', type: 'subtopic', topicId: 'sports', titleEn: 'Fitness', titleVi: 'Tập luyện & Dụng cụ', defaultUrl: '/image/subtopics/sports/actions.webp', hasFile: true, bg: '#ECFCCB', border: '#65A30D', banner: '#4D7C0F' },
  { id: 'sports-more', type: 'subtopic', topicId: 'sports', titleEn: 'More', titleVi: 'Mở rộng', defaultUrl: '/image/subtopics/sports/more.webp', hasFile: true, bg: '#FEF08A', border: '#CA8A04', banner: '#A16207' },

  // ── 9. Thẻ con Subtopics: Holidays ──
  { id: 'holidays-types', type: 'subtopic', topicId: 'holidays', titleEn: 'Holidays', titleVi: 'Các ngày lễ', defaultUrl: '/image/subtopics/holidays/types.webp', hasFile: true, bg: '#FFE0B2', border: '#EF6C00', banner: '#B84500' },
  { id: 'holidays-activities', type: 'subtopic', topicId: 'holidays', titleEn: 'Celebrations', titleVi: 'Hoạt động lễ hội', defaultUrl: '/image/subtopics/holidays/activities.webp', hasFile: true, bg: '#FED7AA', border: '#EA580C', banner: '#C2410C' },
  { id: 'holidays-more', type: 'subtopic', topicId: 'holidays', titleEn: 'More', titleVi: 'Mở rộng', defaultUrl: '/image/subtopics/holidays/more.webp', hasFile: true, bg: '#FEF08A', border: '#CA8A04', banner: '#A16207' },

  // ── 10. Thẻ con Subtopics: Animals ──
  { id: 'animals-pets', type: 'subtopic', topicId: 'animals', titleEn: 'Pets & Farm', titleVi: 'Thú cưng & Gia súc', defaultUrl: '/image/subtopics/animals/pets.webp', hasFile: true, bg: '#DCEDC8', border: '#689F38', banner: '#466D1E' },
  { id: 'animals-wild', type: 'subtopic', topicId: 'animals', titleEn: 'Wild Animals', titleVi: 'Động vật hoang dã', defaultUrl: '/image/subtopics/animals/wild.webp', hasFile: true, bg: '#FED7AA', border: '#D97706', banner: '#B45309' },
  { id: 'animals-sea', type: 'subtopic', topicId: 'animals', titleEn: 'Sea Creatures', titleVi: 'Sinh vật biển', defaultUrl: '/image/subtopics/animals/sea.webp', hasFile: true, bg: '#BAE6FD', border: '#0284C7', banner: '#0369A1' },
  { id: 'animals-more', type: 'subtopic', topicId: 'animals', titleEn: 'More', titleVi: 'Mở rộng', defaultUrl: '/image/subtopics/animals/more.webp', hasFile: true, bg: '#FEF08A', border: '#CA8A04', banner: '#A16207' },

  // ── 11. Thẻ con Subtopics: Nature ──
  { id: 'nature-weather', type: 'subtopic', topicId: 'nature', titleEn: 'Weather', titleVi: 'Thời tiết', defaultUrl: '/image/subtopics/nature/weather.webp', hasFile: true, bg: '#BAE6FD', border: '#0284C7', banner: '#0369A1' },
  { id: 'nature-landscape', type: 'subtopic', topicId: 'nature', titleEn: 'Landscape', titleVi: 'Địa hình', defaultUrl: '/image/subtopics/nature/landscape.webp', hasFile: true, bg: '#A7F3D0', border: '#059669', banner: '#047857' },
  { id: 'nature-plants', type: 'subtopic', topicId: 'nature', titleEn: 'Plants & Trees', titleVi: 'Cây cối & Hoa', defaultUrl: '/image/subtopics/nature/plants.webp', hasFile: true, bg: '#DCFCE7', border: '#16A34A', banner: '#15803D' },
  { id: 'nature-more', type: 'subtopic', topicId: 'nature', titleEn: 'More', titleVi: 'Mở rộng', defaultUrl: '/image/subtopics/nature/more.webp', hasFile: true, bg: '#FEF08A', border: '#CA8A04', banner: '#A16207' },

  // ── 12. Thẻ con Subtopics: Public Places ──
  { id: 'places-services', type: 'subtopic', topicId: 'public-places', titleEn: 'Services', titleVi: 'Dịch vụ & Tòa nhà', defaultUrl: '/image/subtopics/public-places/services.webp', hasFile: true, bg: '#CFD8DC', border: '#455A64', banner: '#263238' },
  { id: 'places-shopping', type: 'subtopic', topicId: 'public-places', titleEn: 'Shopping', titleVi: 'Mua sắm & Ăn uống', defaultUrl: '/image/subtopics/public-places/shopping.webp', hasFile: true, bg: '#FED7AA', border: '#EA580C', banner: '#C2410C' },
  { id: 'places-entertainment', type: 'subtopic', topicId: 'public-places', titleEn: 'Fun & Leisure', titleVi: 'Giải trí', defaultUrl: '/image/subtopics/public-places/entertainment.webp', hasFile: true, bg: '#DDD6FE', border: '#7C3AED', banner: '#6D28D9' },
  { id: 'public-places-more', type: 'subtopic', topicId: 'public-places', titleEn: 'More', titleVi: 'Mở rộng', defaultUrl: '/image/subtopics/public-places/more.webp', hasFile: true, bg: '#FEF08A', border: '#CA8A04', banner: '#A16207' },

  // ── 13. Thẻ con Subtopics: Countries ──
  { id: 'countries-asia', type: 'subtopic', topicId: 'countries', titleEn: 'Asia', titleVi: 'Châu Á', defaultUrl: '/image/subtopics/countries/asia.webp', hasFile: true, bg: '#FEE2E2', border: '#DC2626', banner: '#B91C1C' },
  { id: 'countries-world', type: 'subtopic', topicId: 'countries', titleEn: 'Americas & Europe', titleVi: 'Châu Mỹ & Châu Âu', defaultUrl: '/image/subtopics/countries/world.webp', hasFile: true, bg: '#B3E5FC', border: '#0288D1', banner: '#01579B' },
  { id: 'countries-language', type: 'subtopic', topicId: 'countries', titleEn: 'Languages', titleVi: 'Ngôn ngữ & Quốc tịch', defaultUrl: '/image/subtopics/countries/languages.webp', hasFile: true, bg: '#E0E7FF', border: '#4F46E5', banner: '#4338CA' },
  { id: 'countries-more', type: 'subtopic', topicId: 'countries', titleEn: 'More', titleVi: 'Mở rộng', defaultUrl: '/image/subtopics/countries/more.webp', hasFile: true, bg: '#FEF08A', border: '#CA8A04', banner: '#A16207' },

  // ── BẢNG 2: 13 Thẻ chủ đề chính Topics ──
  { id: 'topic-human', type: 'topic', topicId: 'human', titleEn: 'Human', titleVi: 'Con người', defaultUrl: '/image/topics/human.webp', hasFile: true, bg: '#A6C8E8', border: '#336B9B', banner: '#1A4D78' },
  { id: 'topic-eating', type: 'topic', topicId: 'eating', titleEn: 'Eating', titleVi: 'Ăn uống', defaultUrl: '/image/topics/eating.webp', hasFile: true, bg: '#FFEAA7', border: '#D48A14', banner: '#B86F00' },
  { id: 'topic-drinking', type: 'topic', topicId: 'drinking', titleEn: 'Drinking', titleVi: 'Đồ uống', defaultUrl: '/image/topics/drinking.webp', hasFile: true, bg: '#E4D3C5', border: '#7A5240', banner: '#553424' },
  { id: 'topic-house', type: 'topic', topicId: 'house', titleEn: 'House', titleVi: 'Nhà cửa', defaultUrl: '/image/topics/house.webp', hasFile: true, bg: '#F5BDBD', border: '#C0393B', banner: '#8F1E20' },
  { id: 'topic-transportation', type: 'topic', topicId: 'transportation', titleEn: 'Transport', titleVi: 'Giao thông', defaultUrl: '/image/topics/transportation.webp', hasFile: true, bg: '#D3D8DE', border: '#5C646E', banner: '#373D45' },
  { id: 'topic-love', type: 'topic', topicId: 'love', titleEn: 'Love', titleVi: 'Tình yêu', defaultUrl: '/image/topics/love.webp', hasFile: true, bg: '#FBC4D6', border: '#D81B60', banner: '#9C0D3E' },
  { id: 'topic-numbers', type: 'topic', topicId: 'numbers', titleEn: 'Numbers', titleVi: 'Số đếm', defaultUrl: '/image/topics/numbers.webp', hasFile: true, bg: '#DCD4EE', border: '#673AB7', banner: '#452187' },
  { id: 'topic-sports', type: 'topic', topicId: 'sports', titleEn: 'Sports', titleVi: 'Thể thao', defaultUrl: '/image/topics/sports.webp', hasFile: true, bg: '#C8E6C9', border: '#2E7D32', banner: '#1B5E20' },
  { id: 'topic-holidays', type: 'topic', topicId: 'holidays', titleEn: 'Holidays', titleVi: 'Ngày lễ', defaultUrl: '/image/topics/holidays.webp', hasFile: true, bg: '#FFE0B2', border: '#EF6C00', banner: '#B84500' },
  { id: 'topic-animals', type: 'topic', topicId: 'animals', titleEn: 'Animals', titleVi: 'Động vật', defaultUrl: '/image/topics/animals.webp', hasFile: true, bg: '#DCEDC8', border: '#689F38', banner: '#466D1E' },
  { id: 'topic-nature', type: 'topic', topicId: 'nature', titleEn: 'Nature', titleVi: 'Thiên nhiên', defaultUrl: '/image/topics/nature.webp', hasFile: true, bg: '#B2DFDB', border: '#00897B', banner: '#005B52' },
  { id: 'topic-public-places', type: 'topic', topicId: 'public-places', titleEn: 'Places', titleVi: 'Nơi công cộng', defaultUrl: '/image/topics/public-places.webp', hasFile: true, bg: '#CFD8DC', border: '#455A64', banner: '#263238' },
  { id: 'topic-countries', type: 'topic', topicId: 'countries', titleEn: 'Countries', titleVi: 'Quốc gia', defaultUrl: '/image/topics/countries.webp', hasFile: true, bg: '#B3E5FC', border: '#0288D1', banner: '#01579B' },

  // ── BẢNG 3: 6 Mini-games ──
  { id: 'game-word-catch', type: 'minigame', titleEn: 'Word Catch', titleVi: 'Cowdi Bắt Từ', defaultUrl: '/image/minigames/minigame_cowdi_bat_tu.webp', hasFile: true, bg: '#DDD6FE', border: '#5B4BD8', banner: '#4338CA' },
  { id: 'game-sentence-puzzle', type: 'minigame', titleEn: 'Sentence', titleVi: 'Ghép câu', defaultUrl: '/image/minigames/minigame_ghep_cau.webp', hasFile: true, bg: '#A7F3D0', border: '#059669', banner: '#047857' },
  { id: 'game-memory-match', type: 'minigame', titleEn: 'Memory Match', titleVi: 'Lật thẻ nhớ', defaultUrl: '/image/minigames/minigame_lat_the_nho.webp', hasFile: true, bg: '#FED7AA', border: '#EA580C', banner: '#C2410C' },
  { id: 'game-spelling-bee', type: 'minigame', titleEn: 'Spelling Bee', titleVi: 'Spelling Bee', defaultUrl: '/image/minigames/minigame_spelling_bee.webp', hasFile: true, bg: '#FEF08A', border: '#CA8A04', banner: '#92400E' },
  { id: 'game-speed-match', type: 'minigame', titleEn: 'Speed Match', titleVi: 'Tốc độ ánh sáng', defaultUrl: '/image/minigames/minigame_toc_do_anh_sang.webp', hasFile: true, bg: '#BAE6FD', border: '#0284C7', banner: '#0369A1' },
  { id: 'game-word-scramble', type: 'minigame', titleEn: 'Scramble', titleVi: 'Xáo chữ', defaultUrl: '/image/minigames/minigame_xao_chu.webp', hasFile: true, bg: '#E9D5FF', border: '#7C3AED', banner: '#6D28D9' },

  // ── BẢNG 4: 15 Chế độ Luyện tập ──
  { id: 'practice-vocab', type: 'practice', titleEn: 'Vocab Review', titleVi: 'Từ vựng & Flashcard', defaultUrl: '/image/practice/tu_dien.webp', hasFile: true, bg: '#FED7AA', border: '#EA580C', banner: '#C2410C' },
  { id: 'practice-grammar', type: 'practice', titleEn: 'Grammar', titleVi: 'Ngữ pháp cơ bản', defaultUrl: '/image/practice/ngu_phap.webp', hasFile: true, bg: '#BAE6FD', border: '#0284C7', banner: '#0369A1' },
  { id: 'practice-listening', type: 'practice', titleEn: 'Listening', titleVi: 'Luyện nghe hiểu', defaultUrl: '/image/practice/practice_nghe_hieu.webp', hasFile: true, bg: '#A7F3D0', border: '#059669', banner: '#047857' },
  { id: 'practice-sentences', type: 'practice', titleEn: 'Fill Sentence', titleVi: 'Hoàn thành câu', defaultUrl: '/image/practice/hoan_thanh_cau.webp', hasFile: true, bg: '#BAE6FD', border: '#0284C7', banner: '#0369A1' },
  { id: 'practice-dictation', type: 'practice', titleEn: 'Dictation', titleVi: 'Nghe chính tả', defaultUrl: '/image/practice/nghe_cau.webp', hasFile: true, bg: '#DDD6FE', border: '#7C3AED', banner: '#6D28D9' },
  { id: 'practice-matching', type: 'practice', titleEn: 'Word Match', titleVi: 'Nối cặp từ', defaultUrl: '/image/practice/noi_cap.webp', hasFile: true, bg: '#FED7AA', border: '#EA580C', banner: '#C2410C' },
  { id: 'practice-fillin', type: 'practice', titleEn: 'Letter Puzzle', titleVi: 'Ghép chữ khuyết', defaultUrl: '/image/practice/ghep_chu.webp', hasFile: true, bg: '#FEF08A', border: '#CA8A04', banner: '#A16207' },
  { id: 'practice-reorder', type: 'practice', titleEn: 'Reorder', titleVi: 'Sắp xếp trật tự câu', defaultUrl: '/image/practice/xap_xep_cau.webp', hasFile: true, bg: '#CFD8DC', border: '#455A64', banner: '#263238' },
  { id: 'practice-noi-cau', type: 'practice', titleEn: 'Listen & Connect', titleVi: 'Nối câu', defaultUrl: '/image/practice/noi_cau.webp', hasFile: true, bg: '#FCE7F3', border: '#DB2777', banner: '#BE185D' },
  { id: 'practice-speed', type: 'practice', titleEn: 'Fast Reflex', titleVi: 'Phản xạ nói nhanh', defaultUrl: '/image/practice/phan_xa_noi.webp', hasFile: true, bg: '#FEF08A', border: '#CA8A04', banner: '#A16207' },
  { id: 'practice-guess', type: 'practice', titleEn: 'Word Guess', titleVi: 'Đoán nghĩa ngữ cảnh', defaultUrl: '/image/practice/doan_nghia.webp', hasFile: true, bg: '#BBF7D0', border: '#16A34A', banner: '#15803D' },
  { id: 'practice-true-false', type: 'practice', titleEn: 'True / False', titleVi: 'Đúng hay Sai', defaultUrl: '/image/practice/dung_sai.webp', hasFile: true, bg: '#DDD6FE', border: '#7C3AED', banner: '#6D28D9' },
  { id: 'practice-write', type: 'practice', titleEn: 'Translation', titleVi: 'Viết & Dịch câu', defaultUrl: '/image/practice/viet_cau.webp', hasFile: true, bg: '#BAE6FD', border: '#0284C7', banner: '#0369A1' },
  { id: 'practice-mixed', type: 'practice', titleEn: 'Mixed Challenge', titleVi: 'Thử thách tổng hợp', defaultUrl: '/image/practice/tong_hop.webp', hasFile: true, bg: '#FCE7F3', border: '#DB2777', banner: '#BE185D' },
  { id: 'practice-speak-word', type: 'practice', titleEn: 'Read Aloud', titleVi: 'Đọc to phát âm', defaultUrl: '/image/practice/doc_to.webp', hasFile: true, bg: '#A7F3D0', border: '#059669', banner: '#047857' },
];

export default function AdminImageManager() {
  const [overrides, setOverrides] = useState(() => getImageOverrides());
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // all, subtopic, topic, minigame, practice
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // all, ready, pending, overridden

  // State cho Modal Chỉnh sửa / Thay ảnh
  const [editingItem, setEditingItem] = useState(null);
  const [editUrl, setEditUrl] = useState('');
  const [editTitleEn, setEditTitleEn] = useState('');
  const [editTitleVi, setEditTitleVi] = useState('');
  const [previewDataUrl, setPreviewDataUrl] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const fileInputRef = useRef(null);
  const importJsonRef = useRef(null);

  // Lắng nghe sự kiện override thay đổi
  useEffect(() => {
    function handleOverrideChange() {
      setOverrides(getImageOverrides());
    }
    window.addEventListener('cowdi-image-override-changed', handleOverrideChange);
    return () => window.removeEventListener('cowdi-image-override-changed', handleOverrideChange);
  }, []);

  // Tính toán số liệu thống kê
  const stats = useMemo(() => {
    const total = MASTER_IMAGE_ITEMS.length;
    const ready = MASTER_IMAGE_ITEMS.filter((item) => item.hasFile || overrides[item.id]?.url).length;
    const pending = total - ready;
    const customCount = Object.keys(overrides).length;
    return { total, ready, pending, customCount };
  }, [overrides]);

  // Lọc danh sách hiển thị
  const filteredItems = useMemo(() => {
    return MASTER_IMAGE_ITEMS.filter((item) => {
      // Lọc theo loại
      if (selectedType !== 'all' && item.type !== selectedType) return false;
      // Lọc theo chủ đề
      if (selectedTopic !== 'all' && item.topicId !== selectedTopic) return false;
      // Lọc theo trạng thái
      const isOverridden = Boolean(overrides[item.id]);
      const isReady = item.hasFile || isOverridden;
      if (statusFilter === 'ready' && !isReady) return false;
      if (statusFilter === 'pending' && isReady) return false;
      if (statusFilter === 'overridden' && !isOverridden) return false;

      // Tìm kiếm từ khóa
      if (search) {
        const q = search.toLowerCase();
        const curTitleEn = (overrides[item.id]?.titleEn || item.titleEn).toLowerCase();
        const curTitleVi = (overrides[item.id]?.titleVi || item.titleVi).toLowerCase();
        const curUrl = (overrides[item.id]?.url || item.defaultUrl).toLowerCase();
        const curId = item.id.toLowerCase();
        return curTitleEn.includes(q) || curTitleVi.includes(q) || curUrl.includes(q) || curId.includes(q);
      }

      return true;
    });
  }, [selectedType, selectedTopic, statusFilter, search, overrides]);

// Nén ảnh tự động để giảm dung lượng từ ~4MB xuống ~80KB, đảm bảo lưu trữ mượt mà không bị tràn bộ nhớ
function compressImage(file, maxWidth = 800, maxHeight = 1066) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Thử WebP trước để kích thước tối ưu nhất (~60-90KB)
        const webp = canvas.toDataURL('image/webp', 0.9);
        if (webp && webp.startsWith('data:image/webp') && webp.length < e.target.result.length) {
          resolve(webp);
        } else {
          const png = canvas.toDataURL('image/png');
          resolve(png.length < e.target.result.length ? png : e.target.result);
        }
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

  // Mở modal sửa ảnh
  function openEditModal(item) {
    const curOverride = overrides[item.id] || {};
    setEditingItem(item);
    setEditUrl(curOverride.url || item.defaultUrl);
    setEditTitleEn(curOverride.titleEn || item.titleEn);
    setEditTitleVi(curOverride.titleVi || item.titleVi);
    setPreviewDataUrl(curOverride.url || item.defaultUrl);
    setSelectedFileName(curOverride.url?.startsWith('data:') ? 'Ảnh tùy chỉnh đang nạp' : '');
  }

  // Xử lý chọn file từ máy tính (Tự động nén tối ưu)
  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh hợp lệ (.png, .jpg, .webp, .svg)!');
      return;
    }

    setSelectedFileName(`${file.name} (Đang nạp...)`);
    try {
      const dataUrl = await compressImage(file, 800, 1066);
      const sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);
      setPreviewDataUrl(dataUrl);
      setEditUrl(dataUrl);
      setSelectedFileName(`${file.name} (~${sizeKb} KB)`);
    } catch (err) {
      console.error('Lỗi xử lý ảnh:', err);
      alert('Lỗi nạp ảnh: ' + err.message);
    }
  }

  // Lưu thay đổi
  async function handleSaveEdit() {
    if (!editingItem) return;

    const isUrlChanged = editUrl !== editingItem.defaultUrl;
    const isTitleEnChanged = editTitleEn !== editingItem.titleEn;
    const isTitleViChanged = editTitleVi !== editingItem.titleVi;

    if (isUrlChanged || isTitleEnChanged || isTitleViChanged) {
      const ok = await setImageOverride(editingItem.id, {
        url: editUrl,
        titleEn: editTitleEn,
        titleVi: editTitleVi,
        title: editTitleEn,
      });
      if (!ok) {
        alert('Không thể lưu ảnh! Vui lòng thử lại.');
        return;
      }
    } else {
      await resetImageOverride(editingItem.id);
    }

    setEditingItem(null);
  }

  // Khôi phục 1 thẻ về mặc định
  function handleResetItem(id) {
    if (window.confirm('Khôi phục ảnh và tên của thẻ này về mặc định ban đầu?')) {
      resetImageOverride(id);
    }
  }

  // Xuất file cấu hình JSON (dùng Blob chuẩn để hỗ trợ cả base64 dung lượng lớn)
  function exportConfig() {
    try {
      const exportData = {
        appName: 'Cowdi English',
        version: '1.0',
        exportedAt: new Date().toISOString(),
        customOverridesCount: Object.keys(overrides).length,
        overrides: overrides,
        catalog: MASTER_IMAGE_ITEMS.map((item) => {
          const ov = overrides[item.id] || {};
          return {
            id: item.id,
            type: item.type,
            topicId: item.topicId,
            titleEn: ov.titleEn || item.titleEn,
            titleVi: ov.titleVi || item.titleVi,
            currentUrl: ov.url || item.defaultUrl,
            isCustomized: Boolean(overrides[item.id]),
          };
        }),
      };

      const jsonStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cowdi_image_overrides_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (err) {
      console.error('Lỗi xuất file JSON:', err);
      alert('Không thể xuất file JSON: ' + err.message);
    }
  }

  // Nhập file cấu hình JSON
  function handleImportJson(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const dataToApply = parsed.overrides || parsed;
        if (typeof dataToApply !== 'object' || dataToApply === null || Array.isArray(dataToApply)) {
          throw new Error('File JSON không đúng định dạng overrides.');
        }
        setAllImageOverrides(dataToApply);
        alert(`Đã nạp thành công ${Object.keys(dataToApply).length} mục cấu hình ảnh từ file JSON!`);
      } catch (err) {
        console.error('Lỗi nhập file JSON:', err);
        alert('Lỗi nhập file JSON: ' + err.message);
      } finally {
        if (importJsonRef.current) importJsonRef.current.value = '';
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="admin-image-manager py-3">
      {/* Header & Thống kê */}
      <div className="card shadow-sm border-0 mb-4 bg-white rounded-3">
        <div className="card-body p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
            <div>
              <h3 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                <span>🖼️</span> Quản lý & Thay đổi Tài nguyên Ảnh
              </h3>
              <p className="text-muted small mb-0">
                Khu vực chuyên biệt dành cho Quản trị viên: Tùy biến hình ảnh, upload ảnh từ máy tính hoặc đổi tên thẻ trong toàn hệ thống.
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button className="btn btn-primary btn-sm px-3 shadow-sm fw-semibold" onClick={exportConfig} title="Xuất file JSON sao lưu đầy đủ">
                <i className="fas fa-file-export me-1"></i> Xuất file JSON
              </button>
              <button
                className="btn btn-outline-primary btn-sm px-3 fw-semibold"
                onClick={() => importJsonRef.current?.click()}
                title="Nạp cấu hình từ file JSON đã lưu"
              >
                <i className="fas fa-file-import me-1"></i> Nhập file JSON
              </button>
              <input
                type="file"
                accept=".json,application/json"
                className="d-none"
                ref={importJsonRef}
                onChange={handleImportJson}
              />
              {stats.customCount > 0 && (
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => {
                    if (window.confirm(`Bạn có chắc muốn xóa TẤT CẢ ${stats.customCount} ảnh tùy chỉnh và quay về mặc định ban đầu?`)) {
                      resetAllImageOverrides();
                    }
                  }}
                >
                  <i className="fas fa-rotate-left me-1"></i> Khôi phục tất cả ({stats.customCount})
                </button>
              )}
            </div>
          </div>

          {/* Stat Cards */}
          <div className="row g-2 pt-2 border-top">
            <div className="col-6 col-md-3">
              <div className="p-2 rounded bg-light text-center">
                <div className="fs-5 fw-bold text-dark">{stats.total}</div>
                <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Tổng tài nguyên</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="p-2 rounded bg-success bg-opacity-10 text-center">
                <div className="fs-5 fw-bold text-success">{stats.ready}</div>
                <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Đã có ảnh</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="p-2 rounded bg-warning bg-opacity-10 text-center">
                <div className="fs-5 fw-bold text-warning">{stats.pending}</div>
                <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Đang chờ ảnh</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="p-2 rounded bg-primary bg-opacity-10 text-center">
                <div className="fs-5 fw-bold text-primary">{stats.customCount}</div>
                <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Ảnh đã tùy chỉnh</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bộ lọc & Tìm kiếm */}
      <div className="card shadow-sm border-0 mb-4 bg-white rounded-3">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            {/* Search */}
            <div className="col-md-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0">
                  <i className="fas fa-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Tìm theo tên thẻ, ID, file..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button className="btn btn-outline-secondary" onClick={() => setSearch('')}>
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Phân loại Type */}
            <div className="col-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  if (e.target.value !== 'subtopic' && e.target.value !== 'topic') {
                    setSelectedTopic('all');
                  }
                }}
              >
                <option value="all">📂 Tất cả phân loại</option>
                <option value="subtopic">🗂️ Thẻ con Subtopics (57)</option>
                <option value="topic">🌟 Thẻ chủ đề chính (13)</option>
                <option value="minigame">🎮 Thẻ Mini-game (6)</option>
                <option value="practice">📚 Thẻ Luyện tập (15)</option>
              </select>
            </div>

            {/* Chủ đề Topic (khi chọn subtopic hoặc topic) */}
            <div className="col-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
              >
                <option value="all">🌐 Mọi chủ đề</option>
                <option value="human">👤 Human (Con người)</option>
                <option value="eating">🍲 Eating (Ăn uống)</option>
                <option value="drinking">🥤 Drinking (Đồ uống)</option>
                <option value="house">🏠 House (Nhà cửa)</option>
                <option value="transportation">🚗 Transportation (Giao thông)</option>
                <option value="love">💖 Love (Tình yêu)</option>
                <option value="numbers">🔢 Numbers (Số đếm)</option>
                <option value="sports">⚽ Sports (Thể thao)</option>
                <option value="holidays">🎉 Holidays (Ngày lễ)</option>
                <option value="animals">🐾 Animals (Động vật)</option>
                <option value="nature">🌿 Nature (Thiên nhiên)</option>
                <option value="public-places">🏛️ Public Places (Nơi công cộng)</option>
                <option value="countries">🌍 Countries (Quốc gia)</option>
              </select>
            </div>

            {/* Trạng thái ảnh */}
            <div className="col-12 col-md-2">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="ready">✅ Đã có ảnh</option>
                <option value="pending">⏳ Đang chờ ảnh</option>
                <option value="overridden">✨ Đã tùy chỉnh</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách thẻ dạng Grid */}
      <div className="row g-3">
        {filteredItems.length === 0 ? (
          <div className="col-12 text-center py-5">
            <div className="fs-1 text-muted mb-2">🔍</div>
            <div className="fw-semibold text-muted">Không tìm thấy tài nguyên nào phù hợp với bộ lọc</div>
            <button
              className="btn btn-sm btn-outline-primary mt-2"
              onClick={() => {
                setSearch('');
                setSelectedType('all');
                setSelectedTopic('all');
                setStatusFilter('all');
              }}
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const curOverride = overrides[item.id];
            const isCustom = Boolean(curOverride);
            const activeUrl = curOverride?.url || item.defaultUrl;
            const activeTitleEn = curOverride?.titleEn || item.titleEn;
            const activeTitleVi = curOverride?.titleVi || item.titleVi;
            const isReady = item.hasFile || isCustom;

            return (
              <div className="col-6 col-md-4 col-lg-3 col-xl-2" key={item.id}>
                <div
                  className="card h-100 shadow-sm border-0 position-relative rounded-3 overflow-hidden d-flex flex-column"
                  style={{
                    backgroundColor: item.bg || '#F8FAFC',
                    border: `3px solid ${item.border || '#CBD5E1'}`,
                  }}
                >
                  {/* Badge trạng thái góc trên */}
                  <div className="position-absolute top-0 end-0 m-1 z-2">
                    {isCustom ? (
                      <span className="badge bg-primary shadow-sm" style={{ fontSize: '0.65rem' }}>
                        ✨ Tùy chỉnh
                      </span>
                    ) : isReady ? (
                      <span className="badge bg-success shadow-sm" style={{ fontSize: '0.65rem' }}>
                        ✅ Có ảnh
                      </span>
                    ) : (
                      <span className="badge bg-warning text-dark shadow-sm" style={{ fontSize: '0.65rem' }}>
                        ⏳ Chờ ảnh
                      </span>
                    )}
                  </div>

                  {/* Khung ảnh 3:4 */}
                  <div
                    className="position-relative w-100 bg-white d-flex align-items-center justify-content-center overflow-hidden"
                    style={{ aspectRatio: '3/4' }}
                  >
                    {isReady ? (
                      <img
                        src={activeUrl}
                        alt={activeTitleEn}
                        className="w-100 h-100"
                        style={{ objectFit: 'contain' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="text-center p-2 text-muted">
                        <div className="fs-2 mb-1">🖼️</div>
                        <div style={{ fontSize: '0.7rem' }}>Chưa có file</div>
                      </div>
                    )}
                  </div>

                  {/* Banner tiêu đề */}
                  <div
                    className="py-1 px-2 text-center text-white text-truncate fw-bold"
                    style={{
                      backgroundColor: item.banner || '#1E293B',
                      fontSize: '0.78rem',
                      letterSpacing: '0.3px',
                    }}
                  >
                    ◆ {activeTitleEn} ◆
                  </div>

                  {/* Footer thông tin */}
                  <div className="p-2 bg-white flex-grow-1 d-flex flex-column justify-content-between">
                    <div>
                      <div className="fw-semibold text-truncate text-dark small" title={activeTitleVi}>
                        {activeTitleVi}
                      </div>
                      <div className="text-muted font-monospace text-truncate" style={{ fontSize: '0.65rem' }} title={activeUrl}>
                        {activeUrl.replace('/image/', '')}
                      </div>
                    </div>

                    {/* Nút hành động */}
                    <div className="d-flex gap-1 mt-2 pt-1 border-top">
                      <button
                        className="btn btn-primary btn-sm flex-grow-1 py-1 px-1 fw-semibold"
                        style={{ fontSize: '0.72rem' }}
                        onClick={() => openEditModal(item)}
                      >
                        <i className="fas fa-edit me-1"></i> Đổi ảnh
                      </button>
                      {isCustom && (
                        <button
                          className="btn btn-outline-danger btn-sm py-1 px-2"
                          style={{ fontSize: '0.72rem' }}
                          onClick={() => handleResetItem(item.id)}
                          title="Khôi phục mặc định"
                        >
                          <i className="fas fa-undo"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Modal Đổi ảnh & Đổi tên (Kích thước ngang rộng rãi) ── */}
      {editingItem && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', zIndex: 1060 }}
          tabIndex="-1"
          onClick={() => setEditingItem(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: '880px', width: '95%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content shadow-lg border-0 rounded-4 overflow-hidden">
              <div className="modal-header bg-light border-bottom px-4 py-3">
                <div className="d-flex align-items-center gap-2">
                  <span className="fs-5">🖼️</span>
                  <div>
                    <h5 className="modal-title fw-bold text-dark mb-0 fs-6">
                      Chỉnh sửa thẻ: <span className="text-primary">{editingItem.titleEn}</span>
                    </h5>
                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                      Mã ID: <code>{editingItem.id}</code> | Chủ đề: <span className="text-dark fw-semibold">{editingItem.topicId}</span> | Loại: {editingItem.type}
                    </div>
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={() => setEditingItem(null)}></button>
              </div>

              <div className="modal-body p-4 bg-white">
                <div className="row g-4 align-items-start">
                  {/* Cột trái: Xem trước Preview chuẩn Trading Card 3:4 */}
                  <div className="col-12 col-md-5 col-lg-4 text-center">
                    <div className="fw-bold small text-muted text-uppercase mb-2" style={{ letterSpacing: '0.5px' }}>
                      Xem trước thực tế (3:4)
                    </div>

                    <div
                      className="topic-card-item shadow-sm mx-auto"
                      style={{
                        '--card-bg': editingItem.bg || '#FFF7ED',
                        '--card-border': editingItem.border || '#EA580C',
                        '--card-banner': editingItem.banner || '#C2410C',
                        maxWidth: '220px',
                        cursor: 'default',
                        pointerEvents: 'none',
                      }}
                    >
                      <div className="topic-card-frame">
                        {previewDataUrl ? (
                          <img
                            src={previewDataUrl}
                            alt="Preview"
                            className="topic-card-art"
                            onError={(e) => {
                              e.currentTarget.src = '';
                            }}
                          />
                        ) : (
                          <div className="h-100 d-flex align-items-center justify-content-center text-muted small">
                            Chưa có ảnh
                          </div>
                        )}
                      </div>

                      <div className="topic-card-banner">
                        <span className="topic-card-banner-decor">◆</span>
                        <span className="topic-card-banner-title">{editTitleEn || editingItem.titleEn}</span>
                        <span className="topic-card-banner-decor">◆</span>
                      </div>

                      <div className="topic-card-footer">
                        <div className="topic-card-footer-left">
                          <span className="topic-card-vi">{editTitleVi || editingItem.titleVi}</span>
                        </div>
                        <div className="topic-card-footer-right">
                          <span className="topic-card-count">+XP</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-muted small mt-2" style={{ fontSize: '0.72rem' }}>
                      Tỷ lệ dọc 3:4, nền pastel & banner màu đồng bộ.
                    </div>
                  </div>

                  {/* Cột phải: Form upload & nhập đường dẫn rộng rãi */}
                  <div className="col-12 col-md-7 col-lg-8 d-flex flex-column gap-3">
                    {/* Mục 1: Tải ảnh từ máy tính */}
                    <div className="p-3 border rounded-3 bg-light">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <label className="form-label fw-bold small text-dark mb-0 d-flex align-items-center gap-2">
                          <i className="fas fa-cloud-arrow-up text-primary fs-6"></i>
                          <span>Tải ảnh từ máy tính của bạn:</span>
                        </label>
                        <span className="badge bg-primary-subtle text-primary border" style={{ fontSize: '0.7rem' }}>
                          Khuyên dùng ảnh tỷ lệ 3:4
                        </span>
                      </div>

                      <div className="d-flex flex-wrap align-items-center gap-2">
                        <button
                          type="button"
                          className="btn btn-primary px-3 py-2 fw-semibold shadow-sm d-flex align-items-center gap-2"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <i className="fas fa-folder-open"></i>
                          <span>Chọn file ảnh từ máy...</span>
                        </button>

                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          className="d-none"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                        />

                        {selectedFileName ? (
                          <div className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 d-flex align-items-center gap-2">
                            <i className="fas fa-check-circle"></i>
                            <span className="text-truncate" style={{ maxWidth: '240px' }}>{selectedFileName}</span>
                          </div>
                        ) : (
                          <span className="text-muted small">Hỗ trợ các định dạng .png, .jpg, .webp</span>
                        )}
                      </div>

                      {editUrl.startsWith('data:') && (
                        <div className="mt-2 pt-2 border-top d-flex align-items-center justify-content-between">
                          <span className="text-success small fw-semibold">
                            <i className="fas fa-bolt me-1"></i> Đã nạp ảnh thành công (Dữ liệu Base64 sẵn sàng)
                          </span>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm py-1 px-2"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => {
                              setEditUrl(editingItem.defaultUrl);
                              setPreviewDataUrl(editingItem.defaultUrl);
                              setSelectedFileName('');
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                          >
                            <i className="fas fa-trash-can me-1"></i> Hủy ảnh vừa tải
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Mục 2: Nhập đường dẫn file (URL / Path) */}
                    <div>
                      <label className="form-label fw-bold small text-dark mb-1">
                        <i className="fas fa-link text-secondary me-1"></i> Hoặc nhập đường dẫn file (URL / Path):
                      </label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control font-monospace"
                          placeholder="/image/subtopics/..."
                          value={editUrl.startsWith('data:') ? '(Đang dùng ảnh tải lên từ máy tính)' : editUrl}
                          onChange={(e) => {
                            setEditUrl(e.target.value);
                            setPreviewDataUrl(e.target.value);
                          }}
                          disabled={editUrl.startsWith('data:')}
                        />
                        {!editUrl.startsWith('data:') && editUrl !== editingItem.defaultUrl && (
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            title="Quay lại đường dẫn gốc mặc định"
                            onClick={() => {
                              setEditUrl(editingItem.defaultUrl);
                              setPreviewDataUrl(editingItem.defaultUrl);
                            }}
                          >
                            <i className="fas fa-rotate-left me-1"></i> Mặc định
                          </button>
                        )}
                      </div>
                      <div className="text-muted small mt-1" style={{ fontSize: '0.72rem' }}>
                        Đường dẫn mặc định ban đầu: <code>{editingItem.defaultUrl}</code>
                      </div>
                    </div>

                    {/* Mục 3: Đổi tên Tiếng Anh & Tiếng Việt */}
                    <div className="pt-2 border-top">
                      <div className="row g-3">
                        <div className="col-12 col-sm-6">
                          <label className="form-label fw-bold small text-dark mb-1">
                            Tên Tiếng Anh (Banner giữa):
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={editTitleEn}
                            onChange={(e) => setEditTitleEn(e.target.value)}
                            placeholder={editingItem.titleEn}
                          />
                        </div>
                        <div className="col-12 col-sm-6">
                          <label className="form-label fw-bold small text-dark mb-1">
                            Tên Tiếng Việt (Chân thẻ):
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={editTitleVi}
                            onChange={(e) => setEditTitleVi(e.target.value)}
                            placeholder={editingItem.titleVi}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light px-4 py-3 d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm px-3"
                  onClick={() => {
                    resetImageOverride(editingItem.id);
                    setEditingItem(null);
                  }}
                  title="Xóa mọi tùy biến của thẻ này và quay lại mặc định"
                >
                  <i className="fas fa-rotate-left me-1"></i> Khôi phục gốc thẻ này
                </button>

                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-outline-secondary px-3" onClick={() => setEditingItem(null)}>
                    Hủy
                  </button>
                  <button type="button" className="btn btn-success px-4 fw-semibold shadow-sm" onClick={handleSaveEdit}>
                    <i className="fas fa-check me-1"></i> Lưu thay đổi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
