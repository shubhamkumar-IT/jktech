"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../../lib/auth";
import {
  Moon,
  Sun,
  Menu,
  X,
  FileText,
  Users,
  Database,
  Search,
  LogOut,
  User,
} from "lucide-react"; // Import icons

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const [theme, setTheme] = useState("light");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
    document.documentElement.classList.toggle("dark", theme === "light");
  };

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: Database },
    { name: "Documents", href: "/documents", icon: FileText },
    { name: "Q&A", href: "/qa", icon: Search },
  ];

  if (isAdmin) {
    navigationItems.push({ name: "Users", href: "/users", icon: Users });
  }

  const NavLink = ({ item, mobile = false }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        onClick={mobile ? handleDrawerToggle : undefined}
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
          isActive
            ? "bg-primary text-primary-foreground font-medium"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        }`}
      >
        <Icon className="h-5 w-5" />
        <span>{item.name}</span>
      </Link>
    );
  };

  return (
    <header className="sticky px-4 md:px-8 flex justify-center top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg hidden sm:inline-block">
              DocuManage
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="relative">
                <button
                  className="h-8 w-8 rounded-full focus:outline-none"
                  onClick={handleDrawerToggle}
                >
                  <User className="h-8 w-8 text-primary" />
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md border">
                    <div className="p-2">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                    <div className="border-t">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-muted-foreground hover:bg-gray-200"
                      >
                        <User className="inline-block mr-2 h-4 w-4" />
                        Profile
                      </Link>
                      <button
                        onClick={logout}
                        className="block w-full px-4 py-2 text-sm text-muted-foreground hover:bg-gray-200"
                      >
                        <LogOut className="inline-block mr-2 h-4 w-4" />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Drawer Menu */}
              {open && (
                <div className="absolute right-0 top-16 bg-white shadow-lg rounded-md w-60 p-4">
                  <div className="flex justify-between items-center">
                    <Link
                      href="/"
                      className="flex items-center gap-2"
                      onClick={handleDrawerToggle}
                    >
                      <FileText className="h-6 w-6 text-primary" />
                      <span className="font-bold text-lg">DocuManage</span>
                    </Link>
                    <button className="p-1" onClick={handleDrawerToggle}>
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close menu</span>
                    </button>
                  </div>

                  <nav className="flex flex-col gap-1 mt-4">
                    {navigationItems.map((item) => (
                      <NavLink key={item.name} item={item} mobile />
                    ))}
                  </nav>

                  <div className="mt-auto">
                    <button
                      onClick={logout}
                      className="w-full text-left py-2 px-4 text-sm text-muted-foreground hover:bg-gray-200"
                    >
                      <LogOut className="inline-block mr-2 h-4 w-4" />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <button className="px-4 py-2 bg-transparent text-blue-500 hover:bg-blue-100 rounded-md">
                  Log in
                </button>
              </Link>
              <Link href="/signup">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md">
                  Sign up
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
