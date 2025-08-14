#!/usr/bin/env node

/**
 * テストカバレッジをチェックするスクリプト
 * coverage-summary.jsonを解析して最低要件を確認
 */

const fs = require('node:fs')
const path = require('node:path')

// カバレッジ最低要件（%）
const MIN_COVERAGE = {
  lines: 40,
  statements: 40,
  functions: 40,
  branches: 30, // ブランチは少し緩めに
}

// 色付きコンソール出力
const log = {
  success: (msg) => console.log(`\x1b[32m✅ ${msg}\x1b[0m`),
  error: (msg) => console.log(`\x1b[31m❌ ${msg}\x1b[0m`),
  warning: (msg) => console.log(`\x1b[33m⚠️  ${msg}\x1b[0m`),
  info: (msg) => console.log(`\x1b[36m${msg}\x1b[0m`),
}

function checkCoverage() {
  const coveragePath = path.join(process.cwd(), 'coverage/coverage-summary.json')

  // カバレッジファイルの存在確認
  if (!fs.existsSync(coveragePath)) {
    log.warning('カバレッジファイルが見つかりません。テストを実行してください。')
    return
  }

  try {
    const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'))
    const total = coverage.total

    console.log('\n=== テストカバレッジ ===\n')

    const metrics = ['lines', 'statements', 'functions', 'branches']
    let allPassed = true
    const results = []

    // 各メトリクスのチェック
    metrics.forEach((metric) => {
      const pct = total[metric].pct
      const minRequired = MIN_COVERAGE[metric] || 40
      const status = pct >= minRequired

      if (status) {
        log.success(`${metric}: ${pct.toFixed(2)}% (最低要件: ${minRequired}%)`)
      } else {
        log.error(`${metric}: ${pct.toFixed(2)}% (最低要件: ${minRequired}%)`)
        allPassed = false
      }

      results.push({ metric, pct, minRequired, passed: status })
    })

    // 平均カバレッジの計算
    const avgCoverage = metrics.reduce((sum, m) => sum + total[m].pct, 0) / 4

    console.log('\n' + '='.repeat(40))
    console.log(`📊 平均カバレッジ: ${avgCoverage.toFixed(2)}%`)

    // 詳細情報の表示
    if (coverage.total.lines.total > 0) {
      console.log('\n📈 カバレッジ詳細:')
      console.log(`  - テスト済み行数: ${total.lines.covered}/${total.lines.total}`)
      console.log(`  - テスト済み文: ${total.statements.covered}/${total.statements.total}`)
      console.log(`  - テスト済み関数: ${total.functions.covered}/${total.functions.total}`)
      console.log(`  - テスト済み分岐: ${total.branches.covered}/${total.branches.total}`)
    }

    // ファイル別のカバレッジ（低いものをリストアップ）
    console.log('\n📁 カバレッジが低いファイル:')
    const files = Object.entries(coverage)
      .filter(([key]) => key !== 'total')
      .map(([file, data]) => ({
        file: file.replace(process.cwd(), '.'),
        coverage: data.lines.pct,
      }))
      .filter((f) => f.coverage < 50)
      .sort((a, b) => a.coverage - b.coverage)

    if (files.length > 0) {
      files.slice(0, 5).forEach((f) => {
        log.warning(`  ${f.file}: ${f.coverage.toFixed(2)}%`)
      })

      if (files.length > 5) {
        console.log(`  ... 他 ${files.length - 5} ファイル`)
      }
    } else {
      log.success('  すべてのファイルが50%以上のカバレッジです')
    }

    // 改善提案
    console.log('\n💡 カバレッジ改善のヒント:')

    if (total.functions.pct < 60) {
      console.log('  - 未テストの関数にユニットテストを追加')
    }
    if (total.branches.pct < 50) {
      console.log('  - if文やswitch文の各分岐をテスト')
    }
    if (total.lines.pct < 60) {
      console.log('  - エラーハンドリングのテストを追加')
    }

    console.log('  - 重要なビジネスロジックを優先的にテスト')
    console.log('  - E2Eテストで統合的な動作を確認')

    // 最終判定
    if (!allPassed) {
      console.error('\n❌ カバレッジが最低要件を満たしていません')
      process.exit(1)
    } else {
      log.success('\n✅ カバレッジ要件を満たしています')
    }
  } catch (error) {
    console.error('カバレッジファイルの解析に失敗しました:', error.message)
    process.exit(1)
  }
}

// スクリプト実行
checkCoverage()
