<template>
  <div class="pie-chart-container">
    <svg 
      :width="width" 
      :height="height" 
      :viewBox="`0 0 ${width} ${height}`"`
      class="pie-chart-svg"
    >
      <!-- Сегменты круговой диаграммы -->
      <g 
        v-for="(segment, index) in pieData" 
        :key="index"
        :transform="`translate(${width}, ${height/2})`"
      >
        <path
          :d="segment.path"
          :fill="segment.color"
          :stroke="strokeColor"
          :stroke-width="strokeWidth"
          :opacity="segment.hovered ? 0.8 : 1"
          @mouseenter="showTooltip(segment, index, $event)"
          @mouseleave="hideTooltip"
          @click="onSegmentClick(segment)"
          class="pie-segment"
          :style="getAnimationStyle(index)"
        />
        
        <!-- Линии-выноски для больших сегментов -->
        <polyline
          v-if="showLabels && segment.percentage > 5"
          :points="getLabelLine(segment)"
          :stroke="labelLineColor"
          :stroke-width="1"
          fill="none"
        />
        
        <!-- Текст меток -->
        <text
          v-if="showLabels && segment.percentage > 5"
          :x="getLabelPosition(segment).x"
          :y="getLabelPosition(segment).y"
          :text-anchor="getLabelPosition(segment).anchor"
          font-size="12"
          :fill="labelColor"
          class="pie-label"
        >
          {{ segment.label }} ({{ segment.percentage }}%)
        </text>
      </g>
      
      <!-- Центральный текст (опционально) -->
      <text
        v-if="showCenterText"
        :x="width/2"
        :y="height/2"
        text-anchor="middle"
        dominant-baseline="middle"
        :font-size="centerTextSize"
        :fill="centerTextColor"
        class="center-text"
      >
        {{ centerText }}
      </text>
    </svg>
    
    <!-- Легенда -->
    <div v-if="showLegend" class="legend">
      <div 
        v-for="(segment, index) in pieData" 
        :key="index"
        class="legend-item"
        @mouseenter="highlightSegment(index)"
        @mouseleave="unhighlightSegment"
      >
        <div 
          class="legend-color" 
          :style="{ backgroundColor: segment.color }"
        ></div>
        <span class="legend-label">{{ segment.label }}</span>
        <span class="legend-value">{{ segment.value }} ({{ segment.percentage }}%)</span>
      </div>
    </div>
    
    <!-- Tooltip -->
    <div 
      v-if="tooltip.visible" 
      class="tooltip"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      <strong>{{ tooltip.label }}</strong><br>
      Значение: {{ tooltip.value }}<br>
      Доля: {{ tooltip.percentage }}%
    </div>
  </div>
</template>

<script>
export default {
  name: "PieChart",
  props: {
    data: {
      type: Array,
      required: true,
      validator: (value) => {
        return value.every(item => 'label' in item && 'value' in item);
      }
    },
    width: {
      type: Number,
      default: 500
    },
    height: {
      type: Number,
      default: 500
    },
    colors: {
      type: Array,
      default: () => [
        "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", 
        "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
        "#BB8FCE", "#85C1E2", "#F8C471", "#A569BD"
      ]
    },
    strokeColor: {
      type: String,
      default: "#fff"
    },
    strokeWidth: {
      type: Number,
      default: 2
    },
    showLabels: {
      type: Boolean,
      default: true
    },
    showLegend: {
      type: Boolean,
      default: true
    },
    showCenterText: {
      type: Boolean,
      default: false
    },
    centerText: {
      type: String,
      default: "Всего"
    },
    centerTextSize: {
      type: Number,
      default: 20
    },
    centerTextColor: {
      type: String,
      default: "#333"
    },
    labelColor: {
      type: String,
      default: "#333"
    },
    labelLineColor: {
      type: String,
      default: "#999"
    },
    enableAnimation: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      tooltip: {
        visible: false,
        x: 0,
        y: 0,
        label: "",
        value: 0,
        percentage: 0
      },
      hoveredIndex: null,
      animatedAngles: []
    };
  },
  computed: {
    total() {
      return this.data.reduce((sum, item) => sum + item.value, 0);
    },
    
    pieData() {
      let currentAngle = 0;
      const centerX = this.width / 2;
      const centerY = this.height / 2;
      const radius = Math.min(this.width, this.height) / 2 - 40;
      
      return this.data.map((item, index) => {
        const percentage = (item.value / this.total) * 100;
        const angle = (item.value / this.total) * Math.PI * 2;
        
        // Расчет координат для path
        const startX = centerX + radius * Math.cos(currentAngle);
        const startY = centerY + radius * Math.sin(currentAngle);
        const endAngle = currentAngle + angle;
        const endX = centerX + radius * Math.cos(endAngle);
        const endY = centerY + radius * Math.sin(endAngle);
        
        // Флаг для большого сектора (> 180 градусов)
        const largeArcFlag = angle > Math.PI ? 1 : 0;
        
        // Создание SVG path
        const path = `
          M ${centerX} ${centerY}
          L ${startX} ${startY}
          A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}
          Z
        `;
        
        const color = this.colors[index % this.colors.length];
        
        const result = {
          label: item.label,
          value: item.value,
          percentage: Math.round(percentage * 10) / 10,
          angle: angle,
          startAngle: currentAngle,
          endAngle: endAngle,
          path: path,
          color: color,
          hovered: this.hoveredIndex === index,
          index: index
        };
        
        currentAngle += angle;
        return result;
      });
    },
    
    radius() {
      return Math.min(this.width, this.height) / 2 - 40;
    }
  },
  methods: {
    // Расчет позиции для метки
    getLabelPosition(segment) {
      const midAngle = segment.startAngle + segment.angle / 2;
      const radius = this.radius + 20;
      const x = this.width / 2 + radius * Math.cos(midAngle);
      const y = this.height / 2 + radius * Math.sin(midAngle);
      
      // Определяем выравнивание текста
      const anchor = x > this.width / 2 ? "start" : "end";
      
      return { x, y, anchor };
    },
    
    // Линия-выноска для метки
    getLabelLine(segment) {
      const midAngle = segment.startAngle + segment.angle / 2;
      const innerRadius = this.radius;
      const outerRadius = this.radius + 15;
      
      const startX = this.width / 2 + innerRadius * Math.cos(midAngle);
      const startY = this.height / 2 + innerRadius * Math.sin(midAngle);
      const midX = this.width / 2 + outerRadius * Math.cos(midAngle);
      const midY = this.height / 2 + outerRadius * Math.sin(midAngle);
      
      const labelPos = this.getLabelPosition(segment);
      const endX = labelPos.x;
      const endY = labelPos.y;
      
      return `${startX},${startY} ${midX},${midY} ${endX},${endY}`;
    },
    
    showTooltip(segment, index, event) {
      this.tooltip = {
        visible: true,
        x: event.clientX + 10,
        y: event.clientY - 10,
        label: segment.label,
        value: segment.value,
        percentage: segment.percentage
      };
    },
    
    hideTooltip() {
      this.tooltip.visible = false;
    },
    
    highlightSegment(index) {
      this.hoveredIndex = index;
    },
    
    unhighlightSegment() {
      this.hoveredIndex = null;
    },
    
    onSegmentClick(segment) {
      this.$emit("segment-click", segment);
    },
    
    getAnimationStyle(index) {
      if (!this.enableAnimation) return {};
      return {
        transition: "opacity 0.3s ease, transform 0.3s ease",
        transform: this.hoveredIndex === index ? "scale(1.02)" : "scale(1)",
        transformOrigin: "center"
      };
    },
    
    // Экспорт диаграммы как изображение
    exportAsImage() {
      const svg = this.$el.querySelector("svg");
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svg);
      const blob = new Blob([source], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = "pie-chart.svg";
      link.click();
      URL.revokeObjectURL(url);
    }
  }
};
</script>

<style scoped>
.pie-chart-container {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  gap: 30px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.pie-chart-svg {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.pie-segment {
  cursor: pointer;
  transition: all 0.3s ease;
}

.pie-segment:hover {
  filter: brightness(0.95);
  transform: scale(1.02);
}

.pie-label {
  font-weight: 500;
  text-shadow: 0 0 2px white;
  user-select: none;
}

.center-text {
  font-weight: bold;
  text-anchor: middle;
  dominant-baseline: middle;
}

.legend {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  min-width: 200px;
  max-height: 400px;
  overflow-y: auto;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

.legend-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin: 5px 0;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.legend-item:hover {
  background-color: #f0f0f0;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 10px;
  transition: transform 0.2s ease;
}

.legend-item:hover .legend-color {
  transform: scale(1.1);
}

.legend-label {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.legend-value {
  font-size: 12px;
  color: #666;
}

.tooltip {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 10px 15px;
  border-radius: 6px;
  font-size: 13px;
  pointer-events: none;
  z-index: 1000;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.tooltip strong {
  color: #ff9800;
}

/* Адаптивность */
@media (max-width: 768px) {
  .pie-chart-container {
    flex-direction: column;
    align-items: center;
  }
  
  .legend {
    width: 100%;
    max-width: 400px;
  }
}
</style>