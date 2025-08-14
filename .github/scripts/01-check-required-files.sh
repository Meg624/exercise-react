#!/bin/bash

# 必須ファイルの存在確認スクリプト
# GitHub Actionsワークフローから呼び出される

set -e  # エラーが発生したら即座に終了

echo "=== 必須ファイルと実装内容の検証 ==="

# 必須ファイルリスト
REQUIRED_FILES=(
  "src/hooks/useForm.ts"
  "src/components/InputField.tsx"
  "src/components/SelectField.tsx"
  "src/components/CheckboxField.tsx"
  "src/components/RadioGroup.tsx"
  "src/components/ContactForm.tsx"
)

# すべてのファイルが存在するかチェック
ALL_EXIST=true
MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file exists"
  else
    echo "❌ $file is missing"
    MISSING_FILES+=("$file")
    ALL_EXIST=false
  fi
done

# 不足ファイルがある場合はエラー終了
if [ "$ALL_EXIST" = false ]; then
  echo ""
  echo "❌ 必須ファイルが不足しています:"
  printf '  - %s\n' "${MISSING_FILES[@]}"
  exit 1
fi

echo ""
echo "✅ すべての必須ファイルが存在します"
