export type SidebarVisitState = Readonly<{
  visible: boolean;
  expandedTopicIds: ReadonlyArray<string>;
  navigationScrollTop: number;
}>;

const sanitizeTopicIds = (value: unknown, knownTopicIds: ReadonlyArray<string>): ReadonlyArray<string> => {
  if (!Array.isArray(value)) return [];
  const known = new Set(knownTopicIds);
  return [...new Set(value.filter((id): id is string => typeof id === 'string' && known.has(id)))];
};

const sanitizeScrollTop = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;

export const createSidebarVisitState = (activeTopicId?: string | null): SidebarVisitState => ({
  visible: true,
  expandedTopicIds: activeTopicId ? [activeTopicId] : [],
  navigationScrollTop: 0,
});

export const parseSidebarVisitState = (
  serialized: string | null,
  knownTopicIds: ReadonlyArray<string>,
): SidebarVisitState | null => {
  if (!serialized) return null;
  try {
    const value = JSON.parse(serialized) as Record<string, unknown>;
    if (typeof value !== 'object' || value === null || typeof value.visible !== 'boolean') return null;
    return {
      visible: value.visible,
      expandedTopicIds: sanitizeTopicIds(value.expandedTopicIds, knownTopicIds),
      navigationScrollTop: sanitizeScrollTop(value.navigationScrollTop),
    };
  } catch {
    return null;
  }
};

export const restoreSidebarVisitState = (
  storedState: SidebarVisitState | null,
  activeTopicId: string | null | undefined,
  knownTopicIds: ReadonlyArray<string>,
): SidebarVisitState => {
  const base = storedState ?? createSidebarVisitState();
  const expandedTopicIds = sanitizeTopicIds(base.expandedTopicIds, knownTopicIds);
  return {
    ...base,
    expandedTopicIds: activeTopicId && knownTopicIds.includes(activeTopicId)
      ? [...new Set([...expandedTopicIds, activeTopicId])]
      : expandedTopicIds,
    navigationScrollTop: sanitizeScrollTop(base.navigationScrollTop),
  };
};

export const toggleSidebarVisibility = (state: SidebarVisitState): SidebarVisitState => ({
  ...state,
  visible: !state.visible,
});
