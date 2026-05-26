<template>
  <div class="tree-items-table">
    <AgGridVue
      class="tree-items-table__grid ag-theme-alpine"
      :row-data="rowData"
      :column-defs="columnDefs"
      :grid-options="gridOptions"
      tree-data
      tree-data-parent-id-field="parent"
      :get-row-id="getRowId"
      :auto-group-column-def="autoGroupColumnDef"
      dom-layout="autoHeight"
      @grid-ready="handleGridReady"
    />
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import type { GridReadyEvent } from 'ag-grid-community'
import type { TreeStore } from '@entities/tree-item'
import { useTreeGrid } from '../model/useTreeGrid'

const props = defineProps<{
  store: TreeStore
}>()

const {
  rowData,
  columnDefs,
  autoGroupColumnDef,
  gridOptions,
  getRowId,
  onGridReady,
} = useTreeGrid(toRef(props, 'store'))

function handleGridReady(event: GridReadyEvent): void {
  onGridReady(event.api)
}
</script>

<style scoped lang="scss">
@import './styles.scss';
</style>
