/**
 * Get the current breakpoint of the user's screen.
 *
 * @returns – The current breakpoint, one of "xl", "lg", "md", or "sm".
 */
export function getBreakpoint(): "xl" | "lg" | "md" | "sm" {
  if (window.matchMedia("(min-width: 1280px)").matches) {
    return "xl";
  } else if (window.matchMedia("(min-width: 1024px)").matches) {
    return "lg";
  } else if (window.matchMedia("(min-width: 768px)").matches) {
    return "md";
  } else {
    return "sm";
  }
}
