import React, { useState } from "react";
import Layout from "../components/Layout";

const AuthPage = () => {
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [result, setResult] = useState(null);

  const sendOtp = async () => {
    if (!identifier) {
      alert("Please enter your phone or email.");
      return;
    }
    const response = await fetch("http://localhost:3000/api/auth/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: identifier, email: identifier }),
    });
    const data = await response.json();
    setResult(data);
  };

  const verifyOtp = async () => {
    if (!identifier || !otp) {
      alert("Identifier and OTP are required.");
      return;
    }
    const response = await fetch("http://localhost:3000/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, otp }),
    });
    const data = await response.json();
    setResult(data);
  };

  return (
    <Layout>
      <h1>OTP Authentication</h1>
      <div>
        <label>Phone or Email:</label>
        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
      </div>
      <button onClick={sendOtp}>Send OTP</button>
      <div>
        <label>Enter OTP:</label>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
      </div>
      <button onClick={verifyOtp}>Verify OTP</button>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </Layout>
  );
};

export default AuthPage;
