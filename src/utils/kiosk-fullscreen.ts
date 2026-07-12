export const KIOSK_FULLSCREEN_KEY = 'kiosk-request-fullscreen';

export function markKioskFullscreenRequest() {
  sessionStorage.setItem(KIOSK_FULLSCREEN_KEY, '1');
}

export function consumeKioskFullscreenRequest() {
  const value = sessionStorage.getItem(KIOSK_FULLSCREEN_KEY);
  if (value) sessionStorage.removeItem(KIOSK_FULLSCREEN_KEY);
  return value === '1';
}

export async function enterKioskFullscreen() {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    }
    return true;
  } catch {
    return false;
  }
}

export async function exitKioskFullscreen() {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  } catch {
    // ignore
  }
}
