import clsx from "clsx"
import { NavLink, Outlet } from "react-router"

import "./SystemLayout.scss"

const subNav = [
  { to: "/system/menu", label: "메뉴 관리" },
]

const SystemLayout = () => (
  <div className="system-layout">
    <aside className="aside">
      <h2 className="asideTitle">시스템 관리</h2>
      <nav className="subNav">
        {subNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => clsx("subNavLink", isActive && "active")}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
    <div className="mainArea">
      <Outlet />
    </div>
  </div>
)

export default SystemLayout
