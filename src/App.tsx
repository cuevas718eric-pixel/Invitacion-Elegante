/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  RotateCcw,
  Sparkles,
  Calendar,
  MapPin,
  Gem,
  Utensils,
  Send,
  Check,
  CheckCircle2,
  Volume2,
  VolumeX,
  ExternalLink,
  Copy,
  Clock,
  Share2,
  Wifi,
  BatteryCharging,
  Info,
} from 'lucide-react';
import {
  calculateScrollProgress,
  formatRsvpSubmission,
  computeGalaCountdown,
  RsvpResult,
} from './utils/invitation';

// Stages of the unboxing experience
type UnboxingStage = 'sealed' | 'cracking' | 'opening_flap' | 'ejecting_card' | 'revealed';

// Crisp 4-pointed solstice star that renders identically across all platforms and fonts
function GoldStar({ className = 'w-3.5 h-3.5 text-[#e5c378]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 1L14.6 9.4L23 12L14.6 14.6L12 23L9.4 14.6L1 12L9.4 9.4L12 1Z" />
    </svg>
  );
}

export default function App() {
  const [stage, setStage] = useState<UnboxingStage>('sealed');
  const [isOpened, setIsOpened] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // RSVP Form State
  const [guestName, setGuestName] = useState('Duque de Valois');
  const [guestsCount, setGuestsCount] = useState<1 | 2>(1);
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);
  const [rsvpResult, setRsvpResult] = useState<RsvpResult | null>(null);
  const [rsvpError, setRsvpError] = useState<string | null>(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Scroll Container Ref
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Micro Countdown
  const galaDate = useRef(new Date('2025-12-21T19:30:00'));
  const [countdown, setCountdown] = useState(() =>
    computeGalaCountdown(galaDate.current, new Date('2025-12-01T00:00:00'))
  );

  // Update countdown clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(computeGalaCountdown(galaDate.current));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Ambient sound effects using native Web Audio API (Zero external assets)
  const playSound = useCallback(
    (type: 'crack' | 'slide' | 'success') => {
      if (!soundEnabled) return;
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          audioCtxRef.current = new AudioContextClass();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        const now = ctx.currentTime;

        if (type === 'crack') {
          // Wax seal crack: quick burst of filtered noise + resonant snap
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);

          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.16);
        } else if (type === 'slide') {
          // Silky paper slide: subtle low-pass filtered swoosh
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(160, now + 0.35);

          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.36);
        } else if (type === 'success') {
          // Crystal gala chime (two harmonic bells)
          [659.25, 987.77, 1318.51].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);

            gain.gain.setValueAtTime(0, now);
            gain.gain.setValueAtTime(0.18, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.2);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 1.3);
          });
        }
      } catch {
        // AudioContext may be restricted by autoplay policy until user gesture
      }
    },
    [soundEnabled]
  );

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // SEQUENCE: Dramatic Unboxing Unfolding
  const triggerUnboxing = useCallback(() => {
    if (stage !== 'sealed') return;

    // Step 1: Crack wax seal
    setStage('cracking');
    playSound('crack');
    showToast('Rompiendo sello de cera de Studio Nocturne...');

    // Step 2: Open Flap 3D (rotateX: 180deg)
    setTimeout(() => {
      setStage('opening_flap');
      playSound('slide');

      // Step 3: Envelope gently recedes and mobile card rises
      setTimeout(() => {
        setStage('ejecting_card');
        playSound('slide');
        showToast('Convocatoria Revelada');

        setTimeout(() => {
          setStage('revealed');
          setIsOpened(true);
        }, 650);
      }, 700);
    }, 380);
  }, [stage, playSound, showToast]);

  // RESET SEQUENCE: Return to closed luxury envelope
  const resetExperience = useCallback(() => {
    setStage('sealed');
    setIsOpened(false);
    setScrollProgress(0);
    setRsvpResult(null);
    setRsvpError(null);
    setIsSubmittingRsvp(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    showToast('Experiencia reiniciada al sobre sellado');
  }, [showToast]);

  // Check URL query parameters for ?autostart=1 (testability requirement)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      setStage('revealed');
      setIsOpened(true);
    }
  }, []);

  // IntersectionObserver for native Scroll Reveal of card sections
  useEffect(() => {
    if (stage !== 'revealed' && !isOpened) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const elementsToReveal = container.querySelectorAll('.reveal-on-scroll');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      {
        root: container,
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    elementsToReveal.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [stage, isOpened]);

  // Handle Scroll Progress
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const progress = calculateScrollProgress(
      target.scrollTop,
      target.scrollHeight,
      target.clientHeight
    );
    setScrollProgress(progress);
  };

  // RSVP Submission Handler with 1 second realistic status transition
  const handleConfirmRsvp = () => {
    setRsvpError(null);
    const submission = formatRsvpSubmission({
      guestName,
      guestsCount,
    });

    if (!submission.valid) {
      setRsvpError(submission.error || 'Datos no válidos.');
      return;
    }

    setIsSubmittingRsvp(true);
    showToast('Validando credencial en lista de honor...');

    // As specified: change text to "Registrando pase..." for 1 second before showing green confirmed card
    setTimeout(() => {
      setIsSubmittingRsvp(false);
      setRsvpResult(submission);
      playSound('success');
      showToast('✓ Pase VIP Confirmado');
    }, 1000);
  };

  // Helper to copy location or add calendar event
  const copyAddress = () => {
    navigator.clipboard.writeText('Avenida de las Acacias 1400, Reserva Forestal del Valle');
    showToast('Dirección copiada al portapapeles');
  };

  const downloadCalendarIcs = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Studio Nocturne//Solstice Gala MMXXV//ES
BEGIN:VEVENT
UID:solstice-gala-2025@studionocturne.com
DTSTAMP:20251016T000000Z
DTSTART:20251221T193000
DTEND:20251222T030000
SUMMARY:Studio Nocturne: Solstice Gala MMXXV
DESCRIPTION:Convocatoria reservada. Black Tie Nocturno & Metálicos. Palacio de Cristal.
LOCATION:Avenida de las Acacias 1400, Reserva Forestal del Valle
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Studio_Nocturne_Solstice_Gala.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Evento añadido a tu calendario');
  };

  // Envelope visual state logic
  const isFlapOpen = stage === 'opening_flap' || stage === 'ejecting_card' || stage === 'revealed';
  const isEnvelopeReceded = stage === 'ejecting_card' || stage === 'revealed';
  const isSealCracked = stage !== 'sealed';

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-3 md:p-6 select-none relative overflow-x-hidden bg-[#0d0c0e]">
      {/* Ambient Golden Dust Particles */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="dust-particle w-1.5 h-1.5 top-1/4 left-1/5" style={{ animationDelay: '0s' }}></div>
        <div className="dust-particle w-2 h-2 top-3/5 left-1/6 opacity-25" style={{ animationDelay: '1.2s' }}></div>
        <div className="dust-particle w-1 h-1 top-1/3 right-1/4" style={{ animationDelay: '2.5s' }}></div>
        <div className="dust-particle w-2.5 h-2.5 bottom-1/4 right-1/6 opacity-20" style={{ animationDelay: '3.8s' }}></div>
        <div className="dust-particle w-1.5 h-1.5 top-2/3 right-1/3 opacity-30" style={{ animationDelay: '0.7s' }}></div>
        <div className="dust-particle w-2 h-2 top-10 left-1/2 opacity-20" style={{ animationDelay: '4.1s' }}></div>
      </div>

      {/* Header Branding / Controls */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between py-3 px-3 z-20 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-[#e5c378]/40 flex items-center justify-center bg-[#1b191e]/80 shadow-[0_0_12px_rgba(229,195,120,0.15)]">
            <GoldStar className="w-3.5 h-3.5 text-[#e5c378]" />
          </div>
          <div>
            <p className="font-cinzel text-xs tracking-[0.25em] text-[#e5c378] uppercase font-semibold">
              Studio Nocturne
            </p>
            <p className="text-[11px] text-[#a09c99] tracking-wider">
              Haute Joaillerie & Solstice Gala
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              showToast(soundEnabled ? 'Efectos sonoros silenciados' : 'Efectos sonoros activados');
            }}
            title={soundEnabled ? 'Silenciar efectos' : 'Activar efectos'}
            aria-label={soundEnabled ? 'Silenciar efectos de sonido' : 'Activar efectos de sonido'}
            className="p-2 rounded-full border border-white/10 text-stone-300 hover:text-[#fcedc5] hover:border-[#e5c378]/40 bg-black/30 backdrop-blur-md transition-all text-xs"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-[#e5c378]" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-stone-500" />
            )}
          </button>

          {/* Reset Unboxing Button */}
          <button
            id="btn-replay"
            type="button"
            onClick={resetExperience}
            aria-label="Reiniciar Unboxing"
            className="text-xs tracking-wider px-3.5 py-1.5 rounded-full border border-white/10 text-stone-300 hover:text-white hover:border-[#e5c378]/50 transition-all flex items-center gap-1.5 bg-black/40 backdrop-blur-md shadow-sm active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#e5c378]" />
            <span className="font-medium">Reiniciar Unboxing</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="relative w-full max-w-md mx-auto flex flex-col items-center justify-center z-10 my-auto min-h-[680px]">
        
        {/* ======================================================== */}
        {/* ESTADO 1: SOBRE DE LUJO CON CERA (PANTALLA DE ENTRADA)   */}
        {/* ======================================================== */}
        {!isOpened && (
          <div
            id="envelope-scene"
            className={`w-full flex flex-col items-center justify-center envelope-stage transition-all duration-700 py-4 ${
              isEnvelopeReceded ? 'opacity-0 pointer-events-none scale-75 translate-y-16' : 'opacity-100'
            }`}
          >
            {/* Intro Header */}
            <div
              id="envelope-intro"
              className={`text-center mb-6 transition-all duration-500 ${
                isSealCracked ? 'opacity-0 -translate-y-4' : 'opacity-100'
              }`}
            >
              <span className="inline-block px-3.5 py-1 text-[11px] font-cinzel tracking-[0.3em] uppercase text-[#e5c378] border border-[#e5c378]/25 rounded-full bg-[#1b191d]/80 mb-3 backdrop-blur-sm shadow-[0_2px_15px_rgba(229,195,120,0.1)]">
                Correspondencia Exclusiva
              </span>
              <h1 className="font-serif-luxury text-2xl md:text-3xl text-stone-100 tracking-wide font-normal">
                Para: <span className="italic text-[#fcedc5]">Invitado de Honor</span>
              </h1>
              <p className="text-xs text-stone-400 mt-2 tracking-wider max-w-xs mx-auto leading-relaxed">
                Has recibido una convocatoria reservada para el Solsticio de Invierno.
              </p>
            </div>

            {/* El Sobre 3D Físico */}
            <div
              id="physical-envelope"
              className={`envelope-wrapper relative w-[340px] sm:w-[370px] h-[240px] bg-[#1a181c] rounded-xl shadow-2xl border border-stone-800/80 overflow-visible flex items-center justify-center ${
                isFlapOpen ? 'envelope-opened' : ''
              }`}
              style={{
                transform: isEnvelopeReceded
                  ? 'scale(0.7) translateY(80px)'
                  : undefined,
              }}
            >
              {/* Textura de papel artesanal con costuras doradas finas */}
              <div className="absolute inset-1.5 rounded-lg border border-dashed border-[#e5c378]/20 pointer-events-none"></div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-black/60 via-transparent to-white/[0.04] pointer-events-none"></div>

              {/* Triángulo lateral izquierdo del sobre */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                <div className="absolute top-0 left-0 w-0 h-0 border-t-[120px] border-t-transparent border-b-[120px] border-b-transparent border-l-[170px] sm:border-l-[185px] border-l-[#151417] shadow-[3px_0_15px_rgba(0,0,0,0.7)]"></div>
                {/* Triángulo lateral derecho del sobre */}
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[120px] border-t-transparent border-b-[120px] border-b-transparent border-r-[170px] sm:border-r-[185px] border-r-[#151417] shadow-[-3px_0_15px_rgba(0,0,0,0.7)]"></div>
                {/* Solapa inferior del sobre */}
                <div className="absolute bottom-0 left-0 right-0 w-0 h-0 border-l-[170px] sm:border-l-[185px] border-l-transparent border-r-[170px] sm:border-r-[185px] border-r-transparent border-b-[130px] border-b-[#1f1d22] shadow-[0_-5px_18px_rgba(0,0,0,0.8)]"></div>
              </div>

              {/* Solapa Superior que se pliega en 3D (Flap) */}
              <div
                id="envelope-flap"
                className="envelope-flap absolute top-0 left-0 right-0 h-[125px] z-30 pointer-events-none"
              >
                <div className="w-full h-full relative">
                  <svg
                    viewBox="0 0 370 125"
                    className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)]"
                    preserveAspectRatio="none"
                  >
                    <polygon
                      points="0,0 370,0 185,125"
                      fill="#242127"
                      stroke="rgba(229,195,120,0.3)"
                      strokeWidth="1"
                    />
                    <polygon
                      points="8,0 362,0 185,119"
                      fill="url(#flapGrad)"
                      opacity="0.45"
                    />
                    <defs>
                      <linearGradient id="flapGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#37333d" />
                        <stop offset="100%" stopColor="#18161a" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* Sello de Cera Carmesí / Borgoña Real en Relieve 3D */}
              <div
                id="wax-seal-container"
                className={`absolute z-40 top-[88px] flex flex-col items-center transition-all duration-500 ${
                  stage === 'cracking'
                    ? 'scale-75 rotate-12 opacity-30 blur-[1px]'
                    : isFlapOpen
                    ? 'opacity-0 scale-50 pointer-events-none'
                    : 'opacity-100'
                }`}
              >
                <button
                  id="btn-open-seal"
                  type="button"
                  onClick={triggerUnboxing}
                  aria-label="Abrir sobre rompiendo el sello de cera"
                  className="wax-seal animate-pulse-glow w-20 h-20 rounded-full bg-gradient-to-br from-[#a73527] via-[#852317] to-[#4e110a] border-2 border-[#b54536]/80 flex flex-col items-center justify-center text-center p-2 relative group focus:outline-none cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-full border border-dashed border-[#fcedc5]/60 flex items-center justify-center bg-black/20 shadow-inner">
                    <span className="font-cinzel text-base tracking-widest text-[#fcedc5] font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                      NS
                    </span>
                  </div>
                  {/* Organic melted wax droplets */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#7a1f14] rounded-full blur-[0.6px] -z-10"></div>
                  <div className="absolute -bottom-1.5 -left-1 w-5 h-5 bg-[#8b261b] rounded-full blur-[0.6px] -z-10"></div>
                </button>
              </div>

              {/* CTA Prompt */}
              <div
                id="action-prompt"
                className={`absolute -bottom-20 flex flex-col items-center gap-2 transition-all duration-500 ${
                  isSealCracked ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100'
                }`}
              >
                <button
                  type="button"
                  onClick={triggerUnboxing}
                  className="group relative px-6 py-2.5 rounded-full overflow-hidden bg-gradient-to-r from-[#211f24] via-[#2c2831] to-[#211f24] border border-[#e5c378]/50 shadow-[0_4px_22px_rgba(229,195,120,0.2)] hover:shadow-[0_6px_30px_rgba(229,195,120,0.35)] transition-all duration-300 cursor-pointer"
                >
                  <span className="relative z-10 flex items-center gap-2 font-cinzel text-xs tracking-[0.25em] text-[#fcedc5] uppercase font-semibold">
                    <span>Romper Sello y Abrir</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#e5c378] group-hover:rotate-12 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#e5c378]/25 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </button>
                <span className="text-[11px] text-stone-400 tracking-wider flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#e5c378] animate-pulse"></span>
                  Toca el sello para comenzar
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ESTADO 2: TIRA MÓVIL CONTINUA 9:16 (THE REVEAL)           */}
        {/* ======================================================== */}
        {(isOpened || stage === 'ejecting_card' || stage === 'revealed') && (
          <div
            id="mobile-invitation-container"
            className="mobile-invitation-strip w-full max-w-[390px] h-[760px] relative rounded-[38px] phone-mockup-frame bg-[#121114] border-2 border-[#2b2730] flex flex-col overflow-hidden shadow-2xl"
            style={{
              opacity: stage === 'ejecting_card' ? 0.3 : 1,
              transform: stage === 'ejecting_card' ? 'scale(0.9) translateY(48px)' : 'scale(1) translateY(0)',
              transition: 'opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1), transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Phone Bezel Header: Speaker, Time, Notch, Battery */}
            <div className="absolute top-0 left-0 right-0 h-8 z-40 flex items-center justify-between px-7 pointer-events-none bg-gradient-to-b from-black/90 to-transparent">
              <span className="text-[10px] font-medium text-stone-400 tracking-tight">20:45</span>
              <div className="w-20 h-4 bg-black rounded-full flex items-center justify-center gap-1.5 border border-white/5">
                <div className="w-2 h-2 rounded-full bg-stone-900 border border-stone-700"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#1c2a38]"></div>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
                <Wifi className="w-3 h-3 text-stone-400" />
                <BatteryCharging className="w-3.5 h-3.5 text-[#e5c378]" />
              </div>
            </div>

            {/* Reading Progress Bar */}
            <div
              id="read-progress"
              className="absolute top-8 left-0 h-[2.5px] bg-gradient-to-r from-[#b89344] via-[#e5c378] to-[#fcedc5] z-40 transition-all duration-150 shadow-[0_0_8px_rgba(229,195,120,0.6)]"
              style={{ width: `${scrollProgress}%` }}
              role="progressbar"
              aria-valuenow={Math.round(scrollProgress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progreso de lectura de la invitación"
            ></div>

            {/* Scrollable 9:16 Luxury Invitation Strip */}
            <div
              id="invitation-scrollable-strip"
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="w-full h-full overflow-y-auto no-scrollbar pt-10 pb-16 px-6 bg-paper-texture scroll-smooth"
            >
              {/* SECCIÓN 1: Cabecera Hero con Monograma & Titular */}
              <section className="reveal-on-scroll is-visible text-center pt-8 pb-10 flex flex-col items-center border-b border-[#e5c378]/15 relative">
                <div className="w-16 h-16 rounded-full border border-[#e5c378]/40 p-1 mb-4 flex items-center justify-center bg-gradient-to-b from-[#242127] to-[#141316] shadow-lg">
                  <div className="w-full h-full rounded-full border border-dashed border-[#e5c378]/30 flex items-center justify-center">
                    <GoldStar className="w-6 h-6 text-[#fcedc5]" />
                  </div>
                </div>

                <p className="font-cinzel text-[11px] tracking-[0.35em] text-[#e5c378] uppercase mb-2">
                  Invitación Privada
                </p>

                <h2 className="font-serif-luxury text-3xl sm:text-4xl leading-tight font-normal text-stone-100">
                  Nocturne <br />
                  <span className="italic text-[#fcedc5] font-serif">Solstice Gala</span>
                </h2>

                <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#e5c378] to-transparent my-4"></div>

                <p className="text-xs text-stone-300 font-light leading-relaxed max-w-[270px]">
                  Una celebración inmersiva de arquitectura, alta costura y gastronomía botánica bajo las estrellas del solsticio.
                </p>

                <div className="mt-4 flex items-center gap-2 text-[10px] tracking-widest text-[#e5c378]/80 font-cinzel">
                  <span>EDICIÓN LIMITADA</span>
                  <span>•</span>
                  <span>BOLETO Nº 084</span>
                </div>
              </section>

              {/* SECCIÓN 2: Fecha, Hora y Cuenta Regresiva */}
              <section className="reveal-on-scroll py-8 border-b border-[#e5c378]/15 flex flex-col items-center text-center">
                <span className="text-[10px] font-cinzel tracking-[0.25em] text-stone-400 uppercase mb-3 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-[#e5c378]" /> Cronograma Oficial
                </span>

                <div className="grid grid-cols-3 gap-2.5 w-full my-2">
                  <div className="bg-[#1e1c22]/90 border border-stone-800 rounded-xl p-3 flex flex-col items-center shadow-inner">
                    <span className="text-[10px] text-stone-400 uppercase font-cinzel">Sábado</span>
                    <span className="font-serif-luxury text-2xl text-[#fcedc5] font-bold">21</span>
                    <span className="text-[10px] text-[#e5c378]">Diciembre</span>
                  </div>
                  <div className="bg-[#1e1c22]/90 border border-[#e5c378]/30 rounded-xl p-3 flex flex-col items-center shadow-[0_0_15px_rgba(229,195,120,0.08)]">
                    <span className="text-[10px] text-stone-400 uppercase font-cinzel">Recepción</span>
                    <span className="font-serif-luxury text-2xl text-[#fcedc5] font-bold">19:30</span>
                    <span className="text-[10px] text-[#e5c378]">Hora Exacta</span>
                  </div>
                  <div className="bg-[#1e1c22]/90 border border-stone-800 rounded-xl p-3 flex flex-col items-center shadow-inner">
                    <span className="text-[10px] text-stone-400 uppercase font-cinzel">Temporada</span>
                    <span className="font-serif-luxury text-2xl text-[#fcedc5] font-bold">MMXXV</span>
                    <span className="text-[10px] text-[#e5c378]">Solsticio</span>
                  </div>
                </div>

                {/* Calendar Add Action & Micro Countdown */}
                <div className="mt-4 flex flex-col items-center gap-2 w-full">
                  <div className="px-3.5 py-1.5 rounded-full bg-black/40 border border-white/5 flex items-center gap-2.5 text-xs">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                    <span className="text-[11px] text-stone-300 tracking-wide font-light">
                      Faltan {countdown.days} días, {countdown.hours}h para la velada
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={downloadCalendarIcs}
                    className="text-[10px] text-[#e5c378] hover:text-[#fcedc5] flex items-center gap-1.5 font-cinzel tracking-wider pt-1 underline-offset-4 hover:underline"
                  >
                    <Clock className="w-3 h-3" />
                    <span>Guardar fecha en Calendario (.ics)</span>
                  </button>
                </div>
              </section>

              {/* SECCIÓN 3: Ubicación Secreta & Mapa Estilizado */}
              <section className="reveal-on-scroll py-8 border-b border-[#e5c378]/15">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-cinzel tracking-[0.25em] text-[#e5c378] uppercase flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" /> Enclave Privado
                  </span>
                  <span className="text-[9px] text-stone-400 border border-stone-700 px-2 py-0.5 rounded-full">
                    Acceso Exclusivo
                  </span>
                </div>

                <h3 className="font-serif-luxury text-xl text-stone-100 mb-1">
                  Palacio de Cristal & Jardines Botánicos
                </h3>
                <p className="text-xs text-stone-400 mb-4 font-light">
                  Avenida de las Acacias 1400, Reserva Forestal del Valle.
                </p>

                {/* Mapa estilizado en modo oscuro con pines dorados */}
                <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-[#e5c378]/25 bg-[#17161a] group shadow-inner">
                  <svg className="w-full h-full object-cover opacity-60" viewBox="0 0 340 180" aria-label="Mapa ilustrado del enclave">
                    <rect width="340" height="180" fill="#141317" />
                    {/* Calles y avenidas abstractas */}
                    <path d="M0,40 Q100,50 200,30 T340,70" stroke="#2c2833" strokeWidth="8" fill="none" />
                    <path d="M70,0 L90,180" stroke="#2c2833" strokeWidth="12" fill="none" />
                    <path d="M220,0 L180,180" stroke="#25222b" strokeWidth="6" fill="none" />
                    <path d="M0,130 Q170,110 340,140" stroke="#2c2833" strokeWidth="10" fill="none" />
                    {/* Zona de jardines botánicos */}
                    <circle cx="210" cy="95" r="45" fill="#1b2520" stroke="#2d4036" strokeWidth="1" />
                    {/* Ruta dorada hacia el palacio */}
                    <path
                      d="M90,130 C130,130 160,100 205,95"
                      stroke="#e5c378"
                      strokeWidth="2.5"
                      strokeDasharray="4,4"
                      fill="none"
                    />
                  </svg>

                  {/* Marcador pulsante en el mapa */}
                  <div className="absolute top-[82px] left-[198px] flex flex-col items-center">
                    <div className="relative">
                      <div className="w-6 h-6 rounded-full bg-[#e5c378]/30 animate-ping absolute -inset-1"></div>
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#b89344] to-[#fcedc5] flex items-center justify-center shadow-lg border border-black">
                        <Sparkles className="w-2.5 h-2.5 text-stone-900" />
                      </div>
                    </div>
                  </div>

                  {/* Botón copiar coordenadas o abrir mapa */}
                  <button
                    type="button"
                    onClick={copyAddress}
                    className="absolute bottom-2.5 right-2.5 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-[#e5c378]/35 text-[10px] font-cinzel tracking-wider text-[#fcedc5] flex items-center gap-1.5 hover:bg-black transition-colors cursor-pointer"
                  >
                    <span>Copiar Dirección</span>
                    <Copy className="w-3 h-3 text-[#e5c378]" />
                  </button>
                </div>
              </section>

              {/* SECCIÓN 4: Dress Code & Experiencia Culinaria */}
              <section className="reveal-on-scroll py-8 border-b border-[#e5c378]/15">
                <span className="text-[10px] font-cinzel tracking-[0.25em] text-[#e5c378] uppercase block mb-3">
                  Atmósfera & Código de Vestimenta
                </span>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-[#1b191e]/80 border border-stone-800 flex items-start gap-3.5 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-[#27232c] flex items-center justify-center shrink-0 border border-[#e5c378]/20">
                      <Gem className="w-4 h-4 text-[#e5c378]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-stone-200 tracking-wide">
                        Black Tie Nocturno & Metálicos
                      </h4>
                      <p className="text-[11px] text-stone-400 font-light mt-0.5 leading-relaxed">
                        Smoking clásico, vestidos de noche en terciopelo oscuro, ébano, esmeralda profunda o destellos dorados.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#1b191e]/80 border border-stone-800 flex items-start gap-3.5 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-[#27232c] flex items-center justify-center shrink-0 border border-[#e5c378]/20">
                      <Utensils className="w-4 h-4 text-[#e5c378]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-stone-200 tracking-wide">
                        Cena de Gala en 5 Tiempos
                      </h4>
                      <p className="text-[11px] text-stone-400 font-light mt-0.5 leading-relaxed">
                        Menú maridado por el Chef Laurent Duprat con mixología botánica molecular y cava de reserva.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECCIÓN 5: Confirmación de Asistencia (RSVP Táctil) */}
              <section className="reveal-on-scroll py-8 text-center flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#e5c378]/10 flex items-center justify-center text-[#e5c378] mb-2">
                  <Send className="w-4 h-4" />
                </div>

                <h3 className="font-serif-luxury text-2xl text-stone-100 font-normal">
                  Confirma tu Presencia
                </h3>
                <p className="text-xs text-stone-400 font-light max-w-[260px] mt-1 mb-5 leading-relaxed">
                  Agradecemos confirmar antes del 10 de Diciembre para coordinar el conserje de traslados.
                </p>

                {/* Formulario RSVP elegante dentro de la tira */}
                <div
                  id="rsvp-card"
                  className="w-full bg-[#18161a] border border-[#e5c378]/30 rounded-2xl p-5 shadow-xl text-left relative overflow-hidden"
                >
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleConfirmRsvp();
                    }}
                    className="space-y-3.5"
                  >
                    <div>
                      <label htmlFor="guest-name-input" className="block text-[10px] font-cinzel tracking-wider text-stone-400 uppercase mb-1">
                        Nombre Completo
                      </label>
                      <input
                        id="guest-name-input"
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Nombre y Apellido"
                        className="w-full bg-[#100f12] border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-[#e5c378] transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-cinzel tracking-wider text-stone-400 uppercase mb-1">
                        Cupo de Asistencia
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setGuestsCount(1)}
                          className={`rsvp-btn flex-1 py-1.5 px-3 rounded-lg text-xs text-center font-medium transition-all ${
                            guestsCount === 1
                              ? 'border border-[#e5c378] bg-[#e5c378]/10 text-[#fcedc5]'
                              : 'border border-stone-800 bg-black/40 text-stone-400 hover:border-stone-700'
                          }`}
                        >
                          1 Invitado
                        </button>
                        <button
                          type="button"
                          onClick={() => setGuestsCount(2)}
                          className={`rsvp-btn flex-1 py-1.5 px-3 rounded-lg text-xs text-center font-medium transition-all ${
                            guestsCount === 2
                              ? 'border border-[#e5c378] bg-[#e5c378]/10 text-[#fcedc5]'
                              : 'border border-stone-800 bg-black/40 text-stone-400 hover:border-stone-700'
                          }`}
                        >
                          2 Invitados (+1)
                        </button>
                      </div>
                    </div>

                    {rsvpError && (
                      <p className="text-[11px] text-rose-400 bg-rose-950/40 border border-rose-800/50 rounded-lg p-2 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 shrink-0" />
                        <span>{rsvpError}</span>
                      </p>
                    )}

                    <div className="pt-2">
                      <button
                        id="btn-submit-rsvp"
                        type="submit"
                        disabled={isSubmittingRsvp}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#b89344] via-[#e5c378] to-[#9a7833] text-stone-950 font-cinzel text-xs font-bold tracking-[0.2em] uppercase shadow-lg shadow-[#e5c378]/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-80"
                      >
                        {isSubmittingRsvp ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin"></div>
                            <span>Registrando pase...</span>
                          </>
                        ) : (
                          <>
                            <span>Confirmar Asistencia</span>
                            <Check className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Tarjeta verde de "Presencia Confirmada" */}
                  {rsvpResult && (
                    <div
                      id="rsvp-success-overlay"
                      className="absolute inset-0 bg-[#18161a] border border-emerald-500/40 rounded-2xl flex flex-col items-center justify-center p-6 text-center transition-all duration-500 z-20 shadow-2xl"
                    >
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h4 className="font-serif-luxury text-xl text-stone-100 font-normal">
                        Presencia Confirmada
                      </h4>
                      <p className="text-[11px] text-stone-300 mt-1.5 leading-relaxed">
                        Tu credencial digital y código de acceso han sido reservados. Te esperamos en el solsticio.
                      </p>

                      <div className="mt-3 p-2.5 rounded-lg bg-black/60 border border-[#e5c378]/30 w-full text-center">
                        <p className="text-[9px] font-cinzel text-[#e5c378] tracking-widest uppercase">
                          Boleto VIP Asignado
                        </p>
                        <p className="font-mono text-xs text-[#fcedc5] font-bold tracking-wider mt-0.5">
                          {rsvpResult.ticketId}
                        </p>
                        <p className="text-[10px] text-stone-400 mt-0.5">
                          {rsvpResult.summary}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setRsvpResult(null)}
                        className="mt-3 text-[10px] text-stone-400 hover:text-stone-200 underline font-light"
                      >
                        Modificar confirmación
                      </button>
                    </div>
                  )}
                </div>

                {/* Pie de la invitación */}
                <footer className="mt-8 text-center pb-2">
                  <p className="font-cinzel text-[10px] tracking-[0.3em] text-[#e5c378]/70 uppercase">
                    Nocturne Solstice • MMXXV
                  </p>
                  <p className="text-[9px] text-stone-500 mt-1">
                    Diseño de Experiencia de Unboxing Digital Móvil • 60 FPS
                  </p>
                </footer>
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Floating Toast Feedback */}
      <div
        id="toast-message"
        role="status"
        aria-live="polite"
        className={`fixed bottom-6 z-50 px-4 py-2 rounded-full bg-[#201d24]/95 border border-[#e5c378]/40 shadow-2xl backdrop-blur-md text-xs text-[#fcedc5] font-cinzel tracking-wider flex items-center gap-2 transition-all duration-300 pointer-events-none ${
          toastMessage ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5 text-[#e5c378] shrink-0" />
        <span id="toast-text">{toastMessage || ''}</span>
      </div>
    </div>
  );
}
