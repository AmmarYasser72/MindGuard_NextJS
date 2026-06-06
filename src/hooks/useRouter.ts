"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter as useNextRouter } from "next/navigation";

type NavigateOptions = {
  replace?: boolean;
};

export function useRouter() {
  const nextRouter = useNextRouter();
  const path = usePathname() || "/";

  const back = useCallback(
    (fallbackPath?: string) => {
      if (window.history.length > 1) {
        nextRouter.back();
        return;
      }

      if (fallbackPath) {
        nextRouter.push(fallbackPath, { scroll: true });
      }
    },
    [nextRouter],
  );

  const navigate = useCallback(
    (nextPath: string, options: NavigateOptions = {}) => {
      if (options.replace) {
        nextRouter.replace(nextPath, { scroll: true });
      } else {
        nextRouter.push(nextPath, { scroll: true });
      }
    },
    [nextRouter],
  );

  return useMemo(
    () => ({
      back,
      navigate,
      path,
      refresh: nextRouter.refresh,
    }),
    [back, navigate, nextRouter.refresh, path],
  );
}
