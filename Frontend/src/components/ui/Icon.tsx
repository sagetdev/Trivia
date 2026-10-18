import React from 'react';
import {
  Activity, Bell, Check, ChevronLeft, ChevronRight, CircleHelp, Clock, Film, Flame,
  FlaskConical, Globe, House, Landmark, Lock, Moon, Music, Pencil, Search, Settings,
  Shield, Target, Trophy, User, Volume2, X, Zap,
} from 'lucide-react-native';
import { colors } from '../../theme';

export const icons = {
  activity: Activity,
  bell: Bell,
  check: Check,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  help: CircleHelp,
  clock: Clock,
  film: Film,
  flame: Flame,
  flask: FlaskConical,
  globe: Globe,
  home: House,
  landmark: Landmark,
  lock: Lock,
  moon: Moon,
  music: Music,
  pencil: Pencil,
  search: Search,
  settings: Settings,
  shield: Shield,
  target: Target,
  trophy: Trophy,
  user: User,
  volume: Volume2,
  x: X,
  zap: Zap,
} as const;

export type IconName = keyof typeof icons;

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 20, color = colors.text, strokeWidth = 2 }: Props) {
  const Cmp = icons[name];
  return <Cmp size={size} color={color} strokeWidth={strokeWidth} />;
}
