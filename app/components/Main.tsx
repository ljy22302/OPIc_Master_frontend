import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { BookOpen, ClipboardList, FolderOpen, BarChart3, HelpCircle, Mic2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

const menuItems = [
  {
    title: "연습 모드",
    description: "주제별 맞춤 연습",
    icon: Mic2,
    path: "/practice/setup",
  },
  {
    title: "모의고사 모드",
    description: "실전 시뮬레이션",
    icon: ClipboardList,
    path: "/mocktest/setup",
  },
  {
    title: "추가 자료",
    description: "필수 문장 & 표현",
    icon: BookOpen,
    path: "/resources",
  },
  {
    title: "기록 확인",
    description: "학습 히스토리",
    icon: BarChart3,
    path: "/records",
  },
];

export function Main() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center">
              <Mic2 className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                OSP
              </h1>
              <p className="text-sm text-gray-500">OPIc Speaking Practice</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => alert("앱 사용 안내:\n\n1. 연습 모드: 주제별로 3개 문제 연습\n2. 모의고사 모드: 15개 문제 실전 테스트\n3. 추가 자료: 필수 표현 학습\n4. 기록 확인: 학습 통계 및 복습")}
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              어떤 학습을 시작하시겠어요?
            </h2>
            <p className="text-lg text-gray-600">
              원하는 모드를 선택하여 OPIc 스피킹 연습을 시작하세요
            </p>
          </motion.div>

          {/* Menu Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card
                  className="p-8 cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-yellow-400 group bg-white"
                  onClick={() => navigate(item.path)}
                >
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-yellow-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <item.icon className="w-8 h-8 text-gray-900" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Saved Questions Quick Access */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card
              className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-yellow-400 bg-yellow-50"
              onClick={() => navigate("/saved")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FolderOpen className="w-6 h-6 text-gray-900" />
                  <div>
                    <h3 className="font-semibold text-gray-900">저장된 문제</h3>
                    <p className="text-sm text-gray-600">복습이 필요한 문제 다시 풀기</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-gray-900">12</span>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}