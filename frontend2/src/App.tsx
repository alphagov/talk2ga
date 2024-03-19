import "./App.css";

import { useEffect, useRef, useState } from "react";
import { useStreamLog } from "./useStreamLog";
import { useAppStreamCallbacks } from "./useStreamCallback";
import { str } from "./utils/str";
import { StreamOutput, streamOutputToString } from "./components/StreamOutput";
import { useQuestions } from "./useQuestionAnalytics";

function QuestionInput({
  handleSubmitQuestion,
  handleStopStreaming,
  isStreaming,
  toggleShowLogs,
  showLogs,
}) {
  const [inputData, setInputData] = useState({
    data: "",
    errors: [],
  });

  const submitRef = useRef<(() => void) | null>(null);
  submitRef.current = () => {
    console.log("submitRef.current");
    console.log({ inputData });
    if (isStreaming) {
      handleStopStreaming();
    } else {
      handleSubmitQuestion(inputData.data);
      setIsStreaming(true);
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
          Make sure to provide specific URLs or page titles
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

function Playground() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  const { context, callbacks } = useAppStreamCallbacks();
  const { startStream, stopStream, latest } = useStreamLog(callbacks);
  const { recordQuestion, recordQuestionCompletion, currentQuestionId } =
    useQuestions();

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

    // OnError callbacks
    context.current.onError["recordQuestionFailure"] = () =>
      currentQuestionId &&
      recordQuestionCompletion(currentQuestionId, { succeeded: false });
  }, [latest, latest?.logs, latest?.final_output, currentQuestionId]);

  return (
    <>
      <p>ID: {currentQuestionId || "null"}</p>
      <QuestionInput
        handleSubmitQuestion={startStream}
        handleStopStreaming={stopStream}
        isStreaming={isStreaming}
        toggleShowLogs={showLogsRef.current}
        showLogs={showLogs}
      />
      {latest &&
        latest.streamed_output &&
        <StreamOutput>{streamOutputToString(latest.streamed_output)}</StreamOutput>
      }
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
    </>
  );
}

export function App() {
  return <Playground />;
}

export default App;
