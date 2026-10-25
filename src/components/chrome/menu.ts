/**
 * Place a header popover under the button that opened it, aligned to the
 * button's start or end edge and kept inside the viewport.
 */
export function placeMenu(button: HTMLElement, menu: HTMLElement, align: 'start' | 'end'): void {
  const rect = button.getBoundingClientRect();
  const gutter = 12;
  const width = menu.offsetWidth;
  const left =
    align === 'end'
      ? Math.min(rect.right, window.innerWidth - gutter) - width
      : Math.min(rect.left, window.innerWidth - gutter - width);
  menu.style.left = `${Math.max(gutter, left)}px`;
  menu.style.top = `${rect.bottom + 6}px`;
}
