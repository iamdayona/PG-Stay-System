export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full p-2 border rounded resize-none ${className}`}
      {...props}
    />
  );
}
