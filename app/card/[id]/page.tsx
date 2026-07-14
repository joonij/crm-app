// app/card/[id]/page.tsx
import { supabase } from "@/lib/supabase";
import { User, Phone, Mail, MapPin, Printer, Quote } from "lucide-react";

export default async function CardPage({ params }: { params: { id: string } }) {
  // 1. URL의 [id] 값을 사용해 DB에서 해당 설계사 정보 조회
  const { data: profile, error } = await supabase
    .from("agents")
    .select(`
      id, name, phone, email, bio, office_address, fax, rank, avatar_url,
      agencies (corporation_name, branch_name)
    `)
    .eq("id", params.id)
    .single();

  // 2. 정보가 없거나 에러가 나면 404 문구 표시
  if (error || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="text-center text-gray-500 font-bold">
          삭제되었거나 유효하지 않은 명함입니다.
        </div>
      </div>
    );
  }

  const agency = Array.isArray(profile.agencies) ? profile.agencies[0] : profile.agencies;

  // 3. 고객에게 보여질 모바일 명함 화면
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      {/* 명함 본체 (모바일 사이즈에 맞춤) */}
      <div className="w-full max-w-[380px] bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
        
        {/* 상단 프로필 이미지 영역 */}
        <div className="h-72 relative">
          <div className="w-full h-full bg-slate-50 flex items-center justify-center">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-16 h-16 text-gray-300" />
            )}
          </div>
          {/* 하단 그라데이션 효과 */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
        </div>
        
        {/* 하단 정보 영역 */}
        <div className="px-6 pb-8 relative -mt-4">
          <div className="space-y-1">
            <p className="text-blue-600 font-extrabold text-sm tracking-tight">
              {agency?.corporation_name} {agency?.branch_name}
            </p>
            <div className="flex items-baseline gap-2">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">{profile.name}</h1>
              <span className="text-base font-bold text-gray-500">{profile.rank}</span>
            </div>
          </div>

          {/* 한 줄 소개 (bio) */}
          {profile.bio && (
            <div className="mt-5 bg-gray-50 rounded-2xl p-4 relative">
              <Quote className="absolute top-2 left-2 w-4 h-4 text-gray-200 rotate-180" />
              <p className="text-sm font-medium text-gray-700 leading-relaxed text-center px-4">
                {profile.bio}
              </p>
              <Quote className="absolute bottom-2 right-2 w-4 h-4 text-gray-200" />
            </div>
          )}

          {/* 연락처 등 상세 정보 */}
          <div className="mt-6 space-y-4 text-left border-t border-gray-100 pt-6">
            <a href={`tel:${profile.phone}`} className="flex items-center gap-3 text-sm text-gray-700 font-medium hover:bg-slate-50 p-2 -ml-2 rounded-xl transition-colors">
              <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <span className="tracking-wide">{profile.phone || "연락처 미등록"}</span>
            </a>
            
            <div className="flex items-center gap-3 text-sm text-gray-700 font-medium px-2">
              <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Printer className="w-4 h-4" />
              </div>
              <span className="tracking-wide">{profile.fax || "팩스 미등록"}</span>
            </div>

            <a href={`mailto:${profile.email}`} className="flex items-center gap-3 text-sm text-gray-700 font-medium hover:bg-slate-50 p-2 -ml-2 rounded-xl transition-colors">
              <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <span className="truncate">{profile.email}</span>
            </a>

            <div className="flex items-start gap-3 text-sm text-gray-700 font-medium px-2">
              <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="leading-snug">{profile.office_address || "주소 미등록"}</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}