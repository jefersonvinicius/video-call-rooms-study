import { useCallback, useState } from 'react';

export function useForceUpdate() {
  const [key, setKey] = useState(0);

  const forceUpdate = useCallback(() => {
    setKey((old) => old + 1);
  }, []);

  return { key, forceUpdate };
}
