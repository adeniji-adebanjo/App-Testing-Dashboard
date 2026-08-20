/**
 * Copies text to the clipboard, falling back to a hidden textarea +
 * document.execCommand when the async Clipboard API is unavailable — it is
 * undefined on insecure origins (plain http on a LAN address, for example),
 * which is where a silent `navigator.clipboard.writeText` would otherwise throw.
 *
 * Returns whether the copy succeeded so callers can show a manual-copy fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path below
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
