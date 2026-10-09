"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";

export interface AvailabilityCalendarProps {
  bookedDates?: string[];
  isAvailable?: boolean;
  blackoutDates?: string[];
  statusNote?: string;
  onSelectDate?: (dateStr: string) => void;
  selectedDate?: string;
}

export function AvailabilityCalendar({
  bookedDates = [],
  isAvailable = true,
  blackoutDates = [],
  statusNote,
  onSelectDate,
  selectedDate,
}: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  // Normalize booked dates into a Set of YYYY-MM-DD
  const bookedSet = useMemo(() => new Set(bookedDates), [bookedDates]);
  const blackoutSet = useMemo(() => new Set(blackoutDates), [blackoutDates]);

  // Calculate booked days in this visible month
  const bookedCountInMonth = useMemo(() => {
    let count = 0;
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = String(d).padStart(2, "0");
      const fullDateStr = `${year}-${month}-${dayStr}`;
      if (bookedSet.has(fullDateStr)) count++;
    }
    return count;
  }, [currentDate, daysInMonth, bookedSet]);

  const getDateStr = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    return `${year}-${month}-${dayStr}`;
  };

  const getDayStatus = (day: number) => {
    const fullDateStr = getDateStr(day);
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (date < todayStart) {
      return "past";
    }

    if (!isAvailable) {
      return "paused";
    }

    if (bookedSet.has(fullDateStr)) {
      return "booked";
    }

    if (blackoutSet.has(fullDateStr)) {
      return "blackout";
    }

    return "available";
  };

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-emerald-600" />
            <span>Kalender Ketersediaan &amp; Jadwal Riil</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Sinkronisasi langsung dengan status pesanan SPK terkonfirmasi untuk mencegah tabrakan jadwal kerja (*double-booking*).
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Tersedia
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span> Terisi SPK
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-slate-300"></span> Lampau
          </div>
        </div>
      </div>

      {/* Status Note jika ada */}
      {statusNote && (
        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <span><strong>Catatan Jadwal:</strong> {statusNote}</span>
        </div>
      )}

      {!isAvailable && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>
            <strong>Sedang Penuh / Cuti:</strong> Profil talenta saat ini tidak menerima pemesanan slot baru.
          </span>
        </div>
      )}

      {/* Calendar Grid Container */}
      <div className="bg-slate-50/60 rounded-xl border border-slate-200/80 p-4 space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            title="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h4>
            {bookedCountInMonth > 0 && (
              <span className="text-[10px] font-semibold text-rose-600">
                {bookedCountInMonth} slot telah terisi bulan ini
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            title="Bulan Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day Name Columns */}
        <div className="grid grid-cols-7 text-center">
          {dayNames.map((day) => (
            <div key={day} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Date Tiles */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square"></div>
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const fullDateStr = getDateStr(day);
            const status = getDayStatus(day);
            const isSelected = selectedDate === fullDateStr;

            let tileClasses = "";
            let titleText = "";

            if (status === "past") {
              tileClasses = "bg-slate-100/40 text-slate-300 border-transparent cursor-not-allowed opacity-60";
              titleText = "Tanggal lampau";
            } else if (status === "paused") {
              tileClasses = "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed";
              titleText = "Talenta sedang tidak menerima order";
            } else if (status === "booked") {
              tileClasses = "bg-rose-50 text-rose-700 border-rose-200 cursor-not-allowed line-through font-semibold";
              titleText = `Sudah terisi SPK terkonfirmasi (${day} ${monthNames[currentDate.getMonth()]})`;
            } else if (status === "blackout") {
              tileClasses = "bg-slate-200 text-slate-500 border-slate-300 cursor-not-allowed line-through";
              titleText = "Tanggal ditandai cuti / tidak tersedia";
            } else {
              // Available
              if (isSelected) {
                tileClasses = "btn-primary-pill text-white border-[#4CC9FE] shadow-md shadow-[#4CC9FE]/30 ring-2 ring-[#4CC9FE]/40 font-bold cursor-pointer";
              } else {
                tileClasses = "bg-white text-emerald-950 border-emerald-200/90 hover:bg-emerald-50 hover:border-emerald-400 cursor-pointer font-bold shadow-2xs";
              }
              titleText = `Klik untuk memilih slot tanggal ${day} ${monthNames[currentDate.getMonth()]}`;
            }

            return (
              <button
                key={day}
                type="button"
                disabled={status !== "available"}
                onClick={() => {
                  if (status === "available" && onSelectDate) {
                    onSelectDate(fullDateStr);
                  }
                }}
                className={`relative aspect-square flex flex-col items-center justify-center rounded-xl border text-xs sm:text-sm transition-all duration-150 ${tileClasses}`}
                title={titleText}
              >
                <span>{day}</span>
                {status === "available" && !isSelected && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-500"></span>
                )}
                {isSelected && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-400"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Notice & Action Footer */}
      {selectedDate && (
        <div className="p-3.5 rounded-xl bg-sky-50/90 text-sky-950 border border-[#4CC9FE]/30 flex items-center justify-between gap-3 text-xs shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0284c7] shrink-0" />
            <span>
              Tanggal dipilih:{" "}
              <strong>
                {new Date(selectedDate).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </strong>
            </span>
          </div>
          <span className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
            Slot Tersedia
          </span>
        </div>
      )}
    </div>
  );
}
