"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Subscribes to Supabase realtime changes on the given tables and refreshes the
 * current server component tree when anything changes. Used by mostly-static
 * server-rendered screens (dashboard) that should reflect live data.
 */
export function RealtimeRefresher({
  tables,
  channel,
}: {
  tables: string[];
  channel: string;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const key = tables.join(",");

  useEffect(() => {
    const ch = supabase.channel(channel);
    for (const table of key.split(",")) {
      ch.on("postgres_changes", { event: "*", schema: "public", table }, () => {
        router.refresh();
      });
    }
    ch.subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [supabase, channel, key, router]);

  return null;
}
