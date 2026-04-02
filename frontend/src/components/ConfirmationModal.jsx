export default function ConfirmationModal({ isOpen, title, message, onYes, onNo }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.5)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10000,
      padding: "20px"
    }}>
      <div style={{
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 20px 60px rgba(0,0,0,.3)",
        maxWidth: "420px",
        width: "100%",
        padding: "32px",
        animation: "slideUp .3s ease"
      }}>
        {/* Title */}
        <div style={{
          fontFamily: "Nunito,sans-serif",
          fontSize: "1.2rem",
          fontWeight: 800,
          color: "#2d2d4e",
          marginBottom: "12px"
        }}>
          {title}
        </div>

        {/* Message */}
        <div style={{
          fontSize: ".95rem",
          color: "#5a5a7a",
          lineHeight: 1.5,
          marginBottom: "28px"
        }}>
          {message}
        </div>

        {/* Buttons */}
        <div style={{
          display: "flex",
          gap: "12px",
          justifyContent: "flex-end"
        }}>
          <button
            onClick={onNo}
            style={{
              padding: "10px 24px",
              border: "2px solid rgba(200,200,220,.5)",
              borderRadius: "12px",
              background: "rgba(255,255,255,.8)",
              color: "#5a5a7a",
              fontFamily: "Poppins,sans-serif",
              fontSize: ".88rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all .15s"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(200,200,220,.15)";
              e.target.style.borderColor = "rgba(200,200,220,.8)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,.8)";
              e.target.style.borderColor = "rgba(200,200,220,.5)";
            }}
          >
            No
          </button>
          <button
            onClick={onYes}
            style={{
              padding: "10px 24px",
              border: "none",
              borderRadius: "12px",
              background: "linear-gradient(135deg,#42a5f5,#1e88e5)",
              color: "white",
              fontFamily: "Poppins,sans-serif",
              fontSize: ".88rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all .15s",
              boxShadow: "0 4px 12px rgba(66,165,245,.3)"
            }}
            onMouseEnter={(e) => {
              e.target.style.filter = "brightness(1.08)";
            }}
            onMouseLeave={(e) => {
              e.target.style.filter = "brightness(1)";
            }}
          >
            Yes
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity:0; transform:translateY(20px); }
          to { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  );
}
