import {
  MutableRefObject,
  createContext,
  useContext,
  useEffect,
  useRef,
} from 'react';

import { StreamCallback } from './types';

export const AppCallbackContext = createContext<MutableRefObject<{
  onStart: Exclude<StreamCallback['onStart'], undefined>[];
  onChunk: Exclude<StreamCallback['onChunk'], undefined>[];
  onSuccess: Exclude<StreamCallback['onSuccess'], undefined>[];
  onError: Exclude<StreamCallback['onError'], undefined>[];
}> | null>(null);

export function useAppStreamCallbacks() {
  // callbacks handling
  const context = useRef<{
    onStart: Record<string, Exclude<StreamCallback['onStart'], undefined>>;
    onChunk: Record<string, Exclude<StreamCallback['onChunk'], undefined>>;
    onSuccess: Record<string, Exclude<StreamCallback['onSuccess'], undefined>>;
    onError: Record<string, Exclude<StreamCallback['onError'], undefined>>;
    onComplete: Record<
      string,
      Exclude<StreamCallback['onComplete'], undefined>
    >;
  }>({ onStart: {}, onChunk: {}, onSuccess: {}, onError: {}, onComplete: {} });

  const callbacks: StreamCallback = {
    onStart(...args) {
      for (const key in context.current.onStart) {
        if (typeof context.current.onStart[key] === 'function') {
          context.current.onStart[key](...args);
        }
      }
    },
    onChunk(...args) {
      for (const key in context.current.onChunk) {
        if (typeof context.current.onChunk[key] === 'function') {
          context.current.onChunk[key](...args);
        }
      }
    },
    onSuccess(...args) {
      for (const key in context.current.onSuccess) {
        if (typeof context.current.onSuccess[key] === 'function') {
          context.current.onSuccess[key](...args);
        }
      }
    },
    onError(...args) {
      for (const key in context.current.onError) {
        if (typeof context.current.onError[key] === 'function') {
          context.current.onError[key](...args);
        }
      }
    },
    onComplete(...args) {
      for (const key in context.current.onComplete) {
        if (typeof context.current.onComplete[key] === 'function') {
          context.current.onComplete[key](...args);
        }
      }
    },
  };

  return { context, callbacks };
}

export function useStreamCallback<
  Type extends 'onStart' | 'onChunk' | 'onSuccess' | 'onError' | 'onComplete',
>(type: Type, callback: Exclude<StreamCallback[Type], undefined>) {
  type CallbackType = Exclude<StreamCallback[Type], undefined>;

  const appCbRef = useContext(AppCallbackContext);

  const callbackRef = useRef<CallbackType>(callback);
  callbackRef.current = callback;

  useEffect(() => {
    // @ts-expect-error Not sure why I can't expand the tuple
    const current = (...args) => callbackRef.current?.(...args);
    appCbRef?.current[type as keyof typeof appCbRef.current].push(current);

    return () => {
      if (!appCbRef) return;

      // @ts-expect-error Assingability issues due to the tuple object
      // eslint-disable-next-line react-hooks/exhaustive-deps
      appCbRef.current[type as keyof typeof appCbRef.current] =
        appCbRef.current[type as keyof typeof appCbRef.current].filter(
          (callbacks) => callbacks !== current,
        );
    };
  }, [type, appCbRef]);
}
