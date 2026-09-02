/** Mirrors the backend's ParentSummaryResponse (GET /api/parent/summary). Every
 *  nullable field here is a section that's either fully rendered or fully
 *  absent on screen — never an empty/zero state (see the Parent UI design's
 *  NOTES.md, section 06). */
export interface ParentSummary {
  childName: string;
  cohortName: string;
  weekRangeLabel: string;
  action: ParentActionItem | null;
  justStarted: boolean;
  practice: ParentWeekMetric | null;
  reflection: ParentWeekMetric | null;
  quizzes: ParentCompletionCount;
  homework: ParentCompletionCount;
  certificate: ParentCertificateInfo | null;
  tierLine: string | null;
  cadenceText: string;
}

export interface ParentActionItem {
  label: string;
  daysLeftLabel: string;
  urgent: boolean;
}

export interface ParentWeekMetric {
  done: number;
  total: number;
  courseDone: number;
  courseTotal: number;
}

export interface ParentCompletionCount {
  done: number;
  total: number;
}

export interface ParentCertificateInfo {
  id: string;
  certificateNumber: string;
  tierLabel: string;
}

/** A single note in the "Messages from Bhavya" rotating card. Mirrors the
 *  backend's ParentMessageResponse — `date` is a raw ISO instant, formatted
 *  to a relative string ("2 days ago") on render via formatRelativeTime. */
export interface ParentMessage {
  text: string;
  date: string;
}
