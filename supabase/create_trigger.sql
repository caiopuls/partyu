-- Function to credit wallet on order payment
CREATE OR REPLACE FUNCTION credit_wallet_on_order_paid()
RETURNS TRIGGER AS $$
DECLARE
  v_organizer_id UUID;
  v_amount NUMERIC;
  v_event_id UUID;
BEGIN
  -- Only proceed if status changed to 'paid'
  IF NEW.status = 'paid' AND OLD.status <> 'paid' THEN
    
    -- Get event details to find organizer
    SELECT organizer_id INTO v_organizer_id
    FROM events
    WHERE id = NEW.event_id;

    -- Calculate amount (simplified: 100% of total for now, or minus fees if applicable)
    -- Assuming total is the amount to credit
    v_amount := NEW.total;

    -- Update or Insert wallet balance
    INSERT INTO wallets (user_id, balance, created_at, updated_at)
    VALUES (v_organizer_id, v_amount, NOW(), NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET
      balance = wallets.balance + EXCLUDED.balance,
      updated_at = NOW();
      
    -- Log transaction (optional but good practice)
    -- INSERT INTO transactions ...
    
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_order_paid ON orders;
CREATE TRIGGER on_order_paid
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION credit_wallet_on_order_paid();
