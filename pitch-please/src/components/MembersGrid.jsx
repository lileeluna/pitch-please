import { ALUMNI_FACTS, MEMBER_FACTS } from "../data/memberFacts";
import MemberGrid from "./MemberGrid";
import AuthBar from "./AuthBar";
import useAuth from "../hooks/useAuth";

function MembersGrid() {
  const { canEdit, username, logout } = useAuth();

  return (
    <>
      <AuthBar canEdit={canEdit} username={username} onLogout={logout} />

      <MemberGrid
        listUrl="/api/members"
        factsConfig={MEMBER_FACTS}
        entityLabel="Member"
        pluralLabel="members"
        canEdit={canEdit}
      />

      <MemberGrid
        listUrl="/api/alumni"
        factsConfig={ALUMNI_FACTS}
        entityLabel="Alumni"
        pluralLabel="alumni"
        title="Alumni"
        isAlumni
        canEdit={canEdit}
      />
    </>
  );
}

export default MembersGrid;
