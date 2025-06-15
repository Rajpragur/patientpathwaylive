
import { ClockTimeSelector } from './ClockTimeSelector';

interface TimeSelectorProps {
  selectedTime: string;
  onTimeSelect: (time: string) => void;
}

export function TimeSelector({ selectedTime, onTimeSelect }: TimeSelectorProps) {
  return <ClockTimeSelector selectedTime={selectedTime} onTimeSelect={onTimeSelect} />;
}
