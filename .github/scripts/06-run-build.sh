#!/bin/bash

# ビルドテストスクリプト

set -e

echo "=== ビルドテスト ==="
echo ""

# ビルド実行
echo "🔨 ビルドを実行中..."
BUILD_START=$(date +%s)

if npm run build; then
  BUILD_END=$(date +%s)
  BUILD_TIME=$((BUILD_END - BUILD_START))
  echo "✅ ビルド成功 (${BUILD_TIME}秒)"
else
  echo "❌ ビルドに失敗しました"
  echo ""
  echo "💡 ビルドエラーの解決方法:"
  echo "  1. TypeScriptのエラーを確認"
  echo "  2. import文の確認"
  echo "  3. 依存関係の確認 (npm install)"
  exit 1
fi

echo ""
echo "=== ビルド成果物の確認 ==="

# distディレクトリの確認
if [ -d "dist" ]; then
  echo "✅ dist ディレクトリが生成されました"

  # ビルドサイズの表示
  echo ""
  echo "📦 ビルドサイズ:"
  du -sh dist

  # 主要ファイルのサイズ
  echo ""
  echo "📊 主要ファイル:"
  find dist -name "*.js" -o -name "*.css" | head -5 | while read -r file; do
    size=$(du -sh "$file" | cut -f1)
    basename=$(basename "$file")
    echo "  - $basename: $size"
  done

  # HTMLファイルの確認
  if find dist -name "*.html" | grep -q .; then
    echo ""
    echo "✅ HTMLファイルが生成されています"
  fi

  # アセットの確認
  ASSET_COUNT=$(find dist -type f | wc -l)
  echo ""
  echo "📁 総ファイル数: ${ASSET_COUNT}個"

else
  echo "❌ dist ディレクトリが生成されていません"
  exit 1
fi

# ビルド警告のチェック
echo ""
echo "=== ビルド品質チェック ==="

# 大きすぎるバンドルの警告
LARGE_FILES=$(find dist -name "*.js" -size +500k 2>/dev/null | wc -l)
if [ "$LARGE_FILES" -gt 0 ]; then
  echo "⚠️  500KB以上のJSファイルが${LARGE_FILES}個あります"
  echo "   コード分割を検討してください"
else
  echo "✅ バンドルサイズは適切です"
fi

echo ""
echo "✅ ビルドテスト完了"
