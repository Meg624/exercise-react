// ContactForm.tsx
import React, { useEffect } from 'react'
import { useForm } from '../hooks/useForm'
import { InputField } from './InputField'
import { CheckboxField } from './CheckboxField'
import { RadioGroup } from './RadioGroup'
import { SelectField } from './SelectField'

// 【課題41】FormData型
type FormData = {
  name: string
  email: string
  subject: string
  category: string
  message: string
  subscribe: boolean
}

const STORAGE_KEY = "contactFormData"

export const ContactForm: React.FC = () => {
  // 【課題42】初期値
  const initialValues: FormData = {
    name: '',
    email: '',
    subject: 'inquiry',
    category: '',
    message: '',
    subscribe: false,
  }

  // 【課題43】バリデーション
  const validationRules = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 50,
      // 追加：数字を含む場合エラーにする正規表現
      pattern: /^[^\d]+$/, 
    },
    email: { required: true, pattern: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/ },
    subject: { required: true },
    message: { required: true, minLength: 10, maxLength: 500, pattern: /^[^\d]+$/ },
  } // nameとmessageに数字を含む場合エラーにするパターンを追加

  // 【課題44】送信処理
  const handleFormSubmit = async (formData: FormData) => {
    console.log('Form submitted', formData)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    alert('フォームが送信されました！')
    localStorage.removeItem(STORAGE_KEY)
    resetForm()
  }

  // 【課題45】useForm
  const {
    values,
    errors,
    touched,
    isSubmitting,
    // isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues,
  } = useForm<FormData>({
    initialValues,
    validationRules,
    onSubmit: handleFormSubmit,
  })

  // 初回マウント時に localStorage から復元
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setValues(JSON.parse(saved))
      } catch (e) {
        console.error("保存データの読み込みに失敗しました", e)
      }
    }
  }, [setValues])

  // 値が変わるたびに localStorage に保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values))
  }, [values])

  const categoryOptions = [
    { value: 'general', label: '一般的な質問' },
    { value: 'technical', label: '技術的な質問' },
    { value: 'billing', label: '請求に関する質問' },
    { value: 'other', label: 'その他' },
  ]

  const subjectOptions = [
    { value: 'inquiry', label: 'お問い合わせ' },
    { value: 'feedback', label: 'フィードバック' },
    { value: 'support', label: 'サポート' },
  ]

  return (
    <form onSubmit={handleSubmit} className="contact-form" noValidate>
      <h2 className="contact-form__title">お問い合わせフォーム</h2>

      {/* 【課題46】名前 */}
      <InputField
        label="お名前"
        name="name"
        value={values.name}
        error={errors.name}
        touched={touched.name}
        required
        placeholder="例: 山田 太郎"
        onChange={handleChange}
        onBlur={handleBlur('name')}
      />

      {/* 【課題47】メール */}
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
        onBlur={handleBlur('email')}
      />

      {/* 【課題48】件名 */}
      <RadioGroup
        label="件名"
        name="subject"
        value={values.subject}
        options={subjectOptions}
        error={errors.subject}
        touched={touched.subject}
        required
        onChange={handleChange}
        onBlur={handleBlur('subject')}
      />

      {/* カテゴリー */}
      <SelectField
        label="カテゴリー"
        name="category"
        value={values.category}
        options={categoryOptions}
        error={errors.category}
        touched={touched.category}
        onChange={handleChange}
        onBlur={handleBlur('category')}
      />

      {/* メッセージ */}
      <InputField
        label="メッセージ"
        name="message"
        value={values.message}
        error={errors.message}
        touched={touched.message}
        required
        placeholder="お問い合わせ内容をご記入ください"
        onChange={handleChange}
        onBlur={handleBlur('message')}
        className={`input-field__textarea ${touched.message && errors.message ? "input-field__textarea--error" : ""}`}
        isTextArea={true}
        rows={5}
      />

      {/* 【課題49】購読 */}
      <CheckboxField
        label="メールマガジンを購読する"
        name="subscribe"
        checked={values.subscribe}
        error={errors.subscribe}
        touched={touched.subscribe}
        onChange={handleChange}
        onBlur={handleBlur('subscribe')}
      />

      {/* 【課題50】ボタン */}
      <div className="contact-form__actions">
        <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
          {isSubmitting ? '送信中...' : '送信'}
        </button>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => {
            resetForm()
            localStorage.removeItem(STORAGE_KEY)
          }}
        >
          リセット
        </button>
      </div>
    </form>
  )
}

export default ContactForm
