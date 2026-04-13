import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Trash2, Play, FolderOpen, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const savedQuestions = [
  {
    id: 1,
    category: "카페",
    level: "5-6",
    question: "Tell me about your favorite cafe and why you like it.",
    savedDate: "2026-04-08",
    attempts: 2,
  },
  {
    id: 2,
    category: "국내여행",
    level: "5-6",
    question: "Describe a memorable travel experience from your past.",
    savedDate: "2026-04-07",
    attempts: 1,
  },
  {
    id: 3,
    category: "운동",
    level: "3-4",
    question: "What kind of exercise do you enjoy and how often do you do it?",
    savedDate: "2026-04-06",
    attempts: 3,
  },
  {
    id: 4,
    category: "요리",
    level: "5-6",
    question: "Tell me about a dish you like to cook at home.",
    savedDate: "2026-04-05",
    attempts: 1,
  },
];

const deletedQuestions = [
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

const topicCategories = [
  "공연",
  "국내여행",
  "카페",
  "운동",
  "집",
  "요리",
  "캠핑",
  "조깅/산책",
  "사는 지역",
  "해외여행",
  "휴일",
  "이웃",
  "술집",
  "음악",
  "게임",
  "해변",
  "공원",
  "산",
  "쇼핑",
  "영화",
  "구직",
  "SNS",
];

export function SavedQuestions() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("saved");
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  const filteredQuestions = activeTopic
    ? savedQuestions.filter((item) => item.category === activeTopic)
    : [];

  const topicCounts = topicCategories.reduce<Record<string, number>>((acc, topic) => {
    acc[topic] = savedQuestions.filter((item) => item.category === topic).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/main")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">저장된 문제</h1>
            <p className="text-gray-600">복습이 필요한 문제를 다시 풀어보세요</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="saved">
              저장된 문제 ({savedQuestions.length})
            </TabsTrigger>
            <TabsTrigger value="deleted">
              휴지통 ({deletedQuestions.length})
            </TabsTrigger>
          </TabsList>

          {/* Saved Questions */}
          <TabsContent value="saved" className="mt-6">
            {savedQuestions.length === 0 ? (
              <Card className="p-12 text-center bg-white">
                <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  저장된 문제가 없습니다
                </h3>
                <p className="text-gray-600 mb-6">
                  연습 중 어려운 문제를 저장하여 나중에 다시 풀어보세요
                </p>
                <Button
                  onClick={() => navigate("/practice/setup")}
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900"
                >
                  연습 시작하기
                </Button>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card className="p-4 bg-gray-50 border border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">연결된 주제</h2>
                      <p className="text-sm text-gray-600">
                        PracticeSetup에 있는 주제 목록을 기준으로 저장된 문제를 확인하세요.
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      저장된 문제: {savedQuestions.length}개
                    </div>
                  </div>
                </Card>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {topicCategories.map((topic) => {
                    const count = topicCounts[topic] ?? 0;
                    const isActive = activeTopic === topic;
                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => setActiveTopic(topic)}
                        className={`rounded-2xl border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                          isActive ? "border-yellow-400 bg-yellow-50 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-gray-900">{topic}</span>
                          <span className="text-xs font-semibold text-gray-600">{count}개</span>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          {count > 0 ? "저장된 문제가 있습니다" : "저장된 문제가 없습니다"}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div>
                  {activeTopic ? (
                    <div className="space-y-4">
                      <Card className="p-4 bg-white border border-yellow-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{activeTopic}</h3>
                            <p className="text-sm text-gray-600">
                              선택한 주제에 저장된 문제를 확인하고 다시 풀어보세요.
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveTopic(null)}
                          >
                            선택 초기화
                          </Button>
                        </div>
                      </Card>

                      {filteredQuestions.length === 0 ? (
                        <Card className="p-10 text-center bg-white border border-gray-200">
                          <FolderOpen className="w-14 h-14 text-gray-300 mx-auto mb-4" />
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            {activeTopic}에 저장된 문제가 없습니다
                          </h4>
                          <p className="text-sm text-gray-600">
                            다른 주제를 선택하거나 연습 중 문제를 저장해보세요.
                          </p>
                        </Card>
                      ) : (
                        <div className="space-y-4">
                          {filteredQuestions.map((item, index) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <Card className="p-6 hover:shadow-lg transition-shadow bg-white">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                  <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3 mb-3">
                                      <span className="px-3 py-1 bg-yellow-100 text-gray-900 text-sm font-semibold rounded-full">
                                        {item.category}
                                      </span>
                                      <span className="px-3 py-1 bg-gray-200 text-gray-900 text-sm font-semibold rounded-full">
                                        Level {item.level}
                                      </span>
                                      <span className="text-sm text-gray-500">
                                        시도: {item.attempts}회
                                      </span>
                                    </div>
                                    <p className="text-lg text-gray-900 mb-3">
                                      {item.question}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      저장일: {item.savedDate}
                                    </p>
                                  </div>
                                  <div className="flex gap-2 flex-shrink-0">
                                    <Button
                                      size="sm"
                                      onClick={() => navigate("/practice/question")}
                                      className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 gap-2"
                                    >
                                      <Play className="w-4 h-4" />
                                      다시 풀기
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => alert("문제가 휴지통으로 이동되었습니다")}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Card className="p-10 text-center bg-white border border-gray-200">
                      <FolderOpen className="w-14 h-14 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        주제를 선택해 저장된 문제를 확인하세요
                      </h4>
                      <p className="text-sm text-gray-600">
                        PracticeSetup의 주제 목록을 클릭하면 해당 주제에 저장된 문제가 표시됩니다.
                      </p>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Deleted Questions (Trash) */}
          <TabsContent value="deleted" className="mt-6">
            {deletedQuestions.length === 0 ? (
              <Card className="p-12 text-center bg-white">
                <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  휴지통이 비어있습니다
                </h3>
                <p className="text-gray-600">
                  삭제된 문제는 7일간 보관됩니다
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                <Card className="p-4 bg-yellow-50 border-yellow-200 mb-4">
                  <p className="text-sm text-gray-700">
                    ⚠️ 삭제된 문제는 7일 후 자동으로 영구 삭제됩니다
                  </p>
                </Card>
                {deletedQuestions.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-6 bg-gray-100">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1 bg-gray-200 text-gray-700 text-sm font-semibold rounded-full">
                              {item.category}
                            </span>
                            <span className="px-3 py-1 bg-gray-200 text-gray-700 text-sm font-semibold rounded-full">
                              Level {item.level}
                            </span>
                            <span className={`text-sm font-semibold ${
                              item.daysLeft <= 2 ? "text-red-600" : "text-orange-600"
                            }`}>
                              {item.daysLeft}일 남음
                            </span>
                          </div>
                          <p className="text-lg text-gray-700 mb-3 line-through">
                            {item.question}
                          </p>
                          <p className="text-sm text-gray-500">
                            삭제일: {item.deletedDate}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => alert("문제가 복원되었습니다")}
                            className="gap-2"
                          >
                            <RotateCcw className="w-4 h-4" />
                            복원
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              if (window.confirm("문제를 영구 삭제하시겠습니까?")) {
                                alert("문제가 영구 삭제되었습니다");
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
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