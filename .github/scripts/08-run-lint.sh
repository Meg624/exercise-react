#!/bin/bash

# Lintチェックスクリプト

echo "=== Lintチェック ==="
echo ""

# Biomeのチェック
if [ -f "biome.json" ]; then
  echo "🔍 Biome Lintチェックを実行中..."

  if bunx @biomejs/biome check; then
    echo "✅ Lintチェックをパス（エラーなし）"
  else
    echo "⚠️  Lintエラーが検出されました"
    echo ""
    echo "💡 自動修正を実行するには:"
    echo "   bunx @biomejs/biome check --write"
    echo ""
    echo "または個別に修正:"
    echo "   bunx @biomejs/biome format --write  # フォーマット"
    echo "   bunx @biomejs/biome lint --write    # Lint修正"

    # エラーがあっても続行（警告扱い）
    # exit 1 を使用しない
  fi

elif [ -f ".eslintrc.json" ] || [ -f ".eslintrc.js" ]; then
  echo "🔍 ESLint チェックを実行中..."

  if npx eslint src --ext .ts,.tsx,.js,.jsx; then
    echo "✅ ESLintチェックをパス"
  else
    echo "⚠️  ESLintエラーが検出されました"
    echo ""
    echo "💡 自動修正を実行するには:"
    echo "   npx eslint src --ext .ts,.tsx,.js,.jsx --fix"
  fi

else
  echo "⚠️  Linter設定が見つかりません"
  echo ""
  echo "💡 Biomeをセットアップするには:"
  echo "   bunx @biomejs/biome init"
  echo ""
  echo "または ESLintをセットアップ:"
  echo "   npm install --save-dev eslint"
  echo "   npx eslint --init"
fi

echo ""
echo "=== コードフォーマットチェック ==="

# Prettierの確認
if [ -f ".prettierrc" ] || [ -f ".prettierrc.json" ]; then
  echo "🎨 Prettier設定が見つかりました"

  if npx prettier --check "src/**/*.{ts,tsx,js,jsx,css}" 2>/dev/null; then
    echo "✅ コードフォーマットは適切です"
  else
    echo "⚠️  フォーマットが必要なファイルがあります"
    echo "   npx prettier --write \"src/**/*.{ts,tsx,js,jsx,css}\""
  fi
fi

echo ""
echo "✅ Lintチェック完了"
