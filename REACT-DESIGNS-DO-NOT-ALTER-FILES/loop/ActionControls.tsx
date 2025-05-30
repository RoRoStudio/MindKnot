import { SkipForward, PlayCircle, PauseCircle, CheckCircle } from "lucide-react";
import { TimerDisplay } from "./TimerDisplay";

interface ActionControlsProps {
    isTimerRunning: boolean;
    timeRemaining: number;
    isOvertime: boolean;
    overtimeAmount: number;
    onResetTimer: () => void;
    onToggleTimer: () => void;
    onSkipActivity: () => void;
    onCompleteActivity: () => void;
}

export const ActionControls = ({
    isTimerRunning,
    timeRemaining,
    isOvertime,
    overtimeAmount,
    onResetTimer,
    onToggleTimer,
    onSkipActivity,
    onCompleteActivity
}: ActionControlsProps) => {
    return (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto py-6 px-6 bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-neutral-200">
            {/* Timer Display */}
            <TimerDisplay
                timeRemaining={timeRemaining}
                isOvertime={isOvertime}
                overtimeAmount={overtimeAmount}
                onResetTimer={onResetTimer}
            />

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
                {/* Skip button */}
                <button
                    onClick={onSkipActivity}
                    className="flex flex-col items-center group"
                >
                    <div className="size-14 rounded-xl flex items-center justify-center bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 group-hover:border-neutral-400 transition-all duration-200 shadow-sm">
                        <SkipForward size={24} className="text-neutral-400 group-hover:text-neutral-600 transition-colors duration-200" />
                    </div>
                    <span className="mt-2 text-xs text-neutral-500 group-hover:text-neutral-700 transition-colors duration-200">Skip</span>
                </button>

                {/* Play/Pause button */}
                <button
                    onClick={onToggleTimer}
                    className="flex flex-col items-center"
                >
                    <div className="size-18 rounded-xl flex items-center justify-center bg-brand-primary-600 hover:bg-brand-primary-700 shadow-[0_2px_8px_rgba(71,85,105,0.15)] transition-all duration-200">
                        {isTimerRunning ? (
                            <PauseCircle size={34} className="text-white" />
                        ) : (
                            <PlayCircle size={34} className="text-white" />
                        )}
                    </div>
                    <span className="mt-2 text-sm font-medium text-neutral-700">
                        {isTimerRunning ? 'Pause' : 'Resume'}
                    </span>
                </button>

                {/* Complete button */}
                <button
                    onClick={onCompleteActivity}
                    className="flex flex-col items-center group"
                >
                    <div className="size-14 rounded-xl flex items-center justify-center bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 group-hover:border-functional-success-main transition-all duration-200 shadow-sm">
                        <CheckCircle size={24} className="text-functional-success-main transition-colors duration-200" />
                    </div>
                    <span className="mt-2 text-xs text-neutral-500 group-hover:text-neutral-700 transition-colors duration-200">Complete</span>
                </button>
            </div>
        </div>
    );
};