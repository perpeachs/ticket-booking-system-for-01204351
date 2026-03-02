import { useState } from "react";
import bgImage from "../assets/thumb-1920-1172157.jpeg";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function handleLogin(e) {
    e.preventDefault();

    if (username === "admin" && password === "1234") {
      alert("Login success (mock)");
    } else {
      setErrorMessage("Invalid username or password");
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
        backgroundRepeat: "no-repeat"
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
          color: "white"
        }}
      >
        <h2>Login</h2>

        {errorMessage && (
          <p style={{ color: "red" }}>{errorMessage}</p>
        )}

        <label style={{ marginTop: "10px" }}>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ marginTop: "5px", padding: "8px" }}
        />

        <label style={{ marginTop: "10px" }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ marginTop: "5px", padding: "8px" }}
        />

        <button
          type="submit"
          style={{
            marginTop: "15px",
            padding: "10px",
            cursor: "pointer"
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
