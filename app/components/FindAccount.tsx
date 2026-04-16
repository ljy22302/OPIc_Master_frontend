import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

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
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState("");

  return (
    <Card className="h-full border-2 border-yellow-200 bg-white p-6 shadow-lg">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
          ?
        </div>
        <h2 className="text-2xl font-bold text-gray-900">아이디 찾기</h2>
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
          <Label htmlFor="find-id-phone" className="mb-2 block text-sm font-semibold text-sky-800">
            전화번호
          </Label>
          <Input
            id="find-id-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="전화번호를 입력해주세요"
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
            if (!name || !phone) {
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
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [sentVerificationCode, setSentVerificationCode] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationChecked, setVerificationChecked] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [result, setResult] = useState("");

  const handleSendVerification = () => {
    if (!phone) {
      setVerificationMessage("전화번호를 입력해주세요.");
      setVerificationSent(false);
      setVerificationChecked(false);
      setSentVerificationCode("");
      return;
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    setSentVerificationCode(code);
    setVerificationSent(true);
    setVerificationChecked(false);
    setVerificationCode("");
    setVerificationMessage("인증번호 발송 완료");
  };

  const handleCheckVerification = () => {
    if (!verificationSent) {
      setVerificationMessage("먼저 인증번호를 발송해주세요.");
      return;
    }

    if (!verificationCode || verificationCode !== sentVerificationCode) {
      setVerificationChecked(false);
      setVerificationMessage("인증번호를 다시 입력해주세요");
      return;
    }

    setVerificationChecked(true);
    setVerificationMessage("인증번호가 맞습니다");
  };

  return (
    <Card className="h-full border-2 border-yellow-200 bg-white p-6 shadow-lg">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
          ?
        </div>
        <h2 className="text-2xl font-bold text-gray-900">비밀번호 찾기</h2>
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
          <Label htmlFor="find-pw-phone" className="mb-2 block text-sm font-semibold text-sky-800">
            전화번호
          </Label>
          <div className="flex gap-3">
            <Input
              id="find-pw-phone"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setVerificationSent(false);
                setVerificationChecked(false);
                setVerificationCode("");
                setVerificationMessage("");
                setSentVerificationCode("");
              }}
              placeholder="전화번호를 입력해주세요"
              className="flex-1"
            />
            <Button
              type="button"
              className="h-9 min-w-28 bg-yellow-400 text-gray-900 hover:bg-yellow-500"
              onClick={handleSendVerification}
            >
              인증번호 발송
            </Button>
          </div>

          {verificationSent && verificationMessage === "인증번호 발송 완료" && (
            <p className="mt-2 text-sm font-semibold text-yellow-700">인증번호 발송 완료</p>
          )}

          {verificationSent && (
            <div className="mt-3 space-y-3">
              <div className="flex gap-3">
                <Input
                  id="find-pw-verification"
                  value={verificationCode}
                  onChange={(e) => {
                    setVerificationCode(e.target.value);
                    setVerificationChecked(false);
                    setVerificationMessage("");
                  }}
                  placeholder="인증번호를 입력해주세요"
                  className="flex-1"
                />
                <Button
                  type="button"
                  className="h-9 min-w-28 bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                  onClick={handleCheckVerification}
                  disabled={!verificationSent}
                >
                  인증번호 확인
                </Button>
              </div>
              {verificationMessage && verificationMessage !== "인증번호 발송 완료" && (
                <p className={`text-sm ${verificationChecked ? "text-green-600" : "text-red-500"}`}>
                  {verificationMessage}
                </p>
              )}
            </div>
          )}
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
            if (!accountId || !name || !phone || !verificationChecked) {
              setResult("");
              if (!verificationChecked && verificationSent) {
                setVerificationMessage("인증번호를 다시 입력해주세요");
              }
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
            <h1 className="text-4xl font-bold text-gray-900">OSP</h1>
            <p className="mt-3 text-lg text-gray-600">Opic Speaking Practice</p>
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
