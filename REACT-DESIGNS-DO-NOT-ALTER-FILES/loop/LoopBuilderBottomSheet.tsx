import { useState } from "react";
import {
    X,
    Plus,
    Move,
    ChevronUp,
    ChevronDown,
    Clock,
    CheckCircle2,
    Edit,
    Trash2,
    Save
} from "lucide-react";
import { Sheet } from "./ui/sheet";
import ActivityManagementSheet from "./ActivityManagementSheet";

// Types
type Activity = {
    id: string;
    name: string;
    icon: string;
    description?: string;
    duration?: number;
    subActivities: {
        id: string;
        name: string;
        completed: boolean;
    }[];
    categoryId: string;
    isCustom: boolean;
};

type LoopBuilderBottomSheetProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (activities: Activity[]) => void;
    initialActivities?: Activity[];
};

export const LoopBuilderBottomSheet = ({
    isOpen,
    onClose,
    onSave,
    initialActivities = []
}: LoopBuilderBottomSheetProps) => {
    const [activities, setActivities] = useState<Activity[]>(initialActivities);
    const [isActivitySheetOpen, setIsActivitySheetOpen] = useState(false);
    const [editingActivityId, setEditingActivityId] = useState<string | null>(null);

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

    // Handle adding an activity
    const handleAddActivity = (activity: Activity) => {
        const newActivity = {
            ...activity,
            subActivities: [],
            duration: activity.duration || 5 // Default duration
        };

        setActivities(prev => [...prev, newActivity]);
        setIsActivitySheetOpen(false);
    };

    // Handle editing an activity's details directly in this sheet
    const handleUpdateActivity = (activityId: string, updates: Partial<Activity>) => {
        setActivities(prev =>
            prev.map(activity =>
                activity.id === activityId ? { ...activity, ...updates } : activity
            )
        );
    };

    // Handle deleting an activity
    const handleDeleteActivity = (activityId: string) => {
        setActivities(prev => prev.filter(activity => activity.id !== activityId));
    };

    // Handle moving an activity up in the list
    const handleMoveUp = (index: number) => {
        if (index === 0) return;

        const newActivities = [...activities];
        const temp = newActivities[index];
        newActivities[index] = newActivities[index - 1];
        newActivities[index - 1] = temp;

        setActivities(newActivities);
    };

    // Handle moving an activity down in the list
    const handleMoveDown = (index: number) => {
        if (index === activities.length - 1) return;

        const newActivities = [...activities];
        const temp = newActivities[index];
        newActivities[index] = newActivities[index + 1];
        newActivities[index + 1] = temp;

        setActivities(newActivities);
    };

    // Handle adding a sub-activity
    const handleAddSubActivity = (activityId: string) => {
        const activity = activities.find(a => a.id === activityId);
        if (!activity) return;

        const newSubActivity = {
            id: `sub-${Date.now()}`,
            name: "",
            completed: false
        };

        handleUpdateActivity(activityId, {
            subActivities: [...activity.subActivities, newSubActivity]
        });

        // Focus the new input after it's rendered
        setTimeout(() => {
            const input = document.getElementById(`sub-activity-${newSubActivity.id}`);
            if (input) input.focus();
        }, 10);
    };

    // Handle updating a sub-activity
    const handleUpdateSubActivity = (activityId: string, subActivityId: string, name: string) => {
        const activity = activities.find(a => a.id === activityId);
        if (!activity) return;

        const updatedSubActivities = activity.subActivities.map(sub =>
            sub.id === subActivityId ? { ...sub, name } : sub
        );

        handleUpdateActivity(activityId, { subActivities: updatedSubActivities });
    };

    // Handle removing a sub-activity
    const handleRemoveSubActivity = (activityId: string, subActivityId: string) => {
        const activity = activities.find(a => a.id === activityId);
        if (!activity) return;

        const updatedSubActivities = activity.subActivities.filter(sub => sub.id !== subActivityId);

        handleUpdateActivity(activityId, { subActivities: updatedSubActivities });
    };

    // Calculate total duration
    const totalDuration = activities.reduce((total, activity) => total + (activity.duration || 0), 0);

    return (
        <>
            <Sheet isOpen={isOpen} onClose={onClose} position="bottom">
                <div className="h-[85vh] flex flex-col bg-white overflow-hidden rounded-t-[28px]">
                    {/* Header with elegant curved design */}
                    <div className="relative bg-gray-900 text-white px-5 pt-8 pb-10">
                        <div style={waveStyle}></div>

                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xl font-medium">Build Your Loop</h3>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20 text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Clock size={18} className="mr-2 text-white/80" />
                                <span>Total: {totalDuration} min</span>
                            </div>

                            <div className="flex items-center">
                                <CheckCircle2 size={18} className="mr-2 text-white/80" />
                                <span>{activities.length} Activities</span>
                            </div>
                        </div>
                    </div>

                    {/* Activities List */}
                    <div className="flex-1 overflow-y-auto py-4 px-5">
                        {activities.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-center text-neutral-500">
                                <p className="mb-3">No activities added yet</p>
                                <button
                                    onClick={() => setIsActivitySheetOpen(true)}
                                    className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center"
                                >
                                    <Plus size={16} className="mr-2" />
                                    Add Activity
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {activities.map((activity, index) => (
                                    <div
                                        key={activity.id}
                                        className="p-4 rounded-[28px] bg-white border border-neutral-100 shadow-md"
                                    >
                                        <div className="flex items-start">
                                            <div className="flex flex-col items-center mr-3">
                                                <button
                                                    onClick={() => handleMoveUp(index)}
                                                    disabled={index === 0}
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${index === 0
                                                            ? 'bg-neutral-100 text-neutral-300 cursor-not-allowed'
                                                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                                        }`}
                                                >
                                                    <ChevronUp size={18} />
                                                </button>

                                                <div className="w-8 h-8 rounded-full bg-neutral-700 text-white flex items-center justify-center">
                                                    {index + 1}
                                                </div>

                                                <button
                                                    onClick={() => handleMoveDown(index)}
                                                    disabled={index === activities.length - 1}
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center mt-1 ${index === activities.length - 1
                                                            ? 'bg-neutral-100 text-neutral-300 cursor-not-allowed'
                                                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                                        }`}
                                                >
                                                    <ChevronDown size={18} />
                                                </button>
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center">
                                                        <div
                                                            className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-neutral-100 text-neutral-700"
                                                        >
                                                            <span className="material-icons" style={{ fontSize: 20 }}>{activity.icon}</span>
                                                        </div>

                                                        <div>
                                                            <h4 className="font-medium text-neutral-800">{activity.name}</h4>
                                                            {activity.description && (
                                                                <p className="text-sm text-neutral-500">{activity.description}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center">
                                                        <div className="flex items-center mr-3 text-sm text-neutral-500">
                                                            <Clock size={14} className="mr-1" />
                                                            <input
                                                                type="number"
                                                                value={activity.duration}
                                                                onChange={(e) => handleUpdateActivity(
                                                                    activity.id,
                                                                    { duration: parseInt(e.target.value) || 0 }
                                                                )}
                                                                min="1"
                                                                max="180"
                                                                className="w-12 py-0.5 px-1 rounded bg-neutral-50 text-center"
                                                            />
                                                            <span className="ml-1">min</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Sub-activities */}
                                                {activity.subActivities.length > 0 && (
                                                    <div className="mt-3 mb-3 pl-2">
                                                        <div className="text-sm font-medium text-neutral-700 mb-1">Sub-activities:</div>
                                                        <div className="space-y-1">
                                                            {activity.subActivities.map(sub => (
                                                                <div key={sub.id} className="flex items-center">
                                                                    <input
                                                                        id={`sub-activity-${sub.id}`}
                                                                        type="text"
                                                                        value={sub.name}
                                                                        onChange={(e) => handleUpdateSubActivity(activity.id, sub.id, e.target.value)}
                                                                        placeholder="Enter sub-activity"
                                                                        className="flex-1 py-1 px-2 text-sm rounded-lg bg-neutral-50 mr-1"
                                                                    />
                                                                    <button
                                                                        onClick={() => handleRemoveSubActivity(activity.id, sub.id)}
                                                                        className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100"
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleAddSubActivity(activity.id)}
                                                            className="px-3 py-1 rounded-lg bg-neutral-100 text-neutral-700 text-sm hover:bg-neutral-200 flex items-center"
                                                        >
                                                            <Plus size={14} className="mr-1" />
                                                            Add Step
                                                        </button>

                                                        <button
                                                            onClick={() => setEditingActivityId(activity.id)}
                                                            className="px-3 py-1 rounded-lg bg-neutral-100 text-neutral-700 text-sm hover:bg-neutral-200 flex items-center"
                                                        >
                                                            <Edit size={14} className="mr-1" />
                                                            Edit
                                                        </button>
                                                    </div>

                                                    <button
                                                        onClick={() => handleDeleteActivity(activity.id)}
                                                        className="w-8 h-8 rounded-full flex items-center justify-center bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Add Activity Button */}
                                <button
                                    onClick={() => setIsActivitySheetOpen(true)}
                                    className="w-full py-3 rounded-[28px] bg-white border border-neutral-100 hover:border-neutral-300 text-neutral-700 flex items-center justify-center shadow-sm"
                                >
                                    <Plus size={18} className="mr-2" />
                                    Add Activity
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Bottom Actions */}
                    <div
                        className="p-4 bg-white border-t border-neutral-100"
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
                                onClick={() => onSave(activities)}
                                className="px-5 py-3 rounded-xl bg-neutral-700 text-white flex items-center"
                            >
                                <Save size={18} className="mr-2" />
                                Save Activities
                            </button>
                        </div>
                    </div>
                </div>
            </Sheet>

            {/* Activity Management Sheet */}
            <ActivityManagementSheet
                isOpen={isActivitySheetOpen}
                onClose={() => setIsActivitySheetOpen(false)}
                onSelectActivity={handleAddActivity}
                selectedActivities={activities}
            />
        </>
    );
};

export default LoopBuilderBottomSheet;