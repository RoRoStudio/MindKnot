import { Activity } from "./LoopExecutionScreen";
import { Dumbbell, Coffee, BookOpen, PenLine, Utensils, Clock, Repeat } from "lucide-react";

interface NextActivityPreviewProps {
    activity: Activity;
}

export const NextActivityPreview = ({ activity }: NextActivityPreviewProps) => {
    // Function to get the appropriate icon for the activity
    const getActivityIcon = (activityName: string) => {
        switch (activityName.toLowerCase()) {
            case "yoga":
            case "workout":
            case "exercise":
                return <Dumbbell size={20} />;
            case "meditation":
            case "hydration":
                return <Coffee size={20} />;
            case "reading":
            case "journaling":
                return <BookOpen size={20} />;
            case "writing":
                return <PenLine size={20} />;
            case "breakfast":
            case "lunch":
            case "dinner":
                return <Utensils size={20} />;
            default:
                // First letter of activity name as fallback
                return activityName.charAt(0);
        }
    };

    return (
        <div className="mb-8">
            <h4 className="mb-3 text-neutral-600 font-medium px-1">Next Activity</h4>
            <div className="p-4 bg-neutral-50 rounded-xl hover:shadow-sm transition-all duration-300">
                <div className="flex items-center">
                    <div className="size-12 rounded-xl bg-white flex items-center justify-center mr-4 text-neutral-400 border border-neutral-200">
                        {getActivityIcon(activity.name)}
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-neutral-700 mb-2">{activity.name}</p>
                        <div className="flex flex-wrap gap-2">
                            <div className="flex items-center text-neutral-500 text-xs bg-white px-2 py-1 rounded-md">
                                <Clock size={12} className="mr-1" />
                                {activity.duration} {activity.duration === 1 ? 'min' : 'mins'}
                            </div>

                            {activity.repetitionType && activity.repetitionCount && (
                                <div className="flex items-center text-neutral-500 text-xs bg-white px-2 py-1 rounded-md">
                                    <Repeat size={12} className="mr-1" />
                                    {activity.repetitionCount} {activity.repetitionType}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};