import PolicyLayout from "@/components/PolicyLayout";

export default function ReturnsPage() {
  return (
    <PolicyLayout
      title="Returns & Exchange"
      subtitle="We ensure stress-free returns because your satisfaction matters."
    >
      <ul className="space-y-4 text-gray-300 leading-relaxed">
        <li>• Returns accepted within 7 days of delivery.</li>
        <li>• Product must be unused, undamaged and in original packaging.</li>
        <li>• Refund / exchange will be processed after quality check.</li>
        <li>• Shipping charges are non-refundable.</li>
        <li>• To initiate return, contact: younxy.online@gmail.com</li>
      </ul>
    </PolicyLayout>
  );
}
