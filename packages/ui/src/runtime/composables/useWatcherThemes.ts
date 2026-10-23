import { computed, useColorMode, useI18n } from "#imports";

const THEMES = [
  { value: "system", icon: "lucide:monitor" },
  { value: "light", icon: "lucide:sun" },
  { value: "dark", icon: "lucide:moon" },
] as const;

export const useWatcherThemes = () => {
  const { t } = useI18n();
  const colorMode = useColorMode();

  const options = computed(() =>
    THEMES.map(({ value, icon }) => ({ value, icon, label: t(`theme.${value}`) })),
  );

  const icon = computed(
    () => THEMES.find((theme) => theme.value === colorMode.preference)?.icon ?? THEMES[0].icon,
  );

  const changeTheme = (value: string) => {
    colorMode.preference = value;
  };

  return { colorMode, options, icon, changeTheme };
};
