import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { SEO_CONFIGS } from '../data/seo-config';
import { LESSONS } from '../data/lessons';
import { VOCAB_TOPICS, getTopicWordCount } from '../data/vocab-topics';
import { useUser } from '../hooks/useUser';
import { usePet } from '../hooks/usePet';
import { useToast } from '../components/layout/Toast';
import { useSound } from '../hooks/useSound';
import Icon from '../components/Icon';
import Emoji from '../components/Emoji';
import { SpeechRecognitionAPI, scorePronunciation, getScoreLabel } from '../utils/speech';
import { resolveImage, resolveTitle } from '../utils/imageOverrides';
import { getGroup, getGroupOfPath } from '../data/config/groups';
import Flashcard from '../components/learn/Flashcard';
import {
  orderCards,
  wordStatus as getWordMemoryStatus,
  isMaybeForgotten,
  WORD_STATUS_UI,
  getWordId,
} from '../features/vocab/wordProgress';

// ── Views: topics → subtopics → words (flashcard / list) ──────────────



const TOPIC_HEADER_ICONS = {
  human: '/image/subtopics/human/icon.webp',
  eating: '/image/icons/eating-icon.webp',
  drinking: '/image/icons/drinking-icon.webp',
  house: '/image/icons/house-icon.webp',
  transportation: '/image/icons/transportation-icon.webp',
  love: '/image/icons/love-icon.webp',
  numbers: '/image/icons/numbers-icon.webp',
  sports: '/image/icons/sports-icon.webp',
  holidays: '/image/icons/holidays-icon.webp',
  animals: '/image/icons/animals-icon.webp',
  nature: '/image/icons/nature-icon.webp',
  'public-places': '/image/icons/public-places-icon.webp',
  countries: '/image/icons/countries-icon.webp'
};

const TOPIC_DISPLAY_NAMES = {
  transportation: 'Transport',
  'public-places': 'Places',
};

const TOPIC_ART_IMAGES = {
  human: '/image/topics/human.webp',
  eating: '/image/topics/eating.webp',
  drinking: '/image/topics/drinking.webp',
  house: '/image/topics/house.webp',
  transportation: '/image/topics/transportation.webp',
  love: '/image/topics/love.webp',
  numbers: '/image/topics/numbers.webp',
  sports: '/image/topics/sports.webp',
  holidays: '/image/topics/holidays.webp',
  animals: '/image/topics/animals.webp',
  nature: '/image/topics/nature.webp',
  'public-places': '/image/topics/public-places.webp',
  countries: '/image/topics/countries.webp',
};

const TOPIC_PALETTES = {
  human: { bg: '#A6C8E8', border: '#336B9B', banner: '#1A4D78' },
  eating: { bg: '#FFEAA7', border: '#D48A14', banner: '#B86F00' },
  drinking: { bg: '#E4D3C5', border: '#7A5240', banner: '#553424' },
  house: { bg: '#F5BDBD', border: '#C0393B', banner: '#8F1E20' },
  transportation: { bg: '#D3D8DE', border: '#5C646E', banner: '#373D45' },
  love: { bg: '#FBC4D6', border: '#D81B60', banner: '#9C0D3E' },
  numbers: { bg: '#DCD4EE', border: '#673AB7', banner: '#452187' },
  sports: { bg: '#C8E6C9', border: '#2E7D32', banner: '#1B5E20' },
  holidays: { bg: '#FFE0B2', border: '#EF6C00', banner: '#B84500' },
  animals: { bg: '#DCEDC8', border: '#689F38', banner: '#466D1E' },
  nature: { bg: '#B2DFDB', border: '#00897B', banner: '#005B52' },
  'public-places': { bg: '#CFD8DC', border: '#455A64', banner: '#263238' },
  countries: { bg: '#B3E5FC', border: '#0288D1', banner: '#01579B' },
};

const SUBTOPIC_ART_IMAGES = {
  // Human Topic
  'human-body': '/image/subtopics/human/body.webp',
  'human-appearance': '/image/subtopics/human/appearance.webp',
  'human-personality': '/image/subtopics/human/personality.webp',
  'human-emotions': '/image/subtopics/human/emotions.webp',
  'human-family': '/image/subtopics/human/family.webp',
  'human-lifecycle': '/image/subtopics/human/lifecycle.webp',
  'human-more': '/image/subtopics/human/more.webp',

  // Eating Topic
  'eating-fruits': '/image/subtopics/eating/fruits.webp',
  'eating-vegetables': '/image/subtopics/eating/vegetables.webp',
  'eating-meat-seafood': '/image/subtopics/eating/meat_seafood.webp',
  'eating-cooking': '/image/subtopics/eating/cooking.webp',
  'eating-meals': '/image/subtopics/eating/meals.webp',
  'eating-taste': '/image/subtopics/eating/taste.webp',
  'eating-more': '/image/subtopics/eating/more.webp',

  // Drinking Topic
  'drinking-hot': '/image/subtopics/drinking/hot.webp',
  'drinking-cold': '/image/subtopics/drinking/cold.webp',
  'drinking-dairy': '/image/subtopics/drinking/dairy.webp',
  'drinking-actions': '/image/subtopics/drinking/actions.webp',
  'drinking-more': '/image/subtopics/drinking/more.webp',

  // House Topic
  'house-rooms': '/image/subtopics/house/rooms.webp',
  'house-furniture': '/image/subtopics/house/furniture.webp',
  'house-appliances': '/image/subtopics/house/appliances.webp',
  'house-chores': '/image/subtopics/house/chores.webp',
  'house-more': '/image/subtopics/house/more.webp',

  // Transportation Topic
  'transport-vehicles': '/image/subtopics/transportation/vehicles.webp',
  'transport-road': '/image/subtopics/transportation/road.webp',
  'transport-actions': '/image/subtopics/transportation/actions.webp',
  'transportation-more': '/image/subtopics/transportation/more.webp',

  // Love Topic
  'love-feelings': '/image/subtopics/love/feelings.webp',
  'love-relationships': '/image/subtopics/love/relationships.webp',
  'love-dating': '/image/subtopics/love/dating.webp',
  'love-more': '/image/subtopics/love/more.webp',

  // Numbers Topic
  'numbers-basic': '/image/subtopics/numbers/basic.webp',
  'numbers-ordinal': '/image/subtopics/numbers/ordinal.webp',
  'numbers-math': '/image/subtopics/numbers/math.webp',
  'numbers-more': '/image/subtopics/numbers/more.webp',

  // Sports Topic
  'sports-types': '/image/subtopics/sports/types.webp',
  'sports-actions': '/image/subtopics/sports/actions.webp',
  'sports-more': '/image/subtopics/sports/more.webp',

  // Holidays Topic
  'holidays-types': '/image/subtopics/holidays/types.webp',
  'holidays-activities': '/image/subtopics/holidays/activities.webp',
  'holidays-more': '/image/subtopics/holidays/more.webp',

  // Animals Topic
  'animals-pets': '/image/subtopics/animals/pets.webp',
  'animals-wild': '/image/subtopics/animals/wild.webp',
  'animals-sea': '/image/subtopics/animals/sea.webp',
  'animals-more': '/image/subtopics/animals/more.webp',

  // Nature Topic
  'nature-weather': '/image/subtopics/nature/weather.webp',
  'nature-landscape': '/image/subtopics/nature/landscape.webp',
  'nature-plants': '/image/subtopics/nature/plants.webp',
  'nature-more': '/image/subtopics/nature/more.webp',

  // Public Places Topic
  'places-services': '/image/subtopics/public-places/services.webp',
  'places-shopping': '/image/subtopics/public-places/shopping.webp',
  'places-entertainment': '/image/subtopics/public-places/entertainment.webp',
  'public-places-more': '/image/subtopics/public-places/more.webp',

  // Countries Topic
  'countries-asia': '/image/subtopics/countries/asia.webp',
  'countries-world': '/image/subtopics/countries/world.webp',
  'countries-language': '/image/subtopics/countries/languages.webp',
  'countries-more': '/image/subtopics/countries/more.webp',
};

const SUBTOPIC_PALETTES = {
  // Human Topic
  'human-body': { bg: '#FED7AA', border: '#EA580C', banner: '#C2410C' },
  'human-appearance': { bg: '#FCE7F3', border: '#DB2777', banner: '#BE185D' },
  'human-personality': { bg: '#DDD6FE', border: '#7C3AED', banner: '#6D28D9' },
  'human-emotions': { bg: '#BAE6FD', border: '#0284C7', banner: '#0369A1' },
  'human-family': { bg: '#FED7AA', border: '#EA580C', banner: '#C2410C' },
  'human-lifecycle': { bg: '#A7F3D0', border: '#059669', banner: '#047857' },
  'human-more': { bg: '#FEF08A', border: '#CA8A04', banner: '#A16207' },

  // Eating Topic
  'eating-fruits': { bg: '#FED7AA', border: '#EA580C', banner: '#C2410C' },
  'eating-vegetables': { bg: '#BBF7D0', border: '#16A34A', banner: '#15803D' },
  'eating-meat-seafood': { bg: '#FED7AA', border: '#E11D48', banner: '#BE123C' },
  'eating-cooking': { bg: '#FEF08A', border: '#CA8A04', banner: '#A16207' },
  'eating-meals': { bg: '#FED7AA', border: '#D97706', banner: '#B45309' },
  'eating-taste': { bg: '#FEF08A', border: '#CA8A04', banner: '#A16207' },
  'eating-more': { bg: '#BAE6FD', border: '#0284C7', banner: '#0369A1' },

  // Drinking Topic
  'drinking-hot': { bg: '#FED7AA', border: '#EA580C', banner: '#C2410C' },
  'drinking-cold': { bg: '#BAE6FD', border: '#0284C7', banner: '#0369A1' },
  'drinking-dairy': { bg: '#E0E7FF', border: '#4F46E5', banner: '#4338CA' },
  'drinking-actions': { bg: '#CFFAFE', border: '#0891B2', banner: '#0E7490' },
  'drinking-more': { bg: '#FEF08A', border: '#CA8A04', banner: '#A16207' },

  // House Topic
  'house-rooms': { bg: '#FFEDD5', border: '#EA580C', banner: '#C2410C' },
  'house-furniture': { bg: '#DCFCE7', border: '#16A34A', banner: '#15803D' },
  'house-appliances': { bg: '#CFFAFE', border: '#0891B2', banner: '#0E7490' },
  'house-chores': { bg: '#F3E8FF', border: '#9333EA', banner: '#7E22CE' },
  'house-more': { bg: '#FEF08A', border: '#CA8A04', banner: '#A16207' },

  // Transportation Topic
  'transport-vehicles': { bg: '#FED7AA', border: '#EA580C', banner: '#C2410C' },
  'transport-road': { bg: '#FEF08A', border: '#CA8A04', banner: '#A16207' },
  'transport-actions': { bg: '#BAE6FD', border: '#0284C7', banner: '#0369A1' },
  'transportation-more': { bg: '#E2E8F0', border: '#475569', banner: '#334155' },

  // Love Topic
  'love-feelings': { bg: '#FCE7F3', border: '#DB2777', banner: '#BE185D' },
  'love-relationships': { bg: '#FFE4E6', border: '#E11D48', banner: '#BE123C' },
  'love-dating': { bg: '#F3E8FF', border: '#9333EA', banner: '#7E22CE' },
  'love-more': { bg: '#FDF2F8', border: '#EC4899', banner: '#DB2777' },

  // Numbers Topic
  'numbers-basic': { bg: '#E0E7FF', border: '#4F46E5', banner: '#4338CA' },
  'numbers-ordinal': { bg: '#DCFCE7', border: '#16A34A', banner: '#15803D' },
  'numbers-math': { bg: '#F5F3FF', border: '#7C3AED', banner: '#6D28D9' },
  'numbers-more': { bg: '#FEF08A', border: '#CA8A04', banner: '#A16207' },

  // Sports Topic
  'sports-types': { bg: '#DCFCE7', border: '#16A34A', banner: '#15803D' },
  'sports-actions': { bg: '#ECFCCB', border: '#65A30D', banner: '#4D7C0F' },
  'sports-more': { bg: '#FEF08A', border: '#CA8A04', banner: '#A16207' },

  // Holidays Topic
  'holidays-types': { bg: '#FFE0B2', border: '#EF6C00', banner: '#B84500' },
  'holidays-activities': { bg: '#FED7AA', border: '#EA580C', banner: '#C2410C' },
  'holidays-more': { bg: '#FEF08A', border: '#CA8A04', banner: '#A16207' },

  // Animals Topic
  'animals-pets': { bg: '#DCEDC8', border: '#689F38', banner: '#466D1E' },
  'animals-wild': { bg: '#FED7AA', border: '#D97706', banner: '#B45309' },
  'animals-sea': { bg: '#BAE6FD', border: '#0284C7', banner: '#0369A1' },
  'animals-more': { bg: '#FEF08A', border: '#CA8A04', banner: '#A16207' },

  // Nature Topic
  'nature-weather': { bg: '#BAE6FD', border: '#0284C7', banner: '#0369A1' },
  'nature-landscape': { bg: '#A7F3D0', border: '#059669', banner: '#047857' },
  'nature-plants': { bg: '#DCFCE7', border: '#16A34A', banner: '#15803D' },
  'nature-more': { bg: '#FEF08A', border: '#CA8A04', banner: '#A16207' },

  // Public Places Topic
  'places-services': { bg: '#CFD8DC', border: '#455A64', banner: '#263238' },
  'places-shopping': { bg: '#FED7AA', border: '#EA580C', banner: '#C2410C' },
  'places-entertainment': { bg: '#DDD6FE', border: '#7C3AED', banner: '#6D28D9' },
  'public-places-more': { bg: '#FEF08A', border: '#CA8A04', banner: '#A16207' },

  // Countries Topic
  'countries-asia': { bg: '#FEE2E2', border: '#DC2626', banner: '#B91C1C' },
  'countries-world': { bg: '#B3E5FC', border: '#0288D1', banner: '#01579B' },
  'countries-language': { bg: '#E0E7FF', border: '#4F46E5', banner: '#4338CA' },
  'countries-more': { bg: '#FEF08A', border: '#CA8A04', banner: '#A16207' },
};

const SUBTOPIC_DISPLAY_NAMES = {
  // Human Topic
  'human-body': { en: 'Body Parts', vi: 'Bộ phận cơ thể' },
  'human-appearance': { en: 'Appearance', vi: 'Ngoại hình' },
  'human-personality': { en: 'Personality', vi: 'Tính cách' },
  'human-emotions': { en: 'Emotions', vi: 'Cảm xúc' },
  'human-family': { en: 'Family', vi: 'Gia đình' },
  'human-lifecycle': { en: 'Life Stages', vi: 'Giai đoạn sống' },
  'human-more': { en: 'More', vi: 'Mở rộng' },

  // Eating Topic
  'eating-fruits': { en: 'Fruits', vi: 'Trái cây' },
  'eating-vegetables': { en: 'Vegetables', vi: 'Rau củ' },
  'eating-meat-seafood': { en: 'Meat & Seafood', vi: 'Thịt & Hải sản' },
  'eating-cooking': { en: 'Cooking', vi: 'Nấu ăn & Gia vị' },
  'eating-meals': { en: 'Meals', vi: 'Bữa ăn & Món ăn' },
  'eating-taste': { en: 'Taste', vi: 'Vị & Kết cấu' },
  'eating-more': { en: 'More', vi: 'Mở rộng' },

  // Drinking Topic
  'drinking-hot': { en: 'Hot Drinks', vi: 'Đồ uống nóng' },
  'drinking-cold': { en: 'Cold Drinks', vi: 'Đồ uống lạnh' },
  'drinking-dairy': { en: 'Dairy & Milk', vi: 'Sữa & Chế phẩm' },
  'drinking-actions': { en: 'Drinking', vi: 'Hành động uống' },
  'drinking-more': { en: 'More', vi: 'Mở rộng' },

  // House Topic
  'house-rooms': { en: 'Rooms', vi: 'Các phòng' },
  'house-furniture': { en: 'Furniture', vi: 'Nội thất' },
  'house-appliances': { en: 'Appliances', vi: 'Thiết bị gia dụng' },
  'house-chores': { en: 'Housework', vi: 'Việc nhà' },
  'house-more': { en: 'More', vi: 'Mở rộng' },

  // Transportation Topic
  'transport-vehicles': { en: 'Vehicles', vi: 'Phương tiện' },
  'transport-road': { en: 'Road Traffic', vi: 'Đường & Giao thông' },
  'transport-actions': { en: 'Travel', vi: 'Hành động đi lại' },
  'transportation-more': { en: 'More', vi: 'Mở rộng' },

  // Love Topic
  'love-feelings': { en: 'Feelings', vi: 'Cảm xúc yêu' },
  'love-relationships': { en: 'Relationships', vi: 'Mối quan hệ' },
  'love-dating': { en: 'Dating', vi: 'Hẹn hò & Kết hôn' },
  'love-more': { en: 'More', vi: 'Mở rộng' },

  // Numbers Topic
  'numbers-basic': { en: 'Cardinal', vi: 'Số đếm cơ bản' },
  'numbers-ordinal': { en: 'Ordinal', vi: 'Số thứ tự' },
  'numbers-math': { en: 'Math', vi: 'Toán & Đo lường' },
  'numbers-more': { en: 'More', vi: 'Mở rộng' },

  // Sports Topic
  'sports-types': { en: 'Sports', vi: 'Các môn thể thao' },
  'sports-actions': { en: 'Fitness', vi: 'Tập luyện & Dụng cụ' },
  'sports-more': { en: 'More', vi: 'Mở rộng' },

  // Holidays Topic
  'holidays-types': { en: 'Holidays', vi: 'Các ngày lễ' },
  'holidays-activities': { en: 'Celebrations', vi: 'Hoạt động lễ hội' },
  'holidays-more': { en: 'More', vi: 'Mở rộng' },

  // Animals Topic
  'animals-pets': { en: 'Pets & Farm', vi: 'Thú cưng & Gia súc' },
  'animals-wild': { en: 'Wild Animals', vi: 'Động vật hoang dã' },
  'animals-sea': { en: 'Sea Life', vi: 'Sinh vật biển' },
  'animals-more': { en: 'More', vi: 'Mở rộng' },

  // Nature Topic
  'nature-weather': { en: 'Weather', vi: 'Thời tiết' },
  'nature-landscape': { en: 'Landscape', vi: 'Địa hình' },
  'nature-plants': { en: 'Plants', vi: 'Cây cối & Hoa' },
  'nature-more': { en: 'More', vi: 'Mở rộng' },

  // Public Places Topic
  'places-services': { en: 'Services', vi: 'Dịch vụ & Tòa nhà' },
  'places-shopping': { en: 'Shopping', vi: 'Mua sắm & Ăn uống' },
  'places-entertainment': { en: 'Leisure', vi: 'Giải trí' },
  'public-places-more': { en: 'More', vi: 'Mở rộng' },

  // Countries Topic
  'countries-asia': { en: 'Asia', vi: 'Châu Á' },
  'countries-world': { en: 'Americas & Europe', vi: 'Châu Mỹ & Châu Âu' },
  'countries-language': { en: 'Languages', vi: 'Ngôn ngữ & Quốc tịch' },
  'countries-more': { en: 'More', vi: 'Mở rộng' },
};

export default function VocabularyPage() {
  useSEO(SEO_CONFIGS['/vocabulary']);
  const { userData, setWordStatus, getWordStatus, recordWordEncounter } = useUser();
  const { onVocabReview } = usePet();
  const showToast = useToast();
  const { play, muted } = useSound();

  const groupRules = useMemo(() => (
    getGroupOfPath(userData.activePath)?.rules
    || getGroup(userData.learnerGroup)?.rules
    || getGroup('intermediate')?.rules
  ), [userData.activePath, userData.learnerGroup]);

  const fcRunSetRef = useRef(new Set());
  const wordProgressRef = useRef(userData.wordProgress || {});
  wordProgressRef.current = userData.wordProgress || {};
  const [fcOrderedCards, setFcOrderedCards] = useState([]);
  const [fcReviewAtOpen, setFcReviewAtOpen] = useState(0);
  const [fcReviewOnly, setFcReviewOnly] = useState(false);
  const [fcCompleteNotice, setFcCompleteNotice] = useState(null);
  const [fcRunTick, setFcRunTick] = useState(0);

  // Listen to Admin Image Manager real-time overrides
  const [, setOverrideTick] = useState(0);
  useEffect(() => {
    const handler = () => setOverrideTick((t) => t + 1);
    window.addEventListener('cowdi-image-override-changed', handler);
    return () => window.removeEventListener('cowdi-image-override-changed', handler);
  }, []);

  // Navigation state qua URL search params (hỗ trợ nút Back trình duyệt quay lại từng cấp)
  const [searchParams, setSearchParams] = useSearchParams();
  const topicParam = searchParams.get('topic');
  const subParam = searchParams.get('sub');

  const selectedTopic = useMemo(() => {
    if (!topicParam) return null;
    return VOCAB_TOPICS.find((t) => t.id === topicParam) || null;
  }, [topicParam]);

  const selectedSub = useMemo(() => {
    if (!selectedTopic || !subParam) return null;
    return selectedTopic.subtopics.find((s) => s.id === subParam) || null;
  }, [selectedTopic, subParam]);

  const view = useMemo(() => {
    if (selectedSub) return 'words';
    if (selectedTopic) return 'subtopics';
    return 'topics';
  }, [selectedTopic, selectedSub]);

  // Word view state
  const [mode, setMode] = useState('flashcard');
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [search, setSearch] = useState('');

  // Speech Recognition State
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speakResult, setSpeakResult] = useState(null);
  const [recError, setRecError] = useState('');
  const recognitionRef = useRef(null);

  // Lesson-based words (original)
  const lessonWords = useMemo(() => LESSONS.flatMap((l) => l.vocabulary), []);

  // Topic-based total word count
  const topicWordCount = useMemo(() => getTopicWordCount(), []);

  // Current word list for word view
  const activeWords = useMemo(() => {
    if (view === 'words' && selectedSub) return selectedSub.words;
    return [];
  }, [view, selectedSub]);

  const filteredWords = useMemo(() => {
    if (!search) return activeWords;
    const s = search.toLowerCase();
    return activeWords.filter(
      (w) => w.word.toLowerCase().includes(s) || w.meaning.toLowerCase().includes(s)
    );
  }, [activeWords, search]);

  const currentWord = filteredWords[cardIndex] || filteredWords[0];

  // Chốt thứ tự thẻ khi mở Flashcard chủ đề hoặc đổi từ khoá tìm kiếm (F5)
  useEffect(() => {
    if (view !== 'words' || mode !== 'flashcard') return;
    const prog = wordProgressRef.current;
    fcRunSetRef.current = new Set();
    const ordered = orderCards(filteredWords, prog, groupRules);
    const reviewList = ordered.filter((w) => getWordMemoryStatus(prog[getWordId(w)], groupRules) === 'review');
    setFcOrderedCards(fcReviewOnly && reviewList.length > 0 ? reviewList : ordered);
    setFcReviewAtOpen(reviewList.length);
    setFcCompleteNotice(null);
    setFcRunTick((t) => t + 1);
  }, [view, mode, selectedSub?.id, search, fcReviewOnly, groupRules]);

  const handleTopicEncounter = useCallback((cardObj) => {
    recordWordEncounter(cardObj, fcRunSetRef.current, groupRules);
  }, [recordWordEncounter, groupRules]);

  const getTopicDotInfo = useCallback((cardObj) => {
    const p = (userData.wordProgress || {})[getWordId(cardObj)];
    const st = getWordMemoryStatus(p, groupRules);
    const ui = WORD_STATUS_UI[st] || WORD_STATUS_UI.new;
    return {
      color: ui.color,
      label: ui.label,
      maybeForgotten: isMaybeForgotten(p, groupRules),
    };
  }, [userData.wordProgress, groupRules]);

  // Progress helpers
  const getSubtopicProgress = useCallback((sub) => {
    const learned = sub.words.filter((w) => getWordStatus(w.word) === 'learned').length;
    return { learned, total: sub.words.length };
  }, [getWordStatus]);

  const getTopicProgress = useCallback((topic) => {
    let learned = 0, total = 0;
    topic.subtopics.forEach((sub) => {
      const p = getSubtopicProgress(sub);
      learned += p.learned;
      total += p.total;
    });
    return { learned, total };
  }, [getSubtopicProgress]);

  const speakWord = useCallback((text, rate = 0.85) => {
    if (!text || !('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      const clean = String(text)
        .replace(/\s*[\(\[\{][^()\[\]{}]*[\)\]\}]/g, '')
        .replace(/_+/g, ', ')
        .replace(/\//g, ', ')
        .replace(/\s+/g, ' ')
        .trim();
      if (!clean) return;
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = 'en-US';
      u.rate = rate;
      speechSynthesis.speak(u);
    } catch {}
  }, []);

  const speakSlow = useCallback((text) => speakWord(text, 0.55), [speakWord]);

  const startRecording = useCallback((expectedText) => {
    if (!SpeechRecognitionAPI) {
      setRecError('Trình duyệt không hỗ trợ nhận diện giọng nói. Vui lòng dùng Chrome hoặc Edge.');
      return;
    }
    if ('speechSynthesis' in window) speechSynthesis.cancel();

    setTranscript('');
    setSpeakResult(null);
    setRecError('');
    setIsRecording(true);

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      setTranscript(last[0].transcript);
      if (last.isFinal) {
        const finalText = last[0].transcript;
        setTranscript(finalText);
        const result = scorePronunciation(expectedText, finalText);
        setSpeakResult(result);
        setIsRecording(false);
        if (result.score >= 70) play('correct');
        else if (result.score >= 40) play('click');
        else play('wrong');
      }
    };
    recognition.onerror = (event) => {
      setIsRecording(false);
      if (event.error === 'no-speech') {
        setRecError('Không nghe thấy giọng nói. Hãy nói to hơn nhé!');
      } else if (event.error === 'not-allowed') {
        setRecError('Trình duyệt chưa cấp quyền microphone.');
      } else {
        setRecError('Lỗi nhận diện giọng nói.');
      }
    };
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  }, [play]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsRecording(false);
  }, []);

  function openTopic(topic) {
    setSearchParams({ topic: topic.id });
  }

  function openSubtopic(sub) {
    if (selectedTopic) {
      setSearchParams({ topic: selectedTopic.id, sub: sub.id });
    }
    setCardIndex(0);
    setFlipped(false);
    setSearch('');
  }

  function goBack() {
    if (view === 'words' && selectedTopic) {
      setSearchParams({ topic: selectedTopic.id });
    } else {
      setSearchParams({});
    }
  }

  function nextCard() {
    setFlipped(false);
    setSpeakResult(null);
    setTranscript('');
    setRecError('');
    play('flip');
    setCardIndex((i) => (i + 1) % filteredWords.length);
  }

  function prevCard() {
    setFlipped(false);
    setSpeakResult(null);
    setTranscript('');
    setRecError('');
    play('flip');
    setCardIndex((i) => (i - 1 + filteredWords.length) % filteredWords.length);
  }

  function markWord(word, status) {
    setWordStatus(word, status);
    onVocabReview();
    if (status === 'learned') play('wordLearned'); else play('click');
    showToast(
      status === 'learned' ? `Đã đánh dấu "${word}" là đã thuộc! ✅` : `Đã đánh dấu "${word}" cần ôn lại 📝`,
      'success'
    );
  }

  // ─── Topics Mind Map ───────────────────────────────────────────────────
  if (view === 'topics') {
    return (
      <div className="fade-in">
        <div className="text-center mb-4">
          <h2 className="fw-bold">
            <i className="fas fa-language text-cowdi me-2"></i>Từ vựng
          </h2>
          <p className="text-muted">
            {topicWordCount + lessonWords.length} từ ({VOCAB_TOPICS.length} chủ đề + {lessonWords.length} từ bài học) | Đã thuộc: {userData.wordsLearned}
          </p>
        </div>

        {/* Hero — Cowdi Super mascot */}
        <div className="vocab-hero mb-4">
          <div className="vocab-hero-badge">
            <img
              src="/assets/images/pets/Cowdi/Cowdi_super.webp"
              alt="Cowdi Super"
              className="vocab-hero-img"
              loading="lazy"
            />
            <div className="vocab-hero-ring" aria-hidden />
            <div className="vocab-hero-caption">
              <span className="vocab-hero-title">Cowdi</span>
              <span className="vocab-hero-sub">Từ vựng</span>
            </div>
          </div>
        </div>

        {/* Topic Trading Cards Grid */}
        <div className="vocab-topics-container mb-4">
          <div className="topic-cards-grid">
            {VOCAB_TOPICS.map((topic) => {
              const progress = getTopicProgress(topic);
              const pct = progress.total > 0 ? Math.round((progress.learned / progress.total) * 100) : 0;
              const palette = TOPIC_PALETTES[topic.id] || {
                bg: topic.color ? `${topic.color}25` : '#EEF2F6',
                border: topic.color || '#3B82F6',
                banner: topic.color || '#1D4ED8',
              };
              const rawArtUrl = TOPIC_ART_IMAGES[topic.id] || `/image/art/${topic.id}.webp`;
              const artUrl = resolveImage(topic.id, rawArtUrl);
              const lessonCount = topic.subtopics ? topic.subtopics.length : 0;
              const topicDisplayName = TOPIC_DISPLAY_NAMES[topic.id] || topic.name;
              const displayEn = resolveTitle(topic.id, 'en', topicDisplayName);
              const displayVi = resolveTitle(topic.id, 'vi', topic.nameVi);

              return (
                <div
                  key={topic.id}
                  className="topic-card-item"
                  style={{
                    '--card-bg': palette.bg,
                    '--card-border': palette.border,
                    '--card-banner': palette.banner,
                  }}
                  onClick={() => openTopic(topic)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openTopic(topic); }}
                >
                  {/* Inner Illustration Frame with Glass Reflection */}
                  <div className="topic-card-frame">
                    <img
                      src={artUrl}
                      alt={topic.name}
                      className="topic-card-art"
                      loading="lazy"
                    />
                  </div>

                  {/* Middle Pill Banner */}
                  <div className="topic-card-banner">
                    <span className="topic-card-banner-decor">◆</span>
                    <span className="topic-card-banner-title">{displayEn}</span>
                    <span className="topic-card-banner-decor">◆</span>
                  </div>

                  {/* Bottom Footer */}
                  <div className="topic-card-footer">
                    <div className="topic-card-footer-left">
                      <div className="topic-card-vi">{displayVi}</div>
                      <div className="topic-card-lessons">
                        <i className="fas fa-book-open me-1"></i>{lessonCount} bài học
                      </div>
                    </div>
                    <div className="topic-card-footer-right">
                      <span className="topic-card-count">{progress.total} TỪ</span>
                    </div>
                  </div>

                  {/* Progress Bar at Bottom */}
                  {pct > 0 && (
                    <div className="topic-card-progress">
                      <div
                        className="topic-card-progress-bar"
                        style={{ width: `${pct}%`, backgroundColor: palette.banner }}
                      ></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Lesson vocab quick access */}
        <div className="card shadow-sm" style={{ maxWidth: 780, margin: '0 auto' }}>
          <div className="card-body text-center">
            <h5 className="fw-bold mb-2"><Icon name="books" size={20} /> Từ vựng bài học</h5>
            <p className="text-muted small mb-0">{lessonWords.length} từ từ {LESSONS.length} bài học</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Subtopics View ────────────────────────────────────────────────────
  if (view === 'subtopics' && selectedTopic) {
    const topicProgress = getTopicProgress(selectedTopic);
    return (
      <div className="fade-in">
        <button className="btn btn-sm btn-outline-secondary mb-3" onClick={goBack}>
          <Icon name="arrowLeft" size={14} /> Quay lại
        </button>

        <div className="text-center mb-4">
          <div className="mb-2 text-center">
            {(() => {
              const headerIconUrl = resolveImage(selectedTopic.id + '-icon', TOPIC_HEADER_ICONS[selectedTopic.id]);
              if (headerIconUrl) {
                return (
                  <img
                    src={headerIconUrl}
                    alt={selectedTopic.name}
                    style={{
                      width: 200,
                      height: 200,
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.15))',
                      display: 'inline-block',
                    }}
                  />
                );
              }
              return (
                <div style={{ fontSize: '3rem' }} className="emoji-big">
                  <Emoji e={selectedTopic.icon} size={56} />
                </div>
              );
            })()}
          </div>
          <h2 className="fw-bold" style={{ color: selectedTopic.color }}>
            {selectedTopic.name}
          </h2>
          <p className="text-muted">{selectedTopic.description}</p>
          <p className="text-muted small">
            {topicProgress.learned} / {topicProgress.total} từ đã thuộc
          </p>
          <div className="progress mx-auto" style={{ maxWidth: 300, height: 8 }}>
            <div
              className="progress-bar"
              style={{
                width: `${topicProgress.total > 0 ? (topicProgress.learned / topicProgress.total) * 100 : 0}%`,
                backgroundColor: selectedTopic.color,
              }}
            ></div>
          </div>
        </div>

        <div className="vocab-topics-container mb-4">
          <div className="topic-cards-grid">
            {selectedTopic.subtopics.map((sub) => {
            const prog = getSubtopicProgress(sub);
            const pct = prog.total > 0 ? Math.round((prog.learned / prog.total) * 100) : 0;
            const rawArtUrl = SUBTOPIC_ART_IMAGES[sub.id];
            const artUrl = resolveImage(sub.id, rawArtUrl);
            const palette = SUBTOPIC_PALETTES[sub.id] || {
              bg: selectedTopic.color ? `${selectedTopic.color}25` : '#EEF2F6',
              border: selectedTopic.color || '#3B82F6',
              banner: selectedTopic.color || '#1D4ED8',
            };
            const displayInfo = SUBTOPIC_DISPLAY_NAMES[sub.id] || { en: sub.name, vi: sub.nameVi };
            const enTitle = resolveTitle(sub.id, 'en', displayInfo.en);
            const viTitle = resolveTitle(sub.id, 'vi', displayInfo.vi);

            return (
              <div
                key={sub.id}
                className="topic-card-item"
                style={{
                  '--card-bg': palette.bg,
                  '--card-border': palette.border,
                  '--card-banner': palette.banner,
                }}
                onClick={() => openSubtopic(sub)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openSubtopic(sub); }}
              >
                {/* Inner Illustration Frame with Glass Reflection */}
                <div className="topic-card-frame">
                  {artUrl ? (
                    <img
                      src={artUrl}
                      alt={sub.name}
                      className="topic-card-art"
                      loading="lazy"
                    />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 fs-1">
                      <Emoji e={sub.icon} size={48} />
                    </div>
                  )}
                </div>

                {/* Middle Pill Banner */}
                <div className="topic-card-banner">
                  <span className="topic-card-banner-decor">◆</span>
                  <span className="topic-card-banner-title">{enTitle}</span>
                  <span className="topic-card-banner-decor">◆</span>
                </div>

                {/* Bottom Footer matching Image 1 */}
                <div className="topic-card-footer">
                  <div className="topic-card-footer-left">
                    <span className="topic-card-vi">{viTitle}</span>
                    <span className="topic-card-lessons">
                      <i className="fas fa-layer-group me-1"></i>{prog.total} từ
                    </span>
                  </div>
                  <div className="topic-card-footer-right">
                    <span className="topic-card-count">{prog.learned > 0 ? `${prog.learned}/${prog.total}` : '+XP'}</span>
                  </div>
                </div>

                {/* Progress Bar at Bottom */}
                {pct > 0 && (
                  <div className="topic-card-progress">
                    <div
                      className="topic-card-progress-bar"
                      style={{ width: `${pct}%`, backgroundColor: palette.banner }}
                    ></div>
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </div>
      </div>
    );
  }

  // ─── Words View (flashcard / list) ─────────────────────────────────────
  return (
    <div className="fade-in">
      <button className="btn btn-sm btn-outline-secondary mb-3" onClick={goBack}>
        <Icon name="arrowLeft" size={14} /> Quay lại
      </button>

      <div className="text-center mb-3">
        <div style={{ fontSize: '2rem' }} className="emoji-big"><Emoji e={selectedSub?.icon} size={36} /></div>
        <h3 className="fw-bold">{selectedSub?.name}</h3>
        <p className="text-muted small">{selectedSub?.nameVi} — {filteredWords.length} từ</p>
      </div>

      {/* Controls */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div className="btn-group">
          <button
            className={`btn btn-sm ${mode === 'flashcard' ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
            onClick={() => setMode('flashcard')}
          >
            <Icon name="cards" size={14} /> Flashcard
          </button>
          <button
            className={`btn btn-sm ${mode === 'list' ? 'btn-cowdi-primary' : 'btn-outline-secondary'}`}
            onClick={() => setMode('list')}
          >
            <Icon name="clipboard" size={14} /> Danh sách
          </button>
        </div>
        <input
          type="text"
          className="form-control"
          style={{ maxWidth: '280px' }}
          placeholder="🔍 Tìm từ vựng..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCardIndex(0); setFlipped(false); }}
        />
      </div>

      {/* Flashcard mode (SDD-FLASHCARD-AUDIO-UX v1.4) */}
      {mode === 'flashcard' && filteredWords.length > 0 && (
        <div className="d-flex flex-column align-items-center">
          {fcReviewOnly && (
            <div className="mb-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setFcReviewOnly(false)}
              >
                ← Quay lại đủ {filteredWords.length} thẻ
              </button>
            </div>
          )}
          <Flashcard
            cards={fcOrderedCards.length > 0 ? fcOrderedCards : filteredWords}
            ttsRate={groupRules?.ttsRate || 0.85}
            muted={muted}
            onEncounter={handleTopicEncounter}
            getCardDotInfo={getTopicDotInfo}
            completeNotice={fcCompleteNotice}
            onStartReviewOnly={() => setFcReviewOnly(true)}
            onComplete={() => {
              const total = (fcOrderedCards.length > 0 ? fcOrderedCards : filteredWords).length;
              const msg = fcReviewAtOpen > 0 && !fcReviewOnly
                ? `Xong ${total} thẻ! Có ${fcReviewAtOpen} từ cần ôn`
                : `Xong ${total} thẻ!`;
              setFcCompleteNotice({ text: msg, reviewCount: fcReviewOnly ? 0 : fcReviewAtOpen });
              showToast(msg, 'success');
              onVocabReview?.();
            }}
            resetKey={`${selectedSub?.id || ''}-${search}-${fcReviewOnly}-${fcRunTick}`}
          />
        </div>
      )}

      {/* List mode */}
      {mode === 'list' && (
        <div className="row g-2">
          {filteredWords.map((w) => {
            const status = getWordStatus(w.word);
            return (
              <div className="col-12" key={w.word}>
                <div className={`card shadow-sm ${status === 'learned' ? 'border-success' : status === 'learning' ? 'border-warning' : ''}`}>
                  <div className="card-body d-flex align-items-start gap-3 flex-wrap py-2">
                    <div className="me-2" style={{ fontSize: '1.5rem' }}><Emoji e={w.illustration} size={28} /></div>
                    <div className="flex-grow-1">
                      <span className="fw-bold text-cowdi-primary me-2">{w.word}</span>
                      <span className="text-muted font-monospace small me-2">{w.phonetic}</span>
                      <button className="btn btn-sm btn-outline-secondary me-1" title="Đọc từ" onClick={() => speakWord(w.word)}><Icon name="sound" size={14} /></button>
                      <button className="btn btn-sm btn-outline-secondary me-1" title="Đọc chậm" onClick={() => speakSlow(w.word)}><Icon name="snail" size={14} /></button>
                      <button 
                        className={`btn btn-sm ${isRecording && transcript === '' ? 'btn-danger' : 'btn-outline-secondary'}`} 
                        title="Phát âm" 
                        onClick={() => { if (isRecording) stopRecording(); else startRecording(w.word); }}
                      ><Icon name="mic" size={14} /></button>
                      <div className="mt-1">{w.meaning}</div>
                      {(() => {
                        const list = Array.isArray(w.examples) && w.examples.length > 0
                          ? w.examples
                          : (w.example ? [{ en: w.example, vi: '' }] : []);
                        return list.map((ex, i) => (
                          <div key={i} className="mt-1 d-flex align-items-start gap-1 flex-wrap">
                            <div className="text-muted small fst-italic flex-grow-1">
                              {ex.context && <span className="badge bg-info-subtle text-info me-1" style={{ fontSize: '0.65rem' }}>{ex.context}</span>}
                              "{ex.en}"
                              {ex.vi && <span className="text-muted ms-1" style={{ fontStyle: 'normal' }}>— {ex.vi}</span>}
                            </div>
                            <button className="btn btn-sm btn-link p-0 text-decoration-none" title="Đọc câu" onClick={() => speakWord(ex.en)}><Icon name="sound" size={14} /></button>
                            <button className="btn btn-sm btn-link p-0 text-decoration-none" title="Đọc chậm" onClick={() => speakSlow(ex.en)}><Icon name="snail" size={14} /></button>
                          </div>
                        ));
                      })()}
                      {w.memoryTip && (
                        <div className="mt-1 small" style={{ color: '#b8860b' }}><Icon name="bulb" size={13} /> {w.memoryTip}</div>
                      )}
                      {w.related && (
                        <div className="mt-1 small" style={{ color: '#0d6efd' }}><Icon name="link" size={13} /> {w.related}</div>
                      )}
                    </div>
                    <div className="d-flex gap-2 align-self-center">
                      <button
                        className={`btn btn-sm ${status === 'learned' ? 'btn-success' : 'btn-outline-success'}`}
                        onClick={() => markWord(w.word, 'learned')}
                        title="Đã thuộc"
                      ><Icon name="check" size={14} /></button>
                      <button
                        className={`btn btn-sm ${status === 'learning' ? 'btn-warning' : 'btn-outline-warning'}`}
                        onClick={() => markWord(w.word, 'learning')}
                        title="Đang học"
                      ><Icon name="note" size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


