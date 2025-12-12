import "@xyflow/react/dist/style.css";
import "./global.css";

import { ReactFlowProvider } from "@xyflow/react";
import { createRoot } from "react-dom/client";

import Root from "./components/Root";
import { Provider } from "./components/ui/provider";

createRoot(document.getElementById("root")!).render(
  <Provider>
    <ReactFlowProvider>
      <Root />
    </ReactFlowProvider>
  </Provider>,
);
