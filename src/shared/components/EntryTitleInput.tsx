import React from 'react';
import { TextInput, StyleSheet, TextInputProps, Keyboard } from 'react-native';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { useTheme } from '../../app/contexts/ThemeContext';

interface EntryTitleInputProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> extends Omit<TextInputProps, 'value' | 'onChangeText'> {
    /**
     * React Hook Form control object
     */
    control: Control<TFieldValues>;

    /**
     * Name of the field in the form
     */
    name: TName;

    /**
     * Placeholder text when input is empty
     */
    placeholder?: string;

    /**
     * Whether the input is editable
     * @default true
     */
    editable?: boolean;

    /**
     * Function called when text changes (for auto-save functionality)
     */
    onChangeText?: (text: string) => void;
}

export default function EntryTitleInput<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
    control,
    name,
    placeholder = 'Enter title...',
    editable = true,
    onChangeText,
    ...props
}: EntryTitleInputProps<TFieldValues, TName>) {
    const { theme } = useTheme();

    const styles = StyleSheet.create({
        titleInput: {
            fontSize: 32,
            fontWeight: '300',
            color: theme.colors.textPrimary,
            padding: 16,
            paddingTop: 16,
            paddingBottom: 16,
            fontFamily: 'KantumruyPro-Bold',
        },
    });

    return (
        <Controller
            control={control}
            name={name}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
                <TextInput
                    style={[styles.titleInput, editable ? {} : { opacity: 0.7 }]}
                    placeholder={placeholder}
                    placeholderTextColor={theme.colors.textSecondary}
                    value={value}
                    onChangeText={(text) => {
                        onChange(text);
                        if (onChangeText) {
                            onChangeText(text);
                        }
                    }}
                    editable={editable}
                    multiline={true}
                    onSubmitEditing={() => Keyboard.dismiss()}
                    blurOnSubmit={true}
                    {...props}
                />
            )}
        />
    );
} 