import { useState, useCallback, useEffect, useRef } from 'react';

// 【課題1】バリデーションルールの型定義
export type ValidationRule = {
  required?: boolean; 
  minLength?: number; 
  maxLength?: number; 
  pattern?: RegExp; 
  custom?: (value: string) => string | undefined; // カスタム関数
};

// 【課題2】フォームの各フィールドに対応するバリデーションルール
export type ValidationRules<T> = Partial<Record<keyof T, ValidationRule>>;

// 【課題3】useFormフック本体
export function useForm<T extends Record<string, any>>(params: {
  initialValues: T; // 初期値
  validationRules?: ValidationRules<T>; 
  onSubmit: (values: T) => Promise<void> | void; 
}) {
  const { initialValues, validationRules, onSubmit } = params;

  // 【課題4】フォームの状態を管理
  const [values, setValues] = useState<T>(initialValues); 
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({}); 
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({}); 
  const [isSubmitting, setIsSubmitting] = useState(false); 

  // 初回レンダー判定用
  const isFirstRender = useRef(true);

  // 【課題5】単一フィールドをバリデーション
  const validateField = useCallback(
    (name: keyof T, value: any): string | undefined => {
      const rule = validationRules?.[name];
      if (!rule) return;

      if (rule.required && !value) return '必須項目です';
      if (rule.minLength && typeof value === 'string' && value.length < rule.minLength)
        return `${rule.minLength}文字以上入力してください`;
      if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength)
        return `${rule.maxLength}文字以内で入力してください`;
      if (rule.pattern && !rule.pattern.test(value)) return '形式が正しくありません';
      if (rule.custom) return rule.custom(value);
    },
    [validationRules],
  );

  // 【課題6】フォーム全体をバリデーション
  const validateForm = useCallback(() => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    for (const key in validationRules) {
      const error = validateField(key, values[key]);
      if (error) newErrors[key] = error;
    }
    return newErrors;
  }, [validateField, validationRules, values]);

  // 【追加】値を直接設定する関数（テスト用）
  const setValue = useCallback((name: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    
    // すでに触れたフィールドはリアルタイムでエラー更新
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  // 【追加】エラーを直接設定する関数（テスト用）
  const setError = useCallback((name: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  // 【課題7】入力変更時の処理
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, type, value, checked } = e.target;
      const val = type === 'checkbox' ? checked : value;
      setValues((prev) => ({ ...prev, [name]: val }));

      // すでに触れたフィールドはリアルタイムでエラー更新
      if (touched[name as keyof T]) {
        const error = validateField(name as keyof T, val);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [touched, validateField],
  );

  // 【課題8】フォーカスを離れたときの処理（修正版）
  const handleBlur = useCallback(
    (name: keyof T) => (e?: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setTouched((prev) => ({ ...prev, [name]: true })); 
      const error = validateField(name, values[name]);
      setErrors((prev) => ({ ...prev, [name]: error })); // エラー更新
    },
    [validateField, values],
  );

  // 【追加】localStorage保存（初回レンダーはスキップ）
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    localStorage.setItem("formData", JSON.stringify(values));
  }, [values]);

  // 【課題9】送信処理（修正版）
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        // 全フィールドを touched に設定して、全エラーを表示
        setTouched(
          Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<keyof T, boolean>),
        );

        const newErrors = validateForm();
        setErrors(newErrors);

        // エラーなしなら送信
        if (Object.keys(newErrors).length === 0) {
          await onSubmit(values);
          setValues(initialValues); 
          setTouched({});
          setErrors({}); // エラーもリセット
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateForm, onSubmit, values, initialValues],
  );

  // 【課題10】フォームをリセット
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  // 【課題11】フォーム全体が有効か
  const isValid = Object.keys(errors).length === 0 && Object.keys(touched).length > 0;

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
    setValue, 
    setError, 
    setValues,
  };
}
