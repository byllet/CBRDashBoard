<template>
  <div class="table-container">
    <h2> {{ title }}</h2>
    
    <div class="table-controls">
      <input 
        v-if="showSearch"
        v-model="searchQuery" 
        :placeholder="searchPlaceholder" 
        class="search-input"
      />
      <div class="summary">
        <span> Всего: <strong>{{ total }}</strong></span>
      </div>
    </div>
    
    <table class="data-table">
      <thead>
        <tr>
          <th 
            v-for="column in columns" 
            :key="column.key"
            @click="column.sortable ? sortBy(column.key) : null"
            :class="{ sortable: column.sortable }"
          >
            {{ column.label }}
            <span v-if="column.sortable && sortKey === column.key">
              {{ sortOrder === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in paginatedData" :key="index">
          <td 
            v-for="column in columns" 
            :key="column.key"
            :class="column.cellClass"
          >
            <template v-if="column.type === 'progress'">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: row[column.key] + '%' }"
                ></div>
                <span class="progress-text">{{ row[column.key] }}%</span>
              </div> 
            </template> 

            <template v-if="column.type === 'percentage'">
                    {{ row[column.key] }}%
                </template>
            <template v-else>
              {{ row[column.key] }}
            </template>
          </td>
         </tr>
        <tr v-if="paginatedData.length === 0">
          <td :colspan="columns.length" class="empty-state">
            Нет данных для отображения
          </td>
        </tr>
      </tbody>
      <tfoot v-if="showFooter">
        <tr>
          <td 
            v-for="column in columns" 
            :key="column.key"
            :class="{ 'footer-total': column.footerTotal }"
          >
            <strong v-if="column.footerTotal">
              {{ getColumnTotal(column.key) }}
            </strong>
            <strong v-else-if="column.footerLabel">
              {{ column.footerLabel }}
            </strong>
          </td>
        </tr>
      </tfoot>
    </table>
    
    <div v-if="showPagination && totalPages > 1" class="pagination">
      <button @click="currentPage--" :disabled="currentPage === 1">
        ◀ Назад
      </button>
      <span class="page-info">
        Страница {{ currentPage }} из {{ totalPages }}
      </span>
      <button @click="currentPage++" :disabled="currentPage === totalPages">
        Вперед ▶
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataTable',
  props: {
    // Данные для таблицы
    data: {
      type: Array,
      required: true
    },
    // Конфигурация колонок
    columns: {
      type: Array,
      required: true,
      validator: (value) => {
        return value.every(col => 'key' in col && 'label' in col)
      }
    },
    // Заголовок таблицы
    title: {
      type: String,
      default: 'Таблица данных'
    },
    // Показывать поиск
    showSearch: {
      type: Boolean,
      default: true
    },
    // Плейсхолдер поиска
    searchPlaceholder: {
      type: String,
      default: 'Поиск...'
    },
    // Показывать пагинацию
    showPagination: {
      type: Boolean,
      default: true
    },
    // Строк на странице
    rowsPerPage: {
      type: Number,
      default: 5
    },
    // Показывать футер
    showFooter: {
      type: Boolean,
      default: true
    },
    // Ключ для поиска (по умолчанию ищет по всем полям)
    searchKey: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      searchQuery: '',
      sortKey: null,
      sortOrder: 'asc',
      currentPage: 1
    }
  },
  computed: {
    // Фильтрация данных
    filteredData() {
      if (!this.searchQuery) return this.data
      
      const query = this.searchQuery.toLowerCase()
      const searchFields = this.searchKey 
        ? [this.searchKey] 
        : this.columns.map(col => col.key)
      
      return this.data.filter(row => {
        return searchFields.some(field => {
          const value = row[field]
          return value && value.toString().toLowerCase().includes(query)
        })
      })
    },
    
    // Сортировка данных
    sortedData() {
      if (!this.sortKey) return this.filteredData
      
      const data = [...this.filteredData]
      data.sort((a, b) => {
        let aVal = a[this.sortKey]
        let bVal = b[this.sortKey]
        
        if (typeof aVal === 'number') {
          return this.sortOrder === 'asc' ? aVal - bVal : bVal - aVal
        } else {
          return this.sortOrder === 'asc' 
            ? String(aVal).localeCompare(String(bVal))
            : String(bVal).localeCompare(String(aVal))
        }
      })
      return data
    },
    
    // Пагинация
    paginatedData() {
      if (!this.showPagination) return this.sortedData
      
      const start = (this.currentPage - 1) * this.rowsPerPage
      const end = start + this.rowsPerPage
      return this.sortedData.slice(start, end)
    },
    
    // Общая сумма
    total() {
      if (!this.showFooter) return null
      return this.data.reduce((sum, row) => sum + (row.value || 0), 0)
    },
    
    // Количество страниц
    totalPages() {
      return Math.ceil(this.filteredData.length / this.rowsPerPage)
    }
  },
  watch: {
    searchQuery() {
      this.currentPage = 1
    }
  },
  methods: {
    sortBy(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortKey = key
        this.sortOrder = 'asc'
      }
    },
    
    getColumnTotal(key) {
      const total = this.data.reduce((sum, row) => sum + (row[key] || 0), 0)
      return typeof total === 'number' ? total : ''
    }
  }
}
</script>

<style scoped>
.table-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-top: 20px;
}

.table-container h2 {
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 1.3em;
}

.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 250px;
}

.summary {
  font-size: 14px;
  color: #666;
}

.summary strong {
  color: #42b983;
  font-size: 18px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background-color: #42b983;
  color: white;
  font-weight: 600;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background-color: #369b6e;
}

.data-table tbody tr:hover {
  background-color: #f5f5f5;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 40px;
}

.footer-total {
  font-weight: bold;
  color: #42b983;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
  align-items: center;
}

.pagination button {
  padding: 5px 15px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #666;
}

@media (max-width: 768px) {
  .table-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    width: 100%;
  }
  
  .data-table {
    font-size: 12px;
  }
  
  .data-table th,
  .data-table td {
    padding: 8px;
  }
}
</style>