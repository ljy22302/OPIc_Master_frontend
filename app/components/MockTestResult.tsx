import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Trophy, TrendingUp, Home, Download } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 text-center sm:mb-8"
        >
          <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 shadow-2xl sm:h-24 sm:w-24">
            <Trophy className="h-8 w-8 text-gray-900 sm:h-12 sm:w-12" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900 sm:mb-3 sm:text-5xl">모의고사 완료!</h1>
          <p className="text-base text-gray-600 sm:text-xl">상세 분석 결과를 확인하세요</p>
        </motion.div>

        {/* Main Grade Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-5 sm:mb-8"
        >
          <Card className="border-2 border-yellow-200 bg-yellow-50 p-5 sm:p-10">
            <div className="mb-5 text-center sm:mb-8">
              <p className="mb-2 text-sm text-gray-600 sm:mb-3 sm:text-lg">예상 최종 등급</p>
              <h2 className="mb-3 text-4xl font-bold text-gray-900 sm:mb-4 sm:text-6xl">
                {mockResult.grade}
              </h2>
              <div className="inline-block rounded-full bg-white px-4 py-2 shadow-lg sm:px-6 sm:py-3">
                <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{mockResult.score}/100</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center sm:gap-6">
              <div>
                <p className="mb-1 text-[10px] text-gray-600 sm:text-sm">총 문제</p>
                <p className="text-lg font-bold text-gray-900 sm:text-2xl">{mockResult.summary.totalQuestions}</p>
              </div>
              <div>
                <p className="mb-1 text-[10px] text-gray-600 sm:text-sm">평균 답변 시간</p>
                <p className="text-lg font-bold text-gray-900 sm:text-2xl">{mockResult.summary.averageResponseTime}</p>
              </div>
              <div>
                <p className="mb-1 text-[10px] text-gray-600 sm:text-sm">총 소요 시간</p>
                <p className="text-lg font-bold text-gray-900 sm:text-2xl">{mockResult.summary.totalTime}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Breakdown Scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-5 sm:mb-8"
        >
          <h3 className="mb-3 text-lg font-bold text-gray-900 sm:mb-4 sm:text-2xl">세부 점수</h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            {Object.entries(mockResult.breakdown).map(([key, value], index) => (
              <Card key={key} className="bg-white p-4 sm:p-6">
                <div className="mb-2 flex items-center justify-between sm:mb-3">
                  <span className="text-sm font-semibold text-gray-900 capitalize sm:text-base">
                    {key === "vocabulary" ? "어휘력" :
                     key === "grammar" ? "문법" :
                     key === "fluency" ? "유창성" :
                     "발음"}
                  </span>
                  <span className="text-base font-bold text-gray-900 sm:text-xl">{value}</span>
                </div>
                <Progress value={value} className="h-2.5 sm:h-3" />
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Category Scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-5 sm:mb-8"
        >
          <h3 className="mb-3 text-lg font-bold text-gray-900 sm:mb-4 sm:text-2xl">유형별 점수</h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            {mockResult.categoryScores.map((item) => (
              <Card key={item.category} className="bg-white p-4 sm:p-6">
                <div className="mb-2 flex items-center justify-between sm:mb-3">
                  <span className="text-sm font-semibold text-gray-900 sm:text-base">
                    {item.category}
                  </span>
                  <span className="text-base font-bold text-gray-900 sm:text-xl">
                    {item.score}
                  </span>
                </div>
                <Progress value={item.score} className="h-2.5 sm:h-3" />
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Strengths & Improvements */}
        <div className="mb-5 grid gap-3 md:grid-cols-2 sm:mb-8 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="h-full bg-white p-4 sm:p-6">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-900 sm:mb-4 sm:text-xl">
                <Trophy className="h-5 w-5 text-yellow-500 sm:h-6 sm:w-6" />
                주요 강점
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                {mockResult.strengths.map((item, index) => (
                  <li key={index} className="flex gap-2 text-sm text-gray-700 sm:gap-3">
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
            <Card className="h-full bg-white p-4 sm:p-6">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-900 sm:mb-4 sm:text-xl">
                <TrendingUp className="h-5 w-5 text-orange-500 sm:h-6 sm:w-6" />
                개선 포인트
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                {mockResult.improvements.map((item, index) => (
                  <li key={index} className="flex gap-2 text-sm text-gray-700 sm:gap-3">
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
          className="grid gap-3 md:grid-cols-2 sm:gap-4"
        >
          <Button
            variant="outline"
            onClick={() => alert("결과 다운로드 기능 (추후 구현)")}
            className="h-10 gap-2 text-sm sm:h-auto sm:text-base"
          >
            <Download className="w-4 h-4" />
            결과 저장
          </Button>
          <Button
            onClick={() => navigate("/main")}
            className="h-10 gap-2 bg-yellow-400 text-sm text-gray-900 hover:bg-yellow-500 sm:h-auto sm:text-base"
          >
            <Home className="w-4 h-4" />
            홈으로
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
