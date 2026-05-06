import { Heart, Star, Zap } from "lucide-react"

import { LoginForm } from "@/features/auth"

import "./Login.scss"

const features = [
  { icon: Zap, title: "내 방식대로", sub: "나만의 속도로" },
  { icon: Star, title: "내가 원하는 대로", sub: "자유롭고 유연하게" },
  { icon: Heart, title: "오늘도 나답게", sub: "후회 없이 즐겁게" },
]

const Login = () => (
  <div className="login-page">
    <div className="decoFilled" />
    <div className="decoOutlined" />

    <header className="header">
      <span className="brand">HC</span>
    </header>

    <section className="content">
      <div className="headlineGroup">
        <span className="sparkle1">✦</span>
        <span className="sparkle2">✦</span>

        <div className="headlineWrap">
          <h1 className="headline">
            하고싶은<span>대로</span>해
          </h1>
          <div className="underline" />
        </div>

        <div className="accentBars">
          <span className="barTall" />
          <span className="barShort" />
        </div>

        <p className="tagline">
          생각한 대로, 원하는 대로.
          <br />
          오늘도 <strong>나답게, 하고 싶은 대로 해!</strong>
        </p>
      </div>

      <LoginForm />
    </section>

    <div className="featureStrip">
      {features.map(({ icon: Icon, title, sub }) => (
        <div key={title} className="featureItem">
          <span className="featureIcon">
            <Icon size={34} />
          </span>
          <div>
            <strong className="featureTitle">{title}</strong>
            <span className="featureSub">{sub}</span>
          </div>
        </div>
      ))}
    </div>

    <section className="mascotArea">
      <div className="bubbleSmall" />
      <div className="bubbleMid" />
      <div className="bubbleBig" />
      <span className="mascotSparkle">✦</span>
      <div className="mascotDots">
        <span className="mascotDot" />
        <span className="mascotDot" />
      </div>
      <img className="mascotImage" src="/mascot-transparent.png" alt="하고싶은대로해 캐릭터" />
    </section>
  </div>
)

export default Login
