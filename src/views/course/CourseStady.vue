<script setup>
import { ref, onMounted, shallowRef, markRaw } from 'vue';
import { useRoute } from 'vue-router';
import ExamPage from '@/views/course/videopage/ExamPage.vue';
import DynamicVideoPage from '@/views/course/videopage/VideoPage1.vue';
import request from '@/utils/request';

const route = useRoute();
const courseId = route.params.courseId; // 从路由参数获取课程ID

// 目录数据状态
const directoryItems = ref([]);
const loading = ref(true);
const collapsedItems = ref([]); // 存储被折叠的目录ID
const currentVideoComponent = shallowRef(markRaw(DynamicVideoPage));
const courseDetails = ref({});
const currentVideoUrl = ref('') || '';
const currentVideoTitle = ref('');

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
    const response = await request.get(`edu/courses/${courseId}`);
    courseDetails.value = response.data.data;
  } catch (error) {
    console.error('获取课程详情失败:', error);
  }
};
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
const handleDirectoryItemClick = async (chapterId) => {
  console.log('当前点击的章节ID:', chapterId);
  const detail = courseDetails.value.eduCoursesDetailsList?.find(
    d => d.coursesChapterId === chapterId
  );
  
  if (detail) {
    currentVideoUrl.value = detail.videoUrl;
    currentVideoTitle.value = detail.title || '';
    if (detail.isExam) {
      currentVideoComponent.value = markRaw(ExamPage);
    } else {
      currentVideoComponent.value = markRaw(DynamicVideoPage);
    }
  }
};

onMounted(() => {
  fetchDirectory();
  fetchCourseDetails();
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

</script>

<template>
  <div id="app" class="app-container">
    <div v-if="loading" class="loading">加载目录中...</div>
    
    <div class="left-container">
      <h2 class="video-title">{{ currentVideoTitle }}</h2>
      <component 
        :is="currentVideoComponent" 
        :videoUrl="currentVideoUrl"
        class="video-main-container">
      </component>
    </div>

    <div class="right-container">
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
  </div>
</template>

<style>
/* 修改全局布局 */
.app-container {
  margin-top: 5rem;
  display: flex;
  width: 100%;
  height: calc(100vh - 5rem);
}

/* 修改视频标题样式 */
.video-title {
  width: 100%;
  text-align: center;
  color: #2c3e50;
  font-size: 28px;
  font-weight: bold;
  padding: 15px;
  margin-bottom: 0;
}

.left-container {
  width: 80%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  height: 100%;
}

/* 修改后的视频容器样式 - 加长高度 */
.video-main-container {
  width: 100%;
  height: 90vh;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #f8f9fa;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding-top: 0;
}

/* 修改右侧容器样式 - 保持固定位置 */
.right-container {
  width: 20%;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 5rem);
  padding: 15px;
  background-color: #f8f9fa;
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
  position: fixed;
  right: 0;
  top: 5rem;
  overflow-y: auto;
}

.right-navbar {
  padding: 10px 15px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  border-bottom: 1px solid #eaeaea;
  margin-bottom: 10px;
}

.directory-container {
  padding: 0 10px;
}

.directory-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.directory-item, .sub-item {
  margin-bottom: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.item-title {
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.item-title:hover {
  background-color: #e9ecef;
}

.directory-item > .item-title {
  font-weight: 600;
  color: #2c3e50;
}

.sub-item > .item-title {
  color: #495057;
  padding-left: 30px;
}

.sub-item > .item-title:hover {
  background-color: #e9ecef;
  color: #2c3e50;
}

.sub-directory {
  list-style: none;
  padding-left: 15px;
  margin-top: 5px;
}

.fas {
  margin-right: 8px;
  color: #6c757d;
  transition: transform 0.2s ease;
}

.collapsed .fas {
  transform: rotate(90deg);
}
</style>
