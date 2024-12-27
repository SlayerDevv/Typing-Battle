import { useState, useEffect } from "react";

export const useCounter = (initialTime = 60) => {
    const [Counter, setCounter] = useState(initialTime);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        let CounterInterval: any;

        if (isRunning) {
            CounterInterval = setInterval(() => {
                setCounter((prev) => {
                    if (prev <= 1) {
                        clearInterval(CounterInterval!);
                        setIsRunning(false);
                        return 0
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (CounterInterval) clearInterval(CounterInterval);
        };
    }, [isRunning]);

    const toggleStart = () => setIsRunning(true);
    const toggleStop = () => setIsRunning(false);
    const toggleReset = () => {
        setIsRunning(false);
        setCounter(initialTime);
    };

    return { toggleStart, toggleStop, toggleReset, Counter, isRunning, setIsRunning };
};
