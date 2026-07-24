import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import CharacterListContainer from './components/CharacterListContainer';
import Episodes from './pages/Episodes';
import Locations from './pages/Locations';
import Favorites from './pages/Favorites';
import CharacterDetail from './components/CharacterDetail';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

const App = () => {
    return (
        <BrowserRouter>
            <NavBar />
            <Routes >
                <Route
                    path='/'
                    element={<CharacterListContainer />}
                />

                <Route
                    path='/episodes'
                    element={<Episodes />}
                />

                <Route
                    path='/locations'
                    element={<Locations />}
                />

                <Route
                    path='/favorites'
                    element={<Favorites />}
                />

                <Route
                    path='/character/:id'
                    element={<CharacterDetail />}
                />

                <Route
                    path='*'
                    element={<NotFoundPage />}
                />
            </Routes>
        </BrowserRouter >
    )
}

export default App;
