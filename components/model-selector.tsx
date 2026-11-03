"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Cpu } from "lucide-react";
import { AVAILABLE_MODELS } from "../lib/openrouter";

export function ModelSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[210px] h-10 rounded-lg bg-card/60 border-border/70 text-xs font-medium">
        <span className="flex items-center gap-2 truncate">
          <Cpu className="h-3.5 w-3.5 text-primary shrink-0" />
          <SelectValue placeholder="Modelo" />
        </span>
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        {AVAILABLE_MODELS.map((m) => (
          <SelectItem key={m.id} value={m.id} className="rounded-lg py-2">
            <div className="flex flex-col gap-0.5">
              <span className="font-medium flex items-center gap-1.5">
                {m.name}
                <span className="text-[9px] font-normal uppercase tracking-wide text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded">
                  {m.badge}
                </span>
              </span>
              <span className="text-[10px] text-muted-foreground">{m.description}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
