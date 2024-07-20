import { FrontendDateRange } from '../types';

function splitByLineReturns(input: string) {
  return input.split(/\r\n|\r|\n/);
}

function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  return date.toLocaleDateString('en-GB', options);
}

export function MainAnswer({
  text,
  dateRange,
}: {
  text: string;
  dateRange: FrontendDateRange;
}) {
  const dateString = `${formatDate(dateRange[0])} to ${formatDate(
    dateRange[1],
  )}`;
  return (
    <div
      className="main-answer-container govuk-!-static-padding-5"
      role="region"
    >
      <h1 className="govuk-heading-m govuk-!-static-margin-bottom-4">
        <span className="govuk-caption-m govuk-!-static-margin-bottom-4">
          {dateString}
        </span>
        Top 5 countries with the most users:
      </h1>
      {splitByLineReturns(text).map((line, i) => (
        <p key={i} className="govuk-body">
          {line}
        </p>
      ))}
      <div className="govuk-warning-text">
        <span className="govuk-warning-text__icon" aria-hidden="true">
          !
        </span>
        <strong className="govuk-warning-text__text">
          <span className="govuk-visually-hidden">Warning</span>
          Verify the result before sharing
        </strong>
      </div>
      <details className="govuk-details">
        <summary className="govuk-details__summary">
          <span className="govuk-details__summary-text">Generated SQL</span>
        </summary>
        <div className="govuk-details__text">
          We need to know your nationality so we can work out which elections
          you’re entitled to vote in. If you cannot provide your nationality,
          you’ll have to send copies of identity documents through the post.
        </div>
      </details>
      <details className="govuk-details">
        <summary className="govuk-details__summary">
          <span className="govuk-details__summary-text">SQL Explained</span>
        </summary>
        <div className="govuk-details__text">
          We need to know your nationality so we can work out which elections
          you’re entitled to vote in. If you cannot provide your nationality,
          you’ll have to send copies of identity documents through the post.
        </div>
      </details>
    </div>
  );
}
