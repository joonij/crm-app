const menuItems = [
  { label: "홈", active: true },
  { label: "내 고객 관리", active: false },
  { label: "스케줄 관리", active: false },
  { label: "비서 요청", active: false },
  { label: "설정", active: false },
];

const stats = [
  {
    title: "당월 누적 환산 성적",
    value: "1,250",
    unit: "만 원",
    accent: "bg-blue-500",
  },
  {
    title: "예상 수수료 (4년 분급 기준)",
    value: "580",
    unit: "만 원",
    accent: "bg-emerald-500",
  },
  {
    title: "진행 중인 비서 요청",
    value: "3",
    unit: "건",
    accent: "bg-amber-500",
  },
];

const todaySchedule = [
  {
    time: "오전 10:00",
    title: "신규 고객 보장 분석",
    location: "강남역",
  },
  {
    time: "오후 2:00",
    title: "팀 미팅 및 피드백",
    location: null,
  },
  {
    time: "오후 4:30",
    title: "기존 고객 증권 전달",
    location: null,
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 왼쪽 사이드바 */}
      <aside className="flex w-[250px] shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 py-6">
          <h1 className="text-xl font-bold text-gray-900">CRM Pro</h1>
        </div>

        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.label}>
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
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-gray-100 px-6 py-5">
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

      {/* 오른쪽 메인 콘텐츠 */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            환영합니다, 정준희 ASM님!
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            오늘도 고객과 함께하는 하루 되세요.
          </p>
        </header>

        {/* 핵심 데이터 카드 */}
        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${stat.accent}`} />
                <p className="text-sm font-medium text-gray-500">
                  {stat.title}
                </p>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {stat.value}
                <span className="ml-1 text-lg font-semibold text-gray-500">
                  {stat.unit}
                </span>
              </p>
            </div>
          ))}
        </section>

        {/* 오늘의 스케줄 */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-lg font-bold text-gray-900">
            오늘의 스케줄
          </h3>
          <ul className="divide-y divide-gray-100">
            {todaySchedule.map((item) => (
              <li
                key={item.time}
                className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
              >
                <span className="w-24 shrink-0 text-sm font-semibold text-blue-600">
                  {item.time}
                </span>
                <div>
                  <p className="font-medium text-gray-900">{item.title}</p>
                  {item.location && (
                    <p className="mt-0.5 text-sm text-gray-500">
                      {item.location}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
