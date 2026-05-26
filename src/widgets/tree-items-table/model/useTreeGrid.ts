import { computed, shallowRef, watch, type Ref } from 'vue'
import type { GetRowIdParams, GridApi, GridOptions } from 'ag-grid-community'
import type { TreeStore } from '@entities/tree-item'
import { mapStoreToGridRows } from '../lib/mapStoreToGridRows'
import {
  createTreeTableStaticColumnDefs,
  TREE_TABLE_AUTO_GROUP_COLUMN_DEF,
} from './columnDefs'
import type { TreeGridRow } from './types'

const AUTO_GROUP_COL_ID = 'ag-Grid-AutoColumn'

export function getTreeRowId(params: GetRowIdParams<TreeGridRow>): string {
  return String(params.data.id)
}

export function createTreeGridOptions(): GridOptions<TreeGridRow> {
  return {
    theme: 'legacy',
    treeData: true,
    treeDataParentIdField: 'parent',
    groupDefaultExpanded: -1,
    animateRows: true,
    defaultColDef: {
      resizable: true,
    },
  }
}

/** Порядок: № п/п → Категория (дерево) → Наименование */
function placeAutoGroupColumnAfterRowNumber(api: GridApi<TreeGridRow>): void {
  const autoColumn = api.getAllGridColumns().find((col) =>
    col.getColId().startsWith(AUTO_GROUP_COL_ID),
  )

  if (autoColumn) {
    api.moveColumns([autoColumn.getColId()], 1)
  }
}

export function useTreeGrid(store: Ref<TreeStore>) {
  const gridApi = shallowRef<GridApi<TreeGridRow> | null>(null)

  const rowData = computed(() => mapStoreToGridRows(store.value))
  const columnDefs = createTreeTableStaticColumnDefs()
  const autoGroupColumnDef = TREE_TABLE_AUTO_GROUP_COLUMN_DEF
  const gridOptions = createTreeGridOptions()

  watch(rowData, (rows) => {
    gridApi.value?.setGridOption('rowData', rows)
  })

  function onGridReady(api: GridApi<TreeGridRow>): void {
    gridApi.value = api
    api.setGridOption('rowData', rowData.value)
    placeAutoGroupColumnAfterRowNumber(api)
  }

  return {
    rowData,
    columnDefs,
    autoGroupColumnDef,
    gridOptions,
    getRowId: getTreeRowId,
    onGridReady,
  }
}
