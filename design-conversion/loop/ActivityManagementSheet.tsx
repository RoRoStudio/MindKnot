import { useState } from "react";
import {
    X,
    Check,
    Edit,
    Trash2,
    Plus,
    ChevronDown,
    ChevronUp,
    Search,
    Clock,
    Save
} from "lucide-react";
import { Sheet } from "./ui/sheet";

// Types
type Activity = {
    id: string;
    name: string;
    icon: string;
    description?: string;
    categoryId: string;
    isCustom: boolean;
};

type ActivityCategory = {
    id: string;
    name: string;
    isCustom: boolean;
    isExpanded?: boolean;
};

type ActivityManagementSheetProps = {
    isOpen: boolean;
    onClose: () => void;
    onSelectActivity: (activity: Activity) => void;
    selectedActivities?: Activity[];
};

// Sample data
const initialCategories: ActivityCategory[] = [
    { id: "cat-1", name: "Mindfulness", isCustom: false, isExpanded: true },
    { id: "cat-2", name: "Productivity", isCustom: false, isExpanded: true },
    { id: "cat-3", name: "Health", isCustom: false, isExpanded: true },
    { id: "cat-4", name: "Learning", isCustom: false, isExpanded: false },
    { id: "cat-5", name: "Custom", isCustom: true, isExpanded: true }
];

const initialActivities: Activity[] = [
    // Mindfulness
    { id: "act-1", name: "Meditation", icon: "self_improvement", categoryId: "cat-1", isCustom: false },
    { id: "act-2", name: "Breathing Exercise", icon: "air", categoryId: "cat-1", isCustom: false },
    { id: "act-3", name: "Journaling", icon: "edit_note", categoryId: "cat-1", isCustom: false },

    // Productivity
    { id: "act-4", name: "Email Processing", icon: "email", categoryId: "cat-2", isCustom: false },
    { id: "act-5", name: "Task Planning", icon: "checklist", categoryId: "cat-2", isCustom: false },
    { id: "act-6", name: "Deep Work Session", icon: "work", categoryId: "cat-2", isCustom: false },

    // Health
    { id: "act-7", name: "Hydration", icon: "water_drop", categoryId: "cat-3", isCustom: false },
    { id: "act-8", name: "Quick Workout", icon: "fitness_center", categoryId: "cat-3", isCustom: false },
    { id: "act-9", name: "Stretching", icon: "sports_gymnastics", categoryId: "cat-3", isCustom: false },

    // Learning
    { id: "act-10", name: "Reading", icon: "menu_book", categoryId: "cat-4", isCustom: false },
    { id: "act-11", name: "Online Course", icon: "school", categoryId: "cat-4", isCustom: false },

    // Custom
    { id: "act-12", name: "Morning Coffee", icon: "coffee", categoryId: "cat-5", isCustom: true },
    { id: "act-13", name: "Walking the Dog", icon: "pets", categoryId: "cat-5", isCustom: true }
];

// Available icons for selection
const availableIcons = [
    "self_improvement", "air", "edit_note", "email", "checklist", "work",
    "water_drop", "fitness_center", "sports_gymnastics", "menu_book", "school",
    "coffee", "pets", "restaurant", "shopping_cart", "headphones", "smartphone",
    "home", "directions_car", "local_cafe", "watch", "paid", "savings", "brush",
    "palette", "music_note", "phone", "camera_alt", "call", "chat", "notifications"
];

export const ActivityManagementSheet = ({
    isOpen,
    onClose,
    onSelectActivity,
    selectedActivities = []
}: ActivityManagementSheetProps) => {
    const [activities, setActivities] = useState<Activity[]>(initialActivities);
    const [categories, setCategories] = useState<ActivityCategory[]>(initialCategories);
    const [searchQuery, setSearchQuery] = useState("");

    // State for editing
    const [editMode, setEditMode] = useState<"none" | "activity" | "category">("none");
    const [editItemId, setEditItemId] = useState<string | null>(null);

    // State for creating
    const [isCreatingActivity, setIsCreatingActivity] = useState(false);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);

    // Form state
    const [newActivityName, setNewActivityName] = useState("");
    const [newActivityDescription, setNewActivityDescription] = useState("");
    const [newActivityIcon, setNewActivityIcon] = useState("check_circle");
    const [newActivityCategoryId, setNewActivityCategoryId] = useState("");

    const [newCategoryName, setNewCategoryName] = useState("");

    // Toggle category expansion
    const toggleCategory = (categoryId: string) => {
        setCategories(prev =>
            prev.map(cat =>
                cat.id === categoryId ? { ...cat, isExpanded: !cat.isExpanded } : cat
            )
        );
    };

    // Handle selecting an activity
    const handleSelectActivity = (activity: Activity) => {
        onSelectActivity(activity);
    };

    // Create new activity
    const handleCreateActivity = () => {
        if (!newActivityName.trim() || !newActivityCategoryId) return;

        const newActivity: Activity = {
            id: `act-${Date.now()}`,
            name: newActivityName.trim(),
            description: newActivityDescription.trim() || undefined,
            icon: newActivityIcon,
            categoryId: newActivityCategoryId,
            isCustom: true
        };

        setActivities(prev => [...prev, newActivity]);

        // Reset form
        setNewActivityName("");
        setNewActivityDescription("");
        setNewActivityIcon("check_circle");
        setNewActivityCategoryId("");
        setIsCreatingActivity(false);
    };

    // Create new category
    const handleCreateCategory = () => {
        if (!newCategoryName.trim()) return;

        const newCategory: ActivityCategory = {
            id: `cat-${Date.now()}`,
            name: newCategoryName.trim(),
            isCustom: true,
            isExpanded: true
        };

        setCategories(prev => [...prev, newCategory]);

        // Reset form
        setNewCategoryName("");
        setIsCreatingCategory(false);
    };

    // Edit activity
    const handleEditActivity = (activityId: string) => {
        const activity = activities.find(a => a.id === activityId);
        if (!activity || !activity.isCustom) return;

        setEditMode("activity");
        setEditItemId(activityId);
        setNewActivityName(activity.name);
        setNewActivityDescription(activity.description || "");
        setNewActivityIcon(activity.icon);
        setNewActivityCategoryId(activity.categoryId);
    };

    // Edit category
    const handleEditCategory = (categoryId: string) => {
        const category = categories.find(c => c.id === categoryId);
        if (!category || !category.isCustom) return;

        setEditMode("category");
        setEditItemId(categoryId);
        setNewCategoryName(category.name);
    };

    // Save edited activity
    const handleSaveEditedActivity = () => {
        if (!editItemId || !newActivityName.trim() || !newActivityCategoryId) return;

        setActivities(prev =>
            prev.map(activity =>
                activity.id === editItemId
                    ? {
                        ...activity,
                        name: newActivityName.trim(),
                        description: newActivityDescription.trim() || undefined,
                        icon: newActivityIcon,
                        categoryId: newActivityCategoryId
                    }
                    : activity
            )
        );

        // Reset form
        setEditMode("none");
        setEditItemId(null);
        setNewActivityName("");
        setNewActivityDescription("");
        setNewActivityIcon("");
        setNewActivityCategoryId("");
    };

    // Save edited category
    const handleSaveEditedCategory = () => {
        if (!editItemId || !newCategoryName.trim()) return;

        setCategories(prev =>
            prev.map(category =>
                category.id === editItemId
                    ? {
                        ...category,
                        name: newCategoryName.trim()
                    }
                    : category
            )
        );

        // Reset form
        setEditMode("none");
        setEditItemId(null);
        setNewCategoryName("");
    };

    // Delete activity
    const handleDeleteActivity = (activityId: string) => {
        setActivities(prev => prev.filter(activity => activity.id !== activityId));
    };

    // Delete category
    const handleDeleteCategory = (categoryId: string) => {
        // Don't delete if there are activities in this category
        const hasActivities = activities.some(activity => activity.categoryId === categoryId);
        if (hasActivities) {
            alert("Cannot delete a category that contains activities. Move or delete the activities first.");
            return;
        }

        setCategories(prev => prev.filter(category => category.id !== categoryId));
    };

    // Filter activities by search query
    const filteredActivities = activities.filter(activity =>
        activity.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group activities by category
    const groupedActivities = categories.map(category => ({
        ...category,
        activities: filteredActivities.filter(activity => activity.categoryId === category.id)
    }));

    // Custom wave CSS for curved design in the sheet header
    const waveStyle = {
        position: 'absolute' as 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '30px',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' opacity='.25' class='shape-fill' fill='%23111827'%3E%3C/path%3E%3Cpath d='M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z' opacity='.5' class='shape-fill' fill='%23111827'%3E%3C/path%3E%3Cpath d='M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z' class='shape-fill' fill='%23111827' opacity='.75'%3E%3C/path%3E%3C/svg%3E")`,
        backgroundSize: 'cover',
        transform: 'rotate(180deg)',
        zIndex: '10',
    };

    return (
        <Sheet isOpen={isOpen} onClose={onClose} position="bottom">
            <div className="h-[85vh] flex flex-col bg-white overflow-hidden rounded-t-[28px]">
                {/* Header with elegant curved design */}
                <div className="relative bg-gray-900 text-white px-5 pt-8 pb-10">
                    <div style={waveStyle}></div>

                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-medium">Activities</h3>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20 text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-white/60" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search activities..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/10 text-white placeholder-white/60 border-0 focus:ring-1 focus:ring-white/30"
                        />
                    </div>
                </div>

                {/* Category and Activity Management */}
                <div className="flex-1 overflow-y-auto pt-4 pb-24">
                    {/* Add Category/Activity Buttons */}
                    <div className="px-5 mb-4 flex space-x-3">
                        <button
                            onClick={() => {
                                setIsCreatingCategory(true);
                                setIsCreatingActivity(false);
                                setEditMode("none");
                            }}
                            className="flex-1 py-2 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center"
                        >
                            <Plus size={16} className="mr-2" />
                            New Category
                        </button>

                        <button
                            onClick={() => {
                                setIsCreatingActivity(true);
                                setIsCreatingCategory(false);
                                setEditMode("none");
                                if (categories.length > 0) {
                                    setNewActivityCategoryId(categories[0].id);
                                }
                            }}
                            className="flex-1 py-2 px-4 rounded-xl bg-neutral-700 text-white flex items-center justify-center"
                        >
                            <Plus size={16} className="mr-2" />
                            New Activity
                        </button>
                    </div>

                    {/* Create/Edit Category Form */}
                    {(isCreatingCategory || editMode === "category") && (
                        <div className="mx-5 mb-4 p-4 rounded-[28px] bg-white border border-neutral-100 shadow-lg">
                            <h4 className="font-medium mb-3">
                                {editMode === "category" ? "Edit Category" : "Create New Category"}
                            </h4>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm text-neutral-600 mb-1">Category Name</label>
                                    <input
                                        type="text"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        placeholder="Enter category name"
                                        className="w-full p-2 rounded-lg bg-neutral-50 border-0"
                                    />
                                </div>

                                <div className="flex justify-end space-x-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setIsCreatingCategory(false);
                                            setEditMode("none");
                                            setEditItemId(null);
                                            setNewCategoryName("");
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-700"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={editMode === "category" ? handleSaveEditedCategory : handleCreateCategory}
                                        disabled={!newCategoryName.trim()}
                                        className={`px-3 py-1.5 rounded-lg ${newCategoryName.trim()
                                                ? 'bg-neutral-700 text-white'
                                                : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                                            }`}
                                    >
                                        {editMode === "category" ? "Save Changes" : "Create Category"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Create/Edit Activity Form */}
                    {(isCreatingActivity || editMode === "activity") && (
                        <div className="mx-5 mb-4 p-4 rounded-[28px] bg-white border border-neutral-100 shadow-lg">
                            <h4 className="font-medium mb-3">
                                {editMode === "activity" ? "Edit Activity" : "Create New Activity"}
                            </h4>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm text-neutral-600 mb-1">Activity Name</label>
                                    <input
                                        type="text"
                                        value={newActivityName}
                                        onChange={(e) => setNewActivityName(e.target.value)}
                                        placeholder="Enter activity name"
                                        className="w-full p-2 rounded-lg bg-neutral-50 border-0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-neutral-600 mb-1">Description (Optional)</label>
                                    <input
                                        type="text"
                                        value={newActivityDescription}
                                        onChange={(e) => setNewActivityDescription(e.target.value)}
                                        placeholder="Brief description"
                                        className="w-full p-2 rounded-lg bg-neutral-50 border-0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-neutral-600 mb-1">Category</label>
                                    <select
                                        value={newActivityCategoryId}
                                        onChange={(e) => setNewActivityCategoryId(e.target.value)}
                                        className="w-full p-2 rounded-lg bg-neutral-50 border-0"
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-neutral-600 mb-1">Icon</label>
                                    <div className="grid grid-cols-8 gap-2 mt-1 max-h-[120px] overflow-y-auto p-2 rounded-lg bg-neutral-50">
                                        {availableIcons.map(icon => (
                                            <button
                                                key={icon}
                                                type="button"
                                                onClick={() => setNewActivityIcon(icon)}
                                                className={`w-9 h-9 rounded-lg flex items-center justify-center ${newActivityIcon === icon
                                                        ? 'bg-neutral-700 text-white'
                                                        : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                                                    }`}
                                            >
                                                <span className="material-icons" style={{ fontSize: 20 }}>{icon}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setIsCreatingActivity(false);
                                            setEditMode("none");
                                            setEditItemId(null);
                                            setNewActivityName("");
                                            setNewActivityDescription("");
                                            setNewActivityIcon("check_circle");
                                            setNewActivityCategoryId("");
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-700"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={editMode === "activity" ? handleSaveEditedActivity : handleCreateActivity}
                                        disabled={!newActivityName.trim() || !newActivityCategoryId}
                                        className={`px-3 py-1.5 rounded-lg ${newActivityName.trim() && newActivityCategoryId
                                                ? 'bg-neutral-700 text-white'
                                                : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                                            }`}
                                    >
                                        {editMode === "activity" ? "Save Changes" : "Create Activity"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Activity Categories */}
                    <div className="space-y-4">
                        {groupedActivities.map(category => (
                            <div key={category.id} className="px-5">
                                {/* Category Header */}
                                <div
                                    className="flex items-center justify-between py-2"
                                    onClick={() => toggleCategory(category.id)}
                                >
                                    <div className="flex items-center">
                                        <button className="text-neutral-600 mr-1">
                                            {category.isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </button>
                                        <h4 className="font-medium text-neutral-800">{category.name}</h4>
                                        {category.isCustom && (
                                            <span className="ml-2 px-2 py-0.5 rounded-full bg-neutral-100 text-xs text-neutral-600">
                                                Custom
                                            </span>
                                        )}
                                    </div>

                                    {category.isCustom && (
                                        <div className="flex space-x-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditCategory(category.id);
                                                }}
                                                className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteCategory(category.id);
                                                }}
                                                className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Activities List */}
                                {category.isExpanded && (
                                    <div className="space-y-2 mb-4">
                                        {category.activities.length === 0 ? (
                                            <div className="p-4 text-center text-neutral-500 text-sm">
                                                No activities in this category
                                            </div>
                                        ) : (
                                            category.activities.map(activity => {
                                                const isSelected = selectedActivities.some(a => a.id === activity.id);

                                                return (
                                                    <div
                                                        key={activity.id}
                                                        className={`p-3 rounded-xl flex items-center justify-between ${isSelected
                                                                ? 'bg-neutral-700 text-white'
                                                                : 'bg-neutral-50 text-neutral-800 hover:bg-neutral-100'
                                                            }`}
                                                        onClick={() => handleSelectActivity(activity)}
                                                    >
                                                        <div className="flex items-center">
                                                            <div
                                                                className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${isSelected ? 'bg-white text-neutral-700' : 'bg-neutral-100 text-neutral-600'
                                                                    }`}
                                                            >
                                                                <span className="material-icons" style={{ fontSize: 18 }}>{activity.icon}</span>
                                                            </div>

                                                            <div>
                                                                <div className="font-medium">
                                                                    {activity.name}
                                                                    {activity.isCustom && (
                                                                        <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${isSelected ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-600'
                                                                            }`}>
                                                                            Custom
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {activity.description && (
                                                                    <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-neutral-500'}`}>
                                                                        {activity.description}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center">
                                                            {isSelected && (
                                                                <div className="mr-3">
                                                                    <Check size={18} />
                                                                </div>
                                                            )}

                                                            {activity.isCustom && (
                                                                <div className="flex space-x-1">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleEditActivity(activity.id);
                                                                        }}
                                                                        className={`p-1 rounded-full ${isSelected ? 'text-white/80 hover:bg-white/10' : 'text-neutral-500 hover:bg-neutral-200'
                                                                            }`}
                                                                    >
                                                                        <Edit size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteActivity(activity.id);
                                                                        }}
                                                                        className={`p-1 rounded-full ${isSelected ? 'text-white/80 hover:bg-white/10' : 'text-neutral-500 hover:bg-neutral-200'
                                                                            }`}
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Actions */}
                <div
                    className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-neutral-100"
                    style={{ boxShadow: '0 -5px 25px rgba(0, 0, 0, 0.08)' }}
                >
                    <div className="flex justify-between items-center">
                        <button
                            onClick={onClose}
                            className="px-5 py-3 rounded-xl bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={onClose}
                            className="px-5 py-3 rounded-xl bg-neutral-700 text-white flex items-center"
                        >
                            <Save size={18} className="mr-2" />
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </Sheet>
    );
};

export default ActivityManagementSheet;