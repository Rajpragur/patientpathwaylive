
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface ClockTimeSelectorProps {
  selectedTime: string;
  onTimeSelect: (time: string) => void;
}

export function ClockTimeSelector({ selectedTime, onTimeSelect }: ClockTimeSelectorProps) {
  const [isDragging, setIsDragging] = useState<'hour' | 'minute' | null>(null);
  const [manualTime, setManualTime] = useState(selectedTime);
  const clockRef = useRef<HTMLDivElement>(null);

  const [hours, minutes] = selectedTime.split(':').map(Number);

  useEffect(() => {
    setManualTime(selectedTime);
  }, [selectedTime]);

  const getAngle = (value: number, max: number) => {
    return (value / max) * 360 - 90;
  };

  const getValueFromAngle = (angle: number, max: number) => {
    const normalizedAngle = (angle + 90) % 360;
    return Math.round((normalizedAngle / 360) * max) % max;
  };

  const handleMouseDown = (type: 'hour' | 'minute') => {
    setIsDragging(type);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !clockRef.current) return;

    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    
    if (isDragging === 'hour') {
      const newHours = getValueFromAngle(angle, 24);
      onTimeSelect(`${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    } else if (isDragging === 'minute') {
      const newMinutes = getValueFromAngle(angle, 60);
      onTimeSelect(`${hours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const handleManualTimeChange = (value: string) => {
    setManualTime(value);
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5]?[0-9])$/;
    if (timeRegex.test(value)) {
      onTimeSelect(value);
    }
  };

  const hourAngle = getAngle(hours, 24);
  const minuteAngle = getAngle(minutes, 60);

  return (
    <div className="space-y-6">
      {/* Manual Time Input */}
      <div className="text-center">
        <Label className="text-sm font-medium text-gray-700 block mb-3">Manual Time Entry</Label>
        <div className="space-y-2">
          <Input
            type="time"
            value={manualTime}
            onChange={(e) => handleManualTimeChange(e.target.value)}
            className="w-full text-center text-lg font-mono border-2 border-teal-200 focus:border-teal-500 rounded-lg"
          />
          <p className="text-xs text-gray-500">24-hour format</p>
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">OR</span>
        </div>
      </div>

      {/* Clock Interface */}
      <div className="text-center">
        <Label className="text-sm font-medium text-gray-700 block mb-3">Interactive Clock</Label>
        <Card className="shadow-lg border-2 border-teal-100 mx-auto" style={{ width: 'fit-content' }}>
          <CardContent className="p-6">
            <div
              ref={clockRef}
              className="relative w-48 h-48 rounded-full border-4 border-teal-300 bg-gradient-to-br from-teal-50 to-cyan-100 cursor-pointer shadow-inner mx-auto"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Hour markers */}
              {Array.from({ length: 24 }, (_, i) => (
                <div
                  key={`hour-${i}`}
                  className="absolute w-1 bg-gray-400"
                  style={{
                    height: i % 6 === 0 ? '16px' : '8px',
                    left: '50%',
                    top: i % 6 === 0 ? '8px' : '12px',
                    transformOrigin: '50% 88px',
                    transform: `translateX(-50%) rotate(${(i / 24) * 360}deg)`,
                  }}
                />
              ))}

              {/* Hour numbers */}
              {[0, 6, 12, 18].map((hour) => (
                <div
                  key={`hour-num-${hour}`}
                  className="absolute text-sm font-bold text-gray-700"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) translate(${Math.cos((hour / 24) * 2 * Math.PI - Math.PI / 2) * 70}px, ${Math.sin((hour / 24) * 2 * Math.PI - Math.PI / 2) * 70}px)`,
                  }}
                >
                  {hour}
                </div>
              ))}

              {/* Center dot */}
              <div className="absolute w-3 h-3 bg-teal-600 rounded-full" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />

              {/* Hour hand */}
              <div
                className="absolute w-1 bg-teal-600 rounded-full cursor-grab active:cursor-grabbing shadow-md"
                style={{
                  height: '60px',
                  left: '50%',
                  top: '50%',
                  transformOrigin: '50% 100%',
                  transform: `translateX(-50%) translateY(-100%) rotate(${hourAngle}deg)`,
                  zIndex: 2,
                }}
                onMouseDown={() => handleMouseDown('hour')}
              >
                <div className="absolute -top-2 -left-1 w-3 h-3 bg-teal-600 rounded-full"></div>
              </div>

              {/* Minute hand */}
              <div
                className="absolute w-0.5 bg-red-500 rounded-full cursor-grab active:cursor-grabbing shadow-md"
                style={{
                  height: '80px',
                  left: '50%',
                  top: '50%',
                  transformOrigin: '50% 100%',
                  transform: `translateX(-50%) translateY(-100%) rotate(${minuteAngle}deg)`,
                  zIndex: 3,
                }}
                onMouseDown={() => handleMouseDown('minute')}
              >
                <div className="absolute -top-1.5 -left-1 w-2.5 h-2.5 bg-red-500 rounded-full"></div>
              </div>
            </div>
            
            {/* Time Display */}
            <div className="mt-4 text-center">
              <div className="text-2xl font-mono font-bold text-gray-800 bg-gray-50 px-4 py-2 rounded-lg border">
                {selectedTime}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {isDragging ? `Adjusting ${isDragging}...` : 'Drag the hands to adjust time'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
