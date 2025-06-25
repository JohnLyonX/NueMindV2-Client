<script setup>
import { ref, onMounted,onUnmounted,watchEffect } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProfileStore } from '@/store/profileStore'
import { storageAvatar } from '@/utils/storageAvatar'
const profileStore = useProfileStore()
const router = useRouter()
const route = useRoute()

const loading = ref(true)
const userInfo = ref({
  avatar: '',
  name: '',
  role: '学生'
})
// 用户信息
watchEffect(() => {
  userInfo.value = {
    avatar: storageAvatar.getAvatar(),
    name: profileStore.userProfile.basicInfo?.name,
    role: '学生'
  }
})
// 导航菜单配置
const navMenus = [
  {
    key: 'profile',
    label: '个人档案',
    icon: '👤'
  },
  {
    key: 'courses',
    label: '我的课程',
    icon: '📚'
  },
  {
    key: 'exercises',
    label: '我的练习',
    icon: '✏️'
  },
  {
    key: 'exams',
    label: '我的考试',
    icon: '📊'
  },
  // {
  //   key: 'assistant',
  //   label: '我的管家',
  //   icon: '👨‍💼'
  // },
  {
    key: 'chat',
    label: '我的管家',
    icon: '💬'
  }
]

// 当前选中的菜单
const currentMenu = ref(route.name || 'profile')

// 处理菜单点击
const handleMenuClick = (key) => {
  currentMenu.value = key
  router.push({ name: key })
}
onMounted(async () => {
  console.log('开始加载用户数据')
  try {
    await profileStore.fetchData()
    console.log('用户数据加载完成', profileStore.userProfile)
    loading.value = false
  } catch (err) {
    console.error('加载失败:', err)
    loading.value = false
  }
})
</script>

<template>
  <div v-if="loading" class="loading">
    <div class="loading-spinner"></div>
    <span>加载用户信息...</span>
  </div>
  <div v-else class="profile-container">
    <!-- 左侧导航栏 -->
    <div class="nav-sidebar">
      <!-- 用户信息区域 -->
      <div class="user-info">
        <div class="avatar-wrapper">
          <img v-if="userInfo.avatar" 
              :src="userInfo.avatar" 
              :alt="userInfo.name"
              class="avatar"
              @error="handleImageError">
          <div v-else class="avatar-placeholder"></div>
        </div>
        <h2 class="username">
          <template v-if="userInfo.name">{{ userInfo.name }}</template>
          <span v-else class="placeholder">加载用户名...</span>
        </h2>
        <p class="user-role">{{ userInfo.role }}</p>
      </div>

      <!-- 导航菜单 -->
      <nav class="nav-menu">
        <div
          v-for="menu in navMenus"
          :key="menu.key"
          class="nav-item"
          :class="{ active: currentMenu === menu.key }"
          @click="handleMenuClick(menu.key)"
        >
          <span class="nav-icon">{{ menu.icon }}</span>
          <span class="nav-label">{{ menu.label }}</span>
        </div>
      </nav>
    </div>

    <!-- 右侧内容区域 -->
    <div class="content-area">
      <router-view></router-view>
    </div>
  </div>
</template>

<style scoped>
.loading-spinner {
  border: 3px solid rgba(0,0,0,0.1);
  border-radius: 50%;
  border-top-color: #1890ff;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
  display: inline-block;
  margin-right: 8px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.placeholder {
  color: #999;
  font-style: italic;
}

.profile-container {
    padding: 5rem .5rem;
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.nav-sidebar {

  width: 240px;
  background-color: #fff;
  box-shadow: 2px 0 8px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  position: fixed;
  padding: 2rem .5rem;

  left: 0;
  top: 4.5rem;
  bottom: 0;
  z-index: 100;
}

.user-info {
  padding: 0 20px;
  text-align: center;
  margin-bottom: 32px;
}

.avatar-wrapper {
  width: 100px;
  height: 100px;
  margin: 0 auto 16px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #e8e8e8;
  padding: 2px;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}
.avatar-placeholder {
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

.username {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.user-role {
  font-size: 14px;
  color: #666;
}

.nav-menu {
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background-color: #f0f0f0;
}

.nav-item.active {
  background-color: #e6f7ff;
  color: #1890ff;
  border-right: 3px solid #1890ff;
}

.nav-icon {
  margin-right: 12px;
  font-size: 18px;
}

.nav-label {
  font-size: 15px;
}

.content-area {
    padding: 1rem .5rem;
  flex: 1;
  margin-left: 240px;
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .profile-container {
    background-color: #1a1a1a;
  }

  .nav-sidebar {
    background-color: #2d2d2d;
    box-shadow: 2px 0 8px rgba(0,0,0,0.2);
  }

  .username {
    color: #e0e0e0;
  }

  .user-role {
    color: #aaa;
  }

  .nav-item:hover {
    background-color: #363636;
  }

  .nav-item.active {
    background-color: #11263c;
    color: #1890ff;
  }

  .content-area {
    background-color: #1a1a1a;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-sidebar {
    width: 200px;
  }

  .content-area {
    margin-left: 200px;
  }

  .avatar-wrapper {
    width: 80px;
    height: 80px;
  }

  .username {
    font-size: 16px;
  }

  .nav-item {
    padding: 10px 16px;
  }
}

@media (max-width: 576px) {
  .nav-sidebar {
    width: 64px;
    padding: 16px 0;
  }

  .content-area {
    margin-left: 64px;
  }

  .user-info {
    padding: 0 8px;
  }

  .avatar-wrapper {
    width: 40px;
    height: 40px;
    margin-bottom: 8px;
  }

  .username,
  .user-role {
    display: none;
  }

  .nav-label {
    display: none;
  }

  .nav-icon {
    margin-right: 0;
    font-size: 20px;
  }

  .nav-item {
    padding: 16px 0;
    justify-content: center;
  }
}
</style>
