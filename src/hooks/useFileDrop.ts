import { useCallback, useState, type DragEvent } from 'react';

/**
 * Wires native HTML5 drag-and-drop onto a drop target. Spread `dropHandlers` onto the
 * element that should accept a dropped file; `isDragging` flags while a file is being
 * dragged over it, for a highlight style. Only the first dropped file is used — these
 * upload zones (a single voice note, a single homework attachment slot) never take more.
 */
export function useFileDrop(onFile: (file: File) => void) {
  const [isDragging, setIsDragging] = useState(false);

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('Files')) setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) onFile(file);
    },
    [onFile],
  );

  return { isDragging, dropHandlers: { onDragOver, onDragLeave, onDrop } };
}
