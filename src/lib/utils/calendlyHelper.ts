// Utilities to build Calendly prefill objects and URLs from our session info form

// Exact mapping spec from product requirements
// a1 → Main Goal
// a2 → Urgency
// a3 → Confidence
// a4 → Preferred Style (optional)
// a5 → Subject/Course
// a6 → Specific Topic
// a7 → Upcoming w/ date (optional)
// a8 → Materials links (optional, comma-separated)
// a9 → Anything else (optional, max ~500)
// a10 → Grade/Level (optional)

export type MainGoal =
  | 'Homework help'
  | 'Concept review'
  | 'Test/quiz prep'
  | 'Project/paper guidance'
  | 'Skill development';

export type Urgency = 'Today/24h' | 'This week' | 'Planning ahead';
export type Confidence =
  | 'Very confused—start from basics'
  | 'Somewhat confused—need clarification + practice'
  | 'Mostly confident—need refinement/test strategies';
export type PreferredStyle =
  | 'Step-by-step explanations'
  | 'Practice problems/drills'
  | 'Brainstorming'
  | 'Review my work + feedback';

export interface SessionAnswers {
  name: string; // Contact name
  email: string; // Contact email
  a1: MainGoal;
  a2: Urgency;
  a3: Confidence;
  a4?: PreferredStyle;
  a5: string; // Subject/Course
  a6: string; // Specific Topic (<= ~500)
  a7?: string; // Upcoming w/ date
  a8?: string; // Materials links (comma-separated URLs)
  a9?: string; // Anything else (<= ~500)
  a10?: string; // Grade/Level
}

export interface CalendlyPrefill {
  name?: string;
  email?: string;
  customAnswers?: { [key: string]: string };
}

function clip(str: string | undefined, max = 500): string | undefined {
  if (!str) return undefined;
  const t = str.trim();
  return t.length > max ? t.slice(0, max) : t;
}

function validUrlLike(s: string) {
  try {
    const u = new URL(s.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function normalizeMaterials(a8?: string): string | undefined {
  if (!a8) return undefined;
  const items = a8
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
    .filter((x) => {
      // tolerate plain text but prefer URLs; keep valid URLs and pass through others as text
      return true;
    });
  return items.join(', ');
}

// Build the tutor-facing summary block (used in notes and to prefill Calendly text area via a9 when applicable)
export function buildTutorSummary(a: SessionAnswers): string {
  const lines: string[] = [];
  lines.push(`Goal: ${a.a1}`);
  lines.push(`Urgency: ${a.a2}`);
  lines.push(`Confidence: ${a.a3}`);
  if (a.a4) lines.push(`Style: ${a.a4}`);
  lines.push(`Course: ${a.a5}`);
  lines.push(`Topic: ${a.a6}`);
  if (a.a7) lines.push(`Upcoming: ${a.a7}`);
  if (a.a8) lines.push(`Materials: ${normalizeMaterials(a.a8)}`);
  if (a.a9) lines.push(`Notes: ${clip(a.a9)}`);
  if (a.a10) lines.push(`Level: ${a.a10}`);
  return lines.join('\n');
}

// Map our site subjects to the limited Calendly options configured in the event
function mapSubjectToCalendlyOption(subject: string | undefined): string | undefined {
  if (!subject) return undefined;
  const s = subject.toLowerCase();
  if (/(ap\s*bio|ap\s*biology|biology|bio)/i.test(subject)) return 'AP Bio';
  if (/(ap\s*calc|calculus|ap calculus)/i.test(subject)) return 'AP Calculus';
  if (/(sat|psat)/i.test(subject)) return 'SAT Practice';
  return undefined; // leave unselected if no close match
}

const SUBJECT_FALLBACK: string = 'SAT Practice'; // change if you prefer another default

// Build the prefill object for Calendly.initInlineWidget
export function buildCalendlyPrefill(a: SessionAnswers): CalendlyPrefill {
  // Build a comprehensive summary intended for the main free-text question in Calendly
  const fullSummary = buildTutorSummary(a);
  const combined = a.a9 ? `${clip(a.a9)}\n\n— Summary —\n${fullSummary}` : fullSummary;
  const clippedSummary = clip(combined) || '';

  // Put the same summary in a1..a10 so whichever custom text field Calendly uses gets populated
  const customAnswers: Record<string, string> = {};
  for (let i = 1; i <= 10; i++) customAnswers[`a${i}`] = clippedSummary;

  // Try to auto-select the Subject/Course if it matches the limited event options
  const mappedSubject = mapSubjectToCalendlyOption(a.a5) || SUBJECT_FALLBACK;
  customAnswers['a5'] = mappedSubject;

  const prefill: CalendlyPrefill = {
    name: a.name?.trim() || undefined,
    email: a.email?.trim() || undefined,
    customAnswers
  };
  return prefill;
}

// Append query params for prefill to a Calendly URL (works for inline or popup embeds)
export function buildCalendlyUrlWithPrefill(baseUrl: string, prefill: CalendlyPrefill): string {
  // Manually build query string using percent-encoding so spaces render as spaces (avoid '+').
  const url = new URL(baseUrl);

  const parts: string[] = [];
  const push = (k: string, v?: string) => {
    if (v && v.trim()) parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  };

  if (prefill.name) push('name', prefill.name);
  if (prefill.email) push('email', prefill.email);
  if (prefill.customAnswers) {
    for (const [key, val] of Object.entries(prefill.customAnswers)) {
      push(key, val);
    }
  }
  // Always hide GDPR banner for cleanliness
  push('hide_gdpr_banner', '1');

  const qs = parts.join('&');
  const hasQuery = url.search ? url.search.includes('?') || url.search.length > 1 : false;
  const sep = hasQuery ? '&' : (url.search ? '' : '?');

  // Compose final URL without letting URLSearchParams re-encode '+' for spaces
  const base = url.origin + url.pathname + (url.search || '');
  return qs ? `${base}${sep}${qs}${url.hash || ''}` : url.toString();
}
