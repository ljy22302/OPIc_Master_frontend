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
  { value: "topics", label: "二쇱젣?좏깮遺꾩빞" },
  { value: "roleplaying", label: "濡ㅽ뵆?덉엵" },
  { value: "random", label: "?뚮컻臾몄젣" },
];

const topics = [
  { id: "performance", label: "怨듭뿰" },
  { id: "domestic_travel", label: "援?궡?ы뻾" },
  { id: "cafe", label: "移댄럹" },
  { id: "exercise", label: "?대룞" },
  { id: "home", label: "吏? " },
  { id: "cooking", label: "?붾━" },
  { id: "camping", label: "罹좏븨" },
  { id: "jogging_walking", label: "議곌퉭/?곗콉" },
  { id: "housing", label: "?щ뒗 吏?? " },
  { id: "abroad", label: "?댁쇅?ы뻾" },
  { id: "holiday", label: "?댁씪" },
  { id: "neighbor", label: "?댁썐" },
  { id: "drinking_bar", label: "?좎쭛" },
  { id: "music", label: "?뚯븙" },
  { id: "game", label: "寃뚯엫" },
  { id: "beach", label: "?대?" },
  { id: "park", label: "怨듭썝" },
  { id: "mountain", label: "?? " },
  { id: "shopping", label: "?쇳븨" },
  { id: "movie", label: "?곹솕" },
  { id: "job", label: "援ъ쭅" },
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
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/main")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">?곗뒿 紐⑤뱶 ?ㅼ젙</h1>
            <p className="text-gray-600">?쒖씠?꾩? 二쇱젣瑜??좏깮?섏꽭??/p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            1. ?쒖씠???좏깮
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            2. ?좏삎 ?좏깮
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

        {selectedType === "topics" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              3. 二쇱젣 ?좏깮
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

        {!selectedType && (
          <p className="text-sm text-gray-500 mb-4">
            癒쇱? ?곗뒿 ?좏삎???좏깮?댁＜?몄슂.
          </p>
        )}
        {selectedType === "topics" && !selectedTopic && (
          <p className="text-sm text-gray-500 mb-4">
            二쇱젣?좏깮遺꾩빞 ?좏삎???좏깮?섎㈃ ?꾨옒?먯꽌 二쇱젣瑜?怨⑤씪二쇱꽭??
          </p>
        )}
        {submitError && (
          <p className="text-sm text-red-500 mb-4">
            {submitError}
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
            onClick={() => void handleStart()}
            disabled={!canStart || isSubmitting}
          >
            {isSubmitting ? "문제 불러오는 중..." : "?곗뒿 ?쒖옉?섍린"}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          {!canStart && (
            <p className="text-center text-sm text-gray-500 mt-3">
              {selectedType === "topics"
                ? "?쒖씠?꾩? 二쇱젣瑜??좏깮?댁＜?몄슂"
                : "?쒖씠?꾩? ?좏삎???좏깮?댁＜?몄슂"}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
