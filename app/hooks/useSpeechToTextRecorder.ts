import { useEffect, useRef, useState } from "react";

const STT_API_BASE_URL =
  (import.meta.env.VITE_STT_API_BASE_URL as string | undefined)?.trim() || "";

const STT_API_ENDPOINT = `${STT_API_BASE_URL.replace(/\/+$/, "")}/api/stt/transcriptions`;

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

type UseSpeechToTextRecorderOptions = {
  questionId?: string;
  language?: string;
};

export function useSpeechToTextRecorder(
  options: UseSpeechToTextRecorderOptions = {},
) {
  const { questionId, language = "en" } = options;

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const skipUploadOnStopRef = useRef(false);

  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      cleanupRecorder();
    };
  }, []);

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("이 브라우저는 마이크 녹음을 지원하지 않습니다.");
      return;
    }

    if (typeof MediaRecorder === "undefined") {
      setError("이 브라우저는 MediaRecorder를 지원하지 않습니다.");
      return;
    }

    try {
      setError("");
      setTranscript("");
      setIsUploading(false);
      skipUploadOnStopRef.current = false;

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
        setError("녹음 중 오류가 발생했습니다.");
        cleanupRecorder();
      };

      recorder.onstart = () => {
        setIsRecording(true);
      };

      recorder.onstop = async () => {
        setIsRecording(false);

        const shouldSkipUpload = skipUploadOnStopRef.current;
        skipUploadOnStopRef.current = false;

        const finalMimeType = recorder.mimeType || mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: finalMimeType });

        audioChunksRef.current = [];
        cleanupRecorder();

        if (shouldSkipUpload) {
          return;
        }

        if (audioBlob.size === 0) {
          setError("녹음된 음성이 비어 있습니다.");
          return;
        }

        await uploadAudio(audioBlob, finalMimeType);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
    } catch (recordingError) {
      setIsRecording(false);
      setError(
        recordingError instanceof Error
          ? recordingError.message
          : "마이크 권한을 확인할 수 없습니다.",
      );
      cleanupRecorder();
    }
  }

  function stopRecording(skipUpload = false) {
    const recorder = mediaRecorderRef.current;

    if (!recorder || recorder.state !== "recording") {
      return;
    }

    skipUploadOnStopRef.current = skipUpload;
    recorder.stop();
  }

  function resetTranscript() {
    setTranscript("");
    setError("");
  }

  async function uploadAudio(audioBlob: Blob, mimeType: string) {
    const fileName = `recording.${getFileExtension(mimeType)}`;
    const formData = new FormData();

    formData.append("audioFile", audioBlob, fileName);
    formData.append("language", language);

    if (questionId) {
      formData.append("questionId", questionId);
    }

    try {
      setIsUploading(true);
      setError("");

      const response = await fetch(STT_API_ENDPOINT, {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          data && typeof data.detail === "string"
            ? data.detail
            : data && typeof data.message === "string"
              ? data.message
              : "STT 서버 요청에 실패했습니다.";
        throw new Error(message);
      }

      const nextTranscript =
        data && typeof data.transcript === "string" ? data.transcript : "";

      setTranscript(nextTranscript);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "음성 업로드 중 오류가 발생했습니다.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  function cleanupRecorder() {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    mediaRecorderRef.current = null;
  }

  return {
    error,
    isRecording,
    isUploading,
    resetTranscript,
    startRecording,
    stopRecording,
    transcript,
  };
}
