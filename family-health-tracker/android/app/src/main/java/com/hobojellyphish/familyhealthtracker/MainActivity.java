package com.hobojellyphish.familyhealthtracker;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  private static final int RECORD_AUDIO_PERMISSION_CODE = 7001;
  private PermissionRequest pendingPermissionRequest;

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // The in-app voice-dictation feature (an optional way to fill in a log
    // entry by speaking instead of typing) needs the WebView to be allowed
    // to request microphone access. Capacitor's default WebChromeClient
    // denies that request outright, so this grants it — but only after the
    // user has approved the standard Android microphone permission prompt,
    // and only for the audio-capture resource the page actually asked for.
    getBridge()
      .getWebView()
      .setWebChromeClient(
        new WebChromeClient() {
          @Override
          public void onPermissionRequest(final PermissionRequest request) {
            for (String resource : request.getResources()) {
              if (resource.equals(PermissionRequest.RESOURCE_AUDIO_CAPTURE)) {
                runOnUiThread(() -> {
                  if (
                    ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.RECORD_AUDIO) ==
                    PackageManager.PERMISSION_GRANTED
                  ) {
                    request.grant(new String[] { PermissionRequest.RESOURCE_AUDIO_CAPTURE });
                  } else {
                    pendingPermissionRequest = request;
                    ActivityCompat.requestPermissions(
                      MainActivity.this,
                      new String[] { Manifest.permission.RECORD_AUDIO },
                      RECORD_AUDIO_PERMISSION_CODE
                    );
                  }
                });
                return;
              }
            }
            request.deny();
          }
        }
      );
  }

  @Override
  public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    if (requestCode == RECORD_AUDIO_PERMISSION_CODE && pendingPermissionRequest != null) {
      if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
        pendingPermissionRequest.grant(new String[] { PermissionRequest.RESOURCE_AUDIO_CAPTURE });
      } else {
        pendingPermissionRequest.deny();
      }
      pendingPermissionRequest = null;
    }
  }
}
