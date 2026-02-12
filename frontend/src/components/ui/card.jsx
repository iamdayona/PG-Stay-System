export const Card = ({ children, className = "", onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`rounded ${className}`}
    >
      {children}
    </div>
  );
};