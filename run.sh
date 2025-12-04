#!/bin/bash

# Frontend 실행 스크립트
# Lian Shop Frontend (Next.js + React)

echo "🎨 Frontend 개발 서버를 시작합니다..."
echo "============================================"
echo "프로젝트: Lian Shop Frontend"
echo "프레임워크: Next.js + React"
echo "포트: 3001"
echo "============================================"
echo ""

# 현재 디렉토리 확인 (frontend 폴더에서 실행되어야 함)
if [ ! -f "package.json" ]; then
    echo "❌ package.json 파일을 찾을 수 없습니다."
    echo "   frontend 폴더에서 이 스크립트를 실행해주세요."
    exit 1
fi

# node_modules가 없으면 설치
if [ ! -d "node_modules" ]; then
    echo "📦 의존성을 설치합니다..."
    npm install
    echo ""
fi

# Next.js 개발 서버 실행
echo "🚀 Next.js 개발 서버를 시작합니다..."
echo "   접속 주소: http://localhost:3001"
echo ""
npm run dev

# 오류 발생 시 메시지 출력
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Frontend 서버 실행 중 오류가 발생했습니다."
    echo "   - Node.js가 설치되어 있는지 확인하세요."
    echo "   - npm install을 먼저 실행해보세요."
    exit 1
fi

