import { vi } from "vitest";

// Mock WebGL/Three.js context for jsdom environment
vi.mock("three", async () => {
  const actual = await vi.importActual<typeof import("three")>("three");
  return {
    ...actual,
  };
});

// Silence R3F Canvas warnings in test environment
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
