// app/mindmap/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Users, Crown, Zap, User, ChevronDown, Search, UserPlus, FolderGit2, ArrowLeft } from 'lucide-react';

// --- 1. 루트 / 유입경로 분류(Category) / 고객 커스텀 노드 ---
// --- 1. 고객 수에 따라 크기가 동적으로 커지는 커스텀 노드 ---
// --- 1. 고객 수에 따라 폰트와 박스가 대폭 커지는 커스텀 노드 ---
const ClientNode = ({ data }: { data: any }) => {
  const isRoot = data.isRoot;
  const isCategory = data.isCategory;
  const isVIP = data.connectionCount >= 3; 
  const hasRecruiting = !!data.recruiting_status; 
  const isDimmed = data.isDimmed; 
  const isExactMatch = data.isExactMatch;

  // 레이아웃 함수에서 자동 주입된 배율 사용 (기본값 보장)
  const rootScale = data.rootScale || 1;
  const catScale = data.catScale || 1;

  // 1) 중앙 루트 노드 (담당자) - 기본 폰트 및 원 크기 대폭 확대
  if (isRoot) {
    return (
      <div 
        style={{ transform: `translate(-50%, -50%) scale(${rootScale})` }}
        className={`w-36 h-36 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex flex-col items-center justify-center text-white shadow-2xl ring-[10px] ring-blue-100/90 z-50 transition-opacity duration-300 cursor-pointer origin-center ${isDimmed ? 'opacity-20 grayscale' : 'opacity-100'}`}
      >
        <User className="w-10 h-10 mb-1.5 text-blue-200 shrink-0" />
        <span className="text-xl font-black text-center px-2 leading-tight whitespace-nowrap tracking-tight">{data.label}</span>
        <span className="text-xs text-blue-100 font-extrabold mt-1.5 bg-blue-900/60 px-3 py-0.5 rounded-full whitespace-nowrap">
          총 {data.totalClients}명
        </span>
        <Handle type="source" position={Position.Bottom} className="opacity-0" style={{ top: '50%', left: '50%' }} />
        <Handle type="target" position={Position.Top} className="opacity-0" style={{ top: '50%', left: '50%' }} />
      </div>
    );
  }

  // 2) 1단계 시작 분류 노드 (본인, 지인, 소개, DB, 돌방, 소모임, 거점) - 폰트 및 패딩 대폭 확대
  if (isCategory) {
    return (
      <div 
        style={{ transform: `translate(-50%, -50%) scale(${catScale})` }}
        className={`px-6 py-3.5 rounded-2xl bg-slate-800 text-white border-2 border-slate-500 flex items-center gap-3.5 shadow-2xl z-40 transition-opacity duration-300 origin-center whitespace-nowrap ${isDimmed ? 'opacity-20 grayscale pointer-events-none' : 'opacity-100'}`}
      >
        <Handle type="target" position={Position.Top} className="opacity-0" style={{ top: '50%', left: '50%' }} />
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0">
          <FolderGit2 className="w-5 h-5" />
        </div>
        <div className="flex flex-col pr-1">
          <span className="text-lg font-black tracking-wide text-white leading-tight">{data.label}</span>
          <span className="text-xs font-extrabold text-indigo-200 mt-0.5">{data.count}명 시작</span>
        </div>
        <Handle type="source" position={Position.Bottom} className="opacity-0" style={{ top: '50%', left: '50%' }} />
      </div>
    );
  }

  // 3) 일반 고객 노드
  let borderClass = 'border-slate-200 hover:border-blue-300 hover:shadow-blue-50';
  let iconBgClass = 'bg-slate-100 text-slate-500';
  let textClass = 'text-slate-700';
  let IconComponent = Users;

  if (hasRecruiting) {
    borderClass = 'border-purple-500 ring-2 ring-purple-100 shadow-purple-100';
    iconBgClass = 'bg-purple-100 text-purple-600';
    textClass = 'text-purple-700';
    IconComponent = UserPlus;
  } else if (isVIP) {
    borderClass = 'border-amber-400 ring-2 ring-amber-100 shadow-amber-100';
    iconBgClass = 'bg-amber-100 text-amber-600';
    textClass = 'text-amber-600';
    IconComponent = Crown;
  }

  if (isExactMatch) {
    borderClass = 'border-blue-500 ring-4 ring-blue-200 shadow-blue-200';
  }

  const dimClass = isDimmed ? 'opacity-20 grayscale pointer-events-none' : 'opacity-100 hover:scale-110 cursor-pointer';

  return (
    <div 
      style={{ transform: 'translate(-50%, -50%)' }}
      className={`px-4 py-2 rounded-full border bg-white flex items-center gap-2 transition-all duration-300 shadow-sm z-40 whitespace-nowrap ${borderClass} ${dimClass}`}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" style={{ top: '50%', left: '50%' }} />
      
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${iconBgClass}`}>
        <IconComponent className="w-4 h-4" />
      </div>
      
      <div className="flex flex-col pr-2">
        <span className={`text-xs font-black ${textClass}`}>{data.label}</span>
        <span className="text-[8px] font-bold text-slate-400">{data.client_source || '미지정'}</span>
      </div>
      
      {data.connectionCount > 0 && (
        <div className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-sm ring-2 ring-white">
          {data.connectionCount}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="opacity-0" style={{ top: '50%', left: '50%' }} />
    </div>
  );
};

const nodeTypes = { customClient: ClientNode };

// --- 2. 선 교차 및 카테고리 겹침 방지 방사형 알고리즘 (배율 자동 주입) ---
const buildStrictRadialLayout = (nodes: any[], edges: any[]) => {
  const adj: Record<string, string[]> = {};
  edges.forEach(e => {
    if (!adj[e.source]) adj[e.source] = [];
    adj[e.source].push(e.target);
  });

  const leavesCount: Record<string, number> = {};
  const getLeaves = (id: string): number => {
    if (!adj[id] || adj[id].length === 0) {
      leavesCount[id] = 1;
      return 1;
    }
    let sum = 0;
    adj[id].forEach(child => {
      sum += getLeaves(child);
    });
    leavesCount[id] = sum;
    return sum;
  };

  const totalLeaves = getLeaves('root-me');

  // ⭐️ 전체 고객 수(노드 수)를 자체 계산하여 배율 산출 (350명 기준 rootScale ≈ 6.2배, catScale ≈ 5.3배)
  const totalClientsCount = nodes.filter(n => !n.data?.isRoot && !n.data?.isCategory).length;
  const rootScale = Math.min(7.5, Math.max(1, 1 + Math.max(0, totalClientsCount - 20) / 62));
  const catScale = Math.min(6.5, Math.max(1, 1 + Math.max(0, totalClientsCount - 20) / 75));

  // ⭐️ 커진 루트 노드와 카테고리 노드가 서로 부딪히지 않도록 카테고리 원 반경(catRadius)을 넉넉히 확보
  const catRadius = Math.max(400, rootScale * 150 + catScale * 220);
  const minRadiusStep = Math.max(catRadius + 550, (totalLeaves * 95) / (2 * Math.PI));

  // 모든 노드의 data에 계산된 배율을 자동 주입
  const positionedNodes = nodes.map(n => ({
    ...n,
    data: {
      ...n.data,
      totalClients: totalClientsCount,
      rootScale,
      catScale,
    }
  }));
  const nodeMap = new Map(positionedNodes.map(n => [n.id, n]));

  const placeRadial = (nodeId: string, angleStart: number, angleEnd: number, depth: number) => {
    const node = nodeMap.get(nodeId);
    if (!node) return;

    const angle = (angleStart + angleEnd) / 2;
    const radius = depth === 0 ? 0 : depth === 1 ? catRadius : minRadiusStep + (depth - 2) * 280;

    node.position = {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    };

    const children = adj[nodeId] || [];
    if (children.length > 0) {
      const totalChildLeaves = children.reduce((sum, child) => sum + (leavesCount[child] || 1), 0);
      let currentAngle = angleStart;
      const availableSpan = angleEnd - angleStart;

      // 1단계 카테고리 노드에 최소 각도(약 25도)를 보장하여 커진 카테고리 박스가 절대 안 겹치게 처리
      if (depth === 0) {
        const minCatSlice = Math.min(0.45, availableSpan / children.length);
        const reservedSpan = minCatSlice * children.length;
        const remainingSpan = Math.max(0, availableSpan - reservedSpan);

        children.forEach(child => {
          const childLeaves = leavesCount[child] || 1;
          const proportionalSlice = totalChildLeaves > 0 ? (childLeaves / totalChildLeaves) * remainingSpan : 0;
          const slice = minCatSlice + proportionalSlice;

          placeRadial(child, currentAngle, currentAngle + slice, depth + 1);
          currentAngle += slice;
        });
      } else {
        children.forEach(child => {
          const childLeaves = leavesCount[child] || 1;
          const slice = (childLeaves / totalChildLeaves) * availableSpan;
          placeRadial(child, currentAngle, currentAngle + slice, depth + 1);
          currentAngle += slice;
        });
      }
    }
  };

  placeRadial('root-me', 0, 2 * Math.PI, 0);

  return positionedNodes;
};

// 기본 client_source 테이블 백업 맵 (네트워크 지연 대비)
const DEFAULT_SOURCE_MAP: Record<string, string> = {
  "1": "본인",
  "2": "지인",
  "3": "소개",
  "4": "DB",
  "5": "돌방",
  "6": "소모임",
  "7": "거점",
};

export default function CustomerMindmap() {
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const baseNodesRef = useRef<any[]>([]);
  const baseEdgesRef = useRef<any[]>([]);

  const [teamAgents, setTeamAgents] = useState<{ id: number; name: string; rank: string; isMe: boolean }[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [selectedAgentName, setSelectedAgentName] = useState<string>("");

  useEffect(() => {
    const fetchAgentsInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: myAgentData } = await supabase
        .from("agents")
        .select("id, name, rank, agency_id")
        .eq("auth_id", user.id)
        .single();

      if (!myAgentData) return;

      let agentsList = [{ 
        id: myAgentData.id, 
        name: myAgentData.name, 
        rank: myAgentData.rank || 'FC', 
        isMe: true 
      }];
      
      setSelectedAgentId(myAgentData.id);
      setSelectedAgentName(myAgentData.name);

      const { data: teamData } = await supabase
        .from("agents")
        .select("id, name, rank")
        .eq("agency_id", myAgentData.agency_id) 
        .neq("id", myAgentData.id);

      if (teamData && teamData.length > 0) {
        const members = teamData.map(member => ({ 
          id: member.id, 
          name: member.name, 
          rank: member.rank || 'FC', 
          isMe: false 
        }));
        agentsList = [...agentsList, ...members];
      }

      setTeamAgents(agentsList);
    };

    fetchAgentsInfo();
  }, []);

  useEffect(() => {
    if (!selectedAgentId) return;

    const fetchMindmapData = async () => {
      setIsLoading(true);
      setSearchTerm(""); 

      // ⭐️ 1. client_source 테이블과 clients 테이블을 동시에 조회
      const [sourcesRes, clientsRes] = await Promise.all([
        supabase.from('client_source').select('id, source').order('id'),
        supabase
          .from('clients')
          .select('id, name, introduce_client, client_source, recruiting_status')
          .eq('agent_id', selectedAgentId)
      ]);

      const clients = clientsRes.data;
      if (clientsRes.error || !clients) {
        setIsLoading(false);
        return;
      }

      // client_source ID -> 텍스트 매핑 객체 생성
      const sourceMap: Record<string, string> = { ...DEFAULT_SOURCE_MAP };
      if (sourcesRes.data) {
        sourcesRes.data.forEach((s: any) => {
          sourceMap[String(s.id)] = s.source;
        });
      }

      const validClientIds = new Set(clients.map(c => String(c.id)));

      // 각 고객별 소개 파생 인원수 집계
      const connectionCounts: Record<string, number> = {};
      clients.forEach(client => {
        if (client.introduce_client && validClientIds.has(String(client.introduce_client))) {
          const referrerId = String(client.introduce_client);
          connectionCounts[referrerId] = (connectionCounts[referrerId] || 0) + 1;
        }
      });

      // 고객의 유입경로 ID 및 이름 판별 함수
      const getClientSourceInfo = (client: any) => {
        const rawSource = client.client_source;
        if (rawSource !== null && rawSource !== undefined && sourceMap[String(rawSource)]) {
          return { id: String(rawSource), name: sourceMap[String(rawSource)] };
        }
        if (typeof rawSource === 'object' && rawSource?.source) {
          return { id: String(rawSource.id || 'etc'), name: rawSource.source };
        }
        return { id: 'etc', name: '미지정' };
      };

      // ⭐️ 2. 소개자가 없는(1차 시작점) 고객들이 속한 유입경로 분류(Category) 집계
      const categoryCounts: Record<string, { id: string; name: string; count: number }> = {};
      clients.forEach(client => {
        const hasValidReferrer = client.introduce_client && validClientIds.has(String(client.introduce_client));
        if (!hasValidReferrer) {
          const srcInfo = getClientSourceInfo(client);
          const catNodeId = `source-${srcInfo.id}`;
          if (!categoryCounts[catNodeId]) {
            categoryCounts[catNodeId] = { id: catNodeId, name: srcInfo.name, count: 0 };
          }
          categoryCounts[catNodeId].count += 1;
        }
      });

      const activeCategories = Object.values(categoryCounts);

      // ⭐️ 3. 노드 생성: 루트(나) + 유입경로 분류 노드들 + 고객 노드들
      const initialNodes: any[] = [
        {
          id: 'root-me',
          type: 'customClient',
          position: { x: 0, y: 0 },
          data: { 
            label: `${selectedAgentName}`, 
            isRoot: true, 
            totalClients: clients.length,
            isDimmed: false,
            isExactMatch: false
          },
        },
        // 1단계 유입경로 분류 노드 추가
        ...activeCategories.map((cat) => ({
          id: cat.id,
          type: 'customClient',
          position: { x: 0, y: 0 },
          data: {
            label: cat.name,
            count: cat.count,
            totalClients: clients.length,
            isCategory: true,
            isDimmed: false,
            isExactMatch: false
          }
        })),
        // 고객 노드 추가
        ...clients.map((client) => {
          const srcInfo = getClientSourceInfo(client);
          const hasValidReferrer = client.introduce_client && validClientIds.has(String(client.introduce_client));
          return {
            id: String(client.id),
            type: 'customClient',
            position: { x: 0, y: 0 },
            data: { 
              label: client.name,
              client_source: hasValidReferrer ? '소개' : srcInfo.name,
              connectionCount: connectionCounts[String(client.id)] || 0,
              recruiting_status: client.recruiting_status, 
              isDimmed: false,
              isExactMatch: false
            },
          };
        })
      ];

      // ⭐️ 4. 엣지(선) 생성: (나 -> 분류 노드) + (분류 노드 -> 1차 고객) + (소개자 -> 소개받은 고객)
      const categoryEdges = activeCategories.map((cat) => ({
        id: `e-root-me-${cat.id}`,
        source: 'root-me',
        target: cat.id,
        type: 'straight',
        animated: false,
        focusable: false,
        interactionWidth: 0,
        data: {
          originalWidth: 2,
          originalStroke: '#94a3b8',
          originalAnimated: false
        },
        style: {
          stroke: '#94a3b8',
          strokeWidth: 2,
          pointerEvents: 'none',
          transition: 'all 0.3s ease'
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#94a3b8',
        },
      }));

      const clientEdges = clients.map((client) => {
        const isValidReferrer = client.introduce_client && validClientIds.has(String(client.introduce_client));
        const srcInfo = getClientSourceInfo(client);
        // 소개자가 있으면 소개자에게 연결, 없으면 해당 유입경로 분류 노드에 연결
        const sourceId = isValidReferrer ? String(client.introduce_client) : `source-${srcInfo.id}`;
        const isDirectFromCategory = !isValidReferrer;

        return {
          id: `e-${sourceId}-${client.id}`,
          source: sourceId,
          target: String(client.id),
          type: 'straight', 
          animated: !isDirectFromCategory,
          focusable: false,
          interactionWidth: 0,
          data: {
            originalWidth: isDirectFromCategory ? 1.5 : 2,
            originalStroke: isDirectFromCategory ? '#cbd5e1' : '#60a5fa',
            originalAnimated: !isDirectFromCategory
          },
          style: { 
            stroke: isDirectFromCategory ? '#cbd5e1' : '#60a5fa', 
            strokeWidth: isDirectFromCategory ? 1.5 : 2,
            pointerEvents: 'none',
            transition: 'all 0.3s ease'
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isDirectFromCategory ? '#cbd5e1' : '#60a5fa',
          },
        };
      });

      const initialEdges = [...categoryEdges, ...clientEdges];
      const layoutedNodes = buildStrictRadialLayout(initialNodes, initialEdges, clients.length);

      baseNodesRef.current = layoutedNodes;
      baseEdgesRef.current = initialEdges;

      setNodes(layoutedNodes);
      setEdges(initialEdges);
      setIsLoading(false);
    };

    fetchMindmapData();
  }, [selectedAgentId, selectedAgentName, setNodes, setEdges]);

  // ⭐️ 검색어 경로 추적 및 하이라이트 알고리즘 (나 -> 분류 노드 -> 소개자 -> 타겟 고객 전체 추적)
  useEffect(() => {
    if (baseNodesRef.current.length === 0) return;

    const term = searchTerm.trim().toLowerCase();
    
    if (!term) {
      setNodes(baseNodesRef.current.map(n => ({ ...n, data: { ...n.data, isDimmed: false, isExactMatch: false } })));
      setEdges(baseEdgesRef.current.map(e => ({
        ...e,
        animated: e.data.originalAnimated,
        style: { ...e.style, opacity: 1, stroke: e.data.originalStroke, strokeWidth: e.data.originalWidth, zIndex: 0 },
        markerEnd: { type: MarkerType.ArrowClosed, color: e.data.originalStroke }
      })));
      return;
    }

    const parentMap = new Map();
    baseEdgesRef.current.forEach(e => {
      parentMap.set(e.target, e.source);
    });

    const exactMatchNodeIds = new Set();
    baseNodesRef.current.forEach(n => {
      // 루트 노드가 아니면서 이름(고객명 또는 분류명)이 검색어와 일치하면 매칭
      if (n.id !== 'root-me' && n.data.label.toLowerCase().includes(term)) {
        exactMatchNodeIds.add(n.id);
      }
    });

    const pathNodeIds = new Set();
    const pathEdgeIds = new Set();

    exactMatchNodeIds.forEach(id => {
      let currentId = id;
      pathNodeIds.add(currentId);
      
      while (currentId && currentId !== 'root-me') {
        const parentId = parentMap.get(currentId);
        if (parentId) {
          pathNodeIds.add(parentId);
          pathEdgeIds.add(`e-${parentId}-${currentId}`);
          currentId = parentId;
        } else {
          break;
        }
      }
    });

    const nextNodes = baseNodesRef.current.map(n => {
      const isOnPath = pathNodeIds.has(n.id);
      const isExactMatch = exactMatchNodeIds.has(n.id);
      const isRoot = n.id === 'root-me';
      const isDimmed = exactMatchNodeIds.size === 0 ? !isRoot : (!isOnPath && !isRoot);

      return {
        ...n,
        data: { ...n.data, isDimmed, isExactMatch }
      };
    });

    const nextEdges = baseEdgesRef.current.map(e => {
      const isOnPath = pathEdgeIds.has(e.id);
      return {
        ...e,
        animated: isOnPath ? true : e.data.originalAnimated,
        style: {
          ...e.style,
          stroke: isOnPath ? '#3b82f6' : '#f1f5f9',
          strokeWidth: isOnPath ? 3 : e.data.originalWidth,
          opacity: isOnPath ? 1 : 0.15,
          zIndex: isOnPath ? 10 : 0
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isOnPath ? '#3b82f6' : '#f1f5f9'
        }
      };
    });

    setNodes(nextNodes);
    setEdges(nextEdges);
  }, [searchTerm, setNodes, setEdges]);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    // 루트 노드와 유입경로 분류 노드는 클릭 시 페이지 이동 제외
    if (!node.data.isRoot && !node.data.isCategory) {
      router.push(`/clients/${node.id}`);
    }
  }, [router]);

  return (
    <div className="w-full h-screen bg-slate-50 relative flex flex-col overflow-hidden">
      <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur px-6 py-4 rounded-2xl border border-gray-200 shadow-sm min-w-[280px]">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => router.back()}
            title="이전 페이지로 돌아가기"
            className="cursor-pointer p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 border border-slate-200/60 transition-all active:scale-95 shadow-2xs shrink-0"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-1.5">
            <Zap className="w-5 h-5 text-blue-500 shrink-0" />
            고객조직도
          </h1>
        </div>
        <p className="text-[10px] font-bold text-slate-400 mt-1 mb-3">
          유입경로별 시작점과 소개 파생 네트워크를 확인하세요.
        </p>

        {teamAgents.length > 0 && (
          <div className="relative mb-3">
            <select
              className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              value={selectedAgentId || ""}
              onChange={(e) => {
                const targetId = Number(e.target.value);
                const targetAgent = teamAgents.find(a => a.id === targetId);
                if (targetAgent) {
                  setSelectedAgentId(targetAgent.id);
                  setSelectedAgentName(targetAgent.name);
                }
              }}
            >
              {teamAgents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} {agent.isMe ? '(나)' : `(${agent.rank})`}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        )}

        <div className="relative mb-4">
          <input 
            type="text" 
            placeholder="고객명 또는 유입경로 검색..." 
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold py-2 pl-9 pr-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-bold pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-700">
            <FolderGit2 className="w-3 h-3 text-indigo-500" /> 유입경로 분류
          </div>
          <div className="flex items-center gap-1.5 text-amber-500">
            <Crown className="w-3 h-3" /> VIP (허브 고객)
          </div>
          <div className="flex items-center gap-1.5 text-purple-600">
            <UserPlus className="w-3 h-3" /> 리크루팅 타겟
          </div>
          <div className="flex items-center gap-1.5 text-blue-500">
            <div className="w-3 h-[2px] bg-blue-500"></div> 소개 파생
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center font-bold text-blue-600">
          데이터 정렬 중...
        </div>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick} 
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.05}
          className="bg-slate-50"
        >
          <Background color="#94a3b8" gap={30} size={1.5} />
        </ReactFlow>
      )}
    </div>
  );
}