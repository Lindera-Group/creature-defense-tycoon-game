import { useEffect, useRef } from "react";
import type { KeyboardInput } from "@game/entities/playerHelpers";

/**
 * Track WASD + Arrow key state for player movement.
 * Returns a ref that is always current (no re-renders on keypress).
 */
export function useKeyboardInput() {
  const keys = useRef<KeyboardInput>({ w: false, a: false, s: false, d: false });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          keys.current.w = true;
          break;
        case "KeyA":
        case "ArrowLeft":
          keys.current.a = true;
          break;
        case "KeyS":
        case "ArrowDown":
          keys.current.s = true;
          break;
        case "KeyD":
        case "ArrowRight":
          keys.current.d = true;
          break;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          keys.current.w = false;
          break;
        case "KeyA":
        case "ArrowLeft":
          keys.current.a = false;
          break;
        case "KeyS":
        case "ArrowDown":
          keys.current.s = false;
          break;
        case "KeyD":
        case "ArrowRight":
          keys.current.d = false;
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return keys;
}
