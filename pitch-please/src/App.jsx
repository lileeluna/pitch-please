import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import Navbar from './pages/NavBar'
import Home from './pages/Home'
import About from './pages/About'
import Gallery from './pages/Gallery'
import Members from './pages/Members'
import Contact from './pages/Contact'

function App() {

  return (
    <>
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path = '/' element={<Home />} />
                <Route path = '/about' element={<About />} />
                <Route path = '/gallery' element={<Gallery />} />
                <Route path = '/members' element={<Members />} />
                <Route path = '/contact-us' element={<Contact />} />
            </Routes>
        </BrowserRouter>
    </>
  )
}

export default App
