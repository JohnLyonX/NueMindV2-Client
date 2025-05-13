<script setup>
import { ref,onMounted,shallowRef, markRaw } from 'vue';
import { useRoute } from 'vue-router';
import VideoPage1 from '@/views/course/videopage/VideoPage1.vue';
import VideoPage2 from '@/views/course/videopage/VideoPage2.vue';
import ExamPage from '@/views/course/videopage/ExamPage.vue';
import VideoPage3 from '@/views/course/videopage/VideoPage3.vue';
import VideoPage4 from '@/views/course/videopage/VideoPage4.vue';
import VideoPage5 from '@/views/course/videopage/VideoPage5.vue';
import VideoPage6 from '@/views/course/videopage/VideoPage6.vue';
import request from '@/utils/request'
const route = useRoute();
const courseId = route.params.courseId; // 从路由参数获取课程ID

// 目录数据状态
const directoryItems = ref([]);
const loading = ref(true);
const collapsedItems = ref([]); // 存储被折叠的目录ID
const currentVideoComponent = shallowRef(markRaw(VideoPage1));
const courseDetails = ref({})
const currentVideoUrl = ref('')|| ''
const buildTree = (items, currentCourseId) => {
  // 获取当前课程的所有章节
  const courseChapters = items.filter(item => item.coursesId == currentCourseId);
// 递归构建子章节树
const buildChildren = (parentId) => {
    return courseChapters
      .filter(c => c.parentId === parentId)
      .map(chapter => ({
        id: chapter.id,
        title: chapter.title,
        children: buildChildren(chapter.id)
      }));
  };
   // 获取顶层章节（parentId为0）
   const topLevels = courseChapters.filter(c => c.parentId === 0);
  
  // 为每个顶层章节构建完整树结构
  return topLevels.flatMap(root => buildChildren(root.id));
  
  
};
const fetchCourseDetails = async () => {
  try {
    const response = await request.get(`edu/courses/${courseId}`)
    courseDetails.value = response.data.data
  } catch (error) {
    console.error('获取课程详情失败:', error)
  }
}
const componentMap = {
  // Java课程
  8: markRaw(VideoPage1),  // GUI编程 -> 编写第一个Java程序
  9: markRaw(VideoPage2), // GUI编程 -> 实现Java类继承
  10: markRaw(VideoPage3), // Java章节二 -> GUI布局管理
  11: markRaw(VideoPage4), // Java章节二 -> Swing组件编程
  14: markRaw(ExamPage),
  // C语言课程
  12: markRaw(VideoPage5),  // C语言章节一 -> C语言介绍
  13: markRaw(VideoPage6)  // C语言章节二 -> C语言基础语法


};
console.log(componentMap);

// 获取目录数据
const fetchDirectory = async () => {
  try {
    const response = await request.get('edu/coursesChapter/list');
    // 传入当前课程ID进行过滤
    directoryItems.value = buildTree(response.data.data, courseId);
    console.log(`${courseId}目录数据:`, directoryItems.value);
    
  } catch (error) {
    console.error('获取目录失败:', error);
  } finally {
    loading.value = false;
  }
};


// 处理目录项点击
const handleDirectoryItemClick = (chapterId) => {
  console.log('当前点击的章节ID:', chapterId);
  const detail = courseDetails.value.eduCoursesDetailsList?.find(
    d => d.coursesChapterId === chapterId
  )
  console.log('课程详情列表:', courseDetails.value.eduCoursesDetailsList); 
  if (detail) {
    currentVideoUrl.value = detail.videoUrl
    currentVideoComponent.value = componentMap[chapterId] || markRaw(VideoPage1)
  }

};

onMounted(() => {
  fetchDirectory();
  fetchCourseDetails()
});

// 折叠切换方法
const toggleCollapse = (id) => {
  const index = collapsedItems.value.indexOf(id);
  if (index === -1) {
    collapsedItems.value.push(id);
  } else {
    collapsedItems.value.splice(index, 1);
  }
};
// 拖动功能相关代码
const startResize = (e) => {
  const rightContainer = e.target.parentElement;
  const startX = e.clientX;
  const startWidth = rightContainer.offsetWidth;

  const onMouseMove = (e) => {
    const newWidth = startWidth - (e.clientX - startX);
    rightContainer.style.width = `${newWidth}px`;
  };

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};
</script>

<template>
  <div id="app" class="app-container">
    <div v-if="loading" class="loading">加载目录中...</div>
    
    <div class="right-container">
      <div class="resize-handle" @mousedown="startResize"></div>
      <div class="right-navbar">
        <div class="module-item">目录</div>
      </div>
      
      <div class="directory-container">
    <!-- 目录列表容器，用于展示目录项 -->
    <ul v-if="!loading" class="directory-list">
      <li v-for="section in directoryItems" :key="section.id" class="directory-item">
        <div class="item-title" @click="toggleCollapse(section.id)">
          <i class="fas fa-folder"></i> {{ section.title }}
        </div>
        
        <ul v-if="section.children && !collapsedItems.includes(section.id)" class="sub-directory">
          <li v-for="detail in section.children" 
              :key="detail.id" 
              class="sub-item"
              @click="handleDirectoryItemClick(detail.id)">
            <div class="item-title">
              {{ detail.title }}
            </div>
          </li>
        </ul>
      </li>
    </ul>
</div>
    </div>

    <component :is="currentVideoComponent":videoUrl="currentVideoUrl" class="left-side"></component>
  </div>
</template>
<style>

/* 全局布局 */
.app-container {
  margin-top: 5rem;
  display: flex;
  flex-direction: row-reverse;
  background-image: url(@/assets/coursestadys/灰色背景-001.png);
}

/* 左侧样式 */
.left-side {
  width: 95%;
  padding: 20px;
  box-sizing: border-box;
  border-right: 2px dashed #333;
  border-image: linear-gradient(
    45deg,
    transparent,
    rgba(0,0,0,0.3),
    transparent
  ) 1;
  border-right-style: dashed;
}

/* 视频页面的特定样式 */
.video-page {
  background-color: #eef7ffe0; /* 浅蓝色背景 */
  border-right-color: #007bff; /* 蓝色边框 */
  border-radius: 2%;
}

.video-player {
  width: 100%;
  margin-bottom: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.text-intro {
  line-height: 1.6;
  color: #343a40;
}

/* 右侧整体样式 */
.right-container {
  width: 25%;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-left: 8px;
  min-width: 18px;
  background-color: #f8f9fa;
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
  position: fixed;
}

/* 右侧顶部导航栏样式 */
.right-navbar {
  height: 40px;
  display: flex;
  justify-content: space-around;
  padding: 3px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.module-item {
  height: 25px;
  line-height: 25px;
  padding: 0 15px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s, color 0.3s;
  white-space: nowrap;
  border-radius: 4px;
  font-weight: bold;
  color: #333;
}

.module-item:hover,
.module-item.active {
  background-color: #e9ecef;
  transform: scale(1.05);
  color: #007bff;
}

/* 添加动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.module-item {
  animation: fadeIn 0.5s ease-in-out;
}

/* 右侧目录区样式 */
.directory-container {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.directory-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.directory-item {
  margin-bottom: 10px;
}

.item-title {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
}

.item-title i {
  margin-right: 8px;
  color: #007bff;
}

.item-title:hover {
  background-color: #f8f9fa;
}

.sub-directory {
  list-style: none;
  padding-left: 20px;
  margin: 5px 0 0 0;
}

.sub-item {
  padding: 6px 10px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.sub-item:hover {
  background-color: #f8f9fa;
}

/* 滚动条样式优化 */
.directory-container::-webkit-scrollbar {
  width: 8px;
}

.directory-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.directory-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.directory-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* 拖动区域样式 */
.resize-handle {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: col-resize;
  background-color: #ccc;
}
/* 添加加载状态样式 */
.loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 4px;
  z-index: 1000;
}
</style>
