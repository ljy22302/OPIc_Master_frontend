import { useState, type Dispatch, type SetStateAction } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

const difficulties = [
  { value: "3-4", label: "Level 3-4", description: "초급~중급" },
  { value: "5-6", label: "Level 5-6", description: "중급~고급" },
];

const currentStatuses = [
  { value: "company", label: "회사" },
  { value: "remote", label: "재택근무" },
  { value: "teacher", label: "교사" },
  { value: "unemployed", label: "무직" },
];

const studentStatuses = [
  { value: "student", label: "학생" },
  { value: "graduated", label: "졸업 후 5년 지남" },
];

const livingSituations = [
  { value: "alone", label: "혼자" },
  { value: "family", label: "가족과 함께" },
  { value: "dorm", label: "기숙사" },
  { value: "friends", label: "친구와 함께" },
  { value: "military", label: "군대" },
];

const leisureActivities = [
  "영화",
  "클럽",
  "공연",
  "콘서트",
  "음악",
  "박물관",
  "공원",
  "캠핑",
  "해변",
  "스포츠",
  "주거",
  "요리",
  "게임",
  "SNS",
  "술",
  "친구 연락",
  "당구",
  "봉사",
  "드라이브",
  "시험 대비",
  "뉴스",
  "카페",
  "체스",
  "TV",
  "쇼핑",
  "구직 활동",
  "리얼리티쇼",
];

const hobbyInterests = [
  "음악",
  "악기",
  "노래",
  "춤추기",
  "그림",
  "여행",
  "사진",
  "주식",
  "신문",
  "독서",
  "요리",
  "애완동물",
];

const exerciseActivities = [
  "농구",
  "야구",
  "축구",
  "미식축구",
  "하키",
  "크리켓",
  "골프",
  "배구",
  "테니스",
  "배드민턴",
  "탁구",
  "태권도",
  "수영",
  "자전거",
  "스키/스노우보드",
  "아이스스케이트",
  "조깅",
  "걷기",
  "요가",
  "하이킹",
  "낚시",
  "헬스",
  "운동수업 수강",
  "안함",
];

const travelExperiences = [
  "국내출장",
  "해외출장",
  "집",
  "국내여행",
  "해외여행",
];

export function MockTestSetup() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [studentStatus, setStudentStatus] = useState("");
  const [livingSituation, setLivingSituation] = useState("");
  const [selectedLeisure, setSelectedLeisure] = useState<string[]>([]);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [selectedTravel, setSelectedTravel] = useState<string[]>([]);

  const toggleMulti = (
    value: string,
    selected: string[],
    setSelected: Dispatch<SetStateAction<string[]>>
  ) => {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const canStart =
    difficulty &&
    currentStatus &&
    studentStatus &&
    livingSituation &&
    selectedLeisure.length >= 2 &&
    selectedHobbies.length > 0 &&
    selectedExercises.length > 0 &&
    selectedTravel.length > 0;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
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
            <h1 className="text-3xl font-bold text-gray-900">모의고사 모드 설정</h1>
            <p className="text-gray-600">실전과 동일한 15문제 테스트</p>
          </div>
        </div>

        {/* Info Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-gray-900 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-1">모의고사 구성</p>
                <ul className="space-y-1">
                  <li>• 총 15문제 (약 40분 소요)</li>
                  <li>• 자기소개 1문제 + 선택주제 9문제 + 롤플레잉 3문제 + 랜덤 2문제</li>
                  <li>• 문제당 2분 답변 시간 제공</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Difficulty Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            1. 난이도 선택
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {difficulties.map((diff) => (
              <Card
                key={diff.value}
                className={`p-6 cursor-pointer transition-all duration-300 bg-white ${
                  difficulty === diff.value
                    ? "border-2 border-yellow-400 shadow-lg"
                    : "border-2 border-transparent hover:border-gray-300"
                }`}
                onClick={() => setDifficulty(diff.value)}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {diff.label}
                </h3>
                <p className="text-gray-600">{diff.description}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Survey Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            2. 정보 입력
          </h2>
          <h5 className="text-xl font-semibold text-sky-500 mb-4">선택하지 않은 선지에 대해서는 높은 확률로 출제되지 않아요! 대답하기 어려운 선지를 피해주세요</h5>

          <Card className="p-6 bg-white mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">현재 상태</h3>
            <div className="grid md:grid-cols-4 gap-3">
              {currentStatuses.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setCurrentStatus(item.value)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    currentStatus === item.value
                      ? "border-yellow-400 bg-yellow-50 shadow"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <p className="font-semibold text-gray-900">{item.label}</p>
                </button>
              ))}
            </div>
            <h6 className="text-sm text-gray-500 mb-4">추천 선택지 : 무직</h6>
          </Card>

          <Card className="p-6 bg-white mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">학생 여부</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {studentStatuses.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setStudentStatus(item.value)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    studentStatus === item.value
                      ? "border-yellow-400 bg-yellow-50 shadow"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <p className="font-semibold text-gray-900">{item.label}</p>
                </button>
              ))}
            </div>
            <h6 className="text-sm text-gray-500 mb-4">추천 선택지 : 졸업 후 5년이 지난 경우</h6>
          </Card>

          <Card className="p-6 bg-white mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">거주 형태</h3>
            <div className="grid md:grid-cols-3 gap-3">
              {livingSituations.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setLivingSituation(item.value)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    livingSituation === item.value
                      ? "border-yellow-400 bg-yellow-50 shadow"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <p className="font-semibold text-gray-900">{item.label}</p>
                </button>
              ))}
            </div>
            <h6 className="text-sm text-gray-500 mb-4">추천 선택지 : 혼자 </h6>
          </Card>

          <Card className="p-6 bg-white mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">여가 활동</h3>
                <p className="text-sm text-gray-500">2개 이상 선택해주세요</p>
              </div>
              <span className={`text-sm font-semibold ${selectedLeisure.length >= 2 ? "text-green-600" : "text-gray-500"}`}>
                {selectedLeisure.length} 선택
              </span>
            </div>
            <div className="grid md:grid-cols-4 gap-3">
              {leisureActivities.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleMulti(item, selectedLeisure, setSelectedLeisure)}
                  className={`rounded-2xl border p-3 text-left transition ${
                    selectedLeisure.includes(item)
                      ? "border-yellow-400 bg-yellow-50 shadow"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <p className="text-sm text-gray-900">{item}</p>
                </button>
              ))}
            </div>
            <h6 className="text-sm text-gray-500 mb-4">관심 있지만, 관련된 부분으로 선택을 추천 ex. 음악, 콘서트/공원, 캠핑 등  </h6>
          </Card>

          <h5 className="text-xl font-semibold text-sky-500 mb-4">선택한 선지에 대해서는 높은 확률로 출제되어요! 대답할 수 있는 주제로 신중하게 선택해주세요</h5>
          <Card className="p-6 bg-white mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">취미 관심사</h3>
                <p className="text-sm text-gray-500">1개 이상 선택해주세요</p>
              </div>
              <span className={`text-sm font-semibold ${selectedHobbies.length > 0 ? "text-green-600" : "text-gray-500"}`}>
                {selectedHobbies.length} 선택
              </span>
            </div>
            <div className="grid md:grid-cols-4 gap-3">
              {hobbyInterests.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleMulti(item, selectedHobbies, setSelectedHobbies)}
                  className={`rounded-2xl border p-3 text-left transition ${
                    selectedHobbies.includes(item)
                      ? "border-yellow-400 bg-yellow-50 shadow"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <p className="text-sm text-gray-900">{item}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-white mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">운동</h3>
                <p className="text-sm text-gray-500">1개 이상 선택해주세요</p>
              </div>
              <span className={`text-sm font-semibold ${selectedExercises.length > 0 ? "text-green-600" : "text-gray-500"}`}>
                {selectedExercises.length} 선택
              </span>
            </div>
            <div className="grid md:grid-cols-4 gap-3">
              {exerciseActivities.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleMulti(item, selectedExercises, setSelectedExercises)}
                  className={`rounded-2xl border p-3 text-left transition ${
                    selectedExercises.includes(item)
                      ? "border-yellow-400 bg-yellow-50 shadow"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <p className="text-sm text-gray-900">{item}</p>
                </button>
              ))}
            </div>
            <h6 className="text-sm text-gray-500 mb-4">추천 선택지 : 조깅, 걷기, 운동안함 추천 </h6>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">휴가 / 출장 경험</h3>
                <p className="text-sm text-gray-500">1개 이상 선택해주세요</p>
              </div>
              <span className={`text-sm font-semibold ${selectedTravel.length > 0 ? "text-green-600" : "text-gray-500"}`}>
                {selectedTravel.length} 선택
              </span>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              {travelExperiences.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleMulti(item, selectedTravel, setSelectedTravel)}
                  className={`rounded-2xl border p-3 text-left transition ${
                    selectedTravel.includes(item)
                      ? "border-yellow-400 bg-yellow-50 shadow"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <p className="text-sm text-gray-900">{item}</p>
                </button>
              ))}
            </div>
            <h6 className="text-sm text-gray-500 mb-4"> 본인이 잘 답변할 수 있는 내용으로 추천 </h6>
          </Card>
        </motion.div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            size="lg"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900"
            onClick={() => {
              navigate("/mocktest/question", {
                state: {
                  difficulty,
                  currentStatus,
                  studentStatus,
                  livingSituation,
                  selectedLeisure,
                  selectedHobbies,
                  selectedExercises,
                  selectedTravel,
                },
              });
            }}
            disabled={!canStart}
          >
            모의고사 시작하기
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          {!canStart && (
            <p className="text-center text-sm text-gray-500 mt-3">
              난이도와 모든 설문 항목을 선택한 후 모의고사를 시작할 수 있습니다.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}