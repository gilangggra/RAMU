"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, XCircle } from "lucide-react";

export function AvailabilityCalendar() {
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

  // Mock availability logic:
  // - Weekends (0, 6) are mostly free
  // - Some random weekdays are booked
  const getDayStatus = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayOfWeek = date.getDay();
    const today = new Date();
    
    // Past dates
    if (date < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
      return "past";
    }

    // Mock booked dates (e.g., multiples of 5 or 7 just for demo)
    if (day % 5 === 0 || day % 7 === 0) {
      return "booked";
    }

    return "available";
  };

  return (
    <div className="p-6 rounded-[32px] bg-white/95 border border-stone-200/80 shadow-[0_4px_20px_rgba(39,33,61,0.03)] space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-[#27213D] flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-emerald-600" />
          <span>Kalender Ketersediaan</span>
        </h3>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-500 uppercase">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-100 border border-emerald-300"></span> Tersedia
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-500 uppercase">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-100 border border-stone-200"></span> Penuh
          </div>
        </div>
      </div>

      <div className="bg-stone-50 rounded-2xl border border-stone-200/50 p-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4 px-2">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-500 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h4 className="text-sm font-black text-[#27213D]">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h4>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-500 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-[10px] font-bold text-stone-400 uppercase tracking-wider py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Empty slots for first days */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square"></div>
          ))}
          
          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const status = getDayStatus(day);
            
            let statusClasses = "";
            if (status === "past") {
              statusClasses = "bg-stone-50 text-stone-300 border-transparent opacity-50 cursor-not-allowed";
            } else if (status === "booked") {
              statusClasses = "bg-stone-100 text-stone-400 border-stone-200/50 cursor-not-allowed line-through decoration-stone-300";
            } else {
              statusClasses = "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 hover:-translate-y-0.5 hover:shadow-sm cursor-pointer font-bold";
            }

            return (
              <div 
                key={day} 
                className={`relative aspect-square flex flex-col items-center justify-center rounded-xl border transition-all duration-200 ${statusClasses}`}
                title={status === "available" ? `Tersedia pada ${day} ${monthNames[currentDate.getMonth()]}` : status === "booked" ? "Sudah dipesan" : ""}
              >
                <span className="text-xs sm:text-sm">{day}</span>
                {status === "available" && (
                  <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-emerald-500"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
