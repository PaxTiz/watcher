export type LegalBlock = string | Array<string>;

export type LegalSection = {
  title: string;
  blocks: Array<LegalBlock>;
};

export type LegalDocument = {
  title: string;
  description: string;
  intro: string;
  sections: Array<LegalSection>;
};

export type LegalContent = {
  privacy: LegalDocument;
  terms: LegalDocument;
};

// TODO: fill in before publishing
export const LEGAL_INFO = {
  publisher: "[Nom de l'éditeur]",
  status: "[Statut : particulier, micro-entreprise, société…]",
  address: "[Adresse postale]",
  siret: "[SIRET, si applicable]",
  email: "[email@contact]",
  host: "[Nom de l'hébergeur]",
  host_address: "[Adresse de l'hébergeur]",
  updated_at: "2026-11-26",
};

export type LegalInfo = typeof LEGAL_INFO;

export type LegalPart = { text: string; href?: string };

// Splits `[label](url)` links out of a paragraph, so the text never goes through v-html
export const legal_parts = (text: string): Array<LegalPart> => {
  const parts: Array<LegalPart> = [];
  const pattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) {
      parts.push({ text: text.slice(last, match.index) });
    }
    parts.push({ text: match[1]!, href: match[2]! });
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    parts.push({ text: text.slice(last) });
  }
  return parts;
};
