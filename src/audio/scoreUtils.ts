/**
 * Score utility helpers for Radio Satie
 * Ensures note scores completely fill the stated run time of tracks
 */

import { Composition, NoteEvent } from '../types/satie.ts';

/**
 * Returns a score that fills the composition's entire stated durationSeconds.
 * If the score is already full length (as with generated pieces), returns it directly.
 * For theme excerpts, expands them seamlessly with subtle expressive nuances and
 * natural phrasing pauses across the entire track runtime.
 */
export function getFullPlayableScore(comp: Composition): NoteEvent[] {
  if (!comp.score || comp.score.length === 0) return [];
  const baseScore = comp.score;
  const maxScoreTime = Math.max(...baseScore.map((e) => e.time + e.duration));
  if (maxScoreTime <= 0) return baseScore;

  // If the score already covers at least 85% of the track duration, return as-is
  if (maxScoreTime >= comp.durationSeconds * 0.85) {
    return baseScore;
  }

  const expanded: NoteEvent[] = [];
  const cycleInterval = maxScoreTime + 1.8; // contemplative breath between cycles
  let currentOffset = 0;
  let cycle = 0;

  while (currentOffset < comp.durationSeconds - 2) {
    for (const ev of baseScore) {
      const noteTime = currentOffset + ev.time;
      if (noteTime + ev.duration > comp.durationSeconds) continue;

      // Subtle expressive dynamics on successive repetitions
      const velDelta = cycle % 2 === 1 ? -0.04 : 0.02;
      const velocity = Math.max(0.32, Math.min(0.88, (ev.velocity ?? 0.7) + velDelta));

      expanded.push({
        ...ev,
        time: Number(noteTime.toFixed(3)),
        velocity: Number(velocity.toFixed(3))
      });
    }
    currentOffset += cycleInterval;
    cycle++;
  }

  return expanded.length > 0 ? expanded : baseScore;
}
