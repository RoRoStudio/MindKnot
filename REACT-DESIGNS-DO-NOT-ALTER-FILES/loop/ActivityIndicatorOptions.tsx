import { useState } from "react";
import { ChevronLeft, MoreVertical, Dumbbell, Coffee, BookOpen, PenLine, Utensils, Clock, Check, CheckCircle, X, ChevronRight, Settings, LayoutGrid } from "lucide-react";

// Types
export type Activity = {
    id: string;
    name: string;
    description: string;
    duration?: number;
    status: "pending" | "active" | "completed" | "skipped";
    repetitionType?: string;
    repetitionCount?: number;
    subActivities?: {
        id: string;
        name: string;
        completed: boolean;
    }[];
};

// Sample data
const sampleActivities: Activity[] = [
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
        status: "pending",
        repetitionType: "rounds",
        repetitionCount: 2
    },
    {
        id: "act-4",
        name: "Journaling",
        description: "Set intentions for the day",
        duration: 10,
        status: "pending",
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
        status: "pending"
    }
];

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

export const ActivityIndicatorOptions = () => {
    const [activities] = useState<Activity[]>(sampleActivities);
    const currentActivityIndex = activities.findIndex(activity => activity.status === "active");

    return (
        <div className="min-h-screen bg-neutral-50 p-4">
            <div className="max-w-md mx-auto">
                <header className="mb-6">
                    <h2 className="text-neutral-800">Activity Indicator Design Options</h2>
                    <p className="text-neutral-500 mt-1">Select the design that best fits your needs</p>
                </header>

                {/* Option 1: Modern Dots with Animation */}
                <section className="mb-10 bg-white rounded-xl p-5" style={{ boxShadow: CONSISTENT_SHADOW }}>
                    <h3 className="mb-4 text-neutral-800">1. Modern Dots with Animation</h3>
                    <div className="relative">
                        <div className="flex justify-center items-center space-x-3 py-2">
                            {activities.map((activity, index) => {
                                let dotColorClass = "";
                                let borderColorClass = "";

                                switch (activity.status) {
                                    case "completed":
                                        dotColorClass = "bg-status-completed";
                                        borderColorClass = "border-status-completed";
                                        break;
                                    case "active":
                                        dotColorClass = "bg-status-active";
                                        borderColorClass = "border-status-active";
                                        break;
                                    case "skipped":
                                        dotColorClass = "bg-status-skipped";
                                        borderColorClass = "border-status-skipped";
                                        break;
                                    case "pending":
                                        dotColorClass = "bg-neutral-300";
                                        borderColorClass = "border-neutral-300";
                                        break;
                                }

                                return (
                                    <div key={activity.id} className="relative flex flex-col items-center">
                                        {/* Dot */}
                                        <div
                                            className={`size-4 rounded-full ${dotColorClass} transition-all duration-300 ${activity.status === "active" ? "scale-125" : ""
                                                }`}
                                        />

                                        {/* Activity name on hover */}
                                        <div className="opacity-0 hover:opacity-100 absolute top-6 bg-white px-2 py-1 rounded text-xs whitespace-nowrap transition-opacity">
                                            {activity.name}
                                        </div>

                                        {/* Connecting line */}
                                        {index < activities.length - 1 && (
                                            <div className={`h-0.5 w-8 ${index < currentActivityIndex ? "bg-status-completed" : "bg-neutral-300"
                                                } absolute top-2 left-4`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="text-xs text-neutral-500 mt-3 text-center">
                        Minimalist dots with hover states and connecting lines
                    </div>
                </section>

                {/* Option 2: Step Bars with Numbers */}
                <section className="mb-10 bg-white rounded-xl p-5" style={{ boxShadow: CONSISTENT_SHADOW }}>
                    <h3 className="mb-4 text-neutral-800">2. Step Bars with Numbers</h3>
                    <div className="flex justify-between items-center relative">
                        {/* Progress bar background */}
                        <div className="absolute top-5 left-[20px] right-[20px] h-1 bg-neutral-200 z-0"></div>

                        {/* Progress bar filled portion */}
                        <div
                            className="absolute top-5 left-[20px] h-1 bg-status-completed z-0"
                            style={{
                                width: `${(currentActivityIndex / (activities.length - 1)) * 100}%`
                            }}
                        ></div>

                        {activities.map((activity, index) => {
                            let numberBgClass = "";
                            let textColorClass = "";
                            let iconElement;

                            switch (activity.status) {
                                case "completed":
                                    numberBgClass = "bg-status-completed";
                                    textColorClass = "text-white";
                                    iconElement = <Check size={14} />;
                                    break;
                                case "active":
                                    numberBgClass = "bg-status-active";
                                    textColorClass = "text-white";
                                    iconElement = (index + 1);
                                    break;
                                case "skipped":
                                    numberBgClass = "bg-status-skipped";
                                    textColorClass = "text-white";
                                    iconElement = <X size={14} />;
                                    break;
                                case "pending":
                                    numberBgClass = "bg-white border border-neutral-300";
                                    textColorClass = "text-neutral-500";
                                    iconElement = (index + 1);
                                    break;
                            }

                            return (
                                <div key={activity.id} className="z-10 flex flex-col items-center">
                                    <div className={`size-10 rounded-full ${numberBgClass} flex items-center justify-center ${textColorClass} font-medium mb-2`}>
                                        {iconElement}
                                    </div>
                                    <span className={`text-xs ${activity.status === "active" ? "font-medium text-status-active" : "text-neutral-600"
                                        } text-center max-w-[60px] truncate`}>
                                        {activity.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="text-xs text-neutral-500 mt-5 text-center">
                        Progress bars with numbered steps and status indicators
                    </div>
                </section>

                {/* Option 3: Icon Cards */}
                <section className="mb-10 bg-white rounded-xl p-5" style={{ boxShadow: CONSISTENT_SHADOW }}>
                    <h3 className="mb-4 text-neutral-800">3. Icon Cards</h3>
                    <div className="grid grid-cols-5 gap-2">
                        {activities.map((activity) => {
                            let cardClass = "";
                            let iconClass = "";
                            let statusIndicator = null;

                            switch (activity.status) {
                                case "completed":
                                    cardClass = "bg-white border-status-completed";
                                    iconClass = "text-status-completed";
                                    statusIndicator = (
                                        <div className="absolute -top-1 -right-1 size-5 rounded-full bg-status-completed text-white flex items-center justify-center">
                                            <Check size={12} />
                                        </div>
                                    );
                                    break;
                                case "active":
                                    cardClass = "bg-status-active";
                                    iconClass = "text-white";
                                    break;
                                case "skipped":
                                    cardClass = "bg-neutral-100 opacity-70";
                                    iconClass = "text-neutral-400";
                                    statusIndicator = (
                                        <div className="absolute -top-1 -right-1 size-5 rounded-full bg-status-skipped text-white flex items-center justify-center">
                                            <X size={12} />
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
                                    <div className={`aspect-square p-2 rounded-lg border ${cardClass} flex flex-col items-center justify-center`}>
                                        <div className={`${iconClass}`}>
                                            {getActivityIcon(activity.name, 20)}
                                        </div>
                                        <span className={`text-xs mt-1 text-center ${activity.status === "active" ? "text-white" : "text-neutral-600"
                                            } truncate w-full`}>
                                            {activity.name}
                                        </span>
                                    </div>
                                    {statusIndicator}
                                </div>
                            );
                        })}
                    </div>
                    <div className="text-xs text-neutral-500 mt-3 text-center">
                        Card grid with icons and status indicators
                    </div>
                </section>

                {/* Option 4: Side Timeline */}
                <section className="mb-10 bg-white rounded-xl p-5" style={{ boxShadow: CONSISTENT_SHADOW }}>
                    <h3 className="mb-4 text-neutral-800">4. Side Timeline</h3>
                    <div className="flex items-stretch">
                        {/* Vertical timeline */}
                        <div className="flex flex-col items-center mr-4 relative">
                            {/* Vertical line */}
                            <div className="absolute top-0 bottom-0 w-0.5 bg-neutral-200 left-1/2 -translate-x-1/2 z-0"></div>

                            {activities.map((activity, index) => {
                                let dotColorClass = "";

                                switch (activity.status) {
                                    case "completed":
                                        dotColorClass = "bg-status-completed";
                                        break;
                                    case "active":
                                        dotColorClass = "bg-status-active";
                                        break;
                                    case "skipped":
                                        dotColorClass = "bg-status-skipped";
                                        break;
                                    case "pending":
                                        dotColorClass = "bg-neutral-300";
                                        break;
                                }

                                return (
                                    <div key={activity.id} className="z-10 my-4 first:mt-0 last:mb-0">
                                        <div className={`size-3 rounded-full ${dotColorClass} ${activity.status === "active" ? "ring-2 ring-status-active ring-offset-2" : ""
                                            }`} />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Current activity highlight */}
                        <div className="flex-1">
                            {activities.map((activity) => (
                                <div
                                    key={activity.id}
                                    className={`my-2 p-2 rounded-lg ${activity.status === "active"
                                            ? "bg-neutral-100 border-l-4 border-status-active"
                                            : "opacity-60"
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <div className={`size-8 rounded-full flex items-center justify-center mr-2 ${activity.status === "active" ? "bg-status-active text-white" : "bg-neutral-200 text-neutral-600"
                                            }`}>
                                            {getActivityIcon(activity.name, 16)}
                                        </div>
                                        <span className={`text-sm ${activity.status === "active" ? "font-medium" : ""
                                            }`}>
                                            {activity.name}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="text-xs text-neutral-500 mt-3 text-center">
                        Vertical timeline with current activity highlight
                    </div>
                </section>

                {/* Option 5: Pill Navigation */}
                <section className="mb-10 bg-white rounded-xl p-5" style={{ boxShadow: CONSISTENT_SHADOW }}>
                    <h3 className="mb-4 text-neutral-800">5. Pill Navigation</h3>
                    <div className="relative overflow-x-auto py-2">
                        <div className="flex items-center space-x-2">
                            {activities.map((activity) => {
                                let pillClass = "";
                                let textClass = "";

                                switch (activity.status) {
                                    case "completed":
                                        pillClass = "bg-status-completed/10 border-status-completed";
                                        textClass = "text-status-completed";
                                        break;
                                    case "active":
                                        pillClass = "bg-status-active border-status-active";
                                        textClass = "text-white";
                                        break;
                                    case "skipped":
                                        pillClass = "bg-neutral-100 border-neutral-300";
                                        textClass = "text-neutral-400 line-through";
                                        break;
                                    case "pending":
                                        pillClass = "bg-white border-neutral-200";
                                        textClass = "text-neutral-500";
                                        break;
                                }

                                return (
                                    <div
                                        key={activity.id}
                                        className={`px-3 py-2 rounded-full border ${pillClass} flex items-center`}
                                        style={{
                                            boxShadow: activity.status === "active" ? CONSISTENT_SHADOW : "none",
                                            minWidth: "max-content"
                                        }}
                                    >
                                        <div className={`size-6 rounded-full flex items-center justify-center mr-2 ${activity.status === "active" ? "bg-white text-status-active" : "bg-transparent"
                                            }`}>
                                            {getActivityIcon(activity.name, 14)}
                                        </div>
                                        <span className={`text-sm ${textClass}`}>
                                            {activity.name}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="text-xs text-neutral-500 mt-3 text-center">
                        Scrollable pill navigation with icon and text
                    </div>
                </section>

                {/* Option 6: Smart Segmented Controls */}
                <section className="mb-10 bg-white rounded-xl p-5" style={{ boxShadow: CONSISTENT_SHADOW }}>
                    <h3 className="mb-4 text-neutral-800">6. Smart Segmented Controls</h3>
                    <div className="relative bg-neutral-100 p-1 rounded-xl">
                        {/* Indicator background for active item */}
                        <div
                            className="absolute h-[calc(100%-8px)] bg-white rounded-lg transition-all duration-300 z-0"
                            style={{
                                width: `${100 / activities.length}%`,
                                left: `${(currentActivityIndex * 100 / activities.length) + 0.5}%`,
                                top: '4px',
                                boxShadow: CONSISTENT_SHADOW
                            }}
                        ></div>

                        <div className="flex relative z-10">
                            {activities.map((activity, index) => {
                                const isActive = activity.status === "active";
                                let statusIcon = null;

                                if (activity.status === "completed") {
                                    statusIcon = <Check size={12} className="text-status-completed" />;
                                } else if (activity.status === "skipped") {
                                    statusIcon = <X size={12} className="text-status-skipped" />;
                                }

                                return (
                                    <div
                                        key={activity.id}
                                        className={`flex-1 py-2 px-1 flex flex-col items-center ${isActive ? "opacity-100" : "opacity-70"
                                            }`}
                                    >
                                        <div className={`size-6 rounded-full flex items-center justify-center ${isActive ? "bg-status-active text-white" : "bg-transparent"
                                            }`}>
                                            {statusIcon || getActivityIcon(activity.name, 14)}
                                        </div>
                                        <span className={`text-[11px] mt-1 truncate w-full text-center ${isActive ? "font-medium text-neutral-800" : "text-neutral-500"
                                            }`}>
                                            {activity.name}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="text-xs text-neutral-500 mt-3 text-center">
                        Segmented control with sliding indicator and status icons
                    </div>
                </section>
            </div>
        </div>
    );
};