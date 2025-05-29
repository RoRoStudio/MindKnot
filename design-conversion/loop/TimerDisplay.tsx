import { RotateCcw } from "lucide-react";

interface TimerDisplayProps {
    timeRemaining: number; // in seconds
    isOvertime: boolean;
    overtimeAmount: number; // in seconds
    onResetTimer: () => void;
}

export const TimerDisplay = ({
    timeRemaining,
    isOvertime,
    overtimeAmount,
    onResetTimer
}: TimerDisplayProps) => {
    // Convert seconds to minutes and seconds
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;

    // Overtime display
    const overtimeMinutes = Math.floor(overtimeAmount / 60);
    const overtimeSeconds = overtimeAmount % 60;
    const formattedOvertime = `+${overtimeMinutes}:${overtimeSeconds < 10 ? '0' : ''}${overtimeSeconds}`;

    return (
        <div className="relative flex items-center justify-center w-full mb-6">
            {/* Main Timer (centered) */}
            <div className="flex items-center">
                {/* Minutes container */}
                <div className={`flex items-center justify-center w-24 h-20 rounded-xl ${isOvertime
                        ? 'bg-functional-error-light text-functional-error-main border border-functional-error-main/30'
                        : 'bg-white text-neutral-800 shadow-md'
                    } transition-all duration-300`}>
                    <span className="text-4xl font-medium">{minutes}</span>
                </div>

                {/* Separator */}
                <div className={`flex items-center justify-center w-6 h-20 ${isOvertime ? 'text-functional-error-main' : 'text-neutral-600'
                    } transition-colors duration-300`}>
                    <span className="text-4xl font-medium">:</span>
                </div>

                {/* Seconds container */}
                <div className={`flex items-center justify-center w-24 h-20 rounded-xl ${isOvertime
                        ? 'bg-functional-error-light text-functional-error-main border border-functional-error-main/30'
                        : 'bg-white text-neutral-800 shadow-md'
                    } transition-all duration-300`}>
                    <span className="text-4xl font-medium">{seconds < 10 ? `0${seconds}` : seconds}</span>
                </div>
            </div>

            {/* Reset button (absolutely positioned) */}
            <button
                onClick={onResetTimer}
                className="absolute right-0 top-1/2 -translate-y-1/2 size-10 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors duration-200"
            >
                <RotateCcw size={20} className="text-neutral-400 hover:text-brand-primary-600" />
            </button>

            {/* Overtime indicator */}
            {isOvertime && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-functional-error-light text-functional-error-main font-medium whitespace-nowrap border border-functional-error-main/30">
                    {formattedOvertime} OVERTIME
                </div>
            )}
        </div>
    );
};