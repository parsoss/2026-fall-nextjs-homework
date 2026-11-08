"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface ResizablePanelProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

export default function ResizablePanel({
  leftPanel,
  rightPanel,
  initialWidth = 600,
  minWidth = 320,
  maxWidth = 850,
}: ResizablePanelProps) {
  const [width, setWidth] = useState(initialWidth);
  const resizeOrigin = useRef<{ mouseX: number; panelWidth: number } | null>(null);
  useEffect(() => {
    const finishResizing = () => {
      resizeOrigin.current = null;
    };
    // 마우스 이동 이벤트 핸들러

    const resizePanel = (mouseEvent: MouseEvent) => {
      const origin = resizeOrigin.current;
      if (!origin) return;

      if ((mouseEvent.buttons & 1) === 0) {
        finishResizing();
        return;
      }

      const nextWidth = origin.panelWidth + mouseEvent.clientX - origin.mouseX;
      setWidth(Math.max(minWidth, Math.min(maxWidth, nextWidth)));
    };

    document.addEventListener("mousemove", resizePanel);
    document.addEventListener("mouseup", finishResizing);
    // 마우스 감지
    return () => {
      resizeOrigin.current = null;
      document.removeEventListener("mousemove", resizePanel);
      document.removeEventListener("mouseup", finishResizing);
    };
  }, [minWidth, maxWidth]);

  return (
    <div className="flex h-full">
      <div style={{ width, flexShrink: 0, background: '#ffffff', overflow: 'auto' }} className="p-4">
        {leftPanel}
      </div>
      <div
        onMouseDown={(mouseEvent) => { // 마우스 누르면 드래그 시작
          if (mouseEvent.button !== 0) return;

          mouseEvent.preventDefault();
          resizeOrigin.current = { mouseX: mouseEvent.clientX, panelWidth: width };
        }}
        style={{
          width: "5px",
          flexShrink: 0,
          cursor: "col-resize",
          background: '#f0f0f0',
          margin: "0",
          position: "relative",
          userSelect: "none",
          touchAction: "none",
          transition: "all 0.2s ease"
        }}
        className="group"
      >
        {/* 기본 상태의 중앙 드래그 라인 */}
        <div
          className="absolute top-0 bottom-0 left-1/2 w-px bg-[#cccccc] transform -translate-x-1/2 group-hover:bg-transparent transition-all"
        ></div>

        {/* 호버/드래그 시 나타나는 핫핑크 라인 */}
        <div
          className="absolute top-0 bottom-0 left-1/2 w-0 bg-[#e54c65] transform -translate-x-1/2 group-hover:w-[3px] transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-[0_0_4px_rgba(229,76,101,0.5)] group-hover:shadow-[0_0_4px_rgba(229,76,101,0.5)]"
        ></div>

      </div>
      <div style={{ flex: 1, minWidth: 0, background: '#ffffff', overflow: 'auto' }} className="p-4"> {/*  오른쪽 패널 최소 너비 */}
        {rightPanel}
      </div>
    </div>
  );
}
