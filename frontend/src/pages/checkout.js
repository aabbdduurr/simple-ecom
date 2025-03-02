import React, { useContext, useEffect, useState } from "react";
import Layout from "../components/Layout";
import { CartContext } from "../components/CartContext";

const Checkout = () => {
  const { cart, clearCart } = useContext(CartContext);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [paymentDetails, setPaymentDetails] = useState({});
  const [billingInfo, setBillingInfo] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [message, setMessage] = useState("");

  // On mount, check if a valid JWT token is available in localStorage.
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setAuthToken(storedToken);
      setMessage("You are already authenticated.");
    }
  }, []);

  // Step 1: Send OTP if no valid token is available
  const handleSendOtp = async () => {
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

  // Step 2: Verify OTP and receive a JWT token then save it to localStorage
  const handleVerifyOtp = async () => {
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
      localStorage.setItem("authToken", data.token);
      setMessage("OTP verified. You are now authenticated.");
    } else {
      setMessage("OTP verification failed: " + data.error);
    }
  };

  // Step 3: Process Checkout with OTP verification, payment info, billing, and shipping information
  const handleCheckout = async () => {
    if (!authToken) {
      alert("Please verify OTP before checkout.");
      return;
    }
    // Build the order payload with billing and shipping info
    const orderPayload = {
      paymentMethod,
      paymentDetails,
      billingInfo,
      shippingInfo,
      orderItems: cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    const response = await fetch("http://localhost:3000/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + authToken,
      },
      body: JSON.stringify(orderPayload),
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
        {!authToken && !otpSent && (
          <button onClick={handleSendOtp}>Send OTP</button>
        )}
        {!authToken && otpSent && (
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
        <h2>Billing Information</h2>
        <input
          type="text"
          placeholder="Full Name"
          value={billingInfo.fullName}
          onChange={(e) =>
            setBillingInfo({ ...billingInfo, fullName: e.target.value })
          }
        />
        <input
          type="email"
          placeholder="Email"
          value={billingInfo.email}
          onChange={(e) =>
            setBillingInfo({ ...billingInfo, email: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Address"
          value={billingInfo.address}
          onChange={(e) =>
            setBillingInfo({ ...billingInfo, address: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="City"
          value={billingInfo.city}
          onChange={(e) =>
            setBillingInfo({ ...billingInfo, city: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="State"
          value={billingInfo.state}
          onChange={(e) =>
            setBillingInfo({ ...billingInfo, state: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="ZIP"
          value={billingInfo.zip}
          onChange={(e) =>
            setBillingInfo({ ...billingInfo, zip: e.target.value })
          }
        />
      </section>

      <section>
        <h2>Shipping Information (Optional)</h2>
        <input
          type="text"
          placeholder="Full Name"
          value={shippingInfo.fullName}
          onChange={(e) =>
            setShippingInfo({ ...shippingInfo, fullName: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Address"
          value={shippingInfo.address}
          onChange={(e) =>
            setShippingInfo({ ...shippingInfo, address: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="City"
          value={shippingInfo.city}
          onChange={(e) =>
            setShippingInfo({ ...shippingInfo, city: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="State"
          value={shippingInfo.state}
          onChange={(e) =>
            setShippingInfo({ ...shippingInfo, state: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="ZIP"
          value={shippingInfo.zip}
          onChange={(e) =>
            setShippingInfo({ ...shippingInfo, zip: e.target.value })
          }
        />
      </section>

      <section>
        <h2>Payment Method</h2>
        <label>
          <input
            type="radio"
            name="payment"
            value="cod"
            checked={paymentMethod === "cod"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Cash on Delivery
        </label>
        <label>
          <input
            type="radio"
            name="payment"
            value="credit"
            checked={paymentMethod === "credit"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Credit Card
        </label>
        <label>
          <input
            type="radio"
            name="payment"
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
