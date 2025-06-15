
import { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ClockTimeSelectorProps {
  selectedTime: string;
  onTimeSelect: (time: string) => void;
}

export function ClockTimeSelector({ selectedTime, onTimeSelect }: ClockTimeSelectorProps) {
  const [isDragging, setIsDragging] = useState<'hour' | 'minute' | null>(null);
  const clockRef = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState(() => {
    const [hours, minutes] = selectedTime.split(':').map(Number);
    return { hours: hours || 0, minutes: minutes || 0 };
  });
  const [manualTime, setManualTime] = useState(selectedTime);

  useEffect(() => {
    const [hours, minutes] = selectedTime.split(':').map(Number);
    setTime({ hours: hours || 0, minutes: minutes || 0 });
    setManualTime(selectedTime);
  }, [selectedTime]);

  const updateTime = (newTime: { hours: number; minutes: number }) => {
    setTime(newTime);
    const formattedTime = `${newTime.hours.toString().padStart(2, '0')}:${newTime.minutes.toString().padStart(2, '0')}`;
    setManualTime(formattedTime);
    onTimeSelect(formattedTime);
  };

  const handleManualTimeChange = (value: string) => {
    setManualTime(value);
    if (value.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      const [hours, minutes] = value.split(':').map(Number);
      setTime({ hours, minutes });
      onTimeSelect(value);
    }
  };

  const getAngleFromCenter = (clientX: number, clientY: number) => {
    if (!clockRef.current) return 0;
    
    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const angle = Math.atan2(clientY - centerY, clientX - centerX);
    return (angle * 180) / Math.PI;
  };

  const handleMouseDown = (hand: 'hour' | 'minute') => {
    setIsDragging(hand);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const angle = getAngleFromCenter(e.clientX, e.clientY);
    const normalizedAngle = (angle + 90 + 360) % 360;
    
    if (isDragging === 'hour') {
      const hours = Math.round((normalizedAngle / 360) * 24) % 24;
      updateTime({ ...time, hours });
    } else if (isDragging === 'minute') {
      const minutes = Math.round((normalizedAngle / 360) * 60) % 60;
      updateTime({ ...time, minutes });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, time]);

  const hourAngle = ((time.hours % 12) / 12) * 360 - 90;
  const minuteAngle = (time.minutes / 60) * 360 - 90;

  const generateClockNumbers = () => {
    const numbers = [];
    for (let i = 1; i <= 12; i++) {
      const angle = (i / 12) * 360 - 90;
      const x = 85 * Math.cos((angle * Math.PI) / 180);
      const y = 85 * Math.sin((angle * Math.PI) / 180);
      numbers.push(
        <div
          key={i}
          className="absolute text-sm font-semibold text-slate-700 select-none"
          style={{
            left: `${50 + (x / 100) * 50}%`,
            top: `${50 + (y / 100) * 50}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {i}
        </div>
      );
    }
    return numbers;
  };

  const formatDisplayTime = () => {
    const period = time.hours >= 12 ? 'PM' : 'AM';
    const displayHours = time.hours === 0 ? 12 : time.hours > 12 ? time.hours - 12 : time.hours;
    return `${displayHours}:${time.minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-semibold text-slate-700">Select Time</span>
        </div>
        <div className="text-3xl font-bold text-slate-800 mb-2">
          {formatDisplayTime()}
        </div>
        <div className="text-sm text-slate-500">
          24h: {time.hours.toString().padStart(2, '0')}:{time.minutes.toString().padStart(2, '0')}
        </div>
      </div>

      {/* Manual Time Input */}
      <div className="flex flex-col items-center gap-2">
        <label className="text-sm font-medium text-slate-700">Or enter time manually:</label>
        <Input
          type="time"
          value={manualTime}
          onChange={(e) => handleManualTimeChange(e.target.value)}
          className="w-40 text-center font-mono"
        />
      </div>

      <div className="flex justify-center">
        <div 
          ref={clockRef}
          className="relative w-72 h-72 bg-gradient-to-br from-white to-blue-50 rounded-full border-4 border-blue-200 shadow-xl cursor-pointer select-none"
          style={{ userSelect: 'none' }}
        >
          {/* Clock numbers */}
          {generateClockNumbers()}
          
          {/* Hour markers */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i / 12) * 360;
            return (
              <div
                key={`hour-${i}`}
                className="absolute w-1 h-8 bg-slate-400 origin-bottom"
                style={{
                  left: '50%',
                  top: '8px',
                  transform: `translateX(-50%) rotate(${angle}deg)`,
                  transformOrigin: '50% 136px'
                }}
              />
            );
          })}
          
          {/* Minute markers */}
          {Array.from({ length: 60 }, (_, i) => {
            if (i % 5 !== 0) {
              const angle = (i / 60) * 360;
              return (
                <div
                  key={`minute-${i}`}
                  className="absolute w-0.5 h-4 bg-slate-300 origin-bottom"
                  style={{
                    left: '50%',
                    top: '8px',
                    transform: `translateX(-50%) rotate(${angle}deg)`,
                    transformOrigin: '50% 136px'
                  }}
                />
              );
            }
            return null;
          })}
          
          {/* Hour hand */}
          <div
            className="absolute w-2 bg-slate-800 origin-bottom cursor-grab active:cursor-grabbing rounded-full shadow-lg hover:bg-slate-900 transition-colors"
            style={{
              left: '50%',
              top: '50%',
              height: '70px',
              transform: `translateX(-50%) translateY(-100%) rotate(${hourAngle}deg)`,
              transformOrigin: '50% 100%',
              zIndex: 2
            }}
            onMouseDown={() => handleMouseDown('hour')}
          />
          
          {/* Minute hand */}
          <div
            className="absolute w-1 bg-blue-600 origin-bottom cursor-grab active:cursor-grabbing rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            style={{
              left: '50%',
              top: '50%',
              height: '90px',
              transform: `translateX(-50%) translateY(-100%) rotate(${minuteAngle}deg)`,
              transformOrigin: '50% 100%',
              zIndex: 3
            }}
            onMouseDown={() => handleMouseDown('minute')}
          />
          
          {/* Center dot */}
          <div className="absolute w-4 h-4 bg-slate-800 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 border-2 border-white shadow-md" />
        </div>
      </div>

      <div className="text-center text-xs text-slate-600 space-y-1 bg-blue-50 p-3 rounded-lg border border-blue-200">
        <p>Drag the <span className="font-semibold text-slate-800">thick hand</span> to set hours</p>
        <p>Drag the <span className="font-semibold text-blue-600">thin hand</span> to set minutes</p>
        <p>Or use the time input field above for precise entry</p>
      </div>

      {/* Quick time buttons */}
      <div className="grid grid-cols-4 gap-2 text-xs">
        {['09:00', '12:00', '14:00', '17:00'].map((quickTime) => (
          <button
            key={quickTime}
            onClick={() => onTimeSelect(quickTime)}
            className="px-3 py-2 bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 rounded-lg text-blue-700 transition-all duration-200 font-medium border border-blue-300"
          >
            {quickTime}
          </button>
        ))}
      </div>
    </div>
  );
}
