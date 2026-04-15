import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type AccountType = "일반" | "학생" | "기업";

const accountTypes: AccountType[] = ["일반", "학생", "기업"];
const hintOptions = [
  "질문을 선택하세요",
  "좋아하는 계절",
  "첫 반려동물 이름",
  "어머니 성함",
  "가장 기억에 남는 장소",
];

function AccountTypePicker({
  value,
  onChange,
}: {
  value: AccountType;
  onChange: (value: AccountType) => void;
}) {
  return (
    <div className="flex flex-wrap gap-4">
      {accountTypes.map((type) => {
        const active = value === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className="flex items-center gap-2 text-sm font-medium text-gray-800 transition-colors"
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                active ? "border-sky-500 bg-sky-500" : "border-gray-300 bg-white"
              }`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-white" : "bg-transparent"}`} />
            </span>
            {type}
          </button>
        );
      })}
    </div>
  );
}

function FindIdCard() {
  const [type, setType] = useState<AccountType>("일반");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState("");

  return (
    <Card className="h-full border-2 border-yellow-200 bg-white p-6 shadow-lg">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
          ?
        </div>
        <h2 className="text-2xl font-bold text-gray-900">아이디 찾기</h2>
      </div>

      <div className="mb-6">
        <AccountTypePicker value={type} onChange={setType} />
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="find-id-name" className="mb-2 block text-sm font-semibold text-sky-800">
            이름
          </Label>
          <Input
            id="find-id-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력해주세요"
          />
        </div>
        <div>
          <Label htmlFor="find-id-email" className="mb-2 block text-sm font-semibold text-sky-800">
            이메일
          </Label>
          <Input
            id="find-id-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일을 입력해주세요"
          />
        </div>
      </div>

      {result && (
        <div className="mt-5 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          {result}
        </div>
      )}

      <div className="mt-6">
        <Button
          type="button"
          className="w-full bg-yellow-400 text-gray-900 hover:bg-yellow-500"
          onClick={() => {
            if (!name || !email) {
              setResult("");
              return;
            }
            setResult(`입력하신 ${type} 계정 정보로 아이디를 찾는 화면입니다.`);
          }}
        >
          아이디 찾기
        </Button>
      </div>
    </Card>
  );
}

function FindPasswordCard() {
  const [type, setType] = useState<AccountType>("일반");
  const [accountId, setAccountId] = useState("");
  const [name, setName] = useState("");
  const [hint, setHint] = useState("");
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState("");

  return (
    <Card className="h-full border-2 border-yellow-200 bg-white p-6 shadow-lg">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
          ?
        </div>
        <h2 className="text-2xl font-bold text-gray-900">비밀번호 찾기</h2>
      </div>

      <div className="mb-6">
        <AccountTypePicker value={type} onChange={setType} />
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="find-pw-id" className="mb-2 block text-sm font-semibold text-sky-800">
            아이디
          </Label>
          <Input
            id="find-pw-id"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            placeholder="아이디를 입력해주세요"
          />
        </div>
        <div>
          <Label htmlFor="find-pw-name" className="mb-2 block text-sm font-semibold text-sky-800">
            이름
          </Label>
          <Input
            id="find-pw-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력해주세요"
          />
        </div>
        <div>
          <Label htmlFor="find-pw-hint" className="mb-2 block text-sm font-semibold text-sky-800">
            본인 확인 질문
          </Label>
          <Select value={hint} onValueChange={setHint}>
            <SelectTrigger id="find-pw-hint" className="bg-white">
              <SelectValue placeholder="질문을 선택해주세요" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {hintOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="find-pw-answer" className="mb-2 block text-sm font-semibold text-sky-800">
            답변
          </Label>
          <Input
            id="find-pw-answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="답변을 입력해주세요"
          />
        </div>
      </div>

      {result && (
        <div className="mt-5 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          {result}
        </div>
      )}

      <div className="mt-6">
        <Button
          type="button"
          className="w-full bg-yellow-400 text-gray-900 hover:bg-yellow-500"
          onClick={() => {
            if (!accountId || !name || !hint || !answer) {
              setResult("");
              return;
            }
            setResult(`입력하신 ${type} 계정 정보로 비밀번호를 찾는 화면입니다.`);
          }}
        >
          비밀번호 찾기
        </Button>
      </div>
    </Card>
  );
}

export function FindAccount() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-white to-gray-50 px-4 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-gray-900">OPIC</h1>
            <p className="mt-3 text-lg text-gray-600">영어 말하기 실력 향상 연습</p>
          </div>

          <div className="mb-6 flex justify-start">
            <Button
              type="button"
              variant="ghost"
              className="px-0 text-gray-600 hover:text-gray-900"
              onClick={() => navigate("/")}
            >
              로그인으로 돌아가기
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <FindIdCard />
            <FindPasswordCard />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
