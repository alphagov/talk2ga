import Layout from './components/Layout';

export function About() {
  return (
    <Layout>
      <div>
        <h1 className="govuk-heading-xl">What is Ask Analytics</h1>
        <p className="govuk-body">
          Ask Analytics allows you to query GOV.UK data in Google Analytics /
          GA4.
        </p>
        <p className="govuk-body">
          The tool uses a Large Language Model (LLM) so the data can be queried
          using natural language prompts.
        </p>
        <h2 className="govuk-heading-l">What data is the LLM trained on?</h2>
        <p className="govuk-body">The LLM has context around:</p>
        <ul className="govuk-list govuk-list--bullet">
          <li>Google Analytics data (eg. where to look for page views)</li>
          <li>GOV.UK specific language (eg. what a smart answer is)</li>
        </ul>
        <p className="govuk-body">
          But there is no Search or Taxonomy data (yet).
        </p>
        <h2 className="govuk-heading-l">What the tool can't do</h2>
        <ul className="govuk-list govuk-list--bullet">
          <li>Handle more than one question in the same prompt</li>
          <li>Understand concepts such as document type or department</li>
          <li>
            Remember previous questions (which means you can’t ask follow up
            questions)
          </li>
          <li>Draw insights about pogo sticking behaviour</li>
        </ul>
        <h2 className="govuk-heading-l">Feedback</h2>
        <p className="govuk-body">
          If you have any thoughts or suggestions about this tool, or how we can
          better serve your needs for data insights, you can let us know using
          this <a href="https://docs.google.com/forms/d/e/1FAIpQLSeSinPTFPkYIb-jAebaD6id0fD0cT7P4YaG2ke6Ebebm_H7nA/viewform" target="_blank">Google form</a>.
        </p>
        <h2 className="govuk-heading-l">Contact</h2>
        <p className="govuk-body">GOV.UK Data Insights Team</p>
        <ul className="govuk-list govuk-list--bullet">
          <li>
            Email:{' '}
            <a
              className="govuk-link"
              href="mailto:gov-data-insights-team@digital.cabinet-office.gov.uk"
            >
              gov-data-insights-team@digital.cabinet-office.gov.uk
            </a>
          </li>
          <li>Slack: #data-insights-team</li>
        </ul>
      </div>
    </Layout>
  );
}
