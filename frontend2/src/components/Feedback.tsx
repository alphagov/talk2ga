import { useState } from "react";
import "./feedback.css";

enum FeedbackState {
  Default,
  Satisfied,
  Form,
  FormSent,
}

const DefaultFeedback = ({ handleSatisfiedClick, handleNotSatisfiedClick }) => (
  <div
    className="gem-c-feedback__prompt gem-c-feedback__js-show js-prompt"
    tabIndex={-1}
  >
    <div className="gem-c-feedback__prompt-content">
      <div className="gem-c-feedback__prompt-questions js-prompt-questions">
        <div className="gem-c-feedback__prompt-question-answer">
          <h2 className="gem-c-feedback__prompt-question">
            Are you happy with the answer?
          </h2>
          <ul className="gem-c-feedback__option-list">
            <li
              className="gem-c-feedback__option-list-item govuk-visually-hidden"
              hidden={undefined}
            >
              <a
                className="gem-c-feedback__prompt-link"
                data-track-category="yesNoFeedbackForm"
                data-track-action="ffMaybeClick"
                role="button"
                hidden={true}
                aria-hidden="true"
                href="/contact/govuk"
              >
                Maybe
              </a>{" "}
            </li>
            <li className="gem-c-feedback__option-list-item">
              <button
                className="govuk-button gem-c-feedback__prompt-link js-page-is-useful"
                onClick={handleSatisfiedClick}
              >
                Yes{" "}
                <span className="govuk-visually-hidden">
                  this page is useful
                </span>
              </button>{" "}
            </li>
            <li className="gem-c-feedback__option-list-item">
              <button
                className="govuk-button gem-c-feedback__prompt-link js-toggle-form js-page-is-not-useful"
                aria-controls="page-is-not-useful"
                aria-expanded="false"
                onClick={handleNotSatisfiedClick}
              >
                No{" "}
                <span className="govuk-visually-hidden">
                  this page is not useful
                </span>
              </button>{" "}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const SatisfiedFeedback = () => (
  <div
    className="gem-c-feedback__prompt gem-c-feedback__js-show js-prompt"
    tabIndex={-1}
  >
    <div
      className="gem-c-feedback__prompt-questions gem-c-feedback__prompt-success js-prompt-success"
      role="alert"
    >
      Thank you for your feedback
    </div>
  </div>
);

const FormFeedback = () => <p>A form</p>;

const FormSentFeedback = () => (
  <div
    className="gem-c-feedback__prompt gem-c-feedback__js-show js-prompt"
    tabIndex={-1}
  >
    <div
      className="gem-c-feedback__prompt-questions gem-c-feedback__prompt-success js-prompt-success"
      role="alert"
    >
      Thank you for your feedback. We are looking into it.
    </div>
  </div>
);

export default function Feedback({handleSatisfiedFeedback, handleNotSatisfiedFeedback}) {
  const [state, setState] = useState<FeedbackState>(FeedbackState.Default);

  const onSatisfiedClick = () => {
    setState(FeedbackState.Satisfied);
    handleSatisfiedFeedback()
  }
  const onNotSatisfiedClick = () => {
    setState(FeedbackState.FormSent);
    handleNotSatisfiedFeedback()
  }

  let feedbackComponent;

  if (state === FeedbackState.Default) {
    feedbackComponent = (
      <DefaultFeedback handleSatisfiedClick={onSatisfiedClick} handleNotSatisfiedClick={onNotSatisfiedClick} />
    );
  } else if (state === FeedbackState.Satisfied) {
    feedbackComponent = <SatisfiedFeedback />;
  } else if (state === FeedbackState.Form) {
    feedbackComponent = <FormFeedback />;
  } else if (state === FeedbackState.FormSent) {
    feedbackComponent = <FormSentFeedback />;
  }

  return feedbackComponent;
}
