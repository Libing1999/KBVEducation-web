export type CohortStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export interface CohortResponse {
  id: string;
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  examDate?: string | null;
  status: CohortStatus;
  maxStudents: number;
  studentCount: number;
  createdAt: string;
}

export interface CohortRequest {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  examDate?: string | null;
  status: CohortStatus;
  maxStudents: number;
}

export interface CohortsQuery {
  status?: CohortStatus;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export type CohortDayType = 'LESSON_DAY' | 'REST_DAY' | 'SKIP_DAY';

/** One date's classification for a cohort. `configured=false` means no admin override
 *  exists for this date — `dayType` is the default (LESSON_DAY). */
export interface CohortDay {
  date: string;
  dayType: CohortDayType;
  configured: boolean;
}
