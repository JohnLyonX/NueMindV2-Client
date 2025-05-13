<script setup>
import {ref, onMounted} from 'vue'
import {useRouter} from 'vue-router'
import request from '@/utils/request'
const router = useRouter()
const courses = ref([])
const loading = ref(true)
const error = ref(null)

// 获取用户课程列表
const fetchCourses = async () => {
  loading.value = true
  error.value = null

  try {
    // 实际项目中应该从API获取数据
    const response = await request.get(`edu/courses/list`)
    
    courses.value = (response.data.rows || []).filter(course => course.status === 1).map(course => ({
      id: course.id,
      name: course.name,
      teacher: course.teacherName || '未知教师',
      url: course.url,
      progress: course.progress || 0,
      status: course.status 
    }))
  } catch (err) {
    error.value = '获取课程数据失败，请稍后重试'
    console.error('获取课程数据失败:', err)
  } finally {
    loading.value = false
    window.scrollTo(0, 0) // 新增：数据加载完成后滚动到顶部
  }
}

// 继续学习课程
const continueLearning = (courseId) => {
  router.push(`/course/${courseId}`)
}

// 获取状态标签和颜色
const getStatusInfo = (status) => {
  const statusMap = {
    0: {label: '未开始', color: '#999'},
    1: {label: '学习中', color: '#1890ff'},
    2: {label: '已完成', color: '#52c41a'}
  }
  return statusMap[status] || {label: '未知', color: '#999'}
}

onMounted(() => {
  fetchCourses()
})
</script>

<template>
  <div class="user-courses">
    <h2 class="page-title">我的课程</h2>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载课程数据...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>

    <!-- 课程列表 -->
    <div v-else class="courses-grid">
      <div v-for="course in courses" :key="course.id" class="course-card">
        <div class="course-image">
          <img :src="course.url" :alt="course.name">
          <div class="course-progress">
            <div class="progress-bar">
              <div class="progress-inner" :style="{ width: `${course.progress}%` }"></div>
            </div>
            <span class="progress-text">{{ course.progress }}%</span>
          </div>
        </div>
        <div class="course-content">
          <h3 class="course-title">{{ course.name }}</h3>
          <div class="course-info">
            <span class="teacher">{{ course.teacher }}</span>
            <span class="status" :style="{ color: getStatusInfo(course.status).color }">
              {{ getStatusInfo(course.status).label }}
            </span>
          </div>
          <div class="course-footer">
            <span class="last-study" v-if="course.lastStudyTime">
              上次学习: {{ course.lastStudyTime }}
            </span>
            <button
                class="continue-btn"
                :class="{ disabled: course.status === 2 }"
                @click="continueLearning(course.id)"
            >
              {{ course.status === 2 ? '查看课程' : '继续学习' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-courses {
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.course-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.course-card:hover {
  transform: translateY(-4px);
}

.course-image {
  position: relative;
  height: 160px;
}

.course-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.progress-inner {
  height: 100%;
  background: #1890ff;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  color: #fff;
  font-size: 12px;
  min-width: 40px;
  text-align: right;
}

.course-content {
  padding: 16px;
}

.course-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.course-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.teacher {
  color: #666;
  font-size: 14px;
}

.status {
  font-size: 14px;
  font-weight: 500;
}

.course-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.last-study {
  color: #666;
  font-size: 13px;
}

.continue-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  background: #1890ff;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.continue-btn:hover {
  background: #40a9ff;
}

.continue-btn.disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .page-title {
    color: #e0e0e0;
  }

  .course-card {
    background: #2d2d2d;
  }

  .course-title {
    color: #e0e0e0;
  }

  .teacher,
  .last-study {
    color: #aaa;
  }

  .course-footer {
    border-top-color: #404040;
  }

  .continue-btn.disabled {
    background: #404040;
    color: #aaa;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .courses-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }

  .course-image {
    height: 140px;
  }
}

@media (max-width: 576px) {
  .courses-grid {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 20px;
  }
}
</style>
