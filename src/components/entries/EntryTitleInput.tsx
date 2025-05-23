import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';

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
    placeholder: string;

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

export function EntryTitleInput<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
    control,
    name,
    placeholder,
    editable = true,
    onChangeText,
    ...props
}: EntryTitleInputProps<TFieldValues, TName>) {
    return (
        <Controller
            control={control}
            name={name}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
                <TextInput
                    style={styles.titleInput}
                    placeholder={placeholder}
                    placeholderTextColor="#9E9E9E"
                    value={value}
                    onChangeText={(text) => {
                        onChange(text);
                        onChangeText?.(text);
                    }}
                    editable={editable}
                    {...props}
                />
            )}
        />
    );
}

const styles = StyleSheet.create({
    titleInput: {
        fontSize: 32,
        fontWeight: '300',
        color: '#000000',
        padding: 16,
        paddingTop: 16,
        paddingBottom: 16,
        fontFamily: 'KantumruyPro-Bold',
    },
});

export { EntryTitleInput }; 