// src/components/common/Icon.tsx
import { SvgProps } from 'react-native-svg';

import Plus from '../../assets/icons/lucide/plus.svg';
import ArrowLeft from '../../assets/icons/lucide/arrow-left.svg';
import Check from '../../assets/icons/lucide/check.svg';
import Lightbulb from '../../assets/icons/lucide/lightbulb.svg';
import Map from '../../assets/icons/lucide/map.svg';
import Settings from '../../assets/icons/lucide/settings.svg';
import FileText from '../../assets/icons/lucide/file-text.svg';
import List from '../../assets/icons/lucide/list.svg';
import GitBranch from '../../assets/icons/lucide/git-branch.svg';
import Link from '../../assets/icons/lucide/link.svg';
import ArrowRight from '../../assets/icons/lucide/arrow-right.svg';
import Minus from '../../assets/icons/lucide/minus.svg';
import Sparkles from '../../assets/icons/lucide/sparkles.svg';
import Moon from '../../assets/icons/lucide/moon.svg';
import Sun from '../../assets/icons/lucide/sun.svg';
import House from '../../assets/icons/lucide/house.svg';
import BookOpen from '../../assets/icons/lucide/book-open.svg';
// Add new icons needed by form components
import Eye from '../../assets/icons/lucide/eye.svg';
import EyeOff from '../../assets/icons/lucide/eye-off.svg';
import ChevronDown from '../../assets/icons/lucide/chevron-down.svg';
import ChevronUp from '../../assets/icons/lucide/chevron-up.svg';
import CircleAlert from '../../assets/icons/lucide/circle-alert.svg';
import X from '../../assets/icons/lucide/x.svg';
import Calendar from '../../assets/icons/lucide/calendar.svg';
import Clock from '../../assets/icons/lucide/clock.svg';

// Add new icons for updated navigation
import Vault from '../../assets/icons/lucide/vault.svg';
import CircleHelp from '../../assets/icons/lucide/circle-help.svg';
import Zap from '../../assets/icons/lucide/zap.svg';
import ScrollText from '../../assets/icons/lucide/scroll-text.svg';
import CalendarSync from '../../assets/icons/lucide/calendar-sync.svg';
import Compass from '../../assets/icons/lucide/compass.svg';

const iconMap = {
    plus: Plus,
    'arrow-left': ArrowLeft,
    'arrow-right': ArrowRight,
    check: Check,
    lightbulb: Lightbulb,
    map: Map,
    settings: Settings,
    'file-text': FileText,
    list: List,
    'git-branch': GitBranch,
    link: Link,
    minus: Minus,
    sparkles: Sparkles,
    moon: Moon,
    sun: Sun,
    house: House,
    'book-open': BookOpen,
    // Add new icons
    eye: Eye,
    'eye-off': EyeOff,
    'chevron-down': ChevronDown,
    'chevron-up': ChevronUp,
    'circle-alert': CircleAlert,
    x: X,
    calendar: Calendar,
    clock: Clock,
    // New navigation icons
    vault: Vault,
    'circle-help': CircleHelp,
    'zap': Zap,
    'scroll-text': ScrollText,
    'calendar-sync': CalendarSync,
    compass: Compass,
};

export type IconName = keyof typeof iconMap;

type Props = SvgProps & {
    name: IconName;
};

export function Icon({ name, ...props }: Props) {
    const Component = iconMap[name];

    if (!Component) {
        console.warn(`Icon '${name}' not found, using default.`);
        return <FileText {...props} />;
    }

    return <Component {...props} />;
}