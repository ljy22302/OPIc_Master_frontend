import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { findId, requestPasswordReset } from "../lib/authApi";

function FindIdCard() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFindId = async () => {
    setError("");
    setResult("");

    if (!name.trim() || !email.trim()) {
      setError("이름과 이메일을 모두 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await findId({ name: name.trim(), email: email.trim() });
      setResult(response.message);
    } catch (findError) {
      setError(findError instanceof Error ? findError.message : "아이디 찾기에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="h-full border-2 border-yellow-200 bg-white p-6 shadow-lg">
      <h2 className="mb-5 text-2xl font-bold text-gray-900">아이디 찾기</h2>

      <div className="space-y-4">
        <div>
          <Label htmlFor="find-id-name" className="mb-2 block text-sm font-semibold text-gray-900">
            이름
          </Label>
          <Input
            id="find-id-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름 입력"
          />
        </div>
        <div>
          <Label htmlFor="find-id-email" className="mb-2 block text-sm font-semibold text-gray-900">
            이메일
          </Label>
          <Input
            id="find-id-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="가입한 이메일 입력"
          />
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-500">
        입력한 이메일로 가입된 아이디를 발송합니다.
      </p>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {result && (
        <div className="mt-5 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          {result}
        </div>
      )}

      <div className="mt-6">
        <Button
          type="button"
          disabled={isSubmitting}
          className="w-full bg-yellow-400 text-gray-900 hover:bg-yellow-500"
          onClick={() => void handleFindId()}
        >
          {isSubmitting ? "조회 중..." : "아이디 찾기"}
        </Button>
      </div>
    </Card>
  );
}

function FindPasswordCard() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordReset = async () => {
    setError("");
    setResult("");

    if (!username.trim() || !email.trim()) {
      setError("아이디와 이메일을 모두 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await requestPasswordReset({
        username: username.trim(),
        email: email.trim(),
      });

      setResult(response.message);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "비밀번호 재설정 요청에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="h-full border-2 border-yellow-200 bg-white p-6 shadow-lg">
      <h2 className="mb-5 text-2xl font-bold text-gray-900">비밀번호 찾기</h2>

      <div className="space-y-4">
        <div>
          <Label htmlFor="find-pw-id" className="mb-2 block text-sm font-semibold text-gray-900">
            아이디
          </Label>
          <Input
            id="find-pw-id"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="가입한 아이디 입력"
          />
        </div>
        <div>
          <Label htmlFor="find-pw-email" className="mb-2 block text-sm font-semibold text-gray-900">
            이메일
          </Label>
          <Input
            id="find-pw-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="가입한 이메일 입력"
          />
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-500">
        입력한 이메일로 비밀번호 재설정 링크를 발송합니다.
      </p>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {result && (
        <div className="mt-5 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          {result}
        </div>
      )}

      <div className="mt-6">
        <Button
          type="button"
          disabled={isSubmitting}
          className="w-full bg-yellow-400 text-gray-900 hover:bg-yellow-500"
          onClick={() => void handlePasswordReset()}
        >
          {isSubmitting ? "요청 중..." : "비밀번호 재설정 링크 보내기"}
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
            <p className="mt-3 text-lg text-gray-600">OPIc Speaking Practice</p>
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
