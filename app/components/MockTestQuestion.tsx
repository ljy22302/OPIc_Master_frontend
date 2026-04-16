import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import { AlertCircle, ArrowLeft, Mic, Square, Volume2 } from "lucide-react";
import { useSpeechToTextRecorder } from "../hooks/useSpeechToTextRecorder";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";

const mockQuestions = [
  { id: 1, type: "자기소개", text: "Let's start the interview now. Tell me about yourself." },
  { id: 2, type: "주제", text: "Tell me about your favorite cafe and why you like going there." },
  { id: 3, type: "주제", text: "Describe the atmosphere and interior of that cafe in detail." },
  { id: 4, type: "주제", text: "Tell me about a memorable experience you had at a cafe." },
  { id: 5, type: "주제", text: "Tell me about a recent trip you took. Where did you go?" },
  { id: 6, type: "주제", text: "What activities did you do during your trip?" },
  { id: 7, type: "주제", text: "Compare traveling now to traveling in the past." },
  { id: 8, type: "주제", text: "What kind of exercise do you do regularly?" },
  { id: 9, type: "주제", text: "Describe your exercise routine in detail." },
  { id: 10, type: "주제", text: "Tell me about a time when you achieved a fitness goal." },
  { id: 11, type: "롤플레이", text: "Your friend wants to join your gym. Call the gym and ask about membership options." },
  { id: 12, type: "롤플레이", text: "There's a problem with your membership. Call and explain the issue." },
  { id: 13, type: "롤플레이", text: "Suggest an alternative solution for the membership problem." },
  { id: 14, type: "랜덤", text: "Describe a challenge you faced recently and how you overcame it." },
  { id: 15, type: "랜덤", text: "What are your plans for the next few years?" },
];

export function MockTestQuestion() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    difficulty = "",
    currentStatus = "",
    studentStatus = "",
    livingSituation = "",
    selectedLeisure = [],
    selectedHobbies = [],
    selectedExercises = [],
    selectedTravel = [],
  } = (location.state as {
    difficulty?: string;
    currentStatus?: string;
    studentStatus?: string;
    livingSituation?: string;
    selectedLeisure?: string[];
    selectedHobbies?: string[];
    selectedExercises?: string[];
    selectedTravel?: string[];
  }) ?? {};

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questionTime, setQuestionTime] = useState(120);
  const [totalTime, setTotalTime] = useState(2400);
  const [recordingTime, setRecordingTime] = useState(120);

  const {
    error,
    isRecording,
    isUploading,
    resetTranscript,
    startRecording,
    stopRecording,
    transcript,
  } = useSpeechToTextRecorder({
    questionId: `mock-test-${mockQuestions[currentQuestion].id}`,
    language: "en",
  });

  useEffect(() => {
    if (!isRecording) {
      return;
    }

    if (recordingTime > 0) {
      const timer = setTimeout(() => setRecordingTime(recordingTime - 1), 1000);
      return () => clearTimeout(timer);
    }

    stopRecording();
  }, [isRecording, recordingTime, stopRecording]);

  useEffect(() => {
    if (questionTime > 0) {
      const timer = setTimeout(() => setQuestionTime(questionTime - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [questionTime]);

  useEffect(() => {
    if (totalTime > 0) {
      const timer = setTimeout(() => setTotalTime(totalTime - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [totalTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const totalProgress = ((currentQuestion + 1) / mockQuestions.length) * 100;

  const handleNext = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setQuestionTime(120);
      setRecordingTime(120);
      resetTranscript();
      stopRecording(true);
    } else {
      navigate("/mocktest/result");
    }
  };

  const currentQ = mockQuestions[currentQuestion];

  const difficultyLabel = difficulty === "3-4" ? "Level 3-4" : "Level 5-6";
  const statusLabel = {
    company: "회사원",
    remote: "재택근무",
    teacher: "교사",
    unemployed: "무직",
  }[currentStatus] || "";
  const studentLabel = {
    student: "학생",
    graduated: "졸업 후 5년 이내",
  }[studentStatus] || "";
  const livingSituationLabel = {
    alone: "혼자 거주",
    family: "가족과 함께",
    dorm: "기숙사",
    friends: "친구와 함께",
    military: "군대",
  }[livingSituation] || "";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (window.confirm("모의고사를 중단하시겠습니까? 진행 내용은 저장되지 않습니다.")) {
                  navigate("/mocktest/setup");
                }
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs text-gray-500">문제</p>
                <p className="text-sm font-bold text-gray-900">
                  {currentQuestion + 1} / {mockQuestions.length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">전체 시간</p>
                <p className="text-sm font-bold text-gray-900">{formatTime(totalTime)}</p>
              </div>
            </div>
          </div>
          <Progress value={totalProgress} className="h-2" />
        </div>

        {(difficultyLabel ||
          statusLabel ||
          studentLabel ||
          livingSituationLabel ||
          selectedLeisure.length > 0 ||
          selectedHobbies.length > 0 ||
          selectedExercises.length > 0 ||
          selectedTravel.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap gap-2">
              {difficultyLabel && (
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800">
                  {difficultyLabel}
                </span>
              )}
              {statusLabel && (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700">
                  현재: {statusLabel}
                </span>
              )}
              {studentLabel && (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700">
                  학생: {studentLabel}
                </span>
              )}
              {livingSituationLabel && (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700">
                  거주: {livingSituationLabel}
                </span>
              )}
              {selectedLeisure.length > 0 && (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-blue-50 px-3 py-1 text-sm text-blue-700">
                  여가: {selectedLeisure.join(", ")}
                </span>
              )}
              {selectedHobbies.length > 0 && (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-blue-50 px-3 py-1 text-sm text-blue-700">
                  취미: {selectedHobbies.join(", ")}
                </span>
              )}
              {selectedExercises.length > 0 && (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-blue-50 px-3 py-1 text-sm text-blue-700">
                  운동: {selectedExercises.join(", ")}
                </span>
              )}
              {selectedTravel.length > 0 && (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-blue-50 px-3 py-1 text-sm text-blue-700">
                  여행: {selectedTravel.join(", ")}
                </span>
              )}
            </div>
          </motion.div>
        )}

        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <span
            className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${
              currentQ.type === "자기소개"
                ? "bg-yellow-100 text-gray-900"
                : currentQ.type === "롤플레이"
                  ? "bg-gray-200 text-gray-900"
                  : currentQ.type === "랜덤"
                    ? "bg-gray-300 text-gray-900"
                    : "bg-yellow-200 text-gray-900"
            }`}
          >
            {currentQ.type}
          </span>
        </motion.div>

        <motion.div
          key={`question-${currentQuestion}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <Card className="border-2 border-yellow-200 bg-yellow-50 p-8">
            <div className="mb-6 flex justify-center">
              <motion.div
                animate={{
                  scale: isRecording ? [1, 1.05, 1] : 1,
                }}
                transition={{
                  duration: 1,
                  repeat: isRecording ? Infinity : 0,
                }}
                className="flex h-24 w-24 items-center justify-center rounded-full bg-yellow-400 shadow-xl"
              >
                <span className="text-4xl">🙂</span>
              </motion.div>
            </div>

            <div className="mb-4">
              <p className="text-center text-xl font-medium text-gray-900">
                {currentQ.text}
              </p>
            </div>

            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => alert("음성 재생 기능은 추후 구현 예정입니다.")}
                className="gap-2"
              >
                <Volume2 className="h-4 w-4" />
                질문 듣기
              </Button>
            </div>
          </Card>
        </motion.div>

        <Card className="mb-6 bg-white p-6">
          <div className="mb-4 flex justify-center gap-4">
            {!isRecording ? (
              <Button
                size="lg"
                onClick={startRecording}
                disabled={isUploading}
                className="gap-2 bg-red-500 text-white hover:bg-red-600"
              >
                <Mic className="h-5 w-5" />
                녹음 시작
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => stopRecording()}
                variant="outline"
                className="gap-2 border-red-500 text-red-500"
              >
                <Square className="h-5 w-5" />
                녹음 종료
              </Button>
            )}
          </div>

          {isUploading && (
            <p className="mb-4 text-center text-sm text-gray-500">
              음성을 STT 서버로 전송하고 있습니다...
            </p>
          )}

          {error && (
            <p className="mb-4 text-center text-sm text-red-500">
              {error}
            </p>
          )}

          <div className="mb-4 flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            <span className="font-medium text-gray-600">녹음 시간</span>
            <span className={`font-semibold ${recordingTime < 30 ? "text-red-500" : "text-gray-900"}`}>
              {formatTime(recordingTime)}
            </span>
          </div>

          <div className="min-h-32 rounded-lg bg-gray-50 p-4">
            <p className="mb-2 text-sm text-gray-500">음성 텍스트 변환 결과</p>
            <p className="text-gray-700">
              {transcript || "녹음을 시작하면 여기에 텍스트가 표시됩니다..."}
            </p>
          </div>
        </Card>

        {currentQ.type !== "롤플레이" && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-900" />
              <p className="text-sm text-gray-700">
                모의고사에서는 힌트와 문제 저장 기능이 제공되지 않습니다.
              </p>
            </div>
          </Card>
        )}

        <Button
          size="lg"
          onClick={handleNext}
          className="w-full bg-yellow-400 text-gray-900 hover:bg-yellow-500"
        >
          {currentQuestion < mockQuestions.length - 1 ? "다음 문제" : "시험 완료"}
        </Button>
      </div>
    </div>
  );
}
