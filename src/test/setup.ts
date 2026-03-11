import '@testing-library/jest-dom/vitest'

// ResizeObserver mock for jsdom
;(globalThis as Record<string, unknown>).ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
