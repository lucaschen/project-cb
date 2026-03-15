import { useCallback, useEffect } from "react";
import { useBeforeUnload, useBlocker } from "react-router-dom";

const useBuilderLeaveConfirmation = (shouldBlock: boolean) => {
  const blocker = useBlocker(shouldBlock);

  useEffect(() => {
    if (blocker.state !== "blocked") {
      return;
    }

    const shouldLeave = window.confirm(
      "You have unsaved builder changes. Leave without saving?",
    );

    if (shouldLeave) {
      blocker.proceed();
      return;
    }

    blocker.reset();
  }, [blocker]);

  useBeforeUnload(
    useCallback(
      (event) => {
        if (!shouldBlock) {
          return;
        }

        event.preventDefault();
      },
      [shouldBlock],
    ),
  );
};

export default useBuilderLeaveConfirmation;
