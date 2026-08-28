/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/ui/resizable";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Film, Home } from "lucide-react";
import { useDefaultLayout } from "react-resizable-panels";
import { NavLink } from 'react-router-dom';

interface SideMenuProps { children: any }
export default function SideMenu({ children }: SideMenuProps) {
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "layout",
    storage: localStorage
  });

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="flex w-full"
      defaultLayout={defaultLayout}
      onLayoutChanged={onLayoutChanged}
    >
      <ResizablePanel id="menu" defaultSize="25%">
        <Menu />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel id="content" defaultSize="75%">
        <div className="p-4 w-full h-full">
          {children}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

// Menu at the top with navigation buttons
function Menu() {
  return (
    <nav className="bg-gray-900 flex-col h-full pt-4 text-gray-500">
      <NavButton icon={<Home size={16} />} to='/' title="Home" description="Home page" shortcut="H" />
      <NavButton icon={<Film size={16} />} to='/movies' title="Movies" description="Movies" shortcut="M" />
    </nav>
  )
}

// navigation button on menu
interface NavButtonProps { to: string, title: string, description?: string, shortcut?: string, exact?: boolean, icon?: any }
function NavButton({ to, title, icon, description, shortcut }: NavButtonProps) {
  return <div className="flex flex-col">
    <Tooltip>
      <TooltipTrigger dir="right" tabIndex={-1}>
        <NavLink data-tip data-for={title} to={to} className={({ isActive }) =>
          ` focus-visible:ring-ring min-w-10 items-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 my-1 mx-4 px-3 py-2 rounded text-sm font-medium hover:bg-gray-800 flex witems-center space-x-1 ${isActive && "bg-gray-800"}`}>
          <span className="text-white">{icon}</span><span className="text-gray-300 overflow-hidden">{title}</span></NavLink>
      </TooltipTrigger>
      <TooltipContent side="right">
        <span>
          {description}
          {shortcut && <span className="text-xs text-gray-200"> · <code className="bg-gray-700 inset-0 px-1 py-0.5 rounded-sm text-xs">G</code> then <code className="bg-gray-700 inset-0 px-1 py-0.5 rounded-sm text-xs">{shortcut}</code></span>}
        </span>
      </TooltipContent>
    </Tooltip>
  </div>
}
