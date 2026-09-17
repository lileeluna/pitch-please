import { useState } from "react";
import { ALUMNI_FACTS, MEMBER_FACTS } from "../data/memberFacts";
import MemberGrid from "./MemberGrid";
import LoginModal from "./LoginModal";
import AuthBar from "./AuthBar";
import useAuth from "../hooks/useAuth";

function MembersGrid() {
  const { canEdit, username, login, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <AuthBar
        canEdit={canEdit}
        username={username}
        onLoginClick={() => setShowLogin(true)}
        onLogout={logout}
      />

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

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLogin={(name) => {
            login(name);
            setShowLogin(false);
          }}
        />
      )}
    </>
  );
}

export default MembersGrid;
