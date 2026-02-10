import { getPriceRuleForInvoice } from "../models/invoiceModel.js";

export const generateInvoice = async (req, res) => {
  try {
    const {
      pricingRule,          // YES | NO
      category,
      hall,
      timeSlot,
      eventDate,
      duration,
      discount = 0,
      totalAmount,          // only for NO
    } = req.body;

    if (!pricingRule) {
      return res.status(400).json({ message: "Pricing rule required" });
    }

    let baseAmount = 0;
    let base_price_per_hour = 0;
    let fixedCharges = [];

    /* ---------------- PRICING RULE = YES ---------------- */
    if (pricingRule === "YES") {
      if (!category || !hall || !timeSlot || !eventDate || !duration) {
        return res.status(400).json({ message: "Missing invoice fields" });
      }

      const pricing = await getPriceRuleForInvoice({
        category,
        hall,
        timeSlot,
        eventDate,
      });

      if (!pricing) {
        return res.status(404).json({ message: "Price rule not found" });
      }

      const hours = Number(duration);
      base_price_per_hour = Number(pricing.base_price_per_hour);
      baseAmount = hours * base_price_per_hour;

      fixedCharges = (pricing.fixedCharges || [])
        .filter(f => f.charges_name?.trim())
        .map(f => ({
          name: f.charges_name,
          amount: Number(f.charges_value) || 0,
        }));
    }

    /* ---------------- PRICING RULE = NO ---------------- */
    if (pricingRule === "NO") {
  if (!totalAmount || !category || !hall) {
    return res.status(400).json({ message: "Missing custom invoice fields" });
  }

  baseAmount = Number(totalAmount);

  const pricing = await getPriceRuleForInvoice({
    category,
    hall,
    timeSlot,
    eventDate,
  });

  fixedCharges = (pricing?.fixedCharges || [])
    .filter(f => f.charges_name?.trim())
    .map(f => ({
      name: f.charges_name,
      amount: Number(f.charges_value) || 0,
    }));
}


    const fixedChargeAmount = fixedCharges.reduce(
      (sum, f) => sum + f.amount,
      0
    );

    const gross = baseAmount + fixedChargeAmount;
    const discountAmount = (gross * discount) / 100;
    const grandTotal = gross - discountAmount;

    res.json({
      pricingRule,
      base_price_per_hour,
      duration,
      baseAmount,
      fixedCharges,
      fixedChargeAmount,
      discount,
      discountAmount,
      grandTotal,
    });

  } catch (err) {
    console.error("Invoice generation error:", err);
    res.status(500).json({ message: "Invoice failed" });
  }
};

