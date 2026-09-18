const storageKey = 'content-admin:categories-panel:v1';
const collapsedValue = 'collapsed';

const shell = document.querySelector<HTMLElement>('.admin-shell');
const toggle = document.querySelector<HTMLButtonElement>('#toggle-categories');

const readExpandedState = (): boolean => {
  try {
    return localStorage.getItem(storageKey) !== collapsedValue;
  } catch {
    return true;
  }
};

const saveExpandedState = (expanded: boolean): void => {
  try {
    localStorage.setItem(storageKey, expanded ? 'expanded' : collapsedValue);
  } catch {
    // The panel remains operable when browser storage is unavailable.
  }
};

if (shell && toggle) {
  const label = toggle.querySelector<HTMLElement>('[data-category-toggle-label]');
  const hideIcon = toggle.querySelector<SVGElement>('[data-category-toggle-icon="hide"]');
  const showIcon = toggle.querySelector<SVGElement>('[data-category-toggle-icon="show"]');

  const applyExpandedState = (expanded: boolean): void => {
    const accessibleLabel = expanded ? 'Ocultar categorías' : 'Mostrar categorías';
    shell.dataset.categoriesExpanded = String(expanded);
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.title = accessibleLabel;
    if (label) label.textContent = accessibleLabel;
    hideIcon?.classList.toggle('category-toggle-icon-hidden', !expanded);
    showIcon?.classList.toggle('category-toggle-icon-hidden', expanded);
  };

  applyExpandedState(readExpandedState());

  toggle.addEventListener('click', () => {
    const expanded = shell.dataset.categoriesExpanded !== 'true';
    applyExpandedState(expanded);
    saveExpandedState(expanded);
    toggle.focus();
  });
}
