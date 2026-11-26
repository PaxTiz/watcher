import en from "~/legal/en";
import es from "~/legal/es";
import fr from "~/legal/fr";
import type { LegalContent, LegalInfo } from "~/utils/legal";

const CONTENT: Record<string, (info: LegalInfo) => LegalContent> = { en, es, fr };

export const useLegalContent = () => {
  const { locale } = useI18n();

  return computed(() => (CONTENT[locale.value] ?? en)(LEGAL_INFO));
};
