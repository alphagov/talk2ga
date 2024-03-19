import { resolveApiUrl } from "./utils/url";
import { simplifySchema } from "./utils/simplifySchema";
import { JsonSchema } from "@jsonforms/core";
import { useState } from "react";

import useSWR from "swr";
import defaults from "./utils/defaults";

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

  const recordQuestionCompletion = () => {};

  const recordFeedback = () => {};
  const recordDetailedFeedback = () => {};

  return {
    recordQuestion,
    recordQuestionCompletion,
    recordFeedback,
    recordDetailedFeedback,
    currentQuestionId,
  };
}
