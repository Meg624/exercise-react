#!/usr/bin/env node

/**
 * アクセシビリティ実装の検証スクリプト
 * ARIA属性、キーボード操作、スクリーンリーダー対応をチェック
 */

const fs = require('node:fs')
const path = require('node:path')

// 色付きコンソール出力
const log = {
  success: (msg) => console.log(`\x1b[32m✅ ${msg}\x1b[0m`),
  error: (msg) => console.log(`\x1b[31m❌ ${msg}\x1b[0m`),
  warning: (msg) => console.log(`\x1b[33m⚠️  ${msg}\x1b[0m`),
  info: (msg) => console.log(`\x1b[36m${msg}\x1b[0m`),
}

// 検証対象コンポーネント
const components = ['InputField', 'SelectField', 'CheckboxField', 'RadioGroup']

// アクセシビリティチェック項目
const a11yChecks = {
  // 必須項目
  required: {
    'aria-invalid属性': /aria-invalid/,
    'aria-describedby属性': /aria-describedby/,
    id属性の設定: /id=\{[^}]+\}|id=['"][^'"]+['"]/,
    'ラベルの関連付け (htmlFor/aria-label)': /htmlFor|aria-label/,
  },

  // 推奨項目
  recommended: {
    role属性: /role=['"][^'"]+['"]/,
    'aria-required属性': /aria-required/,
    'aria-disabled属性': /aria-disabled/,
    'aria-hidden属性': /aria-hidden/,
    tabIndex属性: /tabIndex/,
  },

  // エラー処理
  errorHandling: {
    'エラーメッセージのrole="alert"': /role=['"]alert['"]/,
    エラーとフィールドの関連付け: /aria-describedby.*error|errorId/,
    'エラー時のaria-invalid="true"': /aria-invalid.*true|hasError.*aria-invalid/,
  },
}

// コンポーネント固有のチェック
const componentSpecificChecks = {
  InputField: {
    input要素のtype属性: /type=['"](?:text|email|password|number|tel|url)['"]/,
  },
  SelectField: {
    select要素: /<select/,
    option要素: /<option/,
  },
  CheckboxField: {
    'checkbox type': /type=['"]checkbox['"]/,
    チェックボックスのラベル: /<label.*htmlFor|<input.*aria-label/,
  },
  RadioGroup: {
    fieldset要素: /<fieldset/,
    legend要素: /<legend/,
    'role="radiogroup"': /role=['"]radiogroup['"]/,
    'radio type': /type=['"]radio['"]/,
  },
}

// メイン処理
function main() {
  log.info('=== アクセシビリティ実装の検証 ===\n')

  const results = []
  let allAccessible = true

  for (const componentName of components) {
    const result = verifyComponentAccessibility(componentName)
    results.push(result)

    if (!result.meetsRequirements) {
      allAccessible = false
    }
  }

  // サマリー表示
  displaySummary(results)

  if (!allAccessible) {
    console.error('\n❌ アクセシビリティの実装が不十分です')
    console.log('最低限、必須項目（Required）をすべて実装してください。')
    process.exit(1)
  }

  log.success('\n✅ アクセシビリティが適切に実装されています！')
}

// 個別コンポーネントのアクセシビリティ検証
function verifyComponentAccessibility(componentName) {
  console.log(`\n${'='.repeat(40)}`)
  log.info(`♿ ${componentName} のアクセシビリティ`)
  console.log(`${'='.repeat(40)}`)

  const filePath = path.join(process.cwd(), `src/components/${componentName}.tsx`)

  if (!fs.existsSync(filePath)) {
    log.error(`${componentName}.tsx が見つかりません`)
    return {
      component: componentName,
      meetsRequirements: false,
      score: 0,
    }
  }

  const content = fs.readFileSync(filePath, 'utf8')

  const scores = {
    required: 0,
    recommended: 0,
    errorHandling: 0,
    specific: 0,
  }

  const issues = {
    required: [],
    recommended: [],
    errorHandling: [],
  }

  // 必須項目のチェック
  console.log('\n📋 必須項目 (Required):')
  for (const [check, pattern] of Object.entries(a11yChecks.required)) {
    if (pattern.test(content)) {
      log.success(check)
      scores.required++
    } else {
      log.error(check)
      issues.required.push(check)
    }
  }

  // 推奨項目のチェック
  console.log('\n💡 推奨項目 (Recommended):')
  for (const [check, pattern] of Object.entries(a11yChecks.recommended)) {
    if (pattern.test(content)) {
      log.success(check)
      scores.recommended++
    } else {
      log.warning(check)
      issues.recommended.push(check)
    }
  }

  // エラー処理のチェック
  console.log('\n🚨 エラー処理:')
  for (const [check, pattern] of Object.entries(a11yChecks.errorHandling)) {
    if (pattern.test(content)) {
      log.success(check)
      scores.errorHandling++
    } else {
      log.warning(check)
      issues.errorHandling.push(check)
    }
  }

  // コンポーネント固有のチェック
  if (componentSpecificChecks[componentName]) {
    console.log(`\n🎯 ${componentName}固有の要件:`)
    for (const [check, pattern] of Object.entries(componentSpecificChecks[componentName])) {
      if (pattern.test(content)) {
        log.success(check)
        scores.specific++
      } else {
        log.error(check)
      }
    }
  }

  // スコア計算
  const requiredTotal = Object.keys(a11yChecks.required).length
  const meetsRequirements = scores.required === requiredTotal

  const totalScore =
    (scores.required / requiredTotal) * 50 +
    (scores.recommended / Object.keys(a11yChecks.recommended).length) * 25 +
    (scores.errorHandling / Object.keys(a11yChecks.errorHandling).length) * 25

  console.log(`\n📊 スコア: ${Math.round(totalScore)}%`)
  if (!meetsRequirements) {
    console.log(`⚠️  必須項目: ${scores.required}/${requiredTotal} (要改善)`)
  }

  return {
    component: componentName,
    meetsRequirements,
    score: Math.round(totalScore),
    scores,
    issues,
  }
}

// 結果サマリーの表示
function displaySummary(results) {
  console.log('\n' + '='.repeat(50))
  log.info('📊 アクセシビリティ検証サマリー')
  console.log('='.repeat(50))

  console.log('\n| コンポーネント | 状態 | スコア | 必須項目 |')
  console.log('|---------------|------|--------|----------|')

  for (const result of results) {
    const status = result.meetsRequirements ? '✅' : '❌'
    const score = `${result.score}%`.padEnd(6)
    const required = result.scores ? `${result.scores.required}/${Object.keys(a11yChecks.required).length}` : 'N/A'

    console.log(`| ${result.component.padEnd(13)} | ${status}    | ${score} | ${required.padEnd(8)} |`)
  }

  // ベストプラクティスの提案
  console.log('\n' + '='.repeat(50))
  log.info('💡 アクセシビリティのベストプラクティス')
  console.log('='.repeat(50))

  const tips = [
    '1. すべてのフォーム要素に適切なラベルを設定',
    '2. エラーメッセージは aria-live="polite" または role="alert" で通知',
    '3. フォーカス可能な要素は見た目でも分かるように',
    '4. キーボードのみで全機能が操作可能に',
    '5. 色だけに依存しない情報伝達',
    '6. 適切な見出し構造とランドマークの使用',
  ]

  tips.forEach((tip) => console.log(tip))

  // 改善が必要な項目のリスト
  const needsImprovement = results.filter((r) => !r.meetsRequirements)
  if (needsImprovement.length > 0) {
    console.log('\n⚠️  改善が必要なコンポーネント:')
    for (const comp of needsImprovement) {
      console.log(`\n${comp.component}:`)
      if (comp.issues.required.length > 0) {
        console.log('  必須項目:')
        comp.issues.required.forEach((issue) => console.log(`    - ${issue}`))
      }
    }
  }
}

// スクリプト実行
try {
  main()
} catch (error) {
  console.error('エラーが発生しました:', error.message)
  process.exit(1)
}
