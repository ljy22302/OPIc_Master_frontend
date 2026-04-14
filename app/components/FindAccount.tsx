import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

function FindIdCard() {
  const [phone, setPhone] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [showAuthInput, setShowAuthInput] = useState(false);
  const [authStatus, setAuthStatus] = useState("");
  const [name, setName] = useState("");

  const handleSendCode = () => {
    if (!phone) {
      setAuthStatus("전화번호를 입력해주세요.");
      setShowAuthInput(false);
      setSentCode("");
      return;
    }

    setSentCode("123456");
    setShowAuthInput(true);
    setAuthCode("");
    setAuthStatus("인증번호가 발송되었습니다.");
  };

  const handleVerifyCode = () => {
    if (!authCode) {
      setAuthStatus("인증번호를 입력해주세요.");
      return;
    }

    if (authCode === sentCode) {
      setAuthStatus("인증번호 확인되었습니다.");
      return;
    }

    setAuthStatus("인증번호가 올바르지 않습니다.");
  };

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
          <div className="flex gap-2">
            <Input
              id="find-id-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="전화번호를 입력해주세요"
              className="flex-1"
            />
            <Button
              type="button"
              className="shrink-0 bg-yellow-400 text-gray-900 hover:bg-yellow-500"
              onClick={handleSendCode}
            >
              인증번호 발송
            </Button>
          </div>
        </div>

        {showAuthInput && (
          <div>
            <Label htmlFor="find-id-auth" className="mb-2 block text-sm font-semibold text-sky-800">
              인증번호
            </Label>
            <div className="flex gap-2">
              <Input
                id="find-id-auth"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                placeholder="인증번호를 입력해주세요"
                className="flex-1"
              />
              <Button
                type="button"
                className="shrink-0 bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                onClick={handleVerifyCode}
              >
                인증번호 확인
              </Button>
            </div>
            {authStatus && <p className="mt-2 text-sm font-medium text-red-500">{authStatus}</p>}
          </div>
        )}
      </div>

      <div className="mt-6">
        <Button
          type="button"
          className="w-full bg-yellow-400 text-gray-900 hover:bg-yellow-500"
          onClick={() => {
            if (!name || !phone || !authCode) {
              setAuthStatus("모든 정보를 입력해주세요.");
              return;
            }
            setAuthStatus("인증번호 확인되었습니다.");
          }}
        >
          아이디찾기
        </Button>
      </div>
    </Card>
  );
}

function FindPasswordCard() {
  const [accountId, setAccountId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [showAuthInput, setShowAuthInput] = useState(false);
  const [authStatus, setAuthStatus] = useState("");

  const handleSendCode = () => {
    if (!phone) {
      setAuthStatus("전화번호를 입력해주세요.");
      setShowAuthInput(false);
      setSentCode("");
      return;
    }

    setSentCode("123456");
    setShowAuthInput(true);
    setAuthCode("");
    setAuthStatus("인증번호가 발송되었습니다.");
  };

  const handleVerifyCode = () => {
    if (!authCode) {
      setAuthStatus("인증번호를 입력해주세요.");
      return;
    }

    if (authCode === sentCode) {
      setAuthStatus("인증번호 확인되었습니다.");
      return;
    }

    setAuthStatus("인증번호가 올바르지 않습니다.");
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
          <Label htmlFor="find-pw-email" className="mb-2 block text-sm font-semibold text-sky-800">
            이메일
          </Label>
          <Input
            id="find-pw-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일을 입력해주세요"
          />
        </div>

        <div>
          <Label htmlFor="find-pw-phone" className="mb-2 block text-sm font-semibold text-sky-800">
            전화번호
          </Label>
          <div className="flex gap-2">
            <Input
              id="find-pw-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="전화번호를 입력해주세요"
              className="flex-1"
            />
            <Button
              type="button"
              className="shrink-0 bg-yellow-400 text-gray-900 hover:bg-yellow-500"
              onClick={handleSendCode}
            >
              인증번호 발송
            </Button>
          </div>
        </div>

        {showAuthInput && (
          <div>
            <Label htmlFor="find-pw-auth" className="mb-2 block text-sm font-semibold text-sky-800">
              인증번호
            </Label>
            <div className="flex gap-2">
              <Input
                id="find-pw-auth"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                placeholder="인증번호를 입력해주세요"
                className="flex-1"
              />
              <Button
                type="button"
                className="shrink-0 bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                onClick={handleVerifyCode}
              >
                인증번호 확인
              </Button>
            </div>
            {authStatus && <p className="mt-2 text-sm font-medium text-red-500">{authStatus}</p>}
          </div>
        )}
      </div>

      <div className="mt-6">
        <Button
          type="button"
          className="w-full bg-yellow-400 text-gray-900 hover:bg-yellow-500"
          onClick={() => {
            if (!accountId || !name || !email || !phone || !authCode) {
              setAuthStatus("모든 정보를 입력해주세요.");
              return;
            }
            setAuthStatus("인증번호 확인되었습니다.");
          }}
        >
          비밀번호찾기
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
            <p className="mt-3 text-lg text-gray-600">영어 말하기 실력 향상</p>
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
