import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Mail, Briefcase, GamepadIcon, Tent, Calendar, ShoppingBag, Film, Sun, TreePine, ArrowRight, Coffee, Plane, Dumbbell, Home, Utensils, Music } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

const difficulties = [
  { value: "3-4", label: "Level 3-4", description: "초급~중급" },
  { value: "5-6", label: "Level 5-6", description: "중급~고급" },
];

const types = [
  { value: "topics", label: "주제선택분야"},
  { value: "roleplaying", label: "롤플레잉"},
  { value: "random", label: "돌발문제"}
];

const topics = [
  { id: "performance", label: "공연", icon: Music },
  { id: "domestic_travel", label: "국내여행", icon: Plane },
  { id: "cafe", label: "카페", icon: Coffee },
  { id: "exercise", label: "운동", icon: Dumbbell },
  { id: "home", label: "집", icon: Home },
  { id: "cooking", label: "요리", icon: Utensils },
  { id: "camping", label: "캠핑", icon: Tent },
  { id: "jogging_walking", label: "조깅/산책", icon: Dumbbell },
  { id: "housing", label: "사는 지역", icon: Home },
  { id: "abroad", label: "해외여행", icon: Plane },
  { id: "holiday", label: "휴일", icon: Calendar },
  { id: "neighbor", label: "이웃", icon: Home },
  { id: "drinking_bar", label: "술집", icon: Coffee },
  { id: "music", label: "음악", icon: Music },
  { id: "game", label: "게임", icon: GamepadIcon },
  { id: "beach", label: "해변", icon: Sun },
  { id: "park", label: "공원", icon: TreePine },
  { id: "mountain", label: "산", icon: TreePine },
  { id: "shopping", label: "쇼핑", icon: ShoppingBag },
  { id: "movie", label: "영화", icon: Film },
  { id: "job", label: "구직", icon: Briefcase },
  { id: "SNS", label: "SNS", icon: Mail }
];

export function PracticeSetup() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const toggleType = (typeValue: string) => {
    setSelectedType(typeValue);
    if (typeValue !== "topics") {
      setSelectedTopics([]);
    }
  };

  const toggleTopic = (topicId: string) => {
    if (selectedType !== "topics") {
      return;
    }

    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((t) => t !== topicId)
        : [...prev, topicId]
    );
  };

  const canStart =
    difficulty &&
    selectedType &&
    (selectedType !== "topics" || selectedTopics.length > 0);

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            3. 주제 선택 <span className="text-sm text-gray-500">(복수 선택 가능)</span>
          </h2>
          {selectedType !== "topics" && (
            <p className="mb-4 text-sm text-gray-500">
              주제선택분야 유형을 선택한 경우에만 주제 선택이 활성화됩니다.
            </p>
          )}
          <div className={`grid md:grid-cols-3 gap-4 ${selectedType !== "topics" ? "opacity-50" : ""}`}>
            {topics.map((topic) => {
              const Icon = topic.icon;
              const isSelected = selectedTopics.includes(topic.id);
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
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isSelected ? "bg-yellow-400" : "bg-gray-200"
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${
                          isSelected ? "text-gray-900" : "text-gray-600"
                        }`}
                      />
                    </div>
                    <span className="font-semibold text-gray-900">
                      {topic.label}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* Start Button */}
        {!selectedType && (
          <p className="text-sm text-gray-500 mb-4">
            먼저 연습 유형을 선택해주세요.
          </p>
        )}
        {selectedType === "topics" && selectedTopics.length === 0 && (
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
              const selectedTopicLabels = selectedTopics.map(
                (topicId) => topics.find((topic) => topic.id === topicId)?.label || topicId
              );

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