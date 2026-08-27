import * as React from "react";
import { TIPS, TIP_CATEGORIES, tipOfTheDay, type TipCategory } from "@/data/tips";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export function Tips() {
  const [filter, setFilter] = React.useState<TipCategory | "all">("all");
  const today = tipOfTheDay();

  const tips = TIPS.filter((t) => filter === "all" || t.category === filter);

  return (
    <div className="flex flex-col gap-4 p-4 pb-24 sm:p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Healthy Tips</h1>
        <p className="text-sm text-muted-foreground">General wellness ideas, bundled with the app — not medical advice.</p>
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex items-start gap-3 p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-primary">Today's tip</p>
            <p className="mt-0.5 text-sm font-medium">{today.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{today.body}</p>
          </div>
        </CardContent>
      </Card>

      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium",
            filter === "all" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground",
          )}
        >
          All
        </button>
        {TIP_CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setFilter(c.value)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium",
              filter === c.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {tips.map((tip) => (
          <Card key={tip.id}>
            <CardContent className="p-4">
              <p className="text-sm font-medium">{tip.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{tip.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
