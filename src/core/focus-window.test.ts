import { Component } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { bringWindowUp, windowHasFocus } from './focus';

// The focus layer's questions about a component's browser window.

afterEach(() => vi.restoreAllMocks());

describe('windowHasFocus and bringWindowUp', () => {
  it("answer from the component's window and bring it up only when it has no focus", () => {
    const c = new Component('div');
    const focus = vi.spyOn(window, 'focus').mockImplementation(() => {});
    const has = vi.spyOn(document, 'hasFocus').mockReturnValue(true);
    expect(windowHasFocus(c)).toBe(true);
    bringWindowUp(c);
    expect(focus).not.toHaveBeenCalled();
    has.mockReturnValue(false);
    expect(windowHasFocus(c)).toBe(false);
    bringWindowUp(c);
    expect(focus).toHaveBeenCalledTimes(1);
  });
});
