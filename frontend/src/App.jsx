import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import Upload from "./pages/Upload";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from './components/Navbar';
import Favorites from "./pages/Favorites";
import MyUploads from "./pages/MyUploads";
import EditUpload from "./pages/EditUpload";
import './App.css';

export default function App() {
  return (
    <Router>
      <Navbar /> 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/my-uploads" element={<MyUploads />} />
        <Route path="/my-uploads/:id/edit" element={<EditUpload />} />
      </Routes>
    </Router>
  );
}
