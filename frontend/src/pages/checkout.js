import React, { useContext, useState } from "react";
import Layout from "../components/Layout";
import { CartContext } from "../components/CartContext";

const Checkout = () => {
  const { cart, clearCart } = useContext(CartContext);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [paymentDetails, setPaymentDetails] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [message, setMessage] = useState("");

  // Step 1: Send OTP
  const handleSendOtp = async () => {
    // For demonstration, prompt the user for their identifier (phone or email)
    const identifier = prompt("Enter your phone or email to receive OTP:");
    if (!identifier) return;
    const response = await fetch("http://localhost:3000/api/auth/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: identifier, email: identifier }),
    });
    const data = await response.json();
    if (data.success) {
      setOtpSent(true);
      setMessage("OTP sent. Please check your device.");
    } else {
      setMessage("Failed to send OTP: " + data.error);
    }
  };

  // Step 2: Verify OTP and receive a JWT token
  const handleVerifyOtp = async () => {
    // Ask for identifier again for verification (could be streamlined in a real app)
    const identifier = prompt(
      "Enter your phone or email again for verification:"
    );
    if (!identifier) return;
    const response = await fetch("http://localhost:3000/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, otp }),
    });
    const data = await response.json();
    if (data.success) {
      setAuthToken(data.token);
      setMessage("OTP verified. You are now authenticated.");
    } else {
      setMessage("OTP verification failed: " + data.error);
    }
  };

  // Step 3: Process Checkout after OTP verification and payment info input
  const handleCheckout = async () => {
    if (!authToken) {
      alert("Please verify OTP before checkout.");
      return;
    }
    // Send checkout request to backend using the authentication token
    const response = await fetch("http://localhost:3000/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + authToken,
      },
      body: JSON.stringify({ paymentMethod, paymentDetails }),
    });
    const data = await response.json();
    if (data.success) {
      clearCart();
      setMessage("Order placed successfully! Order ID: " + data.orderId);
    } else {
      setMessage("Order failed: " + data.error);
    }
  };

  return (
    <Layout>
      <h1>Checkout</h1>
      <section>
        <h2>OTP Authentication</h2>
        {!otpSent ? (
          <button onClick={handleSendOtp}>Send OTP</button>
        ) : (
          <div>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button onClick={handleVerifyOtp}>Verify OTP</button>
          </div>
        )}
      </section>

      <section>
        <h2>Payment Method</h2>
        <label>
          <input
            type="radio"
            value="cod"
            checked={paymentMethod === "cod"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Cash on Delivery
        </label>
        <label>
          <input
            type="radio"
            value="credit"
            checked={paymentMethod === "credit"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Credit Card
        </label>
        <label>
          <input
            type="radio"
            value="third_party"
            checked={paymentMethod === "third_party"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Third Party Vendor
        </label>
      </section>

      {paymentMethod === "credit" && (
        <section>
          <h3>Credit Card Details</h3>
          <input
            type="text"
            placeholder="Card Number"
            onChange={(e) =>
              setPaymentDetails({
                ...paymentDetails,
                cardNumber: e.target.value,
              })
            }
          />
          <input
            type="text"
            placeholder="Expiry Date"
            onChange={(e) =>
              setPaymentDetails({ ...paymentDetails, expiry: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="CVV"
            onChange={(e) =>
              setPaymentDetails({ ...paymentDetails, cvv: e.target.value })
            }
          />
        </section>
      )}

      {paymentMethod === "third_party" && (
        <section>
          <h3>Third Party Payment Details</h3>
          <input
            type="text"
            placeholder="Signed Info"
            onChange={(e) =>
              setPaymentDetails({
                ...paymentDetails,
                signedInfo: e.target.value,
              })
            }
          />
        </section>
      )}

      <button onClick={handleCheckout}>Place Order</button>

      <section>
        <h2>Your Cart</h2>
        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <ul>
            {cart.map((item) => (
              <li key={item.id}>
                {item.name} - ${item.price} x {item.quantity}
              </li>
            ))}
          </ul>
        )}
      </section>

      {message && <p>{message}</p>}
    </Layout>
  );
};

export default Checkout;
