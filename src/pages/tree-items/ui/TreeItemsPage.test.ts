import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TreeItemsPage from './TreeItemsPage.vue'

vi.mock('@widgets/tree-items-table', () => ({
  TreeItemsTable: defineComponent({
    name: 'TreeItemsTable',
    props: ['store'],
    template: '<div data-testid="tree-table-stub" />',
  }),
}))

describe('TreeItemsPage', () => {
  it('рендерит заголовок и таблицу', () => {
    const wrapper = mount(TreeItemsPage)

    expect(wrapper.find('.tree-items-page__title').text()).toContain(
      'Дерево элементов',
    )
    expect(wrapper.find('[data-testid="tree-table-stub"]').exists()).toBe(true)
  })
})
