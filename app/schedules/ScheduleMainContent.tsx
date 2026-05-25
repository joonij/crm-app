"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Plus } from "lucide-react";
import ScheduleCalendar from "./ScheduleCalendar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const CATEGORY_OPTIONS = [
  "고객 미팅",
  "증권 전달",
  "팀 회의",
  "개인 일정",
] as const;

const inputClassName =
  "w-full rounded-md border border-transparent bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-gray-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-200";

const labelClassName = "mb-1.5 block text-xs font-medium text-gray-500";

type FormState = {
  title: string;
  startDateTime: string;
  endDateTime: string;
  category: string;
  content: string;
};

const initialFormState: FormState = {
  title: "",
  startDateTime: "",
  endDateTime: "",
  category: "",
  content: "",
};

export default function ScheduleMainContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initialFormState);

  const openModal = () => setIsModalOpen(true);

  const closeModal = () => {
    setIsModalOpen(false);
    setForm(initialFormState);
  };

  const handleSave = async () => {
    const { error } = await supabase.from("Schedules").insert({
      title: form.title,
      start_datetime: form.startDateTime,
      end_datetime: form.endDateTime,
      category: form.category,
      content: form.content,
      agent_id: 1,
    });

    if (error) {
      console.error(error.message);
      return;
    }

    closeModal();
  };

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <header className="mb-10 flex items-start justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-gray-900">
            📅 스케줄 관리
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            팀원들과 고객 미팅 일정을 조율하세요.
          </p>
        </div>
        <button
          type="button"
          onClick={openModal}
          className="inline-flex shrink-0 items-center gap-2 rounded-md bg-gray-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-900"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          새 일정 추가
        </button>
      </header>

      <section className="rounded-lg border border-gray-200 p-6">
        <ScheduleCalendar />
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="모달 닫기"
            className="absolute inset-0 bg-black/50"
            onClick={closeModal}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-schedule-title"
            className="relative z-10 w-full max-w-md rounded-lg bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-100 px-6 py-5">
              <h3
                id="add-schedule-title"
                className="text-lg font-semibold text-gray-900"
              >
                새 일정 추가
              </h3>
            </div>

            <form
              className="space-y-5 px-6 py-5"
              onSubmit={(e) => {
                e.preventDefault();
                void handleSave();
              }}
            >
              <div>
                <label htmlFor="schedule-title" className={labelClassName}>
                  일정 제목
                </label>
                <input
                  id="schedule-title"
                  type="text"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="일정 제목을 입력하세요"
                  className={inputClassName}
                />
              </div>

              <div>
                <span className={labelClassName}>일시</span>
                <div className="space-y-2">
                  <input
                    id="schedule-start"
                    type="datetime-local"
                    value={form.startDateTime}
                    onChange={(e) =>
                      updateField("startDateTime", e.target.value)
                    }
                    className={inputClassName}
                    aria-label="시작 날짜 및 시간"
                  />
                  <input
                    id="schedule-end"
                    type="datetime-local"
                    value={form.endDateTime}
                    onChange={(e) => updateField("endDateTime", e.target.value)}
                    className={inputClassName}
                    aria-label="종료 날짜 및 시간"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="schedule-category" className={labelClassName}>
                  분류 태그
                </label>
                <select
                  id="schedule-category"
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className={`${inputClassName} cursor-pointer`}
                >
                  <option value="" disabled>
                    분류를 선택하세요
                  </option>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="schedule-content" className={labelClassName}>
                  내용
                </label>
                <textarea
                  id="schedule-content"
                  rows={4}
                  value={form.content}
                  onChange={(e) => updateField("content", e.target.value)}
                  placeholder="장소나 특이사항을 메모하세요"
                  className={`${inputClassName} resize-none`}
                />
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-900"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
