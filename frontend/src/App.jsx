import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import ConcertPage from "./pages/ConcertPage";
import AboutPage from "./pages/AboutPage";
import UserProfilePage from "./pages/UserProfilePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import BookingPage from "./pages/BookingPage";
import TransactionHistory from "./pages/TransactionHistory";

function Layout({ children }) {
  const location = useLocation();

  // ซ่อน header ในหน้า login
 const hideHeader =
  location.pathname === "/login" ||
  location.pathname === "/register";

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
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/booking/:id" element={<BookingPage />} />
          <Route path="/history" element={<TransactionHistory />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;