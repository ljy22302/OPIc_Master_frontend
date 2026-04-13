import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Trophy, TrendingUp, BookOpen, Home, RotateCcw, Download } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";

const mockResult = {
  grade: "AL (Advanced Low)",
  score: 82,
  breakdown: {
    vocabulary: 85,
    grammar: 78,
    fluency: 84,
    pronunciation: 81,
  },
  summary: {
    totalQuestions: 15,
    averageResponseTime: "1분 45초",
    totalTime: "38분 23초",
  },
  strengths: [
    "다양한 어휘와 표현을 자연스럽게 사용합니다",
    "복잡한 문장 구조를 잘 활용하고 있습니다",
    "주제에 대한 깊이 있는 답변을 제공했습니다",
    "롤플레잉 상황에 적절하게 대응했습니다",
  ],
  improvements: [
    "일부 시제 혼용에 주의가 필요합니다",
    "연결어를 더 다양하게 활용해보세요",
    "몇몇 발음 개선이 필요합니다 (th, r 발음)",
    "답변 길이를 좀 더 균등하게 유지하면 좋겠습니다",
  ],
  categoryScores: [
    { category: "자기소개", score: 88 },
    { category: "주제 답변", score: 84 },
    { category: "롤플레잉", score: 79 },
    { category: "랜덤 질문", score: 80 },
  ],
};

export function MockTestResult() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-400 rounded-full mb-4 shadow-2xl">
            <Trophy className="w-12 h-12 text-gray-900" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-3">모의고사 완료!</h1>
          <p className="text-xl text-gray-600">상세 분석 결과를 확인하세요</p>
        </motion.div>

        {/* Main Grade Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-10 bg-yellow-50 border-2 border-yellow-200">
            <div className="text-center mb-8">
              <p className="text-lg text-gray-600 mb-3">예상 최종 등급</p>
              <h2 className="text-6xl font-bold text-gray-900 mb-4">
                {mockResult.grade}
              </h2>
              <div className="inline-block bg-white rounded-full px-6 py-3 shadow-lg">
                <p className="text-3xl font-bold text-gray-900">{mockResult.score}/100</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-sm text-gray-600 mb-1">총 문제</p>
                <p className="text-2xl font-bold text-gray-900">{mockResult.summary.totalQuestions}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">평균 답변 시간</p>
                <p className="text-2xl font-bold text-gray-900">{mockResult.summary.averageResponseTime}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">총 소요 시간</p>
                <p className="text-2xl font-bold text-gray-900">{mockResult.summary.totalTime}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Breakdown Scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">세부 점수</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(mockResult.breakdown).map(([key, value], index) => (
              <Card key={key} className="p-6 bg-white">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-gray-900 capitalize">
                    {key === "vocabulary" ? "어휘력" :
                     key === "grammar" ? "문법" :
                     key === "fluency" ? "유창성" :
                     "발음"}
                  </span>
                  <span className="text-xl font-bold text-gray-900">{value}</span>
                </div>
                <Progress value={value} className="h-3" />
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Category Scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">유형별 점수</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {mockResult.categoryScores.map((item) => (
              <Card key={item.category} className="p-6 text-center bg-white">
                <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                <p className="text-3xl font-bold text-gray-900">{item.score}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Strengths & Improvements */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 h-full bg-white">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                주요 강점
              </h3>
              <ul className="space-y-3">
                {mockResult.strengths.map((item, index) => (
                  <li key={index} className="flex gap-3 text-sm text-gray-700">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 h-full bg-white">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-orange-500" />
                개선 포인트
              </h3>
              <ul className="space-y-3">
                {mockResult.improvements.map((item, index) => (
                  <li key={index} className="flex gap-3 text-sm text-gray-700">
                    <span className="text-orange-500 font-bold">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid md:grid-cols-4 gap-4"
        >
          <Button
            variant="outline"
            onClick={() => alert("결과 다운로드 기능 (추후 구현)")}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            결과 저장
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/mocktest/setup")}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            재시험
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/resources")}
            className="gap-2"
          >
            <BookOpen className="w-4 h-4" />
            학습 자료
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