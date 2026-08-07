import { useCallback, useEffect, useRef, useState } from 'react';

export type RecorderStatus = 'idle' | 'recording' | 'paused' | 'stopped';

/** Why recording is unavailable before the user even clicks "Start".
 * `insecure-context` is deliberately distinct from `unsupported`: browsers
 * hide `navigator.mediaDevices` entirely on plain http:// origins, so a fully
 * capable browser looks "unsupported" when the site isn't served over HTTPS.
 * localhost is exempt from that rule, which is why dev never sees it. */
export type SupportIssue = 'insecure-context' | 'unsupported';

const MAX_SECONDS = 600; // 10 minutes

const MIC_DENIED_MESSAGE =
  'Microphone access is required to record your reflection. Please allow microphone permission and try again.';
const NO_MIC_MESSAGE =
  'No microphone was detected. Connect a microphone and try again, or upload an audio file instead.';
const MIC_BUSY_MESSAGE =
  'Your microphone could not be started — it may be in use by another app. Close other apps using it and try again.';
const INIT_FAILED_MESSAGE =
  'Recording could not be started on this device. You can still upload an audio file instead.';
const RUNTIME_ERROR_MESSAGE =
  'Recording stopped unexpectedly. Please try again, or upload an audio file instead.';

/** Maps a getUserMedia rejection onto a message the student can act on.
 * The DOMException names below are the ones the spec defines for
 * `getUserMedia`; anything else falls through to a generic init failure. */
function messageForGetUserMediaError(err: unknown): string {
  const name = err instanceof DOMException ? err.name : '';
  switch (name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError': // legacy alias
    case 'SecurityError':
      return MIC_DENIED_MESSAGE;
    case 'NotFoundError':
    case 'DevicesNotFoundError': // legacy alias
      return NO_MIC_MESSAGE;
    case 'NotReadableError':
    case 'TrackStartError': // legacy alias
      return MIC_BUSY_MESSAGE;
    default:
      return INIT_FAILED_MESSAGE;
  }
}

/** Feature detection, split so the UI can tell "this browser can't" apart from
 * "this page isn't on HTTPS". Checks the whole chain rather than just
 * `window.MediaRecorder`, which stays defined on insecure origins and so is
 * useless on its own as a support signal. */
function detectSupportIssue(): SupportIssue | null {
  if (typeof window === 'undefined') return 'unsupported';
  // `isSecureContext` is true for https:// and for localhost/127.0.0.1.
  if (window.isSecureContext === false) return 'insecure-context';
  if (!navigator.mediaDevices?.getUserMedia) return 'unsupported';
  if (typeof MediaRecorder === 'undefined') return 'unsupported';
  return null;
}

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

  const supportIssue = detectSupportIssue();
  const isSupported = supportIssue === null;

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
    if (supportIssue === 'insecure-context') {
      setError(
        'Recording needs a secure (HTTPS) connection. This page is served over plain HTTP, so the browser blocks microphone access.',
      );
      return;
    }
    if (supportIssue === 'unsupported') {
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
      // Fires when the recorder itself fails mid-capture (e.g. the device is
      // unplugged). Unlike a getUserMedia rejection this lands outside the
      // try/catch, so it needs its own teardown back to a usable idle state.
      recorder.onerror = () => {
        stopTimer();
        releaseStream();
        chunksRef.current = [];
        recorderRef.current = null;
        setElapsedSeconds(0);
        setStatus('idle');
        setError(RUNTIME_ERROR_MESSAGE);
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
    } catch (err) {
      setError(messageForGetUserMediaError(err));
      releaseStream();
    }
  }, [supportIssue, revokePreview, stop]);

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
    supportIssue,
    start,
    pause,
    resume,
    stop,
    reset,
  };
}
