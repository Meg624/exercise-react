// 【課題24】SelectFieldコンポーネント
import type React from 'react'

type SelectOption = {
  value: string
  label: string
}

type SelectFieldProps = {
  label: string
  name: string
  value: string
  options: SelectOption[]
  error?: string
  touched?: boolean
  required?: boolean
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onBlur: () => void
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  value,
  options,
  error,
  touched,
  required,
  onChange,
  onBlur,
}) => {
  const hasError = touched && error

  return (
    <div className="input-field">
      {/* 【課題26】ラベル */}
      <label htmlFor={name} className="input-field__label">
        {label}
        {required && <span className="input-field__required">*</span>}
      </label>

      {/* 【課題27】select */}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`input-field__select ${hasError ? 'input-field__select--error' : ''}`}
        aria-invalid={hasError ? 'true' : 'false'}
        aria-describedby={hasError ? `${name}-error` : undefined}
      >
        {/* 【課題28】デフォルトオプション */}
        <option value="">選択してください</option>

        {/* 【課題29】オプション */}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* エラー */}
      {hasError && (
        <span id={`${name}-error`} className="input-field__error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
