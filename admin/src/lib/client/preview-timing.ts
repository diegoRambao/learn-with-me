export const PREVIEW_DEBOUNCE_MILLISECONDS = 300;

export type PreviewTimerHost = Readonly<{
  clearTimeout(handle: number | undefined): void;
  setTimeout(callback: () => void, delay: number): number;
}>;

export const schedulePreviewRefresh = (
  timerHost: PreviewTimerHost,
  currentTimer: number | undefined,
  refresh: () => void,
): number => {
  timerHost.clearTimeout(currentTimer);
  return timerHost.setTimeout(refresh, PREVIEW_DEBOUNCE_MILLISECONDS);
};
