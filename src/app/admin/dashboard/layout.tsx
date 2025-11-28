'use client'

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Image,
  Users,
  Settings,
  LogOut,
  Menu,
  Package,
  MessageSquare,
  Navigation,
  Home,
  X,
  Building2,
  Shield,
  Zap
} from "lucide-react"
import { useState } from "react"
import { OrganizationSwitcher } from "@/components/organization-switcher"

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  {
    name: 'Content', icon: FileText, children: [
      { name: 'Posts', href: '/admin/content/posts', icon: FileText },
      { name: 'Pages', href: '/admin/content/pages', icon: FileText },
      { name: 'Products', href: '/admin/content/products', icon: Package },
    ]
  },
  { name: 'Media', href: '/admin/media', icon: Image },
  { name: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
  { name: 'Menus', href: '/admin/menus', icon: Navigation },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Roles', href: '/admin/roles', icon: Shield },
  { name: 'Organizations', href: '/admin/organizations', icon: Building2 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-72 bg-[#1a1a1a] shadow-2xl">
            <div className="flex items-center justify-between h-16 px-5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#fdc501] rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-black" />
                </div>
                <span className="text-lg font-bold text-white">Grood</span>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Admin</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav navigation={navigation} isActive={isActive} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-[#1a1a1a] overflow-y-auto">
          <div className="flex items-center gap-3 h-16 px-5 border-b border-white/10">
            <div className="w-9 h-9 bg-[#fdc501] rounded-lg flex items-center justify-center shadow-lg shadow-[#fdc501]/20">
              <Zap className="h-5 w-5 text-black" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">Grood</span>
              <span className="ml-2 text-xs font-medium text-[#fdc501] uppercase tracking-wider">Admin</span>
            </div>
          </div>
          <SidebarNav navigation={navigation} isActive={isActive} />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200 shadow-sm">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="px-4 border-r border-gray-200 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#fdc501] lg:hidden transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 flex justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex-1 flex items-center gap-4">
              <Link 
                href="/" 
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <Home className="h-4 w-4" />
                <span className="text-sm font-medium">View Site</span>
              </Link>
              <div className="h-6 w-px bg-gray-200" />
              <OrganizationSwitcher />
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <UserMenu />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

function SidebarNav({
  navigation,
  isActive
}: {
  navigation: Array<{
    name: string;
    href?: string;
    icon?: React.ComponentType<{ className?: string }>;
    children?: Array<{ name: string; href: string; icon?: React.ComponentType<{ className?: string }> }>;
  }>;
  isActive: (href: string) => boolean
}) {
  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {navigation.map((item) => (
        <div key={item.name}>
          {item.children ? (
            <div className="space-y-1">
              <p className="px-3 pt-5 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {item.name}
              </p>
              {item.children.map((child) => (
                <Link
                  key={child.name}
                  href={child.href}
                  className={`group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${isActive(child.href)
                      ? 'bg-[#fdc501] text-black shadow-lg shadow-[#fdc501]/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {child.icon && <child.icon className={`h-4 w-4 ${isActive(child.href) ? 'text-black' : 'text-gray-500 group-hover:text-gray-300'}`} />}
                  {child.name}
                </Link>
              ))}
            </div>
          ) : (
            <Link
              href={item.href!}
              className={`group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${isActive(item.href!)
                  ? 'bg-[#fdc501] text-black shadow-lg shadow-[#fdc501]/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              {item.icon && <item.icon className={`h-5 w-5 ${isActive(item.href!) ? 'text-black' : 'text-gray-500 group-hover:text-gray-300'
                }`} />}
              {item.name}
            </Link>
          )}
        </div>
      ))}
      
      {/* Version info at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>System Online</span>
        </div>
      </div>
    </nav>
  )
}

function UserMenu() {
  const { data: session } = useSession()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-gray-200 hover:ring-[#fdc501] transition-all">
          <Avatar className="h-9 w-9">
            <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
            <AvatarFallback className="bg-[#1a1a1a] text-[#fdc501] font-semibold">
              {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
        <DropdownMenuLabel className="font-normal px-2 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
              <AvatarFallback className="bg-[#1a1a1a] text-[#fdc501] font-semibold">
                {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-sm font-semibold">{session?.user?.name}</p>
              <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                {session?.user?.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => signOut({ callbackUrl: '/' })}
          className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
