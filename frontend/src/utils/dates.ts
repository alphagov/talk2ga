import { DateRange } from "rsuite/esm/DateRangePicker"

export const dateRangeFrontendToDateRangeBackend = (dateRange: DateRange) => {
    return {
        start_date: dateRange[0].toISOString().slice(0, 10),
        end_date: dateRange[1].toISOString().slice(0, 10),
    }
}
