import PolicyLayout from "@/components/PolicyLayout";

export default function ShippingPage() {
  return (
    <PolicyLayout
      title="Shipping & Delivery"
      subtitle="Fast, reliable & secure delivery for all your jewellery orders."
    >
      <ul className="space-y-4 text-gray-300 leading-relaxed">
        <li>• Orders are processed within 24–48 hours.</li>
        <li>• Standard delivery time: 4–7 business days depending on location.</li>
        <li>• Tracking details will be shared via email once shipped.</li>
        <li>• In case of delays, our support team will notify you.</li>
        <li>• Free delivery may apply on special offers.</li>
      </ul>
    </PolicyLayout>
  );
}
