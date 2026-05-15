import { useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { login } from "../lib/authApi";
import { storeAuthSession } from "../lib/authStorage";

export function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [autoLogin, setAutoLogin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!username || !password) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    if (password.length < 4) {
      setError("비밀번호는 4자 이상 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await login({ username, password });
      storeAuthSession(result.accessToken, result.user, autoLogin);
      navigate("/main");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "로그인에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      void handleLogin();
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
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">OSP</h1>
            <p className="text-gray-600">OPIc Speaking Practice</p>
          </div>

          <Card className="p-8 bg-white border-2 border-yellow-200 shadow-lg mb-6">
            <div className="mb-6">
              <Label htmlFor="username" className="text-sm font-semibold text-gray-900 mb-2 block">
                아이디
              </Label>
              <Input
                id="username"
                placeholder="아이디 입력"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full"
              />
            </div>

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
                onKeyDown={handleKeyPress}
                className="w-full"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}

            <div className="mb-4 flex items-center justify-between gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                <Checkbox
                  checked={autoLogin}
                  onCheckedChange={(checked) => setAutoLogin(checked === true)}
                />
                <span>자동 로그인</span>
              </label>
            </div>

            <Button
              type="button"
              size="lg"
              onClick={() => void handleLogin()}
              disabled={isSubmitting}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold mb-4"
            >
              {isSubmitting ? "로그인 중..." : "로그인"}
            </Button>

            <div className="mb-6 flex items-center justify-between gap-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => navigate("/find-account")}
                className="px-0 text-gray-600 hover:text-gray-900"
              >
                아이디 / 비밀번호 찾기
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => navigate("/signup")}
                className="px-0 text-gray-600 hover:text-gray-900"
              >
                회원가입
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
