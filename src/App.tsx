import { TooltipProvider } from "@radix-ui/react-tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Route,
  BrowserRouter as Router,
  Routes
} from "react-router-dom";
import './App.css';
import { Toaster } from "./components/ui/toaster";
import Home from './pages/Home';
import Movies from "./pages/movies";
import KeyboardShortcuts from "./shortcuts/KeyboardShortcuts";
import SideMenu from "./ui/layouts/SideMenu";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function AppNoQueryClient() {
  return (
    <Router>
      <TooltipProvider>
        <KeyboardShortcuts />
        <SideMenu>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies/*" element={<Movies />} />
          </Routes>
        </SideMenu>
        <Toaster />
      </TooltipProvider>
    </Router>
  )
}

function App() {
  console.log('Starting app');
  return (
    <QueryClientProvider client={queryClient}>
      <AppNoQueryClient />
    </QueryClientProvider>
  );
}

export default App;
