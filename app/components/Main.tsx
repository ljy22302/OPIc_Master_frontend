import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { BookOpen, ClipboardList, FolderOpen, HelpCircle, Mic2 } from "lucide-react";
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
    description: "실전처럼 15문제 도전",
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
    title: "저장된 문제",
    description: "연습에서 저장한 문제와 답변",
    icon: FolderOpen,
    path: "/saved",
  },
];

export function Main() {
  const navigate = useNavigate();
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white p-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-400">
              <Mic2 className="h-6 w-6 text-gray-900" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">OSP</h1>
              <p className="text-sm text-gray-500">OPIc Speaking Practice</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setHelpOpen(true)}>
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="max-w-lg border-2 border-yellow-200 bg-white">
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl font-bold text-gray-900">안내사항</DialogTitle>
            <DialogDescription className="text-gray-600">
              각 메뉴의 사용 방법을 간단히 확인해보세요.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm text-gray-700">
            <div className="rounded-lg bg-yellow-50 p-4">
              <p className="font-semibold text-gray-900">1. 연습 모드</p>
              <p className="mt-1">주제별로 맞춤 문제를 연습할 수 있습니다.</p>
            </div>
            <div className="rounded-lg bg-yellow-50 p-4">
              <p className="font-semibold text-gray-900">2. 모의고사 모드</p>
              <p className="mt-1">실전처럼 15문제를 연속으로 풀 수 있습니다.</p>
            </div>
            <div className="rounded-lg bg-yellow-50 p-4">
              <p className="font-semibold text-gray-900">3. 추가 자료</p>
              <p className="mt-1">필수 표현과 단어를 함께 학습할 수 있습니다.</p>
            </div>
            <div className="rounded-lg bg-yellow-50 p-4">
              <p className="font-semibold text-gray-900">4. 저장된 문제</p>
              <p className="mt-1">연습에서 저장한 문제와 답변을 확인할 수 있습니다.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-gray-900">무엇을 시작하시겠어요?</h2>
            <p className="text-lg text-gray-600">
              원하는 모드를 선택해서 OPIc 연습을 시작해보세요.
            </p>
          </motion.div>

          <div className="mb-8 grid gap-6 md:grid-cols-2">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card
                  className="group cursor-pointer border-2 border-gray-200 bg-white p-8 transition-all duration-300 hover:border-yellow-400 hover:shadow-lg"
                  onClick={() => navigate(item.path)}
                >
                  <div className="flex items-start gap-6">
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-yellow-400 transition-transform duration-300 group-hover:scale-110">
                      <item.icon className="h-8 w-8 text-gray-900" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 text-2xl font-bold text-gray-900">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
