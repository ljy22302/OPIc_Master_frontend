import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, ArrowUp, TrendingUp, Calendar, Award, Target, Clock, BarChart3 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";

const statistics = {
  totalPractices: 24,
  totalMockTests: 5,
  totalTime: "12시간 35분",
  currentStreak: 7,
  targetGrade: "AL (Advanced Low)",
  bestGrade: "IH (Intermediate High)",
  averageGrade: "IM3 (Intermediate Mid)",
  improvement: "+15%",
  gradePrediction: "평소와 같이 시험 본다면 IH가 나올 확률이 40%입니다.",
};

const recentHistory = [
  {
    id: 1,
    type: "모의고사",
    date: "2026-04-10",
    grade: "AL",
    score: 82,
    time: "38분",
  },
  {
    id: 2,
    type: "연습",
    date: "2026-04-09",
    grade: "IH",
    score: 75,
    time: "12분",
  },
  {
    id: 3,
    type: "연습",
    date: "2026-04-08",
    grade: "IH",
    score: 72,
    time: "15분",
  },
  {
    id: 4,
    type: "모의고사",
    date: "2026-04-07",
    grade: "IM",
    score: 68,
    time: "40분",
  },
  {
    id: 5,
    type: "연습",
    date: "2026-04-06",
    grade: "IM",
    score: 65,
    time: "10분",
  },
];

const skillProgress = [
  { skill: "어휘력", current: 85, target: 90 },
  { skill: "문법", current: 78, target: 85 },
  { skill: "유창성", current: 84, target: 90 },
  { skill: "발음", current: 81, target: 88 },
];

const monthLabels = (monthNumber: number) => `${monthNumber}월`;

const getDaysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

const getMonthStartsOn = (year: number, month: number) => new Date(year, month - 1, 1).getDay();

type CalendarCell = { day: number; count: number } | null;

type MonthlyActivity = {
  totalPractices: number;
  totalMockTests: number;
  totalTime: string;
  weekCounts: number[];
  dayOverrides?: Record<number, number>;
};

const getCountsByDay = (weekCounts: number[], dayCount: number) =>
  Array.from({ length: dayCount }, (_, index) =>
    (() => {
      const weekCount = weekCounts[Math.min(Math.floor(index / 7), weekCounts.length - 1)] ?? 0;
      const dayIndexInWeek = index % 7;
      return dayIndexInWeek < weekCount ? 1 : 0;
    })()
  );

const getMonthlyTotal = (calendar: CalendarCell[]) =>
  calendar.reduce((sum, cell) => sum + (cell?.count ?? 0), 0);

const getCalendarDays = (
  year: number,
  month: number,
  activity: MonthlyActivity
): CalendarCell[] => {
  const today = new Date();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1;
  const days = getDaysInMonth(year, month);
  const offset = getMonthStartsOn(year, month);
  const counts = getCountsByDay(activity.weekCounts, days);

  return Array.from({ length: offset }, () => null as CalendarCell).concat(
    Array.from({ length: days }, (_, index) => {
      const day = index + 1;
      if (isCurrentMonth && day > today.getDate()) {
        return {
          day,
          count: 0,
        } as CalendarCell;
      }
      const overrideCount = monthlyDayOverrides[month]?.[day];
      if (typeof overrideCount === "number") {
        return {
          day,
          count: overrideCount,
        } as CalendarCell;
      }
      return ({
        day,
        count: counts[index],
      } as CalendarCell);
    })
  );
};

const monthlyActivityData: Record<number, { totalPractices: number; totalMockTests: number; totalTime: string; weekCounts: number[] }> = {
  1: { totalPractices: 12, totalMockTests: 2, totalTime: "9시간 20분", weekCounts: [3, 2, 4, 3] },
  2: { totalPractices: 10, totalMockTests: 1, totalTime: "8시간 10분", weekCounts: [2, 3, 3, 2] },
  3: { totalPractices: 14, totalMockTests: 3, totalTime: "11시간 5분", weekCounts: [4, 3, 4, 3] },
  4: { totalPractices: 18, totalMockTests: 4, totalTime: "13시간 40분", weekCounts: [5, 4, 5, 4] },
  5: { totalPractices: 16, totalMockTests: 3, totalTime: "12시간 55분", weekCounts: [4, 4, 4, 4] },
  6: { totalPractices: 15, totalMockTests: 3, totalTime: "12시간 20분", weekCounts: [3, 4, 4, 4] },
  7: { totalPractices: 17, totalMockTests: 3, totalTime: "13시간 15분", weekCounts: [4, 4, 5, 4] },
  8: { totalPractices: 16, totalMockTests: 4, totalTime: "12시간 50분", weekCounts: [4, 4, 4, 4] },
  9: { totalPractices: 14, totalMockTests: 3, totalTime: "11시간 45분", weekCounts: [3, 4, 4, 3] },
  10: { totalPractices: 15, totalMockTests: 3, totalTime: "12시간 10분", weekCounts: [4, 4, 4, 3] },
  11: { totalPractices: 13, totalMockTests: 2, totalTime: "10시간 50분", weekCounts: [3, 3, 4, 3] },
  12: { totalPractices: 14, totalMockTests: 2, totalTime: "11시간 30분", weekCounts: [3, 4, 4, 3] },
};

const monthlyDayOverrides: Record<number, Record<number, number>> = {
  4: { 11: 5, 15: 4 },
};

export function Records() {
  const navigate = useNavigate();
  const now = new Date();
  const [visibleMonthDate, setVisibleMonthDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const visibleMonthNumber = visibleMonthDate.getMonth() + 1;
  const visibleMonthYear = visibleMonthDate.getFullYear();
  const visibleMonthData = monthlyActivityData[visibleMonthNumber];
  const visibleMonthCalendar = getCalendarDays(visibleMonthYear, visibleMonthNumber, visibleMonthData);
  const visibleMonthTotalPractices = getMonthlyTotal(visibleMonthCalendar);
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  const handlePrevMonth = () => {
    setVisibleMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setVisibleMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
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
            <h1 className="text-3xl font-bold text-gray-900">학습 기록</h1>
            <p className="text-gray-600">나의 학습 진행 상황을 확인하세요</p>
          </div>
        </div>

        {/* Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="p-6 bg-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-gray-900" />
              </div>
              <div>
                <p className="text-sm text-gray-600">총 연습</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalPractices}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600">모의고사</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalMockTests}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">연속 학습</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.currentStreak}일</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">총 학습 시간</p>
                <p className="text-lg font-bold text-gray-900">{statistics.totalTime}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Grade Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="p-6 bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              목표 등급
            </h3>
            <p className="text-sm text-gray-600">향후 달성하고 싶은 목표 등급</p>
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <p className="text-4xl font-bold text-gray-900 mb-2">
                {statistics.targetGrade}
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              최고 등급
            </h3>
            <p className="text-sm text-gray-600">지금까지 받은 최고 점수</p>
            <div className="text-center p-6 bg-yellow-50 rounded-lg">
              <p className="text-4xl font-bold text-gray-900 mb-2">
                {statistics.bestGrade}
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              평균 등급
            </h3>
            <p className="text-sm text-gray-600">
                최근 향상도: <span className="font-semibold text-green-600">{statistics.improvement}</span>
            </p>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <p className="text-4xl font-bold text-gray-900 mb-2">
                {statistics.averageGrade}
              </p>
              <p className="text-sm text-gray-600">
                {statistics.gradePrediction}
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Skill Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-6 bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-6">역량별 진행도</h3>
            <div className="space-y-6">
              {skillProgress.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">{item.skill}</span>
                    <span className="text-sm text-gray-600">
                      {item.current} / {item.target}
                    </span>
                  </div>
                  <Progress value={(item.current / item.target) * 100} className="h-3" />
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Monthly Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="p-6 bg-white">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">월간 학습 활동</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                  &lt;
                </Button>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                  {visibleMonthYear} {monthLabels(visibleMonthNumber)}
                </span>
                <Button variant="outline" size="sm" onClick={handleNextMonth}>
                  &gt;
                </Button>
              </div>
            </div>
            <Card className="border border-gray-100 bg-gray-50 p-3 sm:p-4">
              <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4 sm:gap-4">
                <div>
                  <p className="text-lg font-bold text-gray-900 sm:text-xl">
                    {visibleMonthTotalPractices}
                    회 학습
                  </p>
                </div>
                <p className="text-xs text-gray-600 sm:text-sm">{visibleMonthData.totalTime}</p>
              </div>

              <div className="mb-2 grid grid-cols-7 gap-1 text-center sm:mb-3 sm:gap-2">
                {dayNames.map((day) => (
                  <div key={day} className="text-xs font-semibold text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {visibleMonthCalendar.map((cell, cellIndex) => (
                  <div
                    key={cellIndex}
                    className={`min-h-[56px] rounded-xl border p-1.5 text-center text-[10px] sm:min-h-[72px] sm:rounded-2xl sm:p-2 sm:text-xs ${
                      cell === null
                        ? "bg-transparent border-transparent"
                        : cell.count >= 5
                        ? "bg-yellow-300 text-gray-900"
                        : cell.count >= 4
                        ? "bg-yellow-200 text-gray-900"
                        : cell.count >= 2
                        ? "bg-yellow-100 text-gray-900"
                        : cell.count === 1
                        ? "bg-yellow-50 text-gray-700"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    {cell ? (
                      <>
                        <div className="font-semibold">{cell.day}</div>
                        {cell.count > 0 && (
                          <div className="mt-0.5 text-[9px] text-gray-700 sm:mt-1 sm:text-[10px]">
                            {cell.count}회
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="h-full" />
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </Card>
        </motion.div>

        {/* Recent History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">최근 학습 기록</h3>
          <div className="space-y-3">
            {recentHistory.map((item, index) => (
              <Card
                key={item.id}
                className="p-5 hover:shadow-md transition-shadow cursor-pointer bg-white"
                onClick={() => {
                  if (item.type === "모의고사") {
                    navigate("/mocktest/result");
                  } else {
                    navigate("/practice/result");
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        item.type === "모의고사"
                          ? "bg-gray-200 text-gray-900"
                          : "bg-yellow-100 text-gray-900"
                      }`}
                    >
                      {item.type}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.grade} - {item.score}점
                      </p>
                      <p className="text-sm text-gray-500">{item.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">소요 시간</p>
                      <p className="font-semibold text-gray-900">{item.time}</p>
                    </div>
                    <TrendingUp
                      className={`w-5 h-5 ${
                        index === 0 ? "text-green-500" : "text-gray-400"
                      }`}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-4 right-4 z-30 inline-flex items-center gap-2 rounded-full border border-yellow-300 bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-lg transition hover:bg-yellow-50"
        aria-label="맨 위로 이동"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
    </div>
  );
}
