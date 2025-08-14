#!/usr/bin/env node

/**
 * Pull Requestコメント生成スクリプト
 * GitHub Actionsから呼び出されて、テスト結果をPRにコメントする
 */

module.exports = async function generatePRComment(github, context) {
  // テスト結果の収集
  const fs = require('fs')
  const path = require('path')

  // レポートファイルが存在する場合は読み込む
  let testReport = null
  const reportPath = path.join(process.cwd(), 'test-report.json')

  if (fs.existsSync(reportPath)) {
    testReport = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
  }

  // ジョブステータスの取得
  const jobStatus = process.env.JOB_STATUS || context.job.status || 'unknown'
  const isSuccess = jobStatus === 'success'

  // コメント本文の生成
  const comment = generateCommentBody(isSuccess, testReport, context)

  // PRにコメントを投稿
  try {
    await github.rest.issues.createComment({
      issue_number: context.issue.number,
      owner: context.repo.owner,
      repo: context.repo.repo,
      body: comment,
    })

    console.log('✅ PRコメントを投稿しました')
  } catch (error) {
    console.error('❌ PRコメントの投稿に失敗しました:', error.message)
  }
}

function generateCommentBody(isSuccess, testReport, context) {
  const emoji = isSuccess ? '✅' : '❌'
  const title = isSuccess ? 'すべてのテストに合格' : 'テストに失敗'

  let body = `## ${emoji} テスト結果: ${title}

### 📋 チェック項目

| 項目 | 結果 | 詳細 |
|------|------|------|
`

  // テストレポートがある場合は詳細情報を使用
  if (testReport && testReport.checks) {
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

    for (const [key, status] of Object.entries(testReport.checks)) {
      const label = checkLabels[key] || key
      const statusEmoji = status === 'passed' ? '✅' : status === 'failed' ? '❌' : status === 'warning' ? '⚠️' : '⏳'
      const detail = getCheckDetail(key, status, testReport)
      body += `| ${label} | ${statusEmoji} | ${detail} |\n`
    }

    // サマリー情報
    if (testReport.summary) {
      const { successRate, passed, failed, warnings, total } = testReport.summary
      body += `
### 📊 サマリー

- **成功率**: ${successRate}%
- **成功**: ${passed}/${total}
- **失敗**: ${failed}
- **警告**: ${warnings}
`
    }
  } else {
    // レポートがない場合は簡易版
    const items = [
      '必須ファイル',
      'useFormフック実装',
      'TypeScript型安全性',
      'コンポーネント構造',
      'アクセシビリティ',
      'ビルド',
      'テスト',
    ]

    items.forEach((item) => {
      const result = isSuccess ? '✅' : '❌'
      body += `| ${item} | ${result} | - |\n`
    })
  }

  // Actionsへのリンク
  body += `
### 📝 詳細

詳細なテスト結果は[Actions](${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId})で確認してください。
`

  // 追加情報
  if (!isSuccess) {
    body += `
### ⚠️ 修正が必要です

失敗したテストの詳細を確認し、必要な修正を行ってください。

#### 🔧 デバッグ方法

1. ローカルで以下のコマンドを実行:
   \`\`\`bash
   npm test
   npm run build
   bunx @biomejs/biome check
   \`\`\`

2. エラーメッセージを確認して修正

3. 修正後、再度プッシュ
`
  } else {
    body += `
### 🎉 お疲れ様でした！

課題の要件をすべて満たしています。

#### ✨ 次のステップ

- コードレビューのフィードバックを確認
- 必要に応じて追加の改善を実施
- マージの準備完了！
`
  }

  // パフォーマンス情報を追加
  body += generatePerformanceSection(testReport)

  // フッター
  body += `

---
<details>
<summary>🤖 このコメントは自動生成されました</summary>

- **Workflow**: Strict Testing - React Form Components
- **Run ID**: ${context.runId}
- **Commit**: ${context.sha.substring(0, 7)}
- **Triggered by**: @${context.actor}
- **Timestamp**: ${new Date().toISOString()}

</details>`

  return body
}

function getCheckDetail(key, status, report) {
  // 各チェック項目の詳細情報を返す
  switch (key) {
    case 'coverage':
      if (report.coverage && report.coverage.percentage) {
        return `${report.coverage.percentage}%`
      }
      break
    case 'tests':
      if (report.tests && report.tests.passed && report.tests.total) {
        return `${report.tests.passed}/${report.tests.total} passed`
      }
      break
    case 'typescript_types':
      if (status === 'failed' && report.typescript && report.typescript.errors) {
        return `${report.typescript.errors} errors`
      }
      break
    case 'build':
      if (status === 'passed' && report.build && report.build.duration) {
        return `${report.build.duration}s`
      }
      break
  }

  // デフォルト
  return status === 'passed' ? 'OK' : status === 'failed' ? 'Failed' : status === 'warning' ? 'Warning' : '-'
}

function generatePerformanceSection(report) {
  if (!report || !report.performance) {
    return ''
  }

  return `
### ⚡ パフォーマンス

| メトリクス | 値 | 状態 |
|-----------|-----|------|
| ビルド時間 | ${report.performance.buildTime || '-'}s | ${report.performance.buildTime < 30 ? '✅' : '⚠️'} |
| バンドルサイズ | ${report.performance.bundleSize || '-'} | ${report.performance.bundleSize < '500KB' ? '✅' : '⚠️'} |
| テスト実行時間 | ${report.performance.testTime || '-'}s | ${report.performance.testTime < 60 ? '✅' : '⚠️'} |
| カバレッジ | ${report.performance.coverage || '-'}% | ${report.performance.coverage > 60 ? '✅' : '⚠️'} |
`
}

// 直接実行された場合（テスト用）
if (require.main === module) {
  // モックデータでテスト
  const mockGithub = {
    rest: {
      issues: {
        createComment: async (params) => {
          console.log('Mock PR Comment:', params.body)
        },
      },
    },
  }

  const mockContext = {
    issue: { number: 1 },
    repo: { owner: 'test', repo: 'repo' },
    serverUrl: 'https://github.com',
    runId: '123456',
    sha: 'abcdef123456',
    actor: 'testuser',
    job: { status: 'success' },
  }

  module.exports(mockGithub, mockContext)
}
