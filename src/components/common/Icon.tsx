import { SvgProps } from 'react-native-svg';

import Plus from '../../assets/icons/lucide/plus.svg';
import ArrowLeft from '../../assets/icons/lucide/arrow-left.svg';
import Check from '../../assets/icons/lucide/check.svg';
import Lightbulb from '../../assets/icons/lucide/lightbulb.svg';

const iconMap = {
    plus: Plus,
    'arrow-left': ArrowLeft,
    check: Check,
    lightbulb: Lightbulb,
};

export type IconName = keyof typeof iconMap;

type Props = SvgProps & {
    name: IconName;
};

export function Icon({ name, ...props }: Props) {
    const Component = iconMap[name];
    return <Component {...props} />;
}
