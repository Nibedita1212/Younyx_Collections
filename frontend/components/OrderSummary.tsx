"use client";

import React from "react";

type Props = {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  onProceed?: () => void;
};

export default function OrderSummary({ subtotal, shipping, tax, discount, total, onProceed }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm text-gray-300"><span>Subtotal</span><span className="text-gray-100">₹{subtotal.toFixed(2)}</span></div>
      <div className="flex justify-between text-sm text-gray-300"><span>Estimated shipping</span><span className="text-gray-100">₹{shipping.toFixed(2)}</span></div>
      <div className="flex justify-between text-sm text-gray-300"><span>Tax</span><span className="text-gray-100">₹{tax.toFixed(2)}</span></div>
      <div className="flex justify-between text-sm text-gray-300"><span>Discount</span><span className="text-gray-100">- ₹{discount.toFixed(2)}</span></div>
      <div className="h-px bg-white/10 my-3" />
      <div className="flex justify-between items-center">
        <div>
          <div className="text-sm text-gray-100">Total</div>
          <div className="text-lg font-semibold text-[var(--brand-gold)]">₹{total.toFixed(2)}</div>
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={onProceed} className="px-4 py-2 rounded bg-gradient-to-b from-[#c99b10] to-[var(--brand-gold)] text-black font-semibold">Proceed</button>
        </div>
      </div>
    </div>
  );
}
