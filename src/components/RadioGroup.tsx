import type React from 'react'

// 【課題33】RadioOption
type RadioOption = {
  value: string
  label: string
}

// 【課題34】RadioGroupProps
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
  <div className="form-field">
    {/* 【課題35】fieldset */}
    <fieldset
      className="radio-group"
      role="radiogroup" 
      aria-invalid={hasError ? 'true' : 'false'} // エラー判定
      aria-describedby={hasError ? `${name}-error` : undefined} // エラーメッセージ連携
    >
      {/* 【課題36】legend */}
      <legend className="radio-group__legend">
        {label}
        {required && <span className="radio-group__required">*</span>}
      </legend>

      {/* 【課題37】ラジオボタン */}
      <div className="radio-group__options">
      {options.map((option, index) => {
        // 【課題38】ID生成
        const radioId = `${name}-${index}`

        return (
          <div key={option.value} className="radio-option">
            {/* 【課題39】radio input */}
            <input
              type="radio"
              id={radioId}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              onBlur={onBlur}
              className="radio-option__input"
            />
            {/* 【課題40】ラベル */}
            <label htmlFor={radioId} className="radio-option__label">
              <span className="radio-option__radio" />
              <span className="radio-option__text">
                {option.label}
              </span>
            </label>
          </div>
        )
      })}
      </div>
    </fieldset>

    {touched && error && (
      <span id={`${name}-error`} className="form-field__error" role="alert">
        {error}
      </span>
    )}
  </div>
)
}