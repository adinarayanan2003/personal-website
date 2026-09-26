import { About } from "@/components/site/About";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { JourneySection } from "@/components/site/JourneySection";
import { Metrics } from "@/components/site/Metrics";
import { Owly } from "@/components/site/Owly";
import { Work } from "@/components/site/Work";
import { owly, site } from "@/lib/data";

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.fullName,
  alternateName: site.name,
  url: site.url,
  email: `mailto:${site.email}`,
  jobTitle: "Founder",
  worksFor: { "@type": "Organization", name: owly.name, url: owly.href },
  alumniOf: { "@type": "CollegeOrUniversity", name: "National Institute of Technology Calicut" },
  address: { "@type": "PostalAddress", addressLocality: "Bengaluru", addressCountry: "IN" },
  sameAs: Object.values(site.social).map((s) => s.href),
};

export default function Home() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Metrics />
        <Owly />
        <Work />
        <JourneySection />
        <About />
        <Contact />
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
