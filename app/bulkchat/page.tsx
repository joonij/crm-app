"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Users, Search, CheckCircle2, UserPlus, Phone, Loader2 } from "lucide-react";
// ⭐️ 아까 만든 카톡 발송 컴포넌트를 불러옵니다. 경로를 대표님 프로젝트에 맞게 맞춰주세요.
import KakaoMultiSender from "@/components/KakaoMultiSender";

interface Client {
  id: number;
  name: string;
  phone: string;
  created_at: string;
}

export default function ClientManagementPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // ⭐️ 발송 완료한 고객을 기억해두는 체크리스트 상태
  const [sentSet, setSentSet] = useState<Set<number>>(new Set());
  
  // 로그인한 설계사 이름 (카톡 템플릿에 넣을 용도)
  const [agentName, setAgentName] = useState("담당 설계사");

  useEffect(() => {
    fetchClientsAndAgent();
  }, []);

  const fetchClientsAndAgent = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: agent } = await supabase.from("agents").select("id, name").eq("auth_id", user.id).single();
      if (agent) {
        setAgentName(agent.name);
        
        // 내 고객 목록 불러오기 (가나다순 정렬)
        const { data: clientsData } = await supabase
          .from("clients")
          .select("id, name, phone, created_at")
          .eq("agent_id", agent.id)
          .order("name", { ascending: true });
          
        if (clientsData) setClients(clientsData);
      }
    }
    setIsLoading(false);
  };

  // 체크박스 토글 함수
  const toggleSentStatus = (clientId: number) => {
    setSentSet(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clientId)) {
        newSet.delete(clientId);
      } else {
        newSet.add(clientId);
      }
      return newSet;
    });
  };

  // 체크리스트 초기화
  const resetSentList = () => {
    if(confirm("발송 완료 체크 내역을 모두 초기화하시겠습니까?")) {
      setSentSet(new Set());
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.includes(searchTerm) || (c.phone && c.phone.includes(searchTerm))
  );

  return (
    <div className="w-full mx-auto max-w-[1000px] space-y-6 p-4 md:p-8 pb-24">
      
      {/* 1. 페이지 헤더 */}
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            고객 및 알림 관리
          </h1>
          <p className="mt-2 text-sm text-gray-500 font-medium">내 고객을 관리하고 단체 카카오톡 메시지를 발송하세요.</p>
        </div>
      </div>

      {/* 2. ⭐️ 카카오톡 다목적 발송 컴포넌트 탑재 */}
      <KakaoMultiSender profileName={agentName} />

      {/* 3. 고객 리스트 및 발송 체크 영역 */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mt-8">
        
        <div className="p-5 border-b border-gray-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-slate-800">
              내 고객 리스트 <span className="text-blue-600 ml-1">{clients.length}명</span>
            </h3>
            <p className="text-xs font-bold text-gray-500 mt-1">
              카톡 발송 후 헷갈리지 않게 우측의 체크박스를 활용하세요.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="이름 또는 연락처 검색" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm"
              />
            </div>
            <button onClick={resetSentList} className="px-3 py-2 bg-white border border-gray-200 text-xs font-bold text-gray-600 rounded-lg hover:bg-gray-100 transition shadow-sm whitespace-nowrap cursor-pointer">
              체크 초기화
            </button>
          </div>
        </div>

        {/* 고객 목록 리스트 */}
        <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
          {isLoading ? (
            <div className="py-12 text-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              고객 데이터를 불러오는 중입니다...
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              검색된 고객이 없습니다.
            </div>
          ) : (
            filteredClients.map((client) => {
              const isSent = sentSet.has(client.id);
              
              return (
                <div key={client.id} className={`flex items-center justify-between p-4 hover:bg-slate-50 transition-colors ${isSent ? 'bg-blue-50/30' : ''}`}>
                  
                  <div className="flex items-center gap-3 md:gap-4">
                    {/* 프로필 아바타 뱃지 */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shadow-inner shrink-0 ${isSent ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'}`}>
                      {client.name.charAt(0)}
                    </div>
                    
                    <div>
                      <h4 className={`text-sm font-black ${isSent ? 'text-gray-400 line-through decoration-gray-300' : 'text-gray-900'}`}>
                        {client.name}
                      </h4>
                      <p className="text-xs font-bold text-gray-500 mt-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {client.phone || "연락처 없음"}
                      </p>
                    </div>
                  </div>

                  {/* ⭐️ 발송 완료 체크 토글 버튼 */}
                  <button 
                    onClick={() => toggleSentStatus(client.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                      isSent 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                        : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${isSent ? 'text-white' : 'text-gray-300'}`} />
                    {isSent ? '발송됨' : '발송 전'}
                  </button>
                  
                </div>
              )
            })
          )}
        </div>
        
      </div>
    </div>
  );
}