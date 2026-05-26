import type { ColDef } from 'ag-grid-community'
import type { TreeGridRow } from './types'

/** № п/п и Наименование — без дерева */
export function createTreeTableStaticColumnDefs(): ColDef<TreeGridRow>[] {
  return [
    {
      headerName: '№ п/п',
      width: 90,
      maxWidth: 110,
      sortable: false,
      filter: false,
      suppressMovable: true,
      valueGetter: (params) =>
        params.node?.rowIndex != null ? params.node.rowIndex + 1 : '',
    },
    {
      field: 'label',
      headerName: 'Наименование',
      flex: 1,
      minWidth: 240,
      sortable: false,
      filter: false,
    },
  ]
}

/** Дерево групп/элементов в колонке «Категория» */
export const TREE_TABLE_AUTO_GROUP_COLUMN_DEF: ColDef<TreeGridRow> = {
  headerName: 'Категория',
  field: 'category',
  width: 240,
  sortable: false,
  filter: false,
  suppressMovable: true,
  cellRendererParams: {
    suppressCount: true,
  },
}
