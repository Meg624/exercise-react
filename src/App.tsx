import React from 'react'
import  ContactForm  from './components/ContactForm'
import './styles/global.css'

// 【課題51】Appコンポーネントを実装してください
// 要件:
// - React.FCを使用
// - ヘッダー、メインコンテンツ、フィーチャーセクションを含む
function App() {
  return (
    <div className='app'>
      {/* 【課題52】ヘッダーセクションを実装してください
          要件:
          - h1タグでタイトル「React Form Example」
          - pタグで説明文
      */}
      <h1>React Form Example</h1>
      <header className='app-header'>
        <p>ReactとTypeScriptを使用したフォームの実装例です。</p>
      </header>

      {/* 【課題53】メインセクションを実装してください
          要件:
          - ContactFormコンポーネントを配置
          - containerクラスでラップ
      */}      
      <main className='app-main'>
        <div className='container'>
          <ContactForm />
        </div>
      </main>

      {/* フィーチャーセクション */}
      <section className='features'>
        <div className='container'>
          <h2>主な機能</h2>
          <div className='features-grid'>
            <div className='feature'>
              <h3>🔍 バリデーション</h3>
              <p>リアルタイムでフォーム入力を検証</p>
            </div>
            <div className='feature'>
              <h3>♿ アクセシビリティ</h3>
              <p>ARIA属性とキーボード操作に対応</p>
            </div>
            <div className='feature'>
              <h3>🔒 型安全</h3>
              <p>TypeScriptによる完全な型サポート</p>
            </div>
            <div className='feature'>
              <h3>♻️ 再利用可能</h3>
              <p>カスタムフックとコンポーネント設計</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default App