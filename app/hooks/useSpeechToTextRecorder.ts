import { useEffect, useRef, useState } from "react";

function getSupportedMimeType() {
  if (typeof MediaRecorder === "undefined") {
    return "";
  }

  const mimeTypes = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];

  return mimeTypes.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) || "";
}

function getFileExtension(mimeType: string) {
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mp4")) return "mp4";
  return "webm";
}

type SpeechRecognitionType = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionEvent = {
  resultIndex: number;
  results: SpeechRecognitionResultList;
};

type SpeechRecognitionResultList = {
  length: number;
  [index: number]: { isFinal: boolean; [index: number]: { transcript: string } };
};

function createSpeechRecognition(lang: string): SpeechRecognitionType | null {
  const SR =
    (window as unknown as Record<string, unknown>)["SpeechRecognition"] ||
    (window as unknown as Record<string, unknown>)["webkitSpeechRecognition"];
  if (!SR) return null;

  const recognition = new (SR as new () => SpeechRecognitionType)();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = lang;
  return recognition;
}

export type RecordingResult = {
  audioBlob: Blob | null;
  mimeType: string;
  fileName: string;
  durationSeconds: number;
  clientTranscript: string;
};

const EMPTY_RESULT: RecordingResult = {
  audioBlob: null,
  mimeType: "",
  fileName: "",
  durationSeconds: 0,
  clientTranscript: "",
};

type UseSpeechToTextRecorderOptions = {
  questionId?: string;
  language?: string;
};

export function useSpeechToTextRecorder(
  options: UseSpeechToTextRecorderOptions = {},
) {
  const { language = "en" } = options;
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartedAtRef = useRef<number | null>(null);
  const stopResolveRef = useRef<((value: RecordingResult) => void) | null>(null);
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const clientTranscriptRef = useRef<string>("");

  const [isRecording, setIsRecording] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [error, setError] = useState("");
  const [lastRecording, setLastRecording] = useState<RecordingResult | null>(null);

  useEffect(() => {
    return () => {
      cleanupRecorder();
      stopResolveRef.current?.({ ...EMPTY_RESULT });
      stopResolveRef.current = null;
    };
  }, []);

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser does not support microphone access.");
      return;
    }

    if (typeof MediaRecorder === "undefined") {
      setError("This browser does not support MediaRecorder.");
      return;
    }

    try {
      setError("");
      setLastRecording(null);
      setIsFinalizing(false);
      clientTranscriptRef.current = "";

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setIsRecording(false);
        setIsFinalizing(false);
        setError("An error occurred while recording.");
        stopResolveRef.current?.({ ...EMPTY_RESULT });
        stopResolveRef.current = null;
        cleanupRecorder();
      };

      recorder.onstart = () => {
        recordingStartedAtRef.current = Date.now();
        setIsRecording(true);
      };

      recorder.onstop = () => {
        setIsRecording(false);
        setIsFinalizing(true);

        const finalMimeType = recorder.mimeType || mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: finalMimeType });
        const durationSeconds = recordingStartedAtRef.current
          ? Math.max(0, Math.round((Date.now() - recordingStartedAtRef.current) / 1000))
          : 0;

        const result: RecordingResult = {
          audioBlob: audioBlob.size > 0 ? audioBlob : null,
          mimeType: finalMimeType,
          fileName: `recording.${getFileExtension(finalMimeType)}`,
          durationSeconds,
          clientTranscript: clientTranscriptRef.current,
        };

        audioChunksRef.current = [];
        recordingStartedAtRef.current = null;
        cleanupRecorder();
        setLastRecording(result);
        setIsFinalizing(false);

        stopResolveRef.current?.(result);
        stopResolveRef.current = null;
      };

      mediaRecorderRef.current = recorder;

      // Start Web Speech API recognition in parallel (best-effort)
      const recognition = createSpeechRecognition(language === "en" ? "en-US" : language);
      if (recognition) {
        recognition.onresult = (event) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              clientTranscriptRef.current += (clientTranscriptRef.current ? " " : "") + event.results[i][0].transcript;
            }
          }
        };
        recognition.onerror = null;
        recognition.onend = null;
        try {
          recognition.start();
          recognitionRef.current = recognition;
        } catch {
          recognitionRef.current = null;
        }
      }

      recorder.start();
    } catch (recordingError) {
      setIsRecording(false);
      setIsFinalizing(false);
      setError(
        recordingError instanceof Error
          ? recordingError.message
          : "Unable to access the microphone.",
      );
      cleanupRecorder();
    }
  }

  function stopRecording(): Promise<RecordingResult> {
    const recorder = mediaRecorderRef.current;

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }

    if (!recorder || recorder.state !== "recording") {
      return Promise.resolve(lastRecording || { ...EMPTY_RESULT });
    }

    return new Promise((resolve) => {
      stopResolveRef.current = resolve;
      recorder.stop();
    });
  }

  function resetRecording() {
    setError("");
    setLastRecording(null);
    clientTranscriptRef.current = "";
  }

  function cleanupRecorder() {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    mediaRecorderRef.current = null;
  }

  return {
    error,
    isRecording,
    isUploading: isFinalizing,
    lastRecording,
    resetRecording,
    startRecording,
    stopRecording,
  };
}
