import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  computeCameraOffset,
  clampZoom,
  clampElevation,
  CAMERA_DEFAULTS,
} from "@game/systems/cameraHelpers";

const LERP_FACTOR = 0.08;

/**
 * Third-person follow camera with zoom and orbit controls.
 * - Scroll mouse wheel to zoom in/out
 * - Hold right mouse button + drag to orbit around player
 * - Q/E keys to rotate camera left/right
 * - Smoothly follows player when not orbiting
 *
 * Returns the azimuth ref so player movement can be camera-relative.
 */
export function useFollowCamera(
  targetRef: React.RefObject<THREE.Group | null>,
): React.MutableRefObject<number> {
  const { camera, gl } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const desiredPos = useRef(new THREE.Vector3());

  // Spherical camera state
  const distance = useRef<number>(CAMERA_DEFAULTS.defaultDistance);
  const azimuth = useRef<number>(CAMERA_DEFAULTS.defaultAzimuth);
  const elevation = useRef<number>(CAMERA_DEFAULTS.defaultElevation);
  const isOrbiting = useRef(false);
  const lastMouseX = useRef(0);
  const lastMouseY = useRef(0);

  // Q/E keyboard orbit state
  const orbitKeys = useRef({ q: false, e: false });

  // Mouse + keyboard event handlers
  useEffect(() => {
    const canvas = gl.domElement;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      distance.current = clampZoom(
        distance.current +
          (e.deltaY > 0 ? CAMERA_DEFAULTS.zoomSpeed : -CAMERA_DEFAULTS.zoomSpeed),
      );
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2) {
        // Right mouse button
        isOrbiting.current = true;
        lastMouseX.current = e.clientX;
        lastMouseY.current = e.clientY;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isOrbiting.current) return;
      const deltaX = e.clientX - lastMouseX.current;
      const deltaY = e.clientY - lastMouseY.current;
      lastMouseX.current = e.clientX;
      lastMouseY.current = e.clientY;

      azimuth.current += deltaX * CAMERA_DEFAULTS.orbitSpeed;
      elevation.current = clampElevation(
        elevation.current + deltaY * CAMERA_DEFAULTS.orbitSpeed,
      );
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 2) {
        isOrbiting.current = false;
      }
    };

    const handleContextMenu = (e: Event) => {
      e.preventDefault(); // Prevent right-click context menu
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyQ") orbitKeys.current.q = true;
      if (e.code === "KeyE") orbitKeys.current.e = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "KeyQ") orbitKeys.current.q = false;
      if (e.code === "KeyE") orbitKeys.current.e = false;
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gl]);

  useFrame((_, delta) => {
    if (!targetRef.current) return;

    // Apply Q/E keyboard orbit
    if (orbitKeys.current.q) {
      azimuth.current -= CAMERA_DEFAULTS.keyboardOrbitSpeed * delta;
    }
    if (orbitKeys.current.e) {
      azimuth.current += CAMERA_DEFAULTS.keyboardOrbitSpeed * delta;
    }

    targetRef.current.getWorldPosition(targetPos.current);

    const [ox, oy, oz] = computeCameraOffset(
      distance.current,
      azimuth.current,
      elevation.current,
    );
    desiredPos.current.set(
      targetPos.current.x + ox,
      targetPos.current.y + oy,
      targetPos.current.z + oz,
    );

    camera.position.lerp(desiredPos.current, LERP_FACTOR);
    camera.lookAt(targetPos.current);
  });

  return azimuth;
}
