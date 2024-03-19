import { resolveApiUrl } from "./utils/url";
import { simplifySchema } from "./utils/simplifySchema";
import { JsonSchema } from "@jsonforms/core";
import { useState } from "react";

import useSWR from "swr";
import defaults from "./utils/defaults";



type QuestionCompletionPayload = {
  logs_json?: string | null;
  final_output?: string | null;
  duration?: number;
}


export function useQuestions() {
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(
    null
  );

  const recordQuestion = async (question: string) => {
    const response = await fetch(resolveApiUrl(`/question`), {
      method: "POST",
      body: JSON.stringify({ text: question }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error(await response.text());

    const json = await response.json();

    setCurrentQuestionId(json.id);

    return json;
  };

  const recordQuestionCompletion = async (questionId: string, payload: QuestionCompletionPayload) => {
    const response = await fetch(
      resolveApiUrl(`/question/${questionId}`),
      {
        method: "PUT",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error(await response.text());

    const json = await response.json();

    return json;
  };

  const recordFeedbackSatisfied = async (questionId: string) => {
    const response = await fetch(
      resolveApiUrl(`/question/${questionId}`),
      {
        method: "PUT",
        body: JSON.stringify({has_feedback: true, is_feedback_positive: true}),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error(await response.text());

    const json = await response.json();

    return json;
  };
  
  const recordFeedbackNotSatisfied = async (questionId: string) => {
    const response = await fetch(
      resolveApiUrl(`/question/${questionId}`),
      {
        method: "PUT",
        body: JSON.stringify({has_feedback: true, is_feedback_positive: false}),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error(await response.text());

    const json = await response.json();

    return json;
  };
  

  return {
    recordQuestion,
    recordQuestionCompletion,
    recordFeedbackSatisfied,
    recordFeedbackNotSatisfied,
    currentQuestionId,
  };
}
