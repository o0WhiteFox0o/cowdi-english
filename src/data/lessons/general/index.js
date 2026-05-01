// Auto-generated — danh sách bài học của track "general"
import { GREETINGS_LESSON } from './greetings.js';
import { FAMILY_LESSON } from './family.js';
import { COLORS_LESSON } from './colors.js';
import { NUMBERS_LESSON } from './numbers.js';
import { DAILY_ROUTINE_LESSON } from './daily-routine.js';
import { FOOD_LESSON } from './food.js';
import { TRAVEL_LESSON } from './travel.js';
import { TENSES_LESSON } from './tenses.js';
import { SCHOOL_LESSON } from './school.js';
import { WEATHER_LESSON } from './weather.js';
import { JOBS_LESSON } from './jobs.js';
import { BODY_LESSON } from './body.js';
import { CLOTHING_LESSON } from './clothing.js';
import { HOUSE_LESSON } from './house.js';
import { EMOTIONS_LESSON } from './emotions.js';
import { HOBBIES_LESSON } from './hobbies.js';
import { NATURE_LESSON } from './nature.js';
import { TECHNOLOGY_LESSON } from './technology.js';
import { SHOPPING_LESSON } from './shopping.js';
import { HEALTH_LESSON } from './health.js';
import { COMPARISONS_LESSON } from './comparisons.js';
import { ENVIRONMENT_LESSON } from './environment.js';
import { MEDIA_LESSON } from './media.js';
import { CULTURE_LESSON } from './culture.js';
import { BUSINESS_LESSON } from './business.js';
import { SCIENCE_LESSON } from './science.js';
import { EDUCATION_LESSON } from './education.js';
import { EXAM_STRATEGIES_LESSON } from './exam-strategies.js';
import { COMMUNICATION_SKILLS_LESSON } from './communication-skills.js';
import { TEST_PRACTICE_LESSON } from './test-practice.js';

// === Basic / Pronunciation lessons (added 2026) ===
import { ALPHABET_LESSON } from './alphabet.js';
import { PRONUNCIATION_VOWELS_LESSON } from './pronunciation-vowels.js';
import { PRONUNCIATION_CONSONANTS_LESSON } from './pronunciation-consonants.js';
import { PRONUNCIATION_TRICKY_LESSON } from './pronunciation-tricky.js';
import { PRONUNCIATION_STRESS_LESSON } from './pronunciation-stress.js';
import { WH_QUESTIONS_LESSON } from './wh-questions.js';
import { ARTICLES_LESSON } from './articles.js';
import { PRONOUNS_LESSON } from './pronouns.js';
import { PREPOSITIONS_PLACE_LESSON } from './prepositions-place.js';
import { DAILY_PHRASES_LESSON } from './daily-phrases.js';
import { TIME_AND_DATE_LESSON } from './time-and-date.js';
import { DIRECTIONS_LESSON } from './directions.js';
import { MONEY_PRICES_LESSON } from './money-prices.js';
import { RESTAURANT_LESSON } from './at-restaurant.js';
import { AIRPORT_LESSON } from './at-airport.js';
import { NUMBERS_BASIC_LESSON } from './numbers-basic.js';

export const TRACK_ID = "general";
export const TRACK_LABEL = "Chủ đề tổng hợp";
export const TRACK_ICON = "📚";

export const LESSONS = [
  // === Bài cơ bản (beginner) — phát âm & nền tảng ===
  ALPHABET_LESSON,
  PRONUNCIATION_VOWELS_LESSON,
  PRONUNCIATION_CONSONANTS_LESSON,
  PRONUNCIATION_TRICKY_LESSON,
  PRONUNCIATION_STRESS_LESSON,
  NUMBERS_BASIC_LESSON,
  PRONOUNS_LESSON,
  ARTICLES_LESSON,
  PREPOSITIONS_PLACE_LESSON,
  WH_QUESTIONS_LESSON,
  DAILY_PHRASES_LESSON,
  TIME_AND_DATE_LESSON,
  DIRECTIONS_LESSON,
  MONEY_PRICES_LESSON,
  RESTAURANT_LESSON,
  AIRPORT_LESSON,

  // === Chủ đề từ vựng đã có ===
  GREETINGS_LESSON,
  FAMILY_LESSON,
  COLORS_LESSON,
  NUMBERS_LESSON,
  DAILY_ROUTINE_LESSON,
  FOOD_LESSON,
  TRAVEL_LESSON,
  TENSES_LESSON,
  SCHOOL_LESSON,
  WEATHER_LESSON,
  JOBS_LESSON,
  BODY_LESSON,
  CLOTHING_LESSON,
  HOUSE_LESSON,
  EMOTIONS_LESSON,
  HOBBIES_LESSON,
  NATURE_LESSON,
  TECHNOLOGY_LESSON,
  SHOPPING_LESSON,
  HEALTH_LESSON,
  COMPARISONS_LESSON,
  ENVIRONMENT_LESSON,
  MEDIA_LESSON,
  CULTURE_LESSON,
  BUSINESS_LESSON,
  SCIENCE_LESSON,
  EDUCATION_LESSON,
  EXAM_STRATEGIES_LESSON,
  COMMUNICATION_SKILLS_LESSON,
  TEST_PRACTICE_LESSON,
].map(l => ({ ...l, track: TRACK_ID }));

export default LESSONS;
