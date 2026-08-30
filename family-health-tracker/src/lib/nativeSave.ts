// Saving a file from inside the app's WebView. A plain <a download> on a
// data: URL is unreliable in a packaged Capacitor WebView (there's no
// browser download manager to catch it), so on-device we write the file
// directly to storage instead: images go straight into the device's photo
// gallery (their own app-scoped album), everything else goes into the
// app's Documents folder on the device. No share sheet, no picking an app
// or contact — the file is just there. In a plain browser (local dev,
// testing) we fall back to the normal anchor-download approach.
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Media } from "@capacitor-community/media";
import { Toast } from "@capacitor/toast";

const ALBUM_NAME = "Family Health Tracker";

function dataUrlToBase64(dataUrl: string): string {
  return dataUrl.slice(dataUrl.indexOf(",") + 1);
}

function mimeFromDataUrl(dataUrl: string): string {
  return dataUrl.slice(5, dataUrl.indexOf(";"));
}

function downloadInBrowser(dataUrl: string, fileName: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function toast(text: string): Promise<void> {
  try {
    await Toast.show({ text, duration: "short" });
  } catch {
    // best-effort only — a missing toast isn't worth failing the save over
  }
}

async function ensureAlbum(): Promise<string> {
  try {
    await Media.createAlbum({ name: ALBUM_NAME });
  } catch {
    // already exists — that's fine, we just need its path below
  }
  const { path } = await Media.getAlbumsPath();
  return `${path}/${ALBUM_NAME}`;
}

async function saveImageToGallery(dataUrl: string, fileName: string): Promise<void> {
  const albumIdentifier = await ensureAlbum();
  await Media.savePhoto({ path: dataUrl, albumIdentifier, fileName: fileName.replace(/\.[^./]+$/, "") });
  await toast(`Saved to Photos (${ALBUM_NAME} album)`);
}

async function saveDocumentToDevice(dataUrl: string, fileName: string): Promise<void> {
  const base64 = dataUrlToBase64(dataUrl);
  await Filesystem.writeFile({ path: fileName, data: base64, directory: Directory.Documents });
  await toast("Saved to your device's Documents");
}

/** Saves a file straight to the device — images go to the photo gallery,
 * everything else to the Documents folder. Nothing is shared or uploaded. */
export async function saveFile(dataUrl: string, fileName: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    downloadInBrowser(dataUrl, fileName);
    return;
  }
  if (mimeFromDataUrl(dataUrl).startsWith("image/")) {
    await saveImageToGallery(dataUrl, fileName);
  } else {
    await saveDocumentToDevice(dataUrl, fileName);
  }
}
