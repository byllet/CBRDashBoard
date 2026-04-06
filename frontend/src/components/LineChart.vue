<template>
  <div class="line-chart-container">
    <svg :width="width" :height="height" class="line-chart-svg">
      <!-- Оси -->
      <line 
        :x1="padding.left" 
        :y1="height - padding.bottom" 
        :x2="width - padding.right" 
        :y2="height - padding.bottom" 
        stroke="black" 
        stroke-width="2"
      />
      <line 
        :x1="padding.left" 
        :y1="padding.top" 
        :x2="padding.left" 
        :y2="height - padding.bottom" 
        stroke="black" 
        stroke-width="2"
      />

      <!-- Линия графика -->
      <polyline
        :points="linePoints"
        fill="none"
        :stroke="color"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- Точки на графике -->
      <circle
        v-for="(point, index) in chartData"
        :key="index"
        :cx="point.x"
        :cy="point.y"
        r="6"
        :fill="color"
        stroke="white"
        stroke-width="2"
        @mouseenter="showTooltip(point, index, $event)"
        @mouseleave="hideTooltip"
        style="cursor: pointer"
      />

      <!-- Заливка под линией -->
      <polygon
        :points="areaPoints"
        :fill="color"
        fill-opacity="0.1"
      />

      <!-- Подписи X -->
      <text
        v-for="(item, index) in chartData"
        :key="'label-' + index"
        :x="item.x"
        :y="height - padding.bottom + 20"
        text-anchor="middle"
        font-size="12"
      >
        {{ item.label }}
      </text>

      <!-- Подписи Y -->
      <text
        v-for="(tick, index) in yTicks"
        :key="'ytick-' + index"
        :x="padding.left - 10"
        :y="getY(tick.value)"
        text-anchor="end"
        font-size="12"
        dominant-baseline="middle"
      >
        {{ tick.label }}
      </text>
    </svg>

    <!-- Tooltip -->
    <div 
      v-if="tooltip.visible" 
      class="tooltip"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      <strong>{{ tooltip.label }}</strong><br>
      Значение: {{ tooltip.value }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'LineChart',
  props: {
    data: {
      type: Array,
      required: true
    },
    width: {
      type: Number,
      default: 900
    },
    height: {
      type: Number,
      default: 500
    },
    color: {
      type: String,
      default: "#42b983"
    },
    padding: {
      type: Object,
      default: () => ({
        top: 20,
        right: 20,
        bottom: 50,
        left: 50
      })
    }
  },
  data() {
    return {
      tooltip: {
        visible: false,
        x: 0,
        y: 0,
        label: "",
        value: 0
      }
    }
  },
  computed: {
    maxValue() {
      return Math.max(...this.data.map(item => item.value), 0)
    },
    chartData() {
      const chartHeight = this.height - this.padding.top - this.padding.bottom
      const chartWidth = this.width - this.padding.left - this.padding.right
      const stepX = chartWidth / (this.data.length - 1)
      
      return this.data.map((item, index) => {
        const x = this.padding.left + index * stepX
        const y = this.height - this.padding.bottom - (item.value / this.maxValue) * chartHeight
        
        return {
          label: item.label,
          value: item.value,
          x: x,
          y: y
        }
      })
    },
    linePoints() {
      return this.chartData.map(point => `${point.x},${point.y}`).join(' ')
    },
    areaPoints() {
      const bottomY = this.height - this.padding.bottom
      const points = this.chartData.map(point => `${point.x},${point.y}`).join(' ')
      const firstPoint = this.chartData[0]
      const lastPoint = this.chartData[this.chartData.length - 1]
      return `${firstPoint.x},${bottomY} ${points} ${lastPoint.x},${bottomY}`
    },
    yTicks() {
      const ticks = []
      const maxVal = this.maxValue
      const step = maxVal / 5
      
      for (let i = 0; i <= 5; i++) {
        const value = Math.round(i * step)
        ticks.push({ value, label: value.toString() })
      }
      return ticks
    }
  },
  methods: {
    getY(value) {
      const chartHeight = this.height - this.padding.top - this.padding.bottom
      return this.height - this.padding.bottom - (value / this.maxValue) * chartHeight
    },
    showTooltip(point, index, event) {
      this.tooltip = {
        visible: true,
        x: event.clientX + 10,
        y: event.clientY - 10,
        label: point.label,
        value: point.value
      }
    },
    hideTooltip() {
      this.tooltip.visible = false
    }
  }
}
</script>

<style scoped>
.line-chart-container {
  position: relative;
  display: inline-block;
}

.line-chart-svg {
  background-color: #f9f9f9;
  border-radius: 8px;
}

polyline {
  transition: all 0.3s ease;
}

circle {
  transition: r 0.2s ease;
  cursor: pointer;
}

circle:hover {
  r: 8px;
  filter: brightness(0.9);
}

.tooltip {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  pointer-events: none;
  z-index: 1000;
  white-space: nowrap;
}

.tooltip strong {
  color: #ff9800;
}
</style>