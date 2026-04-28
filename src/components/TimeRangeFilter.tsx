import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import {
  RANGE_PRESET_OPTIONS,
  type RangePreset,
  type DateRange,
  presetToRange,
  toDateInputValue,
  fromDateInputValue,
  endOfDay,
  startOfDay,
} from '../lib/timeRanges';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

export interface TimeRangeValue {
  preset: RangePreset;
  range: DateRange;
}

interface Props {
  value: TimeRangeValue;
  onChange: (next: TimeRangeValue) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function TimeRangeFilter({ value, onChange, size = 'sm', className = '' }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const isCustom = value.preset === 'custom';

  const handlePreset = (preset: string) => {
    const presetVal = preset as RangePreset;
    if (presetVal === 'custom') {
      const seed = value.range.start && value.range.end
        ? value.range
        : presetToRange('last-month');
      onChange({ preset: presetVal, range: { start: seed.start, end: seed.end } });
      setPickerOpen(true);
      return;
    }
    onChange({ preset: presetVal, range: presetToRange(presetVal) });
  };

  const handleStart = (s: string) => {
    const d = fromDateInputValue(s);
    onChange({
      preset: 'custom',
      range: { start: d ? startOfDay(d) : null, end: value.range.end },
    });
  };
  const handleEnd = (s: string) => {
    const d = fromDateInputValue(s);
    onChange({
      preset: 'custom',
      range: { start: value.range.start, end: d ? endOfDay(d) : null },
    });
  };

  const sizeCls = size === 'sm' ? 'h-10 sm:h-8 text-xs px-3' : 'h-12 sm:h-10 text-sm px-4';

  const customLabel =
    value.range.start && value.range.end
      ? `${toDateInputValue(value.range.start)} → ${toDateInputValue(value.range.end)}`
      : 'Pick range';

  return (
    <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2 ${className}`}>
      {/* Preset select */}
      <Select value={value.preset} onValueChange={handlePreset}>
        <SelectTrigger className={`w-full sm:w-[150px] bg-card border-border font-bold text-muted-foreground rounded-xl shadow-soft ${sizeCls}`}>
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent className="rounded-xl shadow-soft border-border">
          {RANGE_PRESET_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value} className="font-medium rounded-lg">
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Custom date range trigger */}
      {isCustom && (
        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-full sm:w-auto bg-card border-border font-bold text-muted-foreground hover:text-foreground rounded-xl shadow-soft gap-2 ${sizeCls}`}
            >
              <CalendarIcon className="w-3.5 h-3.5 text-primary" />
              <span className="whitespace-nowrap">{customLabel}</span>
            </Button>
          </PopoverTrigger>

          <PopoverContent align="end" className="w-[280px] p-4 rounded-xl shadow-soft border-border">
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Start date</label>
                <Input
                  type="date"
                  value={toDateInputValue(value.range.start)}
                  max={toDateInputValue(value.range.end) || undefined}
                  onChange={(e) => handleStart(e.target.value)}
                  className="bg-secondary/30 h-10 border-border rounded-xl font-bold text-foreground"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">End date</label>
                <Input
                  type="date"
                  value={toDateInputValue(value.range.end)}
                  min={toDateInputValue(value.range.start) || undefined}
                  onChange={(e) => handleEnd(e.target.value)}
                  className="bg-secondary/30 h-10 border-border rounded-xl font-bold text-foreground"
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setPickerOpen(false)}
                  className="text-xs font-black uppercase tracking-widest text-primary hover:text-primary/90 h-8 rounded-lg"
                >
                  Done
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

export function createDefaultTimeRangeValue(preset: RangePreset = 'all-time'): TimeRangeValue {
  return { preset, range: presetToRange(preset) };
}
