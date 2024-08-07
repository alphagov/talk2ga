import { useState } from 'react';
import './feedback.css';
import { NotSatisfiedDetailsPayload } from '../useQuestionAnalytics';
import { setUsername } from '../localstorage';

enum FeedbackState {
  Default,
  Satisfied,
  Form,
  FormSent,
}

type DefaultFeedbackProps = {
  handleSatisfiedClick: () => void;
  handleNotSatisfiedClick: () => void;
};

const DefaultFeedback = ({
  handleSatisfiedClick,
  handleNotSatisfiedClick,
}: DefaultFeedbackProps) => (
  <div
    className="gem-c-feedback__prompt gem-c-feedback__js-show js-prompt"
    tabIndex={-1}
  >
    <div className="gem-c-feedback__prompt-content">
      <div className="gem-c-feedback__prompt-questions js-prompt-questions">
        <div className="gem-c-feedback__prompt-question-answer">
          <h2 className="gem-c-feedback__prompt-question">
            Is the response as you expected?
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
              </a>{' '}
            </li>
            <li className="gem-c-feedback__option-list-item">
              <button
                className="govuk-button gem-c-feedback__prompt-link js-page-is-useful"
                onClick={handleSatisfiedClick}
              >
                Yes{' '}
                <span className="govuk-visually-hidden">
                  this page is useful
                </span>
              </button>{' '}
            </li>
            <li className="gem-c-feedback__option-list-item">
              <button
                className="govuk-button gem-c-feedback__prompt-link js-toggle-form js-page-is-not-useful"
                aria-controls="page-is-not-useful"
                aria-expanded="false"
                onClick={handleNotSatisfiedClick}
              >
                No{' '}
                <span className="govuk-visually-hidden">
                  this page is not useful
                </span>
              </button>{' '}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

type TextInputData = {
  data: string;
  errors: string[];
} | null;

const validateForm = (detailData: TextInputData, sqlData: TextInputData) => {
  const errors: { detailData: string[]; sqlData: string[] } = {
    detailData: [],
    sqlData: [],
  };
  if (
    (detailData?.data?.length ?? 0) < 20 ||
    (detailData?.data?.length ?? 0) > 2100
  ) {
    errors.detailData.push(
      'Please provide a description that is between 20 and 2100 characters long.',
    );
  }

  if (
    (sqlData?.data?.length && sqlData.data.length < 20) ||
    (sqlData?.data?.length && sqlData.data.length > 10000)
  ) {
    errors.sqlData.push(
      'Please provide a SQL query that is between 20 and 2100 characters long.',
    );
  }

  return errors;
};

const FormFeedback = ({
  onSubmit,
}: {
  onSubmit: (args: NotSatisfiedDetailsPayload) => void;
}) => {
  const [usernameData, setUsernameData] = useState<TextInputData>(null);
  const [detailData, setDetailData] = useState<TextInputData>(null);
  const [sqlData, setSqlData] = useState<TextInputData>(null);

  const submit = () => {
    const errors = validateForm(detailData, sqlData);

    if (errors.detailData.length > 0 || errors.sqlData.length > 0) {
      console.log('Errors', errors);
      setDetailData({
        data: detailData?.data || '',
        errors: errors.detailData,
      });
      setSqlData({ data: sqlData?.data || '', errors: errors.sqlData });
      return;
    }

    console.log('submitting', detailData?.data, sqlData?.data);
    onSubmit({
      feedbackText: detailData?.data || '',
      feedbackSql: sqlData?.data,
      username: usernameData?.data,
    });
    // Also cache the username
    setUsername(usernameData?.data || '');
  };

  return (
    <div
      className="gem-c-feedback__prompt gem-c-feedback__js-show js-prompt"
      tabIndex={-1}
    >
      <fieldset className="govuk-fieldset feedback-form-container">
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
          <h2 className="govuk-fieldset__heading">
            Thank you! We'd love to hear more about your experience so we can
            improve it
          </h2>
        </legend>
        <div
          className={`govuk-form-group ${
            detailData?.errors.length ? 'govuk-form-group--error' : ''
          }`}
        >
          <label className="govuk-label" htmlFor="feedbackDetails">
            Please describe how the response matched or didn't match your
            expectations
          </label>
          {detailData?.errors.length
            ? detailData?.errors.map((error, index) => (
                <p id={`error-${index}`} className="govuk-error-message">
                  <span key={index} className="govuk-error-message">
                    {error}
                  </span>
                </p>
              ))
            : ''}
          <textarea
            id="feedback-detail-textarea"
            name="feedbackDetails"
            className={`govuk-textarea ${
              detailData?.errors.length ? 'govuk-input--error' : ''
            }`}
            rows={5}
            aria-describedby="feedback-detail"
            value={detailData?.data || ''}
            onChange={(e) => {
              const target = e.target as HTMLTextAreaElement;
              setDetailData({ data: target.value, errors: [] });
            }}
          ></textarea>
        </div>
        <div
          className={`govuk-form-group ${
            sqlData?.errors.length ? 'govuk-form-group--error' : ''
          }`}
        >
          <label className="govuk-label" htmlFor="feedbackSql">
            (Optional) If you know how the SQL query could be improved or
            corrected, please enter the alternative query
          </label>
          {sqlData?.errors.length
            ? sqlData?.errors.map((error, index) => (
                <p id={`error-${index}`} className="govuk-error-message">
                  <span key={index} className="govuk-error-message">
                    {error}
                  </span>
                </p>
              ))
            : ''}
          <textarea
            id="feedback-sql"
            name="feedbackSql"
            className={`govuk-textarea ${
              detailData?.errors.length ? 'govuk-input--error' : ''
            }`}
            rows={2}
            aria-describedby="feedback-sql"
            value={sqlData?.data || ''}
            onChange={(e) => {
              const target = e.target as HTMLTextAreaElement;
              setSqlData({ data: target.value, errors: [] });
            }}
          ></textarea>
        </div>
        <div
          className={`govuk-form-group ${
            usernameData?.errors.length ? 'govuk-form-group--error' : ''
          }`}
        >
          <label className="govuk-label" htmlFor="feedbackDetails">
            (Optional) If you don't mind being contacted about your feedback,
            please leave your name{' '}
          </label>
          {usernameData?.errors.length
            ? usernameData?.errors.map((error, index) => (
                <p id={`error-${index}`} className="govuk-error-message">
                  <span
                    key={`${index}-${error}`}
                    className="govuk-error-message"
                  >
                    {error}
                  </span>
                </p>
              ))
            : ''}
          <textarea
            id="feedback-detail-textarea"
            name="feedbackDetails"
            className={`govuk-textarea ${
              usernameData?.errors.length ? 'govuk-input--error' : ''
            }`}
            rows={1}
            aria-describedby="feedback-detail"
            value={usernameData?.data || ''}
            onChange={(e) => {
              const target = e.target as HTMLTextAreaElement;
              setUsernameData({ data: target.value, errors: [] });
            }}
          ></textarea>
        </div>
        <button
          type="submit"
          className="govuk-button"
          data-module="govuk-button"
          onClick={submit}
        >
          Send feedback
        </button>
      </fieldset>
    </div>
  );
};

const FormSentFeedback = () => (
  <div
    className="gem-c-feedback__prompt gem-c-feedback__js-show js-prompt"
    tabIndex={-1}
  >
    <div
      className="gem-c-feedback__prompt-questions gem-c-feedback__prompt-success js-prompt-success"
      role="alert"
    >
      Thank you, your feedback is much appreciated! 🚀
    </div>
  </div>
);

export type FeedbackProps = {
  handleSatisfiedFeedback: (callback: CallableFunction) => void;
  handleNotSatisfiedFeedback: (callback: CallableFunction) => void;
  handleNotSatisfiedFeedbackFormSubmit: (
    args: NotSatisfiedDetailsPayload,
    callback: CallableFunction,
  ) => void;
};

export default function Feedback({
  handleSatisfiedFeedback,
  handleNotSatisfiedFeedback,
  handleNotSatisfiedFeedbackFormSubmit,
}: FeedbackProps) {
  const [state, setState] = useState<FeedbackState>(FeedbackState.Default);

  const onSatisfiedClick = () => {
    handleSatisfiedFeedback(() => setState(FeedbackState.Satisfied));
  };
  const onNotSatisfiedClick = () => {
    handleNotSatisfiedFeedback(() => setState(FeedbackState.Form));
  };

  let feedbackComponent;

  const onSubmitFeedbackForm = (args: NotSatisfiedDetailsPayload) => {
    handleNotSatisfiedFeedbackFormSubmit(args, () =>
      setState(FeedbackState.FormSent),
    );
  };

  if (state === FeedbackState.Default) {
    feedbackComponent = (
      <DefaultFeedback
        handleSatisfiedClick={onSatisfiedClick}
        handleNotSatisfiedClick={onNotSatisfiedClick}
      />
    );
  } else if (state === FeedbackState.Satisfied) {
    feedbackComponent = <FormFeedback onSubmit={onSubmitFeedbackForm} />;
  } else if (state === FeedbackState.Form) {
    feedbackComponent = <FormFeedback onSubmit={onSubmitFeedbackForm} />;
  } else if (state === FeedbackState.FormSent) {
    feedbackComponent = <FormSentFeedback />;
  }

  return feedbackComponent;
}
