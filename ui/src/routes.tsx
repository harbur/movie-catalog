import { TooltipProvider } from "@radix-ui/react-tooltip";
import { createBrowserRouter, Outlet, useParams } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import QueryParams from "@/models/queryParams";
import Home from "@/pages/Home";
import Create from "@/pages/movies/create";
import Edit from "@/pages/movies/edit";
import { List } from "@/pages/movies/list";
import View from "@/pages/movies/view";
import KeyboardShortcuts from "@/shortcuts/KeyboardShortcuts";
import SideMenu from "@/ui/layouts/SideMenu";

// The route config lives here, in its own file, rather than in App.tsx.
// Routes carry no loaders: data stays in react-query, routes only say which
// page a URL renders.

function RootLayout() {
  return (
    <TooltipProvider>
      <KeyboardShortcuts />
      <SideMenu>
        <Outlet />
      </SideMenu>
      <Toaster />
    </TooltipProvider>
  );
}

function ViewParams() {
  const { id } = useParams<QueryParams>();
  return <View id={+id!} />;
}

function EditParams() {
  const { id } = useParams<QueryParams>();
  return <Edit id={+id!} />;
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Home /> },
      {
        path: "/movies",
        children: [
          { index: true, element: <List /> },
          { path: "new", element: <Create /> },
          { path: ":id/edit", element: <EditParams /> },
          { path: ":id", element: <ViewParams /> },
        ],
      },
    ],
  },
]);
