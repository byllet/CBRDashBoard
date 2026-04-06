<template>
  <div class="page">
    <h1>Статистика кредитования</h1>
    
    <!-- Кнопки переключения представлений -->
    
    <div class="view-switcher">
      <button 
        v-for="view in views" 
        :key="view.id"
        @click="switchView(view.id)"
        :class="['view-btn', { active: currentView === view.id }]"
      >
        <span class="view-icon">{{ view.icon }}</span>
        {{ view.name }}
      </button>
    </div>
    
    <div class="chart-container">
      <transition name="fade" mode="out-in">
        <!-- Гистограмма -->
        <div v-if="currentView === 'histogram'" :key="'histogram-' + updateKey" class="chart-wrapper">
          <HistogramChart
            :data="salesData"
            :width="900"
            :height="500"
            :color="chartColor"
          />
        </div>


        <!-- Линейный график -->
        <div v-else-if="currentView === 'line'" :key="'line-' + updateKey" class="chart-wrapper">
          <LineChart
            :data="salesData"
            :width="900"
            :height="500"
            color="#42b983"
          />
        </div>
      </transition>
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-info">
            <div class="stat-value">{{ totalSales }}</div>
            <div class="stat-label">Всего продаж</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-info">
            <div class="stat-value">{{ averageSales }}</div>
            <div class="stat-label">Среднее значение</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-info">
            <div class="stat-value">{{ maxMonth.label }}</div>
            <div class="stat-label">Лучший месяц ({{ maxMonth.value }})</div>
          </div>
        </div>
        <div class="stat-card">
  
          <div class="stat-info">
            <div class="stat-value">{{ minMonth.label }}</div>
            <div class="stat-label">Худший месяц ({{ minMonth.value }})</div>
          </div>
        </div>
      </div>
    </div>




    <!-- Таблица с данными -->
    <div class="table-section">
      <h1>Данные за выбранный промежуток времени</h1>
      <DataTable
        :data="salesDataWithPercentage"
        :columns="tableColumns"
        title=""
        :show-search="true"
        search-placeholder="Поиск..."
        :show-pagination="true"
        :rows-per-page="6"
        :show-footer="true"
        search-key="label"
      />
    </div>
  </div>
</template>

<script>
import HistogramChart from '../components/HistogramChart.vue'
import LineChart from '../components/LineChart.vue'
import DataTable from '../components/DataTable.vue'

export default {
  name: 'CreditStats',
  components: {
    HistogramChart,
    LineChart,
    DataTable
  },
  data() {
    return {
      currentView: 'histogram',
      chartColor: '#42b983',
      updateKey: 0,
      views: [
        { id: 'histogram', name: 'Гистограмма'},
        { id: 'pie_chart', name: 'Круговая диаграмма'}
      ],
      salesData: [
        { label: "Янв", value: 120 },
        { label: "Фев", value: 150 },
        { label: "Мар", value: 180 },
        { label: "Апр", value: 90 },
        { label: "Май", value: 210 },
        { label: "Июн", value: 250 },
        { label: "Июл", value: 300 },
        { label: "Авг", value: 280 },
        { label: "Сен", value: 220 },
        { label: "Окт", value: 190 },
        { label: "Ноя", value: 160 },
        { label: "Дек", value: 200 }
      ],
      tableColumns: [
        { key: 'label', label: 'Месяц', sortable: true, cellClass: 'month-cell' },
        { key: 'value', label: 'Продажи', sortable: true, cellClass: 'value-cell', footerTotal: true },
        { key: 'percentage', label: 'Доля (%)', sortable: true, cellClass: 'percentage-cell' }
      ]
    }
  },
  computed: {
    totalSales() {
      return this.salesData.reduce((sum, item) => sum + item.value, 0)
    },
    averageSales() {
      return Math.round(this.totalSales / this.salesData.length)
    },
    maxMonth() {
      return this.salesData.reduce((max, item) => 
        item.value > max.value ? item : max
      )
    },
    minMonth() {
      return this.salesData.reduce((min, item) => 
        item.value < min.value ? item : min
      )
    },
    salesDataWithPercentage() {
      return this.salesData.map(item => ({
        ...item,
        percentage: ((item.value / this.totalSales) * 100).toFixed(1)
      }))
    },
    getCurrentViewName() {
      const view = this.views.find(v => v.id === this.currentView)
      return view ? view.name : ''
    }
  },
  methods: {
    switchView(viewId) {
      this.currentView = viewId
      this.updateKey++
    }
  }
}
</script>

<style scoped>
.page {
  padding: 20px;
}

h1 {
  color: #2c3e50;
  margin-bottom: 30px;
  text-align: center;
}

.view-switcher {
  display: flex;
  justify-content: right;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.view-btn {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f0f0f0;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-btn .view-icon {
  font-size: 20px;
}

.view-btn:hover {
  background: #e0e0e0;
  transform: translateY(-2px);
}

.view-btn.active {
  background: #42b983;
  color: white;
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.3);
}


.chart-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 30px;
  min-height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-wrapper {
  text-align: center;
  width: 100%;
}

.chart-controls {
  margin-top: 20px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  gap: 15px;
  align-items: center;
}

.chart-controls label {
  font-weight: 500;
  color: #666;
}

.chart-controls input {
  cursor: pointer;
}

/* Анимация переключения */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Карточки статистики */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 40px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.info {
  margin-top: 20px;
  margin-bottom: 30px;
  padding: 15px;
  background: #e8f5e9;
  border-radius: 8px;
  text-align: center;
}

.info p {
  margin: 5px 0;
  color: #2c3e50;
}

/* Таблица */
.table-section {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 2px solid #e0e0e0;
}

.table-section h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.3em;
}

.month-cell {
  font-weight: 600;
  color: #2c3e50;
}

.value-cell {
  font-weight: 500;
  color: #42b983;
}

.percentage-cell {
  color: #666;
}

@media (max-width: 768px) {
  .view-btn {
    padding: 8px 16px;
    font-size: 14px;
  }
  
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-value {
    font-size: 18px;
  }
}
</style>