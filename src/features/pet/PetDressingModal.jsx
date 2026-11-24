import { PET_REGISTRY, getEvolutionInfo } from '../../data/pets';
import PetPreview from '../../components/pet/PetPreview';

export default function PetDressingModal({
  open,
  onClose,
  currentPet,
  species,
  ownedPets = [],
  onSelectPetId,
  previewItem,
  previewType,
  onClearPreview,
}) {
  if (!open || !currentPet) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1070 }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-4 p-3 p-md-4 shadow-lg w-100"
        style={{
          maxWidth: '440px',
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'cowdiScaleUp 0.18s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-center pb-2 mb-3 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '1.35rem' }}>👗</span>
            <h4 className="mb-0 fw-bold" style={{ fontSize: '1.25rem' }}>Phòng thử đồ thú cưng</h4>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-light rounded-circle"
            onClick={onClose}
            aria-label="Đóng"
            style={{ width: '34px', height: '34px', padding: 0, fontSize: '1rem' }}
          >
            ✕
          </button>
        </div>

        {/* Bộ chọn pet nếu sở hữu > 1 pet */}
        {ownedPets.length > 1 && (
          <div className="d-flex align-items-center gap-2 mb-3 overflow-auto pb-1" style={{ whiteSpace: 'nowrap' }}>
            <span className="fw-semibold text-muted me-1 flex-shrink-0" style={{ fontSize: '0.95rem' }}>Thử trên:</span>
            {ownedPets.map((p) => {
              const sp = PET_REGISTRY[p.speciesId];
              const evo = getEvolutionInfo(p.speciesId, p.evolution);
              const pId = p.instanceId || p.speciesId;
              const curId = currentPet.instanceId || currentPet.speciesId;
              const isSelected = pId === curId;
              return (
                <button
                  key={pId}
                  type="button"
                  className={`btn rounded-pill px-3 py-1 ${
                    isSelected ? 'btn-cowdi-primary fw-bold shadow-xs' : 'btn-light border text-dark'
                  }`}
                  style={{ fontSize: '0.92rem', minHeight: '34px' }}
                  onClick={() => onSelectPetId?.(pId)}
                >
                  {evo?.image ? (
                    <img src={evo.image} alt="" style={{ width: '16px', height: '16px', objectFit: 'contain' }} className="me-1" />
                  ) : (
                    <span className="me-1">{evo?.emoji || sp?.emoji}</span>
                  )}
                  {p.customName || sp?.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Pet preview canvas */}
        <div className="p-2 rounded-3 mb-3" style={{ backgroundColor: '#FAFBFB', border: '1px solid #ECEFF1' }}>
          <PetPreview
            pet={currentPet}
            previewItem={previewItem}
            previewType={previewType}
          />
        </div>

        {/* Trạng thái xem thử */}
        <div className="text-center text-muted mb-3" style={{ fontSize: '0.95rem', lineHeight: 1.4 }}>
          {previewItem ? (
            <div>
              Đang ướm thử: <strong className="text-dark">{previewItem.emoji} {previewItem.name}</strong>
              <div className="mt-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 fw-bold"
                  style={{ fontSize: '0.92rem' }}
                  onClick={onClearPreview}
                >
                  ✕ Bỏ ướm thử
                </button>
              </div>
            </div>
          ) : (
            <span><strong className="text-dark">{currentPet.customName || species?.name}</strong> đang hiển thị đồ hiện có. Bấm một món đồ trong shop để xem thử lên pet.</span>
          )}
        </div>

        <button
          type="button"
          className="btn btn-cowdi-primary w-100 py-2 rounded-pill fw-bold"
          style={{ fontSize: '1.05rem', minHeight: '42px' }}
          onClick={onClose}
        >
          Xong
        </button>
      </div>
    </div>
  );
}
