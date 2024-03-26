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

type InputData = {
  data: string;
  errors: string[];
};

type QuestionInputProps = {
  handleSubmitQuestion: (data: string) => void;
  handleStopStreaming?: () => void;
  isStreaming: boolean;
  toggleShowLogs: () => void;
  showLogs: boolean;
};

function QuestionInput({
  handleSubmitQuestion,
  handleStopStreaming,
  isStreaming,
  toggleShowLogs,
  showLogs,
}: QuestionInputProps) {
  const [inputData, setInputData] = useState<InputData>({
    data: "",
    errors: [],
  });

  const submitRef = useRef<(() => void) | null>(null);
  submitRef.current = () => {
    if (isStreaming) {
      handleStopStreaming && handleStopStreaming();
    } else {
      handleSubmitQuestion(inputData.data);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        submitRef.current?.();
      }
    });
  }, []);

  return (
    <div>
      <div className="govuk-form-group">
        <h1 className="govuk-label-wrapper">
          <label className="govuk-label govuk-label--l">
            What is your question?
          </label>
        </h1>
        <div id="more-detail-hint" className="govuk-hint">
          It is better to provide specific URLs or page titles
        </div>
        <textarea
          className="govuk-textarea"
          id="more-detail"
          name="moreDetail"
          rows={1}
          aria-describedby="more-detail-hint"
          value={inputData.data}
          onChange={(e) => {
            const target = e.target as HTMLTextAreaElement;
            setInputData({ data: target.value, errors: [] });
          }}
        ></textarea>
      </div>
      <button
        onClick={submitRef.current}
        type="submit"
        className="govuk-button"
        data-module="govuk-button"
      >
        {isStreaming ? "Abort" : "Submit"}
      </button>
      <button
        onClick={toggleShowLogs}
        type="submit"
        className="govuk-button"
        data-module="govuk-button"
      >
        {showLogs ? "Hide Logs" : "Show Logs"}
      </button>
    </div>
  );
}

const Typewriter = ({ text, delay }: { text: string; delay: number }) => {
  const [currentText, setCurrentText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText((prevText) => prevText + text[currentIndex]);
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]); // Depend on currentIndex, delay, and text for re-render

  return <span>{currentText}</span>;
};

const Loading = () => (
  <div className="govuk-inset-text">
    <Typewriter
      text="Thinking about it 🤔... Writing some SQL 💻... Running some queries 🏃‍♂️... Crafting an answer ✍️..."
      delay={20}
    />
  </div>
);

function Playground() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

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
  const showSQL = true;

  return (
    <>
      <div className="govuk-grid-row">
        <div>
          <QuestionInput
            handleSubmitQuestion={startStream}
            handleStopStreaming={stopStream}
            isStreaming={isStreaming}
            toggleShowLogs={showLogsRef.current}
            showLogs={showLogs}
          />
          {isLoading && <Loading />}
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
      </div>
      {showSQL && hasCompleted && (
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <SQLViewer sql={getSqlFromLogs()} />
            <button
              onClick={handleExplainSQLClick}
              className="govuk-button"
              data-module="govuk-button"
            >
              Explain
            </button>
          </div>
        </div>
      )}
      <div className="govuk-grid-row">
        {showLogs &&
          latest &&
          latest.logs &&
          Object.values(latest.logs).map((log) => {
            if (log.name === "RunnableParallel<pure_sql,question>") {
              console.log({ finalOutput: log.final_output });
            }
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
