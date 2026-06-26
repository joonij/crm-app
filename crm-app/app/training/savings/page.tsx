"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowLeft, PenTool, MousePointer2, Trash2 } from "lucide-react";

// 분리해 둔 슬라이드 컴포넌트들을 모두 불러옵니다.
import { 
  SlideIntro, SlideCh1, SlideCh2, 
  SlideCh3_1, SlideCh3_2, SlideCh3_3, SlideCh3_4, SlideCh3_5, SlideCh3_6, SlideCh3_7,
  SlideCh4, SlideCh4_1, SlideCh4_2, SlideCh4_3, SlideCh4_4, 
  SlideCh5, SlideAppendix1, SlideAppendix2 
} from "./components/SavingsSlides";

export default function SavingsTrainingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // ⭐️ 펜 그리기 관련 상태 (State)
  const [isPenMode, setIsPenMode] = useState(false);
  const [penColor, setPenColor] = useState("#ef4444"); // 기본색: 빨강
  const [penWidth, setPenWidth] = useState(4);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);

  // 불러온 컴포넌트들을 순서대로 배열에 매핑합니다.
  const slides = [
    { id: "intro", title: "", content: <SlideIntro /> },
    { id: "ch1", title: "Chapter 1. 금융 건강검진", content: <SlideCh1 /> },
    { id: "ch2", title: "Chapter 2. 3대 금융기관과 금융 상품", content: <SlideCh2 /> },
    { id: "ch3-1", title: "Chapter 3-1. 이자가 붙는 두가지 방식", content: <SlideCh3_1 /> },
    { id: "ch3-2", title: "Chapter 3-2. 은행 적금의 진실", content: <SlideCh3_2 /> },
    { id: "ch3-3", title: "Chapter 3-3. 덧셈(+) vs 곱셈(×)", content: <SlideCh3_3 /> },
    { id: "ch3-4", title: "Chapter 3-4. 눈사람 굴리기", content: <SlideCh3_4 /> },
    { id: "ch4-1", title: "Chapter 4-1. 이자가 지급되는 두가지 방식", content: <SlideCh3_5 /> },
    { id: "ch4-2", title: "Chapter 4-2. 복리의 완성", content: <SlideCh3_6 /> },
    { id: "ch4-3", title: "Chapter 4-3. 비과세의 중요성", content: <SlideCh3_7 /> },
    { id: "ch5", title: "Chapter 5. 금융 상품별 혜택 총정리", content: <SlideCh4 /> },
    { id: "ch5-1", title: "Chapter 5-1. 저축보험", content: <SlideCh4_1 /> },
    { id: "ch5-2", title: "Chapter 5-2. 연금보험", content: <SlideCh4_2 /> },
    { id: "ch5-3", title: "Chapter 5-3. 단기납 종신", content: <SlideCh4_3 /> },
    { id: "ch5-4", title: "Chapter 5-4. 변액보험", content: <SlideCh4_4 /> },
    { id: "ch6", title: "Chapter 6. 정답은 없습니다. '목적'이 다를 뿐입니다", content: <SlideCh5 /> },
    { id: "appendix1", title: "부록 1. ISA 계좌", content: <SlideAppendix1 /> },
    { id: "appendix2", title: "부록 2. 연금저축", content: <SlideAppendix2 /> }
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

// ⭐️ 키보드 네비게이션 제어 (스페이스바 토글 기능 적용)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. 스페이스바: 펜 모드 ↔ 마우스 모드 즉시 전환
      if (e.key === " ") {
        e.preventDefault(); // 화면 스크롤 방지
        setIsPenMode((prev) => {
          if (!prev) setPenWidth(4); // 펜 모드가 켜질 때 굵기 초기화
          return !prev;
        });
        return; // 스페이스바를 누른 경우 아래 로직(슬라이드 이동 등) 무시
      }

      // 2. 펜 모드 상태일 때는 오작동 방지를 위해 방향키 비활성화
      if (isPenMode) return;

      // 3. 마우스 모드일 때만 방향키로 슬라이드 이동
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, isPenMode]);

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 md:p-8 pb-24 relative select-none">
      <div className="flex items-center justify-between mb-8">
        <Link href="/training" className="flex items-center text-gray-500 hover:text-gray-900 transition-colors font-bold text-lg">
          <ArrowLeft className="w-6 h-6 mr-2" />
          교육 목차로 돌아가기
        </Link>
        <div className="text-base font-black text-blue-700 bg-blue-50 px-6 py-2.5 rounded-full shadow-sm border border-blue-100">
          Slide {currentSlide + 1} / {slides.length}
        </div>
      </div>

      {/* ⭐️ 우측 상단 플로팅 그리기 툴바 */}
      <div className="absolute top-24 right-4 md:right-[-40px] flex flex-col gap-3 z-50 bg-white p-3 rounded-2xl shadow-xl border border-gray-200">
        <button 
          onClick={() => setIsPenMode(false)}
          className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${!isPenMode ? 'bg-gray-900 text-white shadow-md scale-105' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
          title="마우스 모드 (슬라이드 클릭 가능)"
        >
          <MousePointer2 className="w-5 h-5" />
          <span className="text-[10px] font-bold">마우스</span>
        </button>
        <button 
          onClick={() => { setIsPenMode(true); setPenWidth(4); }}
          className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${isPenMode ? 'bg-blue-600 text-white shadow-md scale-105' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
          title="펜 모드 (화면에 그리기)"
        >
          <PenTool className="w-5 h-5" />
          <span className="text-[10px] font-bold">판서펜</span>
        </button>

        {/* 펜 모드일 때만 보이는 색상 팔레트 및 지우개 */}
        {isPenMode && (
          <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 items-center">
            <button onClick={() => { setPenColor("#ef4444"); setPenWidth(4); }} className={`w-6 h-6 rounded-full bg-red-500 border-2 ${penColor === "#ef4444" ? 'border-gray-900 scale-125' : 'border-transparent'}`} title="빨간색" />
            <button onClick={() => { setPenColor("#3b82f6"); setPenWidth(4); }} className={`w-6 h-6 rounded-full bg-blue-500 border-2 ${penColor === "#3b82f6" ? 'border-gray-900 scale-125' : 'border-transparent'}`} title="파란색" />
            <button onClick={() => { setPenColor("#fde047"); setPenWidth(20); }} className={`w-6 h-6 rounded-full bg-yellow-300 border-2 ${penColor === "#fde047" ? 'border-gray-900 scale-125' : 'border-transparent'}`} title="형광펜" />
            
            <button onClick={clearCanvas} className="mt-2 p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="모두 지우기">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div 
        ref={containerRef}
        className={`relative bg-white rounded-[2rem] border border-gray-200 shadow-2xl h-[780px] flex flex-col overflow-hidden ${isPenMode ? 'cursor-crosshair' : ''}`}
      >
        {/* 상단 진행률 바 */}
        <div 
          className="absolute top-0 left-0 h-2 bg-blue-600 transition-all duration-500 ease-out z-10" 
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }} 
        />

        {/* ⭐️ 그리기 캔버스 레이어 */}
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

        {/* 슬라이드 제목 */}
        {slides[currentSlide].title && (
          <div className="px-14 pt-12 pb-5 border-b border-gray-100 shrink-0 relative z-0">
            <h2 className="text-4xl font-black text-gray-900">{slides[currentSlide].title}</h2>
          </div>
        )}

        {/* 슬라이드 본문 */}
        <div className="flex-1 px-14 py-8 bg-white overflow-hidden relative z-0">
          {slides[currentSlide].content}
        </div>

        {/* 하단 네비게이션 */}
        <div className="px-12 py-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/80 backdrop-blur-sm shrink-0 relative z-50">
          <button 
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="flex items-center px-6 py-3 text-base font-black text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 mr-2" /> 이전 슬라이드
          </button>
          
          <button 
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="flex items-center px-6 py-3 text-base font-black text-white bg-gray-900 rounded-xl hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
          >
            다음 슬라이드 <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}