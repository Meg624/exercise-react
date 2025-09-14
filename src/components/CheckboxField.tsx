import type React from 'react'

// 【課題30】CheckboxFieldProps
type CheckboxFieldProps = {
  label: string
  name: string
  checked: boolean
  error?: string
  touched?: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: () => void
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label,
  name,
  checked,
  error,
  touched,
  onChange,
  onBlur,
}) => {
  const hasError = touched && error

  return (
    <div className="checkbox-field">
      <div className="checkbox-field__wrapper">
        {/* 【課題31】checkbox */}
        <input
          id={name}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          onBlur={onBlur}
          className={`checkbox-field__input ${hasError ? 'checkbox-field__input--error' : ''}`}
        />
        {/* 【課題32】ラベル */}
        <label htmlFor={name} className="checkbox-field__label">
          <span className="checkbox-field__checkmark" />
          <span className="checkbox-field__text">{label}</span>
        </label>
      </div>
      {hasError && (
        <span className="checkbox-field__error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
