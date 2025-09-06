// Subject emoji utilities
import type { Subject } from '$lib/services/subjectService';

// Subject categories with emojis
export const categoryEmojis: Record<string, string> = {
  "Mathematics": "🧮",
  "Science": "🔬",
  "Language Arts": "📝", 
  "Social Studies": "🌎",
  "Foreign Languages": "🗣️",
  "Arts": "🎨",
  "Computer Science": "💻",
  "Test Prep": "📊",
  "College Board": "🎓",
  "AP Capstone Diploma Program": "🏆",
  "AP Arts": "🖼️",
  "AP English": "📘",
  "AP History and Social Sciences": "🏛️",
  "AP Math and Computer Science": "🔬",
  "AP Sciences": "⚗️",
  "AP World Languages and Cultures": "🌐",
  "High School Core Subjects": "📚",
  "High School Electives": "🔍",
  "Middle School Core Subjects": "📓",
  "Middle School Electives": "🌱",
  "Elementary Subjects": "🍎",
  "Other": "📚"
};

// Get appropriate emoji based on subject name or category
export function getEmoji(subject: Subject): string {
  const name = subject.name.toLowerCase();
  
  // Mathematics subjects
  if (name.includes('algebra i')) return '➕';
  if (name.includes('algebra ii')) return '➗';
  if (name.includes('geometry')) return '📐';
  if (name.includes('trigonometry')) return '📏';
  if (name.includes('precalculus')) return '📊';
  if (name.includes('calculus ab')) return '📈';
  if (name.includes('calculus bc')) return '🔄';
  if (name.includes('statistics')) return '📊';
  
  // Science subjects
  if (name.includes('biology')) return '🧬';
  if (name.includes('chemistry')) return '⚗️';
  if (name.includes('physics 1')) return '🔋';
  if (name.includes('physics 2')) return '🔭';
  if (name.includes('physics c: mechanics')) return '⚙️';
  if (name.includes('physics c: electricity')) return '⚡';
  if (name.includes('environmental')) return '🌿';
  if (name.includes('earth science')) return '🌍';
  
  // Computer Science subjects
  if (name.includes('computer science a')) return '👨‍💻';
  if (name.includes('computer science principles')) return '💾';
  if (name.includes('java')) return '☕';
  if (name.includes('python')) return '🐍';
  if (name.includes('web design')) return '🕸️';
  if (name.includes('robotics')) return '🤖';
  
  // Language Arts subjects
  if (name.includes('english language')) return '🖋️';
  if (name.includes('english literature')) return '📖';
  if (name.includes('creative writing')) return '✍️';
  if (name.includes('journalism')) return '📰';
  if (name.includes('speech')) return '🎤';
  if (name.includes('debate')) return '💬';
  
  // Social Studies subjects
  if (name.includes('u.s. history')) return '🇺🇸';
  if (name.includes('world history')) return '🌐';
  if (name.includes('european history')) return '🏰';
  if (name.includes('government')) return '⚖️';
  if (name.includes('politics')) return '🗳️';
  if (name.includes('economics')) return '💹';
  if (name.includes('psychology')) return '🧠';
  if (name.includes('sociology')) return '👥';
  if (name.includes('african american')) return '✊🏿';
  if (name.includes('human geography')) return '🧭';
  
  // Languages
  if (name.includes('spanish')) return '🇪🇸';
  if (name.includes('french')) return '🇫🇷';
  if (name.includes('german')) return '🇩🇪';
  if (name.includes('chinese') || name.includes('mandarin')) return '🇨🇳';
  if (name.includes('japanese')) return '🇯🇵';
  if (name.includes('italian')) return '🇮🇹';
  if (name.includes('latin')) return '🏛️';
  if (name.includes('foreign language')) return '🗣️';
  
  // Arts subjects
  if (name.includes('art history')) return '🖼️';
  if (name.includes('music')) return '🎵';
  if (name.includes('drawing')) return '✏️';
  if (name.includes('2-d art')) return '🎨';
  if (name.includes('3-d art')) return '🗿';
  if (name.includes('film')) return '🎬';
  if (name.includes('drama')) return '🎭';
  if (name.includes('choir')) return '🎤';
  if (name.includes('band')) return '🎺';
  
  // Elementary subjects
  if (name.includes('elementary reading')) return '📗';
  if (name.includes('elementary writing')) return '✍️';
  if (name.includes('elementary math')) return '🔢';
  if (name.includes('elementary science')) return '🔎';
  if (name.includes('elementary social')) return '🏫';
  
  // Middle School subjects
  if (name.includes('6th grade')) return '6️⃣';
  if (name.includes('7th grade')) return '7️⃣';
  if (name.includes('8th grade')) return '8️⃣';
  if (name.includes('pre-algebra')) return '🧩';
  
  // High School specific
  if (name.includes('personal finance')) return '💰';
  if (name.includes('health')) return '❤️';
  if (name.includes('physical education')) return '🏃';
  if (name.includes('study skills')) return '📝';
  
  // AP Capstone
  if (name.includes('ap seminar')) return '🔍';
  if (name.includes('ap research')) return '🔬';
  
  // Other common subjects with generic terms
  if (name.includes('english') && !name.includes('ap')) return '📚';
  if (name.includes('history') && !name.includes('ap')) return '📜';
  if (name.includes('computer') && !name.includes('ap')) return '💻';
  if (name.includes('writing') && !name.includes('ap')) return '✍️';
  if (name.includes('physics') && !name.includes('ap')) return '⚛️';
  
  // Default to category emoji
  return categoryEmojis[subject.category] || '📚';
}
