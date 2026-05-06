import { Lock, Mail, User } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router"

import { useAuth } from "../hooks/useAuth"
import "./SignupForm.scss"

const SignupForm = () => {
  const { signup, signupPending, signupError } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      await signup({ name, email, password })
    } catch {
      // 에러는 signupError로 표시
    }
  }

  return (
    <form className="signup-form" onSubmit={handleSubmit}>
      <label className="fieldLabel">
        <span className="fieldIcon">
          <User size={22} />
        </span>
        <input
          className="fieldInput"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="이름"
          autoComplete="name"
        />
      </label>

      <label className="fieldLabel">
        <span className="fieldIcon">
          <Mail size={22} />
        </span>
        <input
          className="fieldInput"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="이메일"
          autoComplete="email"
        />
      </label>

      <label className="fieldLabel">
        <span className="fieldIcon">
          <Lock size={22} />
        </span>
        <input
          className="fieldInput"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="비밀번호"
          autoComplete="new-password"
        />
      </label>

      {signupError && <p className="errorText">{signupError.message}</p>}

      <button type="submit" disabled={signupPending} className="submitButton">
        {signupPending ? "가입 중…" : "회원가입"}
      </button>

      <nav className="linkNav">
        <span>이미 계정이 있으신가요?</span>
        <span className="divider" />
        <Link to="/login" className="navLink">로그인</Link>
      </nav>
    </form>
  )
}

export default SignupForm
