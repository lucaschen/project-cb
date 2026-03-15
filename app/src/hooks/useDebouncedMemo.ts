import { useEffect, useRef, useState } from "react";

const useDebouncedMemo = <CallbackReturn>(
  callback: () => CallbackReturn,
  dependencies: unknown[],
  milisecondsDelay: number,
) => {
  const timeoutRef = useRef(0);
  const isFirstRender = useRef(true);
  const [returnValue, setReturnValue] = useState(callback);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setReturnValue(callback());
    }, milisecondsDelay);

    return () => clearTimeout(timeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [milisecondsDelay, ...dependencies]);

  return returnValue;
};

export default useDebouncedMemo;
