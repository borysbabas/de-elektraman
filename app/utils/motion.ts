export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

// TransitionGroup @before-leave: pin a leaving item where it is so the items around it can slide into its place
export const pinLeaving = (el: Element) => {
  const item = el as HTMLElement
  const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = item
  Object.assign(item.style, {
    position: 'absolute',
    left: `${offsetLeft}px`,
    top: `${offsetTop}px`,
    width: `${offsetWidth}px`,
    height: `${offsetHeight}px`
  })
}

// The macOS "no" for a rejected password; restarts cleanly when triggered again
export const shake = (el: Element | null | undefined) => {
  if (!el || prefersReducedMotion()) return
  el.animate(
    [0, -8, 7, -5, 3, 0].map(x => ({ transform: `translateX(${x}px)` })),
    { duration: 420, easing: 'ease-out' }
  )
}
