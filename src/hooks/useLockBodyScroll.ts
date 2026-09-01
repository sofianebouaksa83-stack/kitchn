import { useEffect } from "react";

export function useLockBodyScroll(
  locked: boolean,
  lockTouch = false
) {
  useEffect(() => {
    if (!locked) return;

    const previousDocumentOverflow =
      document.documentElement.style.overflow;
    const previousBodyOverflow =
      document.body.style.overflow;
    const previousTouchAction =
      document.body.style.touchAction;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    if (lockTouch) {
      document.body.style.touchAction = "none";
    }

    return () => {
      document.documentElement.style.overflow =
        previousDocumentOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, [locked, lockTouch]);
}
