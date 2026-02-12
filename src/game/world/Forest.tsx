import { Ground } from "./Ground";
import { Trees } from "./Trees";
import { ForestLighting } from "./ForestLighting";
import { FOREST_CONFIG } from "./forestHelpers";

export function Forest() {
  return (
    <>
      <color attach="background" args={[FOREST_CONFIG.skyColor]} />
      <fog attach="fog" args={[FOREST_CONFIG.skyColor, 30, 60]} />
      <ForestLighting />
      <Ground />
      <Trees />
    </>
  );
}
