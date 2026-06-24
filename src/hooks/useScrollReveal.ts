import { useEffect, useRef } from "react";

/**
 * useScrollReveal — attach to a container div.
 * All children with class "reveal" will animate in
 * when they enter the viewport.
 */
export function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    // Observe all current .reveal children — and any added later
    // (product cards load async from Supabase, so they appear after mount).
    const observeAll = () => {
      container
        .querySelectorAll<HTMLElement>(".reveal:not(.in-view)")
        .forEach((el) => observer.observe(el));
    };
    observeAll();

    const mutationObserver = new MutationObserver(() => observeAll());
    mutationObserver.observe(container, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return ref;
}

/**
 * useRevealRef — single-element version.
 * Returns a ref to attach to any element.
 */
export function useRevealRef<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("in-view");
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
