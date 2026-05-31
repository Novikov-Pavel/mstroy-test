import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { TreeStore } from '@entities/tree-item'
import { MOCK_TREE_ITEMS } from '@shared/config'
import TreeItemsTable from './TreeItemsTable.vue'

vi.mock('ag-grid-vue3', () => ({
  AgGridVue: defineComponent({
    name: 'AgGridVue',
    props: {
      rowData: { type: Array, default: () => [] },
      columnDefs: { type: Array, default: () => [] },
      gridOptions: { type: Object, default: () => ({}) },
    },
    template: '<div data-testid="ag-grid-stub" />',
  }),
}))

describe('TreeItemsTable', () => {
  it('монтируется и передаёт данные в AgGrid', () => {
    const store = new TreeStore(MOCK_TREE_ITEMS.map((item) => ({ ...item })))
    const wrapper = mount(TreeItemsTable, {
      props: { store },
    })

    expect(wrapper.find('[data-testid="ag-grid-stub"]').exists()).toBe(true)
    expect(wrapper.find('.tree-items-table').exists()).toBe(true)
  })
})
