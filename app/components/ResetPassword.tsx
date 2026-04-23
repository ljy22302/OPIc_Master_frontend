import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { motion } from "motion/react";

import { confirmPasswordReset } from "../lib/authApi";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

function isValidPassword(password: string) {
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return hasLetter && hasNumber && hasSpecial;
}

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordUsable = useMemo(
    () => password.length >= 8 && password.length <= 50 && isValidPassword(password),
    [password],
  );

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!token) {
      setError("유효한 비밀번호 재설정 링크가 아닙니다.");
      return;
    }

    if (!passwordUsable) {
      setError("비밀번호에는 영문, 숫자, 특수문자가 모두 포함되어야 합니다.");
      return;
    }

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await confirmPasswordReset({ token, newPassword: password });
      setSuccess(response.message);
      setPassword("");
      setConfirmPassword("");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "비밀번호 재설정에 실패했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-white to-gray-50 px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900">비밀번호 재설정</h1>
            <p className="mt-3 text-gray-600">새 비밀번호를 입력해 계정을 다시 활성화하세요.</p>
          </div>

          <Card className="border-2 border-yellow-200 bg-white p-6 shadow-xl md:p-8">
            {!token && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-600">유효한 토큰이 없어 비밀번호를 재설정할 수 없습니다.</p>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            <div className="mt-5 space-y-5">
              <div>
                <Label htmlFor="new-password" className="mb-2 block text-sm font-semibold text-gray-900">
                  새 비밀번호
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) {
                      setError("");
                    }
                  }}
                  placeholder="새 비밀번호 입력"
                  autoComplete="new-password"
                />
                {!passwordUsable && password.length > 0 && (
                  <p className="mt-2 text-xs font-medium text-red-500">
                    비밀번호에는 영문, 숫자, 특수문자가 모두 포함되어야 합니다.
                  </p>
                )}
                {passwordUsable && (
                  <p className="mt-2 text-xs font-medium text-green-600">
                    사용할 수 있는 비밀번호입니다.
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="confirm-new-password"
                  className="mb-2 block text-sm font-semibold text-gray-900"
                >
                  새 비밀번호 확인
                </Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) {
                      setError("");
                    }
                  }}
                  placeholder="새 비밀번호 다시 입력"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                type="button"
                className="bg-yellow-400 px-8 text-gray-900 shadow-md hover:bg-yellow-500 transition-all disabled:opacity-60"
                disabled={!token || isSubmitting}
                onClick={() => void handleSubmit()}
              >
                {isSubmitting ? "변경 중..." : "비밀번호 변경"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="bg-slate-100 px-8 text-slate-600 hover:bg-slate-200 transition-all"
                onClick={() => navigate("/")}
              >
                로그인으로 이동
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
