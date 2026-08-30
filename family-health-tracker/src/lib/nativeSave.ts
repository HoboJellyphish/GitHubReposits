// Saving a file from inside the app's WebView. A plain <a download> on a
// data: URL is unreliable in a packaged Capacitor WebView (there's no
// browser download manager to catch it) — so on-device we write the file
// to the app's cache and hand it to the OS's native share sheet, where
// "Save to Files" / "Save to Photos" / etc. actually work. In a plain
// browser (local dev, testing) we fall back to the normal anchor-download
// approach, which works fine there.
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

function dataUrlToBase64(dataUrl: string): string {
  return dataUrl.slice(dataUrl.indexOf(",") + 1);
}

function downloadInBrowser(dataUrl: string, fileName: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function saveAndShareFile(dataUrl: string, fileName: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    downloadInBrowser(dataUrl, fileName);
    return;
  }
  const base64 = dataUrlToBase64(dataUrl);
  const safeName = `${Date.now()}-${fileName}`;
  await Filesystem.writeFile({ path: safeName, data: base64, directory: Directory.Cache });
  const { uri } = await Filesystem.getUri({ path: safeName, directory: Directory.Cache });
  await Share.share({ title: fileName, files: [uri] });
}
