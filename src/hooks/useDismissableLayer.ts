import { useEffect } from "react";
import type { RefObject } from "react";

type DismissableLayerOptions = {
  active: boolean;
  onDismiss: () => void;
  ref: RefObject<HTMLElement | null>;
};

export function useDismissableLayer({ active, onDismiss, ref }: DismissableLayerOptions) {
  useEffect(() => {
    if (!active) return undefined;

    function closeOnOutside(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        onDismiss();
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onDismiss();
      }
    }

    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [active, onDismiss, ref]);
}
