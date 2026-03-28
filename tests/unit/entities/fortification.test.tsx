import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Canvas } from "@react-three/fiber";
import { Fortification } from "@game/entities/Fortification";

describe("Fortification Entity", () => {
  const defaultProps = {
    id: "fort_1",
    type: "wooden_fence" as const,
    position: [0, 0, 0] as [number, number, number],
    health: 100,
  };

  it("should render wooden fence without errors", () => {
    const { container } = render(
      <Canvas>
        <Fortification {...defaultProps} />
      </Canvas>,
    );
    expect(container.querySelector("canvas")).toBeTruthy();
  });

  it("should render stone wall without errors", () => {
    const { container } = render(
      <Canvas>
        <Fortification {...defaultProps} type="stone_wall" health={500} />
      </Canvas>,
    );
    expect(container.querySelector("canvas")).toBeTruthy();
  });

  it("should render watchtower without errors", () => {
    const { container } = render(
      <Canvas>
        <Fortification {...defaultProps} type="watchtower" health={300} />
      </Canvas>,
    );
    expect(container.querySelector("canvas")).toBeTruthy();
  });

  it("should render fort without errors", () => {
    const { container } = render(
      <Canvas>
        <Fortification {...defaultProps} type="fort" health={2000} />
      </Canvas>,
    );
    expect(container.querySelector("canvas")).toBeTruthy();
  });

  it("should render castle without errors", () => {
    const { container } = render(
      <Canvas>
        <Fortification {...defaultProps} type="castle" health={5000} />
      </Canvas>,
    );
    expect(container.querySelector("canvas")).toBeTruthy();
  });

  it("should render mega_fortress without errors", () => {
    const { container } = render(
      <Canvas>
        <Fortification {...defaultProps} type="mega_fortress" health={10000} />
      </Canvas>,
    );
    expect(container.querySelector("canvas")).toBeTruthy();
  });

  it("should render at specified position", () => {
    const position: [number, number, number] = [5, 0, 10];
    const { container } = render(
      <Canvas>
        <Fortification {...defaultProps} position={position} />
      </Canvas>,
    );
    expect(container.querySelector("canvas")).toBeTruthy();
  });
});
