#!/bin/bash

# TypeScript型安全性チェックスクリプト

set -e

echo "=== TypeScript型安全性チェック ==="
echo ""

# TypeScript型チェック実行
echo "📝 TypeScript型チェックを実行中..."
if npx tsc --noEmit --strict; then
  echo "✅ TypeScriptの型チェックをパス"
else
  echo "❌ TypeScriptの型エラーが検出されました"
  echo ""
  echo "💡 ヒント:"
  echo "  - 型定義を確認してください"
  echo "  - any型の使用を避けてください"
  echo "  - strictモードのエラーを解消してください"
  exit 1
fi

echo ""
echo "=== 追加のTypeScript品質チェック ==="

# tsconfig.jsonのstrict設定確認
if [ -f "tsconfig.json" ]; then
  if grep -q '"strict": true' tsconfig.json; then
    echo "✅ TypeScript strictモードが有効"
  else
    echo "⚠️  TypeScript strictモードが無効です"
    echo "   tsconfig.jsonで \"strict\": true を設定することを推奨します"
  fi
fi

# 未使用変数のチェック
echo ""
echo "📊 未使用変数のチェック..."
UNUSED_COUNT=$(npx tsc --noEmit --noUnusedLocals --noUnusedParameters 2>&1 | grep -c "is declared but" || true)
if [ "$UNUSED_COUNT" -gt 0 ]; then
  echo "⚠️  未使用の変数が${UNUSED_COUNT}個見つかりました"
else
  echo "✅ 未使用変数なし"
fi

echo ""
echo "✅ TypeScript品質チェック完了"
