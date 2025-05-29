import { useState, useRef, useEffect } from "react";
import {
    ChevronLeft,
    MoreVertical,
    Plus,
    ArrowUp,
    ArrowDown,
    Trash2,
    Save,
    Clock,
    Tag,
    Calendar,
    Bell,
    Check,
    X,
    GripVertical,
    Pencil,
    ChevronRight,
    FileText,
    Zap,
    CheckSquare,
    Target,
    ListChecks,
    Dumbbell,
    Coffee,
    BookOpen,
    PenLine,
    Utensils,
    Droplets,
    Heart,
    Brain,
    Briefcase,
    Music,
    Gamepad2,
    ShoppingCart
} from "lucide-react";

// Activity category type
type ActivityCategory = {
    id: string;
    name: string;
    color: string;
    activities: {
        id: string;
        name: string;
        icon: string;
    }[];
};

// SubActivity type
type SubActivity = {
    id: string;
    name: string;
    completed: boolean;
};

// Activity type
type Activity = {
    id: string;
    name: string;
    description: string;
    duration?: number; // optional
    icon: string;
    repetitionType?: string; // optional
    repetitionCount?: number; // optional
    subActivities: SubActivity[];
    linkedEntryType?: "Note" | "Spark" | "Action" | "Path";
};

// Tag/Label type
type Tag = {
    id: string;
    name: string;
};

// Category type
type Category = {
    id: string;
    name: string;
    color: string;
};

// Weekly schedule type
type WeekDay = {
    day: number; // 0-6 (Sunday-Saturday)
    name: string; // "Sunday", "Monday", etc.
    time: string; // HH:MM format
    enabled: boolean;
};

// Loop type
type Loop = {
    id: string;
    title: string;
    description: string;
    category?: Category;
    tags: Tag[];
    activities: Activity[];
    schedule: WeekDay[];
    notifications: boolean;
};

// Predefined categories with activities
const activityCategories: ActivityCategory[] = [
    {
        id: "cat-health",
        name: "Health & Wellness",
        color: "#10b981",
        activities: [
            { id: "act-template-1", name: "Hydration", icon: "droplets" },
            { id: "act-template-2", name: "Meditation", icon: "coffee" },
            { id: "act-template-3", name: "Workout", icon: "dumbbell" },
            { id: "act-template-4", name: "Yoga", icon: "dumbbell" },
            { id: "act-template-5", name: "Breathwork", icon: "coffee" },
            { id: "act-template-6", name: "Health Check", icon: "heart" }
        ]
    },
    {
        id: "cat-productivity",
        name: "Productivity",
        color: "#0ea5e9",
        activities: [
            { id: "act-template-7", name: "Planning", icon: "pen-line" },
            { id: "act-template-8", name: "Journaling", icon: "book-open" },
            { id: "act-template-9", name: "Reading", icon: "book-open" },
            { id: "act-template-10", name: "Deep Work", icon: "brain" },
            { id: "act-template-11", name: "Email", icon: "briefcase" },
            { id: "act-template-12", name: "Review", icon: "check-square" }
        ]
    },
    {
        id: "cat-lifestyle",
        name: "Lifestyle",
        color: "#0ea5e9",
        activities: [
            { id: "act-template-13", name: "Breakfast", icon: "utensils" },
            { id: "act-template-14", name: "Lunch", icon: "utensils" },
            { id: "act-template-15", name: "Dinner", icon: "utensils" },
            { id: "act-template-16", name: "Music", icon: "music" },
            { id: "act-template-17", name: "Gaming", icon: "gamepad2" },
            { id: "act-template-18", name: "Shopping", icon: "shopping-cart" }
        ]
    }
];

// Available categories for loop
const availableCategories: Category[] = [
    { id: "cat-1", name: "Personal", color: "#0ea5e9" },
    { id: "cat-2", name: "Work", color: "#6366f1" },
    { id: "cat-3", name: "Health", color: "#10b981" },
    { id: "cat-4", name: "Learning", color: "#0ea5e9" }
];

// Available tags/labels
const availableTags: Tag[] = [
    { id: "tag-1", name: "Morning" },
    { id: "tag-2", name: "Evening" },
    { id: "tag-3", name: "Quick" },
    { id: "tag-4", name: "Focus" },
    { id: "tag-5", name: "Energy" },
    { id: "tag-6", name: "Rest" },
    { id: "tag-7", name: "Weekly" },
    { id: "tag-8", name: "Social" }
];

// Entry types for linking
const entryTypes = [
    { id: "note", name: "Note", icon: <FileText size={16} /> },
    { id: "spark", name: "Spark", icon: <Zap size={16} /> },
    { id: "action", name: "Action", icon: <CheckSquare size={16} /> },
    { id: "path", name: "Path", icon: <Target size={16} /> }
];

// Week days
const weekDays: WeekDay[] = [
    { day: 0, name: "Sunday", time: "08:00", enabled: false },
    { day: 1, name: "Monday", time: "08:00", enabled: false },
    { day: 2, name: "Tuesday", time: "08:00", enabled: false },
    { day: 3, name: "Wednesday", time: "08:00", enabled: false },
    { day: 4, name: "Thursday", time: "08:00", enabled: false },
    { day: 5, name: "Friday", time: "08:00", enabled: false },
    { day: 6, name: "Saturday", time: "08:00", enabled: false }
];

// Initial empty loop
const initialLoop: Loop = {
    id: "",
    title: "",
    description: "",
    tags: [],
    activities: [],
    schedule: [...weekDays],
    notifications: true
};

// Get the appropriate icon for each activity
const getActivityIcon = (iconName: string, size = 24) => {
    switch (iconName.toLowerCase()) {
        case "dumbbell":
            return <Dumbbell size={size} />;
        case "coffee":
            return <Coffee size={size} />;
        case "book-open":
            return <BookOpen size={size} />;
        case "pen-line":
            return <PenLine size={size} />;
        case "utensils":
            return <Utensils size={size} />;
        case "droplets":
            return <Droplets size={size} />;
        case "heart":
            return <Heart size={size} />;
        case "brain":
            return <Brain size={size} />;
        case "briefcase":
            return <Briefcase size={size} />;
        case "music":
            return <Music size={size} />;
        case "gamepad2":
            return <Gamepad2 size={size} />;
        case "shopping-cart":
            return <ShoppingCart size={size} />;
        case "check-square":
            return <CheckSquare size={size} />;
        default:
            return <ListChecks size={size} />;
    }
};

// Helper function for generating IDs
const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substring(2, 9)}`;

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

export const LoopBuilderScreen = () => {
    const [loop, setLoop] = useState<Loop>(initialLoop);
    const [step, setStep] = useState<"basic" | "activities" | "scheduling">("basic");
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showActivityPicker, setShowActivityPicker] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [showTagPicker, setShowTagPicker] = useState(false);
    const [showActivityBottomSheet, setShowActivityBottomSheet] = useState(false);
    const [showAddActivityBottomSheet, setShowAddActivityBottomSheet] = useState(false);
    const [editingActivityIndex, setEditingActivityIndex] = useState<number | null>(null);
    const [tempActivity, setTempActivity] = useState<Activity | null>(null);
    const [showAddCustomActivity, setShowAddCustomActivity] = useState(false);
    const [newCustomActivity, setNewCustomActivity] = useState({ name: "", icon: "list-checks" });
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("cat-health");

    // Drag and drop state
    const [draggedActivityIndex, setDraggedActivityIndex] = useState<number | null>(null);
    const activitiesRef = useRef<HTMLDivElement>(null);

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

    // Handle basic info changes
    const handleBasicInfoChange = (field: "title" | "description", value: string) => {
        setLoop({
            ...loop,
            [field]: value
        });
    };

    // Handle category selection
    const handleCategorySelect = (category: Category | undefined) => {
        setLoop({
            ...loop,
            category
        });
        setShowCategoryPicker(false);
    };

    // Handle tag toggling
    const handleTagToggle = (tag: Tag) => {
        const tagExists = loop.tags.some(t => t.id === tag.id);

        if (tagExists) {
            setLoop({
                ...loop,
                tags: loop.tags.filter(t => t.id !== tag.id)
            });
        } else {
            setLoop({
                ...loop,
                tags: [...loop.tags, tag]
            });
        }
    };

    // Handle adding an activity
    const handleAddActivity = (template: { id: string, name: string, icon: string }) => {
        const newActivity: Activity = {
            id: generateId("act"),
            name: template.name,
            description: "",
            icon: template.icon,
            subActivities: []
        };

        setLoop({
            ...loop,
            activities: [...loop.activities, newActivity]
        });

        setShowAddActivityBottomSheet(false);

        // Edit the newly added activity
        setEditingActivityIndex(loop.activities.length);
        setTempActivity(newActivity);
        setShowActivityBottomSheet(true);

        // Scroll to bottom of activities list
        setTimeout(() => {
            if (activitiesRef.current) {
                activitiesRef.current.scrollTop = activitiesRef.current.scrollHeight;
            }
        }, 100);
    };

    // Handle adding a custom activity
    const handleAddCustomActivity = () => {
        if (newCustomActivity.name.trim()) {
            handleAddActivity({
                id: generateId("act-custom"),
                name: newCustomActivity.name,
                icon: newCustomActivity.icon || "list-checks"
            });

            setNewCustomActivity({ name: "", icon: "list-checks" });
            setShowAddCustomActivity(false);
        }
    };

    // Handle deleting an activity
    const handleDeleteActivity = (index: number) => {
        const updatedActivities = [...loop.activities];
        updatedActivities.splice(index, 1);

        setLoop({
            ...loop,
            activities: updatedActivities
        });
    };

    // Handle moving an activity with buttons
    const handleMoveActivity = (index: number, direction: "up" | "down") => {
        if ((direction === "up" && index === 0) ||
            (direction === "down" && index === loop.activities.length - 1)) {
            return;
        }

        const updatedActivities = [...loop.activities];
        const newIndex = direction === "up" ? index - 1 : index + 1;

        // Swap elements
        [updatedActivities[index], updatedActivities[newIndex]] =
            [updatedActivities[newIndex], updatedActivities[index]];

        setLoop({
            ...loop,
            activities: updatedActivities
        });
    };

    // Handle drag and drop for activities
    const handleDragStart = (index: number) => {
        setDraggedActivityIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedActivityIndex === null || draggedActivityIndex === index) return;

        const activities = [...loop.activities];
        const draggedActivity = activities[draggedActivityIndex];

        // Remove the dragged item
        activities.splice(draggedActivityIndex, 1);
        // Add it at the new position
        activities.splice(index, 0, draggedActivity);

        setLoop({
            ...loop,
            activities
        });

        setDraggedActivityIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedActivityIndex(null);
    };

    // Handle editing an activity
    const handleEditActivity = (index: number) => {
        setEditingActivityIndex(index);
        setTempActivity({ ...loop.activities[index] });
        setShowActivityBottomSheet(true);
    };

    // Handle save activity changes
    const handleSaveActivityChanges = () => {
        if (editingActivityIndex !== null && tempActivity) {
            const updatedActivities = [...loop.activities];
            updatedActivities[editingActivityIndex] = tempActivity;

            setLoop({
                ...loop,
                activities: updatedActivities
            });

            setEditingActivityIndex(null);
            setTempActivity(null);
            setShowActivityBottomSheet(false);
        }
    };

    // Handle updating activity field
    const handleUpdateActivity = (field: keyof Activity, value: any) => {
        if (tempActivity) {
            setTempActivity({
                ...tempActivity,
                [field]: value
            });
        }
    };

    // Handle updating sub-activity
    const handleUpdateSubActivity = (index: number, name: string) => {
        if (tempActivity) {
            const updatedSubActivities = [...tempActivity.subActivities];
            updatedSubActivities[index] = {
                ...updatedSubActivities[index],
                name
            };

            setTempActivity({
                ...tempActivity,
                subActivities: updatedSubActivities
            });
        }
    };

    // Handle adding a sub-activity
    const handleAddSubActivity = () => {
        if (tempActivity) {
            setTempActivity({
                ...tempActivity,
                subActivities: [
                    ...tempActivity.subActivities,
                    { id: generateId("sub"), name: "", completed: false }
                ]
            });
        }
    };

    // Handle deleting a sub-activity
    const handleDeleteSubActivity = (index: number) => {
        if (tempActivity) {
            const updatedSubActivities = [...tempActivity.subActivities];
            updatedSubActivities.splice(index, 1);

            setTempActivity({
                ...tempActivity,
                subActivities: updatedSubActivities
            });
        }
    };

    // Handle weekly schedule toggle
    const handleDayToggle = (dayIndex: number) => {
        const updatedSchedule = [...loop.schedule];
        updatedSchedule[dayIndex] = {
            ...updatedSchedule[dayIndex],
            enabled: !updatedSchedule[dayIndex].enabled
        };

        setLoop({
            ...loop,
            schedule: updatedSchedule
        });
    };

    // Handle time change for a day
    const handleTimeChange = (dayIndex: number, time: string) => {
        const updatedSchedule = [...loop.schedule];
        updatedSchedule[dayIndex] = {
            ...updatedSchedule[dayIndex],
            time
        };

        setLoop({
            ...loop,
            schedule: updatedSchedule
        });
    };

    // Handle notifications toggle
    const handleNotificationsToggle = () => {
        setLoop({
            ...loop,
            notifications: !loop.notifications
        });
    };

    // Handle saving the loop
    const handleSaveLoop = () => {
        // Validation checks
        if (!loop.title.trim()) {
            alert("Please add a title for your loop.");
            return;
        }

        if (loop.activities.length === 0) {
            alert("Please add at least one activity to your loop.");
            return;
        }

        setIsSaving(true);

        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            // Here you would typically navigate back to the loop list or detail view
            alert("Loop saved successfully!");
        }, 1500);
    };

    // Render content based on current step
    const renderStepContent = () => {
        switch (step) {
            case "basic":
                return (
                    <div className="space-y-6">
                        {/* Title and Description */}
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="loop-title" className="block text-sm font-medium text-neutral-700 mb-1">
                                    Loop Title
                                </label>
                                <input
                                    id="loop-title"
                                    type="text"
                                    value={loop.title}
                                    onChange={(e) => handleBasicInfoChange("title", e.target.value)}
                                    placeholder="e.g., Morning Routine"
                                    className="w-full px-4 py-3 rounded-2xl bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label htmlFor="loop-description" className="block text-sm font-medium text-neutral-700 mb-1">
                                    Description (Optional)
                                </label>
                                <textarea
                                    id="loop-description"
                                    value={loop.description}
                                    onChange={(e) => handleBasicInfoChange("description", e.target.value)}
                                    placeholder="What's this loop for?"
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-2xl bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
                                />
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">
                                Category (Optional)
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
                                >
                                    <div className="flex items-center">
                                        {loop.category ? (
                                            <>
                                                <div
                                                    className="w-4 h-4 rounded-full mr-3"
                                                    style={{ backgroundColor: loop.category.color }}
                                                />
                                                <span>{loop.category.name}</span>
                                            </>
                                        ) : (
                                            <span className="text-neutral-500">Select a category</span>
                                        )}
                                    </div>
                                    <ChevronRight className={`transition-transform ${showCategoryPicker ? 'rotate-90' : ''}`} size={18} />
                                </button>

                                {/* Categories dropdown */}
                                {showCategoryPicker && (
                                    <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-[28px] bg-white border border-neutral-100 shadow-lg z-20"
                                        style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)' }}>
                                        <div
                                            className="p-2 rounded-xl hover:bg-neutral-50 cursor-pointer mb-1 flex items-center"
                                            onClick={() => handleCategorySelect(undefined)}
                                        >
                                            <div className="w-4 h-4 rounded-full bg-neutral-300 mr-3" />
                                            <span className="text-neutral-700">None</span>
                                        </div>
                                        {availableCategories.map(category => (
                                            <div
                                                key={category.id}
                                                className="p-2 rounded-xl hover:bg-neutral-50 cursor-pointer mb-1 flex items-center"
                                                onClick={() => handleCategorySelect(category)}
                                            >
                                                <div
                                                    className="w-4 h-4 rounded-full mr-3"
                                                    style={{ backgroundColor: category.color }}
                                                />
                                                <span className="text-neutral-700">{category.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">
                                Tags (Optional)
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowTagPicker(!showTagPicker)}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
                                >
                                    <div className="flex items-center flex-wrap gap-2">
                                        {loop.tags.length > 0 ? (
                                            loop.tags.map(tag => (
                                                <span
                                                    key={tag.id}
                                                    className="px-2 py-1 rounded-full text-xs bg-neutral-200 text-neutral-700"
                                                >
                                                    {tag.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-neutral-500">Add tags</span>
                                        )}
                                    </div>
                                    <Tag size={18} className="text-neutral-500" />
                                </button>

                                {/* Tags dropdown */}
                                {showTagPicker && (
                                    <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-[28px] bg-white border border-neutral-100 shadow-lg z-20"
                                        style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)' }}>
                                        <div className="flex flex-wrap gap-2 p-2">
                                            {availableTags.map(tag => {
                                                const isSelected = loop.tags.some(t => t.id === tag.id);
                                                return (
                                                    <button
                                                        key={tag.id}
                                                        className={`px-3 py-1.5 rounded-full text-sm ${isSelected
                                                                ? 'bg-neutral-700 text-white'
                                                                : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                                                            } transition-colors`}
                                                        onClick={() => handleTagToggle(tag)}
                                                    >
                                                        {tag.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case "activities":
                return (
                    <div className="space-y-6">
                        {/* Activities List */}
                        <div
                            ref={activitiesRef}
                            className={`space-y-4 overflow-y-auto ${loop.activities.length > 0 ? 'max-h-[calc(100vh-360px)]' : ''}`}
                        >
                            {loop.activities.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-neutral-400 mb-2">
                                        <ListChecks size={48} className="mx-auto" />
                                    </div>
                                    <p className="text-neutral-600">No activities added yet</p>
                                    <p className="text-sm text-neutral-500 mt-1">Add your first activity below</p>
                                </div>
                            ) : (
                                loop.activities.map((activity, index) => (
                                    <div
                                        key={activity.id}
                                        className={`relative rounded-[28px] bg-white border border-neutral-100 overflow-hidden transition-all ${draggedActivityIndex === index ? 'scale-95 opacity-70' : ''
                                            }`}
                                        draggable
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={handleDragEnd}
                                        style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)' }}
                                    >
                                        <div className="p-4">
                                            <div className="flex items-center">
                                                <div className="mr-3 flex items-center">
                                                    <GripVertical size={16} className="text-neutral-300 cursor-grab mr-2" />
                                                    <div
                                                        className="w-12 h-12 rounded-full flex items-center justify-center bg-neutral-100"
                                                        style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}
                                                    >
                                                        {getActivityIcon(activity.icon, 20)}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{activity.name}</h4>
                                                    {activity.description && (
                                                        <p className="text-sm text-neutral-500 mt-0.5">{activity.description}</p>
                                                    )}

                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {activity.duration !== undefined && (
                                                            <div className="inline-flex items-center px-2 py-1 rounded-full bg-neutral-100 text-xs">
                                                                <Clock size={12} className="mr-1" />
                                                                <span>{activity.duration} min</span>
                                                            </div>
                                                        )}

                                                        {activity.repetitionType && activity.repetitionCount && (
                                                            <div className="inline-flex items-center px-2 py-1 rounded-full bg-neutral-100 text-xs">
                                                                <span>{activity.repetitionCount} {activity.repetitionType}</span>
                                                            </div>
                                                        )}

                                                        {activity.subActivities.length > 0 && (
                                                            <div className="inline-flex items-center px-2 py-1 rounded-full bg-neutral-100 text-xs">
                                                                <CheckSquare size={12} className="mr-1" />
                                                                <span>{activity.subActivities.length} tasks</span>
                                                            </div>
                                                        )}

                                                        {activity.linkedEntryType && (
                                                            <div className="inline-flex items-center px-2 py-1 rounded-full bg-neutral-100 text-xs">
                                                                {activity.linkedEntryType === "Note" && <FileText size={12} className="mr-1" />}
                                                                {activity.linkedEntryType === "Spark" && <Zap size={12} className="mr-1" />}
                                                                {activity.linkedEntryType === "Action" && <CheckSquare size={12} className="mr-1" />}
                                                                {activity.linkedEntryType === "Path" && <Target size={12} className="mr-1" />}
                                                                <span>{activity.linkedEntryType}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex space-x-1">
                                                    <button
                                                        onClick={() => handleMoveActivity(index, "up")}
                                                        disabled={index === 0}
                                                        className={`p-2 rounded-full ${index === 0
                                                                ? 'text-neutral-300 cursor-not-allowed'
                                                                : 'text-neutral-500 hover:bg-neutral-100'
                                                            }`}
                                                    >
                                                        <ArrowUp size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleMoveActivity(index, "down")}
                                                        disabled={index === loop.activities.length - 1}
                                                        className={`p-2 rounded-full ${index === loop.activities.length - 1
                                                                ? 'text-neutral-300 cursor-not-allowed'
                                                                : 'text-neutral-500 hover:bg-neutral-100'
                                                            }`}
                                                    >
                                                        <ArrowDown size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditActivity(index)}
                                                        className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteActivity(index)}
                                                        className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Add Activity Button */}
                        <button
                            type="button"
                            onClick={() => setShowAddActivityBottomSheet(true)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-[28px] bg-neutral-50 hover:bg-neutral-100 transition-colors text-neutral-700"
                            style={{ boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)' }}
                        >
                            <Plus size={20} />
                            <span>Add Activity</span>
                        </button>
                    </div>
                );

            case "scheduling":
                return (
                    <div className="space-y-5">
                        {/* Notifications */}
                        <div
                            className="flex items-center justify-between p-4 rounded-[28px] bg-white border border-neutral-100"
                            style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)' }}
                        >
                            <div className="flex items-center">
                                <Bell size={20} className="text-neutral-600 mr-3" />
                                <div>
                                    <h4 className="font-medium">Notifications</h4>
                                    <p className="text-sm text-neutral-500">Receive alerts for this loop</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={loop.notifications}
                                    onChange={handleNotificationsToggle}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-700"></div>
                            </label>
                        </div>

                        {/* Weekly Schedule */}
                        <div
                            className="p-4 rounded-[28px] bg-white border border-neutral-100"
                            style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)' }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <Calendar size={20} className="text-neutral-600 mr-3" />
                                    <h4 className="font-medium">Weekly Schedule</h4>
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-neutral-500 mb-2">Select which days to run this loop</p>
                                <div className="space-y-2">
                                    {loop.schedule.map((day) => (
                                        <div
                                            key={`day-${day.day}`}
                                            className={`flex items-center justify-between p-3 rounded-xl ${day.enabled ? 'bg-neutral-700 text-white' : 'bg-neutral-50 text-neutral-700'
                                                }`}
                                        >
                                            <span>{day.name}</span>
                                            <div className="flex items-center gap-2">
                                                {day.enabled && (
                                                    <input
                                                        type="time"
                                                        value={day.time}
                                                        onChange={(e) => handleTimeChange(day.day, e.target.value)}
                                                        className="px-3 py-1 rounded-lg bg-white/20 border border-white/30 text-sm text-white"
                                                    />
                                                )}
                                                <button
                                                    onClick={() => handleDayToggle(day.day)}
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${day.enabled ? 'bg-white/20 text-white' : 'bg-white text-neutral-700'
                                                        }`}
                                                >
                                                    {day.enabled ? <Check size={16} /> : <Plus size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="h-full w-full max-w-md mx-auto bg-white flex flex-col overflow-hidden">
            {/* Curved Header with Waves */}
            <div className="relative bg-white">
                <div className="h-12 bg-gray-900"></div>
                <div style={waveStyle}></div>

                <div className="px-5 py-3 flex items-center justify-between relative z-10">
                    <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white/90 text-neutral-600 shadow-md backdrop-blur-sm hover:bg-white transition-colors">
                        <ChevronLeft size={20} />
                    </button>

                    <div className="bg-white/90 backdrop-blur-sm px-5 py-2 rounded-full shadow-md">
                        <h3 className="font-medium text-neutral-900">{isEditing ? "Edit Loop" : "Create Loop"}</h3>
                    </div>

                    <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white/90 text-neutral-600 shadow-md backdrop-blur-sm hover:bg-white transition-colors">
                        <MoreVertical size={20} />
                    </button>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="px-5 pt-3 pb-4 flex items-center justify-between">
                {["basic", "activities", "scheduling"].map((stepName, index) => (
                    <button
                        key={stepName}
                        className={`flex flex-col items-center ${step === stepName ? 'opacity-100' : 'opacity-60'}`}
                        onClick={() => setStep(stepName as "basic" | "activities" | "scheduling")}
                    >
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${step === stepName
                                    ? 'bg-neutral-700 text-white'
                                    : 'bg-neutral-100 text-neutral-500'
                                }`}
                        >
                            {index + 1}
                        </div>
                        <span className={`text-xs ${step === stepName ? 'text-neutral-800' : 'text-neutral-500'}`}>
                            {stepName === "basic"
                                ? "Basics"
                                : stepName === "activities"
                                    ? "Activities"
                                    : "Schedule"}
                        </span>
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto px-5 pb-24">
                {renderStepContent()}
            </div>

            {/* "Add Activity" Bottom Sheet */}
            {showAddActivityBottomSheet && (
                <div
                    className="fixed inset-0 bg-black/30 z-50 flex items-end justify-center"
                    onClick={() => setShowAddActivityBottomSheet(false)}
                >
                    <div
                        className="bg-white rounded-t-[28px] w-full max-w-md max-h-[80vh] overflow-y-auto"
                        style={{ boxShadow: '0 -10px 25px rgba(0, 0, 0, 0.1)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-center py-2">
                            <div className="w-12 h-1 rounded-full bg-neutral-200"></div>
                        </div>

                        <div className="p-5">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-lg font-medium">Add Activity</h3>
                                <button onClick={() => setShowAddActivityBottomSheet(false)}>
                                    <X size={20} className="text-neutral-500" />
                                </button>
                            </div>

                            <div>
                                <div className="flex overflow-x-auto gap-2 pb-3">
                                    {activityCategories.map(category => (
                                        <button
                                            key={category.id}
                                            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${selectedCategoryId === category.id
                                                    ? 'bg-neutral-700 text-white'
                                                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                                }`}
                                            onClick={() => setSelectedCategoryId(category.id)}
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-2 max-h-[400px] overflow-y-auto">
                                    {activityCategories
                                        .find(c => c.id === selectedCategoryId)?.activities
                                        .map(activity => (
                                            <div
                                                key={activity.id}
                                                className="p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 cursor-pointer flex items-center"
                                                onClick={() => handleAddActivity(activity)}
                                            >
                                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm">
                                                    {getActivityIcon(activity.icon, 20)}
                                                </div>
                                                <span className="font-medium text-sm">{activity.name}</span>
                                            </div>
                                        ))}
                                </div>

                                <div className="mt-4 pt-4 border-t border-neutral-100">
                                    {showAddCustomActivity ? (
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                value={newCustomActivity.name}
                                                onChange={(e) => setNewCustomActivity({ ...newCustomActivity, name: e.target.value })}
                                                placeholder="Activity name"
                                                className="w-full px-3 py-2 rounded-xl bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setShowAddCustomActivity(false)}
                                                    className="px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-700"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleAddCustomActivity}
                                                    className="px-3 py-1.5 rounded-lg bg-neutral-700 text-white"
                                                    disabled={!newCustomActivity.name.trim()}
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowAddCustomActivity(true)}
                                            className="w-full py-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 text-neutral-700 flex items-center justify-center"
                                        >
                                            <Plus size={18} className="mr-2" />
                                            Add Custom Activity
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Activity Edit Bottom Sheet */}
            {showActivityBottomSheet && tempActivity && (
                <div
                    className="fixed inset-0 bg-black/30 z-50 flex items-end justify-center"
                    onClick={() => setShowActivityBottomSheet(false)}
                >
                    <div
                        className="bg-white rounded-t-[28px] w-full max-w-md max-h-[80vh] overflow-y-auto"
                        style={{ boxShadow: '0 -10px 25px rgba(0, 0, 0, 0.1)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-center py-2">
                            <div className="w-12 h-1 rounded-full bg-neutral-200"></div>
                        </div>

                        <div className="p-5">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-lg font-medium">Edit Activity</h3>
                                <button onClick={() => setShowActivityBottomSheet(false)}>
                                    <X size={20} className="text-neutral-500" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Activity Name */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={tempActivity.name}
                                        onChange={(e) => handleUpdateActivity("name", e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Activity Description */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                                        Description (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={tempActivity.description}
                                        onChange={(e) => handleUpdateActivity("description", e.target.value)}
                                        placeholder="Short description"
                                        className="w-full px-4 py-3 rounded-xl bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Duration */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                                        Duration (Minutes)
                                    </label>
                                    <input
                                        type="number"
                                        value={tempActivity.duration || ""}
                                        onChange={(e) => handleUpdateActivity("duration", e.target.value ? parseInt(e.target.value) : undefined)}
                                        min="1"
                                        placeholder="e.g., 10"
                                        className="w-full px-4 py-3 rounded-xl bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Repetition */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                                            Quantity (Optional)
                                        </label>
                                        <input
                                            type="number"
                                            value={tempActivity.repetitionCount || ""}
                                            onChange={(e) => {
                                                const count = e.target.value ? parseInt(e.target.value) : undefined;
                                                if (count) {
                                                    handleUpdateActivity("repetitionCount", count);
                                                    if (!tempActivity.repetitionType) {
                                                        handleUpdateActivity("repetitionType", "times");
                                                    }
                                                } else {
                                                    handleUpdateActivity("repetitionCount", undefined);
                                                }
                                            }}
                                            min="1"
                                            placeholder="e.g., 10"
                                            className="w-full px-4 py-3 rounded-xl bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                                            Unit
                                        </label>
                                        <input
                                            type="text"
                                            value={tempActivity.repetitionType || ""}
                                            onChange={(e) => {
                                                if (tempActivity.repetitionCount) {
                                                    handleUpdateActivity("repetitionType", e.target.value);
                                                }
                                            }}
                                            placeholder="e.g., reps, pages"
                                            disabled={!tempActivity.repetitionCount}
                                            className="w-full px-4 py-3 rounded-xl bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-neutral-100 disabled:text-neutral-400"
                                        />
                                    </div>
                                </div>

                                {/* Link to entry type */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                                        Link to Entry (Optional)
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {entryTypes.map(entry => (
                                            <button
                                                key={entry.id}
                                                className={`flex flex-col items-center p-3 rounded-xl ${tempActivity.linkedEntryType === entry.name
                                                        ? 'bg-neutral-700 text-white'
                                                        : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                                                    }`}
                                                onClick={() => handleUpdateActivity("linkedEntryType", tempActivity.linkedEntryType === entry.name ? undefined : entry.name)}
                                            >
                                                <div className="mb-1">{entry.icon}</div>
                                                <span className="text-xs">{entry.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sub-Activities */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-neutral-700">
                                            Sub-Tasks (Optional)
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleAddSubActivity}
                                            className="text-sm text-neutral-700 hover:text-neutral-900 flex items-center"
                                        >
                                            <Plus size={16} className="mr-1" />
                                            Add Task
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {tempActivity.subActivities.length === 0 ? (
                                            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
                                                <p className="text-sm text-neutral-500">No sub-tasks added</p>
                                            </div>
                                        ) : (
                                            tempActivity.subActivities.map((subActivity, index) => (
                                                <div
                                                    key={subActivity.id}
                                                    className="flex items-center gap-2"
                                                >
                                                    <input
                                                        type="text"
                                                        value={subActivity.name}
                                                        onChange={(e) => handleUpdateSubActivity(index, e.target.value)}
                                                        placeholder="Task description"
                                                        className="flex-1 px-4 py-3 rounded-xl bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteSubActivity(index)}
                                                        className="p-3 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 rounded-xl"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowActivityBottomSheet(false)}
                                    className="px-5 py-3 rounded-xl bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveActivityChanges}
                                    className="px-5 py-3 rounded-xl bg-neutral-700 text-white hover:bg-neutral-800"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                        onClick={() => {
                            if (step === "basic") {
                                // Navigate back or cancel
                            } else if (step === "activities") {
                                setStep("basic");
                            } else {
                                setStep("activities");
                            }
                        }}
                        className="px-5 py-3 rounded-xl bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    >
                        {step === "basic" ? "Cancel" : "Back"}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            if (step === "basic") {
                                setStep("activities");
                            } else if (step === "activities") {
                                setStep("scheduling");
                            } else {
                                handleSaveLoop();
                            }
                        }}
                        className={`px-5 py-3 rounded-xl flex items-center ${getGradient("primary")} text-white`}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <span className="animate-spin mr-2">⏳</span>
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                {step === "scheduling" ? (
                                    <>
                                        <Save size={18} className="mr-2" />
                                        <span>Save Loop</span>
                                    </>
                                ) : (
                                    <span>Next</span>
                                )}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoopBuilderScreen;