import { SignupForm } from "@/features/auth"

import "./Signup.scss"

const Signup = () => (
  <div className="signup-page">
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
            지금 <span>바로</span>해
          </h1>
          <div className="underline" />
        </div>

        <div className="accentBars">
          <span className="barTall" />
          <span className="barShort" />
        </div>

        <p className="tagline">
          간단하게 가입하고,
          <br />
          <strong>하고 싶은 대로 시작해봐요!</strong>
        </p>
      </div>

      <SignupForm />
    </section>

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

export default Signup
