// 【課題30】InputFieldコンポーネント
import type React from 'react'

type InputFieldProps = {
  label: string
  name: string
  value: string
  type?: string
  placeholder?: string
  error?: string
  touched?: boolean
  required?: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: () => void
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  value,
  type = 'text',
  placeholder,
  error,
  touched,
  required,
  onChange,
  onBlur,
}) => {
  const hasError = touched && error

  return (
    <div className="input-field">
      {/* 【課題31】ラベル */}
      <label htmlFor={name} className="input-field__label">
        {label}
        {required && <span className="input-field__required">*</span>}
      </label>

      {/* 【課題32】input要素 */}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        className={`input-field__input ${hasError ? 'input-field__input--error' : ''}`}
        aria-invalid={hasError ? 'true' : 'false'}
        aria-describedby={hasError ? `${name}-error` : undefined}
      />

      {/* 【課題33】エラーメッセージ */}
      {hasError && (
        <span id={`${name}-error`} className="input-field__error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
