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
