import { Link, NavLink } from 'react-router-dom'
import logo from '../../assets/images/logo.png'
import './styles.css'

const NavBar = () => {
  return (
    <header>
      <nav aria-label='Main'>
        <div className='navbar'>
          <Link to='/'>
            <img src={logo} alt='Logo Rick and Morty' className='logo' />
          </Link>
        </div>
        <ul className='nav'>
          <li><NavLink to='/'>Characters</NavLink></li>
          <li><NavLink to='/episodes'>Episodes</NavLink></li>
          <li><NavLink to='/locations'>Locations</NavLink></li>
          <li><NavLink to='/favorites'>Favorites</NavLink></li>
        </ul>
      </nav>
    </header>
  )
}

export default NavBar
