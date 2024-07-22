import { useState, useEffect } from 'react';
import { DatePicker, InputWidth } from 'react-govuk-datepicker';
import { FrontendDateRange } from '../types';

const parseDate = (date: string) => {
  const [day, month, year] = date.split('/');
  return new Date(`${year}-${month}-${day}`);
};

const formatDateForWidget = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

type DateRangeInputProps = {
  initialDateRange: FrontendDateRange | null;
  onDateRangeChange: (dateRange: FrontendDateRange) => void;
  onValidationChange: (isValid: boolean) => void;
};

export function DateRangeInput({
  initialDateRange,
  onDateRangeChange,
  onValidationChange,
}: DateRangeInputProps) {
  const [fromDate, setFromDate] = useState<string>(
    initialDateRange?.[0] ? formatDateForWidget(initialDateRange[0]) : '',
  );
  const [toDate, setToDate] = useState<string>(
    initialDateRange?.[1] ? formatDateForWidget(initialDateRange[1]) : '',
  );

  const [dateFromError, setDateFromError] = useState<string | undefined>();
  const [dateToError, setDateToError] = useState<string | undefined>();

  const isOlderThanYesterday = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 2);

    return date < yesterday;
  };

  const validateFromDate = (date: string) => {
    if (!date || date === 'dd/mm/yyyy') {
      return;
    }
    if (!isOlderThanYesterday(parseDate(date))) {
      setDateFromError('The date must be older than yesterday.');
      return false;
    } else if (toDate && parseDate(date) > parseDate(toDate)) {
      setDateFromError('The date must be older than the "To" date.');
      setDateToError('The "From" date must be older than this date.');
      return false;
    } else {
      setDateFromError(undefined);
      setDateToError(undefined);
      return true;
    }
  };

  const validateToDate = (date: string) => {
    if (!date || date === 'dd/mm/yyyy') {
      return;
    }
    if (!isOlderThanYesterday(parseDate(date))) {
      setDateToError('The date must be older than yesterday.');
      return false;
    } else if (fromDate && parseDate(fromDate) > parseDate(date)) {
      setDateFromError('The date must be older than the "To" date.');
      setDateToError('The "From" date must be older than this date.');
      return false;
    } else {
      setDateFromError(undefined);
      setDateToError(undefined);
      return true;
    }
  };

  const validateDates = (from: string, to: string) => {
    const fromValid = validateFromDate(from);
    const toValid = validateToDate(to);
    return fromValid && toValid;
  };

  const onFromDateChange = (date: string) => {
    if (date === 'dd/mm/yyyy') {
      return;
    }
    setFromDate(date);
    const newDateRange = [parseDate(date), parseDate(toDate)];
    const isValid = !!validateDates(date, toDate);
    onValidationChange(isValid);
    onDateRangeChange(newDateRange as FrontendDateRange);
  };

  const onToDateChange = (date: string) => {
    if (date === 'dd/mm/yyyy') {
      return;
    }
    setToDate(date);
    const newDateRange = [parseDate(fromDate), parseDate(date)];
    const isValid = !!validateDates(fromDate, date);
    onValidationChange(isValid);
    onDateRangeChange(newDateRange as FrontendDateRange);
  };

  // Ensure the initial date range is valid when the component mounts
  useEffect(() => {
    const isValid = !!validateDates(fromDate, toDate);
    onValidationChange(isValid);
    onDateRangeChange([
      parseDate(fromDate),
      parseDate(toDate),
    ] as FrontendDateRange);
  }, [initialDateRange]);

  const onFromDateBlur = () => {};
  const onToDateBlur = () => {};

  return (
    <>
      <div className="govuk-form-group">
        <fieldset
          className="govuk-fieldset"
          role="group"
          aria-describedby="date-hint"
        >
          <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
            Date range to query
          </legend>
          <div className="datepicker-container">
            <DatePicker
              identifier="from-date"
              label="From"
              labelClassExt="govuk-label--s"
              hint="For example, 18/06/2024"
              width={InputWidth.Char10}
              multiQuestion={true}
              value={fromDate}
              error={dateFromError}
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
              error={dateToError}
              onChange={onToDateChange}
              onBlur={onToDateBlur}
            />
          </div>
        </fieldset>
      </div>
    </>
  );
}
