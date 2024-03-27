import { useEffect } from "react";
import { format } from "sql-formatter";
import Prism from "prismjs";
import "prismjs/components/prism-sql";
import "prismjs/themes/prism-coy.css";

// hljs.registerLanguage('sql', sql);

const sqlExample = `
SELECT COUNT(CustomerID), Country
FROM Customers
GROUP BY Country
HAVING COUNT(CustomerID) > 5;
`;

const SQLViewer = ({ sql = sqlExample }: { sql: string }) => {
  useEffect(() => {
    // Highlight syntax every time the component mounts or updates
    Prism.highlightAll();
  }, []);

  const formattedSql = format(sql);
  return (
    <div className="govuk-form-group">
      <h1 className="govuk-label-wrapper">
        <label className="govuk-label govuk-label--l">Generated SQL</label>
      </h1>
      <pre>
        <code className="language-sql">{formattedSql}</code>
      </pre>
    </div>
  );
};

export default SQLViewer;
