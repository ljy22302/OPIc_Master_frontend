import { useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [autoLogin, setAutoLogin] = useState(false);

  const handleLogin = () => {
    setError("");

    if (!email || !password) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    if (!email.includes("@")) {
      setError("올바른 아이디 형식으로 입력해주세요.");
      return;
    }

    if (password.length < 4) {
      setError("비밀번호는 4자 이상이어야 합니다.");
      return;
    }

    if (autoLogin) {
      localStorage.setItem("autoLogin", "true");
    } else {
      localStorage.removeItem("autoLogin");
    }

    navigate("/main");
  };

  const handleKeyPress = (e: KeyboardEvent) => {
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
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">OSP</h1>
            <p className="text-gray-600">OPIc Speaking Practice</p>
          </div>

          <Card className="p-8 bg-white border-2 border-yellow-200 shadow-lg mb-6">
            <div className="mb-6">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-900 mb-2 block">
                아이디
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                <span>자동로그인</span>
              </label>
            </div>

            <Button
              type="button"
              size="lg"
              onClick={handleLogin}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold mb-4"
            >
              로그인
            </Button>

            <div className="mb-6 flex items-center justify-between gap-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => navigate("/find-account")}
                className="px-0 text-gray-600 hover:text-gray-900"
              >
                아이디/비밀번호 찾기
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
