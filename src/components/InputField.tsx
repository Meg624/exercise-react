import type React from 'react'

// 【課題18】InputFieldコンポーネント
type InputFieldProps = {
  label: string
  name: string
  value: string
  type?: string
  placeholder?: string
  error?: string
  touched?: boolean
  required?: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onBlur: () => void
  className?: string     // 追加 任意クラス
  isTextArea?: boolean   // 追加 テキストエリア判定
  rows?: number          // 追加 テキストエリア行数
}

// 【課題19】InputFieldコンポーネント
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
  className,
  isTextArea = false,
  rows = 3,
}) => {
  // 【課題20】error表示
  const hasError = touched && !!error

  return (
    <div className="input-field">
      {/* 【課題21】ラベル */}
      <label htmlFor={name} className="input-field__label">
        {label}
        {required && <span className="input-field__required">*</span>}
      </label>

{/* 【課題22】input・textarea要素 */}
      {isTextArea ? (
   <textarea
    name={name}
    value={value}
    placeholder={placeholder}
    onChange={onChange}
    onBlur={onBlur}
    className={`input-field__textarea ${hasError ? 'input-field__textarea--error' : ''} ${className ?? ''}`}
    aria-invalid={hasError ? 'true' : 'false'}
    aria-describedby={hasError ? `${name}-error` : undefined}
    rows={rows}
  />
) : (
  <input
    name={name}
    type={type}
    value={value}
    placeholder={placeholder}
    onChange={onChange}
    onBlur={onBlur}
    className={`input-field__input ${hasError ? 'input-field__input--error' : ''} ${className ?? ''}`}
    aria-invalid={hasError ? 'true' : 'false'}
    aria-describedby={hasError ? `${name}-error` : undefined}
  />
)}
      {/* 【課題23】エラーメッセージ */}
      {hasError && (
        <span id={`${name}-error`} className="input-field__error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
