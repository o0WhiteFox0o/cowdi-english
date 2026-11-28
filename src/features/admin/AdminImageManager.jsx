import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Icon, { WEBP_ICONS, ICON_NAMES, EMOJI_ICON } from '../../components/Icon';
import Emoji from '../../components/Emoji';
import { VOCAB_TOPICS } from '../../data/vocab-topics';
import { ALL_LESSONS } from '../../data/lessons/index';
import {
  BACKGROUND_ITEMS,
  EFFECT_ITEMS,
  COSMETIC_RARITIES,
} from '../../../shared/cosmetics-data.js';
import { KEEP_RHYTHM_ITEMS } from '../../../shared/game-config.js';
import { REGIONS } from '../../../shared/regions.js';
import { HUMAN_CAST } from '../../../shared/human-cast.js';
import {
  getImageOverrides,
  syncServerMediaOverrides,
  uploadServerMedia,
  deleteServerMedia,
  wordMediaKey,
} from '../../utils/imageOverrides';

// ── Danh mục 86 thẻ Chủ đề, Nhóm con, Minigame & Luyện tập ──────────────────
const LEGACY_MASTER_ITEMS = [
  // Subtopics: Human
  { id: 'human-body', type: 'subtopic', topicId: 'human', titleEn: 'Body Parts', titleVi: 'Bộ phận cơ thể', defaultUrl: '/image/subtopics/human/body.webp' },
  { id: 'human-appearance', type: 'subtopic', topicId: 'human', titleEn: 'Appearance', titleVi: 'Ngoại hình', defaultUrl: '/image/subtopics/human/appearance.webp' },
  { id: 'human-personality', type: 'subtopic', topicId: 'human', titleEn: 'Personality', titleVi: 'Tính cách', defaultUrl: '/image/subtopics/human/personality.webp' },
  { id: 'human-emotions', type: 'subtopic', topicId: 'human', titleEn: 'Emotions', titleVi: 'Cảm xúc', defaultUrl: '/image/subtopics/human/emotions.webp' },
  { id: 'human-family', type: 'subtopic', topicId: 'human', titleEn: 'Family', titleVi: 'Gia đình', defaultUrl: '/image/subtopics/human/family.webp' },
  { id: 'human-lifecycle', type: 'subtopic', topicId: 'human', titleEn: 'Life Stages', titleVi: 'Giai đoạn sống', defaultUrl: '/image/subtopics/human/lifecycle.webp' },
  { id: 'human-more', type: 'subtopic', topicId: 'human', titleEn: 'More', titleVi: 'Mở rộng', defaultUrl: '/image/subtopics/human/more.webp' },
  // Eating
  { id: 'eating-fruits', type: 'subtopic', topicId: 'eating', titleEn: 'Fruits', titleVi: 'Trái cây', defaultUrl: '/image/subtopics/eating/fruits.webp' },
  { id: 'eating-vegetables', type: 'subtopic', topicId: 'eating', titleEn: 'Vegetables', titleVi: 'Rau củ', defaultUrl: '/image/subtopics/eating/vegetables.webp' },
  { id: 'eating-meat-seafood', type: 'subtopic', topicId: 'eating', titleEn: 'Meat & Seafood', titleVi: 'Thịt & Hải sản', defaultUrl: '/image/subtopics/eating/meat_seafood.webp' },
  { id: 'eating-cooking', type: 'subtopic', topicId: 'eating', titleEn: 'Cooking', titleVi: 'Nấu ăn & Gia vị', defaultUrl: '/image/subtopics/eating/cooking.webp' },
  { id: 'eating-meals', type: 'subtopic', topicId: 'eating', titleEn: 'Meals', titleVi: 'Bữa ăn & Món ăn', defaultUrl: '/image/subtopics/eating/meals.webp' },
  { id: 'eating-taste', type: 'subtopic', topicId: 'eating', titleEn: 'Taste', titleVi: 'Vị & Kết cấu', defaultUrl: '/image/subtopics/eating/taste.webp' },
  { id: 'eating-more', type: 'subtopic', topicId: 'eating', titleEn: 'More', titleVi: 'Mở rộng', defaultUrl: '/image/subtopics/eating/more.webp' },
  // Drinking
  { id: 'drinking-hot', type: 'subtopic', topicId: 'drinking', titleEn: 'Hot Drinks', titleVi: 'Đồ uống nóng', defaultUrl: '/image/subtopics/drinking/hot.webp' },
  { id: 'drinking-cold', type: 'subtopic', topicId: 'drinking', titleEn: 'Cold Drinks', titleVi: 'Đồ uống lạnh', defaultUrl: '/image/subtopics/drinking/cold.webp' },
  { id: 'drinking-dairy', type: 'subtopic', topicId: 'drinking', titleEn: 'Dairy & Milk', titleVi: 'Sữa & Chế phẩm', defaultUrl: '/image/subtopics/drinking/dairy.webp' },
  { id: 'drinking-actions', type: 'subtopic', topicId: 'drinking', titleEn: 'Drinking', titleVi: 'Hành động uống', defaultUrl: '/image/subtopics/drinking/actions.webp' },
  { id: 'drinking-more', type: 'subtopic', topicId: 'drinking', titleEn: 'More', titleVi: 'Mở rộng', defaultUrl: '/image/subtopics/drinking/more.webp' },
  // House
  { id: 'house-rooms', type: 'subtopic', topicId: 'house', titleEn: 'Rooms', titleVi: 'Các phòng', defaultUrl: '/image/subtopics/house/rooms.webp' },
  { id: 'house-furniture', type: 'subtopic', topicId: 'house', titleEn: 'Furniture', titleVi: 'Nội thất', defaultUrl: '/image/subtopics/house/furniture.webp' },
  { id: 'house-appliances', type: 'subtopic', topicId: 'house', titleEn: 'Appliances', titleVi: 'Thiết bị gia dụng', defaultUrl: '/image/subtopics/house/appliances.webp' },
  { id: 'house-chores', type: 'subtopic', topicId: 'house', titleEn: 'Housework', titleVi: 'Việc nhà', defaultUrl: '/image/subtopics/house/chores.webp' },
  { id: 'house-more', type: 'subtopic', topicId: 'house', titleEn: 'More', titleVi: 'Mở rộng', defaultUrl: '/image/subtopics/house/more.webp' },
  // Transportation
  { id: 'transport-vehicles', type: 'subtopic', topicId: 'transportation', titleEn: 'Vehicles', titleVi: 'Phương tiện', defaultUrl: '/image/subtopics/transportation/vehicles.webp' },
  { id: 'transport-road', type: 'subtopic', topicId: 'transportation', titleEn: 'Road Traffic', titleVi: 'Đường & Giao thông', defaultUrl: '/image/subtopics/transportation/road.webp' },
  { id: 'transport-actions', type: 'subtopic', topicId: 'transportation', titleEn: 'Travel', titleVi: 'Hành động đi lại', defaultUrl: '/image/subtopics/transportation/actions.webp' },
  { id: 'transportation-more', type: 'subtopic', topicId: 'transportation', titleEn: 'More', titleVi: 'Mở rộng', defaultUrl: '/image/subtopics/transportation/more.webp' },
  // Love
  { id: 'love-feelings', type: 'subtopic', topicId: 'love', titleEn: 'Feelings', titleVi: 'Cảm xúc yêu', defaultUrl: '/image/subtopics/love/feelings.webp' },
  { id: 'love-relationships', type: 'subtopic', topicId: 'love', titleEn: 'Relationships', titleVi: 'Mối quan hệ', defaultUrl: '/image/subtopics/love/relationships.webp' },
  { id: 'love-dating', type: 'subtopic', topicId: 'love', titleEn: 'Dating', titleVi: 'Hẹn hò & Kết hôn', defaultUrl: '/image/subtopics/love/dating.webp' },
  { id: 'love-more', type: 'subtopic', topicId: 'love', titleEn: 'More', titleVi: 'Mở rộng', defaultUrl: '/image/subtopics/love/more.webp' },
  // Numbers
  { id: 'numbers-basic', type: 'subtopic', topicId: 'numbers', titleEn: 'Cardinal', titleVi: 'Số đếm cơ bản', defaultUrl: '/image/subtopics/numbers/basic.webp' },
  { id: 'numbers-ordinal', type: 'subtopic', topicId: 'numbers', titleEn: 'Ordinal', titleVi: 'Số thứ tự', defaultUrl: '/image/subtopics/numbers/ordinal.webp' },
  { id: 'numbers-math', type: 'subtopic', topicId: 'numbers', titleEn: 'Math', titleVi: 'Toán & Đo lường', defaultUrl: '/image/subtopics/numbers/math.webp' },
  { id: 'numbers-more', type: 'subtopic', topicId: 'numbers', titleEn: 'More', titleVi: 'Mở rộng', defaultUrl: '/image/subtopics/numbers/more.webp' },
  // Sports
  { id: 'sports-types', type: 'subtopic', topicId: 'sports', titleEn: 'Sports', titleVi: 'Các môn thể thao', defaultUrl: '/image/subtopics/sports/types.webp' },
  { id: 'sports-actions', type: 'subtopic', topicId: 'sports', titleEn: 'Fitness', titleVi: 'Tập luyện & Dụng cụ', defaultUrl: '/image/subtopics/sports/actions.webp' },
  { id: 'sports-more', type: 'subtopic', topicId: 'sports', titleEn: 'More', titleVi: 'Mở rộng', defaultUrl: '/image/subtopics/sports/more.webp' },
  // Holidays
  { id: 'holidays-types', type: 'subtopic', topicId: 'holidays', titleEn: 'Holidays', titleVi: 'Các ngày lễ', defaultUrl: '/image/subtopics/holidays/types.webp' },
  { id: 'holidays-activities', type: 'subtopic', topicId: 'holidays', titleEn: 'Celebrations', titleVi: 'Hoạt động lễ hội', defaultUrl: '/image/subtopics/holidays/activities.webp' },
  { id: 'holidays-more', type: 'subtopic', topicId: 'holidays', titleEn: 'More', titleVi: 'Mở rộng', defaultUrl: '/image/subtopics/holidays/more.webp' },
  // Animals
  { id: 'animals-pets', type: 'subtopic', topicId: 'animals', titleEn: 'Pets & Farm', titleVi: 'Thú cưng & Gia súc', defaultUrl: '/image/subtopics/animals/pets.webp' },
  { id: 'animals-wild', type: 'subtopic', topicId: 'animals', titleEn: 'Wild Animals', titleVi: 'Động vật hoang dã', defaultUrl: '/image/subtopics/animals/wild.webp' },
  { id: 'animals-sea', type: 'subtopic', topicId: 'animals', titleEn: 'Sea Creatures', titleVi: 'Sinh vật biển', defaultUrl: '/image/subtopics/animals/sea.webp' },
  { id: 'animals-more', type: 'subtopic', topicId: 'animals', titleEn: 'More', titleVi: 'Mở rộng', defaultUrl: '/image/subtopics/animals/more.webp' },
  // Nature
  { id: 'nature-weather', type: 'subtopic', topicId: 'nature', titleEn: 'Weather', titleVi: 'Thời tiết', defaultUrl: '/image/subtopics/nature/weather.webp' },
  { id: 'nature-landscape', type: 'subtopic', topicId: 'nature', titleEn: 'Landscape', titleVi: 'Địa hình', defaultUrl: '/image/subtopics/nature/landscape.webp' },
  { id: 'nature-plants', type: 'subtopic', topicId: 'nature', titleEn: 'Plants & Trees', titleVi: 'Cây cối & Hoa', defaultUrl: '/image/subtopics/nature/plants.webp' },
  { id: 'nature-more', type: 'subtopic', topicId: 'nature', titleEn: 'More', titleVi: 'Mở rộng', defaultUrl: '/image/subtopics/nature/more.webp' },
  // Public Places
  { id: 'places-services', type: 'subtopic', topicId: 'public-places', titleEn: 'Services', titleVi: 'Dịch vụ & Tòa nhà', defaultUrl: '/image/subtopics/public-places/services.webp' },
  { id: 'places-shopping', type: 'subtopic', topicId: 'public-places', titleEn: 'Shopping', titleVi: 'Mua sắm & Ăn uống', defaultUrl: '/image/subtopics/public-places/shopping.webp' },
  { id: 'places-entertainment', type: 'subtopic', topicId: 'public-places', titleEn: 'Fun & Leisure', titleVi: 'Giải trí', defaultUrl: '/image/subtopics/public-places/entertainment.webp' },
  { id: 'public-places-more', type: 'subtopic', topicId: 'public-places', titleEn: 'More', titleVi: 'Mở rộng', defaultUrl: '/image/subtopics/public-places/more.webp' },
  // Countries
  { id: 'countries-asia', type: 'subtopic', topicId: 'countries', titleEn: 'Asia', titleVi: 'Châu Á', defaultUrl: '/image/subtopics/countries/asia.webp' },
  { id: 'countries-world', type: 'subtopic', topicId: 'countries', titleEn: 'Americas & Europe', titleVi: 'Châu Mỹ & Châu Âu', defaultUrl: '/image/subtopics/countries/world.webp' },
  { id: 'countries-language', type: 'subtopic', topicId: 'countries', titleEn: 'Languages', titleVi: 'Ngôn ngữ & Quốc tịch', defaultUrl: '/image/subtopics/countries/languages.webp' },
  { id: 'countries-more', type: 'subtopic', topicId: 'countries', titleEn: 'More', titleVi: 'Mở rộng', defaultUrl: '/image/subtopics/countries/more.webp' },
  // 13 Topics
  { id: 'topic-human', type: 'topic', topicId: 'human', titleEn: 'Human', titleVi: 'Con người', defaultUrl: '/image/topics/human.webp' },
  { id: 'topic-eating', type: 'topic', topicId: 'eating', titleEn: 'Eating', titleVi: 'Ăn uống', defaultUrl: '/image/topics/eating.webp' },
  { id: 'topic-drinking', type: 'topic', topicId: 'drinking', titleEn: 'Drinking', titleVi: 'Đồ uống', defaultUrl: '/image/topics/drinking.webp' },
  { id: 'topic-house', type: 'topic', topicId: 'house', titleEn: 'House', titleVi: 'Nhà cửa', defaultUrl: '/image/topics/house.webp' },
  { id: 'topic-transportation', type: 'topic', topicId: 'transportation', titleEn: 'Transport', titleVi: 'Giao thông', defaultUrl: '/image/topics/transportation.webp' },
  { id: 'topic-love', type: 'topic', topicId: 'love', titleEn: 'Love', titleVi: 'Tình yêu', defaultUrl: '/image/topics/love.webp' },
  { id: 'topic-numbers', type: 'topic', topicId: 'numbers', titleEn: 'Numbers', titleVi: 'Số đếm', defaultUrl: '/image/topics/numbers.webp' },
  { id: 'topic-sports', type: 'topic', topicId: 'sports', titleEn: 'Sports', titleVi: 'Thể thao', defaultUrl: '/image/topics/sports.webp' },
  { id: 'topic-holidays', type: 'topic', topicId: 'holidays', titleEn: 'Holidays', titleVi: 'Ngày lễ', defaultUrl: '/image/topics/holidays.webp' },
  { id: 'topic-animals', type: 'topic', topicId: 'animals', titleEn: 'Animals', titleVi: 'Động vật', defaultUrl: '/image/topics/animals.webp' },
  { id: 'topic-nature', type: 'topic', topicId: 'nature', titleEn: 'Nature', titleVi: 'Thiên nhiên', defaultUrl: '/image/topics/nature.webp' },
  { id: 'topic-public-places', type: 'topic', topicId: 'public-places', titleEn: 'Places', titleVi: 'Nơi công cộng', defaultUrl: '/image/topics/public-places.webp' },
  { id: 'topic-countries', type: 'topic', topicId: 'countries', titleEn: 'Countries', titleVi: 'Quốc gia', defaultUrl: '/image/topics/countries.webp' },
  // 6 Minigames
  { id: 'game-word-catch', type: 'minigame', titleEn: 'Word Catch', titleVi: 'Cowdi Bắt Từ', defaultUrl: '/image/minigames/minigame_cowdi_bat_tu.webp' },
  { id: 'game-sentence-puzzle', type: 'minigame', titleEn: 'Sentence', titleVi: 'Ghép câu', defaultUrl: '/image/minigames/minigame_ghep_cau.webp' },
  { id: 'game-memory-match', type: 'minigame', titleEn: 'Memory Match', titleVi: 'Lật thẻ nhớ', defaultUrl: '/image/minigames/minigame_lat_the_nho.webp' },
  { id: 'game-spelling-bee', type: 'minigame', titleEn: 'Spelling Bee', titleVi: 'Spelling Bee', defaultUrl: '/image/minigames/minigame_spelling_bee.webp' },
  { id: 'game-speed-match', type: 'minigame', titleEn: 'Speed Match', titleVi: 'Tốc độ ánh sáng', defaultUrl: '/image/minigames/minigame_toc_do_anh_sang.webp' },
  { id: 'game-word-scramble', type: 'minigame', titleEn: 'Scramble', titleVi: 'Xáo chữ', defaultUrl: '/image/minigames/minigame_xao_chu.webp' },
  // 15 Practice modes
  { id: 'practice-vocab', type: 'practice', titleEn: 'Vocab Review', titleVi: 'Từ vựng & Flashcard', defaultUrl: '/image/practice/tu_dien.webp' },
  { id: 'practice-grammar', type: 'practice', titleEn: 'Grammar', titleVi: 'Ngữ pháp cơ bản', defaultUrl: '/image/practice/ngu_phap.webp' },
  { id: 'practice-listening', type: 'practice', titleEn: 'Listening', titleVi: 'Luyện nghe hiểu', defaultUrl: '/image/practice/practice_nghe_hieu.webp' },
  { id: 'practice-sentences', type: 'practice', titleEn: 'Fill Sentence', titleVi: 'Hoàn thành câu', defaultUrl: '/image/practice/hoan_thanh_cau.webp' },
  { id: 'practice-dictation', type: 'practice', titleEn: 'Dictation', titleVi: 'Nghe chính tả', defaultUrl: '/image/practice/nghe_cau.webp' },
  { id: 'practice-matching', type: 'practice', titleEn: 'Word Match', titleVi: 'Nối cặp từ', defaultUrl: '/image/practice/noi_cap.webp' },
  { id: 'practice-fillin', type: 'practice', titleEn: 'Letter Puzzle', titleVi: 'Ghép chữ khuyết', defaultUrl: '/image/practice/ghep_chu.webp' },
  { id: 'practice-reorder', type: 'practice', titleEn: 'Reorder', titleVi: 'Sắp xếp trật tự câu', defaultUrl: '/image/practice/xap_xep_cau.webp' },
  { id: 'practice-noi-cau', type: 'practice', titleEn: 'Listen & Connect', titleVi: 'Nối câu', defaultUrl: '/image/practice/noi_cau.webp' },
  { id: 'practice-speed', type: 'practice', titleEn: 'Fast Reflex', titleVi: 'Phản xạ nói nhanh', defaultUrl: '/image/practice/phan_xa_noi.webp' },
  { id: 'practice-guess', type: 'practice', titleEn: 'Word Guess', titleVi: 'Đoán nghĩa ngữ cảnh', defaultUrl: '/image/practice/doan_nghia.webp' },
  { id: 'practice-true-false', type: 'practice', titleEn: 'True / False', titleVi: 'Đúng hay Sai', defaultUrl: '/image/practice/dung_sai.webp' },
  { id: 'practice-write', type: 'practice', titleEn: 'Translation', titleVi: 'Viết & Dịch câu', defaultUrl: '/image/practice/viet_cau.webp' },
  { id: 'practice-mixed', type: 'practice', titleEn: 'Mixed Challenge', titleVi: 'Thử thách tổng hợp', defaultUrl: '/image/practice/tong_hop.webp' },
  { id: 'practice-speak-word', type: 'practice', titleEn: 'Read Aloud', titleVi: 'Đọc to phát âm', defaultUrl: '/image/practice/doc_to.webp' },
];

const EXTRA_SHOP_BANNERS = [
  { key: 'shop:banner_cowdi', title: 'Banner chính Cowdi', subtitle: 'Banner đầu trang', defaultUrl: '/assets/images/banner/BG_Cowdi.png', group: 'banner' },
  { key: 'shop:event_cow6', title: 'Sự kiện · Cow 6', subtitle: 'Ảnh sự kiện', defaultUrl: '/assets/images/events/Cow 6.webp', group: 'event' },
  { key: 'shop:event_cowdi_write', title: 'Sự kiện · Cowdi Write', subtitle: 'Ảnh sự kiện', defaultUrl: '/assets/images/events/Cowdi_write.webp', group: 'event' },
  { key: 'shop:event_dad', title: 'Sự kiện · Dad', subtitle: 'Ảnh sự kiện', defaultUrl: '/assets/images/events/dad.webp', group: 'event' },
  { key: 'shop:event_group8', title: 'Sự kiện · Group 8', subtitle: 'Ảnh sự kiện', defaultUrl: '/assets/images/events/Group 8.webp', group: 'event' },
  { key: 'shop:event_group9', title: 'Sự kiện · Group 9', subtitle: 'Ảnh sự kiện', defaultUrl: '/assets/images/events/Group 9.webp', group: 'event' },
];

const STORY_SCENES = [
  { key: 'story:scene_classroom', title: 'Cảnh Lớp học', subtitle: 'scenes/classroom.webp', defaultUrl: '/image/scenes/classroom.webp', group: 'scene' },
  { key: 'story:scene_schoolyard', title: 'Cảnh Sân trường', subtitle: 'scenes/schoolyard.webp', defaultUrl: '/image/scenes/schoolyard.webp', group: 'scene' },
  { key: 'story:boss_fog', title: 'Sương mù Boss (F-06)', subtitle: 'boss/fog.svg', defaultUrl: '/image/boss/fog.svg', group: 'boss' },
];

const PAGE_SIZE = 24;

export default function AdminImageManager() {
  const { token } = useAuth();
  const [section, setSection] = useState('vocab'); // vocab | icons | shop | story | topics
  const [overrides, setOverrides] = useState(() => getImageOverrides());
  const [search, setSearch] = useState('');
  const [subFilter, setSubFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [uploadingKey, setUploadingKey] = useState(null);
  const [brokenUrls, setBrokenUrls] = useState({});
  const [toast, setToast] = useState(null);

  const showNotice = useCallback((text, tone = 'success') => {
    setToast({ text, tone });
    setTimeout(() => setToast(null), 2800);
  }, []);

  useEffect(() => {
    syncServerMediaOverrides(true).then(() => setOverrides(getImageOverrides()));
    const onChange = () => setOverrides(getImageOverrides());
    window.addEventListener('cowdi-image-override-changed', onChange);
    return () => window.removeEventListener('cowdi-image-override-changed', onChange);
  }, []);

  useEffect(() => {
    setPage(1);
    setSubFilter('all');
    setStatusFilter('all');
    setSearch('');
  }, [section]);

  useEffect(() => {
    setPage(1);
  }, [search, subFilter, statusFilter]);

  const handleUpload = async (key, category, file) => {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      showNotice('Ảnh vượt quá giới hạn 3 MB.', 'danger');
      return;
    }
    setUploadingKey(key);
    try {
      await uploadServerMedia(token, { key, category, file });
      setOverrides(getImageOverrides());
      setBrokenUrls((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      showNotice(`Đã lưu ảnh lên server cho "${key}"! Học sinh sẽ thấy ngay.`);
    } catch (err) {
      showNotice(err.message || 'Lỗi tải ảnh lên server.', 'danger');
    } finally {
      setUploadingKey(null);
    }
  };

  const handleDelete = async (key) => {
    setUploadingKey(key);
    try {
      await deleteServerMedia(token, key);
      setOverrides(getImageOverrides());
      showNotice(`Đã gỡ ảnh server của "${key}" (quay về mặc định / Emoji).`, 'warning');
    } catch (err) {
      showNotice(err.message || 'Lỗi gỡ ảnh.', 'danger');
    } finally {
      setUploadingKey(null);
    }
  };

  // ── 1. Xây danh sách Flashcard Từ vựng (VOCAB_TOPICS + ALL_LESSONS) ───────
  const vocabCatalog = useMemo(() => {
    const map = new Map();
    for (const topic of VOCAB_TOPICS) {
      for (const sub of topic.subtopics || []) {
        for (const w of sub.words || []) {
          const key = wordMediaKey(w.word);
          if (!key || map.has(key)) continue;
          map.set(key, {
            key,
            word: w.word,
            meaning: w.meaning || '',
            phonetic: w.phonetic || '',
            emoji: w.illustration || w.emoji || '📘',
            staticImg: w.image || w.img || null,
            groupId: topic.id,
            groupLabel: topic.titleVi || topic.title || topic.id,
            subLabel: sub.titleVi || sub.title || sub.id,
          });
        }
      }
    }
    for (const lesson of ALL_LESSONS || []) {
      for (const w of lesson.vocabulary || []) {
        const key = wordMediaKey(w.word);
        if (!key || map.has(key)) continue;
        map.set(key, {
          key,
          word: w.word,
          meaning: w.meaning || '',
          phonetic: w.phonetic || '',
          emoji: w.illustration || w.emoji || '📖',
          staticImg: w.image || w.img || null,
          groupId: 'lessons',
          groupLabel: `Bài học (${lesson.level || 'starter'})`,
          subLabel: lesson.title || lesson.id,
        });
      }
    }
    return Array.from(map.values());
  }, []);

  // ── 2. Xây danh sách Icon UI & Emoji ──────────────────────────────────────
  const iconCatalog = useMemo(() => {
    const allNames = Array.from(new Set([...Object.keys(WEBP_ICONS), ...ICON_NAMES]));
    const reverseEmoji = {};
    for (const [emo, icName] of Object.entries(EMOJI_ICON || {})) {
      if (!reverseEmoji[icName]) reverseEmoji[icName] = [];
      reverseEmoji[icName].push(emo);
    }
    return allNames.map((name) => {
      const key = `icon:${name}`;
      const staticWebp = WEBP_ICONS[name] || null;
      const hasSvg = ICON_NAMES.includes(name);
      return {
        key,
        name,
        staticWebp,
        hasSvg,
        mappedEmojis: reverseEmoji[name] || [],
      };
    });
  }, []);

  // ── 3. Xây danh sách Cửa hàng, Sảnh nền & Sự kiện ─────────────────────────
  const shopCatalog = useMemo(() => {
    const items = [];
    for (const bg of BACKGROUND_ITEMS) {
      items.push({
        key: `cosmetic:${bg.id}`,
        id: bg.id,
        title: bg.name,
        subtitle: `Nền sảnh · ${(COSMETIC_RARITIES[bg.rarity]?.label || bg.rarity)} · ${bg.note || ''}`,
        emoji: bg.emoji || '🖼️',
        bgStyle: bg.bgStyle || '#f1f5f9',
        defaultUrl: bg.bgImage || null,
        group: 'room',
        category: 'cosmetic',
      });
    }
    for (const eff of EFFECT_ITEMS) {
      items.push({
        key: `cosmetic:${eff.id}`,
        id: eff.id,
        title: eff.name,
        subtitle: `Hào quang · ${(COSMETIC_RARITIES[eff.rarity]?.label || eff.rarity)} · ${eff.note || ''}`,
        emoji: eff.emoji || '✨',
        bgStyle: eff.bgStyle || '#faf5ff',
        defaultUrl: eff.image || null,
        group: 'effect',
        category: 'cosmetic',
      });
    }
    const rhythmIconMap = {
      freeze: '/image/icons-ui/shop_freeze_scarf.webp',
      returnTicket: '/image/icons-ui/shop_return_ticket.webp',
      contract: '/image/icons-ui/shop_contract.webp',
      clock: '/image/icons-ui/shop_study_clock.webp',
    };
    for (const [id, item] of Object.entries(KEEP_RHYTHM_ITEMS || {})) {
      items.push({
        key: `shop:${id}`,
        id,
        title: item.nameVi || item.name || id,
        subtitle: `Vật phẩm Giữ nhịp · ${item.priceMilk ? `${item.priceMilk} Sữa` : ''}`,
        emoji: item.emoji || '🛍️',
        bgStyle: '#fff7ed',
        defaultUrl: rhythmIconMap[id] || null,
        group: 'rhythm',
        category: 'shop',
      });
    }
    for (const b of EXTRA_SHOP_BANNERS) {
      items.push({
        key: b.key,
        id: b.key,
        title: b.title,
        subtitle: b.subtitle,
        emoji: '🎨',
        bgStyle: '#f8fafc',
        defaultUrl: b.defaultUrl,
        group: b.group,
        category: 'shop',
      });
    }
    return items;
  }, []);

  // ── 4. Xây danh sách Story S2 & Bài học ───────────────────────────────────
  const storyCatalog = useMemo(() => {
    const items = [];
    for (const [id, npc] of Object.entries(HUMAN_CAST || {})) {
      items.push({
        key: `story:npc_${id}`,
        title: npc.name || id,
        subtitle: `NPC · ${npc.role || ''} (${id}.webp)`,
        defaultUrl: `/image/npc/${id}.webp`,
        group: 'npc',
      });
    }
    for (const [code, region] of Object.entries(REGIONS || {})) {
      items.push({
        key: `story:region_${code}_fog`,
        title: `${region.nameVi || code} (Sáng sương)`,
        subtitle: `Vùng đất ${code} · ${code}-sang-suong.webp`,
        defaultUrl: `/image/regions/${code}-sang-suong.webp`,
        group: 'region',
      });
    }
    for (const sc of STORY_SCENES) {
      items.push(sc);
    }
    return items;
  }, []);

  // ── Thống kê tổng cho các tab ─────────────────────────────────────────────
  const summaryStats = useMemo(() => {
    const vocabWithImg = vocabCatalog.filter((w) => Boolean(overrides[w.key]?.url || w.staticImg)).length;
    const iconsWithWebp = iconCatalog.filter((ic) => Boolean(overrides[ic.key]?.url || ic.staticWebp)).length;
    const iconsSvgOnly = iconCatalog.length - iconsWithWebp;
    const shopUploaded = shopCatalog.filter((s) => Boolean(overrides[s.key]?.url)).length;
    const serverTotal = Object.values(overrides).filter((v) => v?.source === 'server').length;
    return {
      vocabTotal: vocabCatalog.length,
      vocabWithImg,
      vocabEmojiOnly: vocabCatalog.length - vocabWithImg,
      iconsTotal: iconCatalog.length,
      iconsWithWebp,
      iconsSvgOnly,
      shopTotal: shopCatalog.length,
      shopUploaded,
      storyTotal: storyCatalog.length,
      topicsTotal: LEGACY_MASTER_ITEMS.length,
      serverTotal,
    };
  }, [vocabCatalog, iconCatalog, shopCatalog, storyCatalog, overrides]);

  // ── Lọc danh sách theo tab hiện tại ───────────────────────────────────────
  const activeItems = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (section === 'vocab') {
      return vocabCatalog.filter((w) => {
        if (subFilter !== 'all' && w.groupId !== subFilter) return false;
        const hasImg = Boolean(overrides[w.key]?.url || w.staticImg);
        if (statusFilter === 'has_img' && !hasImg) return false;
        if (statusFilter === 'emoji_only' && hasImg) return false;
        if (q && !w.word.toLowerCase().includes(q) && !w.meaning.toLowerCase().includes(q) && !w.groupLabel.toLowerCase().includes(q)) {
          return false;
        }
        return true;
      });
    }

    if (section === 'icons') {
      return iconCatalog.filter((ic) => {
        const hasWebp = Boolean(overrides[ic.key]?.url || ic.staticWebp);
        if (statusFilter === 'webp' && !hasWebp) return false;
        if (statusFilter === 'svg_only' && hasWebp) return false;
        if (statusFilter === 'has_emoji' && ic.mappedEmojis.length === 0) return false;
        if (q && !ic.name.toLowerCase().includes(q) && !ic.mappedEmojis.join(' ').includes(q)) {
          return false;
        }
        return true;
      });
    }

    if (section === 'shop') {
      return shopCatalog.filter((item) => {
        if (subFilter !== 'all' && item.group !== subFilter) return false;
        const hasServerImg = Boolean(overrides[item.key]?.url);
        const hasStaticOk = Boolean(item.defaultUrl && !brokenUrls[item.key]);
        if (statusFilter === 'has_img' && !hasServerImg && !hasStaticOk) return false;
        if (statusFilter === 'no_img' && (hasServerImg || hasStaticOk)) return false;
        if (q && !item.title.toLowerCase().includes(q) && !item.id.toLowerCase().includes(q) && !item.subtitle.toLowerCase().includes(q)) {
          return false;
        }
        return true;
      });
    }

    if (section === 'story') {
      return storyCatalog.filter((item) => {
        if (subFilter !== 'all' && item.group !== subFilter) return false;
        const isBroken = Boolean(brokenUrls[item.key]) && !overrides[item.key]?.url;
        if (statusFilter === 'missing' && !isBroken) return false;
        if (q && !item.title.toLowerCase().includes(q) && !item.subtitle.toLowerCase().includes(q)) return false;
        return true;
      });
    }

    // topics (nhóm cũ)
    return LEGACY_MASTER_ITEMS.filter((item) => {
      if (subFilter !== 'all' && item.type !== subFilter) return false;
      const isOverridden = Boolean(overrides[item.id]?.url);
      const isBroken = Boolean(brokenUrls[item.id]) && !isOverridden;
      if (statusFilter === 'overridden' && !isOverridden) return false;
      if (statusFilter === 'missing' && !isBroken) return false;
      if (q && !item.titleVi.toLowerCase().includes(q) && !item.titleEn.toLowerCase().includes(q) && !item.id.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [section, search, subFilter, statusFilter, vocabCatalog, iconCatalog, shopCatalog, storyCatalog, overrides, brokenUrls]);

  const totalPages = Math.max(1, Math.ceil(activeItems.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = activeItems.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="fade-in">
      {toast && (
        <div
          className={`alert alert-${toast.tone === 'danger' ? 'danger' : toast.tone === 'warning' ? 'warning' : 'success'} position-fixed shadow`}
          style={{ bottom: 20, right: 20, zIndex: 1080, maxWidth: 420 }}
          role="status"
        >
          {toast.text}
        </div>
      )}

      {/* Header & Tổng quan lưu trữ server */}
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
        <div>
          <h4 className="fw-bold mb-1">🖼️ Trung tâm Quản lý Hình ảnh &amp; Media (Lưu Server)</h4>
          <p className="text-muted small mb-0">
            Tải ảnh lên trực tiếp server (PNG/WebP/JPG ≤ 3 MB) — học sinh thấy ngay không cần build lại.
            Từ vựng &amp; vật phẩm <strong>chưa có ảnh sẽ tự hiện Emoji</strong>.
          </p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2">
            ☁️ {summaryStats.serverTotal} ảnh đang lưu trên server
          </span>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => syncServerMediaOverrides(true).then(() => {
              setOverrides(getImageOverrides());
              showNotice('Đã đồng bộ lại danh sách ảnh từ server.');
            })}
          >
            🔄 Đồng bộ
          </button>
        </div>
      </div>

      {/* 5 Tab chính */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        {[
          { id: 'vocab', label: `📚 Flashcard Từ vựng (${summaryStats.vocabWithImg}/${summaryStats.vocabTotal})` },
          { id: 'icons', label: `🎨 Icon UI & Emoji (${summaryStats.iconsWithWebp} WebP · ${summaryStats.iconsSvgOnly} SVG)` },
          { id: 'shop', label: `🛍️ Cửa hàng, Sảnh & Sự kiện (${summaryStats.shopTotal})` },
          { id: 'story', label: `🗺️ Story & Bài học (${summaryStats.storyTotal})` },
          { id: 'topics', label: `🗂️ Chủ đề & Minigame (${summaryStats.topicsTotal})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`btn btn-sm fw-bold rounded-pill px-3 ${
              section === tab.id ? 'btn-primary' : 'btn-outline-secondary'
            }`}
            onClick={() => setSection(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Thanh tìm kiếm & lọc */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body py-2 px-3 d-flex flex-wrap gap-2 align-items-center">
          <input
            type="search"
            className="form-control form-control-sm"
            style={{ maxWidth: 260 }}
            placeholder={
              section === 'vocab'
                ? 'Tìm từ tiếng Anh, nghĩa tiếng Việt...'
                : section === 'icons'
                  ? 'Tìm tên icon (vd: fire, star, res_milk)...'
                  : 'Tìm theo tên hoặc mã...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Bộ lọc con theo tab */}
          {section === 'vocab' && (
            <>
              <select
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={subFilter}
                onChange={(e) => setSubFilter(e.target.value)}
              >
                <option value="all">Tất cả chủ đề ({summaryStats.vocabTotal} từ)</option>
                {VOCAB_TOPICS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.titleVi || t.title}
                  </option>
                ))}
                <option value="lessons">Từ vựng trong Bài học</option>
              </select>
              <select
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Mọi trạng thái</option>
                <option value="emoji_only">Còn dùng Emoji ({summaryStats.vocabEmojiOnly})</option>
                <option value="has_img">Đã có ảnh Flashcard ({summaryStats.vocabWithImg})</option>
              </select>
            </>
          )}

          {section === 'icons' && (
            <div className="d-flex flex-wrap gap-1">
              {[
                { id: 'all', label: `Tất cả (${summaryStats.iconsTotal})` },
                { id: 'webp', label: `✅ Có WebP (${summaryStats.iconsWithWebp})` },
                { id: 'svg_only', label: `✏️ Còn SVG vẽ tay (${summaryStats.iconsSvgOnly})` },
                { id: 'has_emoji', label: '😀 Có ánh xạ Emoji' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`btn btn-sm ${statusFilter === f.id ? 'btn-dark' : 'btn-outline-secondary'}`}
                  onClick={() => setStatusFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {section === 'shop' && (
            <>
              <select
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={subFilter}
                onChange={(e) => setSubFilter(e.target.value)}
              >
                <option value="all">Tất cả ({summaryStats.shopTotal})</option>
                <option value="room">Nền sảnh ({BACKGROUND_ITEMS.length})</option>
                <option value="effect">Hào quang / Hiệu ứng ({EFFECT_ITEMS.length})</option>
                <option value="rhythm">Vật phẩm Giữ nhịp ({Object.keys(KEEP_RHYTHM_ITEMS || {}).length})</option>
                <option value="banner">Banner chính</option>
                <option value="event">Ảnh sự kiện</option>
              </select>
              <select
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Mọi trạng thái</option>
                <option value="no_img">Chưa có ảnh (còn Emoji / lỗi 404)</option>
                <option value="has_img">Đã có ảnh</option>
              </select>
            </>
          )}

          {section === 'story' && (
            <div className="d-flex flex-wrap gap-1">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'npc', label: 'Nhân vật NPC' },
                { id: 'region', label: 'Vùng đất (Regions)' },
                { id: 'scene', label: 'Cảnh nền' },
                { id: 'boss', label: 'Boss Sương' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`btn btn-sm ${subFilter === f.id ? 'btn-dark' : 'btn-outline-secondary'}`}
                  onClick={() => setSubFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {section === 'topics' && (
            <div className="d-flex flex-wrap gap-1">
              {[
                { id: 'all', label: 'Tất cả (86)' },
                { id: 'topic', label: 'Chủ đề (13)' },
                { id: 'subtopic', label: 'Nhóm con (52)' },
                { id: 'minigame', label: 'Minigame (6)' },
                { id: 'practice', label: 'Luyện tập (15)' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`btn btn-sm ${subFilter === f.id ? 'btn-dark' : 'btn-outline-secondary'}`}
                  onClick={() => setSubFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          <span className="ms-auto small text-muted">
            Hiển thị <strong>{activeItems.length}</strong> mục
          </span>
        </div>
      </div>

      {/* Lưới hiển thị thẻ */}
      <div className="row g-3">
        {section === 'vocab' && pageItems.map((w) => {
          const serverUrl = overrides[w.key]?.url || null;
          const imgUrl = serverUrl || w.staticImg;
          const isBusy = uploadingKey === w.key;
          return (
            <div key={w.key} className="col-6 col-sm-4 col-md-3 col-lg-2">
              <div className={`card h-100 shadow-xs border ${imgUrl ? 'border-success' : 'border-warning-subtle'}`}>
                <div className="card-body p-2 d-flex flex-column text-center">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className={`badge ${imgUrl ? 'bg-success' : 'bg-warning text-dark'}`} style={{ fontSize: '0.66rem' }}>
                      {imgUrl ? '✓ Có ảnh' : '😀 Emoji'}
                    </span>
                    <span className="text-muted text-truncate" style={{ fontSize: '0.66rem', maxWidth: 85 }} title={w.groupLabel}>
                      {w.groupLabel}
                    </span>
                  </div>
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center mx-auto my-1 bg-light"
                    style={{ width: 84, height: 84, overflow: 'hidden' }}
                  >
                    {imgUrl ? (
                      <img src={imgUrl} alt={w.word} style={{ width: '100%', height: '100%', objectFit: 'contain' }} loading="lazy" />
                    ) : (
                      <Emoji e={w.emoji} size={44} />
                    )}
                  </div>
                  <div className="fw-bold text-truncate" title={w.word}>{w.word}</div>
                  <div className="small text-muted text-truncate mb-2" title={w.meaning}>{w.meaning}</div>
                  <div className="mt-auto d-flex gap-1">
                    <label className={`btn btn-sm flex-grow-1 ${imgUrl ? 'btn-outline-primary' : 'btn-primary'} py-1`} style={{ fontSize: '0.72rem', cursor: 'pointer' }}>
                      {isBusy ? 'Đang tải...' : imgUrl ? 'Đổi ảnh' : '📤 Tải ảnh'}
                      <input
                        type="file"
                        accept="image/png,image/webp,image/jpeg"
                        hidden
                        disabled={isBusy}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = '';
                          if (f) handleUpload(w.key, 'vocab', f);
                        }}
                      />
                    </label>
                    {serverUrl && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger py-1 px-2"
                        style={{ fontSize: '0.72rem' }}
                        title="Gỡ ảnh server để quay về Emoji"
                        disabled={isBusy}
                        onClick={() => handleDelete(w.key)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {section === 'icons' && pageItems.map((ic) => {
          const serverUrl = overrides[ic.key]?.url || null;
          const hasWebp = Boolean(serverUrl || ic.staticWebp);
          const isBusy = uploadingKey === ic.key;
          return (
            <div key={ic.key} className="col-6 col-sm-4 col-md-3 col-lg-2">
              <div className={`card h-100 shadow-xs border ${hasWebp ? 'border-success' : 'border-secondary-subtle'}`}>
                <div className="card-body p-2 d-flex flex-column text-center">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className={`badge ${serverUrl ? 'bg-primary' : hasWebp ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: '0.66rem' }}>
                      {serverUrl ? '☁️ Server' : hasWebp ? '✓ WebP' : '✏️ SVG'}
                    </span>
                    {ic.mappedEmojis.length > 0 && (
                      <span title={`Ánh xạ từ emoji: ${ic.mappedEmojis.join(' ')}`} style={{ fontSize: '0.8rem' }}>
                        {ic.mappedEmojis.slice(0, 2).join('')}
                      </span>
                    )}
                  </div>
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center mx-auto my-2 bg-light"
                    style={{ width: 64, height: 64 }}
                  >
                    <Icon name={ic.name} size={42} />
                  </div>
                  <code className="small fw-bold text-truncate mb-1" title={ic.name}>{ic.name}</code>
                  <div className="text-muted text-truncate mb-2" style={{ fontSize: '0.68rem' }}>
                    {ic.mappedEmojis.length > 0
                      ? `Emoji: ${ic.mappedEmojis.slice(0, 4).join(' ')}`
                      : 'Chỉ dùng <Icon />'}
                  </div>
                  <div className="mt-auto d-flex gap-1">
                    <label className={`btn btn-sm flex-grow-1 ${hasWebp ? 'btn-outline-primary' : 'btn-primary'} py-1`} style={{ fontSize: '0.72rem', cursor: 'pointer' }}>
                      {isBusy ? '...' : hasWebp ? 'Đổi WebP' : '📤 Up WebP'}
                      <input
                        type="file"
                        accept="image/png,image/webp,image/jpeg"
                        hidden
                        disabled={isBusy}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = '';
                          if (f) handleUpload(ic.key, 'icon', f);
                        }}
                      />
                    </label>
                    {serverUrl && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger py-1 px-2"
                        style={{ fontSize: '0.72rem' }}
                        title="Xoá ảnh server (về mặc định)"
                        disabled={isBusy}
                        onClick={() => handleDelete(ic.key)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {section === 'shop' && pageItems.map((item) => {
          const serverUrl = overrides[item.key]?.url || null;
          const activeUrl = serverUrl || (!brokenUrls[item.key] ? item.defaultUrl : null);
          const isBusy = uploadingKey === item.key;
          return (
            <div key={item.key} className="col-6 col-sm-4 col-md-3">
              <div className={`card h-100 shadow-xs border ${activeUrl ? 'border-success' : 'border-warning'}`}>
                <div className="card-body p-2 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className={`badge ${serverUrl ? 'bg-primary' : activeUrl ? 'bg-success' : 'bg-warning text-dark'}`} style={{ fontSize: '0.68rem' }}>
                      {serverUrl ? '☁️ Ảnh server' : activeUrl ? '✓ Có ảnh' : '😀 Còn Emoji / Thiếu ảnh'}
                    </span>
                    <code style={{ fontSize: '0.66rem' }}>{item.id}</code>
                  </div>
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center my-1 overflow-hidden"
                    style={{ height: 108, background: item.bgStyle || '#f8fafc', border: '1px solid #e2e8f0' }}
                  >
                    {activeUrl ? (
                      <img
                        src={activeUrl}
                        alt={item.title}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: item.group === 'room' || item.group === 'banner' ? 'cover' : 'contain' }}
                        onError={() => setBrokenUrls((p) => ({ ...p, [item.key]: true }))}
                      />
                    ) : (
                      <div className="text-center">
                        <Emoji e={item.emoji} size={42} />
                        <div className="small text-muted" style={{ fontSize: '0.68rem' }}>Chưa có ảnh</div>
                      </div>
                    )}
                  </div>
                  <div className="fw-bold small text-truncate" title={item.title}>{item.title}</div>
                  <div className="text-muted text-truncate mb-2" style={{ fontSize: '0.72rem' }} title={item.subtitle}>
                    {item.subtitle}
                  </div>
                  <div className="mt-auto d-flex gap-1">
                    <label className="btn btn-sm btn-outline-primary flex-grow-1 py-1" style={{ fontSize: '0.74rem', cursor: 'pointer' }}>
                      {isBusy ? 'Đang tải...' : '📤 Tải ảnh lên server'}
                      <input
                        type="file"
                        accept="image/png,image/webp,image/jpeg"
                        hidden
                        disabled={isBusy}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = '';
                          if (f) handleUpload(item.key, item.category || 'shop', f);
                        }}
                      />
                    </label>
                    {serverUrl && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger py-1 px-2"
                        style={{ fontSize: '0.74rem' }}
                        disabled={isBusy}
                        onClick={() => handleDelete(item.key)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {section === 'story' && pageItems.map((item) => {
          const serverUrl = overrides[item.key]?.url || null;
          const activeUrl = serverUrl || (!brokenUrls[item.key] ? item.defaultUrl : null);
          const isBusy = uploadingKey === item.key;
          return (
            <div key={item.key} className="col-6 col-sm-4 col-md-3">
              <div className={`card h-100 shadow-xs border ${activeUrl ? 'border-success' : 'border-danger'}`}>
                <div className="card-body p-2 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className={`badge ${serverUrl ? 'bg-primary' : activeUrl ? 'bg-success' : 'bg-danger'}`} style={{ fontSize: '0.68rem' }}>
                      {serverUrl ? '☁️ Server' : activeUrl ? '✓ Có ảnh' : '⚠️ Thiếu file'}
                    </span>
                    <span className="small text-muted">{item.group}</span>
                  </div>
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center my-1 bg-light overflow-hidden"
                    style={{ height: 112 }}
                  >
                    {activeUrl ? (
                      <img
                        src={activeUrl}
                        alt={item.title}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: item.group === 'npc' ? 'contain' : 'cover' }}
                        onError={() => setBrokenUrls((p) => ({ ...p, [item.key]: true }))}
                      />
                    ) : (
                      <div className="text-danger small fw-semibold text-center px-2">Chưa có file ảnh</div>
                    )}
                  </div>
                  <div className="fw-bold small text-truncate">{item.title}</div>
                  <div className="text-muted text-truncate mb-2" style={{ fontSize: '0.7rem' }}>{item.subtitle}</div>
                  <div className="mt-auto d-flex gap-1">
                    <label className="btn btn-sm btn-outline-primary flex-grow-1 py-1" style={{ fontSize: '0.74rem', cursor: 'pointer' }}>
                      {isBusy ? 'Đang tải...' : '📤 Đổi / Bổ sung ảnh'}
                      <input
                        type="file"
                        accept="image/png,image/webp,image/jpeg"
                        hidden
                        disabled={isBusy}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = '';
                          if (f) handleUpload(item.key, 'story', f);
                        }}
                      />
                    </label>
                    {serverUrl && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger py-1 px-2"
                        style={{ fontSize: '0.74rem' }}
                        disabled={isBusy}
                        onClick={() => handleDelete(item.key)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {section === 'topics' && pageItems.map((item) => {
          const serverUrl = overrides[item.id]?.url || null;
          const activeUrl = serverUrl || (!brokenUrls[item.id] ? item.defaultUrl : null);
          const isBusy = uploadingKey === item.id;
          return (
            <div key={item.id} className="col-6 col-sm-4 col-md-3">
              <div className={`card h-100 shadow-xs border ${activeUrl ? 'border-success' : 'border-danger'}`}>
                <div className="card-body p-2 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className={`badge ${serverUrl ? 'bg-primary' : activeUrl ? 'bg-success' : 'bg-danger'}`} style={{ fontSize: '0.68rem' }}>
                      {serverUrl ? '☁️ Server' : activeUrl ? '✓ Có ảnh' : '⚠️ Thiếu file'}
                    </span>
                    <span className="small text-muted">{item.type}</span>
                  </div>
                  <div className="rounded-3 d-flex align-items-center justify-content-center my-1 bg-light overflow-hidden" style={{ height: 100 }}>
                    {activeUrl ? (
                      <img
                        src={activeUrl}
                        alt={item.titleVi}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={() => setBrokenUrls((p) => ({ ...p, [item.id]: true }))}
                      />
                    ) : (
                      <div className="text-danger small fw-semibold">Ảnh 404 / Chưa có</div>
                    )}
                  </div>
                  <div className="fw-bold small text-truncate">{item.titleVi}</div>
                  <div className="text-muted text-truncate mb-2" style={{ fontSize: '0.7rem' }}>{item.titleEn} · <code>{item.id}</code></div>
                  <div className="mt-auto d-flex gap-1">
                    <label className="btn btn-sm btn-outline-primary flex-grow-1 py-1" style={{ fontSize: '0.74rem', cursor: 'pointer' }}>
                      {isBusy ? 'Đang tải...' : '📤 Đổi ảnh (Server)'}
                      <input
                        type="file"
                        accept="image/png,image/webp,image/jpeg"
                        hidden
                        disabled={isBusy}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = '';
                          if (f) handleUpload(item.id, item.type || 'topic', f);
                        }}
                      />
                    </label>
                    {serverUrl && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger py-1 px-2"
                        style={{ fontSize: '0.74rem' }}
                        disabled={isBusy}
                        onClick={() => handleDelete(item.id)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {pageItems.length === 0 && (
          <div className="col-12 text-center py-5 text-muted">
            Không có mục nào khớp bộ lọc hiện tại.
          </div>
        )}
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Trước
          </button>
          <span className="small fw-semibold">
            Trang {safePage} / {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  );
}
