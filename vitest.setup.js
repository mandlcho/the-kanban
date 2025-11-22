import "@testing-library/jest-dom/vitest";

// Ensure localStorage is available in the test environment.
if (
  typeof window !== "undefined" &&
  (!window.localStorage || typeof window.localStorage.clear !== "function")
) {
  const store = new Map();
  window.localStorage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(String(key), String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear()
  };
}
