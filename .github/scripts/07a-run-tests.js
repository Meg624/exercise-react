#!/usr/bin/env node

/**
 * テスト実行とカバレッジ測定スクリプト
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// 色付きコンソール出力
const log = {
  success: (msg) => console.log(`\x1b[32m✅ ${msg}\x1b[0m`),
  error: (msg) => console.log(`\x1b[31m❌ ${msg}\x1b[0m`),
  warning: (msg) => console.log(`\x1b[33m⚠️  ${msg}\x1b[0m`),
  info: (msg) => console.log(`\x1b[36m${msg}\x1b[0m`),
}

function runTests() {
  log.info('=== テスト実行とカバレッジ測定 ===\n')

  // package.jsonの確認
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))

  if (!packageJson.scripts || !packageJson.scripts.test) {
    log.warning('テストスクリプトが設定されていません')
    log.info('package.jsonに "test" スクリプトを追加してください')
    return
  }

  try {
    // テスト実行
    console.log('🧪 テストを実行中...\n')

    const testCommand = 'npm test -- --run --coverage'
    const startTime = Date.now()

    execSync(testCommand, {
      stdio: 'inherit',
      env: { ...process.env, CI: 'true' },
    })

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    log.success(`\nテスト完了 (${duration}秒)`)

    // カバレッジファイルの確認
    checkCoverageReport()
  } catch (error) {
    log.error('テストが失敗しました')

    // 失敗の詳細を解析
    analyzeTestFailure(error)

    process.exit(1)
  }
}

function checkCoverageReport() {
  const coveragePath = path.join(process.cwd(), 'coverage/coverage-summary.json')

  if (fs.existsSync(coveragePath)) {
    log.success('カバレッジレポートが生成されました')

    // カバレッジチェックスクリプトを実行
    try {
      require('./07b-check-coverage.js')
    } catch (error) {
      log.warning('カバレッジチェックでエラーが発生しました')
    }
  } else {
    log.warning('カバレッジレポートが見つかりません')
    log.info('--coverage オプションが正しく設定されているか確認してください')
  }
}

function analyzeTestFailure(error) {
  console.log('\n=== テスト失敗の分析 ===\n')

  const errorMessage = error.toString()

  // よくあるエラーパターンをチェック
  if (errorMessage.includes('Cannot find module')) {
    log.error('モジュールが見つかりません')
    console.log('💡 解決方法:')
    console.log('  1. npm install を実行')
    console.log('  2. import文のパスを確認')
  } else if (errorMessage.includes('SyntaxError')) {
    log.error('構文エラーが発生しています')
    console.log('💡 解決方法:')
    console.log('  1. TypeScript/JSXの構文を確認')
    console.log('  2. Babel/TypeScript設定を確認')
  } else if (errorMessage.includes('expect')) {
    log.error('アサーションが失敗しています')
    console.log('💡 解決方法:')
    console.log('  1. テストの期待値を確認')
    console.log('  2. コンポーネントの実装を確認')
  }

  // テストファイルの存在確認
  checkTestFiles()
}

function checkTestFiles() {
  console.log('\n=== テストファイルの確認 ===\n')

  const testPatterns = [
    'src/**/*.test.{ts,tsx,js,jsx}',
    'src/**/*.spec.{ts,tsx,js,jsx}',
    'src/**/__tests__/**/*.{ts,tsx,js,jsx}',
  ]

  let testFileCount = 0

  // srcディレクトリ内のテストファイルを探す
  const findTestFiles = (dir) => {
    const files = fs.readdirSync(dir, { withFileTypes: true })

    for (const file of files) {
      const fullPath = path.join(dir, file.name)

      if (file.isDirectory() && !file.name.includes('node_modules')) {
        findTestFiles(fullPath)
      } else if (file.isFile() && (file.name.includes('.test.') || file.name.includes('.spec.'))) {
        testFileCount++
        console.log(`  📝 ${fullPath.replace(process.cwd(), '.')}`)
      }
    }
  }

  if (fs.existsSync('src')) {
    findTestFiles('src')
  }

  if (testFileCount === 0) {
    log.warning('テストファイルが見つかりません')
    console.log('\n💡 テストファイルの作成:')
    console.log('  - コンポーネント: ComponentName.test.tsx')
    console.log('  - フック: hookName.test.ts')
    console.log('  - __tests__/ ディレクトリに配置')
  } else {
    log.success(`${testFileCount}個のテストファイルを検出`)
  }

  // テスト設定ファイルの確認
  console.log('\n=== テスト設定の確認 ===\n')

  const configFiles = ['vitest.config.ts', 'jest.config.js', 'vite.config.ts']

  configFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      log.success(`${file} が存在します`)
    }
  })

  // テストセットアップファイルの確認
  if (fs.existsSync('src/test/setup.ts')) {
    log.success('テストセットアップファイルが存在します')
  }
}

// メイン実行
try {
  runTests()
} catch (error) {
  console.error('予期しないエラーが発生しました:', error.message)
  process.exit(1)
}
