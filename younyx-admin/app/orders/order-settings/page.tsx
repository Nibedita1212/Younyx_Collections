"use client";

import { useState } from "react";

export default function OrderSettingsPage() {
  const [inclusiveTax, setInclusiveTax] = useState(true);

  const [shippingEnabled, setShippingEnabled] = useState(true);
  const [shippingCharge, setShippingCharge] = useState(50);
  const [freeShippingEnabled, setFreeShippingEnabled] = useState(false);
  const [freeShippingAbove, setFreeShippingAbove] = useState(999);

  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [discountType, setDiscountType] = useState("flat");
  const [flatDiscount, setFlatDiscount] = useState(0);
  const [percentDiscount, setPercentDiscount] = useState(0);
  const [minOrder, setMinOrder] = useState(0);

  const handleSave = () => {
    const payload = {
      inclusiveTax,
      shippingEnabled,
      shippingCharge,
      freeShippingEnabled,
      freeShippingAbove,
      discountEnabled,
      discountType,
      flatDiscount,
      percentDiscount,
      minOrder
    };

    console.log("Saving Settings...", payload);

    alert("Order Settings Saved Successfully!");
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Order & Pricing Settings</h1>

      {/* TAX SECTION */}
      <div className="bg-neutral-900 p-6 rounded-xl mb-6">
        <h2 className="text-xl font-semibold mb-4">Price Display</h2>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={inclusiveTax}
            onChange={() => setInclusiveTax(!inclusiveTax)}
          />
          <span>Show "Inclusive of all taxes"</span>
        </label>
      </div>

      {/* SHIPPING SECTION */}
      <div className="bg-neutral-900 p-6 rounded-xl mb-6">
        <h2 className="text-xl font-semibold mb-4">Shipping Settings</h2>

        <label className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            checked={shippingEnabled}
            onChange={() => setShippingEnabled(!shippingEnabled)}
          />
          <span>Enable Shipping</span>
        </label>

        {shippingEnabled && (
          <>
            <div className="mb-4">
              <label>Shipping Charge (₹)</label>
              <input
                type="number"
                className="block w-full mt-1 p-2 bg-neutral-800 rounded"
                value={shippingCharge}
                onChange={(e) => setShippingCharge(Number(e.target.value))}
              />
            </div>

            <label className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                checked={freeShippingEnabled}
                onChange={() => setFreeShippingEnabled(!freeShippingEnabled)}
              />
              <span>Enable Free Shipping Above</span>
            </label>

            {freeShippingEnabled && (
              <div>
                <label>Free Shipping Above Amount (₹)</label>
                <input
                  type="number"
                  className="block w-full mt-1 p-2 bg-neutral-800 rounded"
                  value={freeShippingAbove}
                  onChange={(e) =>
                    setFreeShippingAbove(Number(e.target.value))
                  }
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* DISCOUNT SECTION */}
      <div className="bg-neutral-900 p-6 rounded-xl mb-6">
        <h2 className="text-xl font-semibold mb-4">Discount Settings</h2>

        <label className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            checked={discountEnabled}
            onChange={() => setDiscountEnabled(!discountEnabled)}
          />
          <span>Enable Discount</span>
        </label>

        {discountEnabled && (
          <>
            <div className="mb-4">
              <label>Discount Type</label>
              <select
                className="block w-full mt-1 p-2 bg-neutral-800 rounded"
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
              >
                <option value="flat">Flat</option>
                <option value="percent">Percentage</option>
              </select>
            </div>

            {discountType === "flat" && (
              <div className="mb-4">
                <label>Flat Discount (₹)</label>
                <input
                  type="number"
                  className="block w-full mt-1 p-2 bg-neutral-800 rounded"
                  value={flatDiscount}
                  onChange={(e) => setFlatDiscount(Number(e.target.value))}
                />
              </div>
            )}

            {discountType === "percent" && (
              <div className="mb-4">
                <label>Discount Percentage (%)</label>
                <input
                  type="number"
                  className="block w-full mt-1 p-2 bg-neutral-800 rounded"
                  value={percentDiscount}
                  onChange={(e) =>
                    setPercentDiscount(Number(e.target.value))
                  }
                />
              </div>
            )}

            <div>
              <label>Minimum Order Required (₹)</label>
              <input
                type="number"
                className="block w-full mt-1 p-2 bg-neutral-800 rounded"
                value={minOrder}
                onChange={(e) => setMinOrder(Number(e.target.value))}
              />
            </div>
          </>
        )}
      </div>

      {/* SAVE BUTTON */}
      <button
        onClick={handleSave}
        className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold"
      >
        Save Settings
      </button>
    </div>
  );
}
