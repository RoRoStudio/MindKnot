/**
 * Re-export components from atomic design folders for backward compatibility
 * This makes migrating easier by allowing existing imports from common/ to continue working
 */

// Atoms
export { Typography } from '../atoms/Typography';
export { Icon, type IconName } from '../atoms/Icon';
export { Button } from '../atoms/Button';
export { Label } from '../atoms/Label';

// Molecules
export { Card } from '../molecules/Card';
export { CategoryPill } from '../molecules/CategoryPill';
export { BottomSheet } from '../molecules/BottomSheet';
export { ColorPicker } from '../molecules/ColorPicker';
export { IconPicker } from '../molecules/IconPicker';

// Organisms
export { FilterableList } from '../organisms/FilterableList';
export { FilterableListHeader, type Category } from '../organisms/FilterableListHeader';
export { DetailScreenHeader } from '../organisms/DetailScreenHeader';

// Form components
export { FormModal } from '../form/FormModal';
export { FormSheet } from '../form/FormSheet';

// Export other components as needed 