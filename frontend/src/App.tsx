import "./App.css";

import { useEffect, useRef, useState } from "react";
import { useStreamLog } from "./useStreamLog";
import { useAppStreamCallbacks } from "./useStreamCallback";
import { streamOutputToString } from "./utils/streamToString";
import { MainAnswer } from "./components/MainAnswer";
import ErrorAnswer from "./components/ErrorAnswer";
import {
  NotSatisfiedDetailsPayload,
  useQuestions,
} from "./useQuestionAnalytics";
import Feedback from "./components/Feedback";
import SQLViewer from "./components/SQLViewer";

import QuestionInput from "./components/QuestionInput";
import TypeWriterLoading from "./components/TypeWriterLoading";
import Logs from "./components/Logs";

type DurationTrack = {
  startTime?: Date;
  endTime?: Date;
  durationMs?: number;
};

const DEFAULT_DURATION_TRACK: DurationTrack = {};

function Playground() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showSQLBtnActive, setShowSQLBtnActive] = useState(false);
  const [question, setQuestion] = useState<string | null>(null);
  const [duration, setDuration] = useState<DurationTrack>(
    DEFAULT_DURATION_TRACK
  );
  const [isError, setIsError] = useState(false);

  const [hasCompleted, setHasCompleted] = useState<boolean>(false);

  const { context, callbacks } = useAppStreamCallbacks();

  const { startStream, stopStream, latest } = useStreamLog(callbacks);

  const {
    recordQuestion,
    recordQuestionCompletion,
    recordFeedbackSatisfied,
    recordFeedbackNotSatisfied,
    recordFeedbackNotSatisfiedDetails,
    currentQuestionId,
  } = useQuestions();

  const showLogsRef = useRef<(() => void) | null>(null);
  showLogsRef.current = () => {
    setShowLogs(() => !showLogs);
  };

  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        showLogsRef.current?.();
      }
    });
  }, []);

  /* Callbacks for ASK QUESTION */
  useEffect(() => {
    /**
     * OnStart
     */
    context.current.onStart["setDurationStart"] = () =>
      setDuration({ ...DEFAULT_DURATION_TRACK, startTime: new Date() });
    context.current.onStart["setQuestion"] = ({ input }) =>
      setQuestion(input as string);
    context.current.onStart["recordQuestion"] = ({ input }) =>
      recordQuestion(input as string);
    context.current.onStart["setIsStreaming"] = () => setIsStreaming(true);
    context.current.onStart["setHasCompletedFalse"] = () =>
      setHasCompleted(false);

    /**
     * OnComplete
     */
    context.current.onComplete["recordCompletion"] = () => {
      const endTime = new Date();
      const durationMs =
        duration.startTime && endTime.getTime() - duration.startTime.getTime();
      currentQuestionId &&
        recordQuestionCompletion(currentQuestionId, {
          logs_json: latest && JSON.stringify(latest.logs),
          duration: durationMs,
        });
      setDuration({ ...duration, endTime, durationMs });
    };
    context.current.onComplete["setIsNotStreaming"] = () =>
      setIsStreaming(false);
    context.current.onComplete["setHasCompletedTrue"] = () =>
      setHasCompleted(true);

    /**
     * OnSuccess
     */
    context.current.onSuccess["recordSuccess"] = () => {
      currentQuestionId &&
        recordQuestionCompletion(currentQuestionId, {
          succeeded: true,
          final_output: latest && streamOutputToString(latest.streamed_output),
        });
    };

    /**
     * OnError
     */
    context.current.onError["setIsErrorTrue"] = () => setIsError(true);
    context.current.onError["recordFailure"] = () => {
      currentQuestionId &&
        recordQuestionCompletion(currentQuestionId, { succeeded: false });
    };
  }, [latest, latest?.logs, latest?.final_output, currentQuestionId]);

  const onSatisfiedFeedback = () => {
    currentQuestionId && recordFeedbackSatisfied(currentQuestionId);
  };

  const onNotSatisfiedFeedback = () => {
    currentQuestionId && recordFeedbackNotSatisfied(currentQuestionId);
  };

  const onNotSatisfiedFeedbackDetailsSubmit = ({
    feedbackText,
    feedbackSql,
  }: NotSatisfiedDetailsPayload) => {
    currentQuestionId &&
      recordFeedbackNotSatisfiedDetails(currentQuestionId, {
        feedbackText,
        feedbackSql,
      });
  };

  const getSqlFromLogs = () =>
    latest &&
    latest.logs &&
    (Object.values(latest.logs) as any[]).find(
      (l) => l.name === "remove_sql_quotes"
    )?.final_output?.output;

  const isLoading = isStreaming && !hasCompleted;

  const handleToggleShowSQL = () =>
    setShowSQLBtnActive(() => !showSQLBtnActive);

  const showSql = hasCompleted && showSQLBtnActive;
  const successful = hasCompleted && !isError;

  return (
    <>
      <h1 className="govuk-heading-xl">Chat Analytics</h1>
      <div className="govuk-grid-row">
        <div
          className={
            showSql ? "govuk-grid-column-one-half" : "govuk-grid-column-full"
          }
        >
          <QuestionInput
            handleSubmitQuestion={startStream}
            handleStopStreaming={stopStream}
            isStreaming={isStreaming}
            toggleShowLogs={showLogsRef.current}
            toggleShowSQL={handleToggleShowSQL}
            showLogs={showLogs}
            showSQLBtnActive={showSQLBtnActive}
            hasCompleted={hasCompleted}
          />
          {isLoading && <TypeWriterLoading />}
          {successful && latest && (
            <MainAnswer>
              {streamOutputToString(latest.streamed_output)}
            </MainAnswer>
          )}
          {isError && <ErrorAnswer />}
          {hasCompleted && (
            <Feedback
              handleSatisfiedFeedback={onSatisfiedFeedback}
              handleNotSatisfiedFeedback={onNotSatisfiedFeedback}
              handleNotSatisfiedFeedbackFormSubmit={
                onNotSatisfiedFeedbackDetailsSubmit
              }
            />
          )}
        </div>
        {showSql && question && (
          <div className="govuk-grid-column-one-half">
            <SQLViewer
              question={question}
              sql={hasCompleted ? getSqlFromLogs() : undefined}
            />
          </div>
        )}
      </div>
      <div className="govuk-grid-row">
        {showLogs && latest && latest.logs && <Logs logs={latest.logs} />}
      </div>
    </>
  );
}

export function App() {
  return <Playground />;
}

export default App;
