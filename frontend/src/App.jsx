import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Detection from './pages/Detection'
import Forensics from './pages/Forensics'
import Dashboard from './pages/Dashboard'

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/detection" element={<Detection />} />
                <Route path="/forensics" element={<Forensics />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </Router>
    )
}
