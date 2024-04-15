import { useEffect, useRef, useState } from "react";
import DateRangePicker from "./DateRangePicker";

type InputData = {
  data: string;
  errors: string[];
};

export type DateRange = {
  start_date: string;
  end_date: string;
};

function generateDummyTimeRange(): DateRange {
  /**
   * Dummy function awaiting for proper implementation of a date picker
   */
  const today = new Date();

  // Subtract 3 days
  const threeDaysAgoDateTime = new Date(today.setDate(today.getDate() - 3));
  const sixDaysAgoDateTime = new Date(today.setDate(today.getDate() - 6));

  // Format to ISO date string (YYYY-MM-DD)
  const threeDateStringISO = threeDaysAgoDateTime.toISOString().split("T")[0];
  const sixDateStringISO = sixDaysAgoDateTime.toISOString().split("T")[0];

  return {
    start_date: sixDateStringISO,
    end_date: threeDateStringISO,
  };
}

type QuestionInputProps = {
  handleSubmitQuestion: (question: string, dateRange: DateRange) => void;
  handleStopStreaming?: () => void;
  isStreaming: boolean;
  toggleShowLogs: () => void;
  toggleShowSQL: () => void;
  showLogs: boolean;
  showSQLBtnActive: boolean;
  hasCompleted: boolean;
};

function QuestionInput({
  handleSubmitQuestion,
  handleStopStreaming,
  isStreaming,
  toggleShowLogs,
  toggleShowSQL,
  showLogs,
  showSQLBtnActive,
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
      handleSubmitQuestion(inputData.data, generateDummyTimeRange());
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
      <DateRangePicker />
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
        {hasCompleted && (
          <button
            onClick={toggleShowLogs}
            type="submit"
            className="govuk-button govuk-button--secondary"
            data-module="govuk-button"
          >
            {showLogs ? "Hide Logs" : "Show Logs"}
          </button>
        )}
        {hasCompleted && (
          <button
            onClick={toggleShowSQL}
            type="submit"
            className="govuk-button govuk-button--secondary"
            data-module="govuk-button"
          >
            {showSQLBtnActive ? "Hide SQL" : "Show SQL"}
          </button>
        )}
      </div>
    </div>
  );
}

export default QuestionInput;
