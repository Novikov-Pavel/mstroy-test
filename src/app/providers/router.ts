import { RouterView, createRouter, createWebHistory } from 'vue-router'
import { TreeItemsPage } from '@pages/tree-items'
import { APP_ROUTE_NAME, APP_ROUTE_PATH } from '@shared/routes'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: APP_ROUTE_PATH.root,
      component: RouterView,
      children: [
        {
          path: APP_ROUTE_PATH.rootIndex,
          name: APP_ROUTE_NAME.treeItems,
          component: TreeItemsPage,
          alias: APP_ROUTE_PATH.treeItems,
        },
      ],
    },
  ],
})
