import type { Operation } from 'fast-json-patch';
import type { RunState } from './useStreamLog';
import { DateRange } from 'rsuite/esm/DateRangePicker';

export interface StreamCallback {
  onSuccess?: (ctx: {
    question: string;
    dateRange?: DateRange;
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
    dateRange?: DateRange;
    questionId?: string;
  }) => void;
  onComplete?: () => void;
}
