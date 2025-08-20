import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar, Footer } from '@platform/ui';
import { AppRegistry } from './components/AppRegistry';
import { HomePage } from './pages/Homepage';
import '@platform/styles';


const App: React.FC = () => {
    // const handleNavigate = (route: string) => {
    //     window.location.href = route;
    // }

    return (
    <Router>
        <div className="platform-container">
            <Navbar />
            <main className="content-area">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/apps/*"  element={<AppRegistry />} />
                </Routes>
            </main>
            <Footer />
        </div>
    </Router>
    );
}

export default App;

