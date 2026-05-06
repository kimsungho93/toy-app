# CLAUDE.md

이 저장소에서 작업하는 Claude Code(claude.ai/code)를 위한 가이드.

## 작업 원칙

LLM 코딩 실수를 줄이기 위한 행동 원칙. 사소한 작업엔 판단 재량.
> **Tradeoff:** 속도보다 신중함.

**1. 코드 전에 생각** — 가정 명시, 불확실하면 묻는다. 해석이 여럿이면 묵묵히 고르지 않고 모두 제시. 더 단순한 방식이 있으면 push back. 불명확한 것은 멈추고 짚어 묻는다.

**2. 단순함 우선** — 요청 범위 밖 기능/추상화/유연성 X. 일어날 수 없는 시나리오에 에러 처리 X. 200줄 → 50줄 가능하면 다시 쓴다. "시니어가 over-engineered라 할까?" 자문.

**3. 외과적 변경** — 필요한 것만 건드린다. 인접 코드의 "개선"/리팩토링/포맷팅 변경 X. 기존 스타일을 따른다(내 취향과 달라도). 무관한 dead code는 *언급만* — 삭제 X. 내 변경이 만든 고아만 정리. *변경된 모든 줄이 사용자 요청에 직접 연결되는가?*

**4. 목표 기반 실행** — 작업을 *검증 가능한* 목표로 변환 ("동작하게" 같은 약한 기준 X). 다단계면 짧은 계획 + 단계별 검증을 명시. 강한 성공 기준은 독립 루프를 가능하게 함.

> 작동 신호: diff에 불필요한 변경이 줄고, over-engineering 재작성이 줄고, 실수 후가 아니라 *구현 전*에 명확화 질문이 나온다.

## 명령어

패키지 매니저: **pnpm** ([package.json](package.json)에 버전 핀).

- `pnpm dev` — Vite 개발 서버 (HMR)
- `pnpm build` — 타입 체크 + 빌드
- `pnpm lint` — ESLint
- `pnpm preview` — 프로덕션 빌드 미리보기

## 스택

Vite 7 + React 19 + TS 6, 컴포넌트별 SCSS (sass-embedded), React Router v7 (라이브러리 모드), TanStack Query + axios (cache / transport 분리).

## 아키텍처

**경로 alias `@/` → `src/`** — [vite.config.ts](vite.config.ts), [tsconfig.json](tsconfig.json), [tsconfig.app.json](tsconfig.app.json) 세 곳 동기화. TS 6에서 `baseUrl`이 deprecated되어 `paths`만 사용.

**스타일링 (SCSS)** — `sass-embedded` 사용 (Vite 7 modern compiler API 기본). [vite.config.ts](vite.config.ts)에서 `loadPaths`에 `src` 등록 → `@use 'styles/tokens'` 같은 절대 import 가능. (Windows에서 `sass`(JS) 빌드 시 stack overflow 발생해 `sass-embedded`로 교체.)

- 공유 partials: [src/styles/_tokens.scss](src/styles/_tokens.scss) (변수), [_mixins.scss](src/styles/_mixins.scss) (브레이크포인트 등), [_theme.scss](src/styles/_theme.scss) (전역 테마).
- 글로벌은 [src/index.scss](src/index.scss)만 — [main.tsx](src/main.tsx)에서 side-effect import.
- 컴포넌트별 `Foo.scss` — 동일 폴더에 두고 컴포넌트 상단에서 `import './Foo.scss'`. 모든 규칙은 **고유 kebab-case 루트 클래스**(예: `.login-page`, `.menu-node-row`)로 wrap해 충돌 방지. 내부 클래스명은 camelCase 유지. JSX 루트 element가 그 루트 클래스를 가진다. CSS Modules 미사용.
- 조건부 클래스 결합은 `clsx` — `className={clsx("toolButton", isDanger && "toolButtonDanger")}`.

## 폴더 구조

Feature-sliced:

```
src/
  app/                composition root — App.tsx, router.tsx, providers.tsx, Layout.tsx
  pages/              라우트 페이지 (평평, Page 접미사 X)
  features/<domain>/
    api/              백엔드 인터페이스
    components/
    hooks/            도메인 훅 (TanStack Query 포함)
    model/            타입 + 도메인 로직
    utils/            도메인 헬퍼
    index.ts          barrel — 외부 노출 surface만
  shared/
    api/              공용 인프라 (queryClient, httpClient)
    utils/            범용 헬퍼
    hooks/, constants/
  styles/             공유 SCSS partials (_tokens, _mixins, _theme)
  index.scss, main.tsx
```

규칙:
- 피처는 self-contained. **다른 피처 import는 `<feature>/index.ts`만 통해서.**
- `shared/`는 범용 코드만. 도메인 종속은 피처로.
- `pages/`는 레이아웃 조립 + 훅 호출만 (비즈니스 로직 X).
- 네이밍: 컴포넌트 `PascalCase.tsx`, 그 외 `camelCase.ts`. `pages/`엔 `Page` 접미사 X.
- **화살표 함수 전용** — `const foo = () => …`. [eslint.config.js](eslint.config.js)의 `func-style: expression`로 강제. Default export는 const 선언 후 별도 줄에 `export default Foo` (익명 default는 Fast Refresh 깸).

## HTTP 계층

3단 분리:
- [shared/api/httpClient.ts](src/shared/api/httpClient.ts) — 단일 axios 인스턴스. baseURL(`VITE_API_BASE`), 헤더, timeout, **모든 인터셉터** 소유.
- `features/<domain>/api/<domain>Api.ts` — 도메인 엔드포인트, 파싱된 데이터 반환.
- `features/<domain>/hooks/use<Domain>.ts` — TanStack Query 훅으로 api 함수 wrap.

**컴포넌트/훅은 `axios`/`httpClient`를 직접 import하지 않음** — 피처의 `api/`만 사용.

menu 피처는 예외 — `menuApi.ts`가 localStorage 사용. API 시그니처가 동일해서 백엔드 전환 시 caller 변경 불필요.

## 환경 변수

Vite mode-aware 파일:
- [.env.development](.env.development) — `pnpm dev` 시 로드. `VITE_API_BASE=http://localhost:8080`.
- [.env.production](.env.production) — `pnpm build` 시 로드. 배포된 백엔드 URL.
- `.env`, `.env.*.local` — 개인 오버라이드용, gitignored.

**시크릿 절대 금지** — `VITE_*` 접두사 변수는 모두 클라이언트 번들에 박힘. API key 등은 BFF/배포 플랫폼 환경 변수로 처리.

## Composition root (app/)

[App.tsx](src/app/App.tsx)는 `<Providers><AppRouter /></Providers>`만.
- [providers.tsx](src/app/providers.tsx) — 글로벌 프로바이더 추가 위치.
- [router.tsx](src/app/router.tsx) — 라우트 추가 위치.

순서: Query 바깥, Router 안쪽 (라우트 컴포넌트가 Query 훅을 써야 함).

## 섹션 레이아웃

최상위 [Layout](src/app/Layout.tsx)이 상단 nav, 섹션 레이아웃이 `pages/<Section>Layout.tsx`(예: [SystemLayout](src/pages/SystemLayout.tsx))로 sub-nav 소유. 트리: `Layout > <Section>Layout > <page>`. 현재 `/system/*`만 존재. 시스템 형제 기능 추가 시 `SystemLayout.tsx`의 `subNav`와 [router.tsx](src/app/router.tsx)에 항목 추가. 최상위 Layout은 앱 고유의 nav를 owning 하므로 composition root(`app/`)에 위치 — `shared/`에 두지 않음.

## 메뉴 트리 피처

[src/features/menu/](src/features/menu/) — 피처 레이아웃 표준 예시:
- [api/menuApi.ts](src/features/menu/api/menuApi.ts) — localStorage(`menu-tree-v1`). 백엔드 도입 시 이 파일만 교체.
- [utils/treeOperations.ts](src/features/menu/utils/treeOperations.ts) — 순수 트리 변형 함수. 컴포넌트는 결과 트리를 mutation에 넘김 (직접 mutate X).
- [hooks/useMenuTree.ts](src/features/menu/hooks/useMenuTree.ts) — query + 낙관적 mutation, 트리 전체 저장.
- [hooks/useMenuTreeEditor.ts](src/features/menu/hooks/useMenuTreeEditor.ts) — 에디터의 모든 상태(focus/edit/expand)와 액션을 묶은 훅. `containerRef`는 컴포넌트가 소유하고 파라미터로 주입(React 19 `react-hooks/refs` 룰).
- [components/MenuTreeEditor.tsx](src/features/menu/components/MenuTreeEditor.tsx) — 훅이 반환한 것을 받아 JSX만 그림. 키보드는 포커스/편집 전용, 구조 변경은 D-pad 툴바. 최상위 추가는 UI 비노출 — 빈 트리는 localStorage로 시드.
- [index.ts](src/features/menu/index.ts) — `MenuTreeEditor`만 export. 페이지는 `@/features/menu`로 import.

## React 규칙

범용 React/TS 패턴(컴포넌트 책임, 커스텀 훅, props 네이밍, useEffect 사용처, 렌더링 최적화 등)은 [.claude/skills/react-rules/SKILL.md](.claude/skills/react-rules/SKILL.md)에 분리되어 있다. 컴포넌트/훅을 작성하거나 리뷰할 때 그 skill의 규칙을 따른다.

## README 발췌

React Compiler는 의도적으로 비활성화 (dev/build 성능 영향). ESLint는 type-aware 룰 미사용 — 강화 옵션은 README 참고.
