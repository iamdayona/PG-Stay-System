const MODAL_CSS = `
  @keyframes modalIn { from{opacity:0;transform:scale(.94) translateY(12px);} to{opacity:1;transform:scale(1) translateY(0);} }

  .modal-overlay {
    position: fixed; inset: 0; z-index: 1000;
    background: rgba(0,0,0,.35); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; padding: 20px;
  }
  .modal-box {
    background: rgba(255,255,255,.92); backdrop-filter: blur(20px);
    border: 2.5px solid rgba(255,255,255,.9); border-radius: 28px;
    padding: 36px 32px; width: 100%; max-width: 440px;
    box-shadow: 0 20px 60px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.95);
    animation: modalIn .3s cubic-bezier(.34,1.3,.64,1) both;
    position: relative; overflow: hidden;
  }
  .modal-box::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0;
    height: 4px; border-radius: 28px 28px 0 0;
    background: linear-gradient(90deg,#ffa726,#e040fb,#42a5f5);
  }
  .modal-title {
    font-family: 'Nunito', sans-serif; font-size: 1.3rem; font-weight: 900;
    color: #2d2d4e; margin-bottom: 6px;
  }
  .modal-sub { font-size: .85rem; color: #7a7a9a; margin-bottom: 24px; }
  .modal-form-group { margin-bottom: 18px; }
  .modal-footer { display: flex; gap: 10px; justify-content: flex-end; margin-top: 24px; }
  .modal-btn-cancel {
    padding: 11px 22px; border-radius: 14px; cursor: pointer;
    background: rgba(255,255,255,.72); border: 2px solid rgba(200,200,220,.5);
    font-family: 'Poppins', sans-serif; font-size: .88rem; font-weight: 600;
    color: #5a5a7a; transition: transform .15s;
  }
  .modal-btn-cancel:hover { transform: translateY(-1px); }
  .modal-btn-confirm {
    padding: 11px 22px; border-radius: 14px; cursor: pointer; border: none;
    font-family: 'Poppins', sans-serif; font-size: .88rem; font-weight: 700;
    color: white; background: linear-gradient(135deg,#ffa726,#fb8c00);
    box-shadow: 0 4px 0 #e65100, 0 6px 16px rgba(255,167,38,.35);
    transition: transform .15s, filter .15s;
  }
  .modal-btn-confirm:hover:not(:disabled) { filter: brightness(1.06); transform: translateY(-2px); }
  .modal-btn-confirm:disabled { opacity: .6; cursor: not-allowed; }
`;

export default function Modal({ title, subtitle, fields, children, onConfirm, onClose, confirmLabel = "Confirm", loading = false }) {
  const bodyContent = children || fields;

  return (
    <>
      <style>{MODAL_CSS}</style>
      <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal-box">
          <div className="modal-title">{title}</div>
          {subtitle && <div className="modal-sub">{subtitle}</div>}
          {bodyContent}
          <div className="modal-footer">
            <button className="modal-btn-cancel" onClick={onClose}>Cancel</button>
            <button className="modal-btn-confirm" onClick={onConfirm} disabled={loading}>
              {loading ? "⏳ Sending…" : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
