import { useState } from "react";
import {
    ChevronLeft,
    MoreVertical,
    Play,
    Clock,
    BarChart2,
    Calendar,
    Settings,
    CheckCircle2,
    CheckCircle,
    AlertCircle,
    XCircle,
    History,
    Tag,
    Edit,
    ArrowRight,
    Share
} from "lucide-react";

// Types
type Activity = {
    id: string;
    name: string;
    description: string;
    duration?: number;
    icon: string;
    repetitionType?: string;
    repetitionCount?: number;
    subActivities: {
        id: string;
        name: string;
        completed: boolean;
    }[];
    linkedEntryType?: "Note" | "Spark" | "Action" | "Path";
};

type WeekDay = {
    day: number; // 0-6 (Sunday-Saturday)
    name: string; // "Sunday", "Monday", etc.
    time: string; // HH:MM format
    enabled: boolean;
};

type Tag = {
    id: string;
    name: string;
};

type Category = {
    id: string;
    name: string;
    color: string;
};

type LoopStats = {
    totalExecutions: number;
    completedExecutions: number;
    averageCompletionRate: number;
    totalTimeSpent: number; // in minutes
    lastExecution: Date | null;
};

type Loop = {
    id: string;
    title: string;
    description: string;
    category?: Category;
    tags: Tag[];
    activities: Activity[];
    schedule: WeekDay[];
    notifications: boolean;
    stats: LoopStats;
};

// Icons for activities
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
        default:
            return <span className="material-icons" style={{ fontSize: size }}>check_circle</span>;
    }
};

// Mock data
const mockLoop: Loop = {
    id: "loop-1",
    title: "Morning Routine",
    description: "Start the day with mindfulness and productivity",
    category: { id: "cat-1", name: "Personal", color: "#0ea5e9" },
    tags: [
        { id: "tag-1", name: "Morning" },
        { id: "tag-4", name: "Focus" }
    ],
    activities: [
        {
            id: "act-1",
            name: "Hydration",
            description: "Start your day with water",
            duration: 1,
            icon: "coffee",
            subActivities: [
                { id: "sub-1-1", name: "Drink full glass of water", completed: false },
                { id: "sub-1-2", name: "Take daily vitamins", completed: false }
            ]
        },
        {
            id: "act-2",
            name: "Meditation",
            description: "Clear your mind",
            duration: 10,
            icon: "coffee",
            subActivities: []
        },
        {
            id: "act-3",
            name: "Journaling",
            description: "Set intentions for the day",
            duration: 15,
            icon: "pen-line",
            repetitionType: "pages",
            repetitionCount: 2,
            subActivities: [
                { id: "sub-3-1", name: "Write 3 gratitudes", completed: false },
                { id: "sub-3-2", name: "List daily goals", completed: false }
            ],
            linkedEntryType: "Note"
        },
        {
            id: "act-4",
            name: "Stretching",
            description: "Wake up your body",
            duration: 5,
            icon: "dumbbell",
            subActivities: []
        },
        {
            id: "act-5",
            name: "Breakfast",
            description: "Nourish your body",
            duration: 20,
            icon: "utensils",
            subActivities: []
        }
    ],
    schedule: [
        { day: 0, name: "Sunday", time: "08:00", enabled: false },
        { day: 1, name: "Monday", time: "07:00", enabled: true },
        { day: 2, name: "Tuesday", time: "07:00", enabled: true },
        { day: 3, name: "Wednesday", time: "07:00", enabled: true },
        { day: 4, name: "Thursday", time: "07:00", enabled: true },
        { day: 5, name: "Friday", time: "07:00", enabled: true },
        { day: 6, name: "Saturday", time: "08:00", enabled: false }
    ],
    notifications: true,
    stats: {
        totalExecutions: 28,
        completedExecutions: 24,
        averageCompletionRate: 86,
        totalTimeSpent: 1372, // ~22.9 hours
        lastExecution: new Date(2025, 4, 28) // May 28, 2025
    }
};

// Format date
const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(date);
};

// Format time to hours and minutes
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

// Get next scheduled time
const getNextScheduledTime = (schedule: WeekDay[]): string | null => {
    const now = new Date();
    const currentDay = now.getDay(); // 0-6, where 0 is Sunday
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Check if there's a schedule for today that's still in the future
    const todaySchedule = schedule.find(s => s.day === currentDay && s.enabled);
    if (todaySchedule) {
        const [scheduleHour, scheduleMinute] = todaySchedule.time.split(':').map(Number);
        if (scheduleHour > currentHour || (scheduleHour === currentHour && scheduleMinute > currentMinute)) {
            return `Today at ${todaySchedule.time}`;
        }
    }

    // Find the next enabled day
    for (let i = 1; i <= 7; i++) {
        const nextDay = (currentDay + i) % 7;
        const nextSchedule = schedule.find(s => s.day === nextDay && s.enabled);
        if (nextSchedule) {
            const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            return `${dayNames[nextDay]} at ${nextSchedule.time}`;
        }
    }

    return null;
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

export const LoopDetailScreen = () => {
    const [loop] = useState<Loop>(mockLoop);

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

    // Calculate total loop duration
    const totalDuration = loop.activities.reduce((total, activity) => total + (activity.duration || 0), 0);

    // Get next scheduled run
    const nextScheduled = getNextScheduledTime(loop.schedule);

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
                        <h3 className="font-medium text-neutral-900">Loop Details</h3>
                    </div>

                    <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white/90 text-neutral-600 shadow-md backdrop-blur-sm hover:bg-white transition-colors">
                        <MoreVertical size={20} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto px-5 pb-24">
                {/* Loop Overview Card */}
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
                        <h2 className="font-medium text-xl">{loop.title}</h2>
                        <p className="text-sm text-white/80 mt-1">{loop.description}</p>

                        <div className="flex flex-wrap gap-2 mt-3">
                            {loop.category && (
                                <div
                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs backdrop-blur-sm"
                                    style={{
                                        backgroundColor: `${loop.category.color}40`,
                                        color: loop.category.color
                                    }}
                                >
                                    {loop.category.name}
                                </div>
                            )}

                            {loop.tags.map(tag => (
                                <div
                                    key={tag.id}
                                    className="inline-flex items-center px-3 py-1 rounded-full bg-neutral-200/30 text-xs text-white backdrop-blur-sm"
                                >
                                    {tag.name}
                                </div>
                            ))}
                        </div>

                        <div className="absolute top-4 right-4 flex space-x-2">
                            <button className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20 text-white backdrop-blur-sm">
                                <Share size={16} />
                            </button>
                            <button className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20 text-white backdrop-blur-sm">
                                <Edit size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="p-5">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-5">
                            <div>
                                <div className="text-xs text-neutral-500 mb-1">Activities</div>
                                <div className="text-xl font-medium text-neutral-800">{loop.activities.length}</div>
                            </div>

                            <div>
                                <div className="text-xs text-neutral-500 mb-1">Duration</div>
                                <div className="text-xl font-medium text-neutral-800">{totalDuration} min</div>
                            </div>

                            <div>
                                <div className="text-xs text-neutral-500 mb-1">Success Rate</div>
                                <div className="text-xl font-medium text-neutral-800">{loop.stats.averageCompletionRate}%</div>
                            </div>
                        </div>

                        {/* Next Run & Schedule */}
                        {nextScheduled && (
                            <div
                                className="flex items-center p-3 rounded-xl bg-neutral-50 mb-4"
                                style={{ boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)' }}
                            >
                                <Calendar size={18} className="text-neutral-600 mr-3" />
                                <div>
                                    <div className="text-sm font-medium text-neutral-700">Next Run</div>
                                    <div className="text-xs text-neutral-500">{nextScheduled}</div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                            <button
                                className={`flex-1 py-3 rounded-xl flex items-center justify-center ${getGradient("primary")} text-white`}
                            >
                                <Play size={18} className="mr-2" />
                                Start Loop
                            </button>

                            <button
                                className="px-4 py-3 rounded-xl flex items-center justify-center bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                            >
                                <Settings size={18} />
                            </button>

                            <button
                                className="px-4 py-3 rounded-xl flex items-center justify-center bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                            >
                                <History size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Activities List */}
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
                        <div className="flex items-center">
                            <h3 className="font-medium">Activities</h3>
                            <div className="ml-auto flex items-center">
                                <div className="text-sm text-white/80 mr-1">Total:</div>
                                <div className="text-sm">{totalDuration} min</div>
                            </div>
                        </div>
                    </div>

                    <div className="divide-y divide-neutral-100">
                        {loop.activities.map((activity, index) => (
                            <div key={activity.id} className="p-4">
                                <div className="flex">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-neutral-100 text-neutral-600"
                                        style={{ boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)' }}
                                    >
                                        {index + 1}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="font-medium text-neutral-800">{activity.name}</h4>
                                                {activity.description && (
                                                    <p className="text-sm text-neutral-500 mt-0.5">{activity.description}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end">
                                                {activity.duration && (
                                                    <div className="flex items-center text-sm text-neutral-500">
                                                        <Clock size={14} className="mr-1" />
                                                        {activity.duration} min
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {activity.repetitionType && activity.repetitionCount && (
                                                <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-neutral-100 text-xs text-neutral-700">
                                                    {activity.repetitionCount} {activity.repetitionType}
                                                </div>
                                            )}

                                            {activity.subActivities.length > 0 && (
                                                <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-neutral-100 text-xs text-neutral-700">
                                                    <CheckCircle2 size={12} className="mr-1" />
                                                    {activity.subActivities.length} tasks
                                                </div>
                                            )}

                                            {activity.linkedEntryType && (
                                                <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-neutral-100 text-xs text-neutral-700">
                                                    <ArrowRight size={12} className="mr-1" />
                                                    {activity.linkedEntryType}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats Card */}
                <div
                    className="rounded-[28px] overflow-hidden shadow-lg border border-neutral-100"
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
                        <div className="flex items-center">
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-white/20 backdrop-blur-sm"
                                style={{
                                    boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)'
                                }}
                            >
                                <BarChart2 size={20} />
                            </div>
                            <h3 className="font-medium">Loop Statistics</h3>
                        </div>
                    </div>

                    <div className="p-5 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div
                                className="p-3 rounded-xl bg-neutral-50"
                                style={{ boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)' }}
                            >
                                <div className="flex items-center text-neutral-500 mb-1">
                                    <CheckCircle size={14} className="mr-1.5" />
                                    <span className="text-xs">Completion Rate</span>
                                </div>
                                <div className="text-lg font-medium text-neutral-800">{loop.stats.averageCompletionRate}%</div>
                                <div className="text-xs text-neutral-500 mt-1">{loop.stats.completedExecutions} of {loop.stats.totalExecutions} runs</div>
                            </div>

                            <div
                                className="p-3 rounded-xl bg-neutral-50"
                                style={{ boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)' }}
                            >
                                <div className="flex items-center text-neutral-500 mb-1">
                                    <Clock size={14} className="mr-1.5" />
                                    <span className="text-xs">Total Time</span>
                                </div>
                                <div className="text-lg font-medium text-neutral-800">{formatDuration(loop.stats.totalTimeSpent)}</div>
                                <div className="text-xs text-neutral-500 mt-1">Across {loop.stats.totalExecutions} executions</div>
                            </div>
                        </div>

                        <div
                            className="p-3 rounded-xl bg-neutral-50"
                            style={{ boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)' }}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center text-neutral-500">
                                    <Calendar size={14} className="mr-1.5" />
                                    <span className="text-xs">Last Execution</span>
                                </div>
                                <div className="text-xs text-neutral-500">
                                    {loop.stats.lastExecution ? formatDate(loop.stats.lastExecution) : 'Never'}
                                </div>
                            </div>

                            <div className="mt-2 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 rounded-full bg-neutral-700 mr-1.5"></div>
                                        <span className="text-xs">Completed</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 rounded-full bg-neutral-400 mr-1.5"></div>
                                        <span className="text-xs">Skipped</span>
                                    </div>
                                </div>

                                <button className="text-xs text-blue-600 flex items-center">
                                    View History <ArrowRight size={12} className="ml-0.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoopDetailScreen;