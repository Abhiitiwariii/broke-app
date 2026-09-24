/**
 * Sharing helpers. On mobile, the native share sheet can hand the PNG straight
 * to WhatsApp; where that's unavailable we fall back to a wa.me text link.
 */

export type ShareResult = 'shared' | 'whatsapp' | 'unsupported'

/** App URL to attach to shares (origin of the deployed PWA). */
export function appUrl(): string {
  try {
    return window.location.origin
  } catch {
    return ''
  }
}

async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const blob = await (await fetch(dataUrl)).blob()
  return new File([blob], filename, { type: blob.type || 'image/png' })
}

/**
 * Try to share an image + caption via the native sheet (WhatsApp appears there);
 * if the browser can't share files, open WhatsApp with the caption + link.
 * Returns which path was taken. A deliberate user-cancel counts as 'shared'.
 */
export async function shareImage(opts: {
  dataUrl?: string
  text: string
  url?: string
  filename?: string
  title?: string
}): Promise<ShareResult> {
  const { dataUrl, text, url = appUrl(), filename = 'broke.png', title = 'Broke?' } = opts

  if (dataUrl && typeof navigator !== 'undefined' && navigator.canShare) {
    try {
      const file = await dataUrlToFile(dataUrl, filename)
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text, title })
        return 'shared'
      }
    } catch (e) {
      // User dismissed the sheet — respect that, don't also open WhatsApp.
      if (e instanceof Error && e.name === 'AbortError') return 'shared'
    }
  }

  return openWhatsApp(text, url)
}

/** Open WhatsApp with a prefilled caption + link (text only). */
export function openWhatsApp(text: string, url: string = appUrl()): ShareResult {
  const msg = url ? `${text} ${url}` : text
  try {
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener')
    return 'whatsapp'
  } catch {
    return 'unsupported'
  }
}
