"use client";

import { useRef, useEffect, useCallback, type RefObject } from "react";

type UseAutoScrollOptions = {
  smooth?: boolean;
  threshold?: number;
  disabled?: boolean;
  scrollRef: RefObject<HTMLDivElement | null>;
};

export function useAutoScroll(options: UseAutoScrollOptions) {
  const { smooth = true, threshold = 150, disabled = false, scrollRef } = options;

  const shouldAutoScrollRef = useRef(true);
  const lastScrollHeightRef = useRef(0);

  // ====================== SCROLL TO BOTTOM ======================
  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      const element = scrollRef.current;
      if (!element || disabled) return;

      element.scrollTo({
        top: element.scrollHeight - element.clientHeight,
        behavior: smooth && behavior === "smooth" ? "smooth" : "auto",
      });
    },
    [smooth, disabled, scrollRef] // scrollRef est stable car c'est une ref
  );

  // ====================== HANDLE MANUAL SCROLL ======================
  const handleScroll = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
    shouldAutoScrollRef.current = distanceFromBottom < threshold;
  }, [threshold, scrollRef]);

  // ====================== AUTO SCROLL ON CONTENT CHANGE ======================
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    if (shouldAutoScrollRef.current) {
      requestAnimationFrame(() => scrollToBottom("smooth"));
    }

    lastScrollHeightRef.current = element.scrollHeight;
  }, [scrollToBottom]); // On ne met plus scrollRef ici

  // ====================== SCROLL EVENT LISTENER ======================
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    element.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      element.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return {
    scrollToBottom,
    forceScrollToBottom: () => scrollToBottom("auto"),
    // Fonction safe pour lire l'état (évite l'accès direct à .current pendant le render)
    shouldAutoScroll: useCallback(() => shouldAutoScrollRef.current, []),
  };
}
