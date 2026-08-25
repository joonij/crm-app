"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowLeft, PenTool, MousePointer2, Trash2 } from "lucide-react";

// 분리해 둔 슬라이드 컴포넌트들을 모두 불러옵니다.
import { 
  SlideIntro, SlideCh1, SlideCh2, SlideCh3, SlideCh4,
  SlideCh5, SlideCh6, SlideCh7
} from "./components/HiraSlides";

export default function BasicsTrainingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const [isPenMode, setIsPenMode] = useState(false);
  const [penColor, setPenColor] = useState("#ef4444"); // 기본색: 빨강
  const [penWidth, setPenWidth] = useState(4);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);

  // 컴포넌트로 분리한 슬라이드 배열 매핑
  const slides = [
    { id: "intro", title: "", content: <SlideIntro /> },
    { id: "ch1", title: "Chapter 1. 보험심사평가원(HIRA)이란", content: <SlideCh1 /> },
    { id: "ch2", title: "Chapter 1. 보험심사평가원(HIRA)이란", content: <SlideCh2 /> },
    { id: "ch3", title: "Chapter 2. 병력사항 체크 프로세스", content: <SlideCh3 /> },
    { id: "ch4", title: "Chapter 3. 어디를 봐야 할까?", content: <SlideCh4 /> },
    { id: "ch5", title: "Chapter 4. 선(先) 리모델링, 후(後) 청구", content: <SlideCh5 /> },
    { id: "ch6", title: "Chapter 5. 발급서류 및 거절처리", content: <SlideCh6 /> },
    { id: "ch7", title: "Chapter 6. 심사평가원 4원칙", content: <SlideCh7 /> }
  ];

   // ⭐️ 캔버스 사이즈 초기화 함수
   const resizeCanvas = useCallback(() => {
    if (canvasRef.current && containerRef.current) {
      canvasRef.current.width = containerRef.current.offsetWidth;
      canvasRef.current.height = containerRef.current.offsetHeight;
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  // ⭐️ 캔버스 지우기 함수
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  // 슬라이드가 변경되면 그려둔 내용을 자동으로 지움
  useEffect(() => {
    clearCanvas();
  }, [currentSlide, clearCanvas]);

  // ⭐️ 그리기 이벤트 핸들러
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isPenMode) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    isDrawing.current = true;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !isPenMode) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = penColor === "#fde047" ? 0.4 : 1.0; 
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? prev : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? prev : prev - 1));
  }, []);

  // ⭐️ 하단 버튼을 클릭했을 때 마치 '방향키'를 누른 것처럼 가상 이벤트를 발생시킵니다.
  // 💡 수정됨: window가 아닌 document에 이벤트를 발생시켜야 슬라이드 내부의 이벤트 가로채기(Capture)가 정상 작동합니다.
  const triggerNext = () => {
    document.dispatchEvent(new KeyboardEvent("keydown", { 
      key: "ArrowRight", 
      code: "ArrowRight",
      keyCode: 39,
      which: 39,
      bubbles: true, 
      cancelable: true 
    }));
  };

  const triggerPrev = () => {
    document.dispatchEvent(new KeyboardEvent("keydown", { 
      key: "ArrowLeft", 
      code: "ArrowLeft",
      keyCode: 37,
      which: 37,
      bubbles: true, 
      cancelable: true 
    }));
  };

  // ⭐️ 키보드 네비게이션 제어 (스페이스바 토글 기능 적용)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. 스페이스바: 펜 모드 ↔ 마우스 모드 즉시 전환
      if (e.key === " ") {
        if (!e.isTrusted) return; // 가짜 이벤트 방어 코드
        e.preventDefault(); // 화면 스크롤 방지
        setIsPenMode((prev) => {
          if (!prev) setPenWidth(4); // 펜 모드가 켜질 때 굵기 초기화
          return !prev;
        });
        return; // 스페이스바를 누른 경우 아래 로직(슬라이드 이동 등) 무시
      }

      // 2. 펜 모드 상태일 때는 오작동 방지를 위해 방향키 비활성화
      // 💡 단, 하단 버튼 클릭(triggerNext 등)으로 발생한 인위적 가짜 이벤트(isTrusted === false)는 통과시킵니다.
      if (isPenMode && e.isTrusted) return;

      // 3. 마우스 모드일 때만 방향키로 슬라이드 이동
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, isPenMode]);

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 md:p-8 pb-24 relative select-none">
      
      {/* 메인 슬라이드 캔버스 컨테이너 */}
      <div 
        ref={containerRef}
        className={`relative bg-white rounded-[2rem] border border-gray-200 shadow-2xl h-[780px] flex flex-col overflow-hidden ${isPenMode ? 'cursor-crosshair' : ''}`}
      >
        {/* 상단 진행률 바 */}
        <div 
          className="absolute top-0 left-0 h-2 bg-blue-600 transition-all duration-500 ease-out z-10" 
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }} 
        />

        {/* ⭐️ 그리기 캔버스 레이어 (z-40) */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 z-40 touch-none"
          style={{ pointerEvents: isPenMode ? 'auto' : 'none' }} 
        />

        {/* ⭐️ 통합된 상단 타이틀 & 툴바 영역 (z-50) */}
        <div className="px-14 pt-10 pb-5 border-b border-gray-100 shrink-0 relative z-50 flex justify-between items-center bg-white/95 backdrop-blur-sm">
          {/* 왼쪽: 슬라이드 제목 */}
          <h2 className="text-4xl font-black text-gray-900 truncate pr-4 flex gap-2">
            {/* 1. 교육 목차로 돌아가기 */}
            <Link 
              href="/training" 
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors"
              title="목차로 돌아가기"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            {slides[currentSlide].title}
          </h2>
          
          {/* 오른쪽: 가로형 통합 툴바 */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm shrink-0">
            

            {/* 2. 슬라이드 진행도 */}
            {/* <div className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 rounded-xl border border-blue-100 text-blue-700">
              <span className="text-[10px] font-bold text-blue-400">SLIDE</span>
              <span className="text-xs font-black">
                {currentSlide + 1}<span className="text-blue-300 mx-0.5">/</span>{slides.length}
              </span>
            </div> */}

            {/* <div className="w-px h-5 bg-gray-200 mx-1"></div> 세로 구분선 */}

            {/* 3. 마우스 모드 */}
            <button 
              onClick={() => setIsPenMode(false)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all border ${!isPenMode ? 'bg-gray-900 text-white border-gray-900 shadow-md scale-105' : 'bg-white text-gray-500 border-transparent hover:bg-gray-50'}`}
              title="마우스 모드 (슬라이드 클릭 가능)"
            >
              <MousePointer2 className="w-4 h-4" />
              <span className="text-[11px] font-bold">마우스</span>
            </button>

            {/* 4. 펜 모드 */}
            <button 
              onClick={() => { setIsPenMode(true); setPenWidth(4); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all border ${isPenMode ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105' : 'bg-white text-gray-500 border-transparent hover:bg-gray-50'}`}
              title="펜 모드 (화면에 그리기)"
            >
              <PenTool className="w-4 h-4" />
              <span className="text-[11px] font-bold">판서펜</span>
            </button>

            {/* 5. 펜 모드일 때만 나타나는 색상 팔레트 및 지우개 */}
            {isPenMode && (
              <div className="flex items-center gap-2.5 pl-3 ml-1 border-l border-gray-200 animate-in fade-in slide-in-from-right-2">
                <button onClick={() => { setPenColor("#ef4444"); setPenWidth(4); }} className={`w-5 h-5 rounded-full bg-red-500 border-2 transition-transform shadow-sm ${penColor === "#ef4444" ? 'border-gray-900 scale-125' : 'border-white hover:scale-110'}`} title="빨간색" />
                <button onClick={() => { setPenColor("#3b82f6"); setPenWidth(4); }} className={`w-5 h-5 rounded-full bg-blue-500 border-2 transition-transform shadow-sm ${penColor === "#3b82f6" ? 'border-gray-900 scale-125' : 'border-white hover:scale-110'}`} title="파란색" />
                <button onClick={() => { setPenColor("#fde047"); setPenWidth(20); }} className={`w-5 h-5 rounded-full bg-yellow-300 border-2 transition-transform shadow-sm ${penColor === "#fde047" ? 'border-gray-900 scale-125' : 'border-white hover:scale-110'}`} title="형광펜" />
                
                <button onClick={clearCanvas} className="p-1.5 ml-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="모두 지우기">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 슬라이드 본문 */}
        <div className="flex-1 px-14 py-8 bg-white overflow-hidden relative z-0">
          {slides[currentSlide].content}
        </div>

        {/* 하단 네비게이션 */}
        <div className="px-12 py-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/80 backdrop-blur-sm shrink-0 relative z-50">
          <button 
            onClick={triggerPrev}
            disabled={currentSlide === 0}
            className="flex items-center px-6 py-3 text-base font-black text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 mr-2" /> 이전 슬라이드
          </button>
          
          <button 
            onClick={triggerNext}
            disabled={currentSlide === slides.length - 1}
            className="flex items-center px-6 py-3 text-base font-black text-white bg-gray-900 rounded-xl hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md cursor-pointer"
          >
            다음 슬라이드 <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}