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
import { Users, Crown, Zap, User, ChevronDown, Search, UserPlus } from 'lucide-react';

// --- 1. 테마 및 리크루팅(보라색) 조건이 추가된 커스텀 노드 ---
const ClientNode = ({ data }: { data: any }) => {
  const isRoot = data.isRoot;
  const isVIP = data.connectionCount >= 3; 
  const hasRecruiting = !!data.recruiting_status; 
  const isDimmed = data.isDimmed; 
  const isExactMatch = data.isExactMatch; // 검색어와 직접 일치하는 노드 강조용

  if (isRoot) {
    return (
      <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex flex-col items-center justify-center text-white shadow-xl ring-8 ring-blue-100 z-50 transition-all duration-300 cursor-pointer ${isDimmed ? 'opacity-20 grayscale' : 'opacity-100 hover:scale-105'}`}>
        <User className="w-8 h-8 mb-1 text-blue-200" />
        <span className="text-sm font-black text-center px-2 leading-tight">{data.label}</span>
        <span className="text-[10px] text-blue-100 font-bold mt-1 bg-blue-900/40 px-2 py-0.5 rounded-full">
          총 {data.totalClients}명
        </span>
        <Handle type="source" position={Position.Bottom} className="opacity-0" style={{ top: '50%', left: '50%' }} />
        <Handle type="target" position={Position.Top} className="opacity-0" style={{ top: '50%', left: '50%' }} />
      </div>
    );
  }

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

  // 검색된 당사자라면 파란색 테두리로 한 번 더 강하게 강조
  if (isExactMatch) {
    borderClass = 'border-blue-500 ring-4 ring-blue-200 shadow-blue-200';
  }

  const dimClass = isDimmed ? 'opacity-20 grayscale pointer-events-none' : 'opacity-100 hover:scale-110 cursor-pointer';

  return (
    <div className={`px-4 py-2 rounded-full border bg-white flex items-center gap-2 transition-all duration-300 shadow-sm z-40 ${borderClass} ${dimClass}`}>
      <Handle type="target" position={Position.Top} className="opacity-0" style={{ top: '50%', left: '50%' }} />
      
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${iconBgClass}`}>
        <IconComponent className="w-4 h-4" />
      </div>
      
      <div className="flex flex-col pr-2">
        <span className={`text-xs font-black ${textClass}`}>{data.label}</span>
        <span className="text-[8px] font-bold text-slate-400">{data.client_source || '직접 발굴'}</span>
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

// --- 2. 선 교차 방지 방사형 알고리즘 ---
const buildStrictRadialLayout = (nodes: any[], edges: any[]) => {
  const adj: Record<string, string[]> = {};
  edges.forEach(e => {
    if (!adj[e.source]) adj[e.source] = [];
    adj[e.source].push(e.target);
  });

  const leavesCount: Record<string, number> = {};
  const getLeaves = (id: string) => {
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
  const minRadiusStep = Math.max(300, (totalLeaves * 100) / (2 * Math.PI));

  const positionedNodes = [...nodes];
  const nodeMap = new Map(positionedNodes.map(n => [n.id, n]));

  const placeRadial = (nodeId: string, angleStart: number, angleEnd: number, depth: number) => {
    const node = nodeMap.get(nodeId);
    if (!node) return;

    const angle = (angleStart + angleEnd) / 2;
    const radius = depth === 0 ? 0 : minRadiusStep + (depth - 1) * 250; 

    node.position = {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    };

    const children = adj[nodeId] || [];
    if (children.length > 0) {
      const totalChildLeaves = children.reduce((sum, child) => sum + (leavesCount[child] || 1), 0);
      let currentAngle = angleStart;
      
      children.forEach(child => {
        const childLeaves = leavesCount[child] || 1;
        const slice = (childLeaves / totalChildLeaves) * (angleEnd - angleStart);
        placeRadial(child, currentAngle, currentAngle + slice, depth + 1);
        currentAngle += slice;
      });
    }
  };

  placeRadial('root-me', 0, 2 * Math.PI, 0);

  return positionedNodes;
};

export default function CustomerMindmap() {
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
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

      const { data: clients, error } = await supabase
        .from('clients')
        .select('id, name, introduce_client, client_source, recruiting_status')
        .eq('agent_id', selectedAgentId); 

      if (error || !clients) {
        setIsLoading(false);
        return;
      }

      const validClientIds = new Set(clients.map(c => String(c.id)));

      const connectionCounts: Record<string, number> = {};
      clients.forEach(client => {
        if (client.introduce_client && validClientIds.has(String(client.introduce_client))) {
          const referrerId = String(client.introduce_client);
          connectionCounts[referrerId] = (connectionCounts[referrerId] || 0) + 1;
        }
      });

      const getSourceName = (source: any) => {
        if (!source) return null;
        if (typeof source === 'string') return source;
        if (source.name) return source.name;
        return '소개';
      };

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
        ...clients.map((client) => ({
          id: String(client.id),
          type: 'customClient',
          position: { x: 0, y: 0 },
          data: { 
            label: client.name,
            client_source: getSourceName(client.client_source),
            connectionCount: connectionCounts[String(client.id)] || 0,
            recruiting_status: client.recruiting_status, 
            isDimmed: false,
            isExactMatch: false
          },
        }))
      ];

      const initialEdges = clients.map((client) => {
        const isValidReferrer = client.introduce_client && validClientIds.has(String(client.introduce_client));
        const sourceId = isValidReferrer ? String(client.introduce_client) : 'root-me';
        const isDirect = sourceId === 'root-me';

        return {
          id: `e-${sourceId}-${client.id}`,
          source: sourceId,
          target: String(client.id),
          type: 'straight', 
          animated: !isDirect,
          focusable: false,
          interactionWidth: 0,
          data: {
            originalWidth: isDirect ? 1.5 : 2,
            originalStroke: isDirect ? '#e2e8f0' : '#60a5fa',
            originalAnimated: !isDirect
          },
          style: { 
            stroke: isDirect ? '#e2e8f0' : '#60a5fa', 
            strokeWidth: isDirect ? 1.5 : 2,
            pointerEvents: 'none',
            transition: 'all 0.3s ease'
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isDirect ? '#e2e8f0' : '#60a5fa',
          },
        };
      });

      const layoutedNodes = buildStrictRadialLayout(initialNodes, initialEdges);

      baseNodesRef.current = layoutedNodes;
      baseEdgesRef.current = initialEdges;

      setNodes(layoutedNodes);
      setEdges(initialEdges);
      setIsLoading(false);
    };

    fetchMindmapData();
  }, [selectedAgentId, selectedAgentName, setNodes, setEdges]);

  // ⭐️ 검색어 경로 추적 및 하이라이트 알고리즘
  useEffect(() => {
    if (baseNodesRef.current.length === 0) return;

    const term = searchTerm.trim().toLowerCase();
    
    // 검색어가 없으면 원상복구
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

    // 1. 자식(target)에서 부모(source)를 찾기 위한 맵 생성
    const parentMap = new Map();
    baseEdgesRef.current.forEach(e => {
      parentMap.set(e.target, e.source);
    });

    // 2. 검색어와 직접 일치하는 고객 노드 찾기
    const exactMatchNodeIds = new Set();
    baseNodesRef.current.forEach(n => {
      if (n.id !== 'root-me' && n.data.label.toLowerCase().includes(term)) {
        exactMatchNodeIds.add(n.id);
      }
    });

    // 3. 일치하는 노드부터 뿌리(root-me)까지 역추적하여 경로상의 모든 노드와 엣지 수집
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

    // 4. 경로에 포함된 노드와 엣지만 선명하게 표시하고 나머지는 블러 처리
    const nextNodes = baseNodesRef.current.map(n => {
      const isOnPath = pathNodeIds.has(n.id);
      const isExactMatch = exactMatchNodeIds.has(n.id);
      const isRoot = n.id === 'root-me';
      
      // 검색 결과가 아예 없다면 나(root)를 제외한 모두 흐림 처리
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
          stroke: isOnPath ? '#3b82f6' : '#f1f5f9', // 경로에 있으면 선명한 파란색
          strokeWidth: isOnPath ? 3 : e.data.originalWidth, // 경로에 있으면 선을 굵게
          opacity: isOnPath ? 1 : 0.15, // 경로가 아니면 투명도 확 낮춤
          zIndex: isOnPath ? 10 : 0 // 하이라이트된 선이 위로 올라오도록 설정
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
    if (!node.data.isRoot) {
      router.push(`/clients/${node.id}`);
    }
  }, [router]);

  return (
    <div className="w-full h-screen bg-slate-50 relative flex flex-col overflow-hidden">
      <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur px-6 py-4 rounded-2xl border border-gray-200 shadow-sm min-w-[280px]">
        <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-500" />
          네트워크 인텔리전스
        </h1>
        <p className="text-[10px] font-bold text-slate-400 mt-1 mb-3">
          사방으로 뻗어나가는 고객 네트워크를 확인하세요.
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
            placeholder="고객 이름 검색..." 
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold py-2 pl-9 pr-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-bold pt-2 border-t border-slate-100">
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
          네트워크 데이터 정렬 중...
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