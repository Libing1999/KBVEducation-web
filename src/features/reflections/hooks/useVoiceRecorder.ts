import { useCallback, useEffect, useRef, useState } from 'react';

export type RecorderStatus = 'idle' | 'recording' | 'paused' | 'stopped';

const MAX_SECONDS = 600; // 10 minutes
const MIC_DENIED_MESSAGE = 'Microphone access is required to record your reflection.';

/** Picks the best MediaRecorder mimeType this browser supports, and the file
 * extension the backend's audio allow-list already recognizes for it. */
function pickMimeType(): { mimeType: string | undefined; extension: string } {
  const candidates: Array<{ mimeType: string; extension: string }> = [
    { mimeType: 'audio/webm;codecs=opus', extension: 'webm' },
    { mimeType: 'audio/webm', extension: 'webm' },
    { mimeType: 'audio/mp4', extension: 'm4a' },
  ];
  for (const c of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported?.(c.mimeType)) {
      return c;
    }
  }
  return { mimeType: undefined, extension: 'webm' };
}

/** Self-contained MediaRecorder state machine: idle -> recording -> paused -> stopped. */
export function useVoiceRecorder() {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const extensionRef = useRef('webm');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isSupported = typeof window !== 'undefined'
    && !!navigator.mediaDevices?.getUserMedia
    && typeof MediaRecorder !== 'undefined';

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const releaseStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const revokePreview = useCallback(() => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  const stop = useCallback(() => {
    stopTimer();
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
  }, []);

  const start = useCallback(async () => {
    if (!isSupported) {
      setError('Voice recording is not supported in this browser.');
      return;
    }
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const { mimeType, extension } = pickMimeType();
      extensionRef.current = extension;
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType ?? recorder.mimeType });
        const file = new File([blob], `voice-note-${Date.now()}.${extensionRef.current}`, {
          type: blob.type,
        });
        revokePreview();
        setPreviewUrl(URL.createObjectURL(blob));
        setAudioFile(file);
        setStatus('stopped');
        releaseStream();
      };

      recorderRef.current = recorder;
      recorder.start();
      setStatus('recording');
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => {
          const next = s + 1;
          if (next >= MAX_SECONDS) {
            stop();
          }
          return next;
        });
      }, 1000);
    } catch {
      setError(MIC_DENIED_MESSAGE);
      releaseStream();
    }
  }, [isSupported, revokePreview, stop]);

  const pause = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.pause();
      setStatus('paused');
      stopTimer();
    }
  }, []);

  const resume = useCallback(() => {
    if (recorderRef.current?.state === 'paused') {
      recorderRef.current.resume();
      setStatus('recording');
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => {
          const next = s + 1;
          if (next >= MAX_SECONDS) stop();
          return next;
        });
      }, 1000);
    }
  }, [stop]);

  const reset = useCallback(() => {
    stopTimer();
    releaseStream();
    revokePreview();
    recorderRef.current = null;
    chunksRef.current = [];
    setAudioFile(null);
    setElapsedSeconds(0);
    setError(null);
    setStatus('idle');
  }, [revokePreview]);

  useEffect(() => () => {
    stopTimer();
    releaseStream();
    revokePreview();
  }, [revokePreview]);

  return {
    status,
    elapsedSeconds,
    audioFile,
    previewUrl,
    error,
    isSupported,
    start,
    pause,
    resume,
    stop,
    reset,
  };
}
