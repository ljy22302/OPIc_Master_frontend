import { useCallback, useEffect, useRef, useState } from "react";

type QuestionSpeechResult = {
  isSpeaking: boolean;
  isSupported: boolean;
  speak: (text: string) => boolean;
  stop: () => void;
};

function pickEnglishVoice(voices: SpeechSynthesisVoice[]) {
  return (
    voices.find((voice) => voice.lang.toLowerCase() === "en-us") ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en-")) ||
    null
  );
}

export function useQuestionSpeech(): QuestionSpeechResult {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

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
    };
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setIsSpeaking(false);
  }, []);

  const speak = useCallback((text: string) => {
    const normalizedText = text.trim();
    if (!normalizedText || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return false;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(normalizedText);
    const selectedVoice = pickEnglishVoice(voicesRef.current);

    utterance.lang = selectedVoice?.lang || "en-US";
    utterance.voice = selectedVoice;
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      utteranceRef.current = null;
      setIsSpeaking(false);
    };
    utterance.onerror = () => {
      utteranceRef.current = null;
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    return true;
  }, []);

  return {
    isSpeaking,
    isSupported: typeof window !== "undefined" && "speechSynthesis" in window,
    speak,
    stop,
  };
}
