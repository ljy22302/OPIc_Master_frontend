import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  FolderOpen,
  MessageSquare,
  Play,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

type SavedQuestion = {
  id: number;
  category: string;
  level: string;
  question: string;
  savedDate: string;
  attempts: number;
  answers: string[];
};

type DeletedQuestion = {
  id: number;
  category: string;
  level: string;
  question: string;
  deletedDate: string;
  daysLeft: number;
};

type SavedPhrase = {
  phrase: string;
  meaning: string;
};

type SavedWordGroup = {
  topic: string;
  words: Array<{ word: string; meaning: string }>;
};

const savedQuestions: SavedQuestion[] = [
  {
    id: 1,
    category: "카페",
    level: "5-6",
    question: "Tell me about your favorite cafe and why you like it.",
    savedDate: "2026-04-08",
    attempts: 2,
    answers: [
      "My favorite cafe is a small place near my home because it has a calm atmosphere.",
      "I usually go there on weekends to relax and have a latte.",
    ],
  },
  {
    id: 2,
    category: "국내 여행",
    level: "5-6",
    question: "Describe a memorable travel experience from your past.",
    savedDate: "2026-04-07",
    attempts: 1,
    answers: ["I once visited Busan with my family, and the beach view was amazing."],
  },
  {
    id: 3,
    category: "운동",
    level: "3-4",
    question: "What kind of exercise do you enjoy and how often do you do it?",
    savedDate: "2026-04-06",
    attempts: 3,
    answers: [
      "I enjoy jogging because it helps me clear my mind.",
      "I usually exercise three times a week after work.",
    ],
  },
  {
    id: 4,
    category: "요리",
    level: "5-6",
    question: "Tell me about a dish you like to cook at home.",
    savedDate: "2026-04-05",
    attempts: 1,
    answers: ["I like to cook pasta at home because it is easy and tastes great."],
  },
];

const deletedQuestions: DeletedQuestion[] = [
  {
    id: 5,
    category: "음악",
    level: "3-4",
    question: "What kind of music do you listen to?",
    deletedDate: "2026-04-09",
    daysLeft: 5,
  },
  {
    id: 6,
    category: "집",
    level: "5-6",
    question: "Describe your living space in detail.",
    deletedDate: "2026-04-04",
    daysLeft: 1,
  },
];

const savedPhrases: SavedPhrase[] = [
  {
    phrase: "Let me introduce myself...",
    meaning: "제가 자기소개를 시작하겠습니다.",
  },
  {
    phrase: "To be more specific...",
    meaning: "좀 더 구체적으로 말하자면",
  },
  {
    phrase: "In conclusion...",
    meaning: "결론적으로",
  },
  {
    phrase: "That's all I wanted to say about...",
    meaning: "…에 대해 제가 말씀드리고 싶었던 것은 이것이 전부입니다.",
  },
];

const savedWordGroups: SavedWordGroup[] = [
  {
    topic: "카페",
    words: [
      { word: "atmosphere", meaning: "분위기" },
      { word: "cozy", meaning: "아늑한" },
      { word: "espresso", meaning: "에스프레소" },
      { word: "pastry", meaning: "페이스트리" },
    ],
  },
  {
    topic: "운동",
    words: [
      { word: "workout routine", meaning: "운동 루틴" },
      { word: "cardio", meaning: "유산소 운동" },
      { word: "strength training", meaning: "근력 운동" },
      { word: "endurance", meaning: "지구력" },
    ],
  },
  {
    topic: "국내 여행",
    words: [
      { word: "road trip", meaning: "자동차 여행" },
      { word: "itinerary", meaning: "여행 일정" },
      { word: "accommodation", meaning: "숙소" },
      { word: "scenic", meaning: "경치 좋은" },
    ],
  },
];

const topicCategories = [
  "공연",
  "국내 여행",
  "카페",
  "운동",
  "집",
  "요리",
  "캠핑",
  "조깅/걷기",
  "주거",
  "해외여행",
  "휴일",
  "이웃",
  "술집",
  "음악",
  "게임",
  "바다",
  "공원",
  "산",
  "쇼핑",
  "영화",
  "직장",
  "SNS",
];

export function SavedQuestions() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("saved");
  const [activeTopic, setActiveTopic] = useState<string | null>("카페");
  const [expandedPhrase, setExpandedPhrase] = useState<string | null>(null);
  const [openAnswers, setOpenAnswers] = useState<number | null>(null);

  const filteredQuestions = activeTopic
    ? savedQuestions.filter((item) => item.category === activeTopic)
    : [];

  const topicCounts = topicCategories.reduce<Record<string, number>>((acc, topic) => {
    acc[topic] = savedQuestions.filter((item) => item.category === topic).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/main")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">저장된 자료</h1>
            <p className="text-gray-600">저장한 문제, 문장, 단어를 한곳에서 다시 확인해보세요.</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="saved">저장된 문제 ({savedQuestions.length})</TabsTrigger>
            <TabsTrigger value="phrases">필수문장 ({savedPhrases.length})</TabsTrigger>
            <TabsTrigger value="words">저장된 단어 ({savedWordGroups.reduce((sum, group) => sum + group.words.length, 0)})</TabsTrigger>
            <TabsTrigger value="deleted">휴지통 ({deletedQuestions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="saved" className="mt-6">
            {savedQuestions.length === 0 ? (
              <Card className="bg-white p-12 text-center">
                <FolderOpen className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <h3 className="mb-2 text-xl font-semibold text-gray-900">저장된 문제가 없습니다</h3>
                <p className="mb-6 text-gray-600">학습 중에 문제를 저장하면 여기서 다시 볼 수 있습니다.</p>
                <Button onClick={() => navigate("/practice/setup")} className="bg-yellow-400 text-gray-900 hover:bg-yellow-500">
                  학습 시작하기
                </Button>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card className="border border-gray-200 bg-gray-50 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">저장된 주제별 문제</h2>
                      <p className="text-sm text-gray-600">
                        PracticeSetup의 주제 목록을 기준으로 저장된 문제를 확인하세요.
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">저장된 문제: {savedQuestions.length}개</div>
                  </div>
                </Card>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {topicCategories.map((topic) => {
                    const count = topicCounts[topic] ?? 0;
                    const isActive = activeTopic === topic;

                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => {
                          setActiveTopic(topic);
                          setOpenAnswers(null);
                        }}
                        className={`rounded-2xl border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                          isActive ? "border-yellow-400 bg-yellow-50 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-gray-900">{topic}</span>
                          <span className="text-xs font-semibold text-gray-600">{count}개</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div>
                  {activeTopic ? (
                    <div className="space-y-4">
                      <Card className="border border-yellow-200 bg-white p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{activeTopic}</h3>
                            <p className="text-sm text-gray-600">선택한 주제에 저장된 문제를 확인하고 다시 풀어보세요.</p>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => setActiveTopic(null)}>
                            선택 초기화
                          </Button>
                        </div>
                      </Card>

                      {filteredQuestions.length === 0 ? (
                        <Card className="border border-gray-200 bg-white p-10 text-center">
                          <FolderOpen className="mx-auto mb-4 h-14 w-14 text-gray-300" />
                          <h4 className="mb-2 text-lg font-semibold text-gray-900">{activeTopic}에 저장된 문제가 없습니다</h4>
                          <p className="text-sm text-gray-600">다른 주제를 선택하거나 학습 중 문제를 저장해보세요.</p>
                        </Card>
                      ) : (
                        <div className="space-y-4">
                          {filteredQuestions.map((item, index) => {
                            const isOpen = openAnswers === item.id;

                            return (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <Card className="border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg">
                                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex-1">
                                      <div className="mb-3 flex flex-wrap items-center gap-3">
                                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-gray-900">
                                          {item.category}
                                        </span>
                                        <span className="rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-900">
                                          Level {item.level}
                                        </span>
                                        <span className="text-sm text-gray-500">시도: {item.attempts}회</span>
                                      </div>

                                      <p className="mb-3 text-lg text-gray-900">{item.question}</p>

                                      <div className="flex flex-wrap items-center gap-3">
                                        <p className="text-sm text-gray-500">저장일: {item.savedDate}</p>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          className="h-auto px-0 py-0 text-sm font-semibold text-gray-800 hover:bg-transparent hover:text-gray-900"
                                          onClick={() => setOpenAnswers(isOpen ? null : item.id)}
                                        >
                                          저장 답변 보기
                                        </Button>
                                      </div>

                                      {isOpen && (
                                        <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                                          <h4 className="mb-3 text-sm font-semibold text-gray-900">저장 답변</h4>
                                          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                                            {item.answers.map((answer, answerIndex) => (
                                              <div
                                                key={answerIndex}
                                                className={`px-3 py-2 text-sm text-gray-700 ${answerIndex > 0 ? "border-t border-gray-200" : ""}`}
                                              >
                                                {answer}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex flex-shrink-0 gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() => navigate("/practice/question")}
                                        className="gap-2 bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                                      >
                                        <Play className="h-4 w-4" />
                                        다시 풀기
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                        onClick={() => alert("문제가 휴지통으로 이동했습니다.")}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </Card>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Card className="border border-gray-200 bg-white p-10 text-center">
                      <FolderOpen className="mx-auto mb-4 h-14 w-14 text-gray-300" />
                      <h4 className="mb-2 text-lg font-semibold text-gray-900">주제를 선택하면 저장된 문제를 볼 수 있습니다</h4>
                      <p className="text-sm text-gray-600">주제 버튼을 눌러 해당 주제의 저장된 문제를 확인하세요.</p>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="phrases" className="mt-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card className="border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-yellow-500" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">필수문장</h2>
                    <p className="text-sm text-gray-600">Resources 화면의 카드 구조를 참고해 저장된 필수 표현을 모아두었습니다.</p>
                  </div>
                </div>
              </Card>

              <div className="grid gap-4">
                {savedPhrases.map((item) => {
                  const isOpen = expandedPhrase === item.phrase;

                  return (
                    <Card key={item.phrase} className="border border-yellow-100 bg-yellow-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900">{item.phrase}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 h-auto gap-1 px-0 py-0 text-gray-700 hover:bg-transparent hover:text-gray-900"
                            onClick={() => setExpandedPhrase(isOpen ? null : item.phrase)}
                          >
                            뜻 보기
                          </Button>
                          {isOpen && <p className="mt-2 text-sm text-gray-600">{item.meaning}</p>}
                        </div>
                        <Bookmark className="mt-1 h-4 w-4 text-yellow-600" fill="currentColor" />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="words" className="mt-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card className="border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-yellow-500" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">저장된 단어</h2>
                    <p className="text-sm text-gray-600">단어 아래에 뜻이 바로 보이도록 Resources의 어휘 카드 구조를 참고했습니다.</p>
                  </div>
                </div>
              </Card>

              <div className="space-y-6">
                {savedWordGroups.map((group) => (
                  <Card key={group.topic} className="bg-white p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-yellow-500" />
                        <h3 className="text-xl font-bold text-gray-900">{group.topic}</h3>
                      </div>
                      <span className="text-sm text-gray-500">{group.words.length}개 저장됨</span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {group.words.map((item) => (
                        <div
                          key={item.word}
                          className="flex items-start justify-between gap-3 rounded-lg border border-yellow-100 bg-yellow-50 p-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900">{item.word}</p>
                            <p className="mt-1 text-sm text-gray-600">{item.meaning}</p>
                          </div>
                          <Bookmark className="h-4 w-4 text-yellow-600" fill="currentColor" />
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="deleted" className="mt-6">
            {deletedQuestions.length === 0 ? (
              <Card className="bg-white p-12 text-center">
                <Trash2 className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <h3 className="mb-2 text-xl font-semibold text-gray-900">휴지통이 비어있습니다</h3>
                <p className="text-gray-600">삭제된 문제는 7일 동안 보관됩니다.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                <Card className="mb-4 border border-yellow-200 bg-yellow-50 p-4">
                  <p className="text-sm text-gray-700">삭제된 문제는 7일 동안 보관되며 이후 자동으로 삭제됩니다.</p>
                </Card>
                {deletedQuestions.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-gray-100 p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="mb-3 flex items-center gap-3">
                            <span className="rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700">
                              {item.category}
                            </span>
                            <span className="rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700">
                              Level {item.level}
                            </span>
                            <span className={`text-sm font-semibold ${item.daysLeft <= 2 ? "text-red-600" : "text-orange-600"}`}>
                              {item.daysLeft}일 남음
                            </span>
                          </div>
                          <p className="mb-3 text-lg text-gray-700 line-through">{item.question}</p>
                          <p className="text-sm text-gray-500">삭제일: {item.deletedDate}</p>
                        </div>
                        <div className="flex flex-shrink-0 gap-2">
                          <Button size="sm" variant="outline" onClick={() => alert("문제가 복원되었습니다.")} className="gap-2">
                            <RotateCcw className="h-4 w-4" />
                            복원
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => {
                              if (window.confirm("문제를 영구 삭제하시겠습니까?")) {
                                alert("문제가 영구 삭제되었습니다.");
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
