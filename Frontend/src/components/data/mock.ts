import type { CategoryColor } from '../theme';
import type { IconName } from '../components/ui/Icon';

export const user = {
  name: 'Alex Laurent',
  firstName: 'Alex',
  initials: 'AL',
  handle: '@alex',
  level: 12,
  xp: 1240,
  nextLevelXp: 1500,
  streak: 7,
  bestStreak: 14,
  quizzes: 86,
  accuracy: 82,
};

export type Tag = 'popular' | 'new' | 'trending';

export interface Category {
  id: string;
  name: string;
  icon: IconName;
  color: CategoryColor;
  questions: number;
  players: string;
  tags: Tag[];
}

export const categories: Category[] = [
  { id: 'science', name: 'Science', icon: 'flask', color: 'blue', questions: 312, players: '4.8k', tags: ['popular', 'trending'] },
  { id: 'history', name: 'History', icon: 'landmark', color: 'orange', questions: 248, players: '3.1k', tags: ['popular'] },
  { id: 'geography', name: 'Geography', icon: 'globe', color: 'green', questions: 275, players: '2.9k', tags: ['trending'] },
  { id: 'movies', name: 'Movies', icon: 'film', color: 'pink', questions: 190, players: '3.6k', tags: ['popular', 'new'] },
  { id: 'music', name: 'Music', icon: 'music', color: 'purple', questions: 164, players: '2.2k', tags: ['new'] },
  { id: 'sports', name: 'Sports', icon: 'activity', color: 'teal', questions: 210, players: '2.7k', tags: ['trending'] },
];

export const getCategory = (id?: string) =>
  categories.find((c) => c.id === id) ?? categories[0];

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const questionBank: Question[] = [
  { id: 'q1', text: 'Which planet has the shortest orbital period around the Sun?', options: ['Mercury', 'Venus', 'Mars', 'Earth'], correctIndex: 0, explanation: 'Mercury completes an orbit in just 88 Earth days, the fastest of any planet in our solar system.' },
  { id: 'q2', text: 'What is the chemical symbol for gold?', options: ['Ag', 'Au', 'Gd', 'Go'], correctIndex: 1, explanation: 'Au comes from the Latin word "aurum", meaning gold.' },
  { id: 'q3', text: 'Which gas do plants absorb from the atmosphere for photosynthesis?', options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'], correctIndex: 2, explanation: 'Plants take in carbon dioxide and, using sunlight, convert it into glucose and oxygen.' },
  { id: 'q4', text: 'How many bones are in the adult human body?', options: ['186', '206', '226', '246'], correctIndex: 1, explanation: 'Babies are born with around 300 bones that fuse together into 206 by adulthood.' },
  { id: 'q5', text: 'What is the hardest natural substance on Earth?', options: ['Quartz', 'Steel', 'Diamond', 'Topaz'], correctIndex: 2, explanation: 'Diamond ranks 10 on the Mohs hardness scale, the highest of any natural material.' },
  { id: 'q6', text: 'Which part of the cell contains genetic material?', options: ['Ribosome', 'Nucleus', 'Mitochondria', 'Membrane'], correctIndex: 1, explanation: 'The nucleus stores the cell’s DNA and controls its activities.' },
  { id: 'q7', text: 'What is the speed of light in a vacuum (approx.)?', options: ['300,000 km/s', '150,000 km/s', '30,000 km/s', '3,000,000 km/s'], correctIndex: 0, explanation: 'Light travels at roughly 299,792 kilometres per second in a vacuum.' },
  { id: 'q8', text: 'Which blood type is known as the universal donor?', options: ['A+', 'AB-', 'O-', 'B+'], correctIndex: 2, explanation: 'O negative red cells can be given to almost any patient in an emergency.' },
  { id: 'q9', text: 'What force keeps planets in orbit around the Sun?', options: ['Magnetism', 'Friction', 'Gravity', 'Inertia'], correctIndex: 2, explanation: 'The Sun’s gravity constantly pulls planets toward it, bending their paths into orbits.' },
  { id: 'q10', text: 'Which element has the atomic number 1?', options: ['Helium', 'Oxygen', 'Lithium', 'Hydrogen'], correctIndex: 3, explanation: 'Hydrogen is the lightest and most abundant element in the universe.' },
  { id: 'q11', text: 'What is the largest organ of the human body?', options: ['Liver', 'Skin', 'Lungs', 'Brain'], correctIndex: 1, explanation: 'The skin covers around 2 square metres in an average adult.' },
  { id: 'q12', text: 'Which planet is known as the Red Planet?', options: ['Jupiter', 'Mars', 'Saturn', 'Mercury'], correctIndex: 1, explanation: 'Iron oxide on its surface gives Mars its reddish colour.' },
  { id: 'q13', text: 'What is the boiling point of water at sea level?', options: ['90 °C', '95 °C', '100 °C', '110 °C'], correctIndex: 2, explanation: 'Water boils at 100 °C (212 °F) at standard atmospheric pressure.' },
  { id: 'q14', text: 'Who proposed the theory of general relativity?', options: ['Isaac Newton', 'Albert Einstein', 'Niels Bohr', 'Galileo Galilei'], correctIndex: 1, explanation: 'Einstein published general relativity in 1915, redefining our understanding of gravity.' },
  { id: 'q15', text: 'Which vitamin is produced when skin is exposed to sunlight?', options: ['Vitamin A', 'Vitamin C', 'Vitamin D', 'Vitamin K'], correctIndex: 2, explanation: 'Sunlight triggers the skin to synthesise vitamin D.' },
  { id: 'q16', text: 'What is the most abundant gas in Earth’s atmosphere?', options: ['Oxygen', 'Nitrogen', 'Argon', 'Carbon dioxide'], correctIndex: 1, explanation: 'Nitrogen makes up about 78% of the air we breathe.' },
  { id: 'q17', text: 'How many chambers does the human heart have?', options: ['Two', 'Three', 'Four', 'Five'], correctIndex: 2, explanation: 'Two atria and two ventricles make up the four chambers.' },
  { id: 'q18', text: 'What type of animal is a Komodo dragon?', options: ['Snake', 'Lizard', 'Crocodile', 'Salamander'], correctIndex: 1, explanation: 'The Komodo dragon is the largest living species of lizard.' },
  { id: 'q19', text: 'Which scientist discovered penicillin?', options: ['Louis Pasteur', 'Marie Curie', 'Alexander Fleming', 'Joseph Lister'], correctIndex: 2, explanation: 'Alexander Fleming noticed mould killing bacteria in 1928.' },
  { id: 'q20', text: 'What is the unit of electrical resistance?', options: ['Volt', 'Ohm', 'Watt', 'Ampere'], correctIndex: 1, explanation: 'The ohm (Ω) is named after physicist Georg Ohm.' },
];

export const getQuestions = (count: number) => questionBank.slice(0, Math.min(count, questionBank.length));

export interface Achievement {
  id: string;
  label: string;
  icon: IconName;
  color?: CategoryColor;
  locked?: boolean;
}

export const achievements: Achievement[] = [
  { id: 'fire', label: 'On fire', icon: 'flame', color: 'orange' },
  { id: 'perfect', label: 'Perfect', icon: 'target', color: 'purple' },
  { id: 'speedy', label: 'Speedy', icon: 'zap', color: 'blue' },
  { id: 'locked', label: 'Locked', icon: 'lock', locked: true },
];

export type Period = 'weekly' | 'monthly' | 'all';

export interface Player {
  rank: number;
  name: string;
  initials: string;
  xp: number;
  color: CategoryColor;
  isMe?: boolean;
}

const weekly: Player[] = [
  { rank: 1, name: 'Mia Johnson', initials: 'MJ', xp: 2860, color: 'pink' },
  { rank: 2, name: 'Sam Kim', initials: 'SK', xp: 2540, color: 'purple' },
  { rank: 3, name: 'Noah Bergeron', initials: 'NB', xp: 2310, color: 'teal' },
  { rank: 4, name: 'Lea Tremblay', initials: 'LT', xp: 2120, color: 'orange' },
  { rank: 5, name: 'Omar Haddad', initials: 'OH', xp: 1980, color: 'blue' },
  { rank: 6, name: 'Chloé Roy', initials: 'CR', xp: 1760, color: 'green' },
  { rank: 12, name: 'Alex Laurent (You)', initials: 'AL', xp: 1240, color: 'blue', isMe: true },
];

const multiplier: Record<Period, number> = { weekly: 1, monthly: 4, all: 15 };

export const getLeaderboard = (period: Period): Player[] =>
  weekly.map((p) => ({ ...p, xp: p.xp * multiplier[period] }));

export const periods: { id: Period; label: string }[] = [
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'all', label: 'All time' },
];
