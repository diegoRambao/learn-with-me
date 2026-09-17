export type UnsavedChangesGuard = Readonly<{
  confirmNavigation(trigger?: HTMLElement): Promise<boolean>;
  setDirty(value: boolean): void;
  dispose(): void;
}>;

export const createUnsavedChangesGuard = (dialog: HTMLDialogElement): UnsavedChangesGuard => {
  let dirty = false;
  let returnTarget: HTMLElement | undefined;
  let resolveChoice: ((discard: boolean) => void) | undefined;
  const stayButton = dialog.querySelector<HTMLButtonElement>('[data-unsaved-stay]');
  const discardButton = dialog.querySelector<HTMLButtonElement>('[data-unsaved-discard]');
  const beforeUnload = (event: BeforeUnloadEvent): void => {
    if (!dirty) return;
    event.preventDefault();
    event.returnValue = '';
  };
  const finish = (discard: boolean): void => {
    if (discard) dirty = false;
    dialog.close();
    resolveChoice?.(discard);
    resolveChoice = undefined;
    returnTarget?.focus();
  };
  stayButton?.addEventListener('click', () => finish(false));
  discardButton?.addEventListener('click', () => finish(true));
  dialog.addEventListener('cancel', (event) => { event.preventDefault(); finish(false); });
  window.addEventListener('beforeunload', beforeUnload);
  return {
    confirmNavigation: (trigger) => {
      if (!dirty) return Promise.resolve(true);
      returnTarget = trigger;
      dialog.showModal();
      stayButton?.focus();
      return new Promise<boolean>((resolve) => { resolveChoice = resolve; });
    },
    setDirty: (value) => { dirty = value; },
    dispose: () => window.removeEventListener('beforeunload', beforeUnload),
  };
};
