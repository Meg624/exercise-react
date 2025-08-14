#!/bin/bash

# any型の使用をチェックするスクリプト

echo "=== any型使用チェック ==="

ANY_COUNT=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -E ":\s*any\b" | wc -l)

if [ "$ANY_COUNT" -gt 0 ]; then
  echo "⚠️  警告: any型が${ANY_COUNT}箇所で使用されています"
  echo ""
  echo "詳細:"
  find src -name "*.ts" -o -name "*.tsx" | xargs grep -n -E ":\s*any\b" | while IFS= read -r line; do
    echo "  $line"
  done
  echo ""
  echo "💡 ヒント: any型の代わりに、適切な型定義やunknown型の使用を検討してください"
else
  echo "✅ any型の使用なし - 素晴らしい型安全性です！"
fi
