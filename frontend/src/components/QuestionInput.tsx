import { useRef, useState } from 'react';
import { DateRangeInput } from './DateRangeInput';
import type { FrontendDateRange } from '../types';

type InputData = {
  data: string;
  errors: string[];
};

type QuestionInputProps = {
  onSubmit: (question: string, dateRange: FrontendDateRange) => void;
  onDateRangeChange?: (dateRange: FrontendDateRange | null) => void;
  stopStreaming?: () => void;
  isStreaming: boolean;
  initialDateRange: FrontendDateRange | null;
};

function QuestionInput({
  onSubmit,
  onDateRangeChange,
  stopStreaming,
  isStreaming,
  initialDateRange,
}: QuestionInputProps) {
  const [inputData, setInputData] = useState<InputData>({
    data: '',
    errors: [],
  });
  const [isDateRangeValid, setIsDateRangeValid] = useState<boolean>(true);

  const dateRangeRef = useRef<FrontendDateRange | null>(initialDateRange);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isStreaming) {
      stopStreaming && stopStreaming();
    } else if (isDateRangeValid && dateRangeRef.current) {
      onSubmit(inputData.data, dateRangeRef.current);
    }
  };

  const handleDateRangeChange = (dateRange: FrontendDateRange | null) => {
    dateRangeRef.current = dateRange;
    onDateRangeChange && onDateRangeChange(dateRange);
  };

  const handleDateValidationChange = (isValid: boolean) => {
    setIsDateRangeValid(isValid);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="govuk-form-group question-group">
        <label className="govuk-label govuk-label--m">Enter a question</label>
        <div id="more-detail-hint" className="govuk-hint">
          Specific page titles or URLs can improve accuracy
        </div>
        <input
          className="govuk-input"
          id="more-detail"
          name="moreDetail"
          type="text"
          aria-describedby="more-detail-hint"
          placeholder="Eg. What is the most viewed page?"
          value={inputData.data}
          onChange={(e) => {
            setInputData({ data: e.target.value, errors: [] });
          }}
        />
      </div>
      <DateRangeInput
        initialDateRange={initialDateRange}
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
      </div>
    </form>
  );
}

export default QuestionInput;
