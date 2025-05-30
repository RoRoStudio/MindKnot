import { Check } from "lucide-react";

interface SubActivity {
    id: string;
    name: string;
    completed: boolean;
}

interface SubActivityChecklistProps {
    subActivities: SubActivity[];
    onToggle: (id: string) => void;
}

export const SubActivityChecklist = ({ subActivities, onToggle }: SubActivityChecklistProps) => {
    if (subActivities.length === 0) {
        return null;
    }

    return (
        <div className="mb-8">
            <h4 className="mb-3 text-foreground/90 font-medium px-1">Sub-activities</h4>
            <div className="space-y-3">
                {subActivities.map((subActivity) => (
                    <div
                        key={subActivity.id}
                        className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200
              ${subActivity.completed
                                ? 'bg-neutral-50 shadow-sm'
                                : 'bg-white hover:bg-neutral-50'
                            }
              relative overflow-hidden group`}
                        onClick={() => onToggle(subActivity.id)}
                    >
                        {/* Left accent bar */}
                        <div
                            className={`absolute left-0 top-0 h-full w-1 
                ${subActivity.completed
                                    ? 'bg-functional-success-main'
                                    : 'bg-brand-primary-600 opacity-0 group-hover:opacity-100'
                                } transition-all duration-300`}
                        />

                        <div
                            className={`size-6 rounded-md flex items-center justify-center mr-4 transition-all duration-300 ${subActivity.completed
                                    ? 'bg-functional-success-main shadow-sm'
                                    : 'bg-white border border-neutral-200 group-hover:border-brand-primary-600'
                                }`}
                        >
                            {subActivity.completed && <Check size={16} className="text-white" />}
                        </div>
                        <span className={`transition-all duration-200 ${subActivity.completed
                                ? 'text-neutral-500 line-through'
                                : 'text-neutral-700'
                            }`}>
                            {subActivity.name}
                        </span>

                        {/* Subtle background pattern */}
                        <div className={`absolute right-0 bottom-0 opacity-5 ${subActivity.completed ? 'opacity-10' : ''}`}>
                            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M50 10L10 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <path d="M30 10L10 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <path d="M50 30L30 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};