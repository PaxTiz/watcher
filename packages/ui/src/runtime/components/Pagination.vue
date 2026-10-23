<script lang="ts" setup>
import { computed } from "vue";
import { useRouter } from "vue-router";

import { useI18n } from "#imports";

import Button from "./Button.vue";

const currentPage = defineModel<number>("page", { required: true });
const { totalItems, perPage } = defineProps<{
  totalItems: number;
  perPage: number;
}>();

const { t } = useI18n();
const router = useRouter();
const totalPages = computed(() => Math.ceil(totalItems / perPage));

const changePage = async (page: number) => {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return;
  currentPage.value = page;

  await router.replace({ query: { page } });
};

const pages = computed(() => {
  const count = Math.min(3, totalPages.value);

  let start = currentPage.value - Math.floor(count / 2);

  if (start < 1) start = 1;

  if (start + count - 1 > totalPages.value) start = totalPages.value - count + 1;

  return Array.from({ length: count }, (_, i) => start + i);
});
</script>

<template>
  <nav
    class="bg-ui-text/[0.04] ring-ui-text/10 inline-flex items-center gap-1 rounded-full p-1 ring-1 ring-inset"
    :aria-label="t('ui.pagination.label')"
  >
    <Button
      :disabled="currentPage === 1"
      icon="lucide:chevrons-left"
      :aria-label="t('ui.pagination.first')"
      color="ghost"
      size="sm"
      @click="changePage(1)"
    />
    <Button
      :disabled="currentPage === 1"
      icon="lucide:chevron-left"
      :aria-label="t('ui.pagination.previous')"
      color="ghost"
      size="sm"
      @click="changePage(currentPage - 1)"
    />

    <Button
      v-for="item in pages"
      :key="item"
      :color="item === currentPage ? 'solid' : 'ghost'"
      :aria-current="item === currentPage ? 'page' : undefined"
      :label="item.toString()"
      size="sm"
      class="min-w-8 tabular-nums"
      @click="changePage(item as number)"
    />

    <Button
      :disabled="currentPage === totalPages"
      icon="lucide:chevron-right"
      :aria-label="t('ui.pagination.next')"
      color="ghost"
      size="sm"
      @click="changePage(currentPage + 1)"
    />
    <Button
      :disabled="currentPage === totalPages"
      icon="lucide:chevrons-right"
      :aria-label="t('ui.pagination.last')"
      color="ghost"
      size="sm"
      @click="changePage(totalPages)"
    />
  </nav>
</template>
