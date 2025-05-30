import { Activity } from "./LoopExecutionScreen";
import { Dumbbell, Coffee, BookOpen, PenLine, Utensils, Clock, Repeat } from "lucide-react";

interface CurrentActivityProps {
    activity: Activity;
}

export const CurrentActivity = ({ activity }: CurrentActivityProps) => {
    // Function to get the appropriate icon for the activity
    const getActivityIcon = (activityName: string) => {
        switch (activityName.toLowerCase()) {
            case "yoga":
            case "workout":
            case "exercise":
                return <Dumbbell size={26} />;
            case "meditation":
            case "hydration":
                return <Coffee size={26} />;
            case "reading":
            case "journaling":
                return <BookOpen size={26} />;
            case "writing":
                return <PenLine size={26} />;
            case "breakfast":
            case "lunch":
            case "dinner":
                return <Utensils size={26} />;
            default:
                // First letter of activity name as fallback
                return activityName.charAt(0);
        }
    };

    return (
        <div className="mb-8 overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="bg-brand-primary-50 px-5 py-4 border-b border-brand-primary-100">
                <div className="flex items-center">
                    <div className="size-14 rounded-xl bg-white flex items-center justify-center text-brand-primary-600 mr-4 shadow-sm border border-brand-primary-200">
                        {getActivityIcon(activity.name)}
                    </div>
                    <div>
                        <h2 className="text-neutral-700 mb-1">{activity.name}</h2>
                        <p className="text-neutral-500 text-sm">{activity.description}</p>
                    </div>
                </div>
            </div>

            <div className="px-5 py-4 flex flex-wrap gap-3">
                <div className="flex items-center rounded-lg bg-neutral-50 px-3 py-2">
                    <Clock size={16} className="mr-2 text-brand-primary-600" />
                    <span className="text-neutral-700 text-sm">
                        {activity.duration} {activity.duration === 1 ? 'minute' : 'minutes'}
                    </span>
                </div>

                {activity.repetitionType && activity.repetitionCount && (
                    <div className="flex items-center rounded-lg bg-neutral-50 px-3 py-2">
                        <Repeat size={16} className="mr-2 text-brand-primary-600" />
                        <span className="text-neutral-700 text-sm">
                            {activity.repetitionCount} {activity.repetitionType}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};