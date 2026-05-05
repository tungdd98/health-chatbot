import { describe, expect, it } from 'vitest';
import { theme } from './theme';

describe('theme', () => {
  it('exposes a primary color', () => {
    expect(theme.palette.primary.main).toBe('#1976d2');
  });

  it('exposes a secondary color', () => {
    expect(theme.palette.secondary.main).toBe('#dc004e');
  });
});
