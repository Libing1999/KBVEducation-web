import { Mic, Pause, Play, Square, Trash2, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useVoiceRecorder } from '@/features/reflections/hooks/useVoiceRecorder';

function formatTimer(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function VoiceRecorder({ onRecorded }: { onRecorded: (file: File) => void }) {
  const recorder = useVoiceRecorder();

  if (!recorder.isSupported) {
    return (
      <p className="text-xs text-slate-400">Voice recording isn't supported in this browser — you can still upload an audio file.</p>
    );
  }

  if (recorder.status === 'stopped' && recorder.audioFile && recorder.previewUrl) {
    return (
      <div className="space-y-2">
        <audio controls src={recorder.previewUrl} className="h-10 w-full max-w-md" />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              onRecorded(recorder.audioFile!);
              recorder.reset();
            }}
          >
            Use this recording
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => recorder.reset()}>
            <RotateCcw className="h-4 w-4" /> Record again
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => recorder.reset()}>
            <Trash2 className="h-4 w-4 text-red-500" /> Delete
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {recorder.status === 'idle' && (
          <Button type="button" variant="secondary" size="sm" onClick={() => recorder.start()}>
            <Mic className="h-4 w-4" /> Start recording
          </Button>
        )}
        {recorder.status === 'recording' && (
          <>
            <Button type="button" variant="outline" size="sm" onClick={() => recorder.pause()}>
              <Pause className="h-4 w-4" /> Pause
            </Button>
            <Button type="button" variant="danger" size="sm" onClick={() => recorder.stop()}>
              <Square className="h-4 w-4" /> Stop
            </Button>
          </>
        )}
        {recorder.status === 'paused' && (
          <>
            <Button type="button" variant="secondary" size="sm" onClick={() => recorder.resume()}>
              <Play className="h-4 w-4" /> Resume
            </Button>
            <Button type="button" variant="danger" size="sm" onClick={() => recorder.stop()}>
              <Square className="h-4 w-4" /> Stop
            </Button>
          </>
        )}
        {(recorder.status === 'recording' || recorder.status === 'paused') && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium tabular-nums text-slate-700">
            <span className={recorder.status === 'recording' ? 'h-2 w-2 animate-pulse rounded-full bg-red-500' : 'h-2 w-2 rounded-full bg-slate-400'} aria-hidden />
            {formatTimer(recorder.elapsedSeconds)}
          </span>
        )}
      </div>

      {recorder.error && (
        <p className="flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {recorder.error}
        </p>
      )}
    </div>
  );
}
