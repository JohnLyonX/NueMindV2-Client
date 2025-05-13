<script setup>
import { ref, onMounted } from 'vue'

// 学习数据
const learningData = ref({
  todayStudy: {
    duration: 180, // 分钟
    completedTasks: 5,
    totalTasks: 8
  },
  weeklyStats: {
    monday: 120,
    tuesday: 90,
    wednesday: 180,
    thursday: 150,
    friday: 210,
    saturday: 60,
    sunday: 30
  },
  upcomingTasks: [
    {
      id: 1,
      type: 'course',
      title: 'Java基础语法学习',
      deadline: '2024-03-20 14:30',
      priority: 'high'
    },
    {
      id: 2,
      type: 'exercise',
      title: 'C语言编程练习',
      deadline: '2024-03-21 16:00',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'exam',
      title: '背八股文',
      deadline: '2024-03-25 09:00',
      priority: 'high'
    }
  ],
  learningTips: [
    'Java基础语法学习',
    '距离下次考试还有5天，请合理安排复习时间',
    '今日学习时长已达标，继续保持！'
  ],
  // 添加个人情况分析数据
  personalAnalysis: {
    learningAbility: 85,
    logicalThinking: 90,
    codingSpeed: 75,
    accuracy: 88
  }
})

// 格式化学习时长
const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`
}

// 获取优先级标签样式
const getPriorityStyle = (priority) => {
  const styles = {
    high: { color: '#f5222d', background: '#fff1f0' },
    medium: { color: '#faad14', background: '#fff7e6' },
    low: { color: '#52c41a', background: '#f6ffed' }
  }
  return styles[priority] || {}
}

// 获取任务类型图标
const getTaskTypeIcon = (type) => {
  const icons = {
    course: '📚',
    exercise: '✏️',
    exam: '📝'
  }
  return icons[type] || '📌'
}

onMounted(() => {
  // 这里可以添加实际的数据获取逻辑
})
</script>

<template>
  <div class="user-assistant">
    <h2 class="page-title">我的管家</h2>

    <div class="dashboard-grid">
      <!-- 今日学习概览 -->
      <div class="dashboard-card today-overview">
        <h3 class="card-title">今日学习概览</h3>
        <div class="today-stats">
          <div class="stat-item">
            <span class="stat-value">{{ formatDuration(learningData.todayStudy.duration) }}</span>
            <span class="stat-label">学习时长</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ learningData.todayStudy.completedTasks }}/{{ learningData.todayStudy.totalTasks }}</span>
            <span class="stat-label">任务完成</span>
          </div>
        </div>
        <div class="progress-section">
          <div class="progress-bar">
            <div
              class="progress-inner"
              :style="{ width: (learningData.todayStudy.completedTasks / learningData.todayStudy.totalTasks * 100) + '%' }"
            ></div>
          </div>
          <span class="progress-text">{{ Math.round(learningData.todayStudy.completedTasks / learningData.todayStudy.totalTasks * 100) }}%</span>
        </div>
      </div>

      <!-- 个人情况分析 -->
      <div class="dashboard-card personal-analysis">
        <h3 class="card-title">个人情况分析</h3>
        <div class="analysis-chart">
          <div class="chart-container">
            <div class="chart-item">
              <div class="chart-label">学习能力</div>
              <div class="chart-bar">
                <div
                  class="bar-inner"
                  :style="{ width: learningData.personalAnalysis.learningAbility + '%' }"
                ></div>
              </div>
              <div class="chart-value">{{ learningData.personalAnalysis.learningAbility }}%</div>
            </div>
            <div class="chart-item">
              <div class="chart-label">思维能力</div>
              <div class="chart-bar">
                <div
                  class="bar-inner"
                  :style="{ width: learningData.personalAnalysis.logicalThinking + '%' }"
                ></div>
              </div>
              <div class="chart-value">{{ learningData.personalAnalysis.logicalThinking }}%</div>
            </div>
            <div class="chart-item">
              <div class="chart-label">编程速度</div>
              <div class="chart-bar">
                <div
                  class="bar-inner"
                  :style="{ width: learningData.personalAnalysis.codingSpeed + '%' }"
                ></div>
              </div>
              <div class="chart-value">{{ learningData.personalAnalysis.codingSpeed }}%</div>
            </div>
            <div class="chart-item">
              <div class="chart-label">正确率</div>
              <div class="chart-bar">
                <div
                  class="bar-inner"
                  :style="{ width: learningData.personalAnalysis.accuracy + '%' }"
                ></div>
              </div>
              <div class="chart-value">{{ learningData.personalAnalysis.accuracy }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 本周学习趋势 -->
      <div class="dashboard-card weekly-trend">
        <h3 class="card-title">本周学习趋势</h3>
        <div class="weekly-chart">
          <div
            v-for="(duration, day) in learningData.weeklyStats"
            :key="day"
            class="chart-bar"
          >
            <div
              class="bar-inner"
              :style="{ height: (duration / 240 * 100) + '%' }"
              :data-value="formatDuration(duration)"
            ></div>
            <span class="day-label">{{ day.slice(0, 3) }}</span>
          </div>
        </div>
        <div class="weekly-summary">
          <div class="summary-item">
            <span class="summary-label">本周总学习时长</span>
            <span class="summary-value">{{ formatDuration(Object.values(learningData.weeklyStats).reduce((a, b) => a + b, 0)) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">平均每日学习</span>
            <span class="summary-value">{{ formatDuration(Math.round(Object.values(learningData.weeklyStats).reduce((a, b) => a + b, 0) / 7)) }}</span>
          </div>
        </div>
      </div>

      <!-- 待办任务 -->
      <div class="dashboard-card upcoming-tasks">
        <h3 class="card-title">待办任务</h3>
        <div class="task-list">
          <div
            v-for="task in learningData.upcomingTasks"
            :key="task.id"
            class="task-item"
          >
            <div class="task-icon">{{ getTaskTypeIcon(task.type) }}</div>
            <div class="task-content">
              <div class="task-title">{{ task.title }}</div>
              <div class="task-deadline">截止时间：{{ task.deadline }}</div>
            </div>
            <div
              class="priority-tag"
              :style="getPriorityStyle(task.priority)"
            >
              {{ task.priority === 'high' ? '紧急' : task.priority === 'medium' ? '普通' : '低优' }}
            </div>
          </div>
        </div>
      </div>

      <!-- 学习建议 -->
      <div class="dashboard-card learning-tips">
        <h3 class="card-title">学习建议</h3>
        <div class="tips-list">
          <div
            v-for="(tip, index) in learningData.learningTips"
            :key="index"
            class="tip-item"
          >
            <span class="tip-icon">💡</span>
            <span class="tip-text">{{ tip }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.user-assistant {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #333;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.dashboard-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

/* 今日概览样式 */
.today-stats {
  display: flex;
  gap: 40px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 600;
  color: #1890ff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-inner {
  height: 100%;
  background: #1890ff;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  color: #1890ff;
  font-weight: 500;
}

/* 周趋势图表样式 */
.weekly-chart {
  height: 200px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 20px 0;
  margin-bottom: 20px;
  position: relative;
  background: linear-gradient(to bottom, transparent 0%, transparent 95%, #f0f0f0 95%, #f0f0f0 100%);
}

.weekly-chart::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    to bottom,
    transparent,
    transparent 49%,
    #f0f0f0 49%,
    #f0f0f0 51%,
    transparent 51%
  );
  pointer-events: none;
}

.chart-bar {
  width: 40px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
}

.bar-inner {
  width: 100%;
  background: linear-gradient(to top, #1890ff, #40a9ff);
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
  position: relative;
  box-shadow: 0 2px 4px rgba(24, 144, 255, 0.2);
}

.bar-inner:hover {
  background: linear-gradient(to top, #40a9ff, #69c0ff);
  box-shadow: 0 4px 8px rgba(24, 144, 255, 0.3);
}

.bar-inner::after {
  content: attr(data-value);
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: #1890ff;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.chart-bar:hover .bar-inner::after {
  opacity: 1;
}

.day-label {
  font-size: 12px;
  color: #666;
  text-transform: capitalize;
  font-weight: 500;
}

.weekly-summary {
  display: flex;
  justify-content: space-around;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.summary-label {
  font-size: 12px;
  color: #666;
}

.summary-value {
  font-size: 16px;
  font-weight: 500;
  color: #1890ff;
}

/* 待办任务样式 */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.task-icon {
  font-size: 20px;
}

.task-content {
  flex: 1;
}

.task-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.task-deadline {
  font-size: 12px;
  color: #666;
}

.priority-tag {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
}

/* 学习建议样式 */
.tips-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.tip-icon {
  font-size: 20px;
}

.tip-text {
  font-size: 14px;
  color: #333;
}

/* 个人情况分析样式 */
.personal-analysis {
  grid-column: span 2;
}

.analysis-chart {
  padding: 20px 0;
}

.chart-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chart-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.chart-label {
  width: 80px;
  font-size: 14px;
  color: #666;
}

.chart-bar {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.bar-inner {
  height: 100%;
  background: #1890ff;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.chart-value {
  width: 50px;
  font-size: 14px;
  color: #1890ff;
  font-weight: 500;
  text-align: right;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .page-title {
    color: #e0e0e0;
  }

  .dashboard-card {
    background: #2d2d2d;
  }

  .card-title {
    color: #e0e0e0;
  }

  .stat-label {
    color: #aaa;
  }

  .progress-bar {
    background: #404040;
  }

  .task-item,
  .tip-item {
    background: #363636;
  }

  .task-title,
  .tip-text {
    color: #e0e0e0;
  }

  .task-deadline {
    color: #aaa;
  }

  .day-label {
    color: #aaa;
  }

  .chart-label {
    color: #aaa;
  }

  .chart-bar {
    background: #363636;
  }

  .chart-value {
    color: #40a9ff;
  }

  .weekly-summary {
    border-top-color: #404040;
  }

  .summary-label {
    color: #aaa;
  }

  .summary-value {
    color: #40a9ff;
  }

  .weekly-chart {
    background: linear-gradient(to bottom, transparent 0%, transparent 95%, #363636 95%, #363636 100%);
  }

  .weekly-chart::before {
    background: repeating-linear-gradient(
      to bottom,
      transparent,
      transparent 49%,
      #363636 49%,
      #363636 51%,
      transparent 51%
    );
  }

  .bar-inner {
    background: linear-gradient(to top, #1890ff, #40a9ff);
    box-shadow: 0 2px 4px rgba(24, 144, 255, 0.3);
  }

  .bar-inner:hover {
    background: linear-gradient(to top, #40a9ff, #69c0ff);
    box-shadow: 0 4px 8px rgba(24, 144, 255, 0.4);
  }

  .bar-inner::after {
    color: #40a9ff;
  }
}

/* 响应式设计 */
@media (max-width: 992px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .today-stats {
    gap: 20px;
  }

  .stat-value {
    font-size: 20px;
  }

  .weekly-chart {
    height: 160px;
  }

  .chart-bar {
    width: 30px;
  }

  .bar-inner::after {
    font-size: 10px;
    top: -16px;
  }

  .personal-analysis {
    grid-column: span 1;
  }

  .chart-label {
    width: 70px;
    font-size: 13px;
  }

  .chart-value {
    width: 40px;
    font-size: 13px;
  }

  .summary-value {
    font-size: 14px;
  }
}

@media (max-width: 576px) {
  .page-title {
    font-size: 20px;
  }

  .dashboard-card {
    padding: 16px;
  }

  .card-title {
    font-size: 16px;
  }

  .today-stats {
    flex-direction: column;
    gap: 16px;
    align-items: center;
  }
}
</style>
