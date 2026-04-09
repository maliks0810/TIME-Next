import React from 'react';
import { Form, FormRenderProps, FormProps } from 'react-final-form';

type ValidationErrors = Record<string, string | undefined>;

interface FormContainerProps<FormValues = Record<string, unknown>> {
  initialValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => void | Promise<void>;
  validate?: (values: FormValues) => ValidationErrors | Promise<ValidationErrors> | undefined;
  onChange?: (formState: { values: FormValues }) => void;
  formProps?: Partial<FormProps<FormValues>>;
  containerOnly?: boolean;
  children: React.ReactNode;
}

export const FormContainer = <FormValues extends object = object>({
  initialValues = {} as Partial<FormValues>,
  onSubmit,
  validate,
  onChange,
  formProps = {},
  containerOnly = false,
  children,
}: FormContainerProps<FormValues>) => {
  return (
    <Form
      initialValues={initialValues}
      onSubmit={onSubmit}
      validate={validate}
      subscription={formProps.subscription || { values: true }}
      {...formProps}
    >
      {({ handleSubmit, form }: FormRenderProps<FormValues>) => {
        // Subscribe to form changes
        React.useEffect(() => {
          if (!onChange) {
            return undefined;
          }
          const unsubscribe = form.subscribe(
            (formState: { values: FormValues }) => onChange(formState),
            { values: true }
          );
          return unsubscribe;
        }, [form, onChange]);

        // Return children directly without wrapping
        // The containerOnly check doesn't make sense here -
        // children still need to be inside the Form context either way
        return containerOnly ? (
          <div>{children}</div>
        ) : (
          <form onSubmit={handleSubmit}>{children}</form>
        );
      }}
    </Form>
  );
};
