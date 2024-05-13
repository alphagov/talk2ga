export const getQuestionData = async (questionId: string) => {
  const res = await fetch(`/question/${questionId}`);
  const data = await res.json();

  const { question, dateRange } = JSON.parse(data.text);

  return {
    question,
    dateRange: [dateRange["start_date"], dateRange["end_date"]],
    logs: JSON.parse(data.logs_json),
    mainAnswer: data.final_output,
    executedSql: data.executed_sql_query,
  };
};
