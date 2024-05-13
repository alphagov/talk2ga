import { useEffect } from "react";
import { LogEntry } from "../useStreamLog";
import { str } from "../utils/str";
// @ts-ignore
import Prism from "prismjs";
import "prismjs/components/prism-json";
import "prismjs/themes/prism-coy.css";

const Logs = ({ logs }: { logs: { [name: string]: LogEntry } }) => {
  useEffect(() => {
    // Highlight syntax every time the component mounts or updates
    Prism.highlightAll();
  }, []);
  return (
    <div className="logs-container govuk-grid-column-full">
      {Object.values(logs).map((log) => {
        let toFormat = str(log.final_output) as string;
        toFormat = JSON.stringify(JSON.parse(toFormat), null, 4);

        return (
          <details className="govuk-details" key={`${log.id}`}>
            <summary className="govuk-details__summary">
              <span className="govuk-details__summary-text">{log.name}</span>
            </summary>
            {/* <div className="govuk-details__text">{toFormat ?? "..."}</div> */}
            <pre>
              <code className="language-json">{toFormat}</code>
            </pre>
          </details>
        );
      })}
    </div>
  );
};

export default Logs;
