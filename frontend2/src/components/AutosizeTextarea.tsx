import { cn } from "../utils/cn";

const COMMON_CLS = cn(
  "text-lg col-[1] row-[1] m-0 resize-none overflow-hidden whitespace-pre-wrap break-words border-none bg-transparent p-0"
);

export function AutosizeTextarea(props: {
  id?: string;
  value?: string | null | undefined;
  placeholder?: string;
  className?: string;
  onChange?: (e: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  autoFocus?: boolean;
  readOnly?: boolean;
  cursorPointer?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="govuk-form-group">
      {/* <h1 className="govuk-label-wrapper">
        <label className="govuk-label govuk-label--l">
          Can you provide more detail?
        </label>
      </h1>
      <div id="more-detail-hint" className="govuk-hint">
        Do not include personal or financial information, like your National
        Insurance number or credit card details.
      </div> */}
      <textarea
        className="govuk-textarea"
        aria-describedby={`input-${props.id}`}
        id={props.id}
        disabled={props.disabled}
        value={props.value ?? ""}
        rows={1}
        onChange={(e) => {
          const target = e.target as HTMLTextAreaElement;
          props.onChange?.(target.value);
        }}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        placeholder={props.placeholder}
        readOnly={props.readOnly}
        autoFocus={props.autoFocus && !props.readOnly}
        onKeyDown={props.onKeyDown}
      ></textarea>
    </div>
  );
}
