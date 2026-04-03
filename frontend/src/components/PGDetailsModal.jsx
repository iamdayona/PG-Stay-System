export default function PGDetailsModal({ pg, rooms = [], onClose, parseAddress }) {
  if (!pg) return null;

  const addressParts = parseAddress(pg.address || "");
  const hasAddress = Object.values(addressParts).some(v => v);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.5)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: "20px",
      overflow: "auto"
    }}>
      <div style={{
        background: "white",
        borderRadius: "24px",
        boxShadow: "0 20px 60px rgba(0,0,0,.3)",
        maxWidth: "900px",
        width: "100%",
        maxHeight: "90vh",
        overflow: "auto",
        position: "relative"
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "sticky",
            top: 0,
            right: 16,
            background: "rgba(239,83,80,.15)",
            border: "1px solid rgba(239,83,80,.3)",
            color: "#c62828",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            cursor: "pointer",
            zIndex: 1000,
            float: "right",
            marginRight: "16px",
            marginTop: "16px"
          }}
        >
          ✕
        </button>

        <div style={{ padding: "32px", paddingTop: 0 }}>
          {/* Title & Status */}
          <h2 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#2d2d4e", marginBottom: 8 }}>
            {pg.name}
          </h2>
          <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
            {pg.verificationStatus === "verified" && (
              <span style={{
                background: "rgba(76,175,80,.15)",
                color: "#2e7d32",
                padding: "6px 14px",
                borderRadius: "50px",
                fontSize: ".82rem",
                fontWeight: 700,
                border: "1.5px solid rgba(129,199,132,.4)"
              }}>✓ Verified</span>
            )}
            <span style={{
              background: "rgba(66,165,245,.15)",
              color: "#1565c0",
              padding: "6px 14px",
              borderRadius: "50px",
              fontSize: ".82rem",
              fontWeight: 700,
              border: "1.5px solid rgba(144,202,249,.4)"
            }}>⭐ Trust {pg.trustScore}/100</span>
          </div>

          {/* Photo Gallery */}
          {pg.images && pg.images.length > 0 ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 12,
              marginBottom: 32
            }}>
              {pg.images.map((img) => (
                <div key={img._id} style={{
                  aspect: "4/3",
                  borderRadius: "14px",
                  overflow: "hidden",
                  border: "2px solid rgba(255,255,255,.85)",
                  cursor: "pointer"
                }}>
                  <img src={img.url} alt="PG" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              background: "rgba(200,200,220,.15)",
              padding: "40px 20px",
              borderRadius: "14px",
              textAlign: "center",
              marginBottom: 32,
              color: "#9a9ab0"
            }}>📷 No photos available</div>
          )}

          {/* Basic Details */}
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#2d2d4e", marginBottom: 16 }}>📋 Basic Details</h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 14,
            marginBottom: 28,
            background: "rgba(255,255,255,.8)",
            padding: "18px",
            borderRadius: "14px",
            border: "2px solid rgba(255,255,255,.85)"
          }}>
            <div>
              <div style={{ fontSize: ".75rem", fontWeight: 700, color: "#9a9ab0", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>📍 Location</div>
              <div style={{ fontSize: ".95rem", fontWeight: 600, color: "#2d2d4e" }}>{pg.location}</div>
            </div>
            <div>
              <div style={{ fontSize: ".75rem", fontWeight: 700, color: "#9a9ab0", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}> Available Rooms</div>
              <div style={{ fontSize: ".95rem", fontWeight: 600, color: "#2d2d4e" }}>{pg.availableRoomCount ?? pg.availableRooms ?? 0}</div>
            </div>
          </div>

          {/* Address Details */}
          {hasAddress && (
            <>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#2d2d4e", marginBottom: 16 }}>📬 Address Details</h3>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 14,
                marginBottom: 28,
                background: "rgba(255,255,255,.8)",
                padding: "18px",
                borderRadius: "14px",
                border: "2px solid rgba(255,255,255,.85)"
              }}>
                {addressParts.pgName && (
                  <div>
                    <div style={{ fontSize: ".75rem", fontWeight: 700, color: "#9a9ab0", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>PG Name</div>
                    <div style={{ fontSize: ".88rem", fontWeight: 600, color: "#2d2d4e" }}>{addressParts.pgName}</div>
                  </div>
                )}
                {addressParts.street && (
                  <div>
                    <div style={{ fontSize: ".75rem", fontWeight: 700, color: "#9a9ab0", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>Street/Locality</div>
                    <div style={{ fontSize: ".88rem", fontWeight: 600, color: "#2d2d4e" }}>{addressParts.street}</div>
                  </div>
                )}
                {addressParts.postOffice && (
                  <div>
                    <div style={{ fontSize: ".75rem", fontWeight: 700, color: "#9a9ab0", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>Post Office</div>
                    <div style={{ fontSize: ".88rem", fontWeight: 600, color: "#2d2d4e" }}>{addressParts.postOffice}</div>
                  </div>
                )}
                {addressParts.placeOfResidence && (
                  <div>
                    <div style={{ fontSize: ".75rem", fontWeight: 700, color: "#9a9ab0", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>Place of Residence</div>
                    <div style={{ fontSize: ".88rem", fontWeight: 600, color: "#2d2d4e" }}>{addressParts.placeOfResidence}</div>
                  </div>
                )}
                {addressParts.district && (
                  <div>
                    <div style={{ fontSize: ".75rem", fontWeight: 700, color: "#9a9ab0", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>District</div>
                    <div style={{ fontSize: ".88rem", fontWeight: 600, color: "#2d2d4e" }}>{addressParts.district}</div>
                  </div>
                )}
                {addressParts.pinNumber && (
                  <div>
                    <div style={{ fontSize: ".75rem", fontWeight: 700, color: "#9a9ab0", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>Pin Number</div>
                    <div style={{ fontSize: ".88rem", fontWeight: 600, color: "#2d2d4e" }}>{addressParts.pinNumber}</div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Amenities */}
          {pg.amenities && pg.amenities.length > 0 && (
            <>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#2d2d4e", marginBottom: 16 }}>✨ Amenities</h3>
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                marginBottom: 28
              }}>
                {pg.amenities.map((a) => (
                  <span key={a} style={{
                    background: "rgba(144,202,249,.15)",
                    color: "#1565c0",
                    padding: "8px 14px",
                    borderRadius: "20px",
                    fontSize: ".82rem",
                    fontWeight: 600,
                    border: "1.5px solid rgba(144,202,249,.4)"
                  }}>{a}</span>
                ))}
              </div>
            </>
          )}

          {/* Room details — from parent loader */}
          {rooms && rooms.length > 0 && (
            <>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#2d2d4e", marginBottom: 16 }}>🛏 Room Details</h3>
              <div style={{
                marginBottom: 28,
                border: "1px solid #e1e8fa",
                borderRadius: "12px",
                padding: "12px",
                background: "rgba(240,248,255,.6)"
              }}>
                {rooms.map((room) => (
                  <div key={room._id} style={{ padding: "8px 0", borderBottom: "1px solid #dbe2f1" }}>
                    <div style={{ fontWeight: 700, color: "#2d2d4e" }}>{room.roomType}</div>
                    <div style={{ fontSize: ".86rem", color: "#4f5f7a", marginTop: 2 }}>
                      Rent: ₹{room.rent} | Capacity: {room.capacity} | Occupancy: {room.currentOccupancy ?? 0} | {room.availability ? "Available" : "Full"}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Rules & Regulations */}
          {pg.rules && pg.rules.length > 0 && (
            <>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#2d2d4e", marginBottom: 16 }}>📋 Rules &amp; Regulations</h3>
              <div style={{
                background: "rgba(255,255,255,.8)",
                padding: "18px",
                borderRadius: "14px",
                border: "2px solid rgba(255,255,255,.85)",
                marginBottom: 28
              }}>
                <ol style={{ margin: 0, paddingLeft: 24, color: "#2d2d4e", fontSize: ".88rem", lineHeight: 1.7 }}>
                  {pg.rules.map((rule, idx) => (
                    <li key={idx} style={{ marginBottom: 8 }}>{rule}</li>
                  ))}
                </ol>
              </div>
            </>
          )}

          {/* Owner Contact */}
          {pg.owner && (
            <>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#2d2d4e", marginBottom: 16 }}>👤 Owner Information</h3>
              <div style={{
                background: "linear-gradient(135deg,rgba(66,165,245,.08),rgba(144,202,249,.08))",
                padding: "20px",
                borderRadius: "14px",
                border: "2px solid rgba(144,202,249,.4)"
              }}>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: ".75rem", fontWeight: 700, color: "#9a9ab0", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>Name</div>
                  <div style={{ fontSize: ".95rem", fontWeight: 600, color: "#2d2d4e" }}>{pg.owner.name}</div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: ".75rem", fontWeight: 700, color: "#9a9ab0", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>Email</div>
                  <div style={{ fontSize: ".88rem", color: "#5a5a7a", wordBreak: "break-all" }}>{pg.owner.email}</div>
                </div>
                {pg.owner.phone && (
                  <div>
                    <div style={{ fontSize: ".75rem", fontWeight: 700, color: "#9a9ab0", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>Phone</div>
                    <div style={{ fontSize: ".88rem", color: "#5a5a7a" }}>+91 {pg.owner.phone.slice(-10)}</div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
