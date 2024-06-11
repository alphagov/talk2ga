import './App.css';

import { useEffect, useState } from 'react';
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
import SQLViewer from './components/SQLViewer';

import QuestionInput from './components/QuestionInput';
import TypeWriterLoading from './components/TypeWriterLoading';
import { getUsername } from './localstorage';
import { DateRange } from 'rsuite/esm/DateRangePicker';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { defaultDateRange } from './components/DateRangePicker';
import { getQuestionData } from './apiService';
import { showSqlFeatureFlag } from './envConfig';

type DurationTrack = {
  startTime?: Date;
  endTime?: Date;
  durationMs?: number;
};

const DEFAULT_DURATION_TRACK: DurationTrack = {};

function Playground() {
  let { questionId: urlQuestionId } = useParams();
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSQLBtnActive, setShowSQLBtnActive] = useState(false);
  const [question, setQuestion] = useState<string | null>(null);
  const [duration, setDuration] = useState<DurationTrack>(
    DEFAULT_DURATION_TRACK,
  );
  const [isError, setIsError] = useState(false);
  const [errorName, setErrorName] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | null>(
    defaultDateRange,
  );
  const [mainAnswer, setMainAnswer] = useState<string | null>(null);
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);
  const { context, callbacks } = useAppStreamCallbacks();
  const { startStream, stopStream, latest } = useStreamLog(callbacks);
  const [fetchedSQL, setFetchedSQL] = useState<string | null>(null);

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
          setSelectedDateRange(dateRange as unknown as DateRange);
          setMainAnswer(mainAnswer);
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
      setDuration({ ...DEFAULT_DURATION_TRACK, startTime: new Date() });
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
        duration.startTime && endTime.getTime() - duration.startTime.getTime();
      currentQuestionId &&
        recordQuestionCompletion(currentQuestionId, {
          logs_json: latest && JSON.stringify(latest.logs),
          duration: durationMs,
          username: getUsername() || undefined,
        });
      setDuration({ ...duration, endTime, durationMs });
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

  /**
   * DEPRECATED: This is a fallback method to get the SQL from the logs
   * We should be using the `executedSql` field from the getQuestionData() api call instead
   */
  // const getSqlFromLogs = () =>
  //   (latest &&
  //     latest.logs &&
  //     (latest.logs.selected_sql_passthrough?.final_output as { output: string })
  //       ?.output) ||
  //   "Error getting the SQL";

  const isLoading = isStreaming && !hasCompleted;

  const handleToggleShowSQL = () =>
    setShowSQLBtnActive(() => !showSQLBtnActive);

  const showSql = hasCompleted && showSQLBtnActive;
  const successful = hasCompleted && !isError;

  if (successful && latest) {
    !mainAnswer && setMainAnswer(latest as unknown as string);
  }

  const handleSubmit = preventEdits(startStream);

  return (
    <>
      <h1 className="govuk-heading-xl">What is your question <br /> for Google Analytics?</h1>
      <div className="govuk-grid-row">
        <div
          className={
            showSql ? 'govuk-grid-column-one-half' : 'govuk-grid-column-full'
          }
        >
          <QuestionInput
            handleSubmitQuestion={handleSubmit}
            handleStopStreaming={stopStream}
            isStreaming={isStreaming}
            toggleShowSQL={handleToggleShowSQL}
            showSQLBtnActive={showSQLBtnActive}
            hasCompleted={hasCompleted}
            selectedDateRange={selectedDateRange}
            setSelectedDateRange={setSelectedDateRange}
            forcedValue={question}
          />
          {isLoading && <TypeWriterLoading />}
          {mainAnswer && <MainAnswer text={mainAnswer} />}
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
        {showSqlFeatureFlag && showSql && question && fetchedSQL && (
          <div className="govuk-grid-column-one-half">
            <SQLViewer
              question={question}
              sql={fetchedSQL}
              isLoadedQuestion={!!urlQuestionId}
            />
          </div>
        )}
      </div>
    </>
  );
}

export function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/:questionId" element={<Playground />} />
          <Route path="/static/:questionId" element={<Playground />} />
          <Route path="/" element={<Playground />} />
        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
