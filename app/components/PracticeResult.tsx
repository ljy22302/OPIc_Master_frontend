import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import { CheckCircle2, TrendingUp, BookOpen, Home, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";

const feedback = {
  grade: "IH (Intermediate High)",
  score: 75,
  strengths: [
    "문장 구조가 전반적으로 잘 구성되어 있습니다",
    "주제에 대한 이해도가 높습니다",
    "다양한 어휘를 사용하고 있습니다",
  ],
  improvements: [
    "과거형 시제 사용에 주의가 필요합니다",
    "연결어를 더 활용하면 좋겠습니다",
    "일부 발음 개선이 필요합니다",
  ],
  detailedFeedback: [
    {
      question: "Tell me about your favorite cafe.",
      yourAnswer: "I really like the cafe near my house. It has a cozy atmosphere and great coffee...",
      suggestion: "Consider adding more descriptive details about the ambiance and specific menu items.",
    },
    {
      question: "Describe a memorable travel experience.",
      yourAnswer: "Last summer, I went to Jeju Island with my family. We visited many beautiful places...",
      suggestion: "Try using more varied vocabulary when describing emotions and experiences.",
    },
    {
      question: "What kind of exercise do you enjoy?",
      yourAnswer: "I enjoy running because it helps me stay healthy and clear my mind...",
      suggestion: "Good structure! You could elaborate more on the specific benefits you experience.",
    },
  ],
};

export function PracticeResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const { questionCount = feedback.detailedFeedback.length } =
    (location.state as { questionCount?: number }) ?? {};
  const detailedFeedback = feedback.detailedFeedback.slice(0, questionCount);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-400 rounded-full mb-4">
            <CheckCircle2 className="w-10 h-10 text-gray-900" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">연습 완료!</h1>
          <p className="text-gray-600">AI 피드백이 준비되었습니다</p>
        </motion.div>

        {/* Grade Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-8 bg-yellow-50 border-2 border-yellow-200">
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 mb-2">예상 등급</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {feedback.grade}
              </h2>
              <p className="text-sm text-gray-500">
                * 연습모드는 참고용입니다.
              </p>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">종합 점수</span>
                <span className="font-semibold text-gray-900">{feedback.score}/100</span>
              </div>
              <Progress value={feedback.score} className="h-3" />
            </div>
          </Card>
        </motion.div>

        {/* Strengths & Improvements */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 h-full bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                강점
              </h3>
              <ul className="space-y-3">
                {feedback.strengths.map((item, index) => (
                  <li key={index} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-green-500">✓</span>
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
            <Card className="p-6 h-full bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                개선 포인트
              </h3>
              <ul className="space-y-3">
                {feedback.improvements.map((item, index) => (
                  <li key={index} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-orange-500">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        </div>

        {/* Detailed Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">문제별 상세 피드백</h3>
          <div className="space-y-4">
            {detailedFeedback.map((item, index) => (
              <Card key={index} className="p-6 bg-white">
                <h4 className="font-semibold text-gray-900 mb-3">Q{index + 1}. {item.question}</h4>
                <div className="bg-gray-50 rounded-lg p-4 mb-3">
                  <p className="text-sm text-gray-600 mb-1">당신의 답변:</p>
                  <p className="text-sm text-gray-800">{item.yourAnswer}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">💡 개선 제안:</p>
                  <p className="text-sm text-gray-800">{item.suggestion}</p>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-4"
        >
          <Button
            variant="outline"
            onClick={() => navigate("/practice/setup")}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            다시 연습하기
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/resources")}
            className="gap-2"
          >
            <BookOpen className="w-4 h-4" />
            학습 자료 보기
          </Button>
          <Button
            onClick={() => navigate("/main")}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 gap-2"
          >
            <Home className="w-4 h-4" />
            홈으로
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
