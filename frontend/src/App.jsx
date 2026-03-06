import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ConcertPage from "./pages/ConcertPage";
import AboutPage from "./pages/AboutPage";
import UserProfilePage from "./pages/UserProfilePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import BookingPage from "./pages/BookingPage";
import TransactionHistory from "./pages/TransactionHistory";
import TopUpTokens from "./pages/TopUpTokens";
import AddConcertPage from "./pages/AddConcertPage";
import DraftConcertPage from "./pages/DraftConcertPage";
import { useAuth } from "./context/AuthContext";

const TODOLIST_LOGIN_URL = "http://localhost:5000/api/auth/login";

// Redirect to /login if user is not authenticated
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Admin-only route - requires login + admin role
function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== "admin") {
    return <Navigate to="/home" replace />;
  }
  return children;
}

function Layout({ children }) {
  const location = useLocation();
  const hideChrome =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="flex flex-col min-h-screen">
      {!hideChrome && <Header />}
      <main className="flex-1">{children}</main>
      {!hideChrome && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Default route redirects to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public routes */}
          <Route
            path="/login"
            element={<LoginPage loginUrl={TODOLIST_LOGIN_URL} />}
          />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes - require login */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/concert"
            element={
              <ProtectedRoute>
                <ConcertPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <ProtectedRoute>
                <AboutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking/:id"
            element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <TransactionHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/top-up"
            element={
              <ProtectedRoute>
                <TopUpTokens />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/add-concert"
            element={
              <AdminRoute>
                <AddConcertPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/drafts"
            element={
              <AdminRoute>
                <DraftConcertPage />
              </AdminRoute>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
