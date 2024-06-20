import { useRef, useState } from 'react';
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

  const submitRef = useRef(() => {});

  submitRef.current = () => {
    if (isStreaming) {
      handleStopStreaming && handleStopStreaming();
    } else {
      selectedDateRange &&
        handleSubmitQuestion(inputData.data, selectedDateRange);
    }
  };

  const handleDateChange = (date: DateRange | null) => {
    setSelectedDateRange(date);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitRef.current();
  };

  return (
    <form onSubmit={handleSubmit} className="govuk-form-group">
      <h1 className="govuk-label-wrapper">
        <label className="govuk-label govuk-label--m">
          Enter a question
        </label>
      </h1>
      <div className="legend-container">
        <div id="more-detail-hint" className="govuk-hint">
        Specific page titles or URLs can improve accuracy
        </div>
        <DateRangePicker
          handleDateChange={handleDateChange}
          value={selectedDateRange as DateRange}
        />
      </div>
      <input
        className="govuk-input"
        id="more-detail"
        name="moreDetail"
        type="text"
        aria-describedby="more-detail-hint"
        value={forcedValue || inputData.data}
        onChange={(e) => {
          setInputData({ data: e.target.value, errors: [] });
        }}
      />
      <div className="questionBtnsContainer">
        <button
          type="submit"
          className="govuk-button"
          data-module="govuk-button"
        >
          {isStreaming ? 'Abort' : 'Submit'}
        </button>
        {showSqlFeatureFlag && hasCompleted && (
          <button
            onClick={toggleShowSQL}
            type="button"
            className="govuk-button govuk-button--secondary"
            data-module="govuk-button"
          >
            {showSQLBtnActive ? 'Hide SQL' : 'Show SQL'}
          </button>
        )}
      </div>
    </form>
  );
}

export default QuestionInput;
