import type { FrontendDateRange, BackendDateRange } from '../types';

export const dateRangeFrontendToDateRangeBackend = (
  dateRange: FrontendDateRange,
): BackendDateRange => {
  return {
    start_date: dateRange[0].toISOString().slice(0, 10),
    end_date: dateRange[1].toISOString().slice(0, 10),
  };
};
