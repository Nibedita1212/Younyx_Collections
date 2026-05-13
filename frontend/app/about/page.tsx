import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* HERO SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12">
        {/* TEXT SECTION */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">
            About Younyx Collections
          </h1>

          <p className="mt-4 text-lg text-gray-700 leading-relaxed">
            Younyx Collections is a new label for minimal, everyday jewellery —
            thoughtfully crafted earrings, pendants, and necklace sets that elevate
            daily looks with quiet sophistication.
          </p>

          <p className="mt-4 text-gray-700 leading-relaxed">
            Our focus is on simplicity, elegance, and clean design — pieces made
            to complement your style effortlessly. Each item is crafted with
            attention to detail, ensuring smooth finishes, balanced proportions, and
            a premium feel you can see and sense.
          </p>

          <p className="mt-4 text-gray-700 leading-relaxed">
            Whether you're dressing for work, a casual outing, or a special
            moment, our curated jewellery helps you express your individuality
            through timeless minimalism.
          </p>

          <div className="mt-8">
            <Link href="/products" className="inline-block bg-[var(--brand-gold)] text-black px-6 py-3 rounded-full font-semibold shadow">
              Shop Collection
            </Link>
          </div>
        </div>

        {/* IMAGE SECTION */}
        <div className="relative w-full h-80 md:h-full rounded-2xl overflow-hidden shadow-sm">
          <Image
            src="/About_hero.png"
            alt="Younyx Jewellery"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Curated</h3>
          <p className="mt-2 text-gray-700">Earrings • Pendants • Necklace Sets</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900">Design</h3>
          <p className="mt-2 text-gray-700">Minimal & Versatile</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900">Quality</h3>
          <p className="mt-2 text-gray-700">Careful finishing & attention to detail</p>
        </div>
      </div>
    </div>
  );
}
