import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateScrollProgress,
  formatRsvpSubmission,
  computeGalaCountdown,
} from './invitation.ts';

test('calculateScrollProgress computes exact bounded percentage', () => {
  assert.equal(calculateScrollProgress(0, 1000, 500), 0);
  assert.equal(calculateScrollProgress(250, 1000, 500), 50);
  assert.equal(calculateScrollProgress(500, 1000, 500), 100);
  // clamped above
  assert.equal(calculateScrollProgress(600, 1000, 500), 100);
  // zero or negative range
  assert.equal(calculateScrollProgress(0, 500, 500), 100);
});

test('formatRsvpSubmission rejects empty or too short names', () => {
  const emptyRes = formatRsvpSubmission({ guestName: '', guestsCount: 1 });
  assert.equal(emptyRes.valid, false);
  assert.ok(emptyRes.error?.includes('introduce tu nombre'));

  const shortRes = formatRsvpSubmission({ guestName: 'Al', guestsCount: 1 });
  assert.equal(shortRes.valid, false);
  assert.ok(shortRes.error?.includes('al menos 3 caracteres'));
});

test('formatRsvpSubmission generates authentic luxury ticket for valid submission', () => {
  const result = formatRsvpSubmission({
    guestName: 'Duque de Valois',
    guestsCount: 2,
  });

  assert.equal(result.valid, true);
  assert.ok(result.ticketId?.startsWith('NS-MMXXV-'));
  assert.equal(result.summary, 'Duque de Valois — 2 Asistentes (+1 Acompañante)');
});

test('computeGalaCountdown correctly figures remaining time', () => {
  const now = new Date('2025-12-01T10:00:00Z');
  const target = new Date('2025-12-21T19:30:00Z');
  const cd = computeGalaCountdown(target, now);

  assert.equal(cd.isPast, false);
  assert.equal(cd.days, 20);
  assert.equal(cd.hours, 9);
  assert.equal(cd.minutes, 30);
});
