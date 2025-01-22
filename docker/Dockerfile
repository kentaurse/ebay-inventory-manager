# ベースイメージ
FROM node:18-alpine

# 作業ディレクトリの設定
WORKDIR /app

# パッケージファイルのコピー
COPY package*.json ./

# 依存関係のインストール
RUN npm install

# ソースコードのコピー
COPY . .

# TypeScriptのビルド
RUN npm run build

# アプリケーションの起動
CMD ["npm", "start"] 