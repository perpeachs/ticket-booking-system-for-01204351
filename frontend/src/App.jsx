import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import ConcertPage from "./pages/ConcertPage";
import AboutPage from "./pages/AboutPage";
// import UserProfilePage from "./pages/UserProfilePage";
// import LoginPage from "./pages/LoginPage";
import BookingPage from "./pages/BookingPage";

function Layout({ children }) {
  const location = useLocation();

  // ซ่อน header ในหน้า login
  const hideHeader = location.pathname === "/login";

  return (
    <>
      {!hideHeader && <Header />}
      {children}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/concert" element={<ConcertPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/profile" element={<h1>Profile</h1>} />
          <Route path="/login" element={<h1>Login</h1>} />
          <Route path="/booking/:id" element={<BookingPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;