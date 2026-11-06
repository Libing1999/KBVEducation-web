import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { AiModelOption } from '@/features/ai/types/ai.types';

const OTHER = '__other__';

/**
 * Model picker for the AI settings: the models the provider currently offers, plus "Other…"
 * to type a name that is not listed yet. The saved model always stays in the list, so a
 * setting never silently changes because a provider dropped a model from its list.
 */
export function ModelSelect({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: AiModelOption[];
  className?: string;
}) {
  const known = options.some((o) => o.id === value);
  const [custom, setCustom] = useState(false);

  // A saved value that the provider does not list is shown as its own option, not as "Other".
  useEffect(() => {
    if (known) setCustom(false);
  }, [known]);

  const list = known || !value || custom ? options : [{ id: value, label: value, current: true }, ...options];

  return (
    <div className={className}>
      <Select
        value={custom ? OTHER : value}
        onChange={(e) => {
          if (e.target.value === OTHER) {
            setCustom(true);
          } else {
            setCustom(false);
            onChange(e.target.value);
          }
        }}
      >
        {list.map((o: AiModelOption & { current?: boolean }) => (
          <option key={o.id} value={o.id}>
            {o.label === o.id ? o.id : `${o.label} (${o.id})`}
            {o.current ? ' (current)' : ''}
          </option>
        ))}
        <option value={OTHER}>Other… (type a model name)</option>
      </Select>
      {custom && (
        <Input
          className="mt-2"
          autoFocus
          placeholder="e.g. claude-sonnet-5-5"
          value={value}
          onChange={(e) => onChange(e.target.value.trim())}
        />
      )}
    </div>
  );
}
