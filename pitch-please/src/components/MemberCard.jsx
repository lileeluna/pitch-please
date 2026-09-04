function MemberCard({ member, canEdit, onEdit }) {
  return (
    <div className="member-square">
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
          onClick={() => onEdit(member)}
          title={`Edit ${member.name}`}
        >
          Edit
        </button>
      ) : null}
    </div>
  );
}

export default MemberCard;
