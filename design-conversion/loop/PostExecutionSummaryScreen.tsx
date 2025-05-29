import { useState } from "react";
import {
    ChevronLeft,
    MoreVertical,
    Clock,
    CheckCircle2,
    Calendar,
    Check,
    X,
    Edit,
    Save
} from "lucide-react";

// Types
type ActivityExecution = {
    id: string;
    name: string;
    icon: string;
    status: "completed" | "skipped" | "partial";
    plannedDuration: number;
    actualDuration: number;
    subActivitiesCompleted?: number;
    subActivitiesTotal?: number;
    notes?: string;
};

type LoopExecution = {
    id: string;
    date: Date;
    startTime: Date;
    endTime: Date;
    loopTitle: string;
    loopId: string;
    status: "completed" | "interrupted" | "partial";
    totalPlannedDuration: number;
    totalActualDuration: number;
    activitiesCompleted: number;
    activitiesTotal: number;
    completionRate: number;
    isPersonalBest: boolean;
    activities: ActivityExecution[];
    notes: string;
};

// Mock data
const mockExecution: LoopExecution = {
    id: "exec-1",
    date: new Date(),
    startTime: new Date(new Date().setHours(7, 30, 0, 0)),
    endTime: new Date(new Date().setHours(8, 25, 0, 0)),
    loopTitle: "Morning Routine",
    loopId: "loop-1",
    status: "completed",
    totalPlannedDuration: 55,
    totalActualDuration: 55,
    activitiesCompleted: 5,
    activitiesTotal: 5,
    completionRate: 100,
    isPersonalBest: true,
    activities: [
        {
            id: "act-1",
            name: "Hydration",
            icon: "droplets",
            status: "completed",
            plannedDuration: 1,
            actualDuration: 2,
            notes: "Drank a full glass of water and took vitamins"
        },
        {
            id: "act-2",
            name: "Meditation",
            icon: "coffee",
            status: "completed",
            plannedDuration: 10,
            actualDuration: 12,
            notes: "Focused on breath for 12 minutes, feeling centered"
        },
        {
            id: "act-3",
            name: "Quick Workout",
            icon: "dumbbell",
            status: "completed",
            plannedDuration: 15,
            actualDuration: 16,
            subActivitiesCompleted: 3,
            subActivitiesTotal: 3,
            notes: "Completed push-ups, sit-ups, and squats"
        },
        {
            id: "act-4",
            name: "Journaling",
            icon: "pen-line",
            status: "completed",
            plannedDuration: 10,
            actualDuration: 10,
            subActivitiesCompleted: 2,
            subActivitiesTotal: 2,
            notes: "Wrote gratitude list and set daily intentions"
        },
        {
            id: "act-5",
            name: "Breakfast",
            icon: "utensils",
            status: "completed",
            plannedDuration: 20,
            actualDuration: 15,
            notes: "Had oatmeal with fruit and a cup of coffee"
        }
    ],
    notes: "Great morning routine today! Feeling energized and ready for the day. The meditation session was particularly good, I felt very focused."
};

// Get the appropriate icon for each activity
const getActivityIcon = (iconName: string, size = 24) => {
    switch (iconName.toLowerCase()) {
        case "dumbbell":
            return <span className="material-icons" style={{ fontSize: size }}>fitness_center</span>;
        case "coffee":
            return <span className="material-icons" style={{ fontSize: size }}>coffee</span>;
        case "book-open":
            return <span className="material-icons" style={{ fontSize: size }}>menu_book</span>;
        case "pen-line":
            return <span className="material-icons" style={{ fontSize: size }}>edit</span>;
        case "utensils":
            return <span className="material-icons" style={{ fontSize: size }}>restaurant</span>;
        case "droplets":
            return <span className="material-icons" style={{ fontSize: size }}>water_drop</span>;
        default:
            return <span className="material-icons" style={{ fontSize: size }}>check_circle</span>;
    }
};

// Format time
const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Format duration
const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
        return `${hours} hr`;
    }

    return `${hours} hr ${remainingMinutes} min`;
};

// Monochrome gradients - elegant black with depth
const getGradient = (type: "primary" | "secondary" | "neutral" | "destructive") => {
    switch (type) {
        case "primary":
            return "bg-gradient-to-br from-gray-800 via-black to-gray-900"; // Deep black gradient
        case "secondary":
            return "bg-gradient-to-br from-gray-700 to-gray-800"; // Secondary black gradient
        case "neutral":
            return "bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200"; // Light gray gradient
        case "destructive":
            return "bg-gradient-to-br from-red-500 to-red-600"; // Using system destructive color
    }
};

export const PostExecutionSummaryScreen = () => {
    const [execution] = useState<LoopExecution>(mockExecution);
    const [editingNotes, setEditingNotes] = useState(false);
    const [executionNotes, setExecutionNotes] = useState(execution.notes);

    // Custom wave CSS for curved design
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

    // Handle saving notes
    const handleSaveNotes = () => {
        // Would typically save to backend
        setEditingNotes(false);
    };

    // Calculate time difference
    const timeDifference =
        (execution.endTime.getTime() - execution.startTime.getTime()) / (1000 * 60);

    // Format date
    const formatDate = (date: Date): string => {
        return date.toLocaleDateString([], {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="h-full w-full max-w-md mx-auto bg-white flex flex-col overflow-hidden">
            {/* Curved Header with Waves */}
            <div className="relative bg-white mb-6">
                <div className="h-12 bg-gray-900"></div>
                <div style={waveStyle}></div>

                <div className="px-5 py-3 flex items-center justify-between relative z-10">
                    <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white/90 text-neutral-600 shadow-md backdrop-blur-sm hover:bg-white transition-colors">
                        <ChevronLeft size={20} />
                    </button>

                    <div className="bg-white/90 backdrop-blur-sm px-5 py-2 rounded-full shadow-md">
                        <h3 className="font-medium text-neutral-900">Loop Summary</h3>
                    </div>

                    <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white/90 text-neutral-600 shadow-md backdrop-blur-sm hover:bg-white transition-colors">
                        <MoreVertical size={20} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto px-5 pb-24">
                {/* Completion Celebration Card */}
                <div
                    className="rounded-[28px] overflow-hidden shadow-lg border border-neutral-100 mb-6"
                    style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)' }}
                >
                    <div
                        className={`relative px-5 py-5 text-white ${getGradient("primary")}`}
                        style={{
                            borderBottomLeftRadius: '60% 30%',
                            borderBottomRightRadius: '60% 30%',
                            boxShadow: 'inset 0 -10px 15px -12px rgba(0, 0, 0, 0.2)'
                        }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="font-medium text-xl">
                                {execution.status === "completed" ? "Great job!" : execution.status === "partial" ? "Good effort!" : "Loop interrupted"}
                            </h2>
                            {execution.isPersonalBest && (
                                <div className="flex items-center px-3 py-1 rounded-full bg-white/20 text-white text-xs backdrop-blur-sm">
                                    Personal Best
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-white/80">
                            {execution.status === "completed"
                                ? `You completed all ${execution.activitiesTotal} activities in your ${execution.loopTitle}`
                                : `You completed ${execution.activitiesCompleted} of ${execution.activitiesTotal} activities in your ${execution.loopTitle}`}
                        </p>
                    </div>

                    <div className="p-5">
                        <div className="text-sm text-neutral-500 mb-2">
                            {formatDate(execution.date)} • {formatTime(execution.startTime)} - {formatTime(execution.endTime)}
                        </div>

                        {/* Stats Overview */}
                        <div className="grid grid-cols-3 gap-4 mb-5">
                            <div>
                                <div className="text-xs text-neutral-500 mb-1">Completion</div>
                                <div className="text-xl font-medium text-neutral-800">{execution.completionRate}%</div>
                            </div>

                            <div>
                                <div className="text-xs text-neutral-500 mb-1">Actual Time</div>
                                <div className="text-xl font-medium text-neutral-800">{formatDuration(execution.totalActualDuration)}</div>
                            </div>

                            <div>
                                <div className="text-xs text-neutral-500 mb-1">Planned Time</div>
                                <div className="text-xl font-medium text-neutral-800">{formatDuration(execution.totalPlannedDuration)}</div>
                            </div>
                        </div>

                        {/* Time Efficiency */}
                        <div
                            className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 mb-2"
                            style={{ boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)' }}
                        >
                            <div>
                                <div className="text-sm font-medium text-neutral-700">Time Efficiency</div>
                                <div className="text-xs text-neutral-500">
                                    {execution.totalPlannedDuration > execution.totalActualDuration
                                        ? `${Math.round((execution.totalPlannedDuration - execution.totalActualDuration) / execution.totalPlannedDuration * 100)}% faster than planned`
                                        : execution.totalPlannedDuration < execution.totalActualDuration
                                            ? `${Math.round((execution.totalActualDuration - execution.totalPlannedDuration) / execution.totalPlannedDuration * 100)}% longer than planned`
                                            : "Exactly as planned"}
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-neutral-700 text-white">
                                <Clock size={18} />
                            </div>
                        </div>

                        {/* Completion Rate */}
                        <div
                            className="flex items-center justify-between p-3 rounded-xl bg-neutral-50"
                            style={{ boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)' }}
                        >
                            <div>
                                <div className="text-sm font-medium text-neutral-700">Completion Rate</div>
                                <div className="text-xs text-neutral-500">
                                    {execution.activitiesCompleted} of {execution.activitiesTotal} activities completed
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-neutral-700 text-white">
                                <CheckCircle2 size={18} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activities Breakdown */}
                <div
                    className="rounded-[28px] overflow-hidden shadow-lg border border-neutral-100 mb-6"
                    style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)' }}
                >
                    <div
                        className={`relative px-5 py-4 text-white ${getGradient("primary")}`}
                        style={{
                            borderBottomLeftRadius: '60% 30%',
                            borderBottomRightRadius: '60% 30%',
                            boxShadow: 'inset 0 -10px 15px -12px rgba(0, 0, 0, 0.2)'
                        }}
                    >
                        <h3 className="font-medium">Activity Breakdown</h3>
                    </div>

                    <div className="divide-y divide-neutral-100">
                        {execution.activities.map((activity, index) => (
                            <div key={activity.id} className="p-4">
                                <div className="flex items-start">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${activity.status === "completed"
                                                ? "bg-neutral-700 text-white"
                                                : activity.status === "partial"
                                                    ? "bg-neutral-400 text-white"
                                                    : "bg-neutral-300 text-neutral-600"
                                            }`}
                                        style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}
                                    >
                                        {activity.status === "completed" ? (
                                            <Check size={18} />
                                        ) : activity.status === "skipped" ? (
                                            <X size={18} />
                                        ) : (
                                            index + 1
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="font-medium text-neutral-800">{activity.name}</h4>

                                                <div className="flex items-center mt-1 space-x-4">
                                                    <div className="flex items-center text-xs text-neutral-500">
                                                        <Clock size={12} className="mr-1" />
                                                        <span>
                                                            {activity.actualDuration} min
                                                            {activity.actualDuration !== activity.plannedDuration && (
                                                                <span className="text-neutral-400 ml-1">
                                                                    (planned: {activity.plannedDuration} min)
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>

                                                    {activity.subActivitiesCompleted !== undefined && activity.subActivitiesTotal !== undefined && (
                                                        <div className="flex items-center text-xs text-neutral-500">
                                                            <CheckCircle2 size={12} className="mr-1" />
                                                            <span>{activity.subActivitiesCompleted}/{activity.subActivitiesTotal}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {activity.notes && (
                                                    <div className="mt-2 p-2 rounded-lg bg-neutral-50 text-xs text-neutral-600">
                                                        {activity.notes}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-sm text-neutral-500">
                                                {activity.status === "completed"
                                                    ? "Completed"
                                                    : activity.status === "partial"
                                                        ? "Partial"
                                                        : "Skipped"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Session Notes */}
                <div
                    className="rounded-[28px] overflow-hidden shadow-lg border border-neutral-100 mb-6"
                    style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)' }}
                >
                    <div
                        className={`relative px-5 py-4 text-white ${getGradient("primary")}`}
                        style={{
                            borderBottomLeftRadius: '60% 30%',
                            borderBottomRightRadius: '60% 30%',
                            boxShadow: 'inset 0 -10px 15px -12px rgba(0, 0, 0, 0.2)'
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium">Session Notes</h3>
                            {!editingNotes && (
                                <button
                                    onClick={() => setEditingNotes(true)}
                                    className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20 text-white backdrop-blur-sm"
                                >
                                    <Edit size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="p-5">
                        {editingNotes ? (
                            <div className="space-y-3">
                                <textarea
                                    value={executionNotes}
                                    onChange={(e) => setExecutionNotes(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-neutral-50 min-h-[120px] text-neutral-800 resize-none"
                                    placeholder="Add notes about this session..."
                                />

                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => {
                                            setExecutionNotes(execution.notes);
                                            setEditingNotes(false);
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveNotes}
                                        className="px-3 py-1.5 rounded-lg bg-neutral-700 text-white"
                                    >
                                        Save Notes
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                {executionNotes ? (
                                    <p className="text-neutral-700 whitespace-pre-wrap">{executionNotes}</p>
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-neutral-400 mb-2">No notes for this session</p>
                                        <button
                                            onClick={() => setEditingNotes(true)}
                                            className="px-4 py-2 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center mx-auto"
                                        >
                                            <Edit size={16} className="mr-2" />
                                            Add Notes
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex mb-6">
                    <button
                        className="w-full py-3 rounded-[28px] flex items-center justify-center bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                        style={{ boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)' }}
                    >
                        <Calendar size={18} className="mr-2" />
                        Schedule Next
                    </button>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div
                className="fixed bottom-4 left-4 right-4 max-w-md mx-auto py-4 px-5 rounded-[28px] bg-white"
                style={{
                    boxShadow: '0 -5px 25px rgba(0, 0, 0, 0.08), 0 10px 20px rgba(0, 0, 0, 0.05)'
                }}
            >
                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        className="px-5 py-3 rounded-xl bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    >
                        Back to Home
                    </button>

                    <button
                        type="button"
                        className={`px-5 py-3 rounded-xl flex items-center ${getGradient("primary")} text-white`}
                    >
                        <Save size={18} className="mr-2" />
                        Save Summary
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostExecutionSummaryScreen;