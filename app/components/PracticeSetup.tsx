import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { createPracticeQuestionSet } from "../lib/practiceApi";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

const difficulties = [
  { value: "3-4", label: "Level 3-4", description: "~IM3" },
  { value: "5-6", label: "Level 5-6", description: "IM3~AL" },
];

const types = [
  { value: "topics", label: "주제 선택 분야" },
  { value: "roleplaying", label: "롤플레잉" },
  { value: "random", label: "돌발 문제" },
];

const topics = [
  { id: "performance", label: "공연" },
  { id: "domestic_travel", label: "국내 여행" },
  { id: "cafe", label: "카페" },
  { id: "exercise", label: "운동" },
  { id: "home", label: "집" },
  { id: "cooking", label: "요리" },
  { id: "camping", label: "캠핑" },
  { id: "jogging_walking", label: "조깅/산책" },
  { id: "housing", label: "주거" },
  { id: "abroad", label: "해외여행" },
  { id: "holiday", label: "휴일/연휴" },
  { id: "neighbor", label: "이웃" },
  { id: "drinking_bar", label: "술집/회식" },
  { id: "music", label: "음악" },
  { id: "game", label: "게임" },
  { id: "beach", label: "바다" },
  { id: "park", label: "공원" },
  { id: "mountain", label: "산" },
  { id: "shopping", label: "쇼핑" },
  { id: "movie", label: "영화" },
  { id: "job", label: "직장" },
  { id: "SNS", label: "SNS" },
];

export function PracticeSetup() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const toggleType = (typeValue: string) => {
    setSelectedType(typeValue);
    setSubmitError("");
    if (typeValue !== "topics") {
      setSelectedTopic("");
    }
  };

  const toggleTopic = (topicId: string) => {
    if (selectedType !== "topics") {
      return;
    }
    setSelectedTopic(topicId);
    setSubmitError("");
  };

  const canStart =
    difficulty &&
    selectedType &&
    (selectedType !== "topics" || selectedTopic.length > 0);

  const handleStart = async () => {
    if (!canStart || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const difficultyLabel = difficulties.find((diff) => diff.value === difficulty)?.label || "";
      const selectedTypeLabel = types.find((type) => type.value === selectedType)?.label || "";
      const selectedTopics = selectedTopic ? [selectedTopic] : [];
      const selectedTopicLabels = selectedTopic
        ? [topics.find((topic) => topic.id === selectedTopic)?.label || selectedTopic]
        : [];

      const questionSet = await createPracticeQuestionSet({
        difficulty,
        selectedType,
        selectedTopics,
      });

      navigate("/practice/question", {
        state: {
          difficulty,
          difficultyLabel,
          selectedType,
          selectedTypeLabel,
          selectedTopics,
          selectedTopicLabels,
          questionSetId: questionSet.questionSetId,
          questions: questionSet.questions,
        },
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "문제 세트를 불러오지 못했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/main")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">연습 모드 설정</h1>
            <p className="text-gray-600">난이도와 문제 유형을 선택해 주세요.</p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">1. 난이도 선택</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {difficulties.map((diff) => (
              <Card
                key={diff.value}
                className={`cursor-pointer bg-white p-6 transition-all duration-300 ${
                  difficulty === diff.value
                    ? "border-2 border-yellow-400 shadow-lg"
                    : "border-2 border-transparent hover:border-gray-300"
                }`}
                onClick={() => setDifficulty(diff.value)}
              >
                <h3 className="mb-1 text-xl font-bold text-gray-900">{diff.label}</h3>
                <p className="text-gray-600">{diff.description}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          <h2 className="mb-4 text-xl font-semibold text-gray-900">2. 유형 선택</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {types.map((type) => (
              <Card
                key={type.value}
                className={`cursor-pointer bg-white p-6 transition-all duration-300 ${
                  selectedType === type.value
                    ? "border-2 border-yellow-400 shadow-lg"
                    : "border-2 border-transparent hover:border-gray-300"
                }`}
                onClick={() => toggleType(type.value)}
              >
                <h3 className="text-xl font-bold text-gray-900">{type.label}</h3>
              </Card>
            ))}
          </div>
        </motion.div>

        {selectedType === "topics" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="mb-4 text-xl font-semibold text-gray-900">3. 주제 선택</h2>
            <div className="grid grid-cols-2 gap-x-2 gap-y-4 md:grid-cols-3 md:gap-x-3">
              {topics.map((topic) => {
                const isSelected = selectedTopic === topic.id;
                return (
                  <Card
                    key={topic.id}
                    className={`bg-white p-6 transition-all duration-300 ${
                      isSelected
                        ? "border-2 border-yellow-400 shadow-lg"
                        : "border-2 border-transparent hover:border-gray-300"
                    } cursor-pointer`}
                    onClick={() => toggleTopic(topic.id)}
                  >
                    <div className="flex items-center justify-center">
                      <span className="text-base font-semibold text-gray-900">{topic.label}</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        )}

        {!selectedType && <p className="mb-4 text-sm text-gray-500">먼저 연습 유형을 선택해 주세요.</p>}
        {selectedType === "topics" && !selectedTopic && (
          <p className="mb-4 text-sm text-gray-500">주제 선택 분야를 고르면 아래에서 주제를 하나 선택해 주세요.</p>
        )}
        {submitError && <p className="mb-4 text-sm text-red-500">{submitError}</p>}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Button
            size="lg"
            className="w-full bg-yellow-400 text-gray-900 hover:bg-yellow-500"
            onClick={() => void handleStart()}
            disabled={!canStart || isSubmitting}
          >
            {isSubmitting ? "문제 불러오는 중..." : "연습 시작하기"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          {!canStart && (
            <p className="mt-3 text-center text-sm text-gray-500">
              {selectedType === "topics" ? "난이도와 주제를 선택해 주세요" : "난이도와 유형을 선택해 주세요"}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
