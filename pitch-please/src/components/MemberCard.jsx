function MemberCard({ member, canEdit, onEdit, onView }) {
  return (
    <div
      className="member-square"
      onClick={() => onView(member)}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onView(member);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View ${member.name}`}
    >
      <div className="member-img">
        {member.photo_url ? (
          <img src={member.photo_url} alt={member.name} loading="lazy" />
        ) : null}
      </div>
      <div className="member-name">{member.name}</div>
      {member.part ? <div className="member-part">{member.part}</div> : null}
      <div className="board-pos">{member.position}</div>
      {canEdit ? (
        <button
          type="button"
          className="member-edit-btn"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(member);
          }}
          title={`Edit ${member.name}`}
        >
          Edit
        </button>
      ) : null}
    </div>
  );
}

export default MemberCard;
