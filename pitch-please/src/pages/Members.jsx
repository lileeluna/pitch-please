import back from "../assets/members.jpg";
import front from "../assets/members-transparent.png";
import "../styles/Members.css";
import MembersGrid from "../components/MembersGrid";

function Members() {
  return (
    <>
      <div className="member-container">
        <img src={back} className="bg-img"></img>
        <h1 className="member-title">Meet The Pitches!</h1>
        <img src={front} className="front-img"></img>
      </div>
      <MembersGrid />
    </>
  );
}

export default Members;
