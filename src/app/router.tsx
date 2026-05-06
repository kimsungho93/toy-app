import { BrowserRouter, Navigate, Route, Routes } from "react-router"

import Home from "@/pages/Home"
import Login from "@/pages/Login"
import MenuManagement from "@/pages/MenuManagement"
import Signup from "@/pages/Signup"
import SystemLayout from "@/pages/SystemLayout"

import Layout from "./Layout"

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/system" element={<SystemLayout />}>
          <Route index element={<Navigate to="menu" replace />} />
          <Route path="menu" element={<MenuManagement />} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
)
