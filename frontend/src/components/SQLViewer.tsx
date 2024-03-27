import { useEffect, useState } from "react";
import { format } from "sql-formatter";
import Prism from "prismjs";
import "prismjs/components/prism-sql";
import "prismjs/themes/prism-coy.css";
import { useStreamLogExplain } from "../useStreamLogExplain";
import { useAppStreamCallbacks } from "../useStreamCallback";
import { streamOutputToString } from "../utils/streamToString";

const sqlExample = `
SELECT COUNT(CustomerID), Country
FROM Customers
GROUP BY Country
HAVING COUNT(CustomerID) > 5;
`;

type SQLViewerProps = {
  sql: string;
  question: string;
};

const SQLViewer = ({ sql, question }: SQLViewerProps) => {
  const { context, callbacks } = useAppStreamCallbacks();
  const { startStream, stopStream, latest } = useStreamLogExplain(callbacks);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);

  /* Callbacks for EXPLAIN SQL */
  useEffect(() => {
    // OnStart callbacks
    context.current.onStart["setIsStreaming"] = () => setIsStreaming(true);
    context.current.onStart["setHasCompletedFalse"] = () =>
      setHasCompleted(false);

    // OnSuccess callbacks
    // context.current.onSuccess["recordSuccess"] = () =>
    //   currentQuestionId &&
    //   recordQuestionCompletion(currentQuestionId, {
    //     succeeded: true,
    //     logs_json: latest && JSON.stringify(latest.logs),
    //     final_output: latest && streamOutputToString(latest.streamed_output),
    //   });
    context.current.onSuccess["setIsNotStreaming"] = () =>
      setIsStreaming(false);
    context.current.onSuccess["setHasCompletedTrue"] = () =>
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

  const handleExplainSQLClick = () => {
    console.log("START", question);
    question && startStream(question, sql);
  };

  const formattedSql = format(sql);

  return (
    <>
      <div className="govuk-form-group">
        <h1 className="govuk-label-wrapper">
          <label className="govuk-label govuk-label--l">Generated SQL</label>
        </h1>
        <pre>
          <code className="language-sql">{formattedSql}</code>
        </pre>
        <button
          onClick={handleExplainSQLClick}
          className="govuk-button"
          data-module="govuk-button"
        >
          Explain
        </button>
      </div>
      {isStreaming && !hasCompleted && (
        <div className="govuk-inset-text">Loading...</div>
      )}
      {hasCompleted && latest && (
        <div className="govuk-inset-text">
          {streamOutputToString(latest.streamed_output)}
        </div>
      )}
    </>
  );
};

export default SQLViewer;
