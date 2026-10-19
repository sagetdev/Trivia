import { useCallback, useEffect, useState } from 'react';
import { api, type QuizCategory } from '../lib/api';
import type { CategoryColor } from '../theme';
import type { IconName } from '../components/ui/Icon';

export interface Category {
  id: string;
  name: string;
  icon: IconName;
  color: CategoryColor;
}

export const MIXED: Category = { id: 'any', name: 'Mixed', icon: 'target', color: 'purple' };

const palette: CategoryColor[] = ['blue', 'orange', 'green', 'pink', 'purple', 'teal'];

const rules: { re: RegExp; icon: IconName; color: CategoryColor }[] = [
  { re: /film|television|cartoon|anime|comics/i, icon: 'film', color: 'pink' },
  { re: /music/i, icon: 'music', color: 'purple' },
  { re: /science|computers|mathematics|gadgets/i, icon: 'flask', color: 'blue' },
  { re: /history|politic|mythology|art/i, icon: 'landmark', color: 'orange' },
  { re: /geography|animals/i, icon: 'globe', color: 'green' },
  { re: /sports|vehicles/i, icon: 'activity', color: 'teal' },
];

export const shortName = (name: string) => name.replace(/^(Entertainment|Science): /, '');

const toCategory = (c: QuizCategory): Category => {
  const rule = rules.find((r) => r.re.test(c.name));
  return {
    id: String(c.id),
    name: shortName(c.name),
    icon: rule?.icon ?? 'help',
    color: rule?.color ?? palette[c.id % palette.length],
  };
};

let cache: Category[] | null = null;
let inflight: Promise<Category[]> | null = null;

export function loadCategories(): Promise<Category[]> {
  if (cache) return Promise.resolve(cache);
  inflight ??= api
    .getCategories()
    .then((list) => (cache = list.map(toCategory)))
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export const findCategory = (id?: string): Category =>
  cache?.find((c) => c.id === id) ?? MIXED;

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    loadCategories()
      .then(setCategories)
      .catch((e) => setError(e instanceof Error ? e.message : 'Erreur inconnue'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!cache) load();
  }, [load]);

  return { categories, loading, error, reload: load };
}