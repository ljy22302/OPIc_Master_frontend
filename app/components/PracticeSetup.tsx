import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

const difficulties = [
  { value: "3-4", label: "Level 3-4", description: "~IM3" },
  { value: "5-6", label: "Level 5-6", description: "IM3~AL" },
];

const types = [
  { value: "topics", label: "주제선택분야"},
  { value: "roleplaying", label: "롤플레잉"},
  { value: "random", label: "돌발문제"}
];

const topics = [
  { id: "performance", label: "공연" },
  { id: "domestic_travel", label: "국내여행" },
  { id: "cafe", label: "카페" },
  { id: "exercise", label: "운동" },
  { id: "home", label: "집" },
  { id: "cooking", label: "요리" },
  { id: "camping", label: "캠핑" },
  { id: "jogging_walking", label: "조깅/산책" },
  { id: "housing", label: "사는 지역" },
  { id: "abroad", label: "해외여행" },
  { id: "holiday", label: "휴일" },
  { id: "neighbor", label: "이웃" },
  { id: "drinking_bar", label: "술집" },
  { id: "music", label: "음악" },
  { id: "game", label: "게임" },
  { id: "beach", label: "해변" },
  { id: "park", label: "공원" },
  { id: "mountain", label: "산" },
  { id: "shopping", label: "쇼핑" },
  { id: "movie", label: "영화" },
  { id: "job", label: "구직" },
  { id: "SNS", label: "SNS" }
];

export function PracticeSetup() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  const toggleType = (typeValue: string) => {
    setSelectedType(typeValue);
    if (typeValue !== "topics") {
      setSelectedTopic("");
    }
  };

  const toggleTopic = (topicId: string) => {
    if (selectedType !== "topics") {
      return;
    }
    setSelectedTopic(topicId);
  };

  const canStart =
    difficulty &&
    selectedType &&
    (selectedType !== "topics" || selectedTopic.length > 0);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
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
            <h1 className="text-3xl font-bold text-gray-900">연습 모드 설정</h1>
            <p className="text-gray-600">난이도와 주제를 선택하세요</p>
          </div>
        </div>

        {/* Difficulty Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            1. 난이도 선택
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {difficulties.map((diff) => (
              <Card
                key={diff.value}
                className={`p-6 cursor-pointer transition-all duration-300 bg-white ${
                  difficulty === diff.value
                    ? "border-2 border-yellow-400 shadow-lg"
                    : "border-2 border-transparent hover:border-gray-300"
                }`}
                onClick={() => setDifficulty(diff.value)}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {diff.label}
                </h3>
                <p className="text-gray-600">{diff.description}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Type Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            2. 유형 선택
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {types.map((type) => (
              <Card
                key={type.value}
                className={`p-6 cursor-pointer transition-all duration-300 bg-white ${
                  selectedType === type.value
                    ? "border-2 border-yellow-400 shadow-lg"
                    : "border-2 border-transparent hover:border-gray-300"
                }`}
                onClick={() => toggleType(type.value)}
              >
                <h3 className="text-xl font-bold text-gray-900">
                  {type.label}
                </h3>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Topic Selection */}
        {selectedType === "topics" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            3. 주제 선택
          </h2>
          <div className={`grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2 md:gap-x-3 ${selectedType !== "topics" ? "opacity-50" : ""}`}>
            {topics.map((topic) => {
              const isSelected = selectedTopic === topic.id;
              return (
                <Card
                  key={topic.id}
                  className={`p-6 transition-all duration-300 bg-white ${
                    isSelected
                      ? "border-2 border-yellow-400 shadow-lg"
                      : "border-2 border-transparent hover:border-gray-300"
                  } ${selectedType !== "topics" ? "cursor-not-allowed" : "cursor-pointer"}`}
                  onClick={() => toggleTopic(topic.id)}
                >
                  <div className="flex items-center justify-center">
                    <span className="text-base font-semibold text-gray-900">
                      {topic.label}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
          </motion.div>
        )}

        {/* Start Button */}
        {!selectedType && (
          <p className="text-sm text-gray-500 mb-4">
            먼저 연습 유형을 선택해주세요.
          </p>
        )}
        {selectedType === "topics" && !selectedTopic && (
          <p className="text-sm text-gray-500 mb-4">
            주제선택분야 유형을 선택하면 아래에서 주제를 골라주세요.
          </p>
        )}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            size="lg"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900"
            onClick={() => {
              const difficultyLabel = difficulties.find((diff) => diff.value === difficulty)?.label || "";
              const selectedTypeLabel = types.find((type) => type.value === selectedType)?.label || "";
              const selectedTopicLabels = selectedTopic
                ? [topics.find((topic) => topic.id === selectedTopic)?.label || selectedTopic]
                : [];

              navigate("/practice/question", {
                state: {
                  difficulty,
                  difficultyLabel,
                  selectedType,
                  selectedTypeLabel,
                  selectedTopicLabels,
                },
              });
            }}
            disabled={!canStart}
          >
            연습 시작하기
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          {!canStart && (
            <p className="text-center text-sm text-gray-500 mt-3">
              {selectedType === "topics"
                ? "난이도와 주제를 선택해주세요"
                : "난이도와 유형을 선택해주세요"}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
