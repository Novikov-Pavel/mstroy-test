import { describe, expect, it, vi } from 'vitest'
import { shallowRef } from 'vue'
import { TreeStore } from '@entities/tree-item'
import { MOCK_TREE_ITEMS } from '@shared/config'
import {
  createTreeGridOptions,
  getTreeRowId,
  useTreeGrid,
} from './useTreeGrid'

describe('useTreeGrid', () => {
  it('createTreeGridOptions настраивает treeData по parent', () => {
    const options = createTreeGridOptions()

    expect(options.treeData).toBe(true)
    expect(options.treeDataParentIdField).toBe('parent')
    expect(options.groupDefaultExpanded).toBe(-1)
  })

  it('getTreeRowId возвращает строковый id', () => {
    expect(
      getTreeRowId({ data: { id: 1, parent: null, label: 'A' } } as never),
    ).toBe('1')
    expect(
      getTreeRowId({
        data: { id: '91064cee', parent: 1, label: 'B' },
      } as never),
    ).toBe('91064cee')
  })

  it('useTreeGrid формирует rowData и колонки', () => {
    const store = shallowRef(
      new TreeStore(MOCK_TREE_ITEMS.map((item) => ({ ...item }))),
    )
    const { rowData, columnDefs, autoGroupColumnDef } = useTreeGrid(store)

    expect(rowData.value).toHaveLength(MOCK_TREE_ITEMS.length)
    expect(columnDefs).toHaveLength(2)
    expect(columnDefs[0]?.headerName).toBe('№ п/п')
    expect(columnDefs[1]?.headerName).toBe('Наименование')
    expect(autoGroupColumnDef.headerName).toBe('Категория')
    expect(autoGroupColumnDef.field).toBe('category')
  })

  it('onGridReady передаёт rowData и перемещает auto group column', () => {
    const store = shallowRef(
      new TreeStore(MOCK_TREE_ITEMS.map((item) => ({ ...item }))),
    )
    const { rowData, onGridReady } = useTreeGrid(store)

    const setGridOption = vi.fn()
    const moveColumns = vi.fn()
    const api = {
      setGridOption,
      getAllGridColumns: () => [{ getColId: () => 'ag-Grid-AutoColumn' }],
      moveColumns,
    } as never

    onGridReady(api)

    expect(setGridOption).toHaveBeenCalledWith('rowData', rowData.value)
    expect(moveColumns).toHaveBeenCalledWith(['ag-Grid-AutoColumn'], 1)
  })
})
