import { useEffect } from "react";
import { assetUrl } from "../config";

function MemberPopup({ member, factsConfig, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const yearJoined = member.year_joined || "";
  const yearGraduated = member.year_graduated || "";
  const facts = member.facts || {};

  const visibleFacts = factsConfig
    .map((fact) => ({
      key: fact.key,
      label: fact.label,
      value: facts[fact.key],
    }))
    .filter((fact) => fact.value);

  return (
    <div className="member-overlay" onClick={onClose}>
      <div
        className="member-popup"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${member.name} details`}
      >
        <button
          type="button"
          className="member-popup-close"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>

        <div className="member-popup-left">
          <div className="member-popup-photo">
            {member.photo_url ? (
              <img src={assetUrl(member.photo_url)} alt={member.name} />
            ) : (
              <div className="member-popup-photo-placeholder">No photo</div>
            )}
          </div>

          <h2 className="member-popup-name">{member.name}</h2>

          <dl className="member-popup-meta">
            <dt>Position</dt>
            <dd>{member.position || "—"}</dd>
            <dt>Vocal Part</dt>
            <dd>{member.part || "—"}</dd>
            <dt>Year Joined</dt>
            <dd>{yearJoined || "—"}</dd>
            {member.is_alumni ? (
              <>
                <dt>Year Graduated</dt>
                <dd>{yearGraduated || "—"}</dd>
              </>
            ) : null}
          </dl>
        </div>

        <div className="member-popup-right">
          <h3 className="member-popup-facts-title">Fun Facts &amp; Favorites</h3>

          {visibleFacts.length ? (
            <dl className="member-popup-facts">
              {visibleFacts.map((fact) => (
                <div className="member-popup-fact" key={fact.key}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="member-popup-empty">No facts yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MemberPopup;
