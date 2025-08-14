#!/usr/bin/env node

/**
 * コンポーネント実装の検証スクリプト
 * 各フォームコンポーネントが必要な要件を満たしているかチェック
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

// コンポーネント定義
const components = [
  {
    name: 'InputField',
    file: 'src/components/InputField.tsx',
    specificChecks: {
      'type prop定義': /type\?:\s*['"]?(text|email|password|number|tel|url)/,
      'placeholder prop': /placeholder\?:/,
      'autoComplete prop': /autoComplete\?:/,
    },
  },
  {
    name: 'SelectField',
    file: 'src/components/SelectField.tsx',
    specificChecks: {
      'options prop定義': /options:\s*\w+\[\]/,
      'SelectOption interface': /interface\s+SelectOption/,
      'option.value/label': /option\.value.*option\.label/s,
    },
  },
  {
    name: 'CheckboxField',
    file: 'src/components/CheckboxField.tsx',
    specificChecks: {
      'checked prop': /checked:\s*boolean/,
      'checkbox type属性': /type=['"]checkbox['"]/,
      'description prop': /description\?:/,
    },
  },
  {
    name: 'RadioGroup',
    file: 'src/components/RadioGroup.tsx',
    specificChecks: {
      'options prop定義': /options:\s*\w+\[\]/,
      'RadioOption interface': /interface\s+RadioOption/,
      fieldset要素: /<fieldset/,
      legend要素: /<legend/,
      'radio type属性': /type=['"]radio['"]/,
    },
  },
]

// 共通の必須要件
function getCommonRequirements(componentName) {
  return {
    [`${componentName}Props interface`]: new RegExp(`interface\\s+${componentName}Props`),
    'value or checked prop': /value:|checked:/,
    'onChange handler': /onChange:\s*\(/,
    'onBlur handler': /onBlur:\s*\(/,
    'error prop': /error\?:\s*string/,
    'touched prop': /touched\?:\s*boolean/,
    'required prop': /required\?:\s*boolean/,
    'disabled prop': /disabled\?:\s*boolean/,
    'className prop': /className\?:\s*string/,
    [`React.FC<${componentName}Props>`]: new RegExp(`:\\s*React\\.FC<${componentName}Props>`),
  }
}

// メイン検証関数
function verifyComponents() {
  log.info('=== コンポーネント実装の検証 ===\n')

  let allComponentsValid = true
  const results = []

  for (const component of components) {
    const result = verifyComponent(component)
    results.push(result)
    if (!result.valid) {
      allComponentsValid = false
    }
  }

  // サマリー表示
  displaySummary(results)

  if (!allComponentsValid) {
    console.error('\n❌ コンポーネントの実装が不完全です')
    process.exit(1)
  }

  log.success('\n✅ すべてのコンポーネントが正しく実装されています！')
}

// 個別コンポーネントの検証
function verifyComponent({ name, file, specificChecks }) {
  console.log(`\n${'='.repeat(40)}`)
  log.info(`📦 ${name} の検証`)
  console.log(`${'='.repeat(40)}`)

  const filePath = path.join(process.cwd(), file)

  // ファイル存在確認
  if (!fs.existsSync(filePath)) {
    log.error(`${file} が見つかりません`)
    return { name, valid: false, errors: ['ファイルが存在しない'] }
  }

  const content = fs.readFileSync(filePath, 'utf8')

  // 共通要件のチェック
  const commonReqs = getCommonRequirements(name)
  const allRequirements = { ...commonReqs, ...specificChecks }

  const errors = []
  const warnings = []
  let validCount = 0
  const totalCount = Object.keys(allRequirements).length

  for (const [req, pattern] of Object.entries(allRequirements)) {
    if (pattern.test(content)) {
      log.success(req)
      validCount++
    } else {
      // 一部の項目は警告として扱う
      if (req.includes('className') || req.includes('description')) {
        log.warning(`${req} (オプション)`)
        warnings.push(req)
      } else {
        log.error(`${req} が不足`)
        errors.push(req)
      }
    }
  }

  // 追加の品質チェック
  checkComponentQuality(name, content)

  const valid = errors.length === 0
  console.log(`\n📊 結果: ${validCount}/${totalCount} 項目実装済み`)

  return { name, valid, errors, warnings, validCount, totalCount }
}

// コンポーネントの品質チェック
function checkComponentQuality(name, content) {
  console.log('\n--- 品質チェック ---')

  // エクスポートの確認
  if (new RegExp(`export\\s+(const\\s+${name}|default\\s+${name})`).test(content)) {
    log.success('コンポーネントが正しくエクスポートされています')
  } else {
    log.error('エクスポートが見つかりません')
  }

  // メモ化の使用
  if (/React\.memo/.test(content)) {
    log.success('React.memoによる最適化')
  }

  // フラグメントの使用
  if (/<>|<React\.Fragment>/.test(content)) {
    log.success('Fragmentの適切な使用')
  }

  // コンポーネントの行数（複雑さの指標）
  const lines = content.split('\n').length
  if (lines < 150) {
    log.success(`適切なコンポーネントサイズ (${lines}行)`)
  } else if (lines < 200) {
    log.warning(`コンポーネントが大きめです (${lines}行)`)
  } else {
    log.warning(`コンポーネントが大きすぎます (${lines}行) - 分割を検討`)
  }
}

// 結果サマリーの表示
function displaySummary(results) {
  console.log('\n' + '='.repeat(50))
  log.info('📋 検証結果サマリー')
  console.log('='.repeat(50))

  console.log('\n| コンポーネント | 状態 | 実装率 |')
  console.log('|---------------|------|--------|')

  for (const result of results) {
    const status = result.valid ? '✅' : '❌'
    const percentage = Math.round((result.validCount / result.totalCount) * 100)
    console.log(`| ${result.name.padEnd(13)} | ${status}    | ${percentage}%    |`)
  }

  // エラーがある場合は詳細表示
  const failedComponents = results.filter((r) => !r.valid)
  if (failedComponents.length > 0) {
    console.log('\n⚠️  修正が必要な項目:')
    for (const comp of failedComponents) {
      console.log(`\n${comp.name}:`)
      comp.errors.forEach((err) => console.log(`  - ${err}`))
    }
  }
}

// スクリプト実行
try {
  verifyComponents()
} catch (error) {
  console.error('エラーが発生しました:', error.message)
  process.exit(1)
}
