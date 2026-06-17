import '../styles/NavBar.css'
import icon from '../assets/pp_logo.png'

function NavBar() {
    return (
        <>
            <nav className="navbar">
                <div className="logo">
                    <img src={icon} className='icon'/>
                    <div className="text">Pitch, Please!</div>
                </div>
                <ul className="tabs">
                    <li className="tab"><p>About</p></li>
                    <li className="tab"><p>Gallery</p></li>
                    <li className="tab"><p>Members</p></li>
                    <li className="tab"><p>Contact Us</p></li>
                </ul>
            </nav>
        </>
    )
}

export default NavBar