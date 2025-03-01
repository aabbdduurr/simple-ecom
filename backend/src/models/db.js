module.exports = {
  products: [
    {
      id: 1,
      name: "Product One",
      description: "Description for Product One.",
      price: 29.99,
      images: [
        "https://via.placeholder.com/400?text=Product+One+Image+1",
        "https://via.placeholder.com/400?text=Product+One+Image+2",
      ],
    },
    {
      id: 2,
      name: "Product Two",
      description: "Description for Product Two.",
      price: 49.99,
      images: ["https://via.placeholder.com/400?text=Product+Two+Image+1"],
    },
  ],
  customers: [
    // Customers added dynamically
  ],
  orders: [
    // Orders added dynamically
  ],
  otps: [
    // OTP entries: { identifier, otp, expiresAt }
  ],
};
