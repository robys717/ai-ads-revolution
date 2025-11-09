import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";

const rootEl = document.getElementById("root") as HTMLElement;
ReactDOM.createRoot(rootEl).render(<RouterProvider router={router} />);
