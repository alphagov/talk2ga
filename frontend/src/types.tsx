import type { Operation } from 'fast-json-patch';
import type { RunState } from './useStreamLog';

export type FrontendDateRange = [Date | null, Date | null];
export type BackendDateRange = { start_date: string; end_date: string };

export interface StreamCallback {
  onSuccess?: (ctx: {
    question: string;
    dateRange?: FrontendDateRange;
    output: unknown;
    logs?: string;
  }) => void;
  onChunk?: (
    chunk: { ops?: Operation[] },
    aggregatedState: RunState | null,
  ) => void;
  onError?: (error: unknown) => void;
  onStart?: (ctx: {
    question: string;
    dateRange?: FrontendDateRange;
    questionId?: string;
  }) => void;
  onComplete?: () => void;
}
