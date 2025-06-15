
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TimeSelectorProps {
  selectedTime: string;
  onTimeSelect: (time: string) => void;
}

export function TimeSelector({ selectedTime, onTimeSelect }: TimeSelectorProps) {
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  return (
    <div className="space-y-3">
      <Label htmlFor="time-input">Select Time</Label>
      <Input
        id="time-input"
        type="time"
        value={selectedTime}
        onChange={(e) => onTimeSelect(e.target.value)}
        className="w-full"
      />
      <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
        {timeSlots.map((time) => (
          <Button
            key={time}
            variant={selectedTime === time ? "default" : "outline"}
            size="sm"
            onClick={() => onTimeSelect(time)}
            className="text-xs"
          >
            {time}
          </Button>
        ))}
      </div>
    </div>
  );
}
