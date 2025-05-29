import { useState } from "react";
import { ChevronLeft, MoreVertical, Dumbbell, Coffee, BookOpen, PenLine, Utensils, Clock, Repeat, RotateCcw, CheckCircle, SkipForward, PlayCircle, PauseCircle, Check, X } from "lucide-react";

// Mock data types
export type Activity = {
    id: string;
    name: string;
    description: string;
    duration?: number; // Optional: in minutes
    status: "pending" | "active" | "completed" | "skipped";
    repetitionType?: string; // Optional: e.g., "sets", "pages", "reps"
    repetitionCount?: number; // Optional: e.g., 3, 5, 10
    subActivities?: { // Optional: some activities might not have sub-activities
        id: string;
        name: string;
        completed: boolean;
    }[];
};

export type LoopData = {
    id: string;
    title: string;
    activities: Activity[];
    currentActivityIndex: number;
};

// Sample data with varied combinations of optional properties
const mockLoopData: LoopData = {
    id: "loop-1",
    title: "Morning Routine",
    activities: [
        {
            id: "act-1",
            name: "Hydration",
            description: "Start your day with water",
            duration: 1,
            status: "completed",
            repetitionType: "glasses",
            repetitionCount: 1,
            subActivities: [
                { id: "sub-1-1", name: "Drink full glass of water", completed: true },
                { id: "sub-1-2", name: "Take daily vitamins", completed: true }
            ]
        },
        {
            id: "act-2",
            name: "Yoga",
            description: "Inner Peace & Outer Strength",
            duration: 15,
            status: "active",
            repetitionType: "sets",
            repetitionCount: 3,
            subActivities: [
                { id: "sub-2-1", name: "Breathing exercises", completed: true },
                { id: "sub-2-2", name: "Sun salutations", completed: false },
                { id: "sub-2-3", name: "Balance poses", completed: false },
                { id: "sub-2-4", name: "Final relaxation", completed: false }
            ]
        },
        {
            id: "act-3",
            name: "Meditation",
            description: "Clear your mind",
            // No duration specified
            status: "pending",
            repetitionType: "rounds",
            repetitionCount: 2,
            // No sub-activities
        },
        {
            id: "act-4",
            name: "Journaling",
            description: "Set intentions for the day",
            duration: 10,
            status: "pending",
            // No repetition data
            subActivities: [
                { id: "sub-4-1", name: "Write 3 gratitudes", completed: false },
                { id: "sub-4-2", name: "List daily goals", completed: false }
            ]
        },
        {
            id: "act-5",
            name: "Breakfast",
            description: "Nourish your body",
            duration: 20,
            status: "pending",
            // No repetition data
            // No sub-activities
        }
    ],
    currentActivityIndex: 1
};

// Get the appropriate icon for each activity
const getActivityIcon = (activityName: string, size = 24) => {
    switch (activityName.toLowerCase()) {
        case "yoga":
        case "workout":
        case "exercise":
            return <Dumbbell size={size} />;
        case "meditation":
        case "hydration":
            return <Coffee size={size} />;
        case "reading":
        case "journaling":
            return <BookOpen size={size} />;
        case "writing":
            return <PenLine size={size} />;
        case "breakfast":
        case "lunch":
        case "dinner":
            return <Utensils size={size} />;
        default:
            return activityName.charAt(0);
    }
};

// Consistent shadow for all elements
const CONSISTENT_SHADOW = "0px 0px 10px rgba(0, 0, 0, 0.08)";

export const FinalLoopExecutionScreen = () => {
    const [loopData, setLoopData] = useState<LoopData>(mockLoopData);
    const [isTimerRunning, setIsTimerRunning] = useState(true);
    const [timeRemaining, setTimeRemaining] = useState(8 * 60 + 15); // 8:15 left
    const [isOvertime, setIsOvertime] = useState(false);
    const [overtimeAmount, setOvertimeAmount] = useState(15); // 15 seconds overtime

    const currentActivity = loopData.activities[loopData.currentActivityIndex];
    const nextActivity = loopData.activities[loopData.currentActivityIndex + 1] || null;

    const handleToggleTimer = () => {
        setIsTimerRunning(!isTimerRunning);
    };

    const handleSkipActivity = () => {
        if (loopData.currentActivityIndex < loopData.activities.length - 1) {
            const updatedActivities = [...loopData.activities];
            updatedActivities[loopData.currentActivityIndex].status = "skipped";
            updatedActivities[loopData.currentActivityIndex + 1].status = "active";

            setLoopData({
                ...loopData,
                activities: updatedActivities,
                currentActivityIndex: loopData.currentActivityIndex + 1
            });

            // Reset timer for new activity
            const nextActivity = updatedActivities[loopData.currentActivityIndex + 1];
            if (nextActivity.duration) {
                setTimeRemaining(nextActivity.duration * 60);
            } else {
                setTimeRemaining(5 * 60); // Default 5 minutes if no duration specified
            }
            setIsOvertime(false);
            setOvertimeAmount(0);
        }
    };

    const handleCompleteActivity = () => {
        if (loopData.currentActivityIndex < loopData.activities.length - 1) {
            const updatedActivities = [...loopData.activities];
            updatedActivities[loopData.currentActivityIndex].status = "completed";
            updatedActivities[loopData.currentActivityIndex + 1].status = "active";

            setLoopData({
                ...loopData,
                activities: updatedActivities,
                currentActivityIndex: loopData.currentActivityIndex + 1
            });

            // Reset timer for new activity
            const nextActivity = updatedActivities[loopData.currentActivityIndex + 1];
            if (nextActivity.duration) {
                setTimeRemaining(nextActivity.duration * 60);
            } else {
                setTimeRemaining(5 * 60); // Default 5 minutes if no duration specified
            }
            setIsOvertime(false);
            setOvertimeAmount(0);
        }
    };

    const handleToggleSubActivity = (subActivityId: string) => {
        const updatedActivities = [...loopData.activities];
        const currentAct = updatedActivities[loopData.currentActivityIndex];

        if (currentAct.subActivities) {
            currentAct.subActivities = currentAct.subActivities.map(subAct => {
                if (subAct.id === subActivityId) {
                    return { ...subAct, completed: !subAct.completed };
                }
                return subAct;
            });

            setLoopData({
                ...loopData,
                activities: updatedActivities
            });
        }
    };

    const handleResetTimer = () => {
        if (currentActivity.duration) {
            setTimeRemaining(currentActivity.duration * 60);
        } else {
            setTimeRemaining(5 * 60); // Default 5 minutes if no duration specified
        }
        setIsOvertime(false);
        setOvertimeAmount(0);
    };

    // Convert seconds to minutes and seconds for timer display
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;

    // Calculate completion percentage for sub-activities
    const getCompletionPercentage = (activity: Activity) => {
        if (!activity.subActivities || activity.subActivities.length === 0) {
            return 0;
        }

        const completedSubActivities = activity.subActivities.filter(item => item.completed).length;
        const totalSubActivities = activity.subActivities.length;
        return Math.round((completedSubActivities / totalSubActivities) * 100);
    };

    // Check if the current activity has any optional fields
    const hasAnyOptionalField = currentActivity.duration ||
        (currentActivity.repetitionType && currentActivity.repetitionCount) ||
        (currentActivity.subActivities && currentActivity.subActivities.length > 0);

    return (
        <div className="h-full w-full max-w-md mx-auto bg-neutral-50 flex flex-col overflow-hidden">
            {/* Header with title - removed shadow and progress bar */}
            <div className="bg-white p-4 flex items-center justify-between border-b border-neutral-100">
                <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-neutral-50">
                    <ChevronLeft size={20} className="text-neutral-800" />
                </button>

                <div className="text-center">
                    <h3 className="font-medium text-neutral-800">{loopData.title}</h3>
                    <div className="text-xs text-neutral-500 mt-0.5">
                        {loopData.currentActivityIndex + 1} of {loopData.activities.length}
                    </div>
                </div>

                <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-neutral-50">
                    <MoreVertical size={20} className="text-neutral-800" />
                </button>
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto">
                {/* Activity Indicators - UPDATED to Icon Card style */}
                <div className="pt-6 pb-4 px-4">
                    <div className="grid grid-cols-5 gap-2 justify-items-center">
                        {loopData.activities.map((activity) => {
                            let cardClass = "";
                            let iconClass = "";
                            let statusIndicator = null;

                            switch (activity.status) {
                                case "completed":
                                    cardClass = "bg-white border-status-completed";
                                    iconClass = "text-status-completed";
                                    statusIndicator = (
                                        <div className="absolute -top-1.5 -right-1.5 size-6 rounded-full bg-status-completed text-white flex items-center justify-center shadow-sm">
                                            <Check size={14} />
                                        </div>
                                    );
                                    break;
                                case "active":
                                    cardClass = "bg-status-active";
                                    iconClass = "text-white";
                                    break;
                                case "skipped":
                                    cardClass = "bg-white border-status-skipped";
                                    iconClass = "text-status-skipped";
                                    statusIndicator = (
                                        <div className="absolute -top-1.5 -right-1.5 size-6 rounded-full bg-status-skipped text-white flex items-center justify-center shadow-sm">
                                            <X size={14} />
                                        </div>
                                    );
                                    break;
                                case "pending":
                                    cardClass = "bg-white border-neutral-200";
                                    iconClass = "text-neutral-400";
                                    break;
                            }

                            return (
                                <div key={activity.id} className="relative">
                                    <div
                                        className={`w-14 h-14 aspect-square rounded-lg border-2 ${cardClass} flex flex-col items-center justify-center`}
                                        style={{ boxShadow: activity.status === "active" ? CONSISTENT_SHADOW : "none" }}
                                    >
                                        <div className={`${iconClass}`}>
                                            {getActivityIcon(activity.name, 24)}
                                        </div>
                                    </div>
                                    {statusIndicator}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Horizontal divider */}
                <div className="mx-6 h-px bg-neutral-200 my-4"></div>

                {/* Current Activity Card - monochromatic with consistent shadow */}
                <div className="px-5 mb-6">
                    <div
                        className="bg-white rounded-2xl overflow-hidden"
                        style={{ boxShadow: CONSISTENT_SHADOW }}
                    >
                        {/* Activity Header */}
                        <div className="relative px-5 py-4 bg-neutral-800 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mr-3">
                                        {getActivityIcon(currentActivity.name, 24)}
                                    </div>
                                    <div>
                                        <h2 className="text-white">{currentActivity.name}</h2>
                                        <p className="text-sm text-white/80">{currentActivity.description}</p>
                                    </div>
                                </div>

                                {/* Progress Circle - only if there are sub-activities */}
                                {currentActivity.subActivities && currentActivity.subActivities.length > 0 && (
                                    <div className="relative w-10 h-10">
                                        <svg viewBox="0 0 36 36" className="w-10 h-10">
                                            <path
                                                d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="rgba(255, 255, 255, 0.2)"
                                                strokeWidth="3"
                                                strokeDasharray="100, 100"
                                            />
                                            <path
                                                d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="white"
                                                strokeWidth="3"
                                                strokeDasharray={`${getCompletionPercentage(currentActivity)}, 100`}
                                                strokeLinecap="round"
                                            />
                                            <text x="18" y="21" textAnchor="middle" className="text-[10px] fill-white font-medium">
                                                {getCompletionPercentage(currentActivity)}%
                                            </text>
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Activity Content - add visual interest when no optional fields are present */}
                        <div className={`px-5 ${!hasAnyOptionalField ? 'py-8' : 'py-0'}`}>
                            {/* Activity Metadata - only show sections that have data */}
                            {(currentActivity.duration || (currentActivity.repetitionType && currentActivity.repetitionCount)) && (
                                <div className="py-4 flex flex-wrap gap-3 border-b border-neutral-100">
                                    {currentActivity.duration && (
                                        <div className="flex items-center px-3 py-1.5 rounded-lg bg-neutral-100">
                                            <Clock size={14} className="text-neutral-600 mr-1.5" />
                                            <span className="text-sm text-neutral-700">
                                                {currentActivity.duration} {currentActivity.duration === 1 ? 'min' : 'mins'}
                                            </span>
                                        </div>
                                    )}

                                    {currentActivity.repetitionType && currentActivity.repetitionCount && (
                                        <div className="flex items-center px-3 py-1.5 rounded-lg bg-neutral-100">
                                            <Repeat size={14} className="text-neutral-600 mr-1.5" />
                                            <span className="text-sm text-neutral-700">
                                                {currentActivity.repetitionCount} {currentActivity.repetitionType}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Sub-activity Checklist - only if there are sub-activities */}
                            {currentActivity.subActivities && currentActivity.subActivities.length > 0 && (
                                <div className="py-4">
                                    <h4 className="mb-3 text-neutral-800">Sub-activities</h4>
                                    <div className="space-y-2.5">
                                        {currentActivity.subActivities.map((subActivity) => (
                                            <div
                                                key={subActivity.id}
                                                className="flex items-center p-3 rounded-lg bg-neutral-50 cursor-pointer hover:bg-neutral-100 transition-colors"
                                                onClick={() => handleToggleSubActivity(subActivity.id)}
                                            >
                                                <div
                                                    className={`w-5 h-5 flex items-center justify-center mr-3 ${subActivity.completed
                                                        ? 'bg-status-completed'
                                                        : 'border border-neutral-300'
                                                        }`}
                                                    style={{ borderRadius: '6px' }} // More rounded but not fully circular
                                                >
                                                    {subActivity.completed && <Check size={14} className="text-white" />}
                                                </div>
                                                <span className={subActivity.completed ? 'text-neutral-500 line-through' : 'text-neutral-800'}>
                                                    {subActivity.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Visual interest for empty activity card */}
                            {!hasAnyOptionalField && (
                                <div className="flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                                        {getActivityIcon(currentActivity.name, 28)}
                                    </div>
                                    <p className="text-neutral-500">Focus on completing this activity</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Next Activity Preview - monochromatic with consistent shadow */}
                {nextActivity && (
                    <div className="px-5 mb-6">
                        <h4 className="mb-2 text-neutral-700 px-1">Next Activity</h4>
                        <div
                            className="bg-white rounded-xl p-4"
                            style={{ boxShadow: CONSISTENT_SHADOW }}
                        >
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500 mr-3">
                                    {getActivityIcon(nextActivity.name, 18)}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-neutral-800">{nextActivity.name}</p>
                                    <div className="flex mt-1 space-x-2">
                                        {nextActivity.duration && (
                                            <div className="px-2 py-0.5 rounded bg-neutral-100 flex items-center">
                                                <Clock size={10} className="mr-1 text-neutral-500" />
                                                <span className="text-xs text-neutral-600">
                                                    {nextActivity.duration} {nextActivity.duration === 1 ? 'min' : 'mins'}
                                                </span>
                                            </div>
                                        )}

                                        {nextActivity.repetitionType && nextActivity.repetitionCount && (
                                            <div className="px-2 py-0.5 rounded bg-neutral-100 flex items-center">
                                                <Repeat size={10} className="mr-1 text-neutral-500" />
                                                <span className="text-xs text-neutral-600">
                                                    {nextActivity.repetitionCount} {nextActivity.repetitionType}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Original Floating Timer Controls - with consistent shadow */}
            <div
                className="fixed bottom-4 left-4 right-4 max-w-md mx-auto py-6 px-6 bg-white rounded-xl border border-neutral-200"
                style={{ boxShadow: CONSISTENT_SHADOW }}
            >
                {/* Timer Display */}
                <div className="relative flex items-center justify-center w-full mb-6">
                    {/* Main Timer (centered) */}
                    <div className="flex items-center">
                        {/* Minutes container */}
                        <div
                            className={`flex items-center justify-center w-24 h-20 rounded-xl ${isOvertime
                                ? 'bg-destructive/10 text-destructive border border-destructive/30'
                                : 'bg-white text-neutral-800 border border-neutral-200'
                                } transition-all duration-300`}
                            style={{ boxShadow: isOvertime ? 'none' : CONSISTENT_SHADOW }}
                        >
                            <span className="text-4xl font-medium">{minutes}</span>
                        </div>

                        {/* Separator */}
                        <div className={`flex items-center justify-center w-6 h-20 ${isOvertime ? 'text-destructive' : 'text-neutral-800'
                            } transition-colors duration-300`}>
                            <span className="text-4xl font-medium">:</span>
                        </div>

                        {/* Seconds container */}
                        <div
                            className={`flex items-center justify-center w-24 h-20 rounded-xl ${isOvertime
                                ? 'bg-destructive/10 text-destructive border border-destructive/30'
                                : 'bg-white text-neutral-800 border border-neutral-200'
                                } transition-all duration-300`}
                            style={{ boxShadow: isOvertime ? 'none' : CONSISTENT_SHADOW }}
                        >
                            <span className="text-4xl font-medium">{seconds < 10 ? `0${seconds}` : seconds}</span>
                        </div>
                    </div>

                    {/* Reset button (absolutely positioned) */}
                    <button
                        onClick={handleResetTimer}
                        className="absolute right-0 top-1/2 -translate-y-1/2 size-10 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors duration-200"
                    >
                        <RotateCcw size={20} className="text-neutral-500 hover:text-neutral-800" />
                    </button>

                    {/* Overtime indicator */}
                    {isOvertime && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-destructive/10 text-destructive font-medium whitespace-nowrap animate-pulse border border-destructive/30">
                            +{Math.floor(overtimeAmount / 60)}:{overtimeAmount % 60 < 10 ? `0${overtimeAmount % 60}` : overtimeAmount % 60} OVERTIME
                        </div>
                    )}
                </div>

                {/* Action Buttons - monochromatic */}
                <div className="flex items-center justify-between">
                    {/* Skip button */}
                    <button
                        onClick={handleSkipActivity}
                        className="flex flex-col items-center group"
                    >
                        <div
                            className="size-14 rounded-xl flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 group-hover:border-neutral-300 transition-all duration-200"
                            style={{ boxShadow: CONSISTENT_SHADOW }}
                        >
                            <SkipForward size={24} className="text-neutral-600 group-hover:text-neutral-800 transition-colors duration-200" />
                        </div>
                        <span className="mt-2 text-xs text-neutral-500 group-hover:text-neutral-800 transition-colors duration-200">Skip</span>
                    </button>

                    {/* Play/Pause button */}
                    <button
                        onClick={handleToggleTimer}
                        className="flex flex-col items-center"
                    >
                        <div
                            className="size-18 rounded-xl flex items-center justify-center bg-neutral-800 hover:bg-neutral-900 border border-neutral-800 shadow-lg transition-all duration-200"
                            style={{ boxShadow: CONSISTENT_SHADOW }}
                        >
                            {isTimerRunning ? (
                                <PauseCircle size={34} className="text-white" />
                            ) : (
                                <PlayCircle size={34} className="text-white" />
                            )}
                        </div>
                        <span className="mt-2 text-sm font-medium text-neutral-800">
                            {isTimerRunning ? 'Pause' : 'Resume'}
                        </span>
                    </button>

                    {/* Complete button */}
                    <button
                        onClick={handleCompleteActivity}
                        className="flex flex-col items-center group"
                    >
                        <div
                            className="size-14 rounded-xl flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 group-hover:border-neutral-300 transition-all duration-200"
                            style={{ boxShadow: CONSISTENT_SHADOW }}
                        >
                            <CheckCircle size={24} className="text-status-completed group-hover:text-status-completed transition-colors duration-200" />
                        </div>
                        <span className="mt-2 text-xs text-neutral-500 group-hover:text-neutral-800 transition-colors duration-200">Complete</span>
                    </button>
                </div>
            </div>
        </div>
    );
};