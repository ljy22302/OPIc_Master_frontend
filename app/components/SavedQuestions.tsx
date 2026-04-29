import { useEffect, useMemo, useState } from "react";
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
import { deleteSavedQuestion, getSavedQuestions, restoreSavedQuestion, type SavedQuestionItem } from "../lib/savedApi";

type SavedQuestion = {
  id: number;
  category: string;
  level: string;
  question: string;
  hint: string;
  translation: string;
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
  topic?: string;
};

type SavedWordGroup = {
  topic: string;
  words: Array<{ word: string; meaning: string }>;
};

const savedPhrasesStorageKey = "opicSavedPhrases";
const savedWordsStorageKey = "opicSavedWords";

function readStoredItems<T>(key: string): T[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    const parsed = rawValue ? JSON.parse(rawValue) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const topicCategories = [
  "공연",
  "국내 여행",
  "카페",
  "운동",
  "주거",
  "요리",
  "캠핑",
  "걷기/조깅",
  "이웃",
  "해외여행",
  "휴일",
  "모임",
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

const topicGroupLabel = "주제 선택 문제";
const primaryCategories = [topicGroupLabel, "돌발 문제", "롤플레잉"];

const categoryDisplayMap: Record<string, string> = {
  국내여행: "국내 여행",
  조깅산책: "걷기/조깅",
  해변: "바다",
  사는지역: "주거",
  구직: "직장",
  돌발문제: "돌발 문제",
};

function normalizeCategory(category?: string | null) {
  if (!category) {
    return "기타";
  }

  return categoryDisplayMap[category] || category;
}

function modeLabel(value: string) {
  if (value === "mock_test") {
    return "모의고사 모드";
  }
  if (value === "practice") {
    return "연습 모드";
  }
  return value || "저장됨";
}

function toSavedQuestion(item: SavedQuestionItem): SavedQuestion {
  return {
    id: item.id,
    category: normalizeCategory(item.category),
    level: modeLabel(item.level || ""),
    question: item.question,
    hint: item.hint || "",
    translation: item.translation || "",
    savedDate: item.savedDate,
    attempts: 0,
    answers: item.answer ? [item.answer] : [],
  };
}

function buildRetryQuestion(item: SavedQuestion) {
  return {
    id: `saved-${item.id}`,
    category: item.category,
    text: item.question,
    translation: item.translation,
    hint: item.hint,
  };
}

function groupSavedWords(words: Array<{ topic: string; word: string; meaning: string }>): SavedWordGroup[] {
  return words.reduce<SavedWordGroup[]>((groups, wordItem) => {
    const topic = wordItem.topic || "기타";
    const group = groups.find((current) => current.topic === topic);

    if (group) {
      group.words.push({ word: wordItem.word, meaning: wordItem.meaning });
    } else {
      groups.push({ topic, words: [{ word: wordItem.word, meaning: wordItem.meaning }] });
    }

    return groups;
  }, []);
}

export function SavedQuestions() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("saved");
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [expandedPhrase, setExpandedPhrase] = useState<string | null>(null);
  const [openAnswers, setOpenAnswers] = useState<number | null>(null);
  const [savedQuestions, setSavedQuestions] = useState<SavedQuestion[]>([]);
  const [deletedQuestions, setDeletedQuestions] = useState<DeletedQuestion[]>([]);
  const [savedPhrases, setSavedPhrases] = useState<SavedPhrase[]>([]);
  const [savedWordGroups, setSavedWordGroups] = useState<SavedWordGroup[]>([]);
  const [pageError, setPageError] = useState("");

  const savedWordCount = useMemo(
    () => savedWordGroups.reduce((sum, group) => sum + group.words.length, 0),
    [savedWordGroups],
  );

  const loadSavedQuestions = async () => {
    try {
      const response = await getSavedQuestions();
      setSavedQuestions(response.items.filter((item) => !item.deleted).map(toSavedQuestion));
      setDeletedQuestions(
        response.items
          .filter((item) => item.deleted)
          .map((item) => ({
            id: item.id,
            category: normalizeCategory(item.category),
            level: modeLabel(item.level || ""),
            question: item.question,
            deletedDate: item.savedDate,
            daysLeft: 0,
          })),
      );
      setPageError("");
    } catch (error) {
      setSavedQuestions([]);
      setDeletedQuestions([]);
      setPageError(error instanceof Error ? error.message : "저장된 문제를 불러오지 못했습니다.");
    }
  };

  useEffect(() => {
    void loadSavedQuestions();
    setSavedPhrases(readStoredItems<SavedPhrase>(savedPhrasesStorageKey));
    setSavedWordGroups(groupSavedWords(readStoredItems<{ topic: string; word: string; meaning: string }>(savedWordsStorageKey)));
  }, []);

  const filteredQuestions = activeTopic
    ? savedQuestions.filter((item) => item.category === activeTopic)
    : [];

  const savedTopicCategories = useMemo(
    () =>
      Array.from(
        new Set([
          ...topicCategories,
          ...savedQuestions.map((item) => item.category).filter((category) => !primaryCategories.includes(category)),
        ]),
      ),
    [savedQuestions],
  );

  const topicCounts = savedTopicCategories.reduce<Record<string, number>>((acc, topic) => {
    acc[topic] = savedQuestions.filter((item) => item.category === topic).length;
    return acc;
  }, {});

  const primaryCounts = {
    [topicGroupLabel]: savedTopicCategories.reduce((sum, topic) => sum + (topicCounts[topic] ?? 0), 0),
    "돌발 문제": savedQuestions.filter((item) => item.category === "돌발 문제").length,
    "롤플레잉": savedQuestions.filter((item) => item.category === "롤플레잉").length,
  };

  const visibleTopicCategories = savedTopicCategories.filter((topic) => (topicCounts[topic] ?? 0) > 0);

  const handleDeleteQuestion = async (savedId: number) => {
    try {
      const response = await deleteSavedQuestion(savedId);
      setSavedQuestions(response.items.filter((item) => !item.deleted).map(toSavedQuestion));
      setDeletedQuestions(
        response.items
          .filter((item) => item.deleted)
          .map((item) => ({
            id: item.id,
            category: normalizeCategory(item.category),
            level: modeLabel(item.level || ""),
            question: item.question,
            deletedDate: item.savedDate,
            daysLeft: 0,
          })),
      );
      setOpenAnswers(null);
      setPageError("");
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "문제를 삭제하지 못했습니다.");
    }
  };

  const handleRestoreQuestion = async (savedId: number) => {
    try {
      const response = await restoreSavedQuestion(savedId);
      setSavedQuestions(response.items.filter((item) => !item.deleted).map(toSavedQuestion));
      setDeletedQuestions(
        response.items
          .filter((item) => item.deleted)
          .map((item) => ({
            id: item.id,
            category: normalizeCategory(item.category),
            level: modeLabel(item.level || ""),
            question: item.question,
            deletedDate: item.savedDate,
            daysLeft: 0,
          })),
      );
      setPageError("");
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "문제를 복원하지 못했습니다.");
    }
  };

  const handleRetryQuestion = (item: SavedQuestion) => {
    navigate("/practice/question", {
      state: {
        difficultyLabel: item.level,
        selectedType: "saved",
        selectedTypeLabel: "저장된 문제",
        selectedTopics: [],
        selectedTopicLabels: [item.category],
        questions: [buildRetryQuestion(item)],
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/main")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">저장된 자료</h1>
            <p className="text-gray-600">저장한 문제, 필수 문장, 단어를 한곳에서 다시 확인하세요.</p>
          </div>
        </div>

        {pageError && (
          <Card className="mb-6 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {pageError}
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid h-auto w-full grid-cols-4 gap-1 bg-transparent p-0 sm:gap-3">
            <TabsTrigger
              value="saved"
              className="group flex h-14 flex-row items-center justify-center rounded-xl border border-gray-200 bg-white px-1 py-2 text-center shadow-sm transition data-[state=active]:border-yellow-400 data-[state=active]:bg-yellow-50 data-[state=active]:shadow-md sm:h-20 sm:flex-col sm:items-start sm:justify-between sm:rounded-2xl sm:px-4 sm:py-3 sm:text-left"
            >
              <div className="hidden w-full items-start justify-between gap-3 sm:flex">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-gray-900">
                  01
                </span>
                <FolderOpen className="h-5 w-5 text-gray-400 transition group-data-[state=active]:text-yellow-600" />
              </div>
              <span className="text-[11px] font-semibold leading-tight text-gray-900 sm:text-sm">저장된 문제 ({savedQuestions.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="phrases"
              className="group flex h-14 flex-row items-center justify-center rounded-xl border border-gray-200 bg-white px-1 py-2 text-center shadow-sm transition data-[state=active]:border-yellow-400 data-[state=active]:bg-yellow-50 data-[state=active]:shadow-md sm:h-20 sm:flex-col sm:items-start sm:justify-between sm:rounded-2xl sm:px-4 sm:py-3 sm:text-left"
            >
              <div className="hidden w-full items-start justify-between gap-3 sm:flex">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-gray-900">
                  02
                </span>
                <MessageSquare className="h-5 w-5 text-gray-400 transition group-data-[state=active]:text-yellow-600" />
              </div>
              <span className="text-[11px] font-semibold leading-tight text-gray-900 sm:text-sm">필수 문장 ({savedPhrases.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="words"
              className="group flex h-14 flex-row items-center justify-center rounded-xl border border-gray-200 bg-white px-1 py-2 text-center shadow-sm transition data-[state=active]:border-yellow-400 data-[state=active]:bg-yellow-50 data-[state=active]:shadow-md sm:h-20 sm:flex-col sm:items-start sm:justify-between sm:rounded-2xl sm:px-4 sm:py-3 sm:text-left"
            >
              <div className="hidden w-full items-start justify-between gap-3 sm:flex">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-gray-900">
                  03
                </span>
                <BookOpen className="h-5 w-5 text-gray-400 transition group-data-[state=active]:text-yellow-600" />
              </div>
              <span className="text-[11px] font-semibold leading-tight text-gray-900 sm:text-sm">
                저장된 단어 ({savedWordCount})
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="deleted"
              className="group flex h-14 flex-row items-center justify-center rounded-xl border border-gray-200 bg-white px-1 py-2 text-center shadow-sm transition data-[state=active]:border-yellow-400 data-[state=active]:bg-yellow-50 data-[state=active]:shadow-md sm:h-20 sm:flex-col sm:items-start sm:justify-between sm:rounded-2xl sm:px-4 sm:py-3 sm:text-left"
            >
              <div className="hidden w-full items-start justify-between gap-3 sm:flex">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-gray-900">
                  04
                </span>
                <Trash2 className="h-5 w-5 text-gray-400 transition group-data-[state=active]:text-yellow-600" />
              </div>
              <span className="text-[11px] font-semibold leading-tight text-gray-900 sm:text-sm">휴지통 ({deletedQuestions.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="saved" className="mt-10 pt-2">
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {primaryCategories.map((category) => {
                    const count = primaryCounts[category as keyof typeof primaryCounts] ?? 0;
                    const isActive = activeGroup === category;

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => {
                          if (activeGroup === category) {
                            setActiveGroup(null);
                            setActiveTopic(null);
                          } else {
                            setActiveGroup(category);
                            setActiveTopic(category === topicGroupLabel ? null : category);
                          }
                          setOpenAnswers(null);
                        }}
                        className={`rounded-2xl border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                          isActive ? "border-yellow-400 bg-yellow-50 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-gray-900">{category}</span>
                          <span className="text-xs font-semibold text-gray-600">{count}개</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {activeGroup === topicGroupLabel && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {visibleTopicCategories.map((topic) => {
                      const count = topicCounts[topic] ?? 0;
                      const isActive = activeTopic === topic;

                      return (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => {
                            setActiveTopic((currentTopic) => (currentTopic === topic ? null : topic));
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
                )}

                <div>
                  {activeTopic ? (
                    <div className="space-y-4">
                      {filteredQuestions.length === 0 ? (
                        <Card className="border border-gray-200 bg-white p-10 text-center">
                          <FolderOpen className="mx-auto mb-4 h-14 w-14 text-gray-300" />
                          <h4 className="mb-2 text-lg font-semibold text-gray-900">{activeTopic}에 저장된 문제가 없습니다</h4>
                          <p className="text-sm text-gray-600">다른 주제를 선택하거나 연습 중에 문제를 저장해 보세요.</p>
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
                                          저장된 답변 보기
                                        </Button>
                                      </div>

                                      {isOpen && (
                                        <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                                          <h4 className="mb-3 text-sm font-semibold text-gray-900">저장된 답변</h4>
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
                                        onClick={() => handleRetryQuestion(item)}
                                        className="gap-2 bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                                      >
                                        <Play className="h-4 w-4" />
                                        다시 풀기
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                        onClick={() => void handleDeleteQuestion(item.id)}
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
          </TabsContent>

          <TabsContent value="phrases" className="mt-10 pt-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card className="border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-yellow-500" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">필수 문장</h2>
                    <p className="text-sm text-gray-600">Resources 화면의 카드 구조를 참고해 저장된 필수 표현을 모아두었습니다.</p>
                  </div>
                </div>
              </Card>

              <div className="grid gap-4">
                {savedPhrases.length === 0 ? (
                  <Card className="bg-white p-10 text-center">
                    <MessageSquare className="mx-auto mb-4 h-14 w-14 text-gray-300" />
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">저장된 필수 문장이 없습니다</h3>
                    <p className="text-sm text-gray-600">학습 자료에서 문장을 저장하면 여기서 다시 볼 수 있습니다.</p>
                  </Card>
                ) : savedPhrases.map((item) => {
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

          <TabsContent value="words" className="mt-10 pt-2">
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
                {savedWordGroups.length === 0 ? (
                  <Card className="bg-white p-10 text-center">
                    <BookOpen className="mx-auto mb-4 h-14 w-14 text-gray-300" />
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">저장된 단어가 없습니다</h3>
                    <p className="text-sm text-gray-600">학습 자료에서 단어를 저장하면 저장된 단어만 여기에 표시됩니다.</p>
                  </Card>
                ) : savedWordGroups.map((group) => (
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

          <TabsContent value="deleted" className="mt-10 pt-2">
            {deletedQuestions.length === 0 ? (
              <Card className="bg-white p-12 text-center">
                <Trash2 className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <h3 className="mb-2 text-xl font-semibold text-gray-900">휴지통이 비어있습니다</h3>
                <p className="text-gray-600">삭제된 문제는 7일 동안 보관된 뒤 자동으로 삭제됩니다.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                <Card className="mb-4 border border-yellow-200 bg-yellow-50 p-4">
                  <p className="text-sm text-gray-700">삭제된 문제는 7일 동안 보관된 뒤 이후 자동으로 삭제됩니다.</p>
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
                          <Button size="sm" variant="outline" onClick={() => void handleRestoreQuestion(item.id)} className="gap-2">
                            <RotateCcw className="h-4 w-4" />
                            복원
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => {
                              if (window.confirm("문제를 영구 삭제하시겠습니까?")) {
                                alert("현재는 휴지통 보관만 지원합니다.");
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
