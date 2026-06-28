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
  Bell, // ⭐️ Bell 아이콘 추가
} from "lucide-react";

// ⭐️ 알림 센터 메뉴 추가
const navItems = [
  { label: "대시보드", href: "/", icon: LayoutDashboard, requiredRole: "admin" },
  { label: "고객 관리", href: "/clients", icon: Users, requiredRole: "user" },
  { label: "스케줄 보드", href: "/schedules", icon: Calendar, requiredRole: "user" },
  { label: "사내 교육", href: "/training", icon: GraduationCap, requiredRole: "user" },
  { label: "알림 센터", href: "/notifications", icon: Bell, requiredRole: "user" },
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
  
  // ⭐️ 읽지 않은 알림 개수 상태
  const [unreadCount, setUnreadCount] = useState(0);

  // 1. 유저 프로필 가져오기
  useEffect(() => {
    async function fetchUserProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
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
            setBranchName(agency.branch_name || "");
            setTeamNumber(agency.team_number || ""); 
          }
        }
      }
    }
    fetchUserProfile();
  }, []);

  // 2. ⭐️ 알림 개수 실시간 연동 로직
  // 2. ⭐️ 알림 개수 실시간 연동 로직 (에러 방탄 처리 완료)
  useEffect(() => {
    let channel: any; // 클린업을 위해 밖으로 빼둡니다.

    const initNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 카운트 함수
      const fetchCount = async () => {
        const { data, error } = await supabase
          .from('notifications')
          .select('id, agents!inner(auth_user_id)')
          .eq('agents.auth_user_id', user.id)
          .eq('is_read', false);
        
        if (!error && data) {
          setUnreadCount(data.length);
        }
      };

      await fetchCount(); // 최초 1회 실행

      // ⭐️ 핵심: 채널 이름을 매번 다르게 생성하여 기존 캐시와 절대 충돌하지 않게 만듭니다.
      const uniqueChannelName = `sidebar-count-${user.id}-${Date.now()}`;

      channel = supabase
        .channel(uniqueChannelName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications' },
          () => {
            fetchCount(); // DB 변경 감지 시 숫자 다시 세기
          }
        )
        .subscribe();
    };

    initNotifications();

    // 화면이 꺼지거나 재렌더링 될 때 기존 채널을 완벽하게 삭제 (메모리 누수 방지)
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // 3. ⭐️ 브라우저 탭(Title) 숫자 연동 (사용자 경험 극대화)
  useEffect(() => {
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) CareLink`;
    } else {
      document.title = "CareLink";
    }
  }, [unreadCount]);

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
              Insurance
            </p>
            <h1 className="truncate text-xl font-black text-white tracking-tight flex items-center gap-1">
              Care<span className="text-blue-500">Link</span>
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

      <nav className="px-2 py-5 overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <ul className="space-y-1">
          {navItems.map(({ label, href, icon: OriginalIcon, requiredRole }) => {
            const active = isActivePath(pathname, href);
            const isLocked = String(requiredRole) === "admin" && userRole !== "admin";
            const Icon = isLocked ? Lock : OriginalIcon;
            
            // ⭐️ 알림 메뉴 여부 확인
            const isNotificationMenu = label === "알림 센터";

            if (isLocked) {
              return (
                <li key={href} className="relative">
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
              <li key={href} className="relative">
                <Link
                  href={href}
                  title={isOpen ? undefined : label}
                  className={`flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors relative ${
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

                  {/* ⭐️ 알림 뱃지 표시 로직 */}
                  {isNotificationMenu && unreadCount > 0 && (
                    isOpen ? (
                      // 사이드바가 열려있을 때: 숫자 표시 뱃지
                      <div className="relative flex items-center justify-center ml-auto">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-70"></span>
                        <span className="relative inline-flex rounded-full bg-red-500 text-white px-2 py-0.5 text-[10px] font-black shadow-sm">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      </div>
                    ) : (
                      // 사이드바가 닫혀있을 때: 아이콘 우측 상단에 작은 빨간 점 표시
                      <div className="absolute top-2 right-2 flex h-2 w-2 items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-70"></span>
                        <span className="relative inline-flex rounded-full bg-red-500 h-1.5 w-1.5"></span>
                      </div>
                    )
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 하단 유저 프로필 영역 */}
      <div
        className={`mt-auto shrink-0 border-t border-gray-800 ${
          isOpen ? "p-4" : "flex justify-center p-3"
        }`}
      >
        {isOpen ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 px-1">
              <span className="text-sm font-bold text-white tracking-tight">{userName}</span>
              {userRank && (
                <span className="text-[10px] bg-blue-600/20 text-blue-400 px-1.5 py-0.5 rounded font-black uppercase">
                  {userRank}
                </span>
              )}
            </div>
            
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