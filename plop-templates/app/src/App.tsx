import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {HomePage} from './pages/HomePage';
import '@platform/styles';
import './App.scss';

const App: React.FC = () => {
    return (
        <div className="{{appName}}-app">
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/home" element={<HomePage />} />
            </Routes>
        </div>
    );
};

export default App;
