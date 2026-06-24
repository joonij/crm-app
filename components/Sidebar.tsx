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
  { label: "대시보드", href: "/", icon: LayoutDashboard, requiredRole: "admin" },
  { label: "고객 관리", href: "/clients", icon: Users, requiredRole: "user" },
  { label: "상담 일정", href: "/schedules", icon: Calendar, requiredRole: "admin" },
  { label: "사내 교육", href: "/training", icon: GraduationCap, requiredRole: "user" },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [userRole, setUserRole] = useState<string>("user");
  const [userName, setUserName] = useState<string>("로딩중..."); 
  const [userRank, setUserRank] = useState<string>(""); 
  const [id, setId] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [branchName, setBranchName] = useState<string>("");
  const [teamNumber, setTeamNumber] = useState<string>("");
  const [agentCode, setAgentCode] = useState<string>("");

  useEffect(() => {
    async function fetchUserProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // ⭐️ agent_code 추가 및 agencies 테이블 조인
        const { data } = await supabase
          .from("agents")
          .select(`
            name, 
            rank, 
            agent_code,
            agencies (id, corporation_name, branch_name, team_number)
          `)
          .eq("auth_id", user.id)
          .single();
        
        if (data) {
          setUserName(data.name || "담당자");
          setUserRank(data.rank || "");
          setAgentCode(data.agent_code ? String(data.agent_code) : "");
          
          const agency = Array.isArray(data.agencies) ? data.agencies[0] : data.agencies;
          if (agency) {
            setId(agency.id || "");
            setCompanyName(agency.corporation_name || "");
            setBranchName(agency.branch_name || ""); // branch_name을 소속팀으로 활용
            setTeamNumber(agency.team_number || ""); // branch_name을 소속팀으로 활용
          }
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
            const isLocked = String(requiredRole) === "admin" && userRole !== "admin";
            const Icon = isLocked ? Lock : OriginalIcon;

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

      {/* ⭐️ 하단 유저 프로필 영역 개편 */}
      <div
        className={`mt-auto shrink-0 border-t border-gray-800 ${
          isOpen ? "p-4" : "flex justify-center p-3"
        }`}
      >
        {isOpen ? (
          <div className="flex flex-col gap-3">
            {/* 이름 및 직급 */}
            <div className="flex items-center gap-2 px-1">
              <span className="text-sm font-bold text-white tracking-tight">{userName}</span>
              {userRank && (
                <span className="text-[10px] bg-blue-600/20 text-blue-400 px-1.5 py-0.5 rounded font-black uppercase">
                  {userRank}
                </span>
              )}
            </div>
            
            {/* 소속회사, 소속팀, ID 정보 박스 */}
            <div className="flex flex-col gap-1.5 rounded-xl bg-gray-900/50 p-3 border border-gray-800/80">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-gray-500 font-medium">소속회사</span>
                <span className="text-gray-300 font-bold truncate max-w-[100px] text-right" title={companyName}>
                  {companyName || "-"}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-gray-500 font-medium">소속팀 ({id || "-"})</span>
                <span className="text-gray-300 font-bold truncate max-w-[100px] text-right" title={branchName}>
                  {branchName || "-"} {teamNumber || "-"} 팀
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] mt-0.5 pt-1.5 border-t border-gray-800">
                <span className="text-gray-500 font-medium">사번 (ID)</span>
                <span className="text-blue-400 font-black tracking-wide">
                  {agentCode || "-"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-sm font-bold text-blue-400 border border-blue-500/20"
            title={`${userName} ${userRank}\n${companyName} / ${branchName}`}
          >
            {userName.substring(0, 1)}
          </div>
        )}
      </div>
    </aside>
  );
}