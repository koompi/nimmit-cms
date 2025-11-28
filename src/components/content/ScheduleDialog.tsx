"use client";

import * as React from "react";
import { format, addDays, addHours, setHours, setMinutes } from "date-fns";
import { Calendar as CalendarIcon, Clock, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSchedule: (date: Date) => void;
  onUnschedule?: () => void;
  currentSchedule?: Date | null;
  contentType: "post" | "page" | "product";
  isLoading?: boolean;
}

export function ScheduleDialog({
  open,
  onOpenChange,
  onSchedule,
  onUnschedule,
  currentSchedule,
  contentType,
  isLoading = false,
}: ScheduleDialogProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(
    currentSchedule || null
  );
  const [dateInput, setDateInput] = React.useState("");
  const [timeInput, setTimeInput] = React.useState("");

  React.useEffect(() => {
    if (currentSchedule) {
      setSelectedDate(currentSchedule);
      setDateInput(format(currentSchedule, "yyyy-MM-dd"));
      setTimeInput(format(currentSchedule, "HH:mm"));
    } else {
      // Default to tomorrow at 9:00 AM
      const defaultDate = setMinutes(setHours(addDays(new Date(), 1), 9), 0);
      setSelectedDate(defaultDate);
      setDateInput(format(defaultDate, "yyyy-MM-dd"));
      setTimeInput(format(defaultDate, "HH:mm"));
    }
  }, [currentSchedule, open]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateInput(e.target.value);
    updateSelectedDate(e.target.value, timeInput);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeInput(e.target.value);
    updateSelectedDate(dateInput, e.target.value);
  };

  const updateSelectedDate = (date: string, time: string) => {
    if (date && time) {
      const [hours, minutes] = time.split(":").map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours, minutes, 0, 0);
      setSelectedDate(newDate);
    }
  };

  const handleQuickSelect = (option: string) => {
    let newDate: Date;
    const now = new Date();

    switch (option) {
      case "1h":
        newDate = addHours(now, 1);
        break;
      case "tomorrow-9am":
        newDate = setMinutes(setHours(addDays(now, 1), 9), 0);
        break;
      case "tomorrow-noon":
        newDate = setMinutes(setHours(addDays(now, 1), 12), 0);
        break;
      case "next-week":
        newDate = setMinutes(setHours(addDays(now, 7), 9), 0);
        break;
      default:
        return;
    }

    setSelectedDate(newDate);
    setDateInput(format(newDate, "yyyy-MM-dd"));
    setTimeInput(format(newDate, "HH:mm"));
  };

  const handleSchedule = () => {
    if (selectedDate && selectedDate > new Date()) {
      onSchedule(selectedDate);
    }
  };

  const isValidDate = selectedDate && selectedDate > new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Schedule {contentType}
          </DialogTitle>
          <DialogDescription>
            Choose when this {contentType} should be published. It will
            automatically go live at the scheduled time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Quick select buttons */}
          <div>
            <Label className="text-sm text-muted-foreground">
              Quick select
            </Label>
            <div className="flex flex-wrap gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect("1h")}
              >
                In 1 hour
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect("tomorrow-9am")}
              >
                Tomorrow 9 AM
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect("tomorrow-noon")}
              >
                Tomorrow noon
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect("next-week")}
              >
                Next week
              </Button>
            </div>
          </div>

          {/* Date input */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="schedule-date">Date</Label>
              <div className="relative mt-1">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="schedule-date"
                  type="date"
                  value={dateInput}
                  onChange={handleDateChange}
                  min={format(new Date(), "yyyy-MM-dd")}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="schedule-time">Time</Label>
              <div className="relative mt-1">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="schedule-time"
                  type="time"
                  value={timeInput}
                  onChange={handleTimeChange}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          {selectedDate && (
            <div
              className={cn(
                "p-3 rounded-lg border text-sm",
                isValidDate
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              )}
            >
              {isValidDate ? (
                <>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Will be published on:
                  </div>
                  <div className="font-medium mt-1">
                    {format(selectedDate, "EEEE, MMMM d, yyyy 'at' h:mm a")}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Invalid date
                  </div>
                  <div className="mt-1">
                    Scheduled date must be in the future
                  </div>
                </>
              )}
            </div>
          )}

          {/* Current schedule warning */}
          {currentSchedule && (
            <div className="p-3 rounded-lg border bg-amber-50 border-amber-200 text-amber-800 text-sm">
              <div className="font-medium">Currently scheduled for:</div>
              <div>
                {format(currentSchedule, "EEEE, MMMM d, yyyy 'at' h:mm a")}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {currentSchedule && onUnschedule && (
            <Button
              type="button"
              variant="outline"
              onClick={onUnschedule}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              <X className="h-4 w-4 mr-2" />
              Unschedule
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSchedule}
            disabled={!isValidDate || isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Scheduling...
              </>
            ) : (
              <>
                <CalendarIcon className="h-4 w-4 mr-2" />
                Schedule
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
