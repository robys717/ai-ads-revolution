import React from "react";
import { createBrowserRouter } from "react-router-dom";
import AAR_Landing from "./App";
import Admin from "./pages/Admin";
import ErrorPage from "./pages/ErrorPage";
import NotFound from "./pages/NotFound";
import Legal from "./pages/Legal";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AAR_Landing/>,
    errorElement: <ErrorPage/>,
  },
  {
    path: "/admin",
    element: <Admin/>,
    errorElement: <ErrorPage/>,
  },
  {
    path: "/legal",
    element: <Legal/>,
    errorElement: <ErrorPage/>,
  },
  {
    path: "*",
    element: <NotFound/>,
  },
]);
