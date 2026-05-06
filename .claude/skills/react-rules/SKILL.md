---
name: react-rules
description: Apply when writing or reviewing React/TypeScript components, hooks, or features. Project-specific conventions (folder structure, file naming, arrow-function-only, axios layering) live in CLAUDE.md — this skill covers general React patterns that don't repeat what's in CLAUDE.md.
---

# React 코드 규칙

이 프로젝트의 *결정사항*(폴더 구조, 화살표 함수 강제, Page 접미사 금지, axios 레이어링 등)은 [CLAUDE.md](../../../CLAUDE.md)를 따른다. 아래는 그 위에 얹는 범용 React 규칙이다.

## 컴포넌트 책임

- 한 컴포넌트는 하나의 명확한 책임만 갖는다.
- 컴포넌트는 위에서 아래로 자연스럽게 읽히도록 작성한다 — 핸들러/계산은 JSX 위쪽에서 선언하고, JSX는 단순한 트리만 남긴다.
- UI 컴포넌트는 props 기반의 순수 컴포넌트로 작성한다 — API 호출, 도메인 로직, 복잡한 상태 변경을 직접 다루지 않는다.
- 불필요한 추상화보다 읽기 쉬운 구조를 우선한다.

## 커스텀 훅

- 컴포넌트 로직이 길어지면 커스텀 훅으로 분리한다.
- API 호출, 상태 관리, 이벤트 핸들러 로직은 훅으로 옮긴다.
- 훅은 JSX를 반환하지 않는다.
- 상태와 동작을 명확한 이름으로 반환한다.

## 타입과 매퍼

- `any`를 피하고 명확한 타입을 작성한다.
- 허용 가능한 문자열 값은 `string` 대신 union 타입으로 제한한다 (`type Status = 'idle' | 'loading' | 'done'`).
- key-value 매핑은 `Record<K, V>` 타입을 사용한다.
- 서버 응답 타입과 화면에서 사용하는 타입이 다르면 분리하고, 변환은 mapper 함수로 처리한다 (`features/<domain>/utils/`).

## Props 네이밍

- `data`, `item`, `info`, `config`, `options` 같은 모호한 이름을 피한다 — 역할이 드러나는 이름을 쓴다.
- 이벤트 props는 `on` prefix(`onUserSelect`), 내부 핸들러는 `handle` prefix(`handleUserSelect`).
- boolean은 `is` / `has` / `can` / `should` prefix.
- boolean props가 많아지면 `variant` / `mode` 같은 union 타입으로 정리한다.

```tsx
// Bad
<UserTable data={data} options={options} />

// Good
<UserTable
  users={users}
  selectedUserId={selectedUserId}
  onUserSelect={handleUserSelect}
/>
```

## 상태 위치

- 상태는 사용하는 곳에 가깝게 둔다.
- 여러 자식이 공유하면 가장 가까운 공통 부모로 올린다.
- 입력값, 모달 open, 테이블 selection 같은 지역 상태를 무리하게 전역으로 올리지 않는다.
- 상태 변경 케이스가 많으면 `useReducer`를 고려한다.

## useEffect

- 외부 시스템(DOM, 구독, 타이머)과 동기화할 때만 사용한다.
- 이벤트 처리 로직을 `useEffect`에 넣지 않는다 — 핸들러로.
- 계산 가능한 값은 `useState + useEffect`로 만들지 않는다.
- 의존성 배열을 임의로 비워 경고를 숨기지 않는다.
- cleanup이 필요하면 cleanup 함수를 반드시 반환한다.

```tsx
// Bad
const [fullName, setFullName] = useState('')
useEffect(() => {
  setFullName(`${firstName} ${lastName}`)
}, [firstName, lastName])

// Good
const fullName = `${firstName} ${lastName}`
```

## 조건부 렌더링

- loading / error / empty 상태는 early return을 우선 고려한다.
- JSX 안에 길고 복잡한 조건식을 작성하지 않는다 — 의미 있는 boolean 변수로 빼낸다.

```tsx
if (isLoading) return <p>조회 중…</p>
if (errorMessage) return <p>{errorMessage}</p>
if (users.length === 0) return <p>데이터 없음</p>

return <UserTable users={users} />
```

## 리스트 렌더링

- `key`로 index를 쓰지 않는다 — 서버에서 내려오는 안정적 고유 id 사용.
- map 내부 JSX가 복잡하면 별도 컴포넌트로 분리한다.

## 분리 기준

다음 신호가 보이면 컴포넌트/훅/유틸로 분리:

- 파일이 길어진다
- 한 컴포넌트가 여러 책임을 가진다
- API 호출과 UI 렌더링이 한 파일에 섞인다
- 동일한 JSX 패턴이 반복된다
- props가 너무 많아진다
- 코드를 이해하려면 파일을 위아래로 계속 이동해야 한다

분리 방향:
- 상태/로직 → 커스텀 훅
- API 호출 → `api/`
- 타입 → `model/`
- 데이터 변환 → mapper (`utils/`)
- 반복 JSX → 컴포넌트

## JS/TS 관용구

- `var` 금지. 기본 `const`, 재할당이 필요할 때만 `let`.
- optional chaining(`?.`), nullish coalescing(`??`), destructuring, spread를 적극 사용한다.
- 기본값 처리는 `||` 대신 `??`를 우선 고려한다 (`||`는 `0`/`''`/`false`도 falsy로 처리됨).
- 배열/객체 원본을 직접 변경하지 않는다 — 불변성 유지.
- `arr.filter(...)[0]` 대신 `arr.find(...)`, `arr.filter(...).length > 0` 대신 `arr.some(...)`를 쓴다.

## 렌더링 최적화

- 먼저 구조를 단순하게 만든 뒤 필요한 곳에만 적용한다 — `useMemo` / `useCallback` / `React.memo` 남용 금지.
- 자주 바뀌는 상태와 거의 안 바뀌는 UI를 같은 컴포넌트에 섞지 않는다.
- 무거운 계산은 `useMemo`, memoized 자식에 넘기는 콜백은 `useCallback`을 고려한다.
- 객체/배열/함수 리터럴을 props로 직접 넘겨서 매 렌더 새 참조가 만들어지지 않게 주의한다.
- 큰 리스트는 pagination, infinite scroll, virtualization 고려.
- Context 값이 자주 바뀌면 구독 컴포넌트 전체가 리렌더되므로 Context를 쪼개거나 상태 위치를 재배치한다.
- 서버 상태를 직접 전역 상태로 복사하지 않는다 — TanStack Query가 캐시 역할을 한다.
- 추측으로 최적화하지 말고 React DevTools Profiler로 확인한 뒤 적용한다.
