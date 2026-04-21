import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import { BookOpen, CheckCircle2, Home, RotateCcw, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

const mockFeedback = {
  strengths: [
    "모의고사 전체 흐름을 끝까지 완주한 점이 좋았습니다.",
    "주어진 질문에 대해 핵심 내용을 빠르게 잡아내는 모습이 보였습니다.",
    "롤플레이와 후속 질문에서도 기본적인 응답 구조를 유지했습니다.",
  ],
  improvements: [
    "답변 길이를 조금 더 균등하게 유지하면 전체 완성도가 올라갑니다.",
    "연결어를 더 다양하게 써서 문장 사이를 자연스럽게 이어보세요.",
    "일부 질문은 예시를 1개 더 붙이면 훨씬 안정적으로 들립니다.",
  ],
  detailedFeedback: [
    {
      question: "Self-Intro",
      yourAnswer: "첫 질문에서 자기소개를 자연스럽게 시작했습니다.",
      feedbackPoints: [
        { label: "구성", text: "짧은 인사, 현재 상황, 취미 순으로 정리하면 더 안정적입니다." },
        { label: "표현", text: "자주 쓰는 표현을 2~3개 준비해두면 시작이 훨씬 부드러워집니다." },
      ],
    },
    {
      question: "Favorite Cafe",
      yourAnswer: "좋아하는 카페와 이유를 핵심적으로 설명했습니다.",
      feedbackPoints: [
        { label: "전개", text: "이유 1개, 예시 1개, 마무리 1개로 나누면 답변이 더 또렷해집니다." },
        { label: "어휘", text: "good, nice 대신 cozy, quiet, relaxing 같은 표현을 섞어보세요." },
      ],
    },
    {
      question: "Cafe Atmosphere",
      yourAnswer: "카페의 분위기와 내부를 설명하는 흐름이 자연스러웠습니다.",
      feedbackPoints: [
        { label: "묘사", text: "색, 조명, 소리, 좌석처럼 감각 요소를 넣으면 더 생동감 있어집니다." },
        { label: "연결", text: "and, also, in addition 같은 연결어를 활용해 보세요." },
      ],
    },
    {
      question: "Memorable Cafe Experience",
      yourAnswer: "기억에 남는 경험을 이야기하는 방향은 좋았습니다.",
      feedbackPoints: [
        { label: "상세화", text: "상황을 한 문장 더 붙이면 답변이 더 입체적으로 들립니다." },
        { label: "정리", text: "마지막에 느낀 점을 한 번 정리해주면 인상이 좋아집니다." },
      ],
    },
    {
      question: "Recent Trip",
      yourAnswer: "최근 여행지를 빠르게 떠올려 답변한 점이 좋았습니다.",
      feedbackPoints: [
        { label: "정보", text: "언제, 어디를, 누구와 갔는지까지 넣으면 정보가 더 선명해집니다." },
        { label: "표현", text: "went to 대신 traveled to, visited, spent time in 같은 표현을 섞어보세요." },
      ],
    },
    {
      question: "Trip Activities",
      yourAnswer: "여행 중 활동을 나열하는 흐름이 무난했습니다.",
      feedbackPoints: [
        { label: "순서", text: "아침-점심-저녁처럼 시간 순서로 정리하면 듣기 쉬워집니다." },
        { label: "예시", text: "대표 활동 2개만 자세히 설명해도 더 자연스럽습니다." },
      ],
    },
    {
      question: "Travel Comparison",
      yourAnswer: "과거와 현재 여행을 비교하는 포인트를 잡아냈습니다.",
      feedbackPoints: [
        { label: "대비", text: "now, in the past, compared to before 같은 표현을 활용해보세요." },
        { label: "문장", text: "짧은 비교문 2개를 연결하면 답변이 더 선명해집니다." },
      ],
    },
    {
      question: "Exercise Habit",
      yourAnswer: "평소 하는 운동을 설명하는 기본 구조는 좋았습니다.",
      feedbackPoints: [
        { label: "빈도", text: "how often, usually, regularly 같은 표현을 함께 쓰면 좋습니다." },
        { label: "이유", text: "왜 그 운동을 좋아하는지 한 문장을 더 붙여보세요." },
      ],
    },
    {
      question: "Exercise Routine",
      yourAnswer: "운동 루틴을 순서대로 말하려는 시도가 보였습니다.",
      feedbackPoints: [
        { label: "흐름", text: "warm up, main workout, cool down 순으로 정리하면 안정적입니다." },
        { label: "길이", text: "각 단계마다 1문장씩만 더해도 충분히 풍성해집니다." },
      ],
    },
    {
      question: "Fitness Goal",
      yourAnswer: "운동 목표 달성 경험을 연결한 점이 좋았습니다.",
      feedbackPoints: [
        { label: "성과", text: "목표, 과정, 결과를 분리해서 말하면 더 설득력 있습니다." },
        { label: "마무리", text: "그 경험이 현재 운동 습관에 어떤 영향을 줬는지 덧붙여보세요." },
      ],
    },
    {
      question: "Gym Membership",
      yourAnswer: "롤플레이에서 회원권 문의 흐름을 따라갔습니다.",
      feedbackPoints: [
        { label: "질문", text: "가격, 기간, 혜택처럼 구체 질문을 2개 이상 던지면 좋습니다." },
        { label: "응대", text: "상대 답변을 들은 뒤 재확인하는 문장을 넣어보세요." },
      ],
    },
    {
      question: "Membership Problem",
      yourAnswer: "문제 상황을 설명하는 방향은 적절했습니다.",
      feedbackPoints: [
        { label: "상황", text: "문제 발생 시점과 원하는 해결 방식을 함께 말하면 명확해집니다." },
        { label: "톤", text: "정중한 표현을 유지하면 롤플레이 완성도가 올라갑니다." },
      ],
    },
    {
      question: "Alternative Solution",
      yourAnswer: "대안 제시 질문에 답하려는 흐름이 자연스러웠습니다.",
      feedbackPoints: [
        { label: "제안", text: "another option, alternative, maybe we can 같은 표현을 활용해보세요." },
        { label: "이유", text: "왜 그 대안이 좋은지 한 문장 더 덧붙이면 좋습니다." },
      ],
    },
    {
      question: "Recent Challenge",
      yourAnswer: "최근 어려움과 극복 과정을 설명하는 구조가 괜찮았습니다.",
      feedbackPoints: [
        { label: "구성", text: "문제-행동-결과 순서로 정리하면 듣는 사람이 이해하기 쉽습니다." },
        { label: "감정", text: "그때 느낀 감정을 한 단어 더 붙이면 답변이 살아납니다." },
      ],
    },
    {
      question: "Future Plans",
      yourAnswer: "앞으로의 계획을 말하는 마무리 질문도 잘 따라왔습니다.",
      feedbackPoints: [
        { label: "계획", text: "next year, in the future, over the next few years 같은 표현을 써보세요." },
        { label: "마무리", text: "학업, 일, 취미 중 2가지만 말해도 충분히 안정적입니다." },
      ],
    },
  ],
};

type MockTestResultState = {
  questionCount?: number;
  transcripts?: string[];
};

export function MockTestResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const { questionCount = mockFeedback.detailedFeedback.length, transcripts = [] } =
    (location.state as MockTestResultState) ?? {};

  const detailedFeedback = mockFeedback.detailedFeedback.slice(0, questionCount).map((item, index) => ({
    ...item,
    yourAnswer: transcripts[index]?.trim() || item.yourAnswer,
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-yellow-400">
            <CheckCircle2 className="h-10 w-10 text-gray-900" />
          </div>
          <h1 className="mb-2 text-4xl font-bold text-gray-900">모의고사 완료!</h1>
          <p className="text-gray-600">전체 응답 흐름과 개선 포인트를 확인해보세요.</p>
        </motion.div>

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full bg-white p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                주요 강점
              </h3>
              <ul className="space-y-3">
                {mockFeedback.strengths.map((item, index) => (
                  <li key={index} className="flex gap-2 text-sm text-gray-700">
                    <span className="font-bold text-green-500">✓</span>
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
            <Card className="h-full bg-white p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                개선 포인트
              </h3>
              <ul className="space-y-3">
                {mockFeedback.improvements.map((item, index) => (
                  <li key={index} className="flex gap-2 text-sm text-gray-700">
                    <span className="font-bold text-orange-500">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h3 className="mb-4 text-xl font-semibold text-gray-900">문항별 코멘트</h3>
          <div className="space-y-4">
            {detailedFeedback.map((item, index) => (
              <Card key={index} className="bg-white p-6">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <h4 className="font-semibold text-gray-900">Q{index + 1}. {item.question}</h4>
                </div>

                <div className="mb-4 rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-800">{item.yourAnswer}</p>
                </div>

                <div className="space-y-3 rounded-lg bg-yellow-50 p-4">
                  <p className="text-sm font-semibold text-gray-700">개선 제안</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {item.feedbackPoints.map((point, pointIndex) => (
                      <div key={pointIndex} className="rounded-xl border border-yellow-100 bg-white p-3">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-yellow-700">
                          {point.label}
                        </p>
                        <p className="text-sm text-gray-800">{point.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid gap-4 md:grid-cols-3"
        >
          <Button variant="outline" onClick={() => navigate("/mocktest/setup")} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            다시 모의고사
          </Button>
          <Button variant="outline" onClick={() => navigate("/resources")} className="gap-2">
            <BookOpen className="h-4 w-4" />
            학습 자료 보기
          </Button>
          <Button onClick={() => navigate("/main")} className="gap-2 bg-yellow-400 text-gray-900 hover:bg-yellow-500">
            <Home className="h-4 w-4" />
            홈으로
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
