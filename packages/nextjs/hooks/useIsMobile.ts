import { useEffect, useState } from "react";

export const useIsMobile = (maxWidth: `${string}px` = "640px") => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia(`(max-width: ${maxWidth})`);
      setIsMobile(mediaQuery.matches);

      const handleResize = () => setIsMobile(mediaQuery.matches);
      mediaQuery.addEventListener("change", handleResize);
      return () => mediaQuery.removeEventListener("change", handleResize);
    }
  }, [maxWidth]);

  return isMobile;
};
