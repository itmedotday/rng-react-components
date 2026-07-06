import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ForwardedRef,
} from 'react';

export interface UseGameTriggerOptions<Handle extends object> {
  disabled?: boolean;
  request?: number;
  onBusyChange?: (busy: boolean) => void;
  execute: () => void;
  handle: Handle;
  clearTimers?: () => void;
}

export function useGameTrigger<Handle extends object>(
  ref: ForwardedRef<Handle>,
  {
    disabled = false,
    request,
    onBusyChange,
    execute,
    handle,
    clearTimers,
  }: UseGameTriggerOptions<Handle>,
) {
  const isBusyRef = useRef(false);
  const [isBusy, setIsBusyState] = useState(false);
  const prevRequestRef = useRef(request);

  const setBusy = useCallback(
    (value: boolean) => {
      isBusyRef.current = value;
      setIsBusyState(value);
      onBusyChange?.(value);
    },
    [onBusyChange],
  );

  const guardExecute = useCallback(() => {
    if (isBusyRef.current || disabled) {
      return false;
    }
    return true;
  }, [disabled]);

  useEffect(() => () => clearTimers?.(), [clearTimers]);

  useImperativeHandle(ref, () => handle, [handle]);

  useEffect(() => {
    if (request === undefined) return;
    if (prevRequestRef.current === request) return;
    prevRequestRef.current = request;
    execute();
  }, [request, execute]);

  return { isBusy, isBusyRef, setBusy, guardExecute };
}
