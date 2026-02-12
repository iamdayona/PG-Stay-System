function Card({ children, className = "", onClick }) {
  return (
    <div
      onClick={onClick}
      className={`border border-gray-300 rounded-lg bg-white ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;
