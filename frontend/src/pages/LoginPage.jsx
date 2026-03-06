import { useState } from "react";
import bgImage from "../assets/thumb-1920-1172157.jpeg";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
function LoginPage({ loginUrl }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  async function handleLogin(e) {
    e.preventDefault();
    setErrorMessage("");
    try {
      const response = await fetch("http://127.0.0.1:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error || "Login failed");
        return;
      }
      localStorage.setItem("token", data.access_token);
      // Fetch full profile to get tokens and other data
      try {
        const profileResponse = await fetch(
          "http://127.0.0.1:5000/api/user/profile",
          {
            headers: { Authorization: `Bearer ${data.access_token}` },
          },
        );
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          login(profileData);
        } else {
          login({ username }); // Fallback
        }
      } catch {
        login({ username }); // Fallback
      }
      navigate("/home");
    } catch (error) {
      setErrorMessage("Server error");
    }
  }
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          display: "flex",
          flexDirection: "column",
          width: "300px",
          padding: "24px",
          background: "rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: "15px",
          border: "1px solid rgba(255,255,255,0.3)",
          color: "white",
        }}
      >
        <h2
          style={{ fontSize: "24px", fontWeight: "bold", paddingBottom: "8px" }}
        >
          Login
        </h2>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        <label style={{ marginTop: "10px" }}>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{
            marginTop: "5px",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.6)",
            backgroundColor: "rgba(255,255,255,0.15)",
            color: "white",
            outline: "none",
          }}
        />
        <label style={{ marginTop: "10px" }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            marginTop: "5px",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.6)",
            backgroundColor: "rgba(255,255,255,0.15)",
            color: "white",
            outline: "none",
          }}
        />
        <button
          type="submit"
          style={{
            marginTop: "15px",
            width: "100%",
            padding: "10px",
            cursor: "pointer",
            borderRadius: "24px",
            backgroundColor: "rgba(255,255,255,0.15)",
            border: "0.5px solid rgba(255,255,255,0.6)",
            transition: "all 0.3s ease-in-out",
            color: "white",
            outline: "none",
          }}
        >
          Login
        </button>
        <p style={{ marginTop: "15px", textAlign: "center" }}>
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            style={{
              color: "white",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Register
          </span>
        </p>
      </form>
    </div>
  );
}
export default LoginPage;
