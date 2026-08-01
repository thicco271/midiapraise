"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_COLOR, STATUS_LABEL } from "@/lib/praise";
import type { EventStatus } from "@/types";

export function StatusBadge({ status, className }: { status: EventStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn("border-0 font-medium", STATUS_COLOR[status], className)}>
      {STATUS_LABEL[status] ?? status}
    </Badge>
  );
}
