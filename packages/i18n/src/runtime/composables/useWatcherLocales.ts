import { useI18n } from "#imports";

import { LOCALES, type LocaleCode } from "../../locales";

export const useWatcherLocales = () => {
  const { locale, setLocale } = useI18n();

  const options = LOCALES.map(({ code, name, flag }) => ({ value: code, label: name, icon: flag }));

  const changeLocale = async (code: string) => {
    if (LOCALES.some((l) => l.code === code)) {
      await setLocale(code as LocaleCode);
    }
  };

  return { locale, options, changeLocale };
};
