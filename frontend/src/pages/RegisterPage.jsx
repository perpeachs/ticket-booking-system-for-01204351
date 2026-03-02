import { useState } from "react";
import bgImage from "../assets/thumb-1920-1172157.jpeg";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function handleRegister(e) {
    e.preventDefault();

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage("Invalid email format");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    const userData = {
      email,
      username,
      password,
    };

    localStorage.setItem("mockUser", JSON.stringify(userData));

    alert("Register success (mock)");
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
      }}
    >
      <form
        onSubmit={handleRegister}
        style={{
          display: "flex",
          flexDirection: "column",
          width: "320px",
          padding: "24px",
          background: "rgba(255,255,255,0.2)",
          backdropFilter: "blur(12px)",
          borderRadius: "15px",
          color: "white",
        }}
      >
        <h2>Register</h2>

        {errorMessage && (
          <p style={{ color: "red" }}>{errorMessage}</p>
        )}

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />

        <label style={{ marginTop: "10px" }}>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={inputStyle}
        />

        <label style={{ marginTop: "10px" }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        <label style={{ marginTop: "10px" }}>Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={inputStyle}
        />

        <button
          type="submit"
          style={{
            marginTop: "15px",
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Register
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  marginTop: "5px",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.6)",
  backgroundColor: "rgba(255,255,255,0.15)",
  color: "white",
  outline: "none",
};

export default RegisterPage;