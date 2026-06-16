import Link from "next/link";
import { BookOpen, GraduationCap, Lock, ShieldCheck, Stethoscope, Users } from "lucide-react";

const trainingModules = [
  { id: 1, title: "라이프사이클과 보험", desc: "인생주기 및 3대 자산의 이해", icon: Users, isReady: false },
  { id: 2, title: "저축성 상품", desc: "목적자금 및 비과세 전략", icon: BookOpen, isReady: true, href: "/training/savings" },
  { id: 3, title: "보장성 상품", desc: "질병 및 상해 리스크 관리", icon: ShieldCheck, isReady: false },
  { id: 4, title: "실손의료비 변천사", desc: "1세대부터 4세대까지 비교", icon: Stethoscope, isReady: true, href: "/training/silbi" },
  { id: 5, title: "계약 전 알릴의무", desc: "고지의무 및 분쟁사례 가이드", icon: GraduationCap, isReady: false },
  { id: 6, title: "보험상담 프로세스", desc: "니즈환기 및 클로징 기법", icon: Users, isReady: false },
];

export default function TrainingDashboard() {
  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 space-y-8 pb-24">
      {/* 타이틀 섹션 */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-800 rounded-2xl p-6 md:p-8 text-white shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-3">
          <GraduationCap className="w-8 h-8" />
          사내 보험 마스터 교육
        </h1>
        <p className="text-blue-100 text-sm md:text-base">
          팀원들의 영업 역량 강화를 위한 단계별 실무 프로세스 자료입니다.
        </p>
      </section>

      {/* 교육 모듈 그리드 */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainingModules.map((module) => {
          const Icon = module.icon;
          
          if (!module.isReady) {
            return (
              <div key={module.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 opacity-60 cursor-not-allowed">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-200 text-gray-500">
                    <Icon className="h-6 w-6" />
                  </div>
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-1">0{module.id}. {module.title}</h3>
                <p className="text-sm text-gray-500">{module.desc}</p>
                <div className="mt-4 inline-block px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
                  준비 중
                </div>
              </div>
            );
          }

          return (
            <Link href={module.href!} key={module.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">0{module.id}. {module.title}</h3>
              <p className="text-sm text-gray-500">{module.desc}</p>
              <div className="mt-4 inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-200">
                학습하기
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}