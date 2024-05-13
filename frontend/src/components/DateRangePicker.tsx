import Picker, { DateRange } from "rsuite/DateRangePicker";
import "rsuite/DateRangePicker/styles/index.css";

const { combine, allowedMaxDays, after } = Picker;

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

type DateRangePickerProps = {
  handleDateChange: React.ComponentProps<typeof Picker>["onChange"];
  value?: DateRange | null;
};

export default function DateRangePicker({
  handleDateChange,
  value,
}: DateRangePickerProps) {
  return (
    <Picker
      size="lg"
      placeholder="Select date range for your question. 3 days max."
      shouldDisableDate={combine(allowedMaxDays(3), after(yesterday))}
      onChange={handleDateChange}
      defaultValue={[yesterday, yesterday]}
      value={value}
      block
      showOneCalendar
    />
  );
}
