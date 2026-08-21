import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';

import { FeedSelection, Quake } from '../api/types';
import { FeedController, useFeedController } from '../hooks/useFeedController';
import { Query, applyQuery, defaultQuery } from '../lib/query';

const DEFAULT_SELECTION: FeedSelection = { magnitude: 'all', window: 'day' };
const CLOCK_INTERVAL_MS = 30 * 1000;

interface FeedContextValue {
  controller: FeedController;
  query: Query;
  setQuery: (query: Query) => void;
  visibleQuakes: Quake[];
  totalQuakes: number;
  now: number;
  findQuake: (id: string) => Quake | undefined;
}

const FeedContext = createContext<FeedContextValue | null>(null);

export function FeedProvider({ children }: { children: ReactNode }) {
  const controller = useFeedController(DEFAULT_SELECTION);
  const [query, setQuery] = useState<Query>(defaultQuery);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), CLOCK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const quakes = controller.feed?.quakes ?? [];

  const visibleQuakes = useMemo(() => applyQuery(quakes, query), [quakes, query]);

  const value = useMemo<FeedContextValue>(
    () => ({
      controller,
      query,
      setQuery,
      visibleQuakes,
      totalQuakes: quakes.length,
      now,
      findQuake: (id: string) => quakes.find((quake) => quake.id === id),
    }),
    [controller, query, visibleQuakes, quakes, now],
  );

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
}

export function useFeed(): FeedContextValue {
  const value = useContext(FeedContext);
  if (value === null) throw new Error('useFeed must be used inside FeedProvider');
  return value;
}
