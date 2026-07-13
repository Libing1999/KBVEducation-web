import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { lessonsApi } from '@/features/lessons/api/lessonsApi';
import { QUERY_KEYS } from '@/config/constants';
import { getErrorMessage } from '@/lib/utils';

const filesKey = (lessonId: string) => [...QUERY_KEYS.lessons, 'files', lessonId];

export function useLessonFiles(lessonId: string | undefined) {
  return useQuery({
    queryKey: filesKey(lessonId as string),
    queryFn: () => lessonsApi.listFiles(lessonId as string),
    enabled: !!lessonId,
  });
}

export function useLessonFileMutations(lessonId: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: filesKey(lessonId) });
    qc.invalidateQueries({ queryKey: QUERY_KEYS.lessons });
  };
  const onError = (e: unknown) => toast.error(getErrorMessage(e));

  const upload = useMutation({
    mutationFn: (files: File[]) => lessonsApi.uploadFiles(lessonId, files),
    onSuccess: (res) => { invalidate(); toast.success(`${res.length} file(s) uploaded`); },
    onError,
  });

  const remove = useMutation({
    mutationFn: (fileId: string) => lessonsApi.removeFile(lessonId, fileId),
    onSuccess: () => { invalidate(); toast.success('File deleted'); },
    onError,
  });

  return { upload, remove };
}
