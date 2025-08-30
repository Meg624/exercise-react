import type React from 'react'

// 【課題30】CheckboxFieldPropsインターフェースを定義してください
// 要件:
// - label: string (必須)
// - name: string (必須)
// - checked: boolean (必須)
// - error?: string (オプション)
// - touched?: boolean (オプション)
// - onChange: (e: React.ChangeEvent<HTMLInputElement>) => void (必須)
// - onBlur: () => void (必須)
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
    <div className="form-field form-field--checkbox">
      <div className="checkbox-wrapper">
        {/* 【課題31】checkbox input要素を実装してください */}
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={checked}
          onChange={onChange}
          onBlur={() => onBlur()}
          className="checkbox-wrapper__input"
          aria-invalid={hasError}
          aria-describedby={hasError ? `${name}-error` : undefined}
        />

        {/* 【課題32】チェックボックスのラベルを実装してください*/}
        <label
          htmlFor={name}
          className="checkbox-wrapper__label"
        >
          {label}
        </label>
      </div>

      {hasError && (
        <span
          id={`${name}-error`}
          className="form-field__error"
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
}