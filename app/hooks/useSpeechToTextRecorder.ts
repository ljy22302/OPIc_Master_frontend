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
  const stopResolveRef = useRef<((value: string) => void) | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      cleanupRecorder();
      stopResolveRef.current?.("");
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
        setError("An error occurred while recording.");
        stopResolveRef.current?.("");
        stopResolveRef.current = null;
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
          stopResolveRef.current?.(transcript);
          stopResolveRef.current = null;
          return;
        }

        if (audioBlob.size === 0) {
          setError("The recorded audio is empty.");
          stopResolveRef.current?.("");
          stopResolveRef.current = null;
          return;
        }

        const uploadedTranscript = await uploadAudio(audioBlob, finalMimeType);
        stopResolveRef.current?.(uploadedTranscript);
        stopResolveRef.current = null;
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
    } catch (recordingError) {
      setIsRecording(false);
      setError(
        recordingError instanceof Error
          ? recordingError.message
          : "Unable to access the microphone.",
      );
      stopResolveRef.current?.("");
      stopResolveRef.current = null;
      cleanupRecorder();
    }
  }

  function stopRecording(skipUpload = false): Promise<string> {
    const recorder = mediaRecorderRef.current;

    if (!recorder || recorder.state !== "recording") {
      return Promise.resolve(transcript);
    }

    return new Promise((resolve) => {
      stopResolveRef.current = resolve;
      skipUploadOnStopRef.current = skipUpload;
      recorder.stop();
    });
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
              : "STT server request failed.";
        throw new Error(message);
      }

      const nextTranscript =
        data && typeof data.transcript === "string" ? data.transcript : "";

      setTranscript(nextTranscript);
      return nextTranscript;
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "An upload error occurred.",
      );
      return "";
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
