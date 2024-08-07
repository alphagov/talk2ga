import { useCallback, useRef, useState } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { resolveApiUrl } from './utils/url';
import { FrontendDateRange, StreamCallback } from './types';
import { dateRangeFrontendToDateRangeBackend } from './utils/dates';

export interface LogEntry {
  // ID of the sub-run.
  id: string;
  // Name of the object being run.
  name: string;
  // Type of the object being run, eg. prompt, chain, llm, etc.
  type: string;
  // List of tags for the run.
  tags: string[];
  // Key-value pairs of metadata for the run.
  metadata: { [key: string]: unknown };
  // ISO-8601 timestamp of when the run started.
  start_time: string;
  // List of LLM tokens streamed by this run, if applicable.
  streamed_output_str: string[];
  // Final output of this run.
  // Only available after the run has finished successfully.
  final_output?: unknown;
  // ISO-8601 timestamp of when the run ended.
  // Only available after the run has finished.
  end_time?: string;
}

export interface RunState {
  // ID of the run.
  id: string;
  // List of output chunks streamed by Runnable.stream()
  streamed_output: unknown[];
  // Final output of the run, usually the result of aggregating (`+`) streamed_output.
  // Only available after the run has finished successfully.
  final_output?: unknown;

  // Map of run names to sub-runs. If filters were supplied, this list will
  // contain only the runs that matched the filters.
  logs: { [name: string]: LogEntry };
}

export function useStreamLog(callbacks: StreamCallback = {}) {
  const [latest, setLatest] = useState<RunState | null>(null);
  const [controller, setController] = useState<AbortController | null>(null);

  const startRef = useRef(callbacks.onStart);
  startRef.current = callbacks.onStart;

  const chunkRef = useRef(callbacks.onChunk);
  chunkRef.current = callbacks.onChunk;

  const successRef = useRef(callbacks.onSuccess);
  successRef.current = callbacks.onSuccess;

  const errorRef = useRef(callbacks.onError);
  errorRef.current = callbacks.onError;

  const completionRef = useRef(callbacks.onComplete);
  completionRef.current = callbacks.onComplete;

  const startStream = useCallback(
    async (
      question: string,
      dateRange: FrontendDateRange,
      config?: unknown,
    ) => {
      const controller = new AbortController();
      setController(controller);

      let innerLatest: RunState | null = null;

      const payload = JSON.stringify({
        question,
        dateRange: dateRangeFrontendToDateRangeBackend(dateRange),
      });

      await fetchEventSource(resolveApiUrl(`/custom_chain`).toString(), {
        signal: controller.signal,
        method: 'POST',
        body: JSON.stringify({ input: payload, config }),
        headers: { 'Content-Type': 'application/json' },
        async onopen(response) {
          if (response.ok && response.headers.get('X-Question-Uid')) {
            startRef.current?.({
              question,
              dateRange,
              questionId: response.headers.get('X-Question-Uid') as string,
            });
          }
        },
        onmessage(event) {
          const eventData = JSON.parse(event.data);
          if (
            eventData['event_type'] === 'on_chain_end' &&
            eventData['event_name'] === 'wrapper'
          ) {
            innerLatest = eventData['output'];
            setLatest(innerLatest);
          } else if (eventData['event_type'] === 'error') {
            completionRef.current?.();
            errorRef.current?.(eventData['error_class']);
          }
        },
        openWhenHidden: true,
        onclose() {
          setController(null);
          completionRef.current?.();
          successRef.current?.({
            question,
            dateRange,
            output: innerLatest?.final_output,
            logs:
              (innerLatest && JSON.stringify(innerLatest.logs)) || undefined,
          });
        },
        // onerror(error) {
        //   console.log('ON ERROR');
        //   setController(null);
        //   // errorRef.current?.();
        //   throw error;
        // },
      });
    },
    [],
  );

  const stopStream = useCallback(() => {
    controller?.abort();
    setController(null);
  }, [controller]);

  return {
    startStream,
    stopStream: controller ? stopStream : undefined,
    latest,
  };
}
