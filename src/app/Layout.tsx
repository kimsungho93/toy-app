import clsx from "clsx"
import { NavLink, Outlet } from "react-router"

import "./Layout.scss"

const navItems = [
  { to: "/", label: "홈", end: true },
  { to: "/system", label: "시스템 관리" },
]

const Layout = () => (
  <div className="app-layout">
    <nav className="topNav">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => clsx("topNavLink", isActive && "active")}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
    <main className="main">
      <Outlet />
    </main>
  </div>
)

export default Layout
