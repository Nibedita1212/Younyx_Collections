import PolicyLayout from "@/components/PolicyLayout";

export default function CarePage() {
  return (
    <PolicyLayout
      title="Jewellery Care"
      subtitle="Follow these care tips to maintain shine and durability."
    >
      <ul className="space-y-4 text-gray-300 leading-relaxed">
        <li>• Store jewellery in a dry place away from moisture.</li>
        <li>• Avoid perfume, deodorant and chemical contact.</li>
        <li>• Clean gently with a soft cloth if required.</li>
        <li>• Keep pieces separately to prevent scratches.</li>
      </ul>
    </PolicyLayout>
  );
}
