<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()


// 用户信息
const userInfo = ref({
  avatar: localStorage.getItem('avatarUrl') || '/src/assets/aw.jpeg',
  name: localStorage.getItem('name') || '  ', // 添加默认值"用户"
  role: '学生'
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
  // {
  //   key: 'exercises',
  //   label: '我的练习',
  //   icon: '✏️'
  // },
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
</script>

<template>
  <div class="profile-container">
    <!-- 左侧导航栏 -->
    <div class="nav-sidebar">
      <!-- 用户信息区域 -->
      <div class="user-info">
        <div class="avatar-wrapper">
          <img :src="userInfo.avatar" :alt="userInfo.name" class="avatar">
        </div>
        <h2 class="username">{{ userInfo.name }}</h2>
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
