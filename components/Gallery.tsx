import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { ChevronLeft, ChevronRight, X, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { GalleryImage, LoadingState } from '../types';
import { CONFIG } from '../config';

const FALLBACK_IMAGES: GalleryImage[] = [
  { 
    id: 1, 
    url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop', 
    title: 'Golden Gala G Night', 
    category: 'Gala',
    location: 'Palais Ferstel, Wien',
    date: '14. Oktober 2023',
    description: 'Ein Abend voller Glanz und Glamour. Für dieses exklusive Gala-Dinner verwandelten wir den historischen Ballsaal in ein goldenes Lichtermeer.',
    highlights: ['5-Gänge Sterne-Menü', 'Live Jazz-Bigband', 'Maßgeschneidertes Lichtdesign'],
    additionalImages: ['https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop']
  }
];

interface GalleryProps {
  onInquire?: (projectTitle: string) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ onInquire }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const preciseScrollLeft = useRef<number>(0);
  const [projects, setProjects] = useState<GalleryImage[]>([]);
  const [displayImages, setDisplayImages] = useState<GalleryImage[]>([]);
  const [status, setStatus] = useState<LoadingState>(LoadingState.LOADING);
  
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const animationFrameId = useRef<number>(0);
  const isNavigating = useRef(false);

  const selectedImage = selectedProjectIndex !== null ? displayImages[selectedProjectIndex] : null;

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const fields = JSON.stringify(["name", "project_name", "expected_end_date", "status"]);
        // WICHTIG: encodeURIComponent verhindert, dass Sonderzeichen im JSON den Request korrumpieren
        const url = `${CONFIG.API_URL}/api/resource/Project?fields=${encodeURIComponent(fields)}`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const json = await response.json();
        const data = json.data || [];

        if (data.length === 0) {
          setProjects(FALLBACK_IMAGES);
          setDisplayImages([...FALLBACK_IMAGES, ...FALLBACK_IMAGES, ...FALLBACK_IMAGES]);
        } else {
          const mappedProjects: GalleryImage[] = data.map((p: any, idx: number) => ({
            id: idx + 1,
            url: p.image || `https://picsum.photos/1600/900?random=${idx + 50}`,
            title: p.project_name || "MM Projekt",
            category: p.status || "Event",
            location: "Exklusiv-Location",
            date: p.expected_end_date ? new Date(p.expected_end_date).toLocaleDateString('de-DE') : "In Planung",
            description: p.notes || "Ein maßgeschneidertes Event-Konzept von MM EVENT.",
            highlights: ["Premium Service", "Individuelle X Planung"],
            additionalImages: []
          }));
          setProjects(mappedProjects);
          setDisplayImages([...mappedProjects, ...mappedProjects, ...mappedProjects]);
        }
        setStatus(LoadingState.SUCCESS);
      } catch (error) {
        console.warn("Projekt-Abruf fehlgeschlagen (Load failed). Nutze Fallback-Bilder.", error);
        setProjects(FALLBACK_IMAGES);
        setDisplayImages([...FALLBACK_IMAGES, ...FALLBACK_IMAGES, ...FALLBACK_IMAGES]);
        setStatus(LoadingState.SUCCESS);
      }
    };

    loadProjects();
  }, []);

  useLayoutEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (container && status === LoadingState.SUCCESS) {
      const initScroll = () => {
        const singleSetWidth = container.scrollWidth / 3;
        container.scrollLeft = singleSetWidth;
        preciseScrollLeft.current = singleSetWidth;
      };
      const timer = setTimeout(initScroll, 100);
      return () => clearTimeout(timer);
    }
  }, [status]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || status !== LoadingState.SUCCESS) return;

    const animate = () => {
      if (!container) return;
      if (isNavigating.current) {
        preciseScrollLeft.current = container.scrollLeft;
        animationFrameId.current = requestAnimationFrame(animate);
        return;
      }
      const totalWidth = container.scrollWidth;
      const oneSetWidth = totalWidth / 3;
      if (preciseScrollLeft.current >= 2 * oneSetWidth) {
        preciseScrollLeft.current -= oneSetWidth;
      } else if (preciseScrollLeft.current <= 0) {
        preciseScrollLeft.current += oneSetWidth;
      }
      if (!isPaused && selectedProjectIndex === null) {
        preciseScrollLeft.current += 1.0;
        container.scrollLeft = preciseScrollLeft.current;
      } else {
        preciseScrollLeft.current = container.scrollLeft;
      }
      animationFrameId.current = requestAnimationFrame(animate);
    };
    animationFrameId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [isPaused, selectedProjectIndex, status]);

  const calculateCenterPosition = (index: number) => {
    if (!scrollRef.current) return 0;
    const container = scrollRef.current;
    const element = container.children[index] as HTMLElement;
    if (!element) return 0;
    const containerRect = container.getBoundingClientRect();
    const itemRect = element.getBoundingClientRect();
    const currentScroll = container.scrollLeft;
    const itemCenterAbsolute = (itemRect.left - containerRect.left) + currentScroll + (itemRect.width / 2);
    const containerCenter = containerRect.width / 2;
    return itemCenterAbsolute - containerCenter;
  };

  const scrollCarouselTo = (target: number, duration: number = 600) => {
    const container = scrollRef.current;
    if (!container) return;
    isNavigating.current = true;
    const start = container.scrollLeft;
    const distance = target - start;
    const startTime = performance.now();
    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const nextVal = start + (distance * ease);
      container.scrollLeft = nextVal;
      preciseScrollLeft.current = nextVal;
      if (progress < 1) requestAnimationFrame(step);
      else isNavigating.current = false;
    };
    requestAnimationFrame(step);
  };

  const handleImageClick = (index: number) => {
    setIsPaused(true);
    const targetPos = calculateCenterPosition(index);
    scrollCarouselTo(targetPos, 600);
    setTimeout(() => {
        setSelectedProjectIndex(index);
        document.body.style.overflow = 'hidden';
    }, 600);
  };

  const closeModal = () => {
    setSelectedProjectIndex(null);
    document.body.style.overflow = 'auto';
    setIsPaused(false);
  };

  const navigateProject = (direction: 'prev' | 'next') => {
    if (selectedProjectIndex === null) return;
    const newIndex = direction === 'next' ? selectedProjectIndex + 1 : selectedProjectIndex - 1;
    if (newIndex >= 0 && newIndex < displayImages.length) setSelectedProjectIndex(newIndex);
  };

  const handleScrollNav = (direction: 'prev' | 'next') => {
     if (!scrollRef.current) return;
     setIsPaused(true);
     const container = scrollRef.current;
     const containerRect = container.getBoundingClientRect();
     const containerCenter = containerRect.width / 2;
     let minDiff = Infinity;
     let currentIndex = 0;
     Array.from(container.children).forEach((child, index) => {
        const rect = (child as HTMLElement).getBoundingClientRect();
        const childCenter = (rect.left - containerRect.left) + (rect.width / 2);
        const diff = Math.abs(childCenter - containerCenter);
        if (diff < minDiff) { minDiff = diff; currentIndex = index; }
     });
     let targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
     targetIndex = Math.max(0, Math.min(targetIndex, displayImages.length - 1));
     scrollCarouselTo(calculateCenterPosition(targetIndex), 500);
  };

  useEffect(() => {
    const handleKeyboardNav = (e: KeyboardEvent) => {
      if (selectedProjectIndex !== null) {
          if (e.key === 'ArrowRight') navigateProject('next');
          if (e.key === 'ArrowLeft') navigateProject('prev');
          if (e.key === 'Escape') closeModal();
      } else {
          if (e.key === 'ArrowRight') handleScrollNav('next');
          if (e.key === 'ArrowLeft') handleScrollNav('prev');
      }
    };
    window.addEventListener('keydown', handleKeyboardNav);
    return () => window.removeEventListener('keydown', handleKeyboardNav);
  }, [selectedProjectIndex, displayImages]);

  const handleInquireClick = () => {
    if (selectedImage && onInquire) {
        onInquire(selectedImage.title);
        closeModal();
        setTimeout(() => {
             const contactSection = document.getElementById('contact');
             if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
        }, 600);
    }
  };

  if (status === LoadingState.LOADING) {
    return (
      <div className="w-full py-20 bg-slate-900 border-t border-slate-800 text-center text-slate-400 font-serif tracking-widest uppercase text-sm">
        Lädt Portfolio...
      </div>
    );
  }

  return (
    <div className="w-full pt-12 pb-4 md:py-20 bg-slate-900 border-t border-slate-800">
      <div className="container mx-auto px-6 mb-12 text-center">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
          Unsere Projekte
        </h2>
        <div className="w-24 h-1 bg-gold-500 mx-auto mb-6"></div>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Wählen Sie ein Projekt für Details.
        </p>
      </div>
      <div className="relative w-full group/carousel overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-between px-4 md:px-12">
           <button 
              className="pointer-events-auto bg-slate-900/50 hover:bg-gold-500 text-white p-3 rounded-full backdrop-blur-sm border border-slate-600 transition-all opacity-0 group-hover/carousel:opacity-100"
              onClick={() => handleScrollNav('prev')}
           >
              <ChevronLeft size={32} />
           </button>
           <button 
              className="pointer-events-auto bg-slate-900/50 hover:bg-gold-500 text-white p-3 rounded-full backdrop-blur-sm border border-slate-600 transition-all opacity-0 group-hover/carousel:opacity-100"
              onClick={() => handleScrollNav('next')}
           >
              <ChevronRight size={32} />
           </button>
        </div>
        <div 
          ref={scrollRef}
          className={`${isMobile ? "grid grid-rows-2 grid-flow-col gap-4 overflow-x-auto scrollbar-hide px-4 pr-[40vw] touch-pan-x" : "flex overflow-x-auto scrollbar-hide px-6 gap-6 md:gap-8 items-center"} pb-6 relative`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => !selectedProjectIndex && setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onScroll={() => { if (!isNavigating.current && scrollRef.current) preciseScrollLeft.current = scrollRef.current.scrollLeft; }}
        >
          {displayImages.map((img, index) => (
            <div 
              key={`${img.id}-${index}`}
              onClick={() => handleImageClick(index)}
              className={`flex-none relative shadow-2xl rounded-sm overflow-hidden border border-slate-800 cursor-pointer transition-all duration-500 ${isMobile ? "w-[70vw] h-[30vh] even:translate-x-[50%]" : "w-[85vw] md:w-[60vw] aspect-[16/9]"} hover:scale-[1.01]`}
            >
              <img src={img.url} alt={img.title} loading="lazy" className="w-full h-full object-cover pointer-events-none select-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
              <div className="absolute bottom-0 left-0 w-full p-4 md:p-8">
                <span className="bg-gold-500/90 text-slate-900 text-[10px] md:text-xs font-bold uppercase tracking-widest py-1 px-2 md:px-3 mb-2 md:mb-3 rounded-sm inline-block">{img.category}</span>
                <h3 className="text-xl md:text-4xl font-serif text-white font-bold drop-shadow-lg leading-tight">{img.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
      {selectedProjectIndex !== null && selectedImage && (
        <div className={`fixed inset-0 z-50 bg-slate-900 overflow-y-auto animate-[fadeIn_0.4s_ease-out]`}>
            <div className="fixed top-0 left-0 w-full z-[60] p-6 flex justify-between items-start pointer-events-none">
                <div className="bg-slate-900/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 opacity-0 md:opacity-100 transition-opacity"><span className="text-white text-xs font-bold uppercase tracking-widest">{selectedImage.category}</span></div>
                <div className="flex gap-4 pointer-events-auto">
                    <button onClick={() => navigateProject('prev')} className="bg-black/40 hover:bg-gold-600 text-white p-3 rounded-full backdrop-blur-md border border-white/10 transition-all hidden md:block"><ChevronLeft size={24} /></button>
                    <button onClick={() => navigateProject('next')} className="bg-black/40 hover:bg-gold-600 text-white p-3 rounded-full backdrop-blur-md border border-white/10 transition-all hidden md:block"><ChevronRight size={24} /></button>
                    <button onClick={closeModal} className="bg-black/40 hover:bg-red-500/80 text-white p-3 rounded-full backdrop-blur-md border border-white/10 transition-all hover:rotate-90"><X size={24} /></button>
                </div>
            </div>
            <div className="relative w-full h-[60vh] md:h-[85vh] shrink-0">
                <img src={selectedImage.url} alt={selectedImage.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-16 max-w-7xl mx-auto">
                    <div className="animate-[slideUp_0.6s_ease-out]">
                        <h2 className="text-4xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 drop-shadow-2xl leading-tight">{selectedImage.title}</h2>
                        <div className="flex flex-wrap gap-6 text-slate-300 text-sm uppercase tracking-widest border-t border-white/10 pt-6 inline-flex">
                            {selectedImage.location && <div className="flex items-center gap-2"><MapPin size={16} className="text-gold-500" /> {selectedImage.location}</div>}
                            {selectedImage.date && <div className="flex items-center gap-2"><Calendar size={16} className="text-gold-500" /> {selectedImage.date}</div>}
                        </div>
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-6 md:px-16 py-16 md:py-24 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
                    <div className="lg:col-span-8">
                         <h3 className="text-gold-500 font-serif text-2xl mb-6">Das Konzept</h3>
                         <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-light">{selectedImage.description}</p>
                    </div>
                    <div className="lg:col-span-4 bg-slate-800/30 p-8 rounded-sm border border-slate-800 h-fit">
                        <h3 className="text-white font-serif text-xl mb-6">Event Highlights</h3>
                        <div className="space-y-4">
                            {selectedImage.highlights?.map((h, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <CheckCircle2 size={20} className="text-gold-500 shrink-0 mt-0.5" />
                                    <span className="text-slate-300 text-sm font-medium tracking-wide">{h}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="text-center pb-12 pt-12 border-t border-slate-800">
                    <h3 className="text-3xl font-serif text-white mb-8">Interesse geweckt?</h3>
                    <button onClick={handleInquireClick} className="bg-gold-600 hover:bg-gold-500 text-white font-bold py-5 px-16 rounded-sm uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(197,160,40,0.3)] hover:scale-105 transition-all">Dieses Projekt Anfragen</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};