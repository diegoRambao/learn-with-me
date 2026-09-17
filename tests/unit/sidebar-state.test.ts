import { describe, expect, it } from 'vitest';
import { createSidebarVisitState, parseSidebarVisitState, restoreSidebarVisitState, toggleSidebarVisibility } from '../../src/lib/sidebar-state';

const knownTopicIds = ['basics', 'advanced'] as const;

describe('sidebar visit state', () => {
  it('uses safe immutable defaults for absent or corrupt state', () => {
    expect(createSidebarVisitState('basics')).toEqual({ visible: true, expandedTopicIds: ['basics'], navigationScrollTop: 0 });
    expect(parseSidebarVisitState(null, knownTopicIds)).toBeNull();
    expect(parseSidebarVisitState('{broken', knownTopicIds)).toBeNull();
  });

  it('sanitizes values and removes unknown or duplicate topics', () => {
    expect(parseSidebarVisitState(JSON.stringify({
      visible: false,
      expandedTopicIds: ['advanced', 'unknown', 'advanced'],
      navigationScrollTop: -4,
    }), knownTopicIds)).toEqual({ visible: false, expandedTopicIds: ['advanced'], navigationScrollTop: 0 });
  });

  it('restores the active topic without closing existing topics', () => {
    const stored = { visible: false, expandedTopicIds: ['advanced'], navigationScrollTop: 12 } as const;
    expect(restoreSidebarVisitState(stored, 'basics', knownTopicIds).expandedTopicIds).toEqual(['advanced', 'basics']);
    expect(toggleSidebarVisibility(stored)).toEqual({ ...stored, visible: true });
    expect(stored.visible).toBe(false);
  });
});
