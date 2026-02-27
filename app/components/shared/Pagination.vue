<script lang="ts" setup>
const currentPage = defineModel<number>("page", { required: true });

const { totalItems, perPage } = defineProps<{
  totalItems: number;
  perPage: number;
}>();

const totalPages = computed(() => Math.floor(totalItems / perPage));

function changePage(page: number) {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return;
  currentPage.value = page;
}

const pages = computed(() => {
  const count = Math.min(3, totalPages.value);

  let start = currentPage.value - Math.floor(count / 2);

  if (start < 1) start = 1;

  if (start + count - 1 > totalPages.value) start = totalPages.value - count + 1;

  return Array.from({ length: count }, (_, i) => start + i);
});
</script>

<template>
  <nav class="flex items-center gap-2" aria-label="Pagination">
    <Button
      :disabled="currentPage === 1"
      icon="lucide:chevrons-left"
      aria-label="Première page"
      size="sm"
      class="min-w-[35px]"
      @click="changePage(1)"
    />

    <Button
      :disabled="currentPage === 1"
      icon="lucide:chevron-left"
      aria-label="Page précédente"
      size="sm"
      class="min-w-[35px]"
      @click="changePage(currentPage - 1)"
    />

    <template v-for="item in pages" :key="item">
      <Button
        :color="item === currentPage ? 'secondary' : 'primary'"
        :aria-current="item === currentPage ? 'page' : undefined"
        :label="item.toString()"
        size="sm"
        class="min-w-[35px]"
        @click="changePage(item as number)"
      >
        {{ item }}
      </Button>
    </template>

    <Button
      :disabled="currentPage === totalPages"
      icon="lucide:chevron-right"
      aria-label="Page suivante"
      size="sm"
      class="min-w-[35px]"
      @click="changePage(currentPage + 1)"
    />

    <Button
      :disabled="currentPage === totalPages"
      icon="lucide:chevrons-right"
      aria-label="Dernière page"
      size="sm"
      class="min-w-[35px]"
      @click="changePage(totalPages)"
    />
  </nav>
</template>
