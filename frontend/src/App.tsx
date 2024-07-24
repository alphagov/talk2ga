import './App.css';

import { useEffect, useRef, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
} from 'react-router-dom';
import { useStreamLog } from './useStreamLog';
import { useAppStreamCallbacks } from './useStreamCallback';
import { MainAnswer } from './components/MainAnswer';
import ErrorAnswer from './components/ErrorAnswer';
import {
  NotSatisfiedDetailsPayload,
  useQuestions,
} from './useQuestionAnalytics';
import Feedback from './components/Feedback';

import QuestionInput from './components/QuestionInput';
import TypeWriterLoading from './components/TypeWriterLoading';
import { getUsername } from './localstorage';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getQuestionData } from './apiService';
import { About } from './about';
import Layout from './components/Layout';
import { FrontendDateRange } from './types';

type DurationTrack = {
  startTime?: Date;
  endTime?: Date;
  durationMs?: number;
};

type CompletedQuestion = {
  dateRange: FrontendDateRange;
  question: string;
  answerJSON: string;
  sql: string;
};

const DEFAULT_DURATION_TRACK: DurationTrack = {};

function Playground() {
  let { questionId: urlQuestionId } = useParams();
  const [isStreaming, setIsStreaming] = useState(false);
  const [question, setQuestion] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [errorName, setErrorName] = useState<string | null>(null);
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);
  const { context, callbacks } = useAppStreamCallbacks();
  const { startStream, stopStream, latest } = useStreamLog(callbacks);
  const [fetchedSQL, setFetchedSQL] = useState<string | null>(null);
  const [completedQuestion, setCompletedQuestion] =
    useState<CompletedQuestion | null>(null);

  const initialDateRange = useRef<FrontendDateRange | null>(null);
  const selectedDateRange = useRef<FrontendDateRange | null>(null);
  const duration = useRef<DurationTrack>(DEFAULT_DURATION_TRACK);

  if (urlQuestionId?.includes('static')) {
    urlQuestionId = undefined;
  }

  const preventEdits = (fn: CallableFunction, msg?: string) => {
    return (...args: any[]) => {
      if (!!urlQuestionId) {
        toast.error(
          msg || 'You cannot ask a question when a question is already loaded',
        );
      } else {
        fn(...args);
      }
    };
  };

  const {
    recordQuestionCompletion,
    recordFeedbackSatisfied,
    recordFeedbackNotSatisfied,
    recordFeedbackNotSatisfiedDetails,
    currentQuestionId,
    setCurrentQuestionId,
  } = useQuestions();

  useEffect(() => {
    // Fetch question data if an ID is provided
    if (urlQuestionId) {
      getQuestionData(urlQuestionId)
        .then(({ question, dateRange, mainAnswer, executedSql }) => {
          setQuestion(question);
          initialDateRange.current = dateRange as unknown as FrontendDateRange;
          setCompletedQuestion({
            dateRange: dateRange as unknown as FrontendDateRange,
            question,
            answerJSON: mainAnswer,
            sql: executedSql,
          });
          setFetchedSQL(executedSql);
          setIsStreaming(false);
          setHasCompleted(true);
        })
        .catch((error) =>
          console.error('Error fetching question data:', error),
        );
    } else {
      // setIsLoaded(true);
    }
  }, [urlQuestionId]);

  /* Callbacks for ASK QUESTION */
  useEffect(() => {
    /**
     * OnStart
     */
    context.current.onStart['setDurationStart'] = () =>
      (duration.current = { ...DEFAULT_DURATION_TRACK, startTime: new Date() });
    context.current.onStart['setQuestion'] = ({ question }) =>
      setQuestion(question);
    context.current.onStart['setQuestionId'] = ({ questionId }) =>
      questionId && setCurrentQuestionId(questionId);
    context.current.onStart['setIsStreaming'] = () => setIsStreaming(true);
    context.current.onStart['setHasCompletedFalse'] = () =>
      setHasCompleted(false);

    /**
     * OnComplete
     */
    context.current.onComplete['recordCompletion'] = () => {
      const endTime = new Date();
      const durationMs =
        duration.current.startTime &&
        endTime.getTime() - duration.current.startTime.getTime();
      currentQuestionId &&
        recordQuestionCompletion(currentQuestionId, {
          logs_json: latest && JSON.stringify(latest.logs),
          duration: durationMs,
          username: getUsername() || undefined,
        });
      duration.current = { ...duration, endTime, durationMs };
    };
    context.current.onComplete['setIsNotStreaming'] = () =>
      setIsStreaming(false);
    context.current.onComplete['setHasCompletedTrue'] = () =>
      setHasCompleted(true);

    /**
     * OnSuccess
     */
    context.current.onSuccess['recordSuccess'] = ({ output, logs }) => {
      currentQuestionId &&
        recordQuestionCompletion(currentQuestionId, {
          logs_json: logs,
          succeeded: true,
          final_output: output as string,
        });
    };
    context.current.onSuccess['fetchExecutedSQL'] = () => {
      currentQuestionId &&
        getQuestionData(currentQuestionId).then(({ executedSql }) => {
          setFetchedSQL(executedSql);
        });
    };

    /**
     * OnError
     */
    context.current.onError['setIsErrorTrue'] = () => setIsError(true);
    context.current.onError['setErrorName'] = (errorName) =>
      setErrorName(errorName as unknown as string);
    context.current.onError['recordFailure'] = () => {
      currentQuestionId &&
        recordQuestionCompletion(currentQuestionId, { succeeded: false });
    };
  }, [latest, latest?.logs, latest?.final_output, currentQuestionId]);

  useEffect(() => {
    if (
      hasCompleted &&
      !isError &&
      latest &&
      selectedDateRange.current &&
      question &&
      fetchedSQL
    ) {
      setCompletedQuestion({
        dateRange: selectedDateRange.current,
        question,
        answerJSON: latest as unknown as string,
        sql: fetchedSQL,
      });
    }
  }, [hasCompleted, isError, latest, question, fetchedSQL]);

  const onSatisfiedFeedback = preventEdits((callback: CallableFunction) => {
    currentQuestionId && recordFeedbackSatisfied(currentQuestionId);
    callback();
  }, 'You cannot provide feedback when a question is already loaded');

  const onNotSatisfiedFeedback = preventEdits((callback: CallableFunction) => {
    currentQuestionId && recordFeedbackNotSatisfied(currentQuestionId);
    callback();
  }, 'You cannot provide feedback when a question is already loaded');

  const onNotSatisfiedFeedbackDetailsSubmit = preventEdits(
    (args: NotSatisfiedDetailsPayload, callback: CallableFunction) => {
      currentQuestionId &&
        recordFeedbackNotSatisfiedDetails(currentQuestionId, args);
      callback();
    },
    'You cannot provide feedback when a question is already loaded',
  );

  const isLoading = isStreaming && !hasCompleted;

  const handleSubmit = preventEdits(
    (question: string, dateRange: FrontendDateRange) => {
      setCompletedQuestion(null);
      startStream(question, dateRange);
    },
  );

  const handleDateRangeChange = (dateRange: FrontendDateRange | null) =>
    (selectedDateRange.current = dateRange);

  return (
    <Layout>
      <h1 className="govuk-heading-xl">Ask about GOV.UK analytics</h1>
      <p className="govuk-body-l">
        This experimental tool uses AI to answer questions about the performance
        of GOV.UK.{' '}
      </p>
      <div className="govuk-grid-row">
        <div className={'govuk-grid-column-three-quarters'}>
          <QuestionInput
            onSubmit={handleSubmit}
            onDateRangeChange={handleDateRangeChange}
            stopStreaming={stopStream}
            isStreaming={isStreaming}
            initialDateRange={initialDateRange.current}
          />
          {isLoading && <TypeWriterLoading />}
          {completedQuestion && (
            <MainAnswer
              answerJSON={completedQuestion.answerJSON}
              dateRange={completedQuestion.dateRange}
              sql={completedQuestion.sql}
              question={completedQuestion.question}
            />
          )}
          {isError && <ErrorAnswer errorName={errorName} />}
          {hasCompleted && (
            <Feedback
              handleSatisfiedFeedback={onSatisfiedFeedback}
              handleNotSatisfiedFeedback={onNotSatisfiedFeedback}
              handleNotSatisfiedFeedbackFormSubmit={
                onNotSatisfiedFeedbackDetailsSubmit
              }
            />
          )}
        </div>
      </div>
    </Layout>
  );
}

export function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/about" element={<About />} />
          <Route path="/:questionId" element={<Playground />} />
          <Route path="/" element={<Playground />} />
        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
