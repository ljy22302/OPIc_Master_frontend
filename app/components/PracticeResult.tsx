import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Bookmark, BookOpen, CheckCircle2, ChevronDown, ChevronUp, Home, RotateCcw, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

const feedback = {
  strengths: [
    "문장의 기본 구조가 안정적이라 전달이 잘 됩니다.",
    "주제에 맞는 핵심 정보는 빠짐없이 말하는 편입니다.",
    "알려진 표현을 적절히 활용하려는 시도가 보입니다.",
  ],
  improvements: [
    "답변의 첫 문장에 주제와 결론을 먼저 넣으면 더 명확해집니다.",
    "예시를 1개 더 추가해 답변의 밀도를 높여보세요.",
    "연결 표현을 2~3개 더 다양하게 써서 흐름을 자연스럽게 만들면 좋습니다.",
  ],
  detailedFeedback: [
    {
      question: "Tell me about your favorite cafe.",
      yourAnswer: "I really like the cafe near my house. It has a cozy atmosphere and great coffee...",
      feedbackPoints: [
        {
          label: "유창성",
          text: "문장 길이가 짧아 끊기는 느낌이 있으니, 한 문장을 조금 더 길게 이어 말해보세요.",
        },
        {
          label: "문법",
          text: "현재형 설명은 좋지만, 과거 경험이나 예시를 넣을 때 시제 일치를 한 번 더 확인하면 좋습니다.",
        },
        {
          label: "어휘",
          text: "cozy 외에도 comfortable, relaxing, quiet 같은 표현을 섞으면 답변이 더 풍부해집니다.",
        },
        {
          label: "전개",
          text: "카페의 위치, 자주 마시는 메뉴, 가는 이유를 순서대로 덧붙이면 답변이 더 자연스럽게 정리됩니다.",
        },
      ],
    },
    {
      question: "Describe a memorable travel experience.",
      yourAnswer: "Last summer, I went to Jeju Island with my family. We visited many beautiful places...",
      feedbackPoints: [
        {
          label: "유창성",
          text: "여행 설명은 좋지만, 장소를 나열하기보다 장면을 묘사하는 방식으로 연결하면 더 매끄럽습니다.",
        },
        {
          label: "문법",
          text: "과거형 동사를 일관되게 유지하면서, 장소 설명과 감정 표현을 분리해 말하면 안정감이 생깁니다.",
        },
        {
          label: "어휘",
          text: "beautiful, nice 대신 impressive, scenic, unforgettable 같은 표현을 넣어보세요.",
        },
        {
          label: "전개",
          text: "여행의 하이라이트 1개와 그때 느낀 점을 함께 말하면 답변이 더 입체적으로 들립니다.",
        },
      ],
    },
    {
      question: "What kind of exercise do you enjoy?",
      yourAnswer: "I enjoy running because it helps me stay healthy and clear my mind...",
      feedbackPoints: [
        {
          label: "유창성",
          text: "운동 이유를 말한 뒤, 빈도나 장소를 바로 이어서 말하면 흐름이 더 자연스러워집니다.",
        },
        {
          label: "문법",
          text: "because 절 이후의 문장을 더 다양하게 구성하면 단순한 문장 반복을 줄일 수 있습니다.",
        },
        {
          label: "어휘",
          text: "healthy 외에 energized, refreshed, focused 같은 단어를 함께 써보세요.",
        },
        {
          label: "전개",
          text: "운동 종류, 하는 장소, 최근 경험을 순서대로 붙이면 3~4문장으로 확장하기 좋습니다.",
        },
      ],
    },
  ],
};

type PracticeResultState = {
  questionCount?: number;
  transcripts?: string[];
};

type SavedPracticeEntry = {
  question: string;
  answer: string;
  savedAt: string;
  questionIndex: number;
};

const SAVED_PRACTICE_STORAGE_KEY = "practice-saved-qa";

export function PracticeResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedAnswers, setExpandedAnswers] = useState<number[]>([]);
  const [savedQuestions, setSavedQuestions] = useState<number[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const raw = window.localStorage.getItem(SAVED_PRACTICE_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as SavedPracticeEntry[]) : [];
      return parsed.map((entry) => entry.questionIndex);
    } catch {
      return [];
    }
  });
  const { questionCount = feedback.detailedFeedback.length, transcripts = [] } =
    (location.state as PracticeResultState) ?? {};

  const detailedFeedback = feedback.detailedFeedback.slice(0, questionCount).map((item, index) => ({
    ...item,
    yourAnswer: transcripts[index]?.trim() || item.yourAnswer,
  }));

  const toggleAnswer = (index: number) => {
    setExpandedAnswers((current) =>
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index]
    );
  };

  const saveQuestionAnswer = (index: number) => {
    const entry: SavedPracticeEntry = {
      question: detailedFeedback[index].question,
      answer: detailedFeedback[index].yourAnswer,
      savedAt: new Date().toISOString(),
      questionIndex: index,
    };

    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(SAVED_PRACTICE_STORAGE_KEY);
        const parsed = raw ? (JSON.parse(raw) as SavedPracticeEntry[]) : [];
        const next = [
          ...parsed.filter((item) => item.questionIndex !== index),
          entry,
        ];
        window.localStorage.setItem(SAVED_PRACTICE_STORAGE_KEY, JSON.stringify(next));
        setSavedQuestions(next.map((item) => item.questionIndex));
      } catch {
        // ignore storage failures
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-yellow-400">
            <CheckCircle2 className="h-10 w-10 text-gray-900" />
          </div>
          <h1 className="mb-2 text-4xl font-bold text-gray-900">연습 완료!</h1>
          <p className="text-gray-600">문제별 답변과 상세 피드백을 확인해보세요.</p>
        </motion.div>

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full bg-white p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                강점
              </h3>
              <ul className="space-y-3">
                {feedback.strengths.map((item, index) => (
                  <li key={index} className="flex gap-2 text-sm text-gray-700">
                    <span className="font-bold text-green-500">✓</span>
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
                개선 포인트
              </h3>
              <ul className="space-y-3">
                {feedback.improvements.map((item, index) => (
                  <li key={index} className="flex gap-2 text-sm text-gray-700">
                    <span className="font-bold text-orange-500">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h3 className="mb-4 text-xl font-semibold text-gray-900">문제별 상세 피드백</h3>
          <div className="space-y-4">
            {detailedFeedback.map((item, index) => (
              <Card key={index} className="bg-white p-6">
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <h4 className="font-semibold text-gray-900">
                    Q{index + 1}. {item.question}
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => saveQuestionAnswer(index)}
                    disabled={savedQuestions.includes(index)}
                    className="shrink-0 gap-2"
                  >
                    <Bookmark className="h-4 w-4" />
                    {savedQuestions.includes(index) ? "저장됨" : "문제 및 답변 저장"}
                  </Button>
                </div>

                <div className="mb-4 rounded-lg bg-gray-50 p-4">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <p className="text-sm text-gray-600">내 답변 보기</p>
                  </div>
                  <div className="relative">
                    <p
                      className={`text-sm text-gray-800 transition-all ${
                        expandedAnswers.includes(index) ? "" : "max-h-20 overflow-hidden"
                      }`}
                    >
                      {item.yourAnswer || "저장된 답변이 없습니다."}
                    </p>
                    {!expandedAnswers.includes(index) && item.yourAnswer && (
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-gray-50 to-transparent" />
                    )}
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAnswer(index)}
                      disabled={!item.yourAnswer.trim()}
                      className="gap-1 text-gray-600 hover:text-gray-900"
                    >
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

                <div className="space-y-3 rounded-lg bg-yellow-50 p-4">
                  <p className="text-sm font-semibold text-gray-700">개선 제안</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {item.feedbackPoints.map((point, pointIndex) => (
                      <div key={pointIndex} className="rounded-xl border border-yellow-100 bg-white p-3">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-yellow-700">
                          {point.label}
                        </p>
                        <p className="text-sm text-gray-800">{point.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid gap-4 md:grid-cols-3"
        >
          <Button variant="outline" onClick={() => navigate("/practice/setup")} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            다시 연습하기
          </Button>
          <Button variant="outline" onClick={() => navigate("/resources")} className="gap-2">
            <BookOpen className="h-4 w-4" />
            학습 자료 보기
          </Button>
          <Button onClick={() => navigate("/main")} className="gap-2 bg-yellow-400 text-gray-900 hover:bg-yellow-500">
            <Home className="h-4 w-4" />
            홈으로
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
