import { useState } from 'react';
import { showSqlFeatureFlag } from '../envConfig';
import { DateRangeInput } from './DateRangeInput';
import type { FrontendDateRange } from '../types';

type InputData = {
  data: string;
  errors: string[];
};

type QuestionInputProps = {
  handleSubmitQuestion: (
    question: string,
    dateRange: FrontendDateRange,
  ) => void;
  handleStopStreaming?: () => void;
  isStreaming: boolean;
  toggleShowSQL: () => void;
  showSQLBtnActive: boolean;
  hasCompleted: boolean;
  selectedDateRange: FrontendDateRange | null;
  forcedValue?: string | null;
  forcedDateRange?: FrontendDateRange | null;
};

function QuestionInput({
  handleSubmitQuestion,
  handleStopStreaming,
  isStreaming,
  toggleShowSQL,
  showSQLBtnActive,
  hasCompleted,
  selectedDateRange,
  forcedValue,
}: QuestionInputProps) {
  const [inputData, setInputData] = useState<InputData>({
    data: '',
    errors: [],
  });

  const [dateRange, setDateRange] = useState<FrontendDateRange | null>(
    selectedDateRange,
  );

  const [isDateRangeValid, setIsDateRangeValid] = useState<boolean>(true);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isStreaming) {
      handleStopStreaming && handleStopStreaming();
    } else if (isDateRangeValid && dateRange) {
      handleSubmitQuestion(inputData.data, dateRange);
    }
  };

  const handleDateRangeChange = (dateRange: FrontendDateRange | null) => {
    setDateRange(dateRange);
  };

  const handleDateValidationChange = (isValid: boolean) => {
    setIsDateRangeValid(isValid);
  };

  return (
    <form onSubmit={handleSubmit} className="govuk-form-group">
      <h1 className="govuk-heading-s">Enter a question</h1>
      <div className="legend-container">
        <div id="more-detail-hint" className="govuk-hint">
          Specific page titles or URLs can improve accuracy
        </div>
      </div>
      <input
        className="govuk-input"
        id="more-detail"
        name="moreDetail"
        type="text"
        aria-describedby="more-detail-hint"
        placeholder="What is the most viewed page?"
        value={forcedValue || inputData.data}
        onChange={(e) => {
          setInputData({ data: e.target.value, errors: [] });
        }}
      />
      <DateRangeInput
        initialDateRange={selectedDateRange || [null, null]}
        onDateRangeChange={handleDateRangeChange}
        onValidationChange={handleDateValidationChange}
      />
      <div className="questionBtnsContainer">
        <button
          type="submit"
          className="govuk-button"
          data-module="govuk-button"
          disabled={!isDateRangeValid}
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
