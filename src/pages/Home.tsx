import { useTest } from "@/features/test"

import "./Home.scss"

const Home = () => {
  const { data, isLoading, error } = useTest()

  if (isLoading) return <h1 className="home-page">불러오는 중…</h1>
  if (error) return <h1 className="home-page">에러: {error.message}</h1>
  return <h1 className="home-page">{data}</h1>
}

export default Home
