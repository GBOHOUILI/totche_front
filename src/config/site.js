// Infos plateforme centralisées ici plutôt qu'en dur dans chaque page —
// modifiables sans toucher au code via les variables VITE_* (figées au
// build, cf. Dockerfile). Valeurs par défaut = celles de production actuelles.
export const SITE = {
  nomPlateforme: import.meta.env.VITE_PLATFORM_NAME || 'Totché',
  nomEntreprise: import.meta.env.VITE_COMPANY_NAME || 'Sen Impact Technologies',
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL || 'ajustinsena@gmail.com',
  contactTel: import.meta.env.VITE_CONTACT_TEL || '+229 01 67 75 88 20',
  contactAdresse: import.meta.env.VITE_CONTACT_ADRESSE || 'Cotonou, Bénin',
}
