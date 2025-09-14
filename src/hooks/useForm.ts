import { type ChangeEvent, useState, useCallback, useEffect, useRef } from 'react'

// バリデーションルールの型定義
export type ValidationRule = {
  required?: boolean        // 必須チェック
  minLength?: number        // 最小文字数
  maxLength?: number        // 最大文字数
  pattern?: RegExp          // 正規表現チェック
  custom?: (value: string) => string | undefined // カスタムチェック
}

// フォーム全体のバリデーションルール
type ValidationRules<T> = Partial<Record<keyof T, ValidationRule>>

// useFormのオプション型
interface UseFormParams<T> {
  initialValues: T                         // 初期値
  validationRules?: ValidationRules<T>     // バリデーションルール
  onSubmit: (values: T) => Promise<void> | void // 送信時コールバック
}

// 【課題1】useFormフック本体
export function useForm<T extends Record<string, any>>(params: UseFormParams<T>) {
  const { initialValues, validationRules, onSubmit } = params

  // 【課題2】フォーム状態管理
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 【追加課題】localStorage用の初回レンダー判定
  const isFirstRender = useRef(true)

  // 【課題3】単一フィールドバリデーション
  const validateField = useCallback(
    (name: keyof T, value: any): string | undefined => {
      const rule = validationRules?.[name]
      if (!rule) return

      // 【課題4】必須チェック
      if (rule.required && (value === '' || value === null || value === undefined))
        return '必須項目です'

      // 【課題5】最小文字数チェック
      if (rule.minLength && typeof value === 'string' && value.length < rule.minLength)
        return `${rule.minLength}文字以上入力してください`

      // 【課題6】最大文字数チェック
      if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength)
        return `${rule.maxLength}文字以内で入力してください`

      // 【課題7】パターンチェック
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value))
        return '形式が正しくありません'

      // 【課題8】カスタムバリデーション
      if (rule.custom) return rule.custom(value)

      return undefined
    },
    [validationRules],
  )

  // 【課題9】全フィールドのバリデーション
  const validateForm = useCallback(() => {
    const newErrors: Partial<Record<keyof T, string>> = {}
    if (!validationRules) return newErrors

    for (const key in validationRules) {
      const error = validateField(key, values[key])
      if (error) newErrors[key] = error
    }
    return newErrors
  }, [validateField, validationRules, values])

  // 【課題10】onChangeハンドラー
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, type, value } = e.target
      const fieldName = name as keyof T

      // 【課題11】チェックボックスの値処理
      const fieldValue = type === 'checkbox' && 'checked' in e.target ? (e.target as HTMLInputElement).checked : value

      setValues((prev) => ({ ...prev, [fieldName]: fieldValue }))

      // 【課題12】touchedフィールドのバリデーション
      if (touched[fieldName]) {
        const error = validateField(fieldName, fieldValue)
        setErrors((prev) => ({ ...prev, [fieldName]: error }))
      }
    },
    [touched, validateField],
  )

  // 【課題13】onBlurハンドラー
  const handleBlur = useCallback(
    (name: keyof T) => (_e?: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setTouched((prev) => ({ ...prev, [name]: true }))
      const error = validateField(name, values[name])
      setErrors((prev) => ({ ...prev, [name]: error }))
    },
    [validateField, values],
  )

  // 【追加課題】localStorageに保存
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    localStorage.setItem('formData', JSON.stringify(values))
  }, [values])

  // 【課題14】フォーム送信ハンドラー
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)

      try {
        // 全フィールドをtouchedに設定して全エラー表示
        setTouched(
          Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<keyof T, boolean>),
        )

        const newErrors = validateForm()
        setErrors(newErrors)

        if (Object.keys(newErrors).length === 0) {
          await onSubmit(values)
          // 送信成功後はリセット
          setValues(initialValues)
          setTouched({})
          setErrors({})
        }
      } finally {
        setIsSubmitting(false)
      }
    },
    [validateForm, onSubmit, values, initialValues],
  )

  // 【課題15】フォームリセット
  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  // 【課題16】特定フィールドの値設定
  const setValue = useCallback(
    (name: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [name]: value }))
      if (touched[name]) {
        const error = validateField(name, value)
        setErrors((prev) => ({ ...prev, [name]: error }))
      }
    },
    [touched, validateField],
  )

  // 【課題17】特定フィールドのエラー設定
  const setError = useCallback((name: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [name]: error }))
  }, [])

  // フォーム全体の有効性チェック
  const isValid = Object.keys(errors).length === 0 && Object.keys(touched).length > 0

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValue, // 【追加課題】
    setError, // 【追加課題】
    setValues, // localStorage復元用に残す
  }
}
