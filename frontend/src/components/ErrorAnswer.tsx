class ErrorCopy {
  title: string;
  body: string[];
  constructor(title: string, body: string[]) {
    this.title = title;
    this.body = body;
  }
}

const errorTypeToErrorCopyMapping: { [key: string]: ErrorCopy } = {
  QueryCostExceedsLimit: new ErrorCopy('Query cost exceeds limit.', [
    'Consider selecting a shorter date range.',
  ]),
  any: new ErrorCopy("Oops, couldn't answer this one", [
    'Please try again',
    "We've been notified and are working on it",
  ]),
};

const ErrorAnswer = ({ errorName = null }: { errorName: string | null }) => {
  const errorCopy =
    errorTypeToErrorCopyMapping[errorName || ''] ||
    errorTypeToErrorCopyMapping['any'];
  return (
    <div className="govuk-error-summary" data-module="govuk-error-summary">
      <div role="alert">
        <h2 className="govuk-error-summary__title">{errorCopy.title}</h2>
        <div className="govuk-error-summary__body">
          <ul className="govuk-list govuk-error-summary__list">
            {errorCopy.body.map((body) => (
              <li key={body}>{body}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ErrorAnswer;
