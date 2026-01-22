import React from 'react';
import { Field, FieldRenderProps } from 'react-final-form';
import { TextField } from '@mui/material';

interface TextFormFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  validate?: (value: unknown) => string | undefined;
  parse?: (value: string) => unknown;
  format?: (value: unknown) => string;
}

/**
 * TextFormField - MUI TextField integrated with React Final Form
 * Compatible with React 17, 18, and 19
 */
export const TextFormField: React.FC<TextFormFieldProps> = ({
  name,
  label,
  placeholder,
  type = 'text',
  disabled = false,
  required = false,
  multiline = false,
  rows,
  validate,
  parse,
  format,
  ...rest
}) => {
  return (
    <Field
      name={name}
      validate={validate}
      parse={parse}
      format={format}
    >
      {({ input, meta }: FieldRenderProps<string>) => (
        <TextField
          {...input}
          {...rest}
          label={label}
          placeholder={placeholder}
          type={type}
          disabled={disabled}
          required={required}
          multiline={multiline}
          rows={rows}
          error={meta.touched && meta.error ? true : false}
          helperText={meta.touched && meta.error ? meta.error : ''}
          fullWidth
          variant="outlined"
        />
      )}
    </Field>
  );
};
