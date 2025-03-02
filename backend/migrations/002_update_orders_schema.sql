-- ============================================
-- Migration: Update orders schema to include payment and address info
-- ============================================

-- Add payment_method, billing_info, and shipping_info columns to orders table
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS billing_info JSON;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_info JSON;