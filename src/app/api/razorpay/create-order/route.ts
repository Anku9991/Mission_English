import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const { amount, courseId, courseTitle, studentId } = await req.json();

    if (!amount) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 });
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return NextResponse.json({ error: "Razorpay keys not configured" }, { status: 500 });
    }

    const instance = new Razorpay({
      key_id,
      key_secret,
    });

    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: `rcpt_${studentId}_${courseId}`.substring(0, 40), // max 40 chars
      notes: {
        courseId,
        courseTitle,
        studentId
      }
    };

    const order = await instance.orders.create(options);
    
    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Razorpay order error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
