// ContactForm.tsx
import type React from 'react'
import { useForm } from '../hooks/useForm'
import { CheckboxField } from './CheckboxField'
import { InputField } from './InputField'
import { RadioGroup } from './RadioGroup'
import { SelectField } from './SelectField'

// 【課題41】FormDataインターフェースを定義
type FormData = {
  name: string
  email: string
  subject: string
  category: string
  message: string
  subscribe: boolean
}

function ContactForm() {
  // 【課題42】フォーム初期値を設定
  const initialValues: FormData = {
    name: '',
    email: '',
    subject: 'inquiry', // ラジオ初期選択
    category: '',
    message: '',
    subscribe: false,
  }

  // 【課題43】バリデーションルールを定義
  const validationRules = {
    name: { required: true, minLength: 2, maxLength: 50 },
    email: { required: true, pattern: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/ },
    subject: { required: true },
    message: { required: true, minLength: 10, maxLength: 500 },
  }

  // 【課題44】フォーム送信処理を実装
  const handleFormSubmit = async (formData: FormData) => {
    console.log('Form submitted', formData)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    alert('フォームが送信されました! ありがとうございます!')
    resetForm()
  }

  // 【課題45】useFormフック使用
  const { values, errors, touched, isSubmitting, isValid, handleChange, handleBlur, handleSubmit, resetForm } =
    useForm<FormData>({
      initialValues,
      validationRules,
      onSubmit: handleFormSubmit,
    })

  // 【課題46】カテゴリーオプション
  const categoryOptions = [
    { value: 'general', label: '一般的な質問' },
    { value: 'technical', label: '技術的な質問' },
    { value: 'billing', label: '請求に関する質問' },
    { value: 'other', label: 'その他' },
  ]

  // 【課題47】件名オプション
  const subjectOptions = [
    { value: 'inquiry', label: 'お問い合わせ' },
    { value: 'feedback', label: 'フィードバック' },
    { value: 'support', label: 'サポート' },
  ]

  return (
    // 【課題48】form要素実装
    <form onSubmit={handleSubmit} className="contact-form" noValidate>
      <h2 className="contact-form__title">お問い合わせフォーム</h2>

      {/* 【課題49】名前入力フィールド */}
      <InputField
        label="お名前"
        name="name"
        value={values.name}
        error={errors.name}
        touched={touched.name}
        required
        placeholder="須田出井 太郎"
        onChange={handleChange}
        onBlur={handleBlur}
      />

      {/* 【課題50】メールアドレス入力フィールド */}
      <InputField
        label="メールアドレス"
        name="email"
        type="email"
        value={values.email}
        error={errors.email}
        touched={touched.email}
        required
        placeholder="example@email.com"
        onChange={handleChange}
        onBlur={handleBlur}
      />

      {/* 【課題51】件名ラジオグループ */}
      <RadioGroup
        label="件名"
        name="subject"
        value={values.subject}
        options={subjectOptions}
        error={errors.subject}
        touched={touched.subject}
        required
        onChange={handleChange}
        onBlur={handleBlur}
      />

      {/* 【課題52】カテゴリー選択フィールド */}
      <SelectField
        label="カテゴリー"
        name="category"
        value={values.category}
        options={categoryOptions}
        error={errors.category}
        touched={touched.category}
        onChange={handleChange}
        onBlur={handleBlur}
      />

      {/* 【課題53】メッセージ入力 */}
      <div className="input-field">
        <label htmlFor="message" className="input-field__label">
          メッセージ
          <span className="input-field__required">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          value={values.message}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`input-field__textarea ${touched.message && errors.message ? 'input-field__textarea--error' : ''}`}
          rows={5}
          placeholder="お問い合わせ内容をご記入ください"
          aria-invalid={touched.message && !!errors.message}
          aria-describedby={touched.message && errors.message ? 'message-error' : undefined}
        />
        {touched.message && errors.message && (
          <span id="message-error" className="input-field__error" role="alert">
            {errors.message}
          </span>
        )}
      </div>

      {/* 【課題54】購読チェックボックス */}
      <CheckboxField
        label="メールマガジンを購読する"
        name="subscribe"
        checked={values.subscribe}
        error={errors.subscribe}
        touched={touched.subscribe}
        onChange={handleChange}
        onBlur={handleBlur}
      />

      {/* 【課題55】送信・リセットボタン */}
      <div className="contact-form__actions">
        <button type="submit" className="btn btn--primary" disabled={isSubmitting || !isValid}>
          {isSubmitting ? '送信中...' : '送信'}
        </button>
        <button type="button" className="btn btn--secondary" onClick={resetForm}>
          リセット
        </button>
      </div>
    </form>
  )
}

export default ContactForm

