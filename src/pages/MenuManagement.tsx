import { MenuTreeEditor } from "@/features/menu"

import "./MenuManagement.scss"

const MenuManagement = () => (
  <section className="menu-management-page">
    <h1 className="title">메뉴 관리</h1>
    <MenuTreeEditor />
  </section>
)

export default MenuManagement
