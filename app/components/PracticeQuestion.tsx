import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Mic, Square, FileText, Lightbulb, Bookmark, Volume2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";

const questions = [
  {
    id: 1,
    text: "Tell me about your favorite cafe. What makes it special to you?",
    hint: "location, atmosphere, menu, why you like it",
  },
  {
    id: 2,
    text: "Describe a memorable travel experience you had recently.",
    hint: "destination, activities, people, feelings",
  },
  {
    id: 3,
    text: "What kind of exercise do you enjoy doing and why?",
    hint: "type of exercise, frequency, benefits, enjoyment",
  },
];

export function PracticeQuestion() {
  const recordingLimit = 120;
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(recordingLimit);
  const [isRecording, setIsRecording] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [transcript, setTranscript] = useState("");

  const location = useLocation();
  const {
    difficultyLabel = "",
    selectedTypeLabel = "",
    selectedTopicLabels = [] as string[],
  } =
    (location.state as {
      difficultyLabel?: string;
      selectedTypeLabel?: string;
      selectedTopicLabels?: string[];
    }) ?? {};

  useEffect(() => {
    if (!isRecording) {
      return;
    }

    const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [isRecording, timeLeft]);

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

  const recordingProgress = Math.min(
    ((recordingLimit - Math.max(timeLeft, 0)) / recordingLimit) * 100,
    100
  );
  const isOvertime = timeLeft < 0;

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setTimeLeft(recordingLimit);
      setIsRecording(false);
      setShowQuestion(false);
      setShowHint(false);
      setTranscript("");
    } else {
      navigate("/practice/result");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/practice/setup")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-600">
              Question {currentQuestion + 1} / {questions.length}
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          {(difficultyLabel || selectedTypeLabel || selectedTopicLabels.length > 0) && (
            <div className="mb-4 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  {difficultyLabel && (
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800">
                      Difficulty {difficultyLabel}
                    </span>
                  )}
                  {selectedTypeLabel && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                      Type: {selectedTypeLabel}
                    </span>
                  )}
                </div>
                {selectedTopicLabels.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTopicLabels.map((label) => (
                      <span
                        key={label}
                        className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

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
                <span className="text-4xl">AI</span>
              </motion.div>
            </div>

            {showQuestion ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <p className="text-center text-xl font-medium text-gray-900">
                  {questions[currentQuestion].text}
                </p>
              </motion.div>
            ) : (
              <div className="mb-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowQuestion(true)}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Show Question
                </Button>
              </div>
            )}

            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => alert("Audio playback will be added later.")}
                className="gap-2"
              >
                <Volume2 className="h-4 w-4" />
                Play Question
              </Button>
            </div>
          </Card>
        </motion.div>

        <Card className="mb-6 bg-white p-6">
          <div className="mb-4 flex justify-center gap-4">
            {!isRecording ? (
              <Button
                size="lg"
                onClick={() => setIsRecording(true)}
                className="gap-2 bg-red-500 text-white hover:bg-red-600"
              >
                <Mic className="h-5 w-5" />
                Start Recording
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => setIsRecording(false)}
                variant="outline"
                className="gap-2 border-red-500 text-red-500"
              >
                <Square className="h-5 w-5" />
                Stop Recording
              </Button>
            )}
          </div>

          <div className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
            <div className="mb-2 flex items-center justify-between gap-4 text-sm text-gray-700">
              <span className="font-medium text-gray-600">Recording Time</span>
              <span
                className={`font-semibold ${
                  isOvertime || timeLeft < 30 ? "text-red-500" : "text-gray-900"
                }`}
              >
                {formatRecordingTime(timeLeft)}
              </span>
            </div>
            <Progress value={recordingProgress} className="h-2" />
            <p className={`mt-2 text-xs ${isOvertime ? "text-red-500" : "text-gray-500"}`}>
              {isOvertime
                ? `Over time ${formatRecordingTime(timeLeft)}`
                : `${formatTime(timeLeft)} left out of 2:00`}
            </p>
          </div>

          <div className="min-h-32 rounded-lg bg-gray-50 p-4">
            <p className="mb-2 text-sm text-gray-500">Transcript</p>
            <p className="text-gray-700">
              {transcript || "Your transcript will appear here after you start recording."}
            </p>
          </div>
        </Card>

        <div className="mb-6 grid grid-cols-3 gap-4">
          <Button
            variant="outline"
            onClick={() => setShowHint(!showHint)}
            className="gap-2"
          >
            <Lightbulb className="h-4 w-4" />
            Hint
          </Button>
          <Button variant="outline" className="gap-2">
            <Bookmark className="h-4 w-4" />
            Save Question
          </Button>
          <Button
            onClick={handleNext}
            className="bg-yellow-400 text-gray-900 hover:bg-yellow-500"
          >
            {currentQuestion < questions.length - 1 ? "Next Question" : "See Result"}
          </Button>
        </div>

        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-yellow-200 bg-yellow-50 p-4">
              <p className="mb-2 text-sm font-semibold text-gray-900">Answer Hint</p>
              <p className="text-sm text-gray-700">{questions[currentQuestion].hint}</p>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
