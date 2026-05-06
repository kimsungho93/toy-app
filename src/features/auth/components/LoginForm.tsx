import clsx from "clsx";
import { Lock, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import { useAuth } from "../hooks/useAuth";
import "./LoginForm.scss";

const SAVED_EMAIL_KEY = "hc-saved-email";

const LoginForm = () => {
  const { login, loginPending, loginError } = useAuth();
  const [email, setEmail] = useState(() => localStorage.getItem(SAVED_EMAIL_KEY) ?? "");
  const [password, setPassword] = useState("");
  const [saveId, setSaveId] = useState(() => !!localStorage.getItem(SAVED_EMAIL_KEY));
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);

  const emailFocused = focusedField === "email";
  const passwordFocused = focusedField === "password";

  return (
    <form
      className="login-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (saveId) localStorage.setItem(SAVED_EMAIL_KEY, email);
        else localStorage.removeItem(SAVED_EMAIL_KEY);
        try {
          await login({ email, password });
        } catch {
          // 에러는 loginError로 표시
        }
      }}
    >
      <label className={clsx("fieldLabel", emailFocused && "focused")}>
        <span className={clsx("fieldIcon", emailFocused && "focused")}>
          <User size={22} />
        </span>
        <input
          className="fieldInput"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setFocusedField("email")}
          onBlur={() => setFocusedField(null)}
          required
          placeholder="이메일"
          autoComplete="username"
        />
      </label>

      <label className={clsx("fieldLabel", passwordFocused && "focused")}>
        <span className={clsx("fieldIcon", passwordFocused && "focused")}>
          <Lock size={22} />
        </span>
        <input
          className="fieldInput"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setFocusedField("password")}
          onBlur={() => setFocusedField(null)}
          required
          placeholder="비밀번호"
          autoComplete="current-password"
        />
      </label>

      {loginError && <p className="errorText">{loginError.message}</p>}

      <div className="actionRow">
        <label className="toggleLabel">
          <input
            className="toggleHiddenInput"
            type="checkbox"
            checked={saveId}
            onChange={(e) => setSaveId(e.target.checked)}
          />
          <span className={clsx("toggleTrack", saveId && "active")}>
            <span className={clsx("toggleThumb", saveId && "active")} />
          </span>
          <span className="toggleText">아이디 저장</span>
        </label>

        <button type="submit" disabled={loginPending} className="submitButton">
          {loginPending ? "로그인 중…" : "로그인"}
        </button>
        <div />
      </div>

      <nav className="linkNav">
        <button type="button" className="navButton">아이디 찾기</button>
        <span className="divider" />
        <button type="button" className="navButton">비밀번호 찾기</button>
        <span className="divider" />
        <Link to="/signup" className="navLink">회원가입</Link>
      </nav>
    </form>
  );
};

export default LoginForm;
