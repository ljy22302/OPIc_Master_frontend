import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { BookOpen, ClipboardList, FolderOpen, BarChart3, HelpCircle, Mic2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

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
  const [helpOpen, setHelpOpen] = useState(false);

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
            onClick={() => setHelpOpen(true)}
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="max-w-lg border-2 border-yellow-200 bg-white">
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              안내사항
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              앱 사용 방법을 간단히 확인해보세요.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm text-gray-700">
            <div className="rounded-lg bg-yellow-50 p-4">
              <p className="font-semibold text-gray-900">1. 연습 모드</p>
              <p className="mt-1">주제별로 맞춤 문제를 연습할 수 있습니다.</p>
            </div>
            <div className="rounded-lg bg-yellow-50 p-4">
              <p className="font-semibold text-gray-900">2. 모의고사 모드</p>
              <p className="mt-1">실전처럼 15개 문제를 풀어볼 수 있습니다.</p>
            </div>
            <div className="rounded-lg bg-yellow-50 p-4">
              <p className="font-semibold text-gray-900">3. 추가 자료</p>
              <p className="mt-1">필수 표현과 유용한 문장을 학습합니다.</p>
            </div>
            <div className="rounded-lg bg-yellow-50 p-4">
              <p className="font-semibold text-gray-900">4. 기록 확인</p>
              <p className="mt-1">학습 기록과 통계를 확인할 수 있습니다.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
