import { useMemo, useState } from "react";
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
import { checkUsername, sendEmailVerification, signup, verifyEmail } from "../lib/authApi";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, index) => currentYear - index);
const months = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));
const days = Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, "0"));
const emailDomains = ["naver.com", "gmail.com", "daum.net", "직접입력"];
const passwordRuleMessage = "영문, 숫자, 특수문자가 모두 포함되어야 합니다.";
const passwordValidationErrors = new Set([
  passwordRuleMessage,
  "비밀번호 사용 가능 조건을 만족해주세요.",
  "비밀번호를 8~20자로 입력해주세요.",
]);

function isValidPassword(password: string) {
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return hasLetter && hasNumber && hasSpecial;
}

export function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [emailLocal, setEmailLocal] = useState("");
  const [emailDomain, setEmailDomain] = useState("naver.com");
  const [customEmailDomain, setCustomEmailDomain] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [error, setError] = useState("");
  const [idChecked, setIdChecked] = useState(false);
  const [passwordUsable, setPasswordUsable] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [usernameMessage, setUsernameMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isCheckingId, setIsCheckingId] = useState(false);
  const [isSendingEmailCode, setIsSendingEmailCode] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resolvedDomain = emailDomain === "직접입력" ? customEmailDomain.trim() : emailDomain;
  const email = useMemo(() => {
    if (!emailLocal.trim() || !resolvedDomain.trim()) {
      return "";
    }
    return `${emailLocal.trim()}@${resolvedDomain.trim()}`;
  }, [emailLocal, resolvedDomain]);

  const birthDate =
    birthYear && birthMonth && birthDay ? `${birthYear}-${birthMonth}-${birthDay}` : undefined;

  const canSignup = idChecked && passwordUsable && emailVerified && !isSubmitting;

  const handleCheckUsername = async () => {
    if (!username.trim()) {
      setError("아이디를 먼저 입력해주세요.");
      setUsernameMessage("");
      return;
    }

    try {
      setIsCheckingId(true);
      setError("");
      setUsernameMessage("");
      const result = await checkUsername(username.trim());
      setIdChecked(result.available);
      if (result.available) {
        setUsernameMessage("중복 확인 완료");
        return;
      }
      setError(result.message);
    } catch (checkError) {
      setError(checkError instanceof Error ? checkError.message : "중복 확인에 실패했습니다.");
      setIdChecked(false);
      setUsernameMessage("");
    } finally {
      setIsCheckingId(false);
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);

    if (passwordValidationErrors.has(error)) {
      setError("");
    }

    if (isValidPassword(value)) {
      setPasswordUsable(true);
      setPasswordMessage("비밀번호로 사용 가능합니다.");
      return;
    }

    setPasswordUsable(false);
    setPasswordMessage("");
  };

  const handleSendEmailCode = async () => {
    if (!email || !email.includes("@")) {
      setError("이메일을 정확히 입력해주세요.");
      setEmailMessage("");
      return;
    }

    try {
      setIsSendingEmailCode(true);
      setError("");
      setEmailVerified(false);
      const response = await sendEmailVerification({ email });
      setEmailMessage(response.message);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "이메일 인증 코드 발송에 실패했습니다.");
      setEmailMessage("");
    } finally {
      setIsSendingEmailCode(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!emailCode.trim()) {
      setError("이메일 인증 코드를 입력해주세요.");
      return;
    }

    try {
      setIsVerifyingEmail(true);
      setError("");
      const response = await verifyEmail({ email, code: emailCode.trim() });
      setEmailVerified(true);
      setEmailMessage(response.message);
    } catch (verifyError) {
      setEmailVerified(false);
      setError(verifyError instanceof Error ? verifyError.message : "이메일 인증에 실패했습니다.");
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleSignup = async () => {
    setError("");

    if (!idChecked) {
      setError("아이디 중복 확인을 해주세요.");
      return;
    }

    if (!passwordUsable) {
      setError("비밀번호 사용 가능 조건을 만족해주세요.");
      return;
    }

    if (!password || password.length < 8 || password.length > 20) {
      setError("비밀번호는 8~20자로 입력해주세요.");
      return;
    }

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!emailVerified) {
      setError("이메일 인증을 완료해주세요.");
      return;
    }

    if (!name.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await signup({
        username: username.trim(),
        password,
        name: name.trim(),
        email,
        birthDate,
      });

      localStorage.setItem("accessToken", result.accessToken);
      localStorage.setItem("currentUser", JSON.stringify(result.user));
      navigate("/main");
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : "회원가입에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-white to-gray-50 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900">회원가입</h1>
            <p className="mt-3 text-gray-600">중복확인, 비밀번호 확인, 이메일 인증을 완료해야 가입할 수 있어요.</p>
          </div>

          <Card className="border-2 border-yellow-200 bg-white p-6 shadow-xl md:p-8">
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3"
              >
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}

            <div className="space-y-5">
              <div>
                <Label htmlFor="username" className="mb-2 block text-sm font-semibold text-gray-900">
                  <span className="text-red-500">*</span> 아이디
                </Label>
                <div className="flex gap-3">
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setIdChecked(false);
                      setUsernameMessage("");
                    }}
                    placeholder="아이디 입력 (6~20자)"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    className="h-9 min-w-24 bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                    disabled={isCheckingId}
                    onClick={() => void handleCheckUsername()}
                  >
                    {isCheckingId ? "확인 중" : "중복 확인"}
                  </Button>
                </div>
                {idChecked && usernameMessage && (
                  <p className="mt-2 text-sm font-medium text-green-600">{usernameMessage}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-900">
                  <span className="text-red-500">*</span> 비밀번호
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="비밀번호 입력 (8~20자)"
                />
                {!passwordUsable && password.length > 0 && (
                  <span className="ml-2 text-xs font-medium text-red-500">{passwordRuleMessage}</span>
                )}
                {passwordUsable && passwordMessage && (
                  <p className="mt-2 text-sm font-medium text-green-600">{passwordMessage}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-gray-900">
                  <span className="text-red-500">*</span> 비밀번호 확인
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호 재입력"
                />
              </div>

              <div>
                <Label htmlFor="name" className="mb-2 block text-sm font-semibold text-gray-900">
                  <span className="text-red-500">*</span> 이름
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름 입력"
                />
              </div>

              <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
                <p className="mb-3 text-sm font-semibold text-gray-900">이메일 인증</p>
                <Label className="mb-2 block text-sm font-semibold text-gray-900">
                  <span className="text-red-500">*</span> 이메일 주소
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={emailLocal}
                    onChange={(e) => {
                      setEmailLocal(e.target.value);
                      setEmailVerified(false);
                      setEmailMessage("");
                    }}
                    placeholder="이메일 주소"
                    className="min-w-0 flex-1"
                  />
                  <span className="text-sm font-semibold text-gray-500">@</span>
                  {emailDomain === "직접입력" ? (
                    <Input
                      value={customEmailDomain}
                      onChange={(e) => {
                        setCustomEmailDomain(e.target.value);
                        setEmailVerified(false);
                        setEmailMessage("");
                      }}
                      placeholder="직접 입력"
                      className="min-w-0 flex-1"
                    />
                  ) : (
                    <Select
                      value={emailDomain}
                      onValueChange={(value) => {
                        setEmailDomain(value);
                        setEmailVerified(false);
                        setEmailMessage("");
                      }}
                    >
                      <SelectTrigger className="min-w-[140px] flex-1 bg-white">
                        <SelectValue placeholder="도메인 선택" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {emailDomains.map((domain) => (
                          <SelectItem key={domain} value={domain}>
                            {domain}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="mt-3 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSendingEmailCode}
                    onClick={() => void handleSendEmailCode()}
                  >
                    {isSendingEmailCode ? "전송 중" : "이메일 인증코드 받기"}
                  </Button>
                </div>

                <div className="mt-3 flex gap-3">
                  <Input
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value)}
                    placeholder="인증코드 6자리 입력"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    className="bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                    disabled={isVerifyingEmail}
                    onClick={() => void handleVerifyEmail()}
                  >
                    {isVerifyingEmail ? "확인 중" : "이메일 인증 확인"}
                  </Button>
                </div>

                {emailMessage && (
                  <p className={`mt-2 text-sm font-medium ${emailVerified ? "text-green-600" : "text-gray-700"}`}>
                    {emailVerified ? "이메일 인증 완료" : emailMessage}
                  </p>
                )}
              </div>

              <div>
                <Label className="mb-2 block text-sm font-semibold text-gray-900">
                  생년월일
                  <span className="ml-2 text-xs font-medium text-gray-500">선택</span>
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  <Select value={birthYear} onValueChange={setBirthYear}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="년도" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {years.map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={birthMonth} onValueChange={setBirthMonth}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="월" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={birthDay} onValueChange={setBirthDay}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="일" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {days.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="mt-2 text-xs font-medium text-red-500">*은 필수입니다</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                type="button"
                className="bg-yellow-400 px-8 text-gray-900 shadow-md hover:bg-yellow-500 transition-all disabled:opacity-60"
                disabled={!canSignup}
                onClick={() => void handleSignup()}
              >
                {isSubmitting ? "가입 중..." : "가입하기"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="bg-slate-100 px-8 text-slate-600 hover:bg-slate-200 transition-all"
                onClick={() => navigate("/")}
              >
                가입취소
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
