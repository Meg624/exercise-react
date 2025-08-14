#!/usr/bin/env node

/**
 * テスト結果レポート生成スクリプト
 */

const fs = require('fs')
const path = require('path')

// 色付きコンソール出力
const log = {
  success: (msg) => console.log(`\x1b[32m✅ ${msg}\x1b[0m`),
  error: (msg) => console.log(`\x1b[31m❌ ${msg}\x1b[0m`),
  warning: (msg) => console.log(`\x1b[33m⚠️  ${msg}\x1b[0m`),
  info: (msg) => console.log(`\x1b[36m${msg}\x1b[0m`),
}

function generateReport() {
  log.info('=== テスト結果レポート生成 ===\n')

  // 環境変数から情報を取得（GitHub Actionsで設定される）
  const jobStatus = process.env.JOB_STATUS || 'unknown'
  const runId = process.env.GITHUB_RUN_ID || 'local'
  const repository = process.env.GITHUB_REPOSITORY || 'local/repo'
  const branch = process.env.GITHUB_REF_NAME || 'main'
  const actor = process.env.GITHUB_ACTOR || 'unknown'

  // 各チェック項目の結果を収集
  const checkResults = collectCheckResults()

  // レポートオブジェクトの作成
  const report = {
    timestamp: new Date().toISOString(),
    repository,
    branch,
    actor,
    runId,
    status: jobStatus,
    checks: checkResults,
    summary: generateSummary(checkResults),
    metadata: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    },
  }

  // JSON形式で保存
  const reportPath = path.join(process.cwd(), 'test-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  log.success(`レポートを生成しました: ${reportPath}`)

  // コンソールにサマリーを表示
  displaySummary(report)

  // Markdown形式のレポートも生成
  generateMarkdownReport(report)
}

function collectCheckResults() {
  const results = {
    required_files: 'pending',
    useForm_implementation: 'pending',
    typescript_types: 'pending',
    component_structure: 'pending',
    accessibility: 'pending',
    build: 'pending',
    tests: 'pending',
    lint: 'pending',
    coverage: 'pending',
  }

  // 各スクリプトの実行結果を確認
  // （実際のCI環境では、各ステップの結果を環境変数や一時ファイルから読み取る）

  // ファイル存在チェック
  results.required_files = checkRequiredFiles() ? 'passed' : 'failed'

  // TypeScriptチェック
  try {
    require('child_process').execSync('npx tsc --noEmit --strict', { stdio: 'ignore' })
    results.typescript_types = 'passed'
  } catch {
    results.typescript_types = 'failed'
  }

  // ビルドチェック
  if (fs.existsSync('dist')) {
    results.build = 'passed'
  } else {
    results.build = 'failed'
  }

  // カバレッジチェック
  if (fs.existsSync('coverage/coverage-summary.json')) {
    const coverage = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'))
    const avgCoverage =
      ['lines', 'statements', 'functions', 'branches'].reduce((sum, m) => sum + coverage.total[m].pct, 0) / 4
    results.coverage = avgCoverage >= 40 ? 'passed' : 'warning'
  }

  return results
}

function checkRequiredFiles() {
  const requiredFiles = [
    'src/hooks/useForm.ts',
    'src/components/InputField.tsx',
    'src/components/SelectField.tsx',
    'src/components/CheckboxField.tsx',
    'src/components/RadioGroup.tsx',
    'src/components/ContactForm.tsx',
  ]

  return requiredFiles.every((file) => fs.existsSync(file))
}

function generateSummary(checks) {
  const passed = Object.values(checks).filter((v) => v === 'passed').length
  const failed = Object.values(checks).filter((v) => v === 'failed').length
  const warnings = Object.values(checks).filter((v) => v === 'warning').length
  const total = Object.keys(checks).length

  return {
    total,
    passed,
    failed,
    warnings,
    successRate: Math.round((passed / total) * 100),
  }
}

function displaySummary(report) {
  console.log('\n' + '='.repeat(50))
  log.info('📊 テスト結果サマリー')
  console.log('='.repeat(50))

  const { summary } = report

  console.log(`\n総チェック項目: ${summary.total}`)
  console.log(`✅ 成功: ${summary.passed}`)
  console.log(`❌ 失敗: ${summary.failed}`)
  console.log(`⚠️  警告: ${summary.warnings}`)
  console.log(`\n成功率: ${summary.successRate}%`)

  // 詳細表示
  console.log('\n=== チェック項目詳細 ===\n')

  const checkLabels = {
    required_files: '必須ファイル',
    useForm_implementation: 'useFormフック',
    typescript_types: 'TypeScript型',
    component_structure: 'コンポーネント構造',
    accessibility: 'アクセシビリティ',
    build: 'ビルド',
    tests: 'テスト',
    lint: 'Lint',
    coverage: 'カバレッジ',
  }

  for (const [key, status] of Object.entries(report.checks)) {
    const emoji = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⚠️ '
    const label = checkLabels[key] || key
    console.log(`${emoji} ${label}: ${status}`)
  }

  // 総合判定
  console.log('\n' + '='.repeat(50))
  if (summary.failed === 0) {
    log.success('🎉 すべてのテストに合格しました！')
  } else {
    log.error(`❌ ${summary.failed}個の項目が失敗しました`)
    console.log('上記のログを確認して修正してください。')
  }
}

function generateMarkdownReport(report) {
  const { summary, checks } = report

  let markdown = `# テスト結果レポート

## 📊 サマリー

- **日時**: ${new Date(report.timestamp).toLocaleString('ja-JP')}
- **リポジトリ**: ${report.repository}
- **ブランチ**: ${report.branch}
- **実行者**: ${report.actor}
- **成功率**: ${summary.successRate}%

## ✅ チェック項目

| 項目 | 結果 | 状態 |
|------|------|------|
`

  const checkLabels = {
    required_files: '必須ファイル',
    useForm_implementation: 'useFormフック実装',
    typescript_types: 'TypeScript型安全性',
    component_structure: 'コンポーネント構造',
    accessibility: 'アクセシビリティ',
    build: 'ビルド',
    tests: 'テスト実行',
    lint: 'Lintチェック',
    coverage: 'テストカバレッジ',
  }

  for (const [key, status] of Object.entries(checks)) {
    const emoji = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⚠️'
    const label = checkLabels[key] || key
    const badge =
      status === 'passed'
        ? '![Passed](https://img.shields.io/badge/Passed-green)'
        : status === 'failed'
          ? '![Failed](https://img.shields.io/badge/Failed-red)'
          : '![Warning](https://img.shields.io/badge/Warning-yellow)'
    markdown += `| ${label} | ${emoji} | ${badge} |\n`
  }

  markdown += `
## 📝 詳細

### 環境情報
- Node.js: ${report.metadata.nodeVersion}
- Platform: ${report.metadata.platform}
- Architecture: ${report.metadata.arch}

### 次のステップ
${
  summary.failed > 0
    ? `
1. 失敗した項目のログを確認
2. エラーを修正
3. ローカルでテストを実行
4. 再度プッシュ
`
    : `
✨ おめでとうございます！すべてのチェックに合格しました。
`
}

---
*Generated by GitHub Actions Workflow*
`

  const mdPath = path.join(process.cwd(), 'test-report.md')
  fs.writeFileSync(mdPath, markdown)
  log.success(`Markdownレポートを生成しました: ${mdPath}`)
}

// メイン実行
try {
  generateReport()
} catch (error) {
  console.error('レポート生成中にエラーが発生しました:', error.message)
  process.exit(1)
}
