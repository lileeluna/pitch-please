function RepertoireCard({ item, canEdit, onEdit }) {
  const hasDetails = item.arranger || item.soloists || item.recording_url;

  return (
    <div className="repertoire-card">
      <div className="repertoire-card-main">
        <div className="repertoire-title">{item.title}</div>
        {item.original_artist ? (
          <div className="repertoire-opb">opb. {item.original_artist}</div>
        ) : null}
      </div>

      <div className="repertoire-card-details">
        {item.arranger ? (
          <div className="repertoire-detail">
            <span className="repertoire-detail-label">Arranger</span>
            <span className="repertoire-detail-value">{item.arranger}</span>
          </div>
        ) : null}

        {item.soloists ? (
          <div className="repertoire-detail">
            <span className="repertoire-detail-label">Soloist(s)</span>
            <span className="repertoire-detail-value">{item.soloists}</span>
          </div>
        ) : null}

        {item.recording_url ? (
          <div className="repertoire-detail">
            <span className="repertoire-detail-label">Recording</span>
            <a
              className="repertoire-link"
              href={item.recording_url}
              target="_blank"
              rel="noreferrer"
            >
              Listen
            </a>
          </div>
        ) : null}

        {!hasDetails ? (
          <div className="repertoire-detail-empty">
            No arrangement details yet
          </div>
        ) : null}
      </div>

      {canEdit ? (
        <button
          type="button"
          className="repertoire-edit-btn"
          onClick={() => onEdit(item)}
          title={`Edit ${item.title}`}
        >
          Edit
        </button>
      ) : null}
    </div>
  );
}

export default RepertoireCard;
