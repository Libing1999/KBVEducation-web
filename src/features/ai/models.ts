import type { AiModelOption } from '@/features/ai/types/ai.types';

/** Offered when the server's model list cannot be loaded (the models named in the memos). */
export const FALLBACK_MODELS: { claude: AiModelOption[]; gemini: AiModelOption[] } = {
  claude: [
    { id: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5' },
    { id: 'claude-opus-5-5', label: 'Claude Opus 5.5' },
    { id: 'claude-haiku-5-5', label: 'Claude Haiku 5.5' },
  ],
  gemini: [
    { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash' },
    { id: 'gemini-3.5-transcribe', label: 'Gemini 3.5 Transcribe' },
  ],
};
