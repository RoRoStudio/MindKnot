// src/components/form/Form.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm, FormProvider, UseFormProps, UseFormReturn, FieldValues } from 'react-hook-form';
import { useStyles } from '../../hooks/useStyles';

interface FormProps<TFieldValues extends FieldValues = FieldValues> {
    defaultValues?: UseFormProps<TFieldValues>['defaultValues'];
    children: React.ReactNode;
    onSubmit: (data: TFieldValues) => void;
    mode?: UseFormProps<TFieldValues>['mode'];
    style?: React.ComponentProps<typeof View>['style'];
}

export default function Form<TFieldValues extends FieldValues = FieldValues>({
    defaultValues,
    children,
    onSubmit,
    mode = 'onChange',
    style,
}: FormProps<TFieldValues>) {
    const styles = useStyles((theme) => ({
        container: {
            width: '100%',
        },
    }));

    const methods = useForm<TFieldValues>({
        defaultValues,
        mode,
    });

    return (
        <FormProvider {...methods}>
            <View style={[styles.container, style]}>
                {typeof children === 'function'
                    ? children(methods as UseFormReturn<TFieldValues>)
                    : children}
                {onSubmit && (
                    <View style={{ display: 'none' }}>
                        {/* Hidden submit handler */}
                        <View onTouchEnd={() => methods.handleSubmit(onSubmit)()} />
                    </View>
                )}
            </View>
        </FormProvider>
    );
}