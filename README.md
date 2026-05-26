# MStroy — тестовое задание Frontend

Веб-приложение на **Vue 3 + TypeScript** для работы с иерархическими данными: класс-хранилище `TreeStore` и таблица на **AG Grid Enterprise** с деревом групп и элементов.

## Стек

| Технология | Назначение |
|------------|------------|
| Vue 3 (Composition API, `<script setup>`) | UI |
| TypeScript | типизация |
| Vite 8 | сборка и dev-сервер |
| AG Grid Community + Enterprise + Vue 3 | таблица с tree data |
| Vitest + Vue Test Utils + jsdom | unit-тесты |
| Feature-Sliced Design (FSD) | структура `src/` |

## Быстрый старт

### Требования

- Node.js 20+ (рекомендуется LTS)
- npm 10+

### Установка

```bash
git clone <url-репозитория>
cd mstroy-test
npm install
```

### Лицензия AG Grid Enterprise

Для дерева и группировки используется Enterprise. Без ключа grid работает в trial-режиме (сообщения в консоли и watermark).

1. Скопируйте шаблон окружения:

   ```bash
   copy .env.example .env
   ```

   (в Linux/macOS: `cp .env.example .env`)

2. Получите trial-ключ: [ag-grid.com/download](https://www.ag-grid.com/download/)

3. Вставьте ключ в `.env`:

   ```env
   VITE_AG_GRID_LICENSE_KEY=ваш_ключ
   ```

4. Перезапустите dev-сервер после изменения `.env`.

Файл `.env` в git не коммитится.

### Запуск

```bash
# режим разработки → http://localhost:5173
npm run dev

# production-сборка
npm run build

# просмотр сборки
npm run preview

# тесты
npm test

# тесты в watch-режиме
npm run test:watch

# тесты с покрытием
npm run test:coverage
```

## Что реализовано

### `TreeStore` (`src/entities/tree-item`)

Класс на TypeScript с индексами `Map` для быстрого доступа **O(1)** к узлу и **O(число потомков)** к поддереву без лишних полных обходов массива.

| Метод | Описание |
|-------|----------|
| `getAll()` | исходный массив элементов хранилища |
| `getItem(id)` | элемент по `id` (число или строка) |
| `getChildren(id)` | прямые дочерние элементы |
| `getAllChildren(id)` | все потомки на любой глубине |
| `getAllParents(id)` | цепочка от узла к корню (**порядок важен**: элемент → … → корень) |
| `addItem(item)` | добавление узла |
| `removeItem(id)` | удаление узла и всего поддерева |
| `updateItem(item)` | обновление полей и смена родителя |

Импорт для автотестов проверяющих:

```ts
import { TreeStore } from '@entities/tree-item'
```

### Таблица AG Grid (`src/widgets/tree-items-table`)

- **Tree Data** по полю `parent` (`treeDataParentIdField`)
- Колонки по заданию:
  1. **№ п/п** — порядковый номер видимой строки
  2. **Категория** — дерево (раскрытие), значения «Группа» / «Элемент»
  3. **Наименование** — `label` без иерархии
- «Группа» — у узла есть дочерние элементы; «Элемент» — лист
- Дерево по умолчанию полностью развёрнуто (`groupDefaultExpanded: -1`)

### Обработка ошибок (`src/shared/lib/errors`)

Расширяемая иерархия от `Error`:

- `AppError` — базовая (code, context, cause)
- `TreeStoreError` → `TreeItemNotFoundError`, `TreeItemDuplicateError`, `TreeItemInvalidParentError`, `TreeItemCircularReferenceError`

### Тесты

- `TreeStore` — все методы, порядок родителей, CRUD, циклы, граничные случаи
- `mapStoreToGridRows`, `useTreeGrid`, Vue-компоненты (с моком Ag Grid)
- `AppError` / `TreeStoreError`
- `TreeStore.benchmark.test.ts` — замеры на ~110k узлах (долгий прогон, можно исключить при обычном `npm test`)

## Архитектура (FSD)

Структура по [Feature-Sliced Design](https://feature-sliced.design/):

```
src/
├── app/                    # инициализация приложения, стили, AG Grid
│   ├── providers/          # регистрация модулей Enterprise, лицензия
│   ├── styles/
│   └── index.vue
├── pages/
│   └── tree-items/         # страница с таблицей
├── widgets/
│   └── tree-items-table/   # Ag Grid + маппинг store → строки
├── entities/
│   └── tree-item/          # TreeStore, начальные данные
└── shared/
    ├── lib/errors/         # классы ошибок
    └── types/              # TreeItem, TreeItemId
```

### Алиасы путей

В FSD алиасы задаются только для **слоёв** (layers), не для сегментов вроде `model`, `ui`, `lib`.

| Алиас | Слой | Путь |
|-------|------|------|
| `@app` | app | `src/app` |
| `@pages` | pages | `src/pages` |
| `@widgets` | widgets | `src/widgets` |
| `@features` | features | `src/features` (зарезервирован, пока не используется) |
| `@entities` | entities | `src/entities` |
| `@shared` | shared | `src/shared` |

## Скрипты npm

| Команда | Действие |
|---------|----------|
| `npm run dev` | dev-сервер Vite |
| `npm run build` | проверка типов + production build |
| `npm run preview` | локальный просмотр `dist/` |
| `npm test` | unit-тесты (Vitest) |
| `npm run test:watch` | тесты с перезапуском |
| `npm run test:coverage` | отчёт покрытия (v8) |

## Особенности реализации

- **Производительность `TreeStore`**: `itemsById` и `childrenByParentId` строятся один раз при добавлении; чтение не сканирует весь массив.
- **Смешанные `id`**: поддерживаются `number` и `string` без приведения порядка.
- **AG Grid**: `theme: 'legacy'` для совместимости с CSS-темой Alpine; tree props передаются и в `gridOptions`, и на `<AgGridVue>`.
- **Лицензия**: читается из `VITE_AG_GRID_LICENSE_KEY` в `src/app/providers/ag-grid.ts` до создания grid.

## Структура репозитория для проверки

В репозитории должны быть:

- `package.json` и `package-lock.json` — установка зависимостей через `npm install`
- исходники в `src/`
- `.env.example` — шаблон для ключа AG Grid (без секрета)

## Лицензии сторонних библиотек

- **AG Grid Enterprise** — trial / коммерческая лицензия для production; в задании допускается ознакомительное использование.
- **AG Grid Community** — MIT.
- Остальные зависимости — см. `package.json`.
