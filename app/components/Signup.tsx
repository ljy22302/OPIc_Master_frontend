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

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, index) => currentYear - index);
const months = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));
const days = Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, "0"));

const emailDomains = ["naver.com", "gmail.com", "daum.net", "직접입력"];

export function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [emailLocal, setEmailLocal] = useState("");
  const [emailDomain, setEmailDomain] = useState("naver.com");
  const [customEmailDomain, setCustomEmailDomain] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [idChecked, setIdChecked] = useState(false);

  const resolvedDomain = emailDomain === "직접입력" ? customEmailDomain : emailDomain;

  const handleSignup = () => {
    setError("");
    setMessage("");

    if (!username || username.length < 6 || username.length > 20) {
      setError("아이디는 6~20자로 입력해주세요.");
      return;
    }

    if (!idChecked) {
      setError("아이디 중복 확인을 해주세요.");
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

    if (!name) {
      setError("이름을 입력해주세요.");
      return;
    }

    if (!phone || phone.length < 10) {
      setError("전화번호를 정확히 입력해주세요.");
      return;
    }

    if (!emailLocal || !resolvedDomain) {
      setError("이메일 주소를 입력해주세요.");
      return;
    }

    if (!birthYear || !birthMonth || !birthDay) {
      setError("생년월일을 모두 선택해주세요.");
      return;
    }

    setMessage("회원가입 화면입니다. 실제 회원 생성은 연결된 API에서 처리하면 됩니다.");
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
            <p className="mt-3 text-gray-600">회원이 되어 다양한 혜택을 경험해 보세요!</p>
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

            {message && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-3"
              >
                <p className="text-sm text-yellow-800">{message}</p>
              </motion.div>
            )}

            <div className="space-y-5">
              <div>
                <Label htmlFor="username" className="mb-2 block text-sm font-semibold text-gray-900">
                  아이디
                  <span className="ml-2 text-xs font-medium text-red-500">사용할 수 있는 아이디입니다</span>
                </Label>
                <div className="flex gap-3">
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setIdChecked(false);
                    }}
                    placeholder="아이디 입력 (6~20자)"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    className="h-9 min-w-24 bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                    onClick={() => {
                      if (!username) {
                        setError("아이디를 먼저 입력해주세요.");
                        return;
                      }
                      setError("");
                      setIdChecked(true);
                      setMessage("아이디 중복 확인이 완료되었습니다.");
                    }}
                  >
                    중복 확인
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-900">
                  비밀번호
                  <span className="ml-2 text-xs font-medium text-red-500">
                    20자 이내의 비밀번호를 입력해주세요
                  </span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 입력 (문자, 숫자, 특수문자 포함 8~20자)"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-gray-900">
                  비밀번호 확인
                  <span className="ml-2 text-xs font-medium text-red-500">
                    비밀번호를 확인해 주세요
                  </span>
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
                  이름
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름을 입력해주세요"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="mb-2 block text-sm font-semibold text-gray-900">
                  전화번호
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="휴대폰 번호 입력 ('-' 제외 11자리 입력)"
                />
              </div>

              <div>
                <Label className="mb-2 block text-sm font-semibold text-gray-900">이메일 주소</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={emailLocal}
                    onChange={(e) => setEmailLocal(e.target.value)}
                    placeholder="이메일 아이디"
                    className="min-w-0 flex-1"
                  />
                  <span className="text-sm font-semibold text-gray-500">@</span>
                  {emailDomain === "직접입력" ? (
                    <Input
                      value={customEmailDomain}
                      onChange={(e) => setCustomEmailDomain(e.target.value)}
                      placeholder="도메인 입력"
                      className="min-w-0 flex-1"
                    />
                  ) : (
                    <Select value={emailDomain} onValueChange={setEmailDomain}>
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
              </div>

              <div>
                <Label className="mb-2 block text-sm font-semibold text-gray-900">생년월일</Label>
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
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                type="button"
                className="bg-yellow-400 px-8 text-gray-900 shadow-md hover:bg-yellow-500 transition-all"
                onClick={handleSignup}
              >
                가입하기
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
