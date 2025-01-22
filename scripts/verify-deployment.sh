#!/bin/bash

# 環境変数の設定
NAMESPACE="ebay-manager"
APP_NAME="ebay-manager-api"

# デプロイメントのステータス確認
echo "Checking deployment status..."
kubectl rollout status deployment/$APP_NAME -n $NAMESPACE

# ヘルスチェック
echo "Performing health check..."
HEALTH_CHECK_URL="http://api.example.com/health"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_CHECK_URL)

if [ $HTTP_STATUS -eq 200 ]; then
    echo "Health check passed"
else
    echo "Health check failed with status $HTTP_STATUS"
    exit 1
fi

# メトリクスの確認
echo "Checking metrics..."
kubectl top pods -n $NAMESPACE 