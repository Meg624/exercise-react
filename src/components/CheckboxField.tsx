/**
 * React Form Components - Checkbox Field Component
 * チェックボックスコンポーネント
 */

import type React from 'react'
import type { ChangeEvent } from 'react'

export interface CheckboxFieldProps {
  label: string
  name: string
  checked: boolean
  error?: string
  touched?: boolean
  required?: boolean
  disabled?: boolean
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onBlur: () => void
  className?: string
  description?: string
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label,
  name,
  checked,
  error,
  touched,
  required = false,
  disabled = false,
  onChange,
  onBlur,
  className = '',
  description,
}) => {
  const hasError = touched && error
  const fieldId = `field-${name}`
  const errorId = `${fieldId}-error`
  const descriptionId = `${fieldId}-description`

  return (
    <div className={`checkbox-field ${className}`}>
      <div className='checkbox-field__wrapper'>
        <input
          id={fieldId}
          name={name}
          type='checkbox'
          checked={checked}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          disabled={disabled}
          className={`checkbox-field__input ${hasError ? 'checkbox-field__input--error' : ''}`}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={
            [hasError ? errorId : null, description ? descriptionId : null].filter(Boolean).join(' ') || undefined
          }
        />

        <label htmlFor={fieldId} className='checkbox-field__label'>
          <span className='checkbox-field__checkmark' aria-hidden='true' />
          <span className='checkbox-field__text'>
            {label}
            {required && (
              <span className='checkbox-field__required' aria-hidden='true'>
                *
              </span>
            )}
          </span>
        </label>
      </div>

      {description && (
        <div id={descriptionId} className='checkbox-field__description'>
          {description}
        </div>
      )}

      {hasError && (
        <div id={errorId} className='checkbox-field__error' role='alert'>
          {error}
        </div>
      )}
    </div>
  )
}

export default CheckboxField
