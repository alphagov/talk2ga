import { CopyBlock } from 'react-code-blocks';
import {useEffect} from "react"
import { format } from 'sql-formatter';
import Prism from 'prismjs';
import 'prismjs/components/prism-sql';
import 'prismjs/themes/prism-coy.css';

// hljs.registerLanguage('sql', sql);



const SQLViewer = ({sql}: {sql: string}) => {
  useEffect(() => {
    // Highlight syntax every time the component mounts or updates
    Prism.highlightAll();
  }, []);

  const formattedSql = format(sql);
  return (
  <>
    <h1 className="govuk-label govuk-label--l">Generated SQL</h1>
    <pre>
      <code className="language-sql">
        {formattedSql}
      </code>
    </pre>
    {/* <CopyBlock text={sqlExample} language="sql" showLineNumbers/> */}
    {/* <div className="govuk-inset-text" dangerouslySetInnerHTML={{__html: hljs.highlight(sqlExample, { language: 'sql' }).value}}> */}
    {/* </div> */}
  </>
)};

export default SQLViewer;
