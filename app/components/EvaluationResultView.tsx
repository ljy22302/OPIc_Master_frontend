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

const CATEGORY_LABELS: Record<string, string> = {
  grammar: "문법",
  fluency: "유창성",
  vocabulary: "어휘",
  completion: "답변 완성도",
  relevance: "질문 적합도",
  speed: "속도",
  engagement: "호응 유도",
};

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <p className="text-xs font-semibold tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-900 whitespace-pre-wrap">{value}</p>
    </div>
  );
}

function BarMetricItem({
  label,
  value,
  max,
  suffix = "",
}: {
  label: string;
  value: number;
  max: number;
  suffix?: string;
}) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const safeMax = Math.max(max, 1);
  const percentage = Math.max(0, Math.min((safeValue / safeMax) * 100, 100));
  const displayValue = Number.isInteger(safeValue) ? safeValue.toString() : safeValue.toFixed(1);

  return (
    <div className="grid min-h-12 grid-cols-[7.5rem_1fr_4.5rem] items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-yellow-400 transition-all" style={{ width: `${percentage}%` }} />
      </div>
      <p className="text-right text-sm font-semibold text-gray-900">
        {displayValue}{suffix}
      </p>
    </div>
  );
}

function SectionToggle({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <div className="mb-4 flex justify-center">
      <Button
        type="button"
        size="sm"
        onClick={onClick}
        className="min-w-32 gap-1 rounded-full bg-yellow-400 px-5 font-semibold text-gray-900 shadow-sm hover:bg-yellow-500"
      >
        {isOpen ? (
          <>
            <ChevronUp className="h-4 w-4" />
            접기
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4" />
            더보기
          </>
        )}
      </Button>
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
  const [expandedResultDetails, setExpandedResultDetails] = useState<number[]>([]);
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
        setPageError(loadError instanceof Error ? loadError.message : "평가 결과를 불러오지 못했습니다.");
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

  const toggleResultDetails = (answerId: number) => {
    setExpandedResultDetails((current) =>
      current.includes(answerId) ? current.filter((item) => item !== answerId) : [...current, answerId],
    );
  };

  const handleSave = async (answerId: number) => {
    try {
      setPageError("");
      await saveEvaluatedAnswer(answerId);
      setSavedAnswerIds((current) => (current.includes(answerId) ? current : [...current, answerId]));
    } catch (saveError) {
      setPageError(saveError instanceof Error ? saveError.message : "문제와 답변 저장에 실패했습니다.");
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
      label: CATEGORY_LABELS[key] || key,
      value,
    }));
  }, [overall]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-yellow-400">
            <CheckCircle2 className="h-10 w-10 text-gray-900" />
          </div>
          <h1 className="mb-2 text-4xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600">{subtitle}</p>
          {showPracticeNotice && (
            <p className="mt-3 text-sm text-gray-500">
              연습 모드의 예상 등급은 참고용이며, 실제 모의고사 결과보다 정확도가 낮을 수 있습니다.
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
            저장된 평가 결과를 불러오는 중...
          </Card>
        ) : (
          <>
            {overall && (
              <>
                <div className="mb-8 grid gap-6 md:grid-cols-2">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="h-full bg-white p-6">
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        강점
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

                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="h-full bg-white p-6">
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <TrendingUp className="h-5 w-5 text-orange-500" />
                        개선 포인트
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
                      예상 등급: {overall.estimatedGrade || "데이터 부족"}
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                      {overall.isGradable ? "채점 가능" : "부분 채점"}
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

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
              <h3 className="mb-4 text-xl font-semibold text-gray-900">문항별 피드백</h3>
              <div className="space-y-4">
                {answers.map((answer, index) => (
                  <Card key={answer.id} className="bg-white p-6">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">Q{index + 1}. {answer.questionText}</h4>
                        <p className="mt-1 text-sm text-gray-500">
                          예상 등급: {answer.estimatedSubGrade || "데이터 부족"}
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
                        {savedAnswerIds.includes(answer.id) ? "저장됨" : "문제 및 답변 저장"}
                      </Button>
                    </div>

                    {answer.audioUrl && (
                      <div className="mb-4">
                        <audio controls preload="none" src={answer.audioUrl} className="w-full" />
                      </div>
                    )}

                    <div className="mb-4 rounded-lg bg-yellow-50 p-4">
                        <p className="mb-2 text-sm font-semibold text-gray-700">스크립트</p>
                        <div className="relative">
                          <p className={`text-sm leading-6 text-gray-800 ${expandedAnswers.includes(index) ? "" : "max-h-28 overflow-hidden"}`}>
                            {answer.usedTranscript || "스크립트 없음"}
                          </p>
                          {!expandedAnswers.includes(index) && answer.usedTranscript && (
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-yellow-50 to-transparent" />
                          )}
                        </div>
                        <p className="mt-3 text-right text-xs text-gray-500">* 평가에 사용되었습니다</p>
                        <div className="mt-2 flex justify-end">
                          <Button type="button" variant="ghost" size="sm" onClick={() => toggleAnswer(index)} className="gap-1 text-gray-600 hover:text-gray-900">
                            {expandedAnswers.includes(index) ? (
                              <>
                                <ChevronUp className="h-4 w-4" />
                                접기
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4" />
                                더보기
                              </>
                            )}
                          </Button>
                        </div>
                    </div>

                    <div className="mb-4 grid gap-4 lg:grid-cols-2">
                      <div className="rounded-lg bg-green-50 p-4">
                        <p className="mb-2 text-sm font-semibold text-gray-700">강점</p>
                        <ul className="space-y-2 text-sm text-gray-800">
                          {answer.feedback.strengths.map((item, itemIndex) => (
                            <li key={itemIndex}>+ {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-lg bg-orange-50 p-4">
                        <p className="mb-2 text-sm font-semibold text-gray-700">약점</p>
                        <ul className="space-y-2 text-sm text-gray-800">
                          {answer.feedback.weaknesses.map((item, itemIndex) => (
                            <li key={itemIndex}>! {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <SectionToggle
                      isOpen={expandedResultDetails.includes(answer.id)}
                      onClick={() => toggleResultDetails(answer.id)}
                    />

                    {expandedResultDetails.includes(answer.id) && (
                      <div className="space-y-4">
                        <div className="grid gap-3 lg:grid-cols-2">
                          <BarMetricItem label="단어 수" value={answer.metrics.wordCount} max={150} suffix="개" />
                          <BarMetricItem label="문장 수" value={answer.metrics.sentenceCount} max={20} suffix="개" />
                          <BarMetricItem label="평균 문장 길이" value={answer.metrics.avgSentenceLength} max={25} suffix="단어" />
                          <BarMetricItem label="말하기 속도" value={answer.metrics.speechRateWpm} max={180} suffix=" wpm" />
                          <BarMetricItem label="질문 키워드 일치도" value={Math.round(answer.metrics.keywordSimilarity * 100)} max={100} suffix="%" />
                          <BarMetricItem label="어휘 다양성" value={Math.round(answer.metrics.lexicalDiversity * 100)} max={100} suffix="%" />
                          <BarMetricItem label="침묵 비율" value={Math.round(answer.metrics.silenceRatio * 100)} max={100} suffix="%" />
                          <BarMetricItem label="STT 신뢰도" value={Math.round((answer.transcriptConfidence || 0) * 100)} max={100} suffix="%" />
                        </div>

                        <div className="grid gap-3 lg:grid-cols-2">
                          <BarMetricItem label="문법" value={answer.feedback.scores.grammar} max={100} suffix="점" />
                          <BarMetricItem label="유창성" value={answer.feedback.scores.fluency} max={100} suffix="점" />
                          <BarMetricItem label="어휘" value={answer.feedback.scores.vocabulary} max={100} suffix="점" />
                          <BarMetricItem label="답변 완성도" value={answer.feedback.scores.completion} max={100} suffix="점" />
                          <BarMetricItem label="질문 적합도" value={answer.feedback.scores.relevance} max={100} suffix="점" />
                          <BarMetricItem label="호응 유도" value={answer.feedback.scores.engagement} max={100} suffix="점" />
                        </div>

                        <div className="space-y-3 rounded-lg bg-yellow-50 p-4">
                          <p className="text-sm font-semibold text-gray-700">상세 코칭</p>
                          <div className="grid gap-3 md:grid-cols-2">
                            <MetricItem label="문법" value={answer.feedback.feedback.grammar} />
                            <MetricItem label="유창성" value={answer.feedback.feedback.fluency} />
                            <MetricItem label="어휘" value={answer.feedback.feedback.vocabulary} />
                            <MetricItem label="답변 완성도" value={answer.feedback.feedback.completion} />
                            <MetricItem label="질문 적합도" value={answer.feedback.feedback.relevance} />
                            <MetricItem label="속도" value={answer.feedback.feedback.speed} />
                            <MetricItem label="문장 길이" value={answer.feedback.sentenceLength} />
                            <MetricItem label="답변 시간" value={answer.feedback.answerTime} />
                            <MetricItem label="반복 표현" value={answer.feedback.repetitionRate} />
                            <MetricItem label="키워드 유사도" value={answer.feedback.keywordSimilarity} />
                          </div>
                          <div className="rounded-xl border border-yellow-100 bg-white p-4">
                            <p className="mb-2 text-sm font-semibold text-gray-700">개선 팁</p>
                            <ul className="space-y-2 text-sm text-gray-800">
                              {answer.feedback.tips.map((tip, tipIndex) => (
                                <li key={tipIndex}>- {tip}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </motion.div>
          </>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="grid gap-4 md:grid-cols-3">
          <Button variant="outline" onClick={() => onNavigate(restartPath)} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            다시 하기
          </Button>
          <Button variant="outline" onClick={() => onNavigate("/resources")} className="gap-2">
            <BookOpen className="h-4 w-4" />
            학습 자료 보기
          </Button>
          <Button onClick={() => onNavigate("/main")} className="gap-2 bg-yellow-400 text-gray-900 hover:bg-yellow-500">
            <Home className="h-4 w-4" />
            메인으로
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
