/**
 * Pure logic utilities for Studio Nocturne Digital Invitation experience.
 */

export interface RsvpData {
  guestName: string;
  guestsCount: 1 | 2;
  dietaryNotes?: string;
}

export interface RsvpResult {
  valid: boolean;
  error?: string;
  ticketId?: string;
  summary?: string;
}

/**
 * Calculates scroll reading progress as percentage [0, 100].
 */
export function calculateScrollProgress(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number
): number {
  const maxScroll = scrollHeight - clientHeight;
  if (maxScroll <= 0) return 100;
  const rawProgress = (scrollTop / maxScroll) * 100;
  return Math.min(100, Math.max(0, Math.round(rawProgress * 10) / 10));
}

/**
 * Validates and formats RSVP submission data.
 */
export function formatRsvpSubmission(data: RsvpData): RsvpResult {
  const trimmed = data.guestName?.trim() || '';
  if (!trimmed) {
    return {
      valid: false,
      error: 'Por favor, introduce tu nombre o el del titular del pase.',
    };
  }

  if (trimmed.length < 3) {
    return {
      valid: false,
      error: 'El nombre debe contener al menos 3 caracteres.',
    };
  }

  if (data.guestsCount !== 1 && data.guestsCount !== 2) {
    return {
      valid: false,
      error: 'El cupo de cortesía permite 1 o 2 asistentes.',
    };
  }

  // Generate deterministic-looking luxury ticket serial
  let hash = 0;
  for (let i = 0; i < trimmed.length; i++) {
    hash = (hash * 31 + trimmed.charCodeAt(i)) & 0xffff;
  }
  const ticketCode = `NS-MMXXV-${String(Math.abs(hash) % 9000 + 1000)}`;

  return {
    valid: true,
    ticketId: ticketCode,
    summary: `${trimmed} — ${data.guestsCount === 1 ? '1 Asistente Individual' : '2 Asistentes (+1 Acompañante)'}`,
  };
}

/**
 * Computes remaining time until gala date.
 */
export function computeGalaCountdown(
  targetDate: Date,
  now: Date = new Date()
): {
  isPast: boolean;
  days: number;
  hours: number;
  minutes: number;
} {
  const diffMs = targetDate.getTime() - now.getTime();
  if (diffMs <= 0) {
    return { isPast: true, days: 0, hours: 0, minutes: 0 };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return {
    isPast: false,
    days,
    hours,
    minutes,
  };
}
