"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
} from "lucide-react";

const navItems = [
  { label: "대시보드", href: "/", icon: LayoutDashboard },
  { label: "고객 관리", href: "/clients", icon: Users },
  { label: "상담 일정", href: "/schedules", icon: Calendar },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside
      className={`flex h-full print:hidden flex-col shrink-0 overflow-hidden border-r border-gray-800 bg-gray-950 text-gray-100 transition-all duration-300 ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      <div
        className={`flex shrink-0 items-center border-b border-gray-800 ${
          isOpen ? "justify-between px-4 py-4" : "justify-center px-2 py-4"
        }`}
      >
        {isOpen && (
          <div className="min-w-0 overflow-hidden">
            <p className="truncate text-xs font-medium uppercase tracking-widest text-gray-500">
              CRM Pro
            </p>
            <h1 className="truncate text-lg font-semibold text-white">
              관리 콘솔
            </h1>
          </div>
        )}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "사이드바 접기" : "사이드바 펼치기"}
          className="hidden md:flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-100"
        >
          {isOpen ? (
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          ) : (
            <ChevronRight className="h-4 w-4" strokeWidth={2} />
          )}
        </button>
      </div>

      <nav className="px-2 py-5">
        <ul className="space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = isActivePath(pathname, href);

            return (
              <li key={href}>
                <Link
                  href={href}
                  title={isOpen ? undefined : label}
                  className={`flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors ${
                    isOpen ? "gap-3 px-3" : "justify-center px-2"
                  } ${
                    active
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:bg-gray-900 hover:text-gray-100"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      active ? "text-blue-400" : "text-gray-500"
                    }`}
                    strokeWidth={2}
                  />
                  {isOpen && <span className="truncate">{label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        className={`mt-auto shrink-0 border-t border-gray-800 ${
          isOpen ? "px-6 py-5" : "flex justify-center px-2 py-5"
        }`}
      >
        {isOpen ? (
          <>
            <p className="text-xs text-gray-500">정준희 ASM</p>
            <p className="mt-0.5 text-sm text-gray-300">한강 6팀</p>
          </>
        ) : (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-xs font-semibold text-gray-300"
            title="정준희 ASM"
          >
            정
          </div>
        )}
      </div>
    </aside>
  );
}
