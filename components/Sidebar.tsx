"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // ⭐️ useRouter 추가
import { supabase } from "@/lib/supabase";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  GraduationCap,
  Lock,
  Bell,
} from "lucide-react";

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
  const router = useRouter(); // ⭐️ 라우터 선언
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  // 유저 정보 상태
  const [agentId, setAgentId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string>("user");
  const [userName, setUserName] = useState<string>(""); 
  const [userRank, setUserRank] = useState<string>(""); 
  const [agencyId, setAgencyId] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [branchName, setBranchName] = useState<string>("");
  const [teamNumber, setTeamNumber] = useState<string>("");
  const [agentCode, setAgentCode] = useState<string>("");
  
  // 알림 상태
  const [unreadCount, setUnreadCount] = useState(0);

  // ---------------------------------------------------------
  // 1. 유저 정보 조회 및 인증 상태 감지
  // ---------------------------------------------------------
  useEffect(() => {
    const fetchUserProfile = async (userId: string) => {
      setIsLoading(true);
      const { data: agentData, error } = await supabase
        .from("agents")
        .select(`
          id,
          name, 
          rank, 
          agent_code,
          agencies (id, corporation_name, branch_name, team_number)
        `)
        .eq("auth_id", userId)
        .maybeSingle();
      
      if (agentData) {
        setAgentId(agentData.id);
        setUserName(agentData.name || "담당자");
        setUserRank(agentData.rank || "");
        setAgentCode(agentData.agent_code ? String(agentData.agent_code) : "");
        
        const agency = Array.isArray(agentData.agencies) ? agentData.agencies[0] : agentData.agencies;
        if (agency) {
          setAgencyId(agency.id || "");
          setCompanyName(agency.corporation_name || "");
          setBranchName(agency.branch_name || "");
          setTeamNumber(agency.team_number || ""); 
        }
      } else if (error) {
        console.error("유저 정보 로드 실패:", error.message);
      }
      setIsLoading(false);
    };

    // 초기 데이터 로드
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.id) fetchUserProfile(user.id);
      else setIsLoading(false);
    });

    // 세션 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.id) {
        fetchUserProfile(session.user.id);
        // ⭐️ 로그인 이벤트 발생 시 Next.js 레이아웃 강제 리로딩
        if (event === 'SIGNED_IN') {
          router.refresh();
        }
      } else {
        setAgentId(null);
        setUserName("");
        setUnreadCount(0);
        setIsLoading(false);
        // ⭐️ 로그아웃 시 강제 리로딩
        if (event === 'SIGNED_OUT') {
          router.refresh();
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [router]); // router 의존성 추가

  // ---------------------------------------------------------
  // 2. 알림 개수 조회 및 실시간 연동
  // ---------------------------------------------------------
  useEffect(() => {
    if (!agentId) return;

    let channel: any;

    const fetchUnreadCount = async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true }) 
        .eq('agent_id', agentId)
        .eq('is_read', false);
      
      if (!error && count !== null) {
        setUnreadCount(count);
      }
    };

    fetchUnreadCount();

    const channelName = `sidebar-noti-${agentId}-${Date.now()}`;
    channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `agent_id=eq.${agentId}` },
        () => fetchUnreadCount()
      )
      .subscribe();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchUnreadCount();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (channel) supabase.removeChannel(channel);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [agentId]);

  useEffect(() => {
    document.title = unreadCount > 0 ? `(${unreadCount}) CareLink` : "CareLink";
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
          className="hidden md:flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-100"
        >
          {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      <nav className="px-2 py-5 overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <ul className="space-y-1">
          {navItems.map(({ label, href, icon: OriginalIcon, requiredRole }) => {
            const active = isActivePath(pathname, href);
            const isLocked = String(requiredRole) === "admin" && userRole !== "admin";
            const Icon = isLocked ? Lock : OriginalIcon;
            const isNotificationMenu = label === "알림 센터";
            const hasUnread = isNotificationMenu && unreadCount > 0;

            if (isLocked) {
              return (
                <li key={href} className="relative">
                  <div className={`flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors cursor-not-allowed opacity-50 ${isOpen ? "gap-3 px-3" : "justify-center px-2"} text-gray-500 hover:bg-gray-900`}>
                    <Icon className="h-4 w-4 shrink-0" />
                    {isOpen && <span className="truncate">{label}</span>}
                  </div>
                </li>
              );
            }

            return (
              <li key={href} className="relative">
                <Link
                  href={href}
                  className={`flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors relative ${isOpen ? "gap-3 px-3" : "justify-center px-2"} ${active ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-900 hover:text-gray-100"}`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${active ? "text-blue-400" : "text-gray-500"} ${hasUnread ? "animate-bounce" : ""}`} />
                  
                  {isOpen && <span className="truncate">{label}</span>}

                  {hasUnread && (
                    isOpen ? (
                      <div className="ml-auto flex items-center justify-center">
                        <span className="inline-flex items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm ring-2 ring-gray-950">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      </div>
                    ) : (
                      <div className="absolute top-2 right-2 flex h-2 w-2 items-center justify-center">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-gray-950"></span>
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
      <div className={`mt-auto shrink-0 border-t border-gray-800 ${isOpen ? "p-4" : "flex justify-center p-3"}`}>
        {isLoading ? (
          <div className="animate-pulse flex flex-col gap-3 w-full">
            <div className="flex items-center gap-2 px-1">
              <div className="h-4 bg-gray-800 rounded w-16"></div>
              <div className="h-4 bg-gray-800 rounded w-10"></div>
            </div>
            <div className="rounded-xl bg-gray-900/50 p-3 h-20 border border-gray-800/80 flex flex-col gap-2 justify-center">
              <div className="h-3 bg-gray-800 rounded w-full"></div>
              <div className="h-3 bg-gray-800 rounded w-3/4"></div>
            </div>
          </div>
        ) : isOpen ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 px-1">
              <span className="text-sm font-bold text-white tracking-tight">{userName || "로그인 필요"}</span>
              {userRank && (
                <span className="text-[10px] bg-blue-600/20 text-blue-400 px-1.5 py-0.5 rounded font-black uppercase">
                  {userRank}
                </span>
              )}
            </div>
            
            {agentId && (
              <div className="flex flex-col gap-1.5 rounded-xl bg-gray-900/50 p-3 border border-gray-800/80">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-500 font-medium">소속회사</span>
                  <span className="text-gray-300 font-bold truncate max-w-[100px] text-right" title={companyName}>
                    {companyName || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-500 font-medium">소속팀</span>
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
            )}
          </div>
        ) : (
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-sm font-bold text-blue-400 border border-blue-500/20 shadow-inner cursor-default"
            title={`${userName} ${userRank}\n${companyName} / ${branchName}`}
          >
            {userName ? userName.substring(0, 1) : "?"}
          </div>
        )}
      </div>
    </aside>
  );
}