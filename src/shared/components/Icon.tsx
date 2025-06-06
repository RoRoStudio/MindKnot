/**
 * Icon component that renders SVG icons from the Lucide icon set
 * @module components/atoms/Icon
 */
import React from 'react';
import { SvgProps } from 'react-native-svg';

import Plus from '../../assets/icons/lucide/plus.svg';
import ArrowLeft from '../../assets/icons/lucide/arrow-left.svg';
import Check from '../../assets/icons/lucide/check.svg';
import Lightbulb from '../../assets/icons/lucide/lightbulb.svg';
import Map from '../../assets/icons/lucide/map.svg';
import Settings from '../../assets/icons/lucide/settings.svg';
import FileText from '../../assets/icons/lucide/file-text.svg';
import List from '../../assets/icons/lucide/list.svg';
import ListOrdered from '../../assets/icons/lucide/list-ordered.svg';
import GitBranch from '../../assets/icons/lucide/git-branch.svg';
import Link from '../../assets/icons/lucide/link.svg';
import ArrowRight from '../../assets/icons/lucide/arrow-right.svg';
import Minus from '../../assets/icons/lucide/minus.svg';
import Sparkles from '../../assets/icons/lucide/sparkles.svg';
import Moon from '../../assets/icons/lucide/moon.svg';
import Sun from '../../assets/icons/lucide/sun.svg';
import House from '../../assets/icons/lucide/house.svg';
import BookOpen from '../../assets/icons/lucide/book-open.svg';
import Search from '../../assets/icons/lucide/search.svg';
// Icons needed by form components
import Eye from '../../assets/icons/lucide/eye.svg';
import EyeOff from '../../assets/icons/lucide/eye-off.svg';
import ChevronDown from '../../assets/icons/lucide/chevron-down.svg';
import ChevronUp from '../../assets/icons/lucide/chevron-up.svg';
import CircleAlert from '../../assets/icons/lucide/circle-alert.svg';
import Circle from '../../assets/icons/lucide/circle.svg';
import X from '../../assets/icons/lucide/x.svg';
import Calendar from '../../assets/icons/lucide/calendar.svg';
import Clock from '../../assets/icons/lucide/clock.svg';
import ChevronLeft from '../../assets/icons/lucide/chevron-left.svg';
import ChevronRight from '../../assets/icons/lucide/chevron-right.svg';

// Icons for updated navigation
import Vault from '../../assets/icons/lucide/vault.svg';
import CircleHelp from '../../assets/icons/lucide/circle-help.svg';
import Zap from '../../assets/icons/lucide/zap.svg';
import ScrollText from '../../assets/icons/lucide/scroll-text.svg';
import CalendarSync from '../../assets/icons/lucide/calendar-sync.svg';
import Compass from '../../assets/icons/lucide/compass.svg';

// Icons for richtext form component
import Bold from '../../assets/icons/lucide/bold.svg';
import Italic from '../../assets/icons/lucide/italic.svg';
import Underline from '../../assets/icons/lucide/underline.svg';
import Heading from '../../assets/icons/lucide/heading.svg';
import Keyboard from '../../assets/icons/lucide/keyboard.svg';
import Strikethrough from '../../assets/icons/lucide/strikethrough.svg';
import SquareCheck from '../../assets/icons/lucide/square-check.svg';
import Undo from '../../assets/icons/lucide/undo.svg';
import Redo from '../../assets/icons/lucide/redo.svg';
import Type from '../../assets/icons/lucide/type.svg';

// New icons for card actions
import Star from '../../assets/icons/lucide/star.svg';
import StarOff from '../../assets/icons/lucide/star-off.svg';
import Copy from '../../assets/icons/lucide/copy.svg';
import Archive from '../../assets/icons/lucide/archive.svg';
import Square from '../../assets/icons/lucide/square.svg';
import SlidersVertical from '../../assets/icons/lucide/sliders-vertical.svg';
import Rows from '../../assets/icons/lucide/rows-2.svg';
import LayoutGrid from '../../assets/icons/lucide/layout-grid.svg';
import EllipsisVertical from '../../assets/icons/lucide/ellipsis-vertical.svg';

// Additional icons needed for detail screens
import Trash from '../../assets/icons/lucide/trash.svg';
import Trash2 from '../../assets/icons/lucide/trash-2.svg';
import Pencil from '../../assets/icons/lucide/pencil.svg';
import Flag from '../../assets/icons/lucide/flag.svg';
import CirclePlus from '../../assets/icons/lucide/circle-plus.svg';
import Tag from '../../assets/icons/lucide/tag.svg';
import Hash from '../../assets/icons/lucide/hash.svg';
import Infinity from '../../assets/icons/lucide/infinity.svg';

// Loop-specific icons
import CircleCheck from '../../assets/icons/lucide/circle-check.svg';
import LogOut from '../../assets/icons/lucide/log-out.svg';
import CirclePlay from '../../assets/icons/lucide/circle-play.svg';
import CirclePause from '../../assets/icons/lucide/circle-pause.svg';
import SkipForward from '../../assets/icons/lucide/skip-forward.svg';
import Percent from '../../assets/icons/lucide/percent.svg';
// Using existing icons as alternatives for missing ones

/**
 * Map of icon names to their SVG components
 * @private
 */
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
    'list-ordered': ListOrdered,
    'git-branch': GitBranch,
    link: Link,
    minus: Minus,
    sparkles: Sparkles,
    moon: Moon,
    sun: Sun,
    house: House,
    'book-open': BookOpen,
    search: Search,
    // Add new icons
    eye: Eye,
    'eye-off': EyeOff,
    'chevron-down': ChevronDown,
    'chevron-up': ChevronUp,
    'chevron-left': ChevronLeft,
    'chevron-right': ChevronRight,
    'circle-alert': CircleAlert,
    circle: Circle,
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
    bold: Bold,
    italic: Italic,
    underline: Underline,
    heading: Heading,
    type: Type,
    keyboard: Keyboard,
    strikethrough: Strikethrough,
    'square-check': SquareCheck,
    undo: Undo,
    redo: Redo,
    // New card action icons
    star: Star,
    'star-off': StarOff,
    copy: Copy,
    archive: Archive,
    square: Square,
    'sliders-vertical': SlidersVertical,
    'rows-2': Rows,
    'layout-grid': LayoutGrid,
    'ellipsis-vertical': EllipsisVertical,
    // Additional icons needed for detail screens
    trash: Trash,
    'trash-2': Trash2,
    'pencil': Pencil,
    flag: Flag,
    'circle-plus': CirclePlus,
    tag: Tag,
    hash: Hash,
    infinity: Infinity,
    // Additional needed icons
    // Loop-specific icons
    'circle-check': CircleCheck,
    'log-out': LogOut,
    'circle-play': CirclePlay,
    'circle-pause': CirclePause,
    'skip-forward': SkipForward,
    'refresh': Undo,
    activity: Zap, // Using zap as activity icon
    repeat: Undo, // Using undo as repeat icon
    'play-circle': CirclePlay,
    play: CirclePlay, // Using circle-play as play icon
    pause: CirclePause, // Using circle-pause as pause icon
    edit: Pencil, // Using pencil as edit icon
    loader: Clock, // Using clock as loader icon
    'bar-chart': LayoutGrid, // Using layout-grid as bar-chart icon
    'trending-up': ArrowRight, // Using arrow-right as trending-up icon
    'trending-down': ArrowLeft, // Using arrow-left as trending-down icon
    folder: Archive, // Using archive as folder icon
    'refresh-cw': Undo, // Using undo as refresh-cw icon
    menu: EllipsisVertical, // Using ellipsis-vertical as menu icon
    'skip-back': ArrowLeft, // Using arrow-left as skip-back icon
    'check-circle': CircleCheck, // Using circle-check as check-circle icon
    percent: Percent, // Using percent as percent icon
};

/**
 * Type representing all available icon names
 */
export type IconName = keyof typeof iconMap;

/**
 * Icon component props
 * 
 * @interface IconProps
 * @extends {SvgProps}
 */
export interface IconProps extends SvgProps {
    /**
     * Name of the icon to display
     */
    name: IconName;

    /**
     * Size of the icon (applies to both width and height)
     * If provided, takes precedence over width/height
     */
    size?: number;

    /**
     * Color of the icon
     * Defaults to the current text color
     */
    color?: string;
}

/**
 * Icon component that renders SVG icons
 * 
 * @component
 * @example
 * ```jsx
 * // Basic usage
 * <Icon name="plus" size={24} color="#000000" />
 * 
 * // With specific width/height (overrides size)
 * <Icon name="arrow-left" width={32} height={20} color="red" />
 * ```
 */
export const Icon: React.FC<IconProps> = ({
    name,
    size,
    width,
    height,
    ...props
}) => {
    const Component = iconMap[name];

    if (!Component) {
        console.warn(`Icon '${name}' not found, using default.`);
        return <FileText {...props} />;
    }

    // If size is provided, use it for both width and height
    const sizeProps = size ? { width: size, height: size } : {};

    return <Component width={width ?? size} height={height ?? size} {...props} />;
};

export default Icon; 