// ════════════════════════════════════════════════════════════════
// Lexicon: Từ điển nhóm nghĩa (answerCategory) cho validator Q-L5-CAT
// Chuẩn: docs/05-implementation/content/STD-QUESTION-QUALITY-v1.0.md §3.4 & §5.1
// Pure JS — chạy được cả Node và trình duyệt.
// ════════════════════════════════════════════════════════════════

const CATEGORY_WORDS = {
  color: [
    'red', 'blue', 'yellow', 'green', 'orange', 'pink',
    'black', 'white', 'brown', 'purple', 'gray', 'grey', 'gold', 'silver',
  ],
  shape: [
    'circle', 'square', 'triangle', 'star', 'heart', 'rectangle', 'oval', 'diamond',
  ],
  animal: [
    'cat', 'dog', 'fish', 'bird', 'rabbit', 'mouse',
    'cow', 'pig', 'duck', 'chicken', 'horse', 'buffalo', 'sheep', 'goat',
    'lion', 'tiger', 'elephant', 'monkey', 'bear', 'snake', 'giraffe', 'zebra',
    'frog', 'turtle', 'crab', 'shrimp', 'shark', 'whale', 'dolphin', 'ant', 'bee', 'butterfly',
  ],
  number: [
    'zero', 'one', 'two', 'three', 'four', 'five',
    'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen',
    'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
    'thirty', 'forty', 'fifty', 'hundred', 'thousand',
  ],
  person: [
    'boy', 'girl', 'baby', 'man', 'woman', 'friend', 'child', 'kid', 'adult', 'person',
  ],
  family: [
    'mother', 'mom', 'mum', 'father', 'dad', 'sister', 'brother',
    'grandmother', 'grandma', 'grandfather', 'grandpa', 'uncle', 'aunt', 'cousin', 'parents',
  ],
  greeting: [
    'hello', 'hi', 'bye', 'goodbye', 'yes', 'no', 'thank you', 'thanks', 'please', 'sorry', 'welcome',
  ],
  adjective: [
    'big', 'small', 'large', 'little', 'long', 'short', 'fast', 'slow',
    'tall', 'hot', 'cold', 'happy', 'sad', 'new', 'old', 'good', 'bad', 'clean', 'dirty',
  ],
  job: [
    'teacher', 'doctor', 'nurse', 'chef', 'cook', 'farmer', 'driver', 'pilot',
    'engineer', 'dentist', 'police', 'firefighter', 'singer', 'actor', 'artist', 'baker', 'lawyer', 'waiter',
  ],
  food: [
    'apple', 'banana', 'rice', 'bread', 'milk', 'water', 'egg', 'meat', 'cake', 'soup',
    'noodles', 'pizza', 'cheese', 'coffee', 'tea', 'juice', 'carrot', 'tomato', 'potato', 'grape', 'mango',
  ],
  body: [
    'head', 'eye', 'ear', 'nose', 'mouth', 'hand', 'arm', 'leg', 'foot', 'hair', 'tooth', 'finger', 'knee',
  ],
  day: [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  ],
  month: [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december',
  ],
  weather: [
    'sunny', 'rainy', 'cloudy', 'windy', 'snowy', 'stormy', 'foggy',
  ],
  transport: [
    'car', 'bus', 'bike', 'bicycle', 'train', 'plane', 'boat', 'ship', 'taxi', 'motorbike', 'truck', 'subway',
  ],
};

export const WORD_CATEGORIES = {};
for (const [cat, list] of Object.entries(CATEGORY_WORDS)) {
  for (const w of list) {
    // Không ghi đè nếu từ đã có nhóm đầu tiên (ví dụ 'orange' ưu tiên color, 'fish' ưu tiên animal)
    if (!WORD_CATEGORIES[w]) WORD_CATEGORIES[w] = cat;
  }
}

export function getWordCategory(word) {
  const norm = String(word || '').trim().toLowerCase();
  return WORD_CATEGORIES[norm] || null;
}
