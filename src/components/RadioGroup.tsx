import type React from 'react'

// 【課題33】RadioOptionインターフェースを定義してください
// 要件:
// - value: string (必須)
// - label: string (必須)
type RadioOption = {
  value: string
  label: string
}

// 【課題34】RadioGroupPropsインターフェースを定義してください
// 要件:
// - label: string (必須)
// - name: string (必須)
// - value: string (必須)
// - options: RadioOption[] (必須)
// - error?: string (オプション)
// - touched?: boolean (オプション)
// - required?: boolean (オプション)
// - onChange: (e: React.ChangeEvent<HTMLInputElement>) => void (必須)
// - onBlur: () => void (必須)
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
      {/* 【課題35】fieldset要素を実装してください
          要件:
          - role="radiogroup"を追加
          - aria-invalid属性でエラー状態を示す
          - aria-describedby属性でエラーメッセージと関連付け
      */}
      <fieldset
        className="radio-group"
        role={"radiogroup"}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${name}-error` : undefined}
      >
        {/* 【課題36】legend要素を実装してください
            要件:
            - グループのラベルを表示
            - 必須フィールドの場合は * を表示
        */}
        <legend className="radio-group__label">
          {label}
          {required && <span className="required-indicator">*</span>}
        </legend>

        {/* 【課題37】ラジオボタンのリストを実装してください
            要件:
            - options配列をmapで展開
            - 各オプションにユニークなIDを付与
        */}
        {options.map((option, index) => {
          // 【課題38】ラジオボタンのIDを生成してください
          // 要件:
          // - ${name}-${index}の形式
          const radioId = `${name}-${index}`;

          return (
            <div key={option.value} className="radio-option">
              {/* 【課題39】radio input要素を実装してください
                  要件:
                  - type="radio"
                  - idをradioIdに設定
                  - checkedはvalue === option.valueで判定
              */}
              <input
                type="radio"
                id={radioId}
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={onChange}
                onBlur={() => onBlur()}
                className="radio-option__input"
              />

              {/* 【課題40】ラジオボタンのラベルを実装してください
                  要件:
                  - htmlFor属性でinput要素と関連付け
              */}
              <label
                htmlFor={radioId}
                className="radio-option__label"
              >
                {option.label}
              </label>
            </div>
          );
        })}
      </fieldset>

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