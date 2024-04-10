import type { Operation } from "fast-json-patch";
import type { RunState } from "./useStreamLog";

export interface StreamCallback {
  onSuccess?: (ctx: { input: unknown; output: unknown }) => void;
  onChunk?: (
    chunk: { ops?: Operation[] },
    aggregatedState: RunState | null
  ) => void;
  onError?: (error: unknown) => void;
  onStart?: (ctx: { input: unknown; questionId: string }) => void;
  onComplete?: () => void;
}
