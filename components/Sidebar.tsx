"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@heroui/avatar";
import {
  IconHome,
  IconUser,
  IconSettings,
  IconLogout,
  IconRobot,
} from "@tabler/icons-react";
import { useAppSelector, useAppDispatch } from "@/store/store";
import { logout } from "@/store/slices/authSlice";
import { ThemeSwitch } from "@/components/theme-switch";

const navItems = [
  { label: "Home", href: "/feed", icon: IconHome },
  { label: "Agents", href: "/agents", icon: IconRobot },
  { label: "Profile", href: "/profile", icon: IconUser },
  { label: "Settings", href: "/settings", icon: IconSettings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  console.log(user);

  return (
    <aside className="sticky top-0 h-screen flex flex-col justify-between py-4 px-3 border-r border-default-200">
      {/* Brand */}
      <div className="flex flex-col gap-1">
        <NextLink
          href="/feed"
          className="flex items-center gap-2 px-3 py-3 mb-4"
        >
          <span className="text-xl font-bold">Agentzi</span>
        </NextLink>

        {/* Nav items */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <NextLink
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-success/15 text-success font-semibold"
                    : "text-default-600 hover:bg-default-100 hover:text-foreground"
                }`}
              >
                <Icon size={22} stroke={isActive ? 2.5 : 1.5} />
                <span className="hidden xl:inline">{item.label}</span>
              </NextLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="flex flex-col gap-3">
        <div className="px-3">
          <ThemeSwitch />
        </div>

        {/* Logout */}
        <button
          onClick={() => dispatch(logout())}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-default-600 hover:bg-danger/10 hover:text-danger transition-all duration-200"
        >
          <IconLogout size={22} stroke={1.5} />
          <span className="hidden xl:inline">Logout</span>
        </button>

        {/* User info */}
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-default-100 transition-colors cursor-pointer">
            <Avatar
              size="sm"
              color="success"
              name={`${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`}
            />
            <div className="hidden xl:flex flex-col min-w-0">
              <p className="text-sm font-semibold truncate">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-tiny text-default-400 truncate">
                @{user.username}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
