import React from 'react';

export const useCountdown = (targetDate: string | Date | null | undefined) => {
    const calculate = React.useCallback(() => {
        if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

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
    }, [targetDate]);

    const [timeLeft, setTimeLeft] = React.useState(calculate());

    React.useEffect(() => {
        // Update immediately in case of hydration mismatch or initial render delay
        setTimeLeft(calculate());

        const timer = setInterval(() => {
            setTimeLeft(calculate());
        }, 1000);

        return () => clearInterval(timer);
    }, [calculate]);

    return [timeLeft.days, timeLeft.hours, timeLeft.minutes, timeLeft.seconds] as const;
};
