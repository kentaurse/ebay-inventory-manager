#!/bin/bash

# 環境変数の読み込み
source .env

# イメージのビルドとプッシュ
docker build -t $DOCKER_REGISTRY/ebay-manager-api:$VERSION ./server
docker build -t $DOCKER_REGISTRY/ebay-manager-client:$VERSION ./client

docker push $DOCKER_REGISTRY/ebay-manager-api:$VERSION
docker push $DOCKER_REGISTRY/ebay-manager-client:$VERSION

# Kubernetesマニフェストの適用
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/api-deployment.yaml
kubectl apply -f k8s/api-service.yaml
kubectl apply -f k8s/client-deployment.yaml
kubectl apply -f k8s/client-service.yaml
kubectl apply -f k8s/db-statefulset.yaml
kubectl apply -f k8s/redis-statefulset.yaml

# デプロイメントのステータス確認
kubectl rollout status deployment/ebay-manager-api
kubectl rollout status deployment/ebay-manager-client 