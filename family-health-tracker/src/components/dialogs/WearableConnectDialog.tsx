import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/state/AppDataContext";
import { listWearableAdapters } from "@/wearables/registry";
import { Watch, Check } from "lucide-react";
import type { WearablePlatform } from "@/types";

export function WearableConnectDialog({
  open,
  onOpenChange,
  profileId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string;
}) {
  const { connectWearable, listConnections } = useAppData();
  const [connecting, setConnecting] = React.useState<WearablePlatform | null>(null);
  const connections = listConnections(profileId).filter((c) => c.status === "connected");
  const connectedPlatforms = new Set(connections.map((c) => c.platform));

  const handleConnect = async (platform: WearablePlatform) => {
    setConnecting(platform);
    try {
      await connectWearable(profileId, platform);
    } finally {
      setConnecting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Watch className="h-4 w-4" /> Connect a Wearable
          </DialogTitle>
          <DialogDescription>
            Each profile connects independently. Data stays on this device — connections here use a simulated
            adapter so the app works end-to-end before a real platform SDK is wired in.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {listWearableAdapters()
            .filter((a) => a.platform !== "mock")
            .map((adapter) => {
              const connected = connectedPlatforms.has(adapter.platform);
              return (
                <div key={adapter.platform} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">{adapter.label}</p>
                    <p className="text-xs text-muted-foreground">{adapter.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={connected ? "secondary" : "outline"}
                    disabled={connected || connecting === adapter.platform}
                    onClick={() => handleConnect(adapter.platform)}
                  >
                    {connected ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Connected
                      </>
                    ) : connecting === adapter.platform ? (
                      "Connecting…"
                    ) : (
                      "Connect"
                    )}
                  </Button>
                </div>
              );
            })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
