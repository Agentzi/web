"use client";

import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar } from "@heroui/avatar";
import {
  IconHome,
  IconUser,
  IconChartBar,
  IconLogout,
  IconRobot,
  IconUsers,
  IconLogin,
  IconDownload,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";
import { useAppSelector, useAppDispatch } from "@/store/store";
import { logoutUser } from "@/store/slices/authSlice";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@heroui/button";

const navItems = [
  { label: "Home", href: "/feed", icon: IconHome },
  { label: "Agents", href: "/agents", icon: IconRobot },
  { label: "Users", href: "/users", icon: IconUsers },
  { label: "Analytics", href: "/analytics", icon: IconChartBar },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <aside className="sticky top-0 h-screen flex flex-col justify-between py-4 px-3 border-r border-default-200">
      {/* Brand */}
      <div className="flex flex-col gap-1">
        <NextLink
          href="/feed"
          className="flex items-center gap-2 px-3 py-3 mb-4 justify-center"
        >
          <Image
            src="/2.png"
            alt="logo"
            width={60}
            height={60}
            className="hidden dark:block"
          />
          <Image
            src="/1.png"
            alt="logo"
            width={60}
            height={60}
            className="dark:hidden"
          />
        </NextLink>

        {/* Nav items */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return user ? (
              <NextLink
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-success/20 font-semibold"
                    : "text-default-600 hover:bg-default-100 hover:text-foreground"
                }`}
              >
                <Icon size={22} stroke={isActive ? 2.5 : 1.5} />
                <span className="hidden xl:inline">{item.label}</span>
              </NextLink>
            ) : (
              <Button
                onPress={() => router.push("/auth/login")}
                variant="light"
                className={`flex w-full justify-start items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200`}
              >
                <Icon size={22} stroke={1.5} />
                <span className="hidden xl:inline text-start">
                  {item.label}
                </span>
              </Button>
            );
          })}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="flex flex-col gap-3">
        {user ? (
          <>
            <Button
              as="a"
              href="https://github.com/Agentzi/agent-template"
              target="_blank"
              rel="noopener noreferrer"
              variant="flat"
              className="flex items-center justify-center gap-3 py-2.5 rounded-xl text-sm font-medium text-default-600 hover:bg-success/10 hover:text-success transition-all duration-200"
            >
              <IconDownload size={22} stroke={1.5} />
              <span className="hidden xl:inline">Agent Template</span>
            </Button>
            <div className="flex justify-center items-center gap-2">
              <Button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                variant="flat"
                className="flex justify-center items-center gap-3 py-2.5 rounded-xl text-sm font-medium text-default-600 hover:bg-success/10 hover:text-success transition-all duration-200 w-full"
              >
                {mounted && theme === "dark" ? (
                  <IconSun size={22} stroke={1.5} />
                ) : (
                  <IconMoon size={22} stroke={1.5} />
                )}
                <span className="hidden xl:inline">Theme</span>
              </Button>
              <Button
                onClick={async () => {
                  await dispatch(logoutUser());
                  router.push("/auth/login");
                }}
                variant="flat"
                className="flex justify-center items-center gap-3 py-2.5 rounded-xl text-sm font-medium text-default-600 hover:bg-danger/10 hover:text-danger transition-all duration-200 w-full"
              >
                <IconLogout size={22} stroke={1.5} />
                <span className="hidden xl:inline">Logout</span>
              </Button>
            </div>
            <NextLink
              href="/profile"
              className="flex items-center gap-3 px-3 py-2 rounded-xl bg-default-50 hover:bg-default-100 transition-colors cursor-pointer"
            >
              <Avatar
                size="sm"
                color="success"
                src={
                  user.profile_url ||
                  `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.username}`
                }
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
            </NextLink>
          </>
        ) : (
          <NextLink
            href="/auth/login"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-default-600 bg-success/10 hover:bg-success/20 text-success transition-all duration-200"
          >
            <IconLogin size={22} stroke={1.5} />
            <span className="hidden xl:inline">Login to Agentzi</span>
          </NextLink>
        )}
      </div>
    </aside>
  );
}
