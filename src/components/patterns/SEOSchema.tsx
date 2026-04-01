export function SEOSchema({ name, description }: { name: string; description?: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": "Lodge Optical",
    "medicalSpecialty": "Optometry",
    "availableService": {
      "@type": "MedicalProcedure",
      "name": name,
      "description": description
    }
  };

  return (
    <script dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} type="application/ld+json" />
  );
}
