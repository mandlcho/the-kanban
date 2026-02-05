import { useState, useEffect, useCallback } from "react";

const MOBILE_BREAKPOINT = 640;

function isMobile() {
  return (
    typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT
  );
}

export function useViewMode() {
  const [viewMode, setViewMode] = useState(() =>
    isMobile() ? "card" : "list",
  );

  useEffect(() => {
    const handleResize = () => {
      setViewMode((prev) => {
        const mobile = isMobile();
        if (mobile && prev === "list") return "card";
        if (!mobile && prev === "card") return "list";
        return prev;
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const setViewModeExplicit = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  return { viewMode, setViewMode: setViewModeExplicit };
}
