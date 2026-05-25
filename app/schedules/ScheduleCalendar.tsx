"use client";

import { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, EventInput } from "@fullcalendar/core";
import koLocale from "@fullcalendar/core/locales/ko";
import "./calendar-notion.css";

function formatDateOffset(daysFromToday: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const mockEvents: EventInput[] = [
  {
    id: "1",
    title: "초회 면담 - 김고객 (강남)",
    start: formatDateOffset(2),
    classNames: ["fc-event-blue"],
  },
  {
    id: "2",
    title: "기존 증권 분석 전달",
    start: formatDateOffset(5),
    classNames: ["fc-event-green"],
  },
  {
    id: "3",
    title: "팀 월간 회의",
    start: formatDateOffset(9),
    classNames: ["fc-event-gray"],
  },
];

export default function ScheduleCalendar() {
  const events = useMemo(() => mockEvents, []);

  const handleEventClick = (info: EventClickArg) => {
    console.log(info.event.title);
  };

  return (
    <div className="notion-calendar-wrapper">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={koLocale}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "",
        }}
        height="auto"
        fixedWeekCount={false}
        dayMaxEvents={3}
        events={events}
        eventClick={handleEventClick}
        className="notion-calendar"
      />
    </div>
  );
}
