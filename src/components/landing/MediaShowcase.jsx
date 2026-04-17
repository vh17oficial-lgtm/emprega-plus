import { useState, useEffect, useRef } from 'react';
import Portal from '../common/Portal';
import { useAppContext } from '../../context/AppContext';

const screenshots = [
  {
    id: 'resume',
    title: 'Currículo profissional',
    description: 'Crie em minutos com nossos templates brasileiros',
    icon: '📝',
    color: 'from-indigo-500 to-purple-600',
    shadowColor: 'shadow-indigo-500/20',
  },
  {
    id: 'jobs',
    title: 'Explorar vagas',
    description: 'Filtre por nível, tipo e localização',
    icon: '🔍',
    color: 'from-emerald-500 to-teal-600',
    shadowColor: 'shadow-emerald-500/20',
  },
  {
    id: 'apply',
    title: 'Candidatura com 1 clique',
    description: 'Envie seu currículo instantaneamente',
    icon: '🚀',
    color: 'from-orange-500 to-rose-600',
    shadowColor: 'shadow-orange-500/20',
  },
];

const thumbMap = {
  'gradient-indigo': 'bg-gradient-to-br from-indigo-600 to-purple-700',
  'gradient-purple': 'bg-gradient-to-br from-purple-600 to-rose-700',
  'gradient-emerald': 'bg-gradient-to-br from-emerald-600 to-teal-700',
  'gradient-orange': 'bg-gradient-to-br from-orange-500 to-rose-600',
};

function getThumbBg(t) {
  return thumbMap[t] || thumbMap['gradient-indigo'];
}

function FadeInOnScroll({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function VideoModal({ isOpen, onClose, video }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !video) return null;

  const youtubeMatch = video.url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  const embedUrl = youtubeMatch ? `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1` : null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} style={{ animation: 'mediaFadeIn 0.2s ease-out' }} />
        <div className="relative w-full max-w-3xl" style={{ animation: 'mediaSlideUp 0.3s ease-out' }}>
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 text-white/60 hover:text-white text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            Fechar
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl aspect-video flex flex-col items-center justify-center relative">
            {embedUrl ? (
              <iframe src={embedUrl} className="w-full h-full absolute inset-0" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={video.title} />
            ) : (
              <>
                <div className={`absolute inset-0 ${getThumbBg(video.thumb)}`} />
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-4">{video.icon}</div>
                  <h3 className="text-white text-lg font-bold mb-2 px-8">{video.title}</h3>
                  <p className="text-white/50 text-sm">Demonstração em breve</p>
                  <div className="mt-6 inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-2.5">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    <span className="text-white text-sm font-medium">{video.duration}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes mediaFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes mediaSlideUp { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </Portal>
  );
}

export default function MediaShowcase() {
  const { landingVideos } = useAppContext();
  const activeVideos = landingVideos.filter((v) => v.active);
  const [activeVideo, setActiveVideo] = useState(null);

  return (
    <section className="py-16 sm:py-20 bg-white relative overflow-hidden">
      <div className="absolute top-20 left-0 w-[400px] h-[400px] bg-indigo-100/40 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInOnScroll>
          <div className="text-center mb-10 sm:mb-12">
            <span className="inline-flex items-center gap-2 text-indigo-600 font-semibold text-sm uppercase tracking-wider mb-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Veja na prática
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simples, rápido e <span className="text-indigo-600">profissional</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Conheça as funcionalidades que já ajudaram milhares de pessoas a conseguir emprego.
            </p>
          </div>
        </FadeInOnScroll>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-3 gap-5 sm:gap-6 mb-12 sm:mb-14">
          {screenshots.map((s, i) => (
            <FadeInOnScroll key={s.id} delay={i * 120}>
              <div className={`group relative rounded-2xl overflow-hidden bg-white border border-gray-100 hover:shadow-xl ${s.shadowColor} transition-all duration-500 hover:-translate-y-1`}>
                <div className={`relative h-44 sm:h-52 bg-gradient-to-br ${s.color} flex items-center justify-center overflow-hidden`}>
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                  </div>
                  <div className="relative">
                    <div className="text-5xl sm:text-6xl group-hover:scale-110 transition-transform duration-500">{s.icon}</div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{s.title}</h3>
                  <p className="text-sm text-gray-500">{s.description}</p>
                </div>
              </div>
            </FadeInOnScroll>
          ))}
        </div>

        {/* Video section */}
        {activeVideos.length > 0 && (
          <>
            <FadeInOnScroll>
              <div className="text-center mb-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">🎥 Veja como funciona</h3>
              </div>
            </FadeInOnScroll>

            <div className={`grid ${activeVideos.length === 1 ? 'max-w-lg mx-auto' : 'sm:grid-cols-2 max-w-3xl mx-auto'} gap-5 sm:gap-6`}>
              {activeVideos.map((v, i) => (
                <FadeInOnScroll key={v.id} delay={i * 150}>
                  <button
                    onClick={() => setActiveVideo(v)}
                    className="group relative rounded-2xl overflow-hidden aspect-video w-full cursor-pointer text-left"
                  >
                    <div className={`absolute inset-0 ${getThumbBg(v.thumb)} transition-transform duration-500 group-hover:scale-105`} />
                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 border border-white/20">
                        <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                      <h4 className="text-white text-sm sm:text-base font-bold px-6 text-center leading-snug">{v.title}</h4>
                      <span className="text-white/50 text-xs mt-2 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {v.duration}
                      </span>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-10" />
                  </button>
                </FadeInOnScroll>
              ))}
            </div>
          </>
        )}
      </div>

      <VideoModal isOpen={!!activeVideo} onClose={() => setActiveVideo(null)} video={activeVideo} />
    </section>
  );
}
