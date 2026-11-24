import { About } from "@/components/site/About";
import { Contact } from "@/components/site/Contact";
import { DjMode } from "@/components/site/DjMode";
import { ErasSection } from "@/components/site/ErasSection";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { SectionRail } from "@/components/site/SectionRail";
import { Work } from "@/components/site/Work";
import { site } from "@/lib/data";

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.fullName,
  alternateName: site.name,
  url: site.url,
  email: `mailto:${site.email}`,
  jobTitle: "Founder",
  alumniOf: { "@type": "CollegeOrUniversity", name: "National Institute of Technology Calicut" },
  address: { "@type": "PostalAddress", addressLocality: "Bengaluru", addressCountry: "IN" },
  sameAs: Object.values(site.social).map((s) => s.href),
};

export default function Home() {
  return (
    <>
      <main id="main">
        <Hero />
        <Work />
        <ErasSection />
        <About />
        <Contact />
      </main>
      <Footer />
      <SectionRail />
      <DjMode />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
