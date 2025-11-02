import React from "react";
import { createBrowserRouter } from "react-router-dom";
import AAR_Landing from "./App";
import Admin from "./pages/Admin";

export const router = createBrowserRouter([
  { path: "/", element: <AAR_Landing/> },
  { path: "/admin", element: <Admin/> },
]);
