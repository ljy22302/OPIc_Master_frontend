import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, AlertCircle, HelpCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

const difficulties = [
  { value: "3-4", label: "Level 3-4", description: "~IM3" },
  { value: "5-6", label: "Level 5-6", description: "IM3~AL" },
];

const currentStatuses = [
  { value: "company", label: "회사원" },
  { value: "remote", label: "재택근무" },
  { value: "teacher", label: "교사" },
  { value: "unemployed", label: "무직" },
];

const studentStatuses = [
  { value: "student", label: "학생" },
  { value: "graduated", label: "졸업 후 5년 지남" },
];

const livingSituations = [
  { value: "alone", label: "1인 거주" },
  { value: "family", label: "가족과 함께" },
  { value: "dorm", label: "기숙사" },
  { value: "friends", label: "친구와 함께" },
  { value: "military", label: "군대" },
];

const leisureActivities = [
  "영화",
  "독서",
  "공연",
  "콘서트",
  "노래",
  "방문관람",
  "공원",
  "캠핑",
  "낚시",
  "스포츠",
  "주거",
  "요리",
  "게임",
  "SNS",
  "운동",
  "친구 연락",
  "밴드",
  "동아리",
  "서핑",
  "드라마",
  "카페",
  "체스",
  "TV",
  "쇼핑",
  "관람",
  "여행",
];

const hobbyInterests = [
  "노래",
  "낚시",
  "그림",
  "뜨개질",
  "사진",
  "운동",
  "수집",
  "요리",
  "독서",
  "악기",
  "요가",
  "프라모델",
];

const exerciseActivities = [
  "농구",
  "골프",
  "스노쿨",
  "격투기",
  "야구",
  "배구",
  "스키",
  "요가",
  "축구",
  "배드민턴",
  "아이스스케이트",
  "낚시",
  "미식축구",
  "테니스",
  "인라인스케이트",
  "수상스키",
  "하이킹",
  "럭비",
  "탁구",
  "보트타기",
  "아이스하키",
  "수영",
  "승마",
  "헬스",
  "하키",
  "자전거",
  "조깅",
  "체조",
  "크리켓",
  "오토바이",
  "걷기",
  "운동안함"
];

const travelExperiences = [
  "국내 출장",
  "해외 출장",
  "국내 여행",
  "국내 가족 여행",
  "해외 여행",
];

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-1 rounded-xl bg-white/70 px-1.5 py-1 sm:gap-2 sm:px-3 sm:py-2">
      <span className="hidden min-w-24 text-sm font-semibold text-gray-700 lg:inline">{label}</span>
      <span className="text-sm text-gray-900">{value || "미선택"}</span>
    </div>
  );
}

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
  const [showGuide, setShowGuide] = useState(false);

  const toggleMulti = (
    value: string,
    selected: string[],
    setSelected: Dispatch<SetStateAction<string[]>>
  ) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
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

  const summaryItems = useMemo(
    () => [
      { label: "현재 상태", value: currentStatuses.find((item) => item.value === currentStatus)?.label || "" },
      { label: "학생 여부", value: studentStatuses.find((item) => item.value === studentStatus)?.label || "" },
      { label: "거주 형태", value: livingSituations.find((item) => item.value === livingSituation)?.label || "" },
      { label: "여가 활동", value: selectedLeisure.join(", ") },
      { label: "취미 관심사", value: selectedHobbies.join(", ") },
      { label: "운동", value: selectedExercises.join(", ") },
      { label: "휴가/출장 경험", value: selectedTravel.join(", ") },
    ],
    [currentStatus, livingSituation, selectedExercises, selectedHobbies, selectedLeisure, selectedTravel, studentStatus]
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/main")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">모의고사 모드 설정</h1>
            <p className="text-gray-600">실전과 같은 흐름으로 15문제를 준비해보세요.</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <aside className="sticky top-2 z-20 self-start lg:sticky lg:top-6 lg:self-start">
            <Card className="border-2 border-yellow-200 bg-yellow-50 p-2 shadow-sm lg:p-5">
              <div className="mb-1.5 flex items-center justify-between gap-2 sm:mb-4 sm:gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">선택 정보</h2>
                </div>
                <span className="rounded-full bg-yellow-400 px-3 py-1 text-sm font-semibold text-gray-900">
                  {difficulty ? difficulties.find((item) => item.value === difficulty)?.label : "레벨 선택"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-0.5 lg:grid-cols-1">
                <InfoItem label="현재 상태" value={currentStatuses.find((item) => item.value === currentStatus)?.label || "미선택"} />
                <InfoItem label="학생 여부" value={studentStatuses.find((item) => item.value === studentStatus)?.label || "미선택"} />
                <InfoItem label="거주 형태" value={livingSituations.find((item) => item.value === livingSituation)?.label || "미선택"} />
                <InfoItem label="여가 활동" value={selectedLeisure.length > 0 ? selectedLeisure.join(", ") : "미선택"} />
                <InfoItem label="취미 관심사" value={selectedHobbies.length > 0 ? selectedHobbies.join(", ") : "미선택"} />
                <InfoItem label="운동" value={selectedExercises.length > 0 ? selectedExercises.join(", ") : "미선택"} />
                <InfoItem label="휴가/출장" value={selectedTravel.length > 0 ? selectedTravel.join(", ") : "미선택"} />
              </div>

              <div className="mt-0">
                <Button
                  type="button"
                  variant="outline"
                  className="h-7 w-full justify-center gap-2 border-yellow-300 bg-white text-xs hover:bg-yellow-50"
                  onClick={() => setShowGuide((prev) => !prev)}
                >
                  <HelpCircle className="h-4 w-4" />
                  선택 Tip
                </Button>
              </div>

              {showGuide && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-0 space-y-0.5"
                >
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-2 text-sm text-red-600">
                    <p className="font-semibold text-gray-900">현재 상태, 학생 여부, 거주 형태, 여가 활동</p>
                    <p className="mt-1">
                      선택하지 않은 선지는 높은 확률로 출제되지 않아요.
                      대답하기 어려운 선지는 피해주세요.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-2 text-sm text-yellow-800">
                    <p className="font-semibold text-gray-900">취미 관심사, 운동, 휴가/출장 경험</p>
                    <p className="mt-1">
                      선택한 선지는 높은 확률로 출제되어요.
                      대답할 수 있는 주제로 신중하게 선택해주세요.
                    </p>
                  </div>
                </motion.div>
              )}
            </Card>
          </aside>

          <main>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-900" />
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold text-gray-900">모의고사 구성</p>
                    <ul className="mt-2 space-y-1">
                      <li>총 15문제</li>
                      <li>자기소개 1문제 + 선택 주제 9문제 + 롤플레이 3문제 + 돌발 2문제</li>
                      <li>문제당 2분 답변 + 준비 시간 포함</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <h2 className="mb-4 text-xl font-semibold text-gray-900">1. 레벨 선택</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {difficulties.map((diff) => (
                  <Card
                    key={diff.value}
                    className={`cursor-pointer bg-white p-6 transition-all duration-300 ${
                      difficulty === diff.value
                        ? "border-2 border-yellow-400 shadow-lg"
                        : "border-2 border-transparent hover:border-gray-300"
                    }`}
                    onClick={() => setDifficulty(diff.value)}
                  >
                    <h3 className="mb-1 text-xl font-bold text-gray-900">{diff.label}</h3>
                    <p className="text-gray-600">{diff.description}</p>
                  </Card>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-900">2. 정보 입력</h2>

              <Card className="bg-white p-6">
                <h3 className="mb-3 text-lg font-semibold text-gray-900">현재 상태</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {currentStatuses.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setCurrentStatus(item.value)}
                      className={`rounded-2xl border p-2 text-left transition sm:p-3 ${
                        currentStatus === item.value
                          ? "border-yellow-400 bg-yellow-50 shadow"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <p className="text-xs font-semibold text-gray-900 sm:text-sm">{item.label}</p>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1"> 추천 내용: 무직 </p>
              </Card>

              <Card className="bg-white p-6">
                <h3 className="mb-3 text-lg font-semibold text-gray-900">학생 여부</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
                  {studentStatuses.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setStudentStatus(item.value)}
                      className={`rounded-2xl border p-2 text-left transition sm:p-3 ${
                        studentStatus === item.value
                          ? "border-yellow-400 bg-yellow-50 shadow"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <p className="text-xs font-semibold text-gray-900 sm:text-sm">{item.label}</p>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1"> 추천 내용: 졸업 후 5년 지남 </p>
              </Card>

              <Card className="bg-white p-6">
                <h3 className="mb-3 text-lg font-semibold text-gray-900">거주 형태</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {livingSituations.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setLivingSituation(item.value)}
                      className={`rounded-2xl border p-2 text-left transition sm:p-3 ${
                        livingSituation === item.value
                          ? "border-yellow-400 bg-yellow-50 shadow"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <p className="text-xs font-semibold text-gray-900 sm:text-sm">{item.label}</p>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1"> 추천 내용: 1인 거주 </p>
              </Card>

              <Card className="bg-white p-6">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">여가 활동</h3>
                    <p className="text-sm text-gray-500">2개 이상 선택해주세요</p>
                  </div>
                  <span className={`text-sm font-semibold ${selectedLeisure.length >= 2 ? "text-green-600" : "text-gray-500"}`}>
                    {selectedLeisure.length} 선택
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {leisureActivities.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleMulti(item, selectedLeisure, setSelectedLeisure)}
                      className={`rounded-2xl border p-2 text-left transition sm:p-3 ${
                        selectedLeisure.includes(item)
                          ? "border-yellow-400 bg-yellow-50 shadow"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <p className="text-xs font-medium text-gray-900 sm:text-sm">{item}</p>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1"> 추천 내용: 공연, 노래와 같이 유사한 주제 </p>
              </Card>

              <Card className="bg-white p-6">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">취미 관심사</h3>
                    <p className="text-sm text-gray-500">1개 이상 선택해주세요</p>
                  </div>
                  <span className={`text-sm font-semibold ${selectedHobbies.length > 0 ? "text-green-600" : "text-gray-500"}`}>
                    {selectedHobbies.length} 선택
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {hobbyInterests.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleMulti(item, selectedHobbies, setSelectedHobbies)}
                      className={`rounded-2xl border p-2 text-left transition sm:p-3 ${
                        selectedHobbies.includes(item)
                          ? "border-yellow-400 bg-yellow-50 shadow"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <p className="text-xs font-medium text-gray-900 sm:text-sm">{item}</p>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1"> 추천 내용: 여가활동과 유사한 주제 </p>
              </Card>

              <Card className="bg-white p-6">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">운동</h3>
                    <p className="text-sm text-gray-500">1개 이상 선택해주세요</p>
                  </div>
                  <span className={`text-sm font-semibold ${selectedExercises.length > 0 ? "text-green-600" : "text-gray-500"}`}>
                    {selectedExercises.length} 선택
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {exerciseActivities.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleMulti(item, selectedExercises, setSelectedExercises)}
                      className={`rounded-2xl border p-2 text-left transition sm:p-3 ${
                        selectedExercises.includes(item)
                          ? "border-yellow-400 bg-yellow-50 shadow"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <p className="text-xs font-medium text-gray-900 sm:text-sm">{item}</p>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1"> 추천 내용: 걷기/조깅/ 운동안함 </p>
              </Card>

              <Card className="bg-white p-6">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">휴가 / 출장 경험</h3>
                    <p className="text-sm text-gray-500">1개 이상 선택해주세요</p>
                  </div>
                  <span className={`text-sm font-semibold ${selectedTravel.length > 0 ? "text-green-600" : "text-gray-500"}`}>
                    {selectedTravel.length} 선택
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {travelExperiences.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleMulti(item, selectedTravel, setSelectedTravel)}
                      className={`rounded-2xl border p-2 text-left transition sm:p-3 ${
                        selectedTravel.includes(item)
                          ? "border-yellow-400 bg-yellow-50 shadow"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <p className="text-xs font-medium text-gray-900 sm:text-sm">{item}</p>
                    </button>
                  ))}
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <Button
                size="lg"
                className="w-full bg-yellow-400 text-gray-900 hover:bg-yellow-500"
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
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              {!canStart && (
                <p className="mt-3 text-center text-sm text-gray-500">
                  레벨과 모든 정보 항목을 선택해야 모의고사를 시작할 수 있습니다.
                </p>
              )}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
