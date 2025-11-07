"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  eventDate: string;
  className?: string;
}

export function CountdownTimer({ eventDate, className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const event = new Date(eventDate).getTime();
      const difference = event - now;

      if (difference > 0) {
        setIsExpired(false);
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [eventDate]);

  if (isExpired) {
    return (
      <div className={`text-sm text-zinc-500 ${className}`}>
        Event has passed
      </div>
    );
  }

  const timeUnits = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Mins", value: timeLeft.minutes },
    { label: "Secs", value: timeLeft.seconds },
  ];

  return (
    <div className={`flex gap-2 ${className}`}>
      {timeUnits.map((unit) => (
        <div key={unit.label} className="text-center">
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded px-2 py-1 min-w-[50px]">
            <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {String(unit.value).padStart(2, "0")}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">{unit.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

