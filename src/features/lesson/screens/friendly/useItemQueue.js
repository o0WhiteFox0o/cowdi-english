import { useState, useMemo, useCallback, useRef } from 'react';
import { createRng } from '../seededRandom.js';
import {
  createQueueState,
  advanceQueueState,
  summarizeQueueState,
} from './friendlyLogic.js';

export { createQueueState, advanceQueueState, summarizeQueueState };

export function useItemQueue(items, seed = 1) {
  const rngRef = useRef(null);
  if (!rngRef.current) rngRef.current = createRng(seed);

  const [state, setState] = useState(() => createQueueState(items));

  const current = !state.done ? state.queue[state.cursor] || null : null;

  const submit = useCallback((correct) => {
    let nextSnap = null;
    setState((prev) => {
      nextSnap = advanceQueueState(prev, { correct, rng: rngRef.current });
      return nextSnap;
    });
    return nextSnap;
  }, []);

  const summary = useMemo(() => summarizeQueueState(state), [state]);

  return {
    state,
    current,
    cursor: state.cursor,
    totalSteps: state.queue.length,
    done: state.done,
    submit,
    summary,
  };
}
