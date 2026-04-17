import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  PencilLine,
  RotateCcw,
  Volume2,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { practiceQuestions } from "./practiceQuestions";

type PracticeScriptState = {
  questionCount?: number;
  transcripts?: string[];
  selectedType?: string;
  difficultyLabel?: string;
  selectedTypeLabel?: string;
  selectedTopicLabels?: string[];
};

export function PracticeScript() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    questionCount = practiceQuestions.length,
    transcripts = [],
    selectedType = "",
    difficultyLabel = "",
    selectedTypeLabel = "",
    selectedTopicLabels = [],
  } = (location.state as PracticeScriptState) ?? {};

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draftAnswer, setDraftAnswer] = useState("");
  const [editedTranscripts, setEditedTranscripts] = useState<string[]>(
    () => transcripts.slice(0, questionCount)
  );
  const [transitionPhase, setTransitionPhase] = useState<"saving" | "preparing" | null>(null);
  const [transitionMessage, setTransitionMessage] = useState("");

  const visibleQuestions = practiceQuestions.slice(0, questionCount);
  const activeTranscripts = editedTranscripts.length ? editedTranscripts : transcripts;

  const handleReplayAnswer = (answer: string) => {
    const text = answer.trim();
    if (!text || typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setDraftAnswer(activeTranscripts[index] ?? "");
  };

  const saveEdit = (index: number) => {
    const nextTranscripts = [...activeTranscripts];
    nextTranscripts[index] = draftAnswer;
    setEditedTranscripts(nextTranscripts);
    setEditingIndex(null);
    setDraftAnswer("");
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setDraftAnswer("");
  };

  const goResult = () => {
    if (transitionPhase) {
      return;
    }

    const transitionDelay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const runTransition = async () => {
      setTransitionMessage("채점 중입니다...");
      setTransitionPhase("saving");
      await transitionDelay(1000);
      setTransitionPhase("preparing");
      setTransitionMessage("결과를 준비하고 있습니다...");
      await transitionDelay(1000);
      navigate("/practice/result", {
        state: {
          questionCount,
          selectedType,
          transcripts: activeTranscripts,
        },
      });
      setTransitionPhase(null);
      setTransitionMessage("");
    };

    void runTransition();
  };

  const goBackToQuestion = () => {
    navigate("/practice/question", {
      state: {
        currentQuestion: Math.max(questionCount - 1, 0),
        savedTranscripts: activeTranscripts,
        questionCount,
        selectedType,
        difficultyLabel,
        selectedTypeLabel,
        selectedTopicLabels,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={goBackToQuestion}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-sm font-semibold text-gray-600">내 답변 보기</div>
          <div className="w-10" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="border-2 border-yellow-200 bg-yellow-50 p-6 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-yellow-900">Practice Script</p>
                <h1 className="mt-1 text-3xl font-bold text-gray-900">내 답변 보기</h1>
              </div>
              <Button onClick={goResult} className="gap-2 bg-yellow-400 text-gray-900 hover:bg-yellow-500">
                결과 보기
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {visibleQuestions.map((question, index) => {
                const answer = activeTranscripts[index]?.trim() || "";
                const isEditing = editingIndex === index;

                return (
                  <Card key={question.id} className="border border-gray-200 bg-white p-5">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
                        Q{index + 1}. {question.text}
                      </h2>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleReplayAnswer(answer)}
                        disabled={!answer}
                        className="shrink-0 gap-2"
                      >
                        <Volume2 className="h-4 w-4" />
                        내 답변 다시 듣기
                      </Button>
                    </div>

                    <div className="rounded-2xl bg-gray-50 p-4">
                      <p className="mb-2 text-sm font-medium text-gray-600">내 답변</p>

                      {isEditing ? (
                        <div className="space-y-3">
                          <textarea
                            value={draftAnswer}
                            onChange={(event) => setDraftAnswer(event.target.value)}
                            className="min-h-32 w-full rounded-xl border border-gray-200 bg-white p-3 text-sm leading-6 text-gray-800 outline-none focus:border-yellow-400"
                            placeholder="답변 스크립트를 수정해보세요."
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={cancelEdit}
                              className="gap-2"
                            >
                              <X className="h-4 w-4" />
                              취소
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => saveEdit(index)}
                              className="gap-2 bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                            >
                              <Check className="h-4 w-4" />
                              저장하기
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="min-h-24 whitespace-pre-wrap text-sm leading-6 text-gray-800">
                            {answer || "저장된 답변이 없습니다."}
                          </p>

                          <div className="mt-4 flex justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(index)}
                              className="gap-2"
                            >
                              <PencilLine className="h-4 w-4" />
                              수정하기
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2">
          <Button variant="outline" onClick={() => navigate("/practice/setup")} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            처음부터 다시 하기
          </Button>
          <Button onClick={goResult} className="gap-2 bg-yellow-400 text-gray-900 hover:bg-yellow-500">
            결과 페이지로 이동
          </Button>
        </div>
      </div>

      {transitionPhase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-3xl border border-yellow-200 bg-white p-8 shadow-2xl"
          >
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400">
                <div className="h-7 w-7 animate-spin rounded-full border-4 border-white border-t-transparent" />
              </div>
            </div>
            <p className="text-center text-2xl font-bold text-gray-900">{transitionMessage}</p>
            <p className="mt-3 text-center text-sm text-gray-600">잠시만 기다려주세요.</p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
