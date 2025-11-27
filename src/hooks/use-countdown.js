import { useState, useEffect } from 'react';

export function useCountdown(targetDate) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        if (!targetDate) return;

        const calculate = () => {
            const difference = new Date(targetDate).getTime() - new Date().getTime();

            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((difference % (1000 * 60)) / 1000)
                };
            }
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        };

        // Initial update
        setTimeLeft(calculate());

        const timer = setInterval(() => {
            setTimeLeft(calculate());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    return [timeLeft.days, timeLeft.hours, timeLeft.minutes, timeLeft.seconds];
}
