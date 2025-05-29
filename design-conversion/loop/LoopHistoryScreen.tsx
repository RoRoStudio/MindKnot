import { useState } from "react";
import {
    ChevronLeft,
    MoreVertical,
    Download,
    Search,
    CheckCircle2,
    X,
    BarChart2,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    Clock3,
    FileDown,
    Printer,
    Filter,
    Calendar,
    Check,
    ChevronRight
} from "lucide-react";

// Types
type ExecutionStatus = "completed" | "interrupted" | "partial";

type ActivityExecution = {
    id: string;
    name: string;
    icon: string;
    status: "completed" | "skipped" | "partial";
    plannedDuration: number;
    actualDuration: number;
    subActivitiesCompleted?: number;
    subActivitiesTotal?: number;
};

type Execution = {
    id: string;
    date: Date;
    startTime: Date;
    endTime: Date;
    status: ExecutionStatus;
    totalPlannedDuration: number;
    totalActualDuration: number;
    activitiesCompleted: number;
    activitiesTotal: number;
    completionRate: number;
    isPersonalBest: boolean;
    activities: ActivityExecution[];
    notes?: string;
};

type MonthData = {
    month: number; // 0-11
    year: number;
    totalExecutions: number;
    totalCompletedExecutions: number;
    totalTime: number; // minutes
    bestCompletionRate: number;
    averageCompletionRate: number;
};

type LoopHistory = {
    loopId: string;
    loopTitle: string;
    totalExecutions: number;
    totalTimeSpent: number; // minutes
    averageCompletionRate: number;
    recentExecutions: Execution[];
    personalBests: {
        fastestExecution: {
            executionId: string;
            date: Date;
            duration: number;
        };
        highestCompletion: {
            executionId: string;
            date: Date;
            completionRate: number;
        };
    };
    monthlyData: MonthData[];
};

// Sample history data
const sampleHistory: LoopHistory = {
    loopId: "loop-1",
    loopTitle: "Morning Routine",
    totalExecutions: 32,
    totalTimeSpent: 1720, // ~28.7 hours
    averageCompletionRate: 86,
    recentExecutions: [
        // Sample execution for today
        {
            id: "exec-1",
            date: new Date(),
            startTime: new Date(new Date().setHours(7, 30, 0, 0)),
            endTime: new Date(new Date().setHours(8, 25, 0, 0)),
            status: "completed",
            totalPlannedDuration: 55,
            totalActualDuration: 55,
            activitiesCompleted: 5,
            activitiesTotal: 5,
            completionRate: 100,
            isPersonalBest: true,
            activities: [
                { id: "act-1", name: "Hydration", icon: "droplets", status: "completed", plannedDuration: 1, actualDuration: 2 },
                { id: "act-2", name: "Meditation", icon: "coffee", status: "completed", plannedDuration: 10, actualDuration: 12 },
                { id: "act-3", name: "Quick Workout", icon: "dumbbell", status: "completed", plannedDuration: 15, actualDuration: 16, subActivitiesCompleted: 3, subActivitiesTotal: 3 },
                { id: "act-4", name: "Journaling", icon: "pen-line", status: "completed", plannedDuration: 10, actualDuration: 10, subActivitiesCompleted: 2, subActivitiesTotal: 2 },
                { id: "act-5", name: "Breakfast", icon: "utensils", status: "completed", plannedDuration: 20, actualDuration: 15 }
            ]
        },
        // Sample execution for yesterday
        {
            id: "exec-2",
            date: new Date(new Date().setDate(new Date().getDate() - 1)),
            startTime: new Date(new Date().setHours(7, 35, 0, 0) - 86400000),
            endTime: new Date(new Date().setHours(8, 20, 0, 0) - 86400000),
            status: "partial",
            totalPlannedDuration: 55,
            totalActualDuration: 45,
            activitiesCompleted: 3,
            activitiesTotal: 5,
            completionRate: 60,
            isPersonalBest: false,
            activities: [
                { id: "act-1", name: "Hydration", icon: "droplets", status: "completed", plannedDuration: 1, actualDuration: 1 },
                { id: "act-2", name: "Meditation", icon: "coffee", status: "completed", plannedDuration: 10, actualDuration: 12 },
                { id: "act-3", name: "Quick Workout", icon: "dumbbell", status: "partial", plannedDuration: 15, actualDuration: 18, subActivitiesCompleted: 2, subActivitiesTotal: 3 },
                { id: "act-4", name: "Journaling", icon: "pen-line", status: "completed", plannedDuration: 10, actualDuration: 14, subActivitiesCompleted: 2, subActivitiesTotal: 2 },
                { id: "act-5", name: "Breakfast", icon: "utensils", status: "skipped", plannedDuration: 20, actualDuration: 0 }
            ]
        },
        // Sample execution for 2 days ago
        {
            id: "exec-3",
            date: new Date(new Date().setDate(new Date().getDate() - 2)),
            startTime: new Date(new Date().setHours(7, 40, 0, 0) - 172800000),
            endTime: new Date(new Date().setHours(8, 30, 0, 0) - 172800000),
            status: "completed",
            totalPlannedDuration: 55,
            totalActualDuration: 50,
            activitiesCompleted: 5,
            activitiesTotal: 5,
            completionRate: 100,
            isPersonalBest: false,
            activities: [
                { id: "act-1", name: "Hydration", icon: "droplets", status: "completed", plannedDuration: 1, actualDuration: 1 },
                { id: "act-2", name: "Meditation", icon: "coffee", status: "completed", plannedDuration: 10, actualDuration: 8 },
                { id: "act-3", name: "Quick Workout", icon: "dumbbell", status: "completed", plannedDuration: 15, actualDuration: 14, subActivitiesCompleted: 3, subActivitiesTotal: 3 },
                { id: "act-4", name: "Journaling", icon: "pen-line", status: "completed", plannedDuration: 10, actualDuration: 12, subActivitiesCompleted: 2, subActivitiesTotal: 2 },
                { id: "act-5", name: "Breakfast", icon: "utensils", status: "completed", plannedDuration: 20, actualDuration: 15 }
            ]
        }
    ],
    personalBests: {
        fastestExecution: {
            executionId: "exec-4",
            date: new Date(new Date().setDate(new Date().getDate() - 7)),
            duration: 48
        },
        highestCompletion: {
            executionId: "exec-1",
            date: new Date(),
            completionRate: 100
        }
    },
    monthlyData: [
        { month: 0, year: 2025, totalExecutions: 15, totalCompletedExecutions: 13, totalTime: 750, bestCompletionRate: 100, averageCompletionRate: 87 },
        { month: 1, year: 2025, totalExecutions: 12, totalCompletedExecutions: 9, totalTime: 560, bestCompletionRate: 100, averageCompletionRate: 75 },
        { month: 2, year: 2025, totalExecutions: 14, totalCompletedExecutions: 12, totalTime: 640, bestCompletionRate: 100, averageCompletionRate: 85 },
        { month: 3, year: 2025, totalExecutions: 10, totalCompletedExecutions: 8, totalTime: 480, bestCompletionRate: 100, averageCompletionRate: 80 },
        { month: 4, year: 2025, totalExecutions: 12, totalCompletedExecutions: 11, totalTime: 520, bestCompletionRate: 100, averageCompletionRate: 92 }
    ]
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

// Format date
const formatDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
    } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
};

// Format time
const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Format minutes to hours and minutes
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

// Get status color
const getStatusColor = (status: "completed" | "skipped" | "partial" | "interrupted"): string => {
    switch (status) {
        case "completed":
            return "bg-neutral-700 text-white"; // Dark neutral for completed
        case "partial":
            return "bg-neutral-500/20 text-neutral-700"; // Light neutral for partial
        case "skipped":
        case "interrupted":
            return "bg-neutral-300/20 text-neutral-500"; // Lighter neutral for skipped
    }
};

// Get month name
const getMonthName = (month: number): string => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return monthNames[month];
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

export const LoopHistoryScreen = () => {
    const [history] = useState<LoopHistory>(sampleHistory);
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [showStatusFilter, setShowStatusFilter] = useState(false);
    const [activeTab, setActiveTab] = useState<"executions" | "stats">("executions");
    const [search, setSearch] = useState("");

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

    // Group executions by date
    const executionsByDate = history.recentExecutions.reduce<Record<string, Execution[]>>((acc, execution) => {
        const dateStr = formatDate(execution.date);
        if (!acc[dateStr]) {
            acc[dateStr] = [];
        }
        acc[dateStr].push(execution);
        return acc;
    }, {});

    return (
        <div className="h-full w-full max-w-md mx-auto bg-white flex flex-col overflow-hidden">
            {/* Curved Header with Waves */}
            <div className="relative bg-white mb-3">
                <div className="h-12 bg-gray-900"></div>
                <div style={waveStyle}></div>

                <div className="px-5 py-3 flex items-center justify-between relative z-10">
                    <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white/90 text-neutral-600 shadow-md backdrop-blur-sm hover:bg-white transition-colors">
                        <ChevronLeft size={20} />
                    </button>

                    <div className="bg-white/90 backdrop-blur-sm px-5 py-2 rounded-full shadow-md">
                        <h3 className="font-medium text-neutral-900">History & Analytics</h3>
                    </div>

                    <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white/90 text-neutral-600 shadow-md backdrop-blur-sm hover:bg-white transition-colors">
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {/* Loop Info */}
            <div className="px-5">
                <div
                    className="rounded-[28px] overflow-hidden shadow-lg border border-neutral-100"
                    style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)' }}
                >
                    {/* Loop Header with gradient */}
                    <div
                        className={`relative px-5 py-4 text-white ${getGradient("primary")}`}
                        style={{
                            borderBottomLeftRadius: '60% 30%',
                            borderBottomRightRadius: '60% 30%',
                            boxShadow: 'inset 0 -10px 15px -12px rgba(0, 0, 0, 0.2)'
                        }}
                    >
                        <h2 className="font-medium">{history.loopTitle}</h2>
                    </div>

                    {/* Summary Stats */}
                    <div className="p-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <div className="text-sm text-neutral-500 mb-1">Executions</div>
                                <div className="text-xl font-medium text-neutral-800">{history.totalExecutions}</div>
                            </div>

                            <div>
                                <div className="text-sm text-neutral-500 mb-1">Avg. Success</div>
                                <div className="text-xl font-medium text-neutral-800">{history.averageCompletionRate}%</div>
                            </div>

                            <div>
                                <div className="text-sm text-neutral-500 mb-1">Time Spent</div>
                                <div className="text-xl font-medium text-neutral-800">{Math.floor(history.totalTimeSpent / 60)}h</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-5 mt-4 flex space-x-2">
                <button
                    className={`flex-1 py-2 rounded-xl text-center ${activeTab === "executions"
                            ? 'bg-neutral-700 text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                    onClick={() => setActiveTab("executions")}
                >
                    History
                </button>
                <button
                    className={`flex-1 py-2 rounded-xl text-center ${activeTab === "stats"
                            ? 'bg-neutral-700 text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                    onClick={() => setActiveTab("stats")}
                >
                    Analytics
                </button>
            </div>

            {/* Search and Filter */}
            {activeTab === "executions" && (
                <div className="px-5 mt-3">
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={16} className="text-neutral-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search notes..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-50 text-neutral-800"
                            />
                            {search && (
                                <button
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setSearch("")}
                                >
                                    <X size={14} className="text-neutral-400" />
                                </button>
                            )}
                        </div>
                        <button
                            className="p-2 rounded-xl bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
                            onClick={() => setShowDateFilter(!showDateFilter)}
                        >
                            <Calendar size={20} />
                        </button>
                        <button
                            className="p-2 rounded-xl bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
                            onClick={() => setShowStatusFilter(!showStatusFilter)}
                        >
                            <Filter size={20} />
                        </button>
                    </div>

                    {/* Filters (expandable) */}
                    {(showDateFilter || showStatusFilter) && (
                        <div
                            className="mt-2 p-3 rounded-xl bg-neutral-50 border border-neutral-100"
                            style={{ boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)' }}
                        >
                            {showDateFilter && (
                                <div className="mb-2">
                                    <div className="text-sm font-medium text-neutral-700 mb-1">Date Range</div>
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1 rounded-lg bg-neutral-700 text-white text-xs">This Week</button>
                                        <button className="px-3 py-1 rounded-lg bg-neutral-100 text-neutral-600 text-xs hover:bg-neutral-200">This Month</button>
                                        <button className="px-3 py-1 rounded-lg bg-neutral-100 text-neutral-600 text-xs hover:bg-neutral-200">Last 3 Months</button>
                                        <button className="px-3 py-1 rounded-lg bg-neutral-100 text-neutral-600 text-xs hover:bg-neutral-200">All Time</button>
                                    </div>
                                </div>
                            )}

                            {showStatusFilter && (
                                <div>
                                    <div className="text-sm font-medium text-neutral-700 mb-1">Status</div>
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1 rounded-lg bg-neutral-100 text-neutral-600 text-xs hover:bg-neutral-200">All</button>
                                        <button className="px-3 py-1 rounded-lg bg-neutral-700 text-white text-xs">Completed</button>
                                        <button className="px-3 py-1 rounded-lg bg-neutral-100 text-neutral-600 text-xs hover:bg-neutral-200">Partial</button>
                                        <button className="px-3 py-1 rounded-lg bg-neutral-100 text-neutral-600 text-xs hover:bg-neutral-200">Interrupted</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Main Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto px-5 pt-3 pb-8">
                {activeTab === "executions" ? (
                    <div className="space-y-5">
                        {/* Group executions by date */}
                        {Object.entries(executionsByDate)
                            .sort(([dateA, _], [dateB, __]) => {
                                // Sort by date in reverse chronological order
                                const today = "Today";
                                const yesterday = "Yesterday";

                                if (dateA === today) return -1;
                                if (dateB === today) return 1;
                                if (dateA === yesterday) return -1;
                                if (dateB === yesterday) return 1;

                                return 0;
                            })
                            .map(([date, executions]) => (
                                <div key={date}>
                                    <h4 className="font-medium text-neutral-800 mb-2">{date}</h4>
                                    <div className="space-y-3">
                                        {executions.map(execution => (
                                            <div
                                                key={execution.id}
                                                className="rounded-[28px] bg-white border border-neutral-100 overflow-hidden"
                                                style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)' }}
                                            >
                                                {/* Execution Header */}
                                                <div className="p-4">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="flex items-center">
                                                            <Clock3 size={16} className="text-neutral-500 mr-1.5" />
                                                            <span className="text-sm text-neutral-600">
                                                                {formatTime(execution.startTime)} - {formatTime(execution.endTime)}
                                                            </span>
                                                        </div>
                                                        <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${getStatusColor(execution.status)}`}>
                                                            {execution.status.charAt(0).toUpperCase() + execution.status.slice(1)}
                                                            {execution.isPersonalBest && (
                                                                <span className="ml-1 text-neutral-300">★</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center">
                                                                <CheckCircle2 size={14} className="text-neutral-700 mr-1" />
                                                                <span className="text-sm text-neutral-700">{execution.completionRate}%</span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <Clock size={14} className="text-neutral-500 mr-1" />
                                                                <span className="text-sm text-neutral-700">{formatDuration(execution.totalActualDuration)}</span>
                                                            </div>
                                                        </div>

                                                        <button className="text-neutral-600 text-sm flex items-center">
                                                            Details <ChevronRight size={14} className="ml-0.5" />
                                                        </button>
                                                    </div>

                                                    {/* Activity Overview */}
                                                    <div className="mt-3 flex items-center gap-1.5">
                                                        {execution.activities.map((activity, index) => {
                                                            let statusClass = "bg-neutral-700 text-white"; // Completed
                                                            if (activity.status === "skipped") {
                                                                statusClass = "bg-neutral-300 text-neutral-700"; // Skipped
                                                            } else if (activity.status === "partial") {
                                                                statusClass = "bg-neutral-500 text-white"; // Partial
                                                            }

                                                            return (
                                                                <div
                                                                    key={activity.id}
                                                                    className="relative"
                                                                    style={{ zIndex: 10 - index }}
                                                                >
                                                                    <div
                                                                        className={`w-8 h-8 rounded-full flex items-center justify-center ${statusClass} ${index > 0 ? '-ml-1.5' : ''}`}
                                                                        style={{
                                                                            border: '1.5px solid white'
                                                                        }}
                                                                    >
                                                                        {activity.status === "completed" ? (
                                                                            <Check size={14} />
                                                                        ) : activity.status === "skipped" ? (
                                                                            <X size={14} />
                                                                        ) : (
                                                                            index + 1
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}

                                                        <div className="text-xs text-neutral-500 ml-1">
                                                            {execution.activitiesCompleted}/{execution.activitiesTotal} activities
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                        {/* Load More Button */}
                        <button
                            className="w-full py-3 rounded-[28px] border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                            style={{ boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)' }}
                        >
                            Load More
                        </button>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {/* Overall Stats */}
                        <div>
                            <h3 className="font-medium text-neutral-800 mb-3">Performance Overview</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div
                                    className="p-4 rounded-[28px] bg-white border border-neutral-100"
                                    style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)' }}
                                >
                                    <div className="flex items-center text-neutral-500 mb-1">
                                        <BarChart2 size={16} className="mr-1.5" />
                                        <span className="text-xs">Completion Rate</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="text-2xl font-medium text-neutral-800 mr-2">{history.averageCompletionRate}%</div>
                                        {history.averageCompletionRate > 80 ? (
                                            <div className="text-xs text-neutral-700 flex items-center">
                                                <ArrowUpRight size={12} className="mr-0.5" />
                                                Good
                                            </div>
                                        ) : (
                                            <div className="text-xs text-neutral-500 flex items-center">
                                                <ArrowDownRight size={12} className="mr-0.5" />
                                                Fair
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div
                                    className="p-4 rounded-[28px] bg-white border border-neutral-100"
                                    style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)' }}
                                >
                                    <div className="flex items-center text-neutral-500 mb-1">
                                        <Clock size={16} className="mr-1.5" />
                                        <span className="text-xs">Avg. Duration</span>
                                    </div>
                                    <div className="text-2xl font-medium text-neutral-800">
                                        {Math.round(history.totalTimeSpent / history.totalExecutions)} min
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Monthly Trends */}
                        <div>
                            <h3 className="font-medium text-neutral-800 mb-3">Monthly Trends</h3>
                            <div
                                className="p-4 rounded-[28px] bg-white border border-neutral-100"
                                style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)' }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-neutral-600">Executions by Month</span>
                                    <span className="text-xs text-neutral-500">Last 5 months</span>
                                </div>

                                <div className="relative pt-5">
                                    <div className="flex items-end h-32 gap-2">
                                        {history.monthlyData.map((month) => {
                                            const maxExecutions = Math.max(...history.monthlyData.map(m => m.totalExecutions));
                                            const heightPercentage = (month.totalExecutions / maxExecutions) * 100;

                                            return (
                                                <div key={`${month.month}-${month.year}`} className="flex-1 flex flex-col items-center">
                                                    <div
                                                        className="w-full rounded-t-md bg-neutral-700"
                                                        style={{ height: `${heightPercentage}%` }}
                                                    ></div>
                                                    <div className="text-xs text-neutral-500 mt-1">{getMonthName(month.month)}</div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Y-axis labels */}
                                    <div className="absolute top-0 left-0 h-full flex flex-col justify-between pointer-events-none">
                                        <div className="text-xs text-neutral-400">{Math.max(...history.monthlyData.map(m => m.totalExecutions))}</div>
                                        <div className="text-xs text-neutral-400">0</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Export Options */}
                        <div
                            className="rounded-[28px] bg-white border border-neutral-100 overflow-hidden"
                            style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)' }}
                        >
                            <div className="px-4 py-3 border-b border-neutral-100">
                                <h3 className="font-medium text-neutral-800">Export Options</h3>
                            </div>

                            <div className="divide-y divide-neutral-100">
                                <button className="w-full px-4 py-3 flex items-center text-neutral-700 hover:bg-neutral-50">
                                    <FileDown size={18} className="text-neutral-500 mr-3" />
                                    <span>Export as CSV</span>
                                </button>
                                <button className="w-full px-4 py-3 flex items-center text-neutral-700 hover:bg-neutral-50">
                                    <FileDown size={18} className="text-neutral-500 mr-3" />
                                    <span>Export as PDF</span>
                                </button>
                                <button className="w-full px-4 py-3 flex items-center text-neutral-700 hover:bg-neutral-50">
                                    <Printer size={18} className="text-neutral-500 mr-3" />
                                    <span>Print Report</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoopHistoryScreen;