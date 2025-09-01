"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export function TimePicker({
  label,
  value, // always stored as "HH:mm" (24h)
  onChange,
  onApply, // <-- NEW (optional)
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  onApply?: () => void; // <-- allow parent to close the popover
}) {
  const parse24hToState = (time: string) => {
    if (!time) return { hour: 12, minute: 0, ampm: "AM" as "AM" | "PM" };
    const [h, m] = time.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return { hour, minute: m, ampm };
  };

  const formatStateTo24h = (
    hour: number,
    minute: number,
    ampm: "AM" | "PM"
  ) => {
    let h = hour % 12;
    if (ampm === "PM") h += 12;
    return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  };

  const formatStateTo12h = (
    hour: number,
    minute: number,
    ampm: "AM" | "PM"
  ) => {
    return `${hour}:${String(minute).padStart(2, "0")} ${ampm}`;
  };

  const [{ hour, minute, ampm }, setState] = useState(parse24hToState(value));
  const [inputValue, setInputValue] = useState(() => {
    if (value) {
      const { hour, minute, ampm } = parse24hToState(value);
      return formatStateTo12h(hour, minute, ampm as "AM" | "PM");
    }
    return "";
  });

  // Keep local display in sync when parent value changes
  useEffect(() => {
    if (value) {
      const parsed = parse24hToState(value);
      setState(parsed);
      setInputValue(
        formatStateTo12h(parsed.hour, parsed.minute, parsed.ampm as "AM" | "PM")
      );
    }
  }, [value]);

  const apply = () => {
    const formatted24 = formatStateTo24h(hour, minute, ampm as "AM" | "PM");
    onChange(formatted24);
    setInputValue(formatStateTo12h(hour, minute, ampm as "AM" | "PM"));
    onApply?.(); // <-- tell parent to close
  };

  const handleInputChange = (val: string) => {
    setInputValue(val);

    // Regex: e.g. "2:45 PM" or "09:30 am"
    const match = val.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (match) {
      let h = parseInt(match[1], 10);
      let m = parseInt(match[2], 10);
      let ap = (match[3] || "").toUpperCase() as "AM" | "PM";

      if (h >= 1 && h <= 12 && m >= 0 && m <= 59) {
        setState({ hour: h, minute: m, ampm: ap || "AM" });
        if (ap) {
          onChange(formatStateTo24h(h, m, ap));
        }
      }
    }
  };

  return (
    <div className="flex-1">
      <Label className="mb-1 block">{label}</Label>
      <div className="relative">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="hh:mm AM/PM"
          className="pr-10"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2"
            >
              <Clock className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3">
            <div className="flex justify-between items-center gap-2">
              {/* Hour */}
              <div className="flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      hour: s.hour === 12 ? 1 : s.hour + 1,
                    }))
                  }
                >
                  ▲
                </Button>
                <span className="text-lg">{hour}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      hour: s.hour === 1 ? 12 : s.hour - 1,
                    }))
                  }
                >
                  ▼
                </Button>
              </div>
              {/* Minute */}
              <div className="flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setState((s) => ({ ...s, minute: (s.minute + 1) % 60 }))
                  }
                >
                  ▲
                </Button>
                <span className="text-lg">
                  {String(minute).padStart(2, "0")}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      minute: s.minute === 0 ? 59 : s.minute - 1,
                    }))
                  }
                >
                  ▼
                </Button>
              </div>
              {/* AM/PM */}
              <div className="flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      ampm: s.ampm === "AM" ? "PM" : "AM",
                    }))
                  }
                >
                  ▲
                </Button>
                <span className="text-lg">{ampm}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      ampm: s.ampm === "AM" ? "PM" : "AM",
                    }))
                  }
                >
                  ▼
                </Button>
              </div>
            </div>
            <Button className="mt-3 w-full" onClick={apply}>
              Apply
            </Button>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
