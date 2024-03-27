import "./App.css";

import { useEffect, useRef, useState } from "react";
import { useStreamLog } from "./useStreamLog";
import { useAppStreamCallbacks } from "./useStreamCallback";
import { str } from "./utils/str";
import { StreamOutput, streamOutputToString } from "./components/StreamOutput";
import {
  NotSatisfiedDetailsPayload,
  useQuestions,
} from "./useQuestionAnalytics";
import Feedback from "./components/Feedback";
import SQLViewer from "./components/SQLViewer";
import { useStreamLogExplain } from "./useStreamLogExplain";
import QuestionInput from "./components/QuestionInput";
import TypeWriterLoading from "./components/TypeWriterLoading";

function Playground() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showSQLBtnActive, setShowSQLBtnActive] = useState(false);

  const [hasCompleted, setHasCompleted] = useState<boolean>(false);

  const { context, callbacks } = useAppStreamCallbacks();
  const { startStream, stopStream, latest } = useStreamLog(callbacks);
  const { startStreamExplain, stopStreamExplain, latestExplain } =
    useStreamLogExplain(callbacks);
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

  useEffect(() => {
    // OnStart callbacks
    context.current.onStart["recordQuestion"] = ({ input }) =>
      recordQuestion(input as string);
    context.current.onStart["setIsStreaming"] = () => setIsStreaming(true);
    context.current.onStart["setHasCompletedFalse"] = () =>
      setHasCompleted(false);

    // OnSuccess callbacks
    context.current.onSuccess["recordSuccess"] = () =>
      currentQuestionId &&
      recordQuestionCompletion(currentQuestionId, {
        succeeded: true,
        logs_json: latest && JSON.stringify(latest.logs),
        final_output: latest && streamOutputToString(latest.streamed_output),
      });
    context.current.onSuccess["setIsNotStreaming"] = () =>
      setIsStreaming(false);
    context.current.onSuccess["setHasCompletedTrue"] = () =>
      setHasCompleted(true);

    // OnError callbacks
    context.current.onError["recordQuestionFailure"] = () =>
      currentQuestionId &&
      recordQuestionCompletion(currentQuestionId, { succeeded: false });
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
    Object.values(latest.logs)
      .find((l) => l.name === "RunnableParallel<pure_sql,question>")
      ?.final_output?.pure_sql.replace("\\n", " ");

  const handleExplainSQLClick = () =>
    startStreamExplain(question, getSqlFromLogs());

  const isLoading = isStreaming && !hasCompleted;

  const handleToggleShowSQL = () =>
    setShowSQLBtnActive(() => !showSQLBtnActive);

  const showSql = hasCompleted && showSQLBtnActive;

  return (
    <>
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
            hasCompleted={hasCompleted}
          />
          {isLoading && <TypeWriterLoading />}
          {hasCompleted && latest && (
            <StreamOutput>
              {streamOutputToString(latest.streamed_output)}
            </StreamOutput>
          )}
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
        {showSql && (
          <div className="govuk-grid-column-one-half">
            <SQLViewer sql={hasCompleted ? getSqlFromLogs() : undefined} />
            <button
              onClick={handleExplainSQLClick}
              className="govuk-button"
              data-module="govuk-button"
            >
              Explain
            </button>
          </div>
        )}
      </div>
      <div className="govuk-grid-row">
        {showLogs &&
          latest &&
          latest.logs &&
          Object.values(latest.logs).map((log) => {
            return (
              <>
                <p>
                  <strong className="text-sm font-medium">{log.name}</strong>
                </p>
                <p>{str(log.final_output) ?? "..."}</p>
                <br />
              </>
            );
          })}
      </div>
    </>
  );
}

export function App() {
  return <Playground />;
}

export default App;
