"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Presentation,
  Users,
  GraduationCap,
  Lock,
  Bell,
  Settings,
  User,
  FileBox,
  Building2,
  LogOut,
  ExternalLink
} from "lucide-react";

// ⭐️ [권한 설정] allowedRanks 배열에 허용할 직급(rank)을 넣습니다. "ALL"이면 누구나 접근 가능.
const navItems = [
  { label: "대시보드", href: "/dashboard", icon: Presentation, allowedRanks: ["FC", "SM", "BM"] },
  { label: "고객 관리", href: "/clients", icon: Users, allowedRanks: ["FC", "SM", "BM"] },
  { label: "스케줄 보드", href: "/schedules", icon: Calendar, allowedRanks: ["FC", "SM", "BM"] },
  { label: "청구 관리", href: "/claims", icon: FileBox, allowedRanks: ["OS", "FC", "SM", "BM"] },
  { label: "알림 센터", href: "/notifications", icon: Bell, allowedRanks: ["FC", "SM", "BM"] },
  { label: "사내 교육", href: "/training", icon: GraduationCap, allowedRanks: ["FC", "SM", "BM"] },
  // { label: "보험사 전산", href: "/portals", icon: ExternalLink, allowedRanks: ["ALL"] },
  // { label: "지점 통합 관리", href: "/branch-admin", icon: Building2, allowedRanks: ["OS", "총무", "BM", "지점장", "ADMIN"] },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter(); 
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  // 유저 정보 상태
  const [agentId, setAgentId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>(""); 
  const [userRank, setUserRank] = useState<string>(""); 
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [agencyId, setAgencyId] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [branchName, setBranchName] = useState<string>("");
  const [teamNumber, setTeamNumber] = useState<string>("");
  const [agentCode, setAgentCode] = useState<string>("");
  
  const [unreadCount, setUnreadCount] = useState(0);

  // 1. 유저 정보 조회 및 인증 상태 감지
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
          avatar_url,
          agencies (id, corporation_name, branch_name, team_number)
        `)
        .eq("auth_id", userId)
        .maybeSingle();
      
      if (agentData) {
        setAgentId(agentData.id);
        setUserName(agentData.name || "담당자");
        setUserRank(agentData.rank ? String(agentData.rank).toUpperCase() : "");
        setAvatarUrl(agentData.avatar_url || null);
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

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.id) fetchUserProfile(user.id);
      else setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.id) {
        fetchUserProfile(session.user.id);
        if (event === 'SIGNED_IN') router.refresh();
      } else {
        setAgentId(null);
        setUserName("");
        setAvatarUrl(null);
        setUserRank("");
        setUnreadCount(0);
        setIsLoading(false);
        if (event === 'SIGNED_OUT') router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router]); 

  // 2. 알림 개수 실시간 연동
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

  // ⭐️ OS 또는 총무 계정인지 확인하는 변수
  const isOS = userRank === "OS" || userRank === "총무";

  // ⭐️ 로그아웃 처리 함수
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/login");
    } else {
      alert("로그아웃에 실패했습니다.");
    }
  };

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
          className="cursor-pointer hidden md:flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-100"
        >
          {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      <nav className="px-2 py-5 overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <ul className="space-y-1">
          {navItems.map(({ label, href, icon: OriginalIcon, allowedRanks }) => {
            const active = isActivePath(pathname, href);
            
            // ⭐️ 타입스크립트 에러 해결: allowedRanks를 문자열 배열로 강제 인식시킵니다.
            const ranks = allowedRanks as readonly string[];
            
            const isRestricted = !ranks.includes("ALL");
            const isLocked = isRestricted && (!userRank || !ranks.includes(userRank));
            
            const Icon = OriginalIcon;
            
            const isNotificationMenu = label === "알림 센터";
            const hasUnread = isNotificationMenu && unreadCount > 0;

            if (isLocked) {
              return null;
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

      <div className={`mt-auto shrink-0 border-t border-gray-800 ${isOpen ? "p-3" : "flex justify-center p-3"}`}>
        {isLoading ? (
          <div className="animate-pulse flex flex-col gap-3 w-full px-1 py-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-800 rounded-lg shrink-0"></div>
              {isOpen && (
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="h-3 bg-gray-800 rounded w-16"></div>
                  <div className="h-2.5 bg-gray-800 rounded w-24"></div>
                </div>
              )}
            </div>
          </div>
        ) : isOpen ? (
          isOS ? (
            <div className="flex flex-col gap-3 p-3 rounded-xl border border-transparent relative">
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-800 border border-gray-700 flex items-center justify-center relative">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 w-full">
                    <span className="text-sm font-bold text-white tracking-tight truncate">{userName || "로그인 필요"}</span>
                    {userRank && (
                      <span className="text-[10px] bg-blue-600/20 text-blue-400 px-1.5 py-0.5 rounded font-black uppercase shrink-0">
                        {userRank}
                      </span>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="ml-auto text-gray-500 hover:text-red-400 transition-colors p-1 rounded hover:bg-gray-800 cursor-pointer"
                      title="로그아웃"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-500 truncate mt-0.5">
                    {companyName} {branchName ? `/ ${branchName}` : ""}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <Link 
              href="/mypage" 
              className="group flex flex-col gap-3 p-3 rounded-xl hover:bg-gray-900 transition-colors border border-transparent hover:border-gray-800 relative cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-800 border border-gray-700 flex items-center justify-center relative">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white tracking-tight truncate">{userName || "로그인 필요"}</span>
                    {userRank && (
                      <span className="text-[10px] bg-blue-600/20 text-blue-400 px-1.5 py-0.5 rounded font-black uppercase shrink-0">
                        {userRank}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 truncate mt-0.5">
                    {companyName} {branchName ? `/ ${branchName}` : ""}
                  </span>
                </div>
                
                <Settings className="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition-colors shrink-0" />
              </div>
              
              {agentId && (
                <div className="flex flex-col gap-1.5 rounded-lg bg-gray-950/50 p-2.5 border border-gray-800/80 group-hover:border-gray-700/80 transition-colors mt-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-gray-500 font-medium">소속팀 ({agencyId || "-"})</span>
                    <span className="text-gray-300 font-bold truncate max-w-[120px] text-right" title={branchName}>
                      {teamNumber || "-"} 팀
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] mt-0.5 pt-1.5 border-t border-gray-800">
                    <span className="text-gray-500 font-medium">관리 사번</span>
                    <span className="text-blue-400 font-black tracking-wide">
                      {agentCode || "-"}
                    </span>
                  </div>
                </div>
              )}
            </Link>
          )
        ) : (
          isOS ? (
            <button
              onClick={handleLogout}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-sm font-bold text-gray-400 border border-gray-800 hover:border-gray-600 hover:bg-red-900/30 hover:text-red-400 transition-colors overflow-hidden group cursor-pointer"
              title="로그아웃"
            >
              {avatarUrl ? (
                <div className="w-full h-full relative">
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover group-hover:opacity-10 transition-opacity" />
                  <LogOut className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 opacity-0 group-hover:opacity-100 text-red-400 transition-opacity" />
                </div>
              ) : (
                <>
                  <span className="group-hover:hidden">{userName ? userName.substring(0, 1) : "?"}</span>
                  <LogOut className="hidden group-hover:block w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <Link
              href="/mypage"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-sm font-bold text-gray-400 border border-gray-800 hover:border-gray-600 hover:bg-gray-800 hover:text-white transition-colors overflow-hidden"
              title="마이페이지 이동"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                userName ? userName.substring(0, 1) : "?"
              )}
            </Link>
          )
        )}
      </div>
    </aside>
  );
}