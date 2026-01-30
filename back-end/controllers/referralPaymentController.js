import { ReferralPaymentModel } from "../models/referralPaymentModel.js";

export const getClosedBookings = async (req, res) => {
  try {
    const data = await ReferralPaymentModel.getClosedBookingsWithReferral();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const payReferralAmount = async (req, res) => {
  try {
    const result = await ReferralPaymentModel.payReferral(req.body);
    res.json({
      message: "Referral payment successful",
      ...result
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Payment failed" });
  }
};
