// 【課題36】RadioGroupコンポーネント
import type React from 'react'

type RadioOption = {
  value: string
  label: string
}

type RadioGroupProps = {
  label: string
  name: string
  value: string
  options: RadioOption[]
  error?: string
  touched?: boolean
  required?: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: () => void
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
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
    <fieldset className="radio-group">
      {/* 【課題37】legend */}
      <legend className="radio-group__legend">
        {label}
        {required && <span className="radio-group__required">*</span>}
      </legend>

      {/* 【課題38】ラジオオプション */}
      <div className="radio-group__options">
        {options.map((option) => (
          <div key={option.value} className="radio-option">
            <input
              id={`${name}-${option.value}`}
              name={name}
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              onBlur={onBlur}
              className={`radio-option__input ${hasError ? 'radio-option__input--error' : ''}`}
            />
            <label htmlFor={`${name}-${option.value}`} className="radio-option__label">
              <span className="radio-option__radio" />
              <span className="radio-option__text">{option.label}</span>
            </label>
          </div>
        ))}
      </div>

      {/* 【課題39】エラー */}
      {hasError && (
        <span className="radio-group__error" role="alert">
          {error}
        </span>
      )}
    </fieldset>
  )
}
