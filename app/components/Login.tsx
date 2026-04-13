import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    setError("");

    // 간단한 유효성 검사
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요");
      return;
    }

    if (!email.includes("@")) {
      setError("유효한 이메일 형식을 입력해주세요");
      return;
    }

    if (password.length < 4) {
      setError("비밀번호는 4자 이상이어야 합니다");
      return;
    }

    // 로그인 성공 시 main으로 이동
    navigate("/main");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">OPIC</h1>
            <p className="text-gray-600">영어 말하기 능력 평가</p>
          </div>

          {/* Login Card */}
          <Card className="p-8 bg-white border-2 border-yellow-200 shadow-lg mb-6">
            {/* Email Input */}
            <div className="mb-6">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-900 mb-2 block">
                이메일
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full"
              />
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-900 mb-2 block">
                비밀번호
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호 입력"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full"
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}

            {/* Login Button */}
            <Button
              type="button"
              size="lg"
              onClick={handleLogin}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold mb-4"
            >
              로그인
            </Button>

            {/* Demo Login Info */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-2">테스트 계정</p>
              <p className="text-xs text-gray-600 mb-1">
                <span className="font-semibold">이메일:</span> test@example.com
              </p>
              <p className="text-xs text-gray-600">
                <span className="font-semibold">비밀번호:</span> test1234
              </p>
            </div>
          </Card>

          {/* Demo Login Button */}
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => {
              setEmail("test@example.com");
              setPassword("test1234");
              setTimeout(() => navigate("/main"), 300);
            }}
            className="w-full border-gray-300 text-gray-900"
          >
            테스트 계정으로 로그인
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
