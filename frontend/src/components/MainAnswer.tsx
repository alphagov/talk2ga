function splitByLineReturns(input: string) {
  return input.split(/\r\n|\r|\n/);
}

export function MainAnswer({ text }: { text: string }) {
  return (
    <div
      className="govuk-notification-banner"
      role="region"
      aria-labelledby="govuk-notification-banner-title"
      data-module="govuk-notification-banner"
    >
      <div className="govuk-notification-banner__header">
        <h2
          className="govuk-notification-banner__title"
          id="govuk-notification-banner-title"
        >
          Answer
        </h2>
      </div>
      <div className="govuk-notification-banner__content">
        <p className="govuk-notification-banner__heading answer-banner">
          {splitByLineReturns(text).map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </p>
        <p className="answer-date-range-caveat">
          Answer is based on data from 2024/02/12.
        </p>
      </div>
    </div>
  );
}
