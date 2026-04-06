<template>
  <div class="histogram-container">
    <svg :width="width" :height="height" class="histogram-svg">
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

      <!-- Столбцы -->
      <rect
        v-for="(item, index) in chartData"
        :key="index"
        :x="item.x"
        :y="item.y"
        :width="item.width"
        :height="item.height"
        :fill="color"
        @mouseenter="showTooltip(index, $event)"
        @mouseleave="hideTooltip"
      />

      <!-- Подписи X -->
      <text
        v-for="(item, index) in chartData"
        :key="'label-' + index"
        :x="item.x + item.width / 2"
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
  name: "HistogramChart",
  props: {
    data: {
      type: Array,
      required: true
    },
    width: {
      type: Number,
      default: 600
    },
    height: {
      type: Number,
      default: 400
    },
    color: {
      type: String,
      default: "#4CAF50"
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
    };
  },
  computed: {
    maxValue() {
      return Math.max(...this.data.map(item => item.value), 0);
    },
    chartData() {
      const chartHeight = this.height - this.padding.top - this.padding.bottom;
      const chartWidth = this.width - this.padding.left - this.padding.right;
      const barWidth = chartWidth / this.data.length;
      
      return this.data.map((item, index) => {
        const barHeight = (item.value / this.maxValue) * chartHeight;
        const x = this.padding.left + index * barWidth;
        const y = this.height - this.padding.bottom - barHeight;
        
        return {
          label: item.label,
          value: item.value,
          x: x,
          y: y,
          width: barWidth * 0.8,
          height: barHeight
        };
      });
    },
    yTicks() {
      const ticks = [];
      const maxVal = this.maxValue;
      const step = maxVal / 5;
      
      for (let i = 0; i <= 5; i++) {
        const value = Math.round(i * step);
        ticks.push({ value, label: value.toString() });
      }
      return ticks;
    }
  },
  methods: {
    getY(value) {
      const chartHeight = this.height - this.padding.top - this.padding.bottom;
      return this.height - this.padding.bottom - (value / this.maxValue) * chartHeight;
    },
    showTooltip(index, event) {
      const item = this.chartData[index];
      this.tooltip = {
        visible: true,
        x: event.clientX + 10,
        y: event.clientY - 10,
        label: item.label,
        value: item.value
      };
    },
    hideTooltip() {
      this.tooltip.visible = false;
    }
  }
};
</script>

<style scoped>
.histogram-container {
  position: relative;
  display: inline-block;
}
.histogram-svg {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 4px;
}
rect {
  transition: fill 0.3s ease;
  cursor: pointer;
}
rect:hover {
  fill: #ff9800;
  opacity: 0.8;
}
.tooltip {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  z-index: 1000;
  white-space: nowrap;
}
.tooltip strong {
  color: #ff9800;
}
</style>