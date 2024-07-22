import { useEffect, useState, Fragment } from 'react';
import { format } from 'sql-formatter';
// @ts-ignore
import Prism from 'prismjs';
import 'prismjs/components/prism-sql';
import 'prismjs/themes/prism-coy.css';
import { useStreamLogExplain } from '../useStreamLogExplain';
import { useAppStreamCallbacks } from '../useStreamCallback';
import { streamOutputToString } from '../utils/streamToString';
import { toast } from 'react-toastify';

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

function formatText(text: string) {
  const sections = text.split(/\*\*(.*?)\*\*/g).map((section, index) => {
    // Process sections with bold markers
    if (index % 2 === 1) {
      return <strong key={index}>{section}</strong>;
    } else {
      // Process sections with line breaks and code markers
      return section.split('\n').map((line, idx) => {
        // Split text by code markers
        const codeSections = line.split(/`(.*?)`/g).map((part, codeIndex) => {
          if (codeIndex % 2 === 1) {
            return (
              <code key={codeIndex} className="code-highligh-sql-explanation">
                {part}
              </code>
            );
          } else {
            return part;
          }
        });

        return (
          <Fragment key={idx}>
            {codeSections}
            {idx < section.split('\n').length - 1 && <br />}
          </Fragment>
        );
      });
    }
  });

  return <div>{sections}</div>;
}

const FormattedStreamedTextComponent = ({
  streamedContent,
}: {
  streamedContent: string;
}) => {
  const [text, setText] = useState('');

  useEffect(() => {
    setText(String(streamedContent));
  }, [streamedContent]);

  return <div>{formatText(text)}</div>;
};

const parseAnswerJSON = (answerJSON: string) => {
  let pureJSON = answerJSON.split('```json')[1];
  pureJSON = pureJSON.split('```')[0];
  pureJSON = pureJSON.trim().replace(/(\r\n|\n|\r)/gm, '');
  const answer = JSON.parse(pureJSON);
  return {
    answerTitle: answer.title,
    answerText: answer.output,
  };
};

export function MainAnswer({
  answerJSON,
  dateRange,
  sql,
  isPreLoadedQuestion,
  question,
}: {
  answerJSON: string;
  dateRange: FrontendDateRange;
  sql: string;
  isPreLoadedQuestion: boolean;
  question: string;
}) {
  const { context, callbacks } = useAppStreamCallbacks();
  const { startStream, latest } = useStreamLogExplain(callbacks);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);

  /* Callbacks for EXPLAIN SQL */
  useEffect(() => {
    // OnStart callbacks
    context.current.onStart['setIsStreaming'] = () => setIsStreaming(true);
    context.current.onStart['setHasCompletedFalse'] = () =>
      setHasCompleted(false);

    // OnSuccess callbacks
    // context.current.onSuccess["recordSuccess"] = () =>
    //   currentQuestionId &&
    //   recordQuestionCompletion(currentQuestionId, {
    //     succeeded: true,
    //     logs_json: latest && JSON.stringify(latest.logs),
    //     final_output: latest && streamOutputToString(latest.streamed_output),
    //   });
    context.current.onSuccess['setIsNotStreaming'] = () =>
      setIsStreaming(false);
    context.current.onSuccess['setHasCompletedTrue'] = () =>
      setHasCompleted(true);

    // OnError callbacks
    // context.current.onError["recordQuestionFailure"] = () =>
    //   currentQuestionId &&
    //   recordQuestionCompletion(currentQuestionId, { succeeded: false });
  }, [latest, latest?.logs, latest?.final_output, question]);

  useEffect(() => {
    // Highlight syntax every time the component mounts or updates
    Prism.highlightAll();
  }, []);

  const fetchSqlExplained = () => question && startStream(question, sql);

  const handleExplainSQLClick = () => {
    if (isPreLoadedQuestion) {
      toast.error(
        'You cannot run an explain on a loaded question. Please ask a new question.',
      );
    } else {
      fetchSqlExplained();
    }
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(formattedSql);
    toast.info('SQL copied to clipboard');
  };

  const formattedSql = format(sql);

  const dateString = `${formatDate(dateRange[0])} to ${formatDate(
    dateRange[1],
  )}`;

  const isSqlExplanedLoading = isStreaming && !hasCompleted;

  const { answerTitle, answerText } = parseAnswerJSON(answerJSON);

  return (
    <div
      className="main-answer-container govuk-!-static-padding-5"
      role="region"
    >
      <h1 className="govuk-heading-m govuk-!-static-margin-bottom-4">
        <span className="govuk-caption-m govuk-!-static-margin-bottom-4">
          {dateString}
        </span>
        {answerTitle}
      </h1>
      {splitByLineReturns(answerText).map((line, i) => (
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
      <details className="govuk-details" onClick={fetchSqlExplained}>
        <summary className="govuk-details__summary">
          <span className="govuk-details__summary-text">Generated SQL</span>
        </summary>
        <div className="govuk-details__text">
          <pre className="sql-viewer-container">
            <code className="language-sql">{formattedSql}</code>
          </pre>
          <br />
          <button
            className="govuk-button govuk-button--secondary sql-copy-btn"
            data-module="govuk-button"
            onClick={copySqlToClipboard}
          >
            Copy
          </button>
        </div>
      </details>
      <details className="govuk-details">
        <summary className="govuk-details__summary">
          <span className="govuk-details__summary-text">SQL Explained</span>
        </summary>
        <div className="govuk-details__text">
          {!isSqlExplanedLoading && latest ? (
            <FormattedStreamedTextComponent
              streamedContent={streamOutputToString(latest.streamed_output)}
            />
          ) : (
            'Loading...'
          )}
        </div>
      </details>
    </div>
  );
}
