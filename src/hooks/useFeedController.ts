import { useCallback, useEffect, useMemo, useState } from 'react';

import { Feed, FeedSelection } from '../api/types';
import { fetchFeed } from '../api/usgs';
import { isStale, readCachedFeed, writeCachedFeed } from '../cache/feedCache';

export type FeedStatus = 'loading' | 'ready' | 'error';

export type FeedSource = 'network' | 'cache';

export interface FeedController {
  feed: Feed | null;
  status: FeedStatus;
  source: FeedSource | null;
  storedAt: number | null;
  isRefreshing: boolean;
  isOffline: boolean;
  error: string | null;
  selection: FeedSelection;
  setSelection: (selection: FeedSelection) => void;
  refresh: () => void;
}

interface State {
  feed: Feed | null;
  status: FeedStatus;
  source: FeedSource | null;
  storedAt: number | null;
  isRefreshing: boolean;
  isOffline: boolean;
  error: string | null;
}

const initialState: State = {
  feed: null,
  status: 'loading',
  source: null,
  storedAt: null,
  isRefreshing: false,
  isOffline: false,
  error: null,
};

function describeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Unknown error';
}

export function useFeedController(initialSelection: FeedSelection): FeedController {
  const [selection, setSelectionState] = useState<FeedSelection>(initialSelection);
  const [state, setState] = useState<State>(initialState);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function load() {
      const cached = await readCachedFeed(selection);
      if (!active) return;

      if (cached !== null) {
        setState({
          feed: cached.feed,
          status: 'ready',
          source: 'cache',
          storedAt: cached.storedAt,
          isRefreshing: isStale(cached.storedAt, Date.now()),
          isOffline: false,
          error: null,
        });
        if (!isStale(cached.storedAt, Date.now())) return;
      } else {
        setState((current) => ({ ...current, status: 'loading', isRefreshing: true, error: null }));
      }

      try {
        const feed = await fetchFeed(selection, controller.signal);
        if (!active) return;
        const storedAt = Date.now();
        await writeCachedFeed(feed, storedAt);
        if (!active) return;
        setState({
          feed,
          status: 'ready',
          source: 'network',
          storedAt,
          isRefreshing: false,
          isOffline: false,
          error: null,
        });
      } catch (error) {
        if (!active || controller.signal.aborted) return;
        setState((current) => ({
          ...current,
          status: current.feed === null ? 'error' : 'ready',
          isRefreshing: false,
          isOffline: current.feed !== null,
          error: describeError(error),
        }));
      }
    }

    void load();

    return () => {
      active = false;
      controller.abort();
    };
  }, [selection, refreshToken]);

  const setSelection = useCallback((next: FeedSelection) => {
    setSelectionState((current) => {
      if (current.magnitude === next.magnitude && current.window === next.window) return current;
      return next;
    });
  }, []);

  const refresh = useCallback(() => {
    setState((current) => ({ ...current, isRefreshing: true }));
    setRefreshToken((token) => token + 1);
  }, []);

  return useMemo<FeedController>(
    () => ({ ...state, selection, setSelection, refresh }),
    [state, selection, setSelection, refresh],
  );
}
