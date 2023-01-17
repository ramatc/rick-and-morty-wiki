import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import CharacterListContainer from './components/CharacterListContainer';
import Episodes from './pages/Episodes';
import Locations from './pages/Locations';
import './App.css';

const App = () => {
    return (
        <BrowserRouter>
            <NavBar />
            <Routes >
                <Route
                    path='/'
                    exact
                    element={<CharacterListContainer />}
                />

                <Route
                    path='/episodes'
                    exact
                    element={<Episodes />}
                />

                <Route
                    path='/locations'
                    exact
                    element={<Locations />}
                />
            </Routes>
        </BrowserRouter >
    )
}

export default App;
