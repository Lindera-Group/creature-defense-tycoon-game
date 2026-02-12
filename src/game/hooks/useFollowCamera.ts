import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const CAMERA_OFFSET = new THREE.Vector3(0, 8, 12);
const LERP_FACTOR = 0.08;

/**
 * Third-person follow camera that smoothly tracks a target position.
 */
export function useFollowCamera(targetRef: React.RefObject<THREE.Group | null>) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const desiredPos = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!targetRef.current) return;

    targetRef.current.getWorldPosition(targetPos.current);

    desiredPos.current.copy(targetPos.current).add(CAMERA_OFFSET);

    camera.position.lerp(desiredPos.current, LERP_FACTOR);
    camera.lookAt(targetPos.current);
  });
}
