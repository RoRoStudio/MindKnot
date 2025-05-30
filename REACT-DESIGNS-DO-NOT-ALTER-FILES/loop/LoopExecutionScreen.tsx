import { useState } from "react";
import { ChevronLeft, MoreVertical, Dumbbell, Coffee, BookOpen, PenLine, Utensils, Clock, Repeat, RotateCcw, CheckCircle, SkipForward, PlayCircle, PauseCircle, Check, X, ArrowRight } from "lucide-react";

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

// Monochrome gradients - elegant black with depth
const getGradient = (type: "primary" | "completed" | "neutral" | "destructive") => {
    switch (type) {
        case "primary":
            return "bg-gradient-to-br from-gray-800 via-black to-gray-900"; // Deep black gradient with sophistication
        case "secondary":
            return "bg-gradient-to-br from-gray-700 to-gray-800"; // Secondary black gradient
        case "neutral":
            return "bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200"; // Light gray gradient
        case "destructive":
            return "bg-gradient-to-br from-red-500 to-red-600"; // Using system destructive color
    }
};

// Using CSS variables for status colors from our theme
const getStatusColor = (status: "pending" | "active" | "completed" | "skipped") => {
    switch (status) {
        case "completed":
            return "var(--status-completed)";
        case "active":
            return "var(--color-chart-2)"; // Using blue from chart colors
        case "skipped":
            return "var(--status-skipped)";
        case "pending":
            return "var(--status-pending)";
    }
};

export const LoopExecutionScreen = () => {
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

    // Get overall completion percentage
    const getOverallCompletion = () => {
        const completedActivities = loopData.activities.filter(a => a.status === "completed").length;
        const skippedActivities = loopData.activities.filter(a => a.status === "skipped").length;
        const totalActivities = loopData.activities.length;

        return Math.round(((completedActivities + skippedActivities) / totalActivities) * 100);
    };

    // Check if the current activity has any optional fields
    const hasAnyOptionalField = currentActivity.duration ||
        (currentActivity.repetitionType && currentActivity.repetitionCount) ||
        (currentActivity.subActivities && currentActivity.subActivities.length > 0);

    // Custom wave CSS for curved design - MONOCHROME VERSION
    const waveStyle = {
        position: 'absolute' as 'absolute',
        top: '60px',
        left: '0',
        width: '100%',
        height: '120px',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' opacity='.25' class='shape-fill' fill='%23111827'%3E%3C/path%3E%3Cpath d='M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z' opacity='.5' class='shape-fill' fill='%23111827'%3E%3C/path%3E%3Cpath d='M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z' class='shape-fill' fill='%23111827' opacity='.75'%3E%3C/path%3E%3C/svg%3E")`,
        backgroundSize: 'cover',
        zIndex: '-1',
    };

    return (
        <div className="h-full w-full max-w-md mx-auto bg-white flex flex-col overflow-hidden">
            {/* Curved Header with Waves - no gradient bar */}
            <div className="relative bg-white mb-8">
                <div className="h-12 bg-gray-900"></div>
                <div style={waveStyle}></div>

                <div className="px-5 py-3 flex items-center justify-between relative z-10">
                    <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white/90 text-neutral-600 shadow-md backdrop-blur-sm hover:bg-white transition-colors">
                        <ChevronLeft size={20} />
                    </button>

                    <div className="bg-white/90 backdrop-blur-sm px-5 py-2 rounded-full shadow-md">
                        <h3 className="font-medium text-neutral-900">{loopData.title}</h3>
                        <div className="text-xs text-neutral-500 text-center mt-0.5">
                            {loopData.currentActivityIndex + 1} of {loopData.activities.length}
                        </div>
                    </div>

                    <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white/90 text-neutral-600 shadow-md backdrop-blur-sm hover:bg-white transition-colors">
                        <MoreVertical size={20} />
                    </button>
                </div>
            </div>

            {/* Activity Indicators - With colored borders instead of filled circles */}
            <div className="px-5 pt-2 pb-6 flex justify-center">
                <div className="flex items-center justify-between gap-3">
                    {loopData.activities.map((activity, index) => {
                        let bgColor = "bg-white";
                        let iconColor = "text-neutral-600";
                        let borderColor = "border-neutral-200";
                        let borderWidth = "border-2";
                        let shadowStyle = {};
                        let statusColor = getStatusColor(activity.status);

                        switch (activity.status) {
                            case "completed":
                                bgColor = "bg-white";
                                iconColor = "text-neutral-600";
                                borderColor = `border-[${statusColor}]`;
                                borderWidth = "border-3";
                                shadowStyle = { boxShadow: `0 0 10px ${statusColor}40` };
                                break;
                            case "active":
                                bgColor = "bg-white";
                                iconColor = "text-neutral-600";
                                borderColor = `border-[${statusColor}]`;
                                borderWidth = "border-3";
                                shadowStyle = { boxShadow: `0 0 15px ${statusColor}40` };
                                break;
                            case "skipped":
                                bgColor = "bg-white";
                                iconColor = "text-neutral-500";
                                borderColor = `border-[${statusColor}]`;
                                borderWidth = "border-2";
                                break;
                            case "pending":
                                bgColor = "bg-white";
                                iconColor = "text-neutral-400";
                                borderColor = `border-[${statusColor}]`;
                                borderWidth = "border-2";
                                break;
                        }

                        return (
                            <div key={activity.id}>
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center ${bgColor} ${borderWidth}`}
                                    style={{
                                        borderColor: statusColor,
                                        ...shadowStyle
                                    }}
                                >
                                    <div className={iconColor}>
                                        {activity.status === "completed" ? (
                                            <Check size={20} style={{ color: statusColor }} />
                                        ) : activity.status === "skipped" ? (
                                            <X size={20} style={{ color: statusColor }} />
                                        ) : (
                                            getActivityIcon(activity.name, 20)
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto px-5 pb-24">
                {/* Current Activity Card - Curved Style */}
                <div className="mb-6">
                    <div
                        className="rounded-[28px] overflow-hidden shadow-lg border border-neutral-100"
                        style={{
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)'
                        }}
                    >
                        {/* Activity Header with flowing gradient - monochromatic */}
                        <div
                            className={`relative px-5 py-5 text-white ${getGradient("primary")}`}
                            style={{
                                borderBottomLeftRadius: '60% 30%',
                                borderBottomRightRadius: '60% 30%',
                                boxShadow: 'inset 0 -10px 15px -12px rgba(0, 0, 0, 0.2)'
                            }}
                        >
                            <div className="flex items-center">
                                <div
                                    className="w-14 h-14 rounded-full flex items-center justify-center mr-4 bg-white/20 backdrop-blur-sm"
                                    style={{
                                        boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)',
                                        border: '2px solid rgba(255, 255, 255, 0.3)'
                                    }}
                                >
                                    {getActivityIcon(currentActivity.name, 26)}
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">{currentActivity.name}</h3>
                                    <p className="text-sm text-white/80">{currentActivity.description}</p>
                                </div>
                            </div>

                            {/* Progress arc for sub-activities - uses status color for active */}
                            {currentActivity.subActivities && currentActivity.subActivities.length > 0 && (
                                <div
                                    className="absolute top-4 right-4 w-14 h-14 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm"
                                    style={{
                                        boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)',
                                        border: '1px solid rgba(255, 255, 255, 0.3)'
                                    }}
                                >
                                    <svg viewBox="0 0 36 36" className="w-12 h-12 absolute">
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
                                            stroke="rgba(255, 255, 255, 0.8)"
                                            strokeWidth="3"
                                            strokeDasharray={`${getCompletionPercentage(currentActivity)}, 100`}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="z-10 text-white font-medium">
                                        {getCompletionPercentage(currentActivity)}%
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Activity Content */}
                        <div className="p-5">
                            {/* Activity Metadata */}
                            {(currentActivity.duration || (currentActivity.repetitionType && currentActivity.repetitionCount)) && (
                                <div className="flex flex-wrap gap-2 mb-5">
                                    {currentActivity.duration && (
                                        <div
                                            className="flex items-center px-4 py-2 rounded-full bg-neutral-50"
                                            style={{ boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)' }}
                                        >
                                            <Clock size={16} className="text-gray-700 mr-2" />
                                            <span className="text-sm text-neutral-700">
                                                {currentActivity.duration} {currentActivity.duration === 1 ? 'min' : 'mins'}
                                            </span>
                                        </div>
                                    )}

                                    {currentActivity.repetitionType && currentActivity.repetitionCount && (
                                        <div
                                            className="flex items-center px-4 py-2 rounded-full bg-neutral-50"
                                            style={{ boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)' }}
                                        >
                                            <Repeat size={16} className="text-gray-700 mr-2" />
                                            <span className="text-sm text-neutral-700">
                                                {currentActivity.repetitionCount} {currentActivity.repetitionType}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Sub-activity Checklist - with enhanced shadow for completed items */}
                            {currentActivity.subActivities && currentActivity.subActivities.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-neutral-800 font-medium">Tasks</h4>
                                        <div
                                            className="flex items-center px-3 py-1 rounded-full bg-neutral-100"
                                            style={{ boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.03)' }}
                                        >
                                            <span className="text-xs text-neutral-600">
                                                {currentActivity.subActivities.filter(sa => sa.completed).length} of {currentActivity.subActivities.length}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {currentActivity.subActivities.map((subActivity) => {
                                            const completedColor = getStatusColor("completed");

                                            return (
                                                <div
                                                    key={subActivity.id}
                                                    className="flex items-center p-3 rounded-2xl bg-neutral-50 cursor-pointer hover:bg-neutral-100 transition-colors"
                                                    onClick={() => handleToggleSubActivity(subActivity.id)}
                                                    style={{ boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)' }}
                                                >
                                                    <div
                                                        className={`w-6 h-6 flex items-center justify-center mr-3 rounded-full bg-white border-2`}
                                                        style={{
                                                            borderColor: subActivity.completed ? completedColor : '#d1d5db',
                                                            boxShadow: subActivity.completed
                                                                ? `0 0 12px ${completedColor}60`
                                                                : 'none',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                    >
                                                        {subActivity.completed && (
                                                            <Check
                                                                size={14}
                                                                style={{
                                                                    color: completedColor,
                                                                    filter: `drop-shadow(0 0 3px ${completedColor}80)`
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                    <span className={subActivity.completed ? 'text-neutral-500 line-through' : 'text-neutral-800'}>
                                                        {subActivity.name}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Next Activity Preview */}
                {nextActivity && (
                    <div className="mb-6">
                        <div className="flex items-center mb-2">
                            <h4 className="text-sm text-neutral-700">Next Activity</h4>
                            <ArrowRight size={14} className="ml-1 text-neutral-400" />
                        </div>
                        <div
                            className="p-4 rounded-[24px] bg-white border border-neutral-100"
                            style={{ boxShadow: '0 5px 15px rgba(0, 0, 0, 0.03)' }}
                        >
                            <div className="flex items-center">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center mr-3 bg-neutral-100 text-neutral-500"
                                    style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}
                                >
                                    {getActivityIcon(nextActivity.name, 20)}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-neutral-800">{nextActivity.name}</p>
                                    <div className="flex mt-1 space-x-2">
                                        {nextActivity.duration && (
                                            <div className="px-2 py-0.5 rounded-full bg-neutral-50 flex items-center">
                                                <Clock size={10} className="mr-1 text-neutral-500" />
                                                <span className="text-xs text-neutral-700">
                                                    {nextActivity.duration} min
                                                </span>
                                            </div>
                                        )}

                                        {nextActivity.repetitionType && nextActivity.repetitionCount && (
                                            <div className="px-2 py-0.5 rounded-full bg-neutral-50 flex items-center">
                                                <Repeat size={10} className="mr-1 text-neutral-500" />
                                                <span className="text-xs text-neutral-700">
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

            {/* Floating Timer Controls with curved design */}
            <div
                className="fixed bottom-4 left-4 right-4 max-w-md mx-auto py-4 px-5 rounded-[28px] bg-white"
                style={{
                    boxShadow: '0 -5px 25px rgba(0, 0, 0, 0.08), 0 10px 20px rgba(0, 0, 0, 0.05)'
                }}
            >
                {/* Timer Display */}
                <div className="relative flex items-center justify-center w-full mb-4">
                    {/* Timer Container with curved edges */}
                    <div
                        className="flex rounded-[22px] overflow-hidden"
                        style={{
                            boxShadow: isOvertime
                                ? '0 0 15px rgba(239, 68, 68, 0.2)'
                                : '0 5px 15px rgba(0, 0, 0, 0.05)'
                        }}
                    >
                        {/* Minutes */}
                        <div
                            className={`flex items-center justify-center w-24 h-16 ${isOvertime ? 'bg-destructive/10 text-destructive' : `${getGradient("primary")} text-white`
                                }`}
                        >
                            <span className="text-3xl font-light">{minutes}</span>
                        </div>

                        {/* Separator */}
                        <div
                            className={`flex items-center justify-center w-8 h-16 ${isOvertime ? 'bg-destructive/5 text-destructive' : `${getGradient("primary")} text-white`
                                }`}
                        >
                            <span className="text-3xl font-light">:</span>
                        </div>

                        {/* Seconds */}
                        <div
                            className={`flex items-center justify-center w-24 h-16 ${isOvertime ? 'bg-destructive/10 text-destructive' : `${getGradient("primary")} text-white`
                                }`}
                        >
                            <span className="text-3xl font-light">{seconds < 10 ? `0${seconds}` : seconds}</span>
                        </div>
                    </div>

                    {/* Reset button */}
                    <button
                        onClick={handleResetTimer}
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-white border border-neutral-100 text-neutral-500 hover:bg-neutral-50 transition-colors"
                        style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}
                    >
                        <RotateCcw size={18} />
                    </button>

                    {/* Overtime indicator */}
                    {isOvertime && (
                        <div
                            className="absolute -top-10 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-destructive/10 text-destructive font-medium whitespace-nowrap animate-pulse"
                            style={{ boxShadow: '0 0 15px rgba(239, 68, 68, 0.25)' }}
                        >
                            +{Math.floor(overtimeAmount / 60)}:{overtimeAmount % 60 < 10 ? `0${overtimeAmount % 60}` : overtimeAmount % 60} overtime
                        </div>
                    )}
                </div>

                {/* Action Buttons - curved design */}
                <div className="flex items-center justify-between">
                    {/* Skip button */}
                    <button
                        onClick={handleSkipActivity}
                        className="flex flex-col items-center group"
                    >
                        <div
                            className="w-14 h-14 rounded-full flex items-center justify-center bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors"
                            style={{ boxShadow: '0 3px 10px rgba(0, 0, 0, 0.05)' }}
                        >
                            <SkipForward size={22} />
                        </div>
                        <span className="mt-2 text-xs text-neutral-500">Skip</span>
                    </button>

                    {/* Play/Pause button - with gradient */}
                    <button
                        onClick={handleToggleTimer}
                        className="flex flex-col items-center"
                    >
                        <div
                            className={`w-20 h-20 rounded-full flex items-center justify-center text-white ${getGradient("primary")}`}
                            style={{
                                boxShadow: '0 0 25px rgba(0, 0, 0, 0.2)',
                                transform: 'translateY(-10px)'
                            }}
                        >
                            {isTimerRunning ? (
                                <PauseCircle size={38} />
                            ) : (
                                <PlayCircle size={38} />
                            )}
                        </div>
                        <span className="text-sm font-medium text-neutral-800">
                            {isTimerRunning ? 'Pause' : 'Resume'}
                        </span>
                    </button>

                    {/* Complete button - with just border in the right color */}
                    <button
                        onClick={handleCompleteActivity}
                        className="flex flex-col items-center group"
                    >
                        <div
                            className="w-14 h-14 rounded-full flex items-center justify-center bg-white"
                            style={{
                                border: `3px solid ${getStatusColor("completed")}`,
                                boxShadow: `0 0 15px ${getStatusColor("completed")}40`
                            }}
                        >
                            <CheckCircle
                                size={22}
                                style={{
                                    color: getStatusColor("completed"),
                                    filter: `drop-shadow(0 0 2px ${getStatusColor("completed")}60)`
                                }}
                            />
                        </div>
                        <span className="mt-2 text-xs text-neutral-500">Complete</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoopExecutionScreen;