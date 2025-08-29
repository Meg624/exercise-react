/**
 * React Form Components - Input Field Component
 * 再利用可能な入力フィールドコンポーネント
 */

import type React from 'react'
import type { ChangeEvent } from 'react'

export interface InputFieldProps {
  label: string
  name: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  value: string
  error?: string
  touched?: boolean
  placeholder?: string
  required?: boolean
  disabled?: boolean
  autoComplete?: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onBlur: () => void
  className?: string
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  error,
  touched,
  placeholder,
  required = false,
  disabled = false,
  autoComplete,
  onChange,
  onBlur,
  className = '',
}) => {
  const hasError = touched && error
  const fieldId = `field-${name}`
  const errorId = `${fieldId}-error`

  return (
    <div className={`input-field ${className}`}>
      <label htmlFor={fieldId} className='input-field__label'>
        {label}
        {required && (
          <span className='input-field__required' aria-label='必須'>
            *
          </span>
        )}
      </label>

      <input
        id={fieldId}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        onChange={onChange}
        onBlur={onBlur}
        className={`input-field__input ${hasError ? 'input-field__input--error' : ''}`}
        aria-invalid={hasError ? 'true' : 'false'}
        aria-describedby={hasError ? errorId : undefined}
      />

      {hasError && (
        <div id={errorId} className='input-field__error' role='alert'>
          {error}
        </div>
      )}
    </div>
  )
}

export default InputField
