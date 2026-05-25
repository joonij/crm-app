import Link from "next/link";
import ScheduleMainContent from "./ScheduleMainContent";

const menuItems = [
  { label: "홈", href: "/", active: false },
  { label: "내 고객 관리", href: null, active: false },
  { label: "스케줄 관리", href: "/schedules", active: true },
  { label: "비서 요청", href: null, active: false },
  { label: "설정", href: null, active: false },
];

export default function SchedulesPage() {
  return (
    <div className="flex min-h-screen bg-white">
      {/* 왼쪽 사이드바 */}
      <aside className="flex w-[250px] shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-6">
          <h1 className="text-xl font-bold text-gray-900">CRM Pro</h1>
        </div>

        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.label}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={`block w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                      item.active
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    className={`w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                      item.active
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {item.label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-gray-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
              정
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">정준희 ASM</p>
              <p className="text-xs text-gray-500">한강 6팀</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 오른쪽 메인 콘텐츠 — Notion 스타일 */}
      <main className="flex-1 overflow-y-auto bg-white px-12 py-10">
        <ScheduleMainContent />
      </main>
    </div>
  );
}
