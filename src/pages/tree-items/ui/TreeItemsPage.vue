<template>
  <div class="tree-items-page">
    <header class="tree-items-page__header">
      <h1 class="tree-items-page__title">Дерево элементов</h1>
      <p class="tree-items-page__subtitle">
        Таблица на Ag Grid с группировкой строк и категориями «Группа» / «Элемент»
      </p>
    </header>

    <main class="tree-items-page__content">
      <TreeItemsTable :store="store" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue'
import { INITIAL_TREE_ITEMS, TreeStore } from '@entities/tree-item'
import { TreeItemsTable } from '@widgets/tree-items-table'

const store = shallowRef(new TreeStore([...INITIAL_TREE_ITEMS]))
</script>

<style scoped lang="scss">
@import './styles.scss';
</style>
