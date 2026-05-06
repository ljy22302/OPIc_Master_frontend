import { useCallback, useEffect, useRef, useState } from "react";

type QuestionSpeechResult = {
  isSpeaking: boolean;
  progress: number;
  durationMs: number;
  isSupported: boolean;
  speak: (text: string) => boolean;
  stop: () => void;
};

function pickEnglishVoice(voices: SpeechSynthesisVoice[]) {
  const femaleVoiceNames = [
    "samantha",
    "jenny",
    "aria",
    "zira",
    "susan",
    "victoria",
    "karen",
    "tessa",
    "moira",
    "fiona",
    "serena",
    "ava",
    "allison",
  ];
  const englishVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en-"));
  const femaleEnglishVoice = englishVoices.find((voice) => {
    const name = voice.name.toLowerCase();
    return femaleVoiceNames.some((femaleName) => name.includes(femaleName));
  });

  return (
    femaleEnglishVoice ||
    englishVoices.find((voice) => voice.lang.toLowerCase() === "en-us") ||
    englishVoices[0] ||
    null
  );
}

function estimateSpeechDurationMs(text: string) {
  const words = text.split(/\s+/).filter(Boolean).length;
  const commaLikePauses = (text.match(/[,;:]/g) || []).length;
  const sentencePauses = (text.match(/[.!?]/g) || []).length;
  return Math.max(2200, 700 + words * 430 + commaLikePauses * 180 + sentencePauses * 320);
}

export function useQuestionSpeech(): QuestionSpeechResult {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressFrameRef = useRef<number | null>(null);

  const clearProgressTimer = useCallback(() => {
    if (progressFrameRef.current !== null) {
      window.cancelAnimationFrame(progressFrameRef.current);
      progressFrameRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return undefined;
    }

    const syncVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };

    syncVoices();
    window.speechSynthesis.addEventListener("voiceschanged", syncVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", syncVoices);
      window.speechSynthesis.cancel();
      clearProgressTimer();
    };
  }, [clearProgressTimer]);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    clearProgressTimer();
    utteranceRef.current = null;
    setIsSpeaking(false);
    setProgress(0);
    setDurationMs(0);
  }, [clearProgressTimer]);

  const speak = useCallback((text: string) => {
    const normalizedText = text.trim();
    if (!normalizedText || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return false;
    }

    window.speechSynthesis.cancel();
    clearProgressTimer();
    setProgress(0);

    const utterance = new SpeechSynthesisUtterance(normalizedText);
    const selectedVoice = pickEnglishVoice(voicesRef.current);
    const estimatedDurationMs = estimateSpeechDurationMs(normalizedText);
    setDurationMs(estimatedDurationMs);

    utterance.lang = selectedVoice?.lang || "en-US";
    utterance.voice = selectedVoice;
    utterance.rate = 0.9;
    utterance.pitch = 1.08;
    utterance.onstart = () => {
      setIsSpeaking(true);
      setProgress(0);
      progressFrameRef.current = window.requestAnimationFrame(() => setProgress(100));
    };
    utterance.onboundary = null;
    utterance.onend = () => {
      clearProgressTimer();
      setProgress(100);
      utteranceRef.current = null;
      window.setTimeout(() => {
        setIsSpeaking(false);
        setProgress(0);
      }, 180);
    };
    utterance.onerror = () => {
      clearProgressTimer();
      utteranceRef.current = null;
      setIsSpeaking(false);
      setProgress(0);
      setDurationMs(0);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    return true;
  }, [clearProgressTimer]);

  return {
    isSpeaking,
    progress,
    durationMs,
    isSupported: typeof window !== "undefined" && "speechSynthesis" in window,
    speak,
    stop,
  };
}
