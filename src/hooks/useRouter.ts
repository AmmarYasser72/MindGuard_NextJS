"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter as useNextRouter } from "next/navigation";

type NavigateOptions = {
  replace?: boolean;
};

export function useRouter() {
  const nextRouter = useNextRouter();
  const path = usePathname() || "/";

  const navigate = useCallback((nextPath: string, options: NavigateOptions = {}) => {
    if (options.replace) {
      nextRouter.replace(nextPath, { scroll: true });
    } else {
      nextRouter.push(nextPath, { scroll: true });
    }
  }, [nextRouter]);

  return useMemo(() => ({
    back: nextRouter.back,
    navigate,
    path,
    refresh: nextRouter.refresh,
  }), [navigate, nextRouter.back, nextRouter.refresh, path]);
}
