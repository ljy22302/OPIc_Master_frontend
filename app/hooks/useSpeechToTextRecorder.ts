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
  if (mimeType.includes("wav")) return "wav";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mp4")) return "mp4";
  return "webm";
}

async function createCombinedAudioBlob(segmentBlobs: Blob[], fallbackMimeType: string) {
  if (segmentBlobs.length <= 1) {
    return {
      audioBlob: segmentBlobs[0] || null,
      mimeType: fallbackMimeType,
    };
  }

  try {
    const wavBlob = await mergeAudioBlobsAsWav(segmentBlobs);
    return {
      audioBlob: wavBlob,
      mimeType: "audio/wav",
    };
  } catch {
    return {
      audioBlob: new Blob(segmentBlobs, { type: fallbackMimeType }),
      mimeType: fallbackMimeType,
    };
  }
}

async function mergeAudioBlobsAsWav(segmentBlobs: Blob[]) {
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextClass) {
    throw new Error("AudioContext is not supported.");
  }

  const audioContext = new AudioContextClass();
  try {
    const decodedBuffers = await Promise.all(
      segmentBlobs.map(async (blob) => {
        const arrayBuffer = await blob.arrayBuffer();
        return audioContext.decodeAudioData(arrayBuffer.slice(0));
      }),
    );
    const sampleRate = audioContext.sampleRate;
    const totalLength = decodedBuffers.reduce(
      (sum, buffer) => sum + Math.ceil(buffer.duration * sampleRate),
      0,
    );
    const output = audioContext.createBuffer(1, totalLength, sampleRate);
    const outputData = output.getChannelData(0);
    let offset = 0;

    decodedBuffers.forEach((buffer) => {
      const sourceData = buffer.getChannelData(0);
      outputData.set(sourceData, offset);
      offset += sourceData.length;
    });

    return audioBufferToWavBlob(output);
  } finally {
    void audioContext.close();
  }
}

function audioBufferToWavBlob(audioBuffer: AudioBuffer) {
  const samples = audioBuffer.getChannelData(0);
  const bytesPerSample = 2;
  const headerSize = 44;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, audioBuffer.sampleRate, true);
  view.setUint32(28, audioBuffer.sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 8 * bytesPerSample, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  let offset = headerSize;
  for (const sample of samples) {
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += bytesPerSample;
  }

  return new Blob([view], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index++) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
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
  const accumulatedAudioSegmentsRef = useRef<Blob[]>([]);
  const accumulatedDurationSecondsRef = useRef(0);
  const activeMimeTypeRef = useRef("");
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
    if (mediaRecorderRef.current?.state === "recording") {
      return;
    }

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
      setIsFinalizing(false);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const mimeType = activeMimeTypeRef.current || getSupportedMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      activeMimeTypeRef.current = recorder.mimeType || mimeType || "audio/webm";
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

      recorder.onstop = async () => {
        setIsRecording(false);
        setIsFinalizing(true);

        const finalMimeType = recorder.mimeType || mimeType || "audio/webm";
        const segmentDurationSeconds = recordingStartedAtRef.current
          ? Math.max(0, Math.round((Date.now() - recordingStartedAtRef.current) / 1000))
          : 0;
        const segmentBlob = new Blob(audioChunksRef.current, { type: finalMimeType });
        if (segmentBlob.size > 0) {
          accumulatedAudioSegmentsRef.current = [...accumulatedAudioSegmentsRef.current, segmentBlob];
        }
        accumulatedDurationSecondsRef.current += segmentDurationSeconds;
        const combinedAudio = await createCombinedAudioBlob(accumulatedAudioSegmentsRef.current, finalMimeType);

        const result: RecordingResult = {
          audioBlob: combinedAudio.audioBlob && combinedAudio.audioBlob.size > 0 ? combinedAudio.audioBlob : null,
          mimeType: combinedAudio.mimeType,
          fileName: `recording.${getFileExtension(combinedAudio.mimeType)}`,
          durationSeconds: accumulatedDurationSecondsRef.current,
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
    audioChunksRef.current = [];
    accumulatedAudioSegmentsRef.current = [];
    accumulatedDurationSecondsRef.current = 0;
    activeMimeTypeRef.current = "";
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
