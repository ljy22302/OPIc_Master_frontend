import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Bookmark,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Home,
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import {
  getEvaluationSessionResult,
  saveEvaluatedAnswer,
  type EvaluationSession,
} from "../lib/evaluationApi";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

type EvaluationResultViewProps = {
  sessionId: number | null;
  initialSessionResult?: EvaluationSession | null;
  title: string;
  subtitle: string;
  restartPath: string;
  showPracticeNotice?: boolean;
  onNavigate: (path: string) => void;
};

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}

export function EvaluationResultView({
  sessionId,
  initialSessionResult,
  title,
  subtitle,
  restartPath,
  showPracticeNotice = false,
  onNavigate,
}: EvaluationResultViewProps) {
  const [sessionResult, setSessionResult] = useState<EvaluationSession | null>(initialSessionResult || null);
  const [expandedAnswers, setExpandedAnswers] = useState<number[]>([]);
  const [savedAnswerIds, setSavedAnswerIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(!initialSessionResult);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    let isMounted = true;

    if (!sessionId || initialSessionResult) {
      setIsLoading(false);
      return undefined;
    }

    const run = async () => {
      try {
        setIsLoading(true);
        const result = await getEvaluationSessionResult(sessionId);
        if (!isMounted) {
          return;
        }
        setSessionResult(result);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }
        setPageError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load the evaluation result.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void run();

    return () => {
      isMounted = false;
    };
  }, [initialSessionResult, sessionId]);

  const toggleAnswer = (index: number) => {
    setExpandedAnswers((current) =>
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index],
    );
  };

  const handleSave = async (answerId: number) => {
    try {
      setPageError("");
      await saveEvaluatedAnswer(answerId);
      setSavedAnswerIds((current) => (current.includes(answerId) ? current : [...current, answerId]));
    } catch (saveError) {
      setPageError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to save this question and answer.",
      );
    }
  };

  const answers = sessionResult?.answers || [];
  const overall = sessionResult?.overall;
  const overallScoreCards = useMemo(() => {
    if (!overall) {
      return [];
    }

    return Object.entries(overall.categoryScores).map(([key, value]) => ({
      key,
      label: key.replace(/([A-Z])/g, " $1"),
      value,
    }));
  }, [overall]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-yellow-400">
            <CheckCircle2 className="h-10 w-10 text-gray-900" />
          </div>
          <h1 className="mb-2 text-4xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600">{subtitle}</p>
          {showPracticeNotice && (
            <p className="mt-3 text-sm text-gray-500">
              Practice-mode grade estimates are helpful signals, but they are less reliable than a full mock test.
            </p>
          )}
        </motion.div>

        {pageError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {pageError}
          </div>
        )}

        {isLoading ? (
          <Card className="mb-8 bg-white p-6 text-sm text-gray-500">
            Loading your saved evaluation result...
          </Card>
        ) : (
          <>
            {overall && (
              <>
                <div className="mb-8 grid gap-6 md:grid-cols-2">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="h-full bg-white p-6">
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        Strengths
                      </h3>
                      <ul className="space-y-3">
                        {overall.strengths.map((item, index) => (
                          <li key={index} className="flex gap-2 text-sm text-gray-700">
                            <span className="font-bold text-green-500">+</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="h-full bg-white p-6">
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <TrendingUp className="h-5 w-5 text-orange-500" />
                        Improvements
                      </h3>
                      <ul className="space-y-3">
                        {overall.weaknesses.map((item, index) => (
                          <li key={index} className="flex gap-2 text-sm text-gray-700">
                            <span className="font-bold text-orange-500">!</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </motion.div>
                </div>

                <Card className="mb-8 bg-white p-6">
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800">
                      Estimated Grade: {overall.estimatedGrade || "Not enough data"}
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                      {overall.isGradable ? "Gradable" : "Partially gradable"}
                    </span>
                  </div>
                  <p className="mb-4 text-sm text-gray-700">{overall.feedback.summary}</p>
                  <p className="mb-5 text-sm text-gray-700">{overall.feedback.focus}</p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {overallScoreCards.map((item) => (
                      <MetricItem key={item.key} label={item.label} value={`${item.value}`} />
                    ))}
                  </div>
                </Card>
              </>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <h3 className="mb-4 text-xl font-semibold text-gray-900">Question-by-Question Feedback</h3>
              <div className="space-y-4">
                {answers.map((answer, index) => (
                  <Card key={answer.id} className="bg-white p-6">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Q{index + 1}. {answer.questionText}
                        </h4>
                        <p className="mt-1 text-sm text-gray-500">
                          Grade estimate: {answer.estimatedSubGrade || "Not enough data"}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void handleSave(answer.id)}
                        disabled={savedAnswerIds.includes(answer.id)}
                        className="shrink-0 gap-2"
                      >
                        <Bookmark className="h-4 w-4" />
                        {savedAnswerIds.includes(answer.id) ? "Saved" : "Save Question And Answer"}
                      </Button>
                    </div>

                    {answer.audioUrl && (
                      <div className="mb-4">
                        <audio controls preload="none" src={answer.audioUrl} className="w-full" />
                      </div>
                    )}

                    <div className="mb-4 grid gap-4 lg:grid-cols-3">
                      <div className="rounded-lg bg-gray-50 p-4">
                        <p className="mb-2 text-sm font-semibold text-gray-700">Original Transcript</p>
                        <p className="text-sm leading-6 text-gray-800">
                          {answer.originalTranscript || "No original transcript"}
                        </p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-4">
                        <p className="mb-2 text-sm font-semibold text-gray-700">Edited Transcript</p>
                        <p className="text-sm leading-6 text-gray-800">
                          {answer.editedTranscript || "No edited transcript"}
                        </p>
                      </div>
                      <div className="rounded-lg bg-yellow-50 p-4">
                        <p className="mb-2 text-sm font-semibold text-gray-700">Used Transcript</p>
                        <div className="relative">
                          <p
                            className={`text-sm leading-6 text-gray-800 ${
                              expandedAnswers.includes(index) ? "" : "max-h-28 overflow-hidden"
                            }`}
                          >
                            {answer.usedTranscript || "No transcript used for evaluation"}
                          </p>
                          {!expandedAnswers.includes(index) && answer.usedTranscript && (
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-yellow-50 to-transparent" />
                          )}
                        </div>
                        <div className="mt-3 flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAnswer(index)}
                            className="gap-1 text-gray-600 hover:text-gray-900"
                          >
                            {expandedAnswers.includes(index) ? (
                              <>
                                <ChevronUp className="h-4 w-4" />
                                Collapse
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4" />
                                Expand
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <MetricItem label="Words" value={`${answer.metrics.wordCount}`} />
                      <MetricItem label="Sentences" value={`${answer.metrics.sentenceCount}`} />
                      <MetricItem label="Avg Sentence" value={`${answer.metrics.avgSentenceLength}`} />
                      <MetricItem label="Speech Rate" value={`${answer.metrics.speechRateWpm} wpm`} />
                      <MetricItem label="Keyword Match" value={`${Math.round(answer.metrics.keywordSimilarity * 100)}%`} />
                      <MetricItem label="Lexical Diversity" value={`${Math.round(answer.metrics.lexicalDiversity * 100)}%`} />
                      <MetricItem label="Silence Ratio" value={`${Math.round(answer.metrics.silenceRatio * 100)}%`} />
                      <MetricItem label="Transcript Confidence" value={`${Math.round((answer.transcriptConfidence || 0) * 100)}%`} />
                    </div>

                    <div className="mb-4 grid gap-4 lg:grid-cols-2">
                      <div className="rounded-lg bg-green-50 p-4">
                        <p className="mb-2 text-sm font-semibold text-gray-700">Strengths</p>
                        <ul className="space-y-2 text-sm text-gray-800">
                          {answer.feedback.strengths.map((item, itemIndex) => (
                            <li key={itemIndex}>+ {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-lg bg-orange-50 p-4">
                        <p className="mb-2 text-sm font-semibold text-gray-700">Weaknesses</p>
                        <ul className="space-y-2 text-sm text-gray-800">
                          {answer.feedback.weaknesses.map((item, itemIndex) => (
                            <li key={itemIndex}>! {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mb-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      <MetricItem label="Grammar" value={`${answer.feedback.scores.grammar}`} />
                      <MetricItem label="Fluency" value={`${answer.feedback.scores.fluency}`} />
                      <MetricItem label="Vocabulary" value={`${answer.feedback.scores.vocabulary}`} />
                      <MetricItem label="Completion" value={`${answer.feedback.scores.completion}`} />
                      <MetricItem label="Relevance" value={`${answer.feedback.scores.relevance}`} />
                      <MetricItem label="Engagement" value={`${answer.feedback.scores.engagement}`} />
                    </div>

                    <div className="space-y-3 rounded-lg bg-yellow-50 p-4">
                      <p className="text-sm font-semibold text-gray-700">Detailed Coaching</p>
                      <div className="grid gap-3 md:grid-cols-2">
                        <MetricItem label="Grammar" value={answer.feedback.feedback.grammar} />
                        <MetricItem label="Fluency" value={answer.feedback.feedback.fluency} />
                        <MetricItem label="Vocabulary" value={answer.feedback.feedback.vocabulary} />
                        <MetricItem label="Completion" value={answer.feedback.feedback.completion} />
                        <MetricItem label="Relevance" value={answer.feedback.feedback.relevance} />
                        <MetricItem label="Speed" value={answer.feedback.feedback.speed} />
                        <MetricItem label="Sentence Length" value={answer.feedback.sentenceLength} />
                        <MetricItem label="Answer Time" value={answer.feedback.answerTime} />
                        <MetricItem label="Repetition" value={answer.feedback.repetitionRate} />
                        <MetricItem label="Keyword Similarity" value={answer.feedback.keywordSimilarity} />
                      </div>
                      <div className="rounded-xl border border-yellow-100 bg-white p-4">
                        <p className="mb-2 text-sm font-semibold text-gray-700">Improvement Tips</p>
                        <ul className="space-y-2 text-sm text-gray-800">
                          {answer.feedback.tips.map((tip, tipIndex) => (
                            <li key={tipIndex}>- {tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          </>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid gap-4 md:grid-cols-3"
        >
          <Button variant="outline" onClick={() => onNavigate(restartPath)} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Restart
          </Button>
          <Button variant="outline" onClick={() => onNavigate("/resources")} className="gap-2">
            <BookOpen className="h-4 w-4" />
            Study Resources
          </Button>
          <Button onClick={() => onNavigate("/main")} className="gap-2 bg-yellow-400 text-gray-900 hover:bg-yellow-500">
            <Home className="h-4 w-4" />
            Home
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
