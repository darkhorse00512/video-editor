import { renderHook, act } from "@testing-library/react";
import { useAutosave } from "../../components/editor/version-7.0.0/hooks/use-autosave";
import {
  saveEditorState,
  loadEditorState,
  hasAutosave,
} from "../../components/editor/version-7.0.0/utils/indexdb-helper";

// Mock the indexdb helper functions
jest.mock("../../components/editor/version-7.0.0/utils/indexdb-helper", () => ({
  saveEditorState: jest.fn(),
  loadEditorState: jest.fn(),
  hasAutosave: jest.fn(),
}));

describe("useAutosave", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    jest.useRealTimers();
    consoleErrorSpy.mockRestore();
  });

  it("should check for existing autosave on mount", async () => {
    const mockTimestamp = Date.now();
    const onAutosaveDetected = jest.fn();
    (hasAutosave as jest.Mock).mockResolvedValue(mockTimestamp);

    renderHook(() => useAutosave("test-project", {}, { onAutosaveDetected }));

    // Wait for the effect to run
    await act(async () => {});

    expect(hasAutosave).toHaveBeenCalledWith("test-project");
    expect(onAutosaveDetected).toHaveBeenCalledWith(mockTimestamp);
  });

  it("should not check for autosave multiple times", async () => {
    const mockTimestamp = Date.now();
    const onAutosaveDetected = jest.fn();
    (hasAutosave as jest.Mock).mockResolvedValue(mockTimestamp);

    const { rerender } = renderHook(() =>
      useAutosave("test-project", {}, { onAutosaveDetected })
    );

    // Wait for the first effect to run
    await act(async () => {});

    expect(hasAutosave).toHaveBeenCalledTimes(1);
    expect(onAutosaveDetected).toHaveBeenCalledTimes(1);

    // Rerender should not trigger another check
    rerender();
    await act(async () => {});

    expect(hasAutosave).toHaveBeenCalledTimes(1);
    expect(onAutosaveDetected).toHaveBeenCalledTimes(1);
  });

  it("should handle case when onAutosaveDetected is not provided but autosave exists", async () => {
    const mockTimestamp = Date.now();
    (hasAutosave as jest.Mock).mockResolvedValue(mockTimestamp);

    renderHook(() => useAutosave("test-project", {}));

    // Wait for the effect to run
    await act(async () => {});

    expect(hasAutosave).toHaveBeenCalledWith("test-project");
    // Should not throw error even though onAutosaveDetected is not provided
  });

  it("should handle errors when checking for autosave", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    const onAutosaveDetected = jest.fn();
    (hasAutosave as jest.Mock).mockRejectedValue(new Error("Check failed"));

    renderHook(() => useAutosave("test-project", {}, { onAutosaveDetected }));

    // Wait for the effect to run
    await act(async () => {});

    expect(hasAutosave).toHaveBeenCalledWith("test-project");
    expect(onAutosaveDetected).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to check for autosave:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it("should cleanup interval timer on unmount", async () => {
    const state = { data: "test" };
    const { unmount } = renderHook(() =>
      useAutosave("test-project", state, { interval: 1000 })
    );

    // Fast forward 1 second
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(saveEditorState).toHaveBeenCalledTimes(1);

    // Unmount the hook
    unmount();

    // Fast forward another second
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    // Should not save after unmount
    expect(saveEditorState).toHaveBeenCalledTimes(1);
  });

  it("should autosave state at specified intervals when state changes", async () => {
    const initialState = { data: "initial" };
    const onSave = jest.fn();

    const { rerender } = renderHook(
      ({ state }) =>
        useAutosave("test-project", state, { interval: 1000, onSave }),
      { initialProps: { state: initialState } }
    );

    // Initial save should not happen immediately
    expect(saveEditorState).not.toHaveBeenCalled();

    // Fast forward 1 second
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(saveEditorState).toHaveBeenCalledWith("test-project", initialState);
    expect(onSave).toHaveBeenCalled();

    // Update state
    const newState = { data: "updated" };
    rerender({ state: newState });

    // Reset mock counts
    (saveEditorState as jest.Mock).mockClear();
    onSave.mockClear();

    // Fast forward another second
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(saveEditorState).toHaveBeenCalledWith("test-project", newState);
    expect(onSave).toHaveBeenCalled();
  });

  it("should not autosave if state has not changed", async () => {
    const state = { data: "test" };
    const onSave = jest.fn();

    renderHook(() =>
      useAutosave("test-project", state, { interval: 1000, onSave })
    );

    // Fast forward 1 second
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(saveEditorState).toHaveBeenCalledTimes(1);

    // Fast forward another second without state change
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    // Should not save again as state hasn't changed
    expect(saveEditorState).toHaveBeenCalledTimes(1);
  });

  it("should handle manual save and load operations", async () => {
    const state = { data: "test" };
    const savedState = { data: "saved" };
    const onLoad = jest.fn();

    (saveEditorState as jest.Mock).mockResolvedValue(true);
    (loadEditorState as jest.Mock).mockResolvedValue(savedState);

    const { result } = renderHook(() =>
      useAutosave("test-project", state, { onLoad })
    );

    // Test manual save
    await act(async () => {
      await result.current.saveState();
    });

    expect(saveEditorState).toHaveBeenCalledWith("test-project", state);

    // Test manual load
    await act(async () => {
      await result.current.loadState();
    });

    expect(loadEditorState).toHaveBeenCalledWith("test-project");
    expect(onLoad).toHaveBeenCalledWith(savedState);
  });

  it("should handle errors during save and load operations", async () => {
    const state = { data: "test" };
    const saveError = new Error("Save failed");
    const loadError = new Error("Load failed");

    (hasAutosave as jest.Mock).mockResolvedValue(null);
    (saveEditorState as jest.Mock).mockRejectedValue(saveError);
    (loadEditorState as jest.Mock).mockRejectedValue(loadError);

    const { result } = renderHook(() => useAutosave("test-project", state));

    // Clear any console errors from setup
    consoleErrorSpy.mockClear();

    // Test manual save error
    await act(async () => {
      const success = await result.current.saveState();
      expect(success).toBe(false);
    });

    // Test manual load error
    await act(async () => {
      const loadedState = await result.current.loadState();
      expect(loadedState).toBeNull();
    });

    // Verify error messages
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Manual save failed:",
      saveError
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith("Load failed:", loadError);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
  });

  it("should not start autosave if projectId is not provided", async () => {
    renderHook(() => useAutosave("", { data: "test" }, { interval: 1000 }));

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(saveEditorState).not.toHaveBeenCalled();
  });
});
