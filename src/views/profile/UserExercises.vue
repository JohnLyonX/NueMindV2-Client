<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'

const router = useRouter()
const exercises = ref([])
const loading = ref(true)
const error = ref(null)
const hasNewExercise = ref(true)

// 新增：用于存储定时器
let fetchTimer = null

// 获取练习列表
const fetchExercises = async () => {
  loading.value = true
  error.value = null
  
  try {
    // 获取练习列表
    const exercisesResponse = await request.get('edu/exercises/list')
    const exercisesData = exercisesResponse.data.rows

    // 获取分数列表
    const scoresResponse = await request.get('edu/scores/list')
    const scoresData = scoresResponse.data.rows

    // 获取练习与题目的关联数据
    const correlationResponse = await request.get('edu/correlation/list')
    const correlationData = correlationResponse.data.rows
        // 获取学生的答题记录
    const answersResponse = await request.get('edu/answers/list')
    const answersData = answersResponse.data.rows
    const statusMap = {
      0: 'not_started',
      1: 'in_progress',
      2: 'completed'
    };
    // 将练习列表和分数列表进行匹配
    exercises.value = exercisesData.map(item => {
      const score = scoresData.find(score => 
        score.studentId === Number(localStorage.getItem('studentId')) && 
        score.exerciseId === item.exerciseId
      )
      const totalQuestions = correlationData
        .filter(corr => corr.exerciseId === item.exerciseId)
        .length
      const completedQuestions = answersData
        .filter(answer => 
          answer.studentId === Number(localStorage.getItem('studentId')) && 
          answer.exerciseId === item.exerciseId
        )
        .length
      return {
        id: item.exerciseId,
        title: item.title,
        course: item.description,
        totalQuestions: totalQuestions, 
        completedQuestions: completedQuestions, 
        score: score ? score.totalScore : null, 
        totalScore: score ? Math.round(score.totalScore * (totalQuestions / 100)) : 0, // 新增：计算总成绩
        status: statusMap[item.status] || 'not_started',
        submissionTime: item.submissionTime
      }
    })
    loading.value = false
  } catch (err) {
    error.value = '获取练习数据失败，请重新登錄'
    loading.value = false
    console.error('获取练习数据失败:', err)
  }
}

// 组件卸载时清理定时器
onUnmounted(() => {
  if (fetchTimer) {
    clearTimeout(fetchTimer)
  }
})

// 获取新练习题
const fetchNewExercises = async () => {
  try {
    // 使用假数据模拟新练习题
    const newExercise = {
      id: exercises.value.length + 1,
      title: 'Java进阶练习',
      course: 'Java面向对象编程',
      totalQuestions: 30,
      completedQuestions: 0,
      score: null,
      status: 'not_started',
      submissionTime: null
    }
    
    exercises.value = [newExercise, ...exercises.value]
    hasNewExercise.value = false // 关闭提示
  } catch (err) {
    console.error('获取新练习题失败:', err)
  }
}

// 新增：跳转到练习页面
const startExercise = (exerciseId) => {
  router.push({ name: 'ExerciseDetail', params: { id: exerciseId } })
}

// 新增：获取练习详情
const fetchExerciseDetail = async (exerciseId) => {
  try {
    const response = await request.get(`edu/exercises/${exerciseId}`)
    return response.data
  } catch (err) {
    console.error('获取练习详情失败:', err)
    throw err
  }
}

// 新增：获取练习题目
const fetchExerciseQuestions = async (exerciseId) => {
  try {
    const response = await request.get(`edu/exercises/${exerciseId}/questions`)
    return response.data
  } catch (err) {
    console.error('获取练习题目失败:', err)
    throw err
  }
}

// 新增：提交答案
const submitAnswers = async (exerciseId, answers) => {
  try {
    const response = await request.post(`edu/exercises/${exerciseId}/answers`, {
      studentId: localStorage.getItem('studentId'),
      answers: answers
    })
    return response.data
  } catch (err) {
    console.error('提交答案失败:', err)
    throw err
  }
}

// 获取状态标签和颜色
const getStatusInfo = (status) => {
  const statusMap = {
    'not_started': { label: '未开始', color: '#999' },
    'in_progress': { label: '进行中', color: '#1890ff' },
    'completed': { label: '已完成', color: '#52c41a' }
  }
  return statusMap[status] || { label: '未知', color: '#999' }
}

// 计算进度百分比
const getProgress = (completed, total) => {
  if (total === 0) return 0  // 新增：当总题目数为0时，返回0
  return Math.round((completed / total) * 100)
}

onMounted(() => {
  fetchExercises()
})
</script>

<template>
  <div class="user-exercises">
    <h2 class="page-title">我的练习</h2>

    <!-- 新练习提示 -->
    <div v-if="hasNewExercise" class="new-exercise-notice" @click="fetchNewExercises">
      <div class="notice-content">
        <span class="notice-icon">📢</span>
        <span class="notice-text">经过您的老师同意后，您的智能管家给您发布了新的练习</span>
        <span class="notice-action">点击查看</span>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载练习数据...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>

    <!-- 练习列表 -->
    <div v-else class="exercises-list">
      <div v-for="exercise in exercises" :key="exercise.id" class="exercise-card">
        <div class="exercise-header">
          <h3 class="exercise-title">{{ exercise.title }}</h3>
          <span class="exercise-course">{{ exercise.course }}</span>
        </div>
        
        <div class="exercise-progress">
          <div class="progress-info">
            <span>完成进度: {{ exercise.completedQuestions }}/{{ exercise.totalQuestions }}</span>
            <span v-if="exercise.score !== null">总成绩: {{ exercise.score }}分</span>
            <!-- 新增：显示总成绩 -->
            <!-- <span>总成绩: {{ exercise.totalScore || 0 }}</span> -->
          </div>
          <div class="progress-bar">
            <div 
              class="progress-inner" 
              :style="{ width: `${getProgress(exercise.completedQuestions, exercise.totalQuestions)}%` }"
            ></div>
          </div>
        </div>
        
        <div class="exercise-footer">
          <div class="exercise-info">
            <span class="status" :style="{ color: getStatusInfo(exercise.status).color }">
              {{ getStatusInfo(exercise.status).label }}
            </span>
            <span v-if="exercise.submissionTime" class="submission-time">
              提交时间: {{ exercise.submissionTime }}
            </span>
          </div>
          
          <button 
            class="action-btn" 
            :class="{ 'view-btn': exercise.status === 'completed' }"
            @click="startExercise(exercise.id)"
          >
            {{ exercise.status === 'completed' ? '查看详情' : (exercise.status === 'not_started' ? '开始练习' : '继续练习') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-exercises {
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

.loading-state,
.error-state {
  text-align: center;
  padding: 40px 0;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 16px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.exercises-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.exercise-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: transform 0.3s ease;
}

.exercise-card:hover {
  transform: translateY(-4px);
}

.exercise-header {
  margin-bottom: 16px;
}

.exercise-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.exercise-course {
  font-size: 14px;
  color: #666;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
}

.exercise-progress {
  margin-bottom: 16px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
  gap: 16px;
}

.progress-bar {
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.progress-inner {
  height: 100%;
  background: #1890ff;
  border-radius: 3px;
  transition: width 0.3s ease;
  min-width: 6px; /* 确保即使进度很小也能看到 */
}

.exercise-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.exercise-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status {
  font-size: 14px;
  font-weight: 500;
}

.submission-time {
  font-size: 13px;
  color: #999;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #1890ff;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #40a9ff;
}

.view-btn {
  background: #52c41a;
}

.view-btn:hover {
  background: #73d13d;
}

.new-exercise-notice {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.new-exercise-notice:hover {
  background: #bae7ff;
  border-color: #69c0ff;
}

.notice-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notice-icon {
  font-size: 20px;
}

.notice-text {
  flex: 1;
  color: #1890ff;
  font-size: 14px;
}

.notice-action {
  color: #1890ff;
  font-weight: 500;
  font-size: 14px;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .page-title {
    color: #e0e0e0;
  }

  .exercise-card {
    background: #2d2d2d;
  }

  .exercise-title {
    color: #e0e0e0;
  }

  .exercise-course {
    color: #aaa;
    background: #363636;
  }

  .progress-info {
    color: #aaa;
  }

  .progress-bar {
    background: #363636;
  }

  .exercise-footer {
    border-top-color: #404040;
  }

  .submission-time {
    color: #888;
  }

  .new-exercise-notice {
    background: #1a1a1a;
    border-color: #1890ff;
  }

  .new-exercise-notice:hover {
    background: #2a2a2a;
    border-color: #40a9ff;
  }

  .notice-text,
  .notice-action {
    color: #40a9ff;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .exercise-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .action-btn {
    width: 100%;
    text-align: center;
  }
}
</style> 
