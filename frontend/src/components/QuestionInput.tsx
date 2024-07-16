import { useEffect, useRef, useState } from 'react';
import DateRangePicker from './DateRangePicker';
import { DateRange } from 'rsuite/DateRangePicker';
import { showSqlFeatureFlag } from '../envConfig';

type InputData = {
  data: string;
  errors: string[];
};

type QuestionInputProps = {
  handleSubmitQuestion: (question: string, dateRange: DateRange) => void;
  handleStopStreaming?: () => void;
  isStreaming: boolean;
  toggleShowSQL: () => void;
  showSQLBtnActive: boolean;
  hasCompleted: boolean;
  selectedDateRange: DateRange | null;
  setSelectedDateRange: (date: DateRange | null) => void;
  forcedValue?: string | null;
  forcedDateRange?: DateRange | null;
};

function QuestionInput({
  handleSubmitQuestion,
  handleStopStreaming,
  isStreaming,
  toggleShowSQL,
  showSQLBtnActive,
  hasCompleted,
  selectedDateRange,
  setSelectedDateRange,
  forcedValue,
}: QuestionInputProps) {
  const [inputData, setInputData] = useState<InputData>({
    data: '',
    errors: [],
  });
  const submitRef = useRef<(() => void) | null>(null);
  submitRef.current = () => {
    if (isStreaming) {
      handleStopStreaming && handleStopStreaming();
    } else {
      selectedDateRange &&
        handleSubmitQuestion(inputData.data, selectedDateRange);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        submitRef.current?.();
      }
    });
  }, []);

  const handleDateChange = (date: DateRange | null) => {
    setSelectedDateRange(date);
  };

  return (
    <div className="govuk-form-group">
      <h1 className="govuk-label-wrapper">
        <label className="govuk-label govuk-label--l">
          What is your question?
        </label>
      </h1>
      <div className="legend-container">
        <div id="more-detail-hint" className="govuk-hint">
          It is better to provide specific URLs or page titles
        </div>
        <DateRangePicker
          handleDateChange={handleDateChange}
          value={selectedDateRange as DateRange}
        />
      </div>
      <textarea
        className="govuk-textarea"
        id="more-detail"
        name="moreDetail"
        rows={1}
        aria-describedby="more-detail-hint"
        value={forcedValue || inputData.data}
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
          {isStreaming ? 'Abort' : 'Submit'}
        </button>
        {showSqlFeatureFlag && hasCompleted && (
          <button
            onClick={toggleShowSQL}
            type="submit"
            className="govuk-button govuk-button--secondary"
            data-module="govuk-button"
          >
            {showSQLBtnActive ? 'Hide SQL' : 'Show SQL'}
          </button>
        )}
      </div>
    </div>
  );
}

export default QuestionInput;
