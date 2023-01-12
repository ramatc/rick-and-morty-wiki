import { Link, NavLink } from 'react-router-dom';
import logo from '../../assets/images/logo.png'
import './styles.css';

const NavBar = () => {
    return (
        <header>
            <nav>
                <div className='navbar'>
                    <Link to='/'>
                        <img src={logo} alt='Logo Rick and Morty' className='logo' />
                    </Link>
                </div>
                <ul className='nav'>
                    <li><NavLink to='/'>Characters</NavLink></li>
                    <li><NavLink to='/episodes'>Episodes</NavLink></li>
                    <li><NavLink to='/location'>Locations</NavLink></li>
                </ul>
            </nav>
        </header>
    )
}

export default NavBar;