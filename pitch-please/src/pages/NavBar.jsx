import { Link } from 'react-router-dom'
import '../styles/NavBar.css'
import icon from '../assets/pp_logo.png'

function NavBar() {
    return (
        <>
            <nav className="navbar">
                <Link to="/" className="logo">
                    <img src={icon} className='icon'/>
                    <div className="text">Pitch, Please!</div>
                </Link>
                <ul className="tabs">
                    <li className="tab"><Link to="/about"><p>About</p></Link></li>
                    <li className="tab"><Link to="/gallery"><p>Gallery</p></Link></li>
                    <li className="tab"><Link to="/members"><p>Members</p></Link></li>
                    <li className="tab"><Link to="/contact-us"><p>Contact Us</p></Link></li>
                </ul>
            </nav>
        </>
    )
}

export default NavBar
