import { useState, useEffect } from "react";

export function useMinimumLoading(isLoading: boolean, minimumTime = 1000) {
  const [showLoader, setShowLoader] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      if (!loadingStartTime) {
        setLoadingStartTime(Date.now());
      }
      setShowLoader(true);
    } else if (loadingStartTime) {
      const elapsedTime = Date.now() - loadingStartTime;
      const remainingTime = Math.max(0, minimumTime - elapsedTime);

      if (remainingTime > 0) {
        const timer = setTimeout(() => {
          setShowLoader(false);
          setLoadingStartTime(null);
        }, remainingTime);
        return () => clearTimeout(timer);
      } else {
        setShowLoader(false);
        setLoadingStartTime(null);
      }
    }
  }, [isLoading, loadingStartTime, minimumTime]);

  return showLoader;
}
