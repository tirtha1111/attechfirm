import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const { amount, planTitle, name, email } = await req.json();

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      // Mock order for preview without keys
      return NextResponse.json({
        id: "order_mock_" + Math.random().toString(36).substr(2, 9),
        amount: amount * 100, // in paise
        currency: "INR",
        isMock: true,
        receipt: "receipt_mock_1"
      });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amount * 100, // amount in smallest currency unit
      currency: "INR",
      receipt: "receipt_" + Math.random().toString(36).substr(2, 9),
    };

    const order = await instance.orders.create(options);
    return NextResponse.json({ ...order, isMock: false });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
