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