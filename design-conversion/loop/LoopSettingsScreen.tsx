import { useState } from "react";
import {
    ChevronLeft,
    MoreVertical,
    Bell,
    Calendar,
    Users,
    Clock,
    AlertTriangle,
    ArrowRight,
    Check,
    Plus,
    Trash2
} from "lucide-react";

// Day of week type
type WeekDay = {
    day: number; // 0-6 (Sunday-Saturday)
    name: string; // "Sunday", "Monday", etc.
    time: string; // HH:MM format
    enabled: boolean;
};

// Loop Settings type
type LoopSettings = {
    notifications: boolean;
    schedule: WeekDay[];
};

// Initial settings
const initialSettings: LoopSettings = {
    notifications: true,
    schedule: [
        { day: 0, name: "Sunday", time: "08:00", enabled: false },
        { day: 1, name: "Monday", time: "08:00", enabled: true },
        { day: 2, name: "Tuesday", time: "08:00", enabled: true },
        { day: 3, name: "Wednesday", time: "08:00", enabled: true },
        { day: 4, name: "Thursday", time: "08:00", enabled: true },
        { day: 5, name: "Friday", time: "08:00", enabled: true },
        { day: 6, name: "Saturday", time: "08:00", enabled: false }
    ]
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

export const LoopSettingsScreen = () => {
    const [settings, setSettings] = useState<LoopSettings>(initialSettings);
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

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

    // Handle toggling notifications
    const handleNotificationsToggle = () => {
        setSettings({
            ...settings,
            notifications: !settings.notifications
        });
        setIsDirty(true);
    };

    // Handle day toggle in schedule
    const handleDayToggle = (dayIndex: number) => {
        const updatedSchedule = [...settings.schedule];
        updatedSchedule[dayIndex] = {
            ...updatedSchedule[dayIndex],
            enabled: !updatedSchedule[dayIndex].enabled
        };

        setSettings({
            ...settings,
            schedule: updatedSchedule
        });
        setIsDirty(true);
    };

    // Handle time change
    const handleTimeChange = (dayIndex: number, time: string) => {
        const updatedSchedule = [...settings.schedule];
        updatedSchedule[dayIndex] = {
            ...updatedSchedule[dayIndex],
            time
        };

        setSettings({
            ...settings,
            schedule: updatedSchedule
        });
        setIsDirty(true);
    };

    // Handle save settings
    const handleSaveSettings = () => {
        setIsSaving(true);

        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            setIsDirty(false);
            alert("Settings saved successfully!");
        }, 1000);
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
                        <h3 className="font-medium text-neutral-900">Loop Settings</h3>
                    </div>

                    <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white/90 text-neutral-600 shadow-md backdrop-blur-sm hover:bg-white transition-colors">
                        <MoreVertical size={20} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
                {/* Notification Settings */}
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
                                className="w-12 h-12 rounded-full flex items-center justify-center mr-4 bg-white/20 backdrop-blur-sm"
                                style={{
                                    boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)',
                                    border: '2px solid rgba(255, 255, 255, 0.3)'
                                }}
                            >
                                <Bell size={24} />
                            </div>
                            <div>
                                <h3 className="text-white font-medium">Notifications</h3>
                                <p className="text-sm text-white/80">Remind me about this loop</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-neutral-700">Enable notifications</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications}
                                    onChange={handleNotificationsToggle}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-700"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Schedule Settings */}
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
                                className="w-12 h-12 rounded-full flex items-center justify-center mr-4 bg-white/20 backdrop-blur-sm"
                                style={{
                                    boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)',
                                    border: '2px solid rgba(255, 255, 255, 0.3)'
                                }}
                            >
                                <Calendar size={24} />
                            </div>
                            <div>
                                <h3 className="text-white font-medium">Schedule</h3>
                                <p className="text-sm text-white/80">When to run this loop</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 space-y-4">
                        <div className="space-y-2">
                            {settings.schedule.map((day) => (
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

                {/* Danger Zone */}
                <div
                    className="rounded-[28px] overflow-hidden shadow-lg border border-neutral-100"
                    style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)' }}
                >
                    <div
                        className="relative px-5 py-4 text-white bg-gradient-to-br from-red-500 to-red-600"
                        style={{
                            borderBottomLeftRadius: '60% 30%',
                            borderBottomRightRadius: '60% 30%',
                            boxShadow: 'inset 0 -10px 15px -12px rgba(0, 0, 0, 0.2)'
                        }}
                    >
                        <div className="flex items-center">
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center mr-4 bg-white/20 backdrop-blur-sm"
                                style={{
                                    boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)',
                                    border: '2px solid rgba(255, 255, 255, 0.3)'
                                }}
                            >
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className="text-white font-medium">Danger Zone</h3>
                                <p className="text-sm text-white/80">Destructive actions</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-5">
                        <button
                            className="w-full py-3 rounded-xl flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100"
                        >
                            <Trash2 size={18} className="mr-2" />
                            Delete Loop
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Action Bar */}
            {isDirty && (
                <div
                    className="fixed bottom-4 left-4 right-4 max-w-md mx-auto py-4 px-5 rounded-[28px] bg-white"
                    style={{
                        boxShadow: '0 -5px 25px rgba(0, 0, 0, 0.08), 0 10px 20px rgba(0, 0, 0, 0.05)'
                    }}
                >
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            className="px-5 py-3 rounded-xl bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                            onClick={() => {
                                // Reset to initial settings
                                setSettings(initialSettings);
                                setIsDirty(false);
                            }}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleSaveSettings}
                            className={`px-5 py-3 rounded-xl flex items-center ${getGradient("primary")} text-white`}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <span>Save Changes</span>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoopSettingsScreen;