import PolicyLayout from "@/components/PolicyLayout";

export default function TermsPage() {
  return (
    <PolicyLayout
      title="Terms & Conditions"
      subtitle="Please read our usage, policy and service terms carefully."
    >
      <ul className="space-y-4 text-gray-300 leading-relaxed">
        <li>• All prices are subject to change without notice.</li>
        <li>• Orders once placed cannot be modified after dispatch.</li>
        <li>• Product colors may slightly vary due to lighting.</li>
        <li>• By purchasing, you agree to our store policies.</li>
      </ul>
    </PolicyLayout>
  );
}
