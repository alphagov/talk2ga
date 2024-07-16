import { useRef, useState } from 'react';
// import DateRangePicker from './DateRangePicker';
import { DatePicker, InputWidth } from 'react-govuk-datepicker';
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

  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const submitRef = useRef(() => {});

  submitRef.current = () => {
    if (isStreaming) {
      handleStopStreaming && handleStopStreaming();
    } else {
      selectedDateRange &&
        handleSubmitQuestion(inputData.data, selectedDateRange);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitRef.current();
  };

  const onFromDateChange = (date: string) => setFromDate(date);
  const onFromDateBlur = () => {};
  const onToDateChange = (date: string) => setToDate(date);
  const onToDateBlur = () => {};

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
        value={forcedValue || inputData.data}
        onChange={(e) => {
          setInputData({ data: e.target.value, errors: [] });
        }}
      />
      <h2 className="govuk-heading-s govuk-!-margin-top-7">
        Date range to query
      </h2>
      <DatePicker
        identifier="from-date"
        label="From"
        labelClassExt="govuk-label--s"
        hint="For example, 18/06/2024"
        width={InputWidth.Char10}
        multiQuestion={true}
        value={fromDate}
        // error={error?.message}
        onChange={onFromDateChange}
        onBlur={onFromDateBlur}
      />
      <DatePicker
        identifier="to-date"
        label="To"
        labelClassExt="govuk-label--s"
        hint="For example, 19/06/2024"
        width={InputWidth.Char10}
        multiQuestion={true}
        value={toDate}
        // error={error?.message}
        onChange={onToDateChange}
        onBlur={onToDateBlur}
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
