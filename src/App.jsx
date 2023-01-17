import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import CharacterListContainer from './components/CharacterListContainer';
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
            </Routes>
        </BrowserRouter >
    )
}

export default App;
