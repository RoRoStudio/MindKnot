// src/components/form/Form.tsx
import React from 'react';
import { View } from 'react-native';
import { useForm, FormProvider, UseFormProps, UseFormReturn, FieldValues } from 'react-hook-form';
import { useStyles } from '../hooks/useStyles';

interface FormProps<TFieldValues extends FieldValues = FieldValues> {
    defaultValues?: UseFormProps<TFieldValues>['defaultValues'];
    children: React.ReactNode | ((methods: UseFormReturn<TFieldValues>) => React.ReactNode);
    onSubmit?: (data: TFieldValues) => void;
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
            flex: 1,
        },
    }));

    const methods = useForm<TFieldValues>({
        defaultValues,
        mode,
    });

    return (
        <FormProvider {...methods}>
            <View
                style={[styles.container, style]}
                collapsable={false} // Help with measuring issues
            >
                {typeof children === 'function'
                    ? children(methods)
                    : children}

                {onSubmit && (
                    <View style={{ display: 'none' }}>
                        {/* Hidden submit handler */}
                        <View onTouchEnd={() => methods.handleSubmit(onSubmit as any)()} />
                    </View>
                )}
            </View>
        </FormProvider>
    );
}