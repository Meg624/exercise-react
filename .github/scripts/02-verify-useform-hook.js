#!/usr/bin/env node

/**
 * useFormフックの実装検証スクリプト
 * 必須機能がすべて実装されているかチェックする
 */

const fs = require('node:fs')
const path = require('node:path')

// 色付きコンソール出力用のヘルパー
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
}

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}${msg}${colors.reset}`),
}

// メイン処理
function main() {
  log.info('=== useFormフックの必須機能検証 ===\n')

  const hookPath = path.join(process.cwd(), 'src/hooks/useForm.ts')

  // ファイルの存在確認
  if (!fs.existsSync(hookPath)) {
    log.error('src/hooks/useForm.ts が見つかりません')
    process.exit(1)
  }

  // ファイル内容の読み込み
  const content = fs.readFileSync(hookPath, 'utf8')

  // 必須機能の定義
  const requiredFeatures = {
    // 関数定義
    validateField関数: /validateField/,
    validateForm関数: /validateForm/,
    handleSubmit関数: /handleSubmit/,
    handleChange関数: /handleChange/,
    handleBlur関数: /handleBlur/,
    resetForm関数: /resetForm/,
    setValue関数: /setValue/,
    setError関数: /setError/,

    // 状態管理
    isValid状態: /isValid/,
    isSubmitting状態: /isSubmitting/,
    errors状態管理: /errors.*setErrors/s,
    touched状態管理: /touched.*setTouched/s,
    values状態管理: /values.*setValues/s,

    // 型定義
    ジェネリクス型定義: /<T\s+extends\s+Record<string,\s*(any|unknown)>>/,
    FormConfigインターフェース: /interface\s+FormConfig/,
    ValidationRuleインターフェース: /interface\s+ValidationRule/,
    UseFormReturnインターフェース: /interface\s+UseFormReturn/,

    // バリデーション機能
    required検証: /rules\.required/,
    minLength検証: /rules\.minLength/,
    maxLength検証: /rules\.maxLength/,
    pattern検証: /rules\.pattern/,
    custom検証: /rules\.custom/,
  }

  let hasAllFeatures = true
  const missingFeatures = []
  const implementedFeatures = []

  // 各機能のチェック
  for (const [feature, pattern] of Object.entries(requiredFeatures)) {
    if (pattern.test(content)) {
      log.success(feature)
      implementedFeatures.push(feature)
    } else {
      log.error(`${feature} が実装されていません`)
      missingFeatures.push(feature)
      hasAllFeatures = false
    }
  }

  // 結果のサマリー
  console.log('\n' + '='.repeat(50))
  console.log(`実装済み: ${implementedFeatures.length}/${Object.keys(requiredFeatures).length} 項目`)

  if (!hasAllFeatures) {
    console.log('\n❌ useFormフックに必須機能が不足しています:')
    missingFeatures.forEach((feature) => {
      console.log(`  - ${feature}`)
    })
    process.exit(1)
  }

  log.success('\nuseFormフックの必須機能がすべて実装されています！')

  // 追加の品質チェック
  checkCodeQuality(content)
}

// コード品質の追加チェック
function checkCodeQuality(content) {
  console.log('\n' + '='.repeat(50))
  log.info('=== コード品質チェック ===\n')

  // useCallbackの使用チェック
  if (/useCallback/.test(content)) {
    log.success('useCallbackを使用したパフォーマンス最適化')
  } else {
    log.warning('useCallbackの使用を検討してください')
  }

  // エラーハンドリング
  if (/try\s*{[\s\S]*?}\s*catch/.test(content)) {
    log.success('エラーハンドリングが実装されています')
  } else {
    log.warning('try-catchによるエラーハンドリングを検討してください')
  }

  // コメントの存在
  const commentCount = (content.match(/\/\*\*[\s\S]*?\*\/|\/\/.*/g) || []).length
  if (commentCount > 5) {
    log.success(`適切なコメント (${commentCount}箇所)`)
  } else if (commentCount > 0) {
    log.warning(`コメントが少ないです (${commentCount}箇所)`)
  } else {
    log.warning('コメントがありません')
  }

  // exportの確認
  if (/export\s+(function\s+useForm|const\s+useForm)/.test(content)) {
    log.success('useFormが正しくエクスポートされています')
  } else {
    log.error('useFormのエクスポートが見つかりません')
  }
}

// スクリプト実行
try {
  main()
} catch (error) {
  console.error('エラーが発生しました:', error.message)
  process.exit(1)
}
