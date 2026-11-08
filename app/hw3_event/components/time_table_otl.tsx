'use client';

import React from 'react';
import { useState, useEffect, useRef } from 'react';

type SelectedTimeRange = {
  day: number;
  startMinute: number;
  endMinute: number;
};

const TimeTableOTL: React.FC = () => {

  const [selectedRange, setSelectedRange] = useState<SelectedTimeRange | null>(null);
  const dragAnchor = useRef<{ day: number; minute: number } | null>(null);
  const timetableSurface = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const finishDragging = () => {
      dragAnchor.current = null;
    }; // 마우스 놓으면 선택 해제

    const clearOutsideSelection = (clickEvent: MouseEvent) => {
      if (
        clickEvent.target instanceof Node &&
        !timetableSurface.current?.contains(clickEvent.target)
      ) {
        setSelectedRange(null);
        finishDragging();
      }
    };

    document.addEventListener('mouseup', finishDragging);
    document.addEventListener('mousedown', clearOutsideSelection);

    return () => {
      document.removeEventListener('mouseup', finishDragging);
      document.removeEventListener('mousedown', clearOutsideSelection);
    };
  }, []);

  const startSelecting = (
    mouseEvent: React.MouseEvent<HTMLDivElement>,
    day: number,
    minute: number,
  ) => {
    if (mouseEvent.button !== 0) return;

    mouseEvent.preventDefault(); // 다른거 선택 방지
    dragAnchor.current = { day, minute };
    setSelectedRange({ day, startMinute: minute, endMinute: minute });
  };

  const extendSelection = (
    mouseEvent: React.MouseEvent<HTMLDivElement>,
    day: number,
    minute: number,
  ) => {
    if ((mouseEvent.buttons & 1) === 0) {
      dragAnchor.current = null;
      return;
    }

    const anchor = dragAnchor.current;
    if (!anchor || anchor.day !== day) return;

    setSelectedRange({
      day,
      startMinute: Math.min(anchor.minute, minute),
      endMinute: Math.max(anchor.minute, minute),
    });
  };

  // 요일 배열
  const days = ['월요일', '화요일', '수요일', '목요일', '금요일'];

  // 시간 라벨 생성 (8시부터 12시까지)
  const generateTimeLabels = () => {
    const labels = [];

    // 오전 8시부터 오후 11시까지
    for (let hour = 8; hour <= 23; hour++) {
      // 정시
      let displayHour: string | number = hour;
      if (hour > 12) displayHour = hour - 12;
      if (hour === 12 || hour === 18 || hour === 0) {
        labels.push(<span key={`hour-${hour}`} className="font-bold w-4 text-center">{displayHour}</span>);
      } else {
        labels.push(<span key={`hour-${hour}`} className="w-4 text-center">{displayHour}</span>);
      }

      // 정시 이후 빈 칸
      labels.push('');

      // 30분 이후 빈 칸
      labels.push('');
    }

    // 마지막 자정
    labels.push(<strong key="hour-24" className="font-bold w-4 text-center">12</strong>);

    return labels;
  };

  // 각 셀의 시간 데이터 계산 (분 단위)
  const calculateCellMinute = (hour: number, increment: number) => {
    return (hour * 60) + increment;
  };

  return (
    <div className="w-full max-w-full overflow-x-auto p-4">
      <div ref={timetableSurface} className="flex w-full border border-gray-200 overflow-hidden">
        {/* 시간 라벨 영역 */}
        <div className="min-w-[40px] border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="h-[30px] border-b border-gray-200 flex items-center justify-center"></div>

          {/* 시간 라벨 및 선 */}
          {generateTimeLabels().map((label, index) => {
            // 홀수 인덱스는 시간 라인
            if (index % 3 === 0) {
              return (
                <div key={`label-line-${index}`} className="h-[20px] flex items-center justify-center text-xs text-gray-600 border-b border-gray-200">
                  {label}
                </div>
              );
            } else {
              // 짝수 인덱스는 빈 셀
              return (
                <div key={`label-cell-${index}`} className="h-[20px] border-b border-dashed border-gray-200"></div>
              );
            }
          })}
        </div>

        {/* 요일별 시간표 본문 */}
        {days.map((day, dayIndex) => (
          <div key={`day-${dayIndex}`} className="flex-1 min-w-[80px] flex flex-col border-r border-gray-200 last:border-r-0">
            {/* 요일 제목 */}
            <div className="h-[30px] flex items-center justify-center font-medium border-b border-gray-200">
              {day}
            </div>

            {/* 시간 칸들 */}
            {Array.from({ length: 48 }, (_, index) => {
              const hour = Math.floor(index / 2) + 8;
              const minute = (index % 2) * 30;
              const totalMinutes = calculateCellMinute(hour, minute);

              // 매 시간마다 굵은 선, 30분마다 점선
              const isHourLine = index % 2 === 0;
              const isBoldLine = (hour === 12 || hour === 18 || hour === 0 || hour === 24);

              const isSelected = selectedRange?.day === dayIndex &&
                totalMinutes >= selectedRange.startMinute &&
                totalMinutes <= selectedRange.endMinute;

              return (
                <React.Fragment key={`cell-${dayIndex}-${index}`}>
                  {/* 구분선 */}
                  <div
                    className={`
                      ${isBoldLine ? 'h-[2px] bg-gray-300' : 'h-[1px] bg-gray-200'} 
                      ${!isHourLine ? 'border-b border-dashed border-gray-200 bg-transparent md:block' : ''}
                      ${
                      // ---------- implement here ----------
                      ''
                      // ------------------------------------
                      }

                    `}
                  ></div>

                  {/* 시간 셀 */}
                  <div
                    className={`h-[20px] relative cursor-pointer hover:bg-[#e54c65] ${
                      isSelected ? 'bg-[#e54c65]' : ''
                    }`}
                    data-day={dayIndex}
                    data-minute={totalMinutes}
                    onMouseDown={(mouseEvent) => startSelecting(mouseEvent, dayIndex, totalMinutes)}
                    onMouseEnter={(mouseEvent) => extendSelection(mouseEvent, dayIndex, totalMinutes)}
                  ></div>
                </React.Fragment>
              );
            })}

            {/* 마지막 구분선 */}
            <div className="h-[2px] bg-gray-300"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeTableOTL;
