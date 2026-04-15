import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Mic, Square, Volume2, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import ossCharacter from "./OSS_character.png";

const mockQuestions = [
  { id: 1, type: "Self-Intro", text: "Let's start the interview now. Tell me about yourself." },
  { id: 2, type: "Topic", text: "Tell me about your favorite cafe and why you like going there." },
  { id: 3, type: "Topic", text: "Describe the atmosphere and interior of that cafe in detail." },
  { id: 4, type: "Topic", text: "Tell me about a memorable experience you had at a cafe." },
  { id: 5, type: "Topic", text: "Tell me about a recent trip you took. Where did you go?" },
  { id: 6, type: "Topic", text: "What activities did you do during your trip?" },
  { id: 7, type: "Topic", text: "Compare traveling now to traveling in the past." },
  { id: 8, type: "Topic", text: "What kind of exercise do you do regularly?" },
  { id: 9, type: "Topic", text: "Describe your exercise routine in detail." },
  { id: 10, type: "Topic", text: "Tell me about a time when you achieved a fitness goal." },
  { id: 11, type: "Role Play", text: "Your friend wants to join your gym. Call the gym and ask about membership options." },
  { id: 12, type: "Role Play", text: "There's a problem with your membership. Call and explain the issue." },
  { id: 13, type: "Role Play", text: "Suggest an alternative solution for the membership problem." },
  { id: 14, type: "Follow-up", text: "Describe a challenge you faced recently and how you overcame it." },
  { id: 15, type: "Follow-up", text: "What are your plans for the next few years?" },
];

export function MockTestQuestion() {
  const recordingLimit = 120;
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
  const [totalTime, setTotalTime] = useState(2400);
  const [recordingTime, setRecordingTime] = useState(recordingLimit);
  const [transcript, setTranscript] = useState("");
  const [playCount, setPlayCount] = useState(0);
  const [recordingState, setRecordingState] = useState<"idle" | "recording" | "completed">(
    "idle"
  );

  useEffect(() => {
    if (recordingState !== "recording") {
      return;
    }

    const timer = setTimeout(() => setRecordingTime((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [recordingState, recordingTime]);

  useEffect(() => {
    if (totalTime > 0) {
      const timer = setTimeout(() => setTotalTime((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [totalTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatRecordingTime = (seconds: number) => {
    if (seconds >= 0) {
      return formatTime(seconds);
    }

    return `+${formatTime(Math.abs(seconds))}`;
  };

  const totalProgress = ((currentQuestion + 1) / mockQuestions.length) * 100;
  const recordingProgress = Math.min(
    ((recordingLimit - Math.max(recordingTime, 0)) / recordingLimit) * 100,
    100
  );
  const overtimeProgress = Math.min(
    (Math.abs(Math.min(recordingTime, 0)) / recordingLimit) * 100,
    100
  );
  const isOvertime = recordingTime < 0;
  const progressSteps = Array.from({ length: mockQuestions.length }, (_, index) => index + 1);

  const handleNext = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setRecordingTime(recordingLimit);
      setTranscript("");
      setPlayCount(0);
      setRecordingState("idle");
    } else {
      navigate("/mocktest/result");
    }
  };

  const currentQ = mockQuestions[currentQuestion];

  const difficultyLabel = difficulty === "3-4" ? "Level 3-4" : difficulty === "5-6" ? "Level 5-6" : "";
  const statusLabel = {
    company: "Office Worker",
    remote: "Remote Worker",
    teacher: "Teacher",
    unemployed: "Unemployed",
  }[currentStatus] || "";
  const studentLabel = {
    student: "Student",
    graduated: "Graduated",
  }[studentStatus] || "";
  const livingSituationLabel = {
    alone: "Alone",
    family: "With Family",
    dorm: "Dorm",
    friends: "With Friends",
    military: "Military",
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
                if (window.confirm("Leave the mock test? Progress will not be saved.")) {
                  navigate("/mocktest/setup");
                }
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs text-gray-500">Question</p>
                <p className="text-sm font-bold text-gray-900">
                  {currentQuestion + 1} / {mockQuestions.length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Total Time</p>
                <p className="text-sm font-bold text-gray-900">{formatTime(totalTime)}</p>
              </div>
            </div>
          </div>
          <Progress value={totalProgress} className="h-2" />
        </div>

        {(difficultyLabel || statusLabel || studentLabel || livingSituationLabel || selectedLeisure.length > 0 || selectedHobbies.length > 0 || selectedExercises.length > 0 || selectedTravel.length > 0) && (
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
                  Status: {statusLabel}
                </span>
              )}
              {studentLabel && (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700">
                  Student: {studentLabel}
                </span>
              )}
              {livingSituationLabel && (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700">
                  Living: {livingSituationLabel}
                </span>
              )}
              {selectedLeisure.length > 0 && (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-blue-50 px-3 py-1 text-sm text-blue-700">
                  Leisure: {selectedLeisure.join(", ")}
                </span>
              )}
              {selectedHobbies.length > 0 && (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-blue-50 px-3 py-1 text-sm text-blue-700">
                  Hobbies: {selectedHobbies.join(", ")}
                </span>
              )}
              {selectedExercises.length > 0 && (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-blue-50 px-3 py-1 text-sm text-blue-700">
                  Exercise: {selectedExercises.join(", ")}
                </span>
              )}
              {selectedTravel.length > 0 && (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-blue-50 px-3 py-1 text-sm text-blue-700">
                  Travel: {selectedTravel.join(", ")}
                </span>
              )}
            </div>
          </motion.div>
        )}



        <motion.div
          key={`question-${currentQuestion}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <Card className="border-2 border-yellow-200 bg-yellow-50 p-8">
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="flex flex-col items-center">
                <div className="mb-4 w-full max-w-[360px] rounded-[32px] border border-yellow-200 bg-white p-2 shadow-sm">
                  <div className="flex h-[300px] w-full items-center justify-center overflow-hidden rounded-[28px] bg-white">
                    <img
                      src={ossCharacter}
                      alt="Practice question"
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (playCount < 2) {
                      setPlayCount((prev) => prev + 1);
                    }
                  }}
                  disabled={playCount >= 2}
                  className="gap-2 text-gray-700 disabled:opacity-40"
                >
                  <Volume2 className="h-4 w-4" />
                  Play Question
                </Button>
                <p className="mt-1 text-center text-xs text-gray-500">2번 듣기 가능</p>
              </div>

              <div className="flex flex-col justify-center">
                <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4">
                  <span
                  className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${
                  currentQ.type === "Self-Intro"
                  ? "bg-yellow-100 text-gray-900"
                  : currentQ.type === "Role Play"
                  ? "bg-gray-200 text-gray-900"
                  : currentQ.type === "Follow-up"
                  ? "bg-gray-300 text-gray-900"
                  : "bg-yellow-200 text-gray-900"
                }`}
                >
                {currentQ.type}
                </span>
                </motion.div>
                <p className="mb-3 text-sm font-semibold text-gray-700">진행 상태</p>
                <div className="grid grid-cols-5 gap-2 sm:grid-cols-10 lg:grid-cols-10">
                  {progressSteps.map((step) => {
                    const isCurrent = step === currentQuestion + 1;
                    return (
                      <div
                        key={step}
                        className={`flex h-11 items-center justify-center rounded-sm border text-sm font-semibold ${
                          isCurrent
                            ? "border-black bg-black text-white"
                            : "border-gray-200 bg-gray-200 text-white"
                        }`}
                      >
                        {step}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <Card className="mb-6 bg-white p-6">
          <div className="mb-4 flex justify-center gap-4">
            <Button
              size="lg"
              onClick={() => {
                if (recordingState === "idle") {
                  setRecordingState("recording");
                  return;
                }

                if (recordingState === "recording") {
                  setRecordingState("completed");
                }
              }}
              disabled={recordingState === "completed"}
              className="gap-2 bg-red-500 text-white hover:bg-red-600 disabled:opacity-70"
            >
              {recordingState === "recording" ? (
                <Square className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
              {recordingState === "recording" ? "답변 완료" : "Start Recording"}
            </Button>
          </div>

          <div className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
            <div className="mb-2 flex items-center justify-between gap-4 text-sm text-gray-700">
              <span className="font-medium text-gray-600">Recording Time</span>
              <span
                className={`font-semibold ${
                  isOvertime || recordingTime < 30 ? "text-red-500" : "text-gray-900"
                }`}
              >
                {formatRecordingTime(recordingTime)}
              </span>
            </div>
            <div className="relative h-3 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-yellow-400 transition-[width] ease-linear"
                style={{ width: `${recordingProgress}%`, transitionDuration: "1000ms" }}
              />
              {isOvertime && (
                <div
                  className="absolute inset-y-0 left-0 bg-red-500 transition-[width] ease-linear"
                  style={{ width: `${overtimeProgress}%`, transitionDuration: "1000ms" }}
                />
              )}
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-4 min-h-32">
            <p className="mb-2 text-sm text-gray-500">Transcript</p>
            <p className="text-gray-700">
              {transcript || "Your transcript will appear here after you start recording."}
            </p>
          </div>
        </Card>

        {currentQ.type !== "Role Play" && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-900" />
              <p className="text-sm text-gray-700">
                Hints and saved-question features are not available during the mock test.
              </p>
            </div>
          </Card>
        )}

        <Button
          size="lg"
          onClick={handleNext}
          className="w-full bg-yellow-400 text-gray-900 hover:bg-yellow-500"
        >
          {currentQuestion < mockQuestions.length - 1 ? "Next Question" : "Finish Test"}
        </Button>
      </div>
    </div>
  );
}
