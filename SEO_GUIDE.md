# 리안샵 SEO 최적화 가이드

## 📋 목차
1. [적용된 SEO 최적화](#적용된-seo-최적화)
2. [구글 검색 노출 방법](#구글-검색-노출-방법)
3. [네이버 검색 노출 방법](#네이버-검색-노출-방법)
4. ["리안" 검색어 최적화](#리안-검색어-최적화)
5. [검증 방법](#검증-방법)

---

## 🎯 적용된 SEO 최적화

### 1. 파일 기반 메타데이터

#### ✅ `robots.ts`
- 검색 엔진 크롤러에게 어떤 페이지를 크롤링할지 안내
- 위치: `/frontend/app/robots.ts`
- Googlebot, Yeti(네이버) 등 주요 봇 설정 완료

#### ✅ `sitemap.ts`
- 동적으로 사이트맵 생성
- 위치: `/frontend/app/sitemap.ts`
- 메인 페이지와 모든 상품 상세 페이지 자동 포함

#### ✅ `manifest.ts`
- PWA 매니페스트 (모바일 최적화)
- 위치: `/frontend/app/manifest.ts`

### 2. 메타데이터 최적화

#### 📄 메인 페이지 (`app/page.tsx`)
```typescript
- 제목: "리안샵 - 미니멀 라이프스타일 쇼핑몰"
- 설명: "리안(Lian)에서 프리미엄 상품을 만나보세요"
- 키워드: 리안, 리안샵, lian, lian shop 등
- Open Graph 이미지 설정
- JSON-LD 구조화된 데이터 (Organization, Website, ItemList)
```

#### 📄 상품 상세 페이지 (`app/product/[id]/page.tsx`)
```typescript
- 동적 제목: "{상품명} - 리안샵"
- 동적 설명 및 이미지
- Open Graph / Twitter Cards 지원
- JSON-LD 구조화된 데이터 (Product, Breadcrumb)
```

#### 📄 루트 레이아웃 (`app/layout.tsx`)
```typescript
- 기본 메타데이터 설정
- Open Graph 기본 이미지
- Twitter Cards 지원
- Google / 네이버 사이트 인증 준비
```

### 3. 성능 최적화

#### `next.config.ts` 설정
- 이미지 최적화 (WebP, AVIF)
- 보안 헤더 추가
- 캐싱 전략
- 압축 활성화

---

## 🔍 구글 검색 노출 방법

### 1단계: Google Search Console 등록

1. **Google Search Console 접속**
   - https://search.google.com/search-console
   - Google 계정으로 로그인

2. **속성 추가**
   - "속성 추가" 클릭
   - 도메인 또는 URL 접두어 선택
   - 예: `https://lian-shop.com` 입력

3. **소유권 확인**
   
   **방법 1: HTML 태그 (권장)**
   - Search Console에서 메타 태그 복사
   - `frontend/app/layout.tsx` 파일에서 `verification` 섹션 수정:
   ```typescript
   verification: {
     google: 'your-google-verification-code', // 여기에 복사한 코드 입력
   }
   ```

   **방법 2: HTML 파일**
   - 제공된 HTML 파일 다운로드
   - `frontend/public/` 폴더에 업로드

4. **사이트맵 제출**
   - Search Console > "Sitemaps" 메뉴
   - 사이트맵 URL 입력: `https://your-domain.com/sitemap.xml`
   - "제출" 클릭

### 2단계: 색인 요청

1. **URL 검사 도구 사용**
   - Search Console 상단 검색창에 URL 입력
   - "색인 생성 요청" 클릭
   
2. **주요 URL 제출**
   ```
   https://your-domain.com/
   https://your-domain.com/product/1
   https://your-domain.com/product/2
   ```

### 3단계: 결과 확인 (1-3일 소요)
- Search Console > "실적" 메뉴에서 노출 확인
- 구글에서 `site:your-domain.com` 검색으로 색인 확인

---

## 🟢 네이버 검색 노출 방법

### 1단계: 네이버 서치어드바이저 등록

1. **네이버 서치어드바이저 접속**
   - https://searchadvisor.naver.com/
   - 네이버 계정으로 로그인

2. **웹마스터 도구 > 사이트 등록**
   - "사이트 추가" 클릭
   - URL 입력: `https://lian-shop.com`

3. **소유권 확인**
   
   **방법 1: HTML 태그 (권장)**
   - 서치어드바이저에서 메타 태그 복사
   - `frontend/app/layout.tsx`의 `<head>` 섹션에 추가:
   ```typescript
   // layout.tsx의 metadata 설정에 추가
   other: {
     'naver-site-verification': 'your-naver-verification-code',
   }
   ```

   **방법 2: HTML 파일**
   - 제공된 HTML 파일 다운로드
   - `frontend/public/` 폴더에 업로드

4. **사이트맵 제출**
   - "요청" > "사이트맵 제출" 메뉴
   - URL 입력: `https://your-domain.com/sitemap.xml`

5. **RSS 제출 (선택사항)**
   - 상품이 자주 업데이트되면 RSS 피드도 제출 권장

### 2단계: 수집 요청

1. **웹 페이지 수집 요청**
   - "요청" > "웹 페이지 수집 요청" 메뉴
   - 주요 URL 직접 제출

2. **주요 URL 제출**
   ```
   https://your-domain.com/
   https://your-domain.com/product/1
   https://your-domain.com/product/2
   ```

### 3단계: 결과 확인 (2-7일 소요)
- 네이버 검색창에 `site:your-domain.com` 입력하여 확인
- 서치어드바이저에서 "통계" 메뉴로 수집 현황 확인

---

## 🎯 "리안" 검색어 최적화

### 현재 적용된 최적화

#### 1. **제목 태그에 "리안" 포함**
```typescript
// 메인 페이지
title: "리안샵 - 미니멀 라이프스타일 쇼핑몰"

// 상품 페이지
title: "{상품명} - 리안샵"
```

#### 2. **메타 설명에 "리안" 강조**
```typescript
description: "리안(Lian)에서 프리미엄 상품을 만나보세요..."
```

#### 3. **키워드 최적화**
```typescript
keywords: ['리안', '리안샵', 'lian', 'lian shop', ...]
```

#### 4. **본문 콘텐츠에 자연스럽게 포함**
```html
<h1>LIAN MINIMAL LIFESTYLE.</h1>
<h2>리안샵 추천 상품</h2>
<p>리안(Lian)에서 프리미엄 상품을 만나보세요...</p>
```

#### 5. **JSON-LD에 브랜드명 포함**
```json
{
  "@type": "Organization",
  "name": "Lian Shop",
  "brand": "Lian Shop"
}
```

### 추가 최적화 전략

#### 1. **브랜드 일관성 유지**
- 모든 페이지에서 "리안샵", "Lian Shop" 표기 통일
- SNS 계정명도 동일하게 설정

#### 2. **콘텐츠 강화**
- 회사 소개 페이지 추가 (About 페이지)
- "리안" 브랜드 스토리 작성
- 블로그/뉴스 섹션에 "리안" 키워드 포함

#### 3. **외부 링크 확보** (오프사이트 SEO)
- SNS 프로필에 공식 사이트 링크
- 네이버 블로그/카페에 브랜드 소개
- 제품 리뷰 블로그 작성 유도

#### 4. **로컬 SEO**
- Google My Business 등록
- 네이버 플레이스 등록
- 주소/연락처 정보 일관되게 유지

---

## ✅ 검증 방법

### 1. 메타데이터 확인

**개발 환경에서 확인:**
```bash
cd frontend
npm run dev
```

**브라우저 개발자 도구로 확인:**
1. 페이지 우클릭 > "검사"
2. `<head>` 태그 확인
3. 메타 태그, JSON-LD 스크립트 확인

### 2. robots.txt 확인
```
http://localhost:3001/robots.txt
```

### 3. sitemap.xml 확인
```
http://localhost:3001/sitemap.xml
```

### 4. SEO 점검 도구

#### Google의 Rich Results Test
- https://search.google.com/test/rich-results
- URL 입력하여 구조화된 데이터 확인

#### PageSpeed Insights
- https://pagespeed.web.dev/
- 성능 및 SEO 점수 확인

#### Lighthouse (Chrome DevTools)
1. Chrome 개발자 도구 열기 (F12)
2. "Lighthouse" 탭
3. SEO 카테고리 선택 후 분석

### 5. 실제 검색 확인

**1-2주 후 확인:**
```
구글: "리안샵" 검색
네이버: "리안샵" 검색
구글: "리안 쇼핑몰" 검색
네이버: "리안 온라인몰" 검색
```

**색인 확인:**
```
구글: site:your-domain.com
네이버: site:your-domain.com
```

---

## 🚀 배포 전 체크리스트

### 환경 변수 설정
```bash
# .env.local 파일 생성
NEXT_PUBLIC_SITE_URL=https://your-actual-domain.com
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

### 필수 이미지 준비
```
frontend/public/
├── favicon.ico          # 파비콘
├── icon-192.png        # PWA 아이콘 (192x192)
├── icon-512.png        # PWA 아이콘 (512x512)
└── og-image.png        # Open Graph 이미지 (1200x630)
```

### Open Graph 이미지 생성 가이드
- 크기: 1200 x 630 픽셀
- 포맷: PNG 또는 JPG
- 용량: 8MB 이하
- 내용: 브랜드 로고 + "리안샵" 텍스트

### robots.txt 수동 확인
```bash
# 배포 후
curl https://your-domain.com/robots.txt
```

### sitemap.xml 수동 확인
```bash
# 배포 후
curl https://your-domain.com/sitemap.xml
```

---

## 📊 SEO 성과 모니터링

### 주요 지표 추적

1. **Google Search Console**
   - 클릭 수
   - 노출 수
   - 평균 게재 순위
   - 검색어별 실적

2. **네이버 서치어드바이저**
   - 검색 유입
   - 수집 페이지 수
   - 검색어 순위

3. **Google Analytics** (선택사항)
   - 자연 검색 유입
   - 이탈률
   - 평균 체류 시간

### 개선 주기
- **일주일마다**: Search Console 확인
- **한 달마다**: 키워드 실적 분석
- **분기마다**: 전체 SEO 전략 재검토

---

## 🎓 추가 학습 자료

### 공식 문서
- [Google 검색 센터](https://developers.google.com/search)
- [Next.js Metadata](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [네이버 검색 등록 가이드](https://searchadvisor.naver.com/guide)

### 키워드 리서치 도구
- Google Keyword Planner
- 네이버 키워드 도구
- Google Trends

---

## 💡 FAQ

**Q: 검색에 노출되는데 얼마나 걸리나요?**
A: 구글은 1-3일, 네이버는 2-7일 정도 소요됩니다. 신규 도메인은 더 오래 걸릴 수 있습니다.

**Q: "리안"으로 검색했을 때 상위에 노출되려면?**
A: 
1. 지속적인 콘텐츠 업데이트
2. 외부 링크 확보 (백링크)
3. SNS 활동 활발히 하기
4. 사용자 경험 개선 (빠른 로딩, 모바일 최적화)

**Q: 검색 순위를 올리는 가장 빠른 방법은?**
A: 
1. 네이버 블로그/카페 활동
2. 소셜 미디어 마케팅
3. 구글/네이버 광고 병행 (단기)
4. 품질 좋은 콘텐츠 지속 생산 (장기)

**Q: 상품이 추가되면 자동으로 사이트맵에 포함되나요?**
A: 네! `sitemap.ts`가 동적으로 상품 목록을 가져와 자동으로 사이트맵을 생성합니다.

---

## 📞 지원

문제가 있거나 추가 최적화가 필요하면 개발팀에 문의하세요.

**작성일**: 2024년 12월
**버전**: 1.0

