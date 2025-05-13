<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import request from '@/utils/request'
const route = useRoute()
const courseId = route.params.id

// 课程详情数据
const courseDetail = ref({
  id: null,
  url: '',
  name: '',
  description: '',
  price: 0,
  teacherId: null,
  createTime: '',
  status: '',
  teacherName: '',
  teacherDescription: '',
  position: '',
  duration: '4小时', // 课程时长
  lessonCount: '36小时', // 课程小节数
  studentCount: '69355', // 在学人数
})

// 讲师信息
const teacher = ref({
  name: '',
  title: '前美团高级前端工程师',
  avatar: 'https://picsum.photos/100/100',
  description: '5年大厂前端经验，曾就职于掌阅科技，先前是早期的一批iReaderAPP开发者，后就职于美团网，3年教学经验，有Object-C、swift语言开发经验。'
})

// 课程大纲
const courseOutline = ref([
  {
    title: 'HTML',
    duration: '3:21:44',
    lessons: 36,
    status: '可试听'
  }
])

// 学习目标
const learningObjectives = [
  'Java语法基础',
  'Java面向对象编程',
]

// 获取课程详情
const fetchCourseDetail = async () => {
  try {
    const { data:response } = await request.get(`edu/courses/${courseId}`)

    courseDetail.value = {
      ...courseDetail.value,
      id: response.data.id,
      url: response.data.url,
      name: response.data.name,
      price: response.data.price,
      teacherName: response.data.teacherName,
      createTime: response.data.createTime,
      status: response.data.status
    }
  } catch (error) {
    console.error('获取课程详情失败:', 
      error.response ? 
      `状态码: ${error.response.status}，错误信息: ${error.response.data.message}` : 
      error.message
    )
  }
}

onMounted(() => {
  fetchCourseDetail()
})
</script>

<template>
  <div class="course-detail">
    <!-- 返回按钮 -->
    <div class="back-button">
      <router-link to="/home" class="back-link">
        ← 返回免费课主页
      </router-link>
    </div>

    <!-- 课程基本信息 -->
    <div class="course-header">
      <div class="course-info">
        <h1 class="course-title">{{ courseDetail.name }}</h1>
        <div class="course-stats">
          <span>课程小节: {{ courseDetail.lessonCount }}</span>
          <span>时长: {{ courseDetail.duration }}</span>
          <span>{{ courseDetail.studentCount }}人在学</span>
        </div>
      </div>
      <div class="course-cover">
        <img :src="courseDetail.url" :alt="courseDetail.name">
      </div>
    </div>

    <!-- 课程介绍 -->
    <div class="course-section">
      <h2 class="section-title">介绍</h2>
      <div class="course-description" v-html="courseDetail.summary"></div>
    </div>

    <!-- 学习目标 -->
    <div class="course-section">
      <h2 class="section-title">你将会学到的</h2>
      <ul class="learning-objectives">
        <li v-for="(objective, index) in learningObjectives" :key="index">
          <i class="check-icon">✓</i>
          {{ objective }}
        </li>
      </ul>
    </div>

   
    <!-- 讲师介绍 -->
    <div class="course-section">
      <h2 class="section-title">讲师介绍</h2>
      <div class="teacher-info">
        <div class="teacher-avatar">
          <img src="../../assets/aw.jpeg" :alt="teacher.name">
        </div>
        <div class="teacher-detail">
          <h3 class="teacher-name">{{ courseDetail.teacherName }}</h3>
          <p class="teacher-title">{{ courseDetail.teacherDescription }}</p>
          <p class="teacher-description">{{ courseDetail.position }}</p>
        </div>
      </div>
    </div>

    <!-- 课程权益 -->
    <div class="course-rights">
      <div class="rights-grid">
        <div class="right-item">
          <i class="right-icon">📁</i>
          <span>课件下载</span>
        </div>
        <div class="right-item">
          <i class="right-icon">📅</i>
          <span>定期公开课</span>
        </div>
        <div class="right-item">
          <i class="right-icon">💬</i>
          <span>学员交流</span>
        </div>
        <div class="right-item">
          <i class="right-icon">❓</i>
          <span>导师答疑</span>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="action-bar">
      <div class="price">告知:"现所有课程免费学习！！！！"</div>
      <button class="enroll-button"><router-link :to="`/courseStudy/${courseDetail.id}`">点击学习</router-link></button>
      <button class="preview-button">领取课件</button>
    </div>
  </div>
</template>

<style scoped>
.enroll-button * {
  color: white;
  text-decoration: none;

}
.course-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 5rem .5rem;
  color: #333;
}

.back-button {
  margin-bottom: 20px;
}

.back-link {
  color: #666;
  text-decoration: none;
  font-size: 16px;
}

.back-link:hover {
  color: #1890ff;
}

.course-header {
  display: flex;
  gap: 40px;
  margin-bottom: 40px;
  background: #f5f5f5;
  padding: 40px;
  border-radius: 12px;
}

.course-info {
  flex: 1;
}

.course-title {
  font-size: 32px;
  margin-bottom: 20px;
  color: #2c3e50;
}

.course-stats {
  display: flex;
  gap: 20px;
  color: #666;
}

.course-cover {
  width: 400px;
  height: 300px;
  overflow: hidden;
  border-radius: 8px;
}

.course-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-section {
  margin-bottom: 40px;
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #2c3e50;
  font-weight: 600;
}

.course-description {
  line-height: 1.8;
  color: #666;
}

.learning-objectives {
  list-style: none;
  padding: 0;
}

.learning-objectives li {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  color: #666;
}

.check-icon {
  color: #52c41a;
  margin-right: 10px;
}

.course-outline {
  border: 1px solid #eee;
  border-radius: 8px;
}

.chapter {
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.chapter:last-child {
  border-bottom: none;
}

.chapter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chapter-title {
  font-size: 18px;
  color: #2c3e50;
}

.chapter-info {
  display: flex;
  gap: 15px;
  color: #666;
  align-items: center;
}

.preview-badge {
  background: #ff4d4f;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.teacher-info {
  display: flex;
  gap: 20px;
}

.teacher-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
}

.teacher-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.teacher-detail {
  flex: 1;
}

.teacher-name {
  font-size: 20px;
  margin-bottom: 8px;
  color: #2c3e50;
}

.teacher-title {
  color: #666;
  margin-bottom: 12px;
}

.teacher-description {
  line-height: 1.8;
  color: #666;
}

.course-rights {
  margin-bottom: 80px;
}

.rights-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.right-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  text-align: center;
}

.right-icon {
  font-size: 24px;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 15px 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.price {
  font-size: 24px;
  color: #ff4d4f;
  font-weight: bold;
}

.enroll-button {
  padding: 12px 30px;
  background: #ff4d4f;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.enroll-button:hover {
  background: #ff7875;
}

.preview-button {
  padding: 12px 30px;
  background: #fff;
  color: #ff4d4f;
  border: 1px solid #ff4d4f;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.preview-button:hover {
  background: #fff1f0;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .course-header {
    flex-direction: column;
  }

  .course-cover {
    width: 100%;
    height: 250px;
  }

  .rights-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .course-title {
    font-size: 24px;
  }

  .course-stats {
    flex-direction: column;
    gap: 10px;
  }

  .teacher-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .action-bar {
    flex-direction: column;
    gap: 10px;
    padding: 15px;
  }

  .enroll-button,
  .preview-button {
    width: 100%;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .course-detail {
    background: #1a1a1a;
    color: #e0e0e0;
  }

  .course-header {
    background: #2d2d2d;
  }

  .course-section {
    background: #2d2d2d;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }

  .course-title,
  .section-title,
  .chapter-title,
  .teacher-name {
    color: #e0e0e0;
  }

  .course-description,
  .learning-objectives li,
  .chapter-info,
  .teacher-title,
  .teacher-description {
    color: #aaa;
  }

  .course-outline {
    border-color: #404040;
  }

  .chapter {
    border-bottom-color: #404040;
  }

  .right-item {
    background: #2d2d2d;
  }

  .action-bar {
    background: #2d2d2d;
  }
}
</style>
