export function EstimateFontSize({ parent, className }: { parent?: HTMLElement; className?: string }): {
  width: number;
  height: number;
} {
  parent = parent || document.body; // Default to body if no parent provided

  const el = document.createElement("span");
  // el.style.display = "none"; // Hide the element to avoid layout issues
  if (className) {
    el.className = className;
  }
  el.innerText = "Abcdefg";

  parent.appendChild(el);
  const width = el.offsetWidth / el.innerText.length; // Average width per character
  const height = el.offsetHeight;
  parent.removeChild(el);

  console.debug("Estimated font size:", { width, height });

  return { width, height };
}
