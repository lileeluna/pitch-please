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
      <div style={{paddingBottom: "1rem"}}>Are you a Pitch alum? Want to be featured on the page? Fill out <a href="https://forms.gle/o9WH6PteWicQqjaH7">this form</a> and send a photo of yourself to <a href="mailto:pitchpleaseucla@gmail.com">pitchpleaseucla@gmail.com</a> to be added!</div>
    </>
  );
}

export default Members;
