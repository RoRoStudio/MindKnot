/**
 * Re-export components from shared folder for backward compatibility
 * This makes migrating easier by allowing existing imports from common/ to continue working
 */

// Shared components
export { Button } from '../shared/Button';
export { Typography } from '../shared/Typography';
export { Icon, type IconName } from '../shared/Icon';
export { Label } from '../shared/Label';
export { Card } from '../shared/Card';
export { CategoryPill } from '../shared/CategoryPill';
export { default as ColorPicker } from '../shared/ColorPicker';
export { BottomSheet } from '../shared/BottomSheet';
export { IconPicker } from '../shared/IconPicker';
export { FilterableList } from '../shared/FilterableList';
export { FilterableListHeader, type Category } from '../shared/FilterableListHeader';
export { ConfirmationModal } from '../shared/ConfirmationModal';

// Form components
export { FormModal } from '../form/FormModal';
export { FormSheet } from '../form/FormSheet'; 