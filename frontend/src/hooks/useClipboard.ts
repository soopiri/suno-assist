import { useState, useCallback } from "react";

export function useClipboard(timeout = 2000) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = useCallback(
    async (text: string, key?: string) => {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key ?? "default");
      setTimeout(() => setCopiedKey(null), timeout);
    },
    [timeout]
  );

  return { copiedKey, copy };
}
