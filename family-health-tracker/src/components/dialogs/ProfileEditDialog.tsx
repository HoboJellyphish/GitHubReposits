import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { useAppData } from "@/state/AppDataContext";
import { AVATAR_PALETTE } from "@/data/defaults";
import type { Profile } from "@/types";
import { cn } from "@/lib/utils";

export function ProfileEditDialog({
  open,
  onOpenChange,
  profile,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile?: Profile;
}) {
  const { addProfile, updateProfile, setActiveProfileId } = useAppData();
  const [name, setName] = React.useState(profile?.name ?? "");
  const [dob, setDob] = React.useState(profile?.dob ?? "");
  const [avatar, setAvatar] = React.useState(
    profile ? { emoji: profile.avatarEmoji, color: profile.avatarColor } : AVATAR_PALETTE[0],
  );

  React.useEffect(() => {
    if (open) {
      setName(profile?.name ?? "");
      setDob(profile?.dob ?? "");
      setAvatar(profile ? { emoji: profile.avatarEmoji, color: profile.avatarColor } : AVATAR_PALETTE[0]);
    }
  }, [open, profile]);

  const handleSave = () => {
    if (!name.trim()) return;
    if (profile) {
      updateProfile(profile.id, { name: name.trim(), dob: dob || null, avatarEmoji: avatar.emoji, avatarColor: avatar.color });
    } else {
      const created = addProfile({ name: name.trim(), dob: dob || null });
      updateProfile(created.id, { avatarEmoji: avatar.emoji, avatarColor: avatar.color });
      setActiveProfileId(created.id);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{profile ? "Edit Profile" : "Add a Family Member"}</DialogTitle>
          <DialogDescription>Each profile keeps its own data, medications, and layout.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex justify-center">
            <ProfileAvatar profile={{ avatarEmoji: avatar.emoji, avatarColor: avatar.color, name }} size="lg" />
          </div>

          <div className="grid grid-cols-6 gap-2">
            {AVATAR_PALETTE.map((a) => (
              <button
                key={a.emoji}
                type="button"
                onClick={() => setAvatar(a)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-lg transition-transform hover:scale-110",
                  avatar.emoji === a.emoji && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                )}
                style={{ backgroundColor: a.color + "26" }}
                aria-label={`Choose avatar ${a.emoji}`}
              >
                {a.emoji}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="profile-name">Name</Label>
            <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sam" autoFocus />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="profile-dob">Date of birth (optional)</Label>
            <Input id="profile-dob" type="date" value={dob ?? ""} onChange={(e) => setDob(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {profile ? "Save Changes" : "Create Profile"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
