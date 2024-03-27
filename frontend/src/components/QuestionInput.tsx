import { useEffect, useRef, useState } from "react";

type InputData = {
  data: string;
  errors: string[];
};

type QuestionInputProps = {
  handleSubmitQuestion: (data: string) => void;
  handleStopStreaming?: () => void;
  isStreaming: boolean;
  toggleShowLogs: () => void;
  toggleShowSQL: () => void;
  showLogs: boolean;
  hasCompleted: boolean;
};

function QuestionInput({
  handleSubmitQuestion,
  handleStopStreaming,
  isStreaming,
  toggleShowLogs,
  toggleShowSQL,
  showLogs,
  hasCompleted,
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

      <div className="questionBtnsContainer">
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
          className="govuk-button govuk-button--secondary"
          data-module="govuk-button"
        >
          {showLogs ? "Hide Logs" : "Show Logs"}
        </button>
        {hasCompleted && (
          <button
            onClick={toggleShowSQL}
            type="submit"
            className="govuk-button govuk-button--secondary"
            data-module="govuk-button"
          >
            {showLogs ? "Hide SQL" : "Show SQL"}
          </button>
        )}
      </div>
    </div>
  );
}

export default QuestionInput;