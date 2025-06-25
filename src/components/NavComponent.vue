<template>
  <nav :class="{ 'nav-background': isScrolled }" class="nav-container">
    <div class="logo">
      <RouterLink to="/home" @click.prevent="handleNavClick('/home')">NueMind</RouterLink>
    </div>
    <div class="user">
      <RouterLink to="/profile" @click.prevent="handleNavClick('/profile')">
                <svg t="1745513999948" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2608" width="45" height="45"><path d="M512 938.667C276.352 938.667 85.333 747.648 85.333 512S276.352 85.333 512 85.333 938.667 276.352 938.667 512 747.648 938.667 512 938.667zM299.221 778.923A339.883 339.883 0 0 0 512 853.333a340.053 340.053 0 0 0 220.459-80.725 297.77 297.77 0 0 0-213.632-89.941 297.856 297.856 0 0 0-219.606 96.256z m-59.605-61.27a382.933 382.933 0 0 1 279.21-120.32 382.805 382.805 0 0 1 271.446 112.384 341.333 341.333 0 1 0-550.656 7.979zM512 554.667a170.667 170.667 0 1 1 0-341.334 170.667 170.667 0 0 1 0 341.334z m0-85.334a85.333 85.333 0 1 0 0-170.666 85.333 85.333 0 0 0 0 170.666z"  p-id="2609"></path></svg>
      </RouterLink>
      <!-- 添加条件渲染 -->
      <button v-if="isLoggedIn" @click="handleLogout" class="logout-btn">
        <svg t="1745514315854" class="icon" viewBox="0 0 1049 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2374" width="30" height="30"><path d="M463.278798 1024H63.252087c-34.190317 0-63.252087-29.06177-63.252087-63.252087V63.252087C0 29.06177 27.352254 0 63.252087 0h400.026711c34.190317 0 63.252087 29.06177 63.252087 63.252087s-27.352254 63.252087-63.252087 63.252087H124.794658v770.991652h338.48414c34.190317 0 63.252087 29.06177 63.252087 63.252087s-29.06177 63.252087-63.252087 63.252087z" p-id="2375"></path><path d="M1032.547579 471.826377L704.320534 136.761269c-35.899833-37.609349-99.15192-11.966611-99.15192 41.02838V256.427379c0 32.480801-25.642738 58.123539-58.123539 58.123539H278.651085c-32.480801 0-58.123539 25.642738-58.123539 58.123539v278.651086c0 32.480801 25.642738 58.123539 58.123539 58.123539H547.045075c32.480801 0 58.123539 25.642738 58.123539 58.123539v78.63773c0 51.285476 63.252087 76.928214 99.15192 41.02838l328.227045-333.355592c22.223706-23.933222 22.223706-59.833055 0-82.056762z" p-id="2376"></path></svg>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { watch } from 'vue'; // 新增导入语句

const router = useRouter();

// 将登录状态改为响应式变量
const isLoggedIn = ref(false);

// 处理导航点击
const handleNavClick = (path) => {
  if (!isLoggedIn.value) {
    ElMessage.error('请先登录'); // 使用Element消息提示
    router.push('/login');
  } else {
    router.push(path);
  }
};

// 处理退出
const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('name'); // 清除 token
  localStorage.removeItem('avatarUrl');
  localStorage.removeItem('stduentId');
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
  isLoggedIn.value = false;
  router.push('/login');
};

const isScrolled = ref(false);
const handleScroll = () => {
  isScrolled.value = window.scrollY > 30;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  // 初始化登录状态
  isLoggedIn.value = !!localStorage.getItem('token');
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

// 在 onMounted 和 onUnmounted 后添加路由监听
watch(
  () => router.currentRoute.value.path,
  () => {
    // 每次路由变化时重新检查登录状态
    isLoggedIn.value = !!localStorage.getItem('token');
  }
);
</script>

<style scoped>
.nav-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 1rem 0;
  background-color: rgb(6, 224, 166);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.3s ease;
  z-index: 1000;
}



/* 滚动超过30px时的毛玻璃效果 */
.nav-background {
  background: rgba(216, 216, 216, 0.3);
  backdrop-filter: blur(10px);

}

.nav-background * {
  color: rgb(12, 192, 144);
  fill: rgb(12, 192, 144);

}

.logo {
  font-size: 2rem;
  font-weight: bold;
  margin-left: 5rem;
}

.user {
  font-size: 1.2rem;
  margin-right: 4rem;
}

* {
  color: white;
  text-decoration: none;
}

.logout-btn {
  margin-left: 20px;
  background: none;
  border: 2px solid rgba(0, 0, 0, 0);
}

.icon{
  fill: white;
}

@media (max-width: 768px) {
  .nav-container {
    padding: 1rem;
  }
  .logo {
    margin-left: 0;
  }
  .user {
    margin-right: 0;
  }
}
</style>
