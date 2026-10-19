import type { CategoryColor } from '../../theme';
import type { IconName } from '../ui/Icon';

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

export interface Player {
  rank: number;
  name: string;
  initials: string;
  score: number;
  total: number;
  color: CategoryColor;
  isMe?: boolean;
}
