import * as React from "react";
import { Plus, Search, X } from "lucide-react";
import { useAppData } from "@/state/AppDataContext";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { ProfileEditDialog } from "@/components/dialogs/ProfileEditDialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { calculateAge } from "@/lib/format";

const SEARCH_THRESHOLD = 6;

export function ProfileSwitcher() {
  const { profiles, activeProfileId, setActiveProfileId } = useAppData();
  const [addOpen, setAddOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [searchOpen, setSearchOpen] = React.useState(false);

  const filtered = React.useMemo(
    () => (search.trim() ? profiles.filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase())) : profiles),
    [profiles, search],
  );

  return (
    <div className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="flex items-center gap-2 px-3 py-2 sm:px-4">
        {profiles.length > SEARCH_THRESHOLD && (
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
            aria-label="Search profiles"
          >
            {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </button>
        )}

        {searchOpen && (
          <Input
            autoFocus
            placeholder="Search family members…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 max-w-48"
          />
        )}

        <div className="no-scrollbar flex flex-1 gap-3 overflow-x-auto py-1">
          {filtered.map((profile) => {
            const active = profile.id === activeProfileId;
            const age = calculateAge(profile.dob);
            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => setActiveProfileId(profile.id)}
                className="flex shrink-0 flex-col items-center gap-1"
              >
                <ProfileAvatar profile={profile} size="md" ring={active} />
                <span
                  className={cn(
                    "max-w-16 truncate text-[11px] font-medium",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {profile.name}
                </span>
                {age !== null && <span className="text-[10px] text-muted-foreground">{age}y</span>}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="flex shrink-0 flex-col items-center gap-1"
            aria-label="Add family member"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary">
              <Plus className="h-5 w-5" />
            </span>
            <span className="text-[11px] text-muted-foreground">Add</span>
          </button>
        </div>
      </div>

      <ProfileEditDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
