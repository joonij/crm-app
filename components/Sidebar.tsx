"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  GraduationCap,
  Lock,
} from "lucide-react";

// 메뉴 구성에 requiredRole 추가
const navItems = [
  { label: "대시보드", href: "/", icon: LayoutDashboard, requiredRole: "user" },
  { label: "고객 관리", href: "/clients", icon: Users, requiredRole: "user" },
  { label: "상담 일정", href: "/schedules", icon: Calendar, requiredRole: "user" },
  { label: "사내 교육", href: "/training", icon: GraduationCap, requiredRole: "user" },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [userRole, setUserRole] = useState<string>("user"); // 기본값 user
  const [userName, setUserName] = useState<string>("정준희 ASM"); // 기존 하드코딩 유지, 필요시 업데이트

  useEffect(() => {
    async function fetchUserProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // profiles 테이블에서 권한과 이름 가져오기
        const { data } = await supabase
          .from("profiles")
          .select("role, name")
          .eq("id", user.id)
          .single();
        
        if (data) {
          if (data.role) setUserRole(data.role);
          if (data.name) setUserName(`${data.name} ASM`);
        }
      }
    }
    fetchUserProfile();
  }, []);

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
          {navItems.map(({ label, href, icon: OriginalIcon, requiredRole }) => {
            const active = isActivePath(pathname, href);
            // 권한 체크: 필요한 권한이 admin인데 현재 유저가 admin이 아니면 잠금 처리
            const isLocked = requiredRole === "admin" && userRole !== "admin";
            const Icon = isLocked ? Lock : OriginalIcon;

            // 잠긴 메뉴 렌더링
            if (isLocked) {
              return (
                <li key={href}>
                  <div
                    title={isOpen ? undefined : `${label} (접근 불가)`}
                    className={`flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors cursor-not-allowed opacity-50 ${
                      isOpen ? "gap-3 px-3" : "justify-center px-2"
                    } text-gray-500 hover:bg-gray-900`}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                    {isOpen && <span className="truncate">{label}</span>}
                  </div>
                </li>
              );
            }

            // 정상 메뉴 렌더링
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
            <p className="text-xs text-gray-500">{userName}</p>
            <p className="mt-0.5 text-sm text-gray-300">한강 6팀</p>
          </>
        ) : (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-xs font-semibold text-gray-300"
            title={userName}
          >
            {userName.substring(0, 1)}
          </div>
        )}
      </div>
    </aside>
  );
}