import { Activity } from "./LoopExecutionScreen";
import { Dumbbell, Coffee, BookOpen, PenLine, Utensils } from "lucide-react";

interface ActivityIndicatorsProps {
    activities: Activity[];
    currentIndex: number;
}

export const ActivityIndicators = ({ activities, currentIndex }: ActivityIndicatorsProps) => {
    // Function to get the appropriate icon for each activity
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
        <div className="mb-8 overflow-x-auto pb-1">
            <div className="flex items-center py-2 space-x-5">
                {activities.map((activity, index) => {
                    // Define styles based on activity status
                    let containerStyle = "";
                    let iconStyle = "";

                    switch (activity.status) {
                        case "completed":
                            containerStyle = "bg-white border-2 border-functional-success-main";
                            iconStyle = "text-functional-success-main";
                            break;
                        case "active":
                            containerStyle = "bg-white border-2 border-brand-primary-600";
                            iconStyle = "text-brand-primary-600";
                            break;
                        case "skipped":
                            containerStyle = "bg-white border-2 border-neutral-400";
                            iconStyle = "text-neutral-400";
                            break;
                        case "pending":
                            containerStyle = "bg-white border-2 border-neutral-200";
                            iconStyle = "text-neutral-200";
                            break;
                    }

                    return (
                        <div
                            key={activity.id}
                            className={`size-14 rounded-full flex items-center justify-center transition-all duration-300 ${containerStyle} shadow-sm`}
                        >
                            <div className={`${iconStyle} transition-colors duration-300`}>
                                {getActivityIcon(activity.name)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};