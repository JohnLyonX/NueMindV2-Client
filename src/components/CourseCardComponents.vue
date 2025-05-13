<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps({
  id: {
    type: [Number, String],
    required: true
  },
  coverImage: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    default: 0
  }
})

// 格式化价格为人民币形式
const formatPrice = (price) => {
  return `¥${price.toFixed(2)}`
}

// 跳转到课程详情页
const goToCourseDetail = (id) => {
  try {
    console.log('正在跳转到课程详情页，课程ID:', id)
    router.push({
      name: 'courseDetail',
      params: { id: String(id) }
    }).catch(err => {
      console.error('路由跳转失败:', err)
    })
  } catch (error) {
    console.error('跳转处理失败:', error)
  }
}
</script>

<template>
  <div class="course-card" @click="goToCourseDetail(id)">
    <div class="course-image">
      <img :src="coverImage" :alt="name">
    </div>
    <div class="course-content">
      <h3 class="course-title">{{ name }}</h3>
      <p class="course-description" v-html="description"></p>
      <div class="course-footer">
        <span class="course-price">{{ formatPrice(price) }}</span>
        <span class="course-link">了解更多</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.course-card {
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  height: 100%;
  background-color: #ffffff;
  cursor: pointer;
}

.course-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.12);
}

.course-image {
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.course-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.course-card:hover .course-image img {
  transform: scale(1.05);
}

.course-content {
  padding: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.course-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
}

.course-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
  line-height: 1.5;
  flex-grow: 1;
}

.course-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.course-price {
  font-size: 18px;
  font-weight: 700;
  color: #e74c3c;
}

.course-link {
  color: #2196f3;
  font-size: 14px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .course-image {
    height: 160px;
  }

  .course-content {
    padding: 15px;
  }

  .course-title {
    font-size: 16px;
  }

  .course-price {
    font-size: 16px;
  }
}

@media (max-width: 576px) {
  .course-image {
    height: 140px;
  }

  .course-content {
    padding: 12px;
  }

  .course-price {
    font-size: 15px;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .course-card {
    background-color: #2d2d2d;
  }

  .course-title {
    color: #e0e0e0;
  }

  .course-description {
    color: #aaaaaa;
  }

  .course-link {
    color: #64b5f6;
  }
}
</style>
