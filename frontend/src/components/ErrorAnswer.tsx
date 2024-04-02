const ErrorAnswer = () => (
  <div className="govuk-error-summary" data-module="govuk-error-summary">
    <div role="alert">
      <h2 className="govuk-error-summary__title">
        Oops, couldn't answer this one
      </h2>
      <div className="govuk-error-summary__body">
        <ul className="govuk-list govuk-error-summary__list">
          <li>Please try again</li>
          <li>We've been notified and are working on it</li>
        </ul>
      </div>
    </div>
  </div>
);

export default ErrorAnswer;
