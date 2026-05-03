import { beforeEach, describe, expect, it } from 'vitest';

import { useUiStore } from './uiStore';

beforeEach(() => useUiStore.setState({ sidebarOpen: false }));

describe('uiStore', () => {
  it('defaults sidebarOpen to false', () => {
    expect(useUiStore.getState().sidebarOpen).toBe(false);
  });

  it('toggleSidebar flips sidebarOpen', () => {
    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().sidebarOpen).toBe(true);
    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().sidebarOpen).toBe(false);
  });
});
