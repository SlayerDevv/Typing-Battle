import { useState, useEffect } from "react";

export const useCounter = (initialTime = 60) => {
    const [Counter, setCounter] = useState(initialTime);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        let CounterInterval: any;

        if (isRunning){
            CounterInterval = setInterval(() => {
                setCounter(prev => prev--);
                if(Counter === 0){
                    clearInterval(CounterInterval);
                    setIsRunning(false);
                }
            }, 1000)
        }else {
            clearInterval(CounterInterval);
        }
        return () => clearInterval(CounterInterval);

    }, [isRunning]);
    const toggleStart = () => setIsRunning(true);
    const toggleStop = () => setIsRunning(false);
    const toggleReset = () => setCounter(initialTime)
    return {toggleStart, toggleStop, toggleReset}
}