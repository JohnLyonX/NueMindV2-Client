<template>
  <div class="file-container">
    <!-- 文件下载 -->
    <div class="header-section">
      <h2 v-if="examTitle">{{ examTitle }}</h2>
      <p v-if="courseName" class="course-name">所属课程: {{ courseName }}</p>
      <p v-if="subPath && !correctPath" class="status-waiting">
        <i class="status-icon"></i> 等待老师批改中...
      </p>
    </div>
    <div class="download-section">
      <h3>文件列表</h3>
      <ul class="file-list">
        <li
            v-for="file in fileList"
            :key="file.id"
            class="file-item"
        >
          <span class="file-name">{{ file.name }}</span>
          <img src="@/assets/coursestadys/exam_img.png" class="exam-image">
          <button
              @click="handleDownload(file.url)"
              class="download-btn"
          >
            下载
          </button>
        </li>
      </ul>
    </div>
    <!-- 文件上传 -->
    <div class="upload-section">
      <h3>上传试卷</h3>
      <div class="upload-box">
        <input
            type="file"
            @change="handleFileSelect"
            ref="fileInput"
            class="file-input"
        >
        <button
            @click="handleUpload"
            :disabled="!selectedFile"
            class="upload-btn"
        >
          {{ uploadStatus || '上传试卷' }}
        </button>
        <div v-if="uploadProgress > 0" class="progress-bar">
          <div
              class="progress"
              :style="{ width: uploadProgress + '%' }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import request from '@/utils/request';
import { saveAs } from 'file-saver';


// 上传相关状态
const route = useRoute();
// 路由参数
const examId = ref(route.params.examId);
const fileUrl = ref(route.params.fileUrl);
const correctPath = ref(route.params.correctPath);
const subPath = ref(route.params.subPath);
const uploadState = ref({
  selectedFile: null,
  status: '',
  progress: 0
});
const examTitle = ref(route.query.title);
const courseName = ref(route.query.courseName);
// 文件列表
const fileList = ref([]);
const selectedFile = ref(null);
const uploadStatus = ref('');
const uploadProgress = ref(0);
const props = defineProps({
  examId: String,
  fileUrl: String,
  correctPath: String,
  subPath: String
});
onMounted(() => {
  if (props.fileUrl) {
    fileList.value.push({
      id: 1,
      name: '考试文件',
      url: props.fileUrl,
      type: 'exam'
    });
  }
  if (props.subPath) {
    fileList.value.push({
      id: 2,
      name: `${getFileName(props.subPath)}`,
      url: props.subPath,
      type: 'submission'
    });
  }
  if (props.correctPath) {
    fileList.value.push({
      id: 3,
      name: '批改完成',
      url: props.correctPath,
      type: 'answer'
    });
  }
  document.title = examTitle.value || '考试页面';
});

// 文件下载处理
const handleDownload = async (url) => {
  try {
    // const fullUrl = url.startsWith('https') ? url : `http://localhost/dev-api${url}`;
    const fullUrl = url.startsWith('https') ? url : `http://localhost/prod-api${url}`;
    // const fullUrl = url.startsWith('https') ? url :   `http://nuemind.nuex.ltd/prod-api${url}`;
    const response = await request.get(fullUrl, {
      responseType: 'blob'
    });
    saveAs(response.data, url.split('/').pop());
  } catch (error) {
    console.error('下载文件失败:', error);
    alert('下载文件失败，请重试。');
  }
};
// 获取考试列表
const fetchExams = async () => {
  try {
    const examsResp = await request.get('edu/coursesExam/list');
    const submissionsResp = await request.get('edu/examFilelib/list', {
      params: { studentId: localStorage.getItem('studentId') }
    });
    if (examsResp.data.code === 200 && submissionsResp.data.code === 200) {
      exams.value = examsResp.data.rows.map(exam => {
        // Find matching submission
        const submission = submissionsResp.data.rows.find(
          s => s.coursesExamName === exam.name
        );
        return {
          id: exam.id,
          title: exam.name,
          course: exam.coursesName || '未指定课程',
          selectedFile: null,
          uploadStatus: '',
          uploadProgress: 0,
          examTime: '2023-05-15 14:30',
          duration: 90,
          totalScore: 100,
          score: submission?.score || null,
          status: submission
            ? (submission.correctPath ? 'completed' : 'waiting_for_review')
            : 'not_started',
          analysis: submission?.correctPath ? {
            correct: 17,
            wrong: 3,
            partial: 0,
            accuracy: 85
          } : null,
          fileUrl: exam.fileUrl,
          // Add submission data
          submission: submission || null
        };
      });
    }
    loading.value = false
    window.scrollTo(0, 0)
  } catch (err) {
    error.value = '获取考试数据失败，请稍后重试'
    loading.value = false
    console.error('获取考试数据失败:', err)
  }
}
const startExam = (exam) => {
  router.push({
    name: 'ExamPage',
    params: { examId: exam.id },

  });}

// 获取文件名
const getFileName = (path) => {
  return path.split('/').pop();
};

// 显示文件输入框
const showFileInput = (exam) => {
  exam.selectedFile = null;
  const fileInput = document.querySelector(`input[type="file"][data-exam-id="${exam.id}"]`);
  if (fileInput) {
    fileInput.value = '';
    fileInput.click();
  }
};

// 重置文件输入
const resetFileInput = () => {
  selectedFile.value = null;
  uploadStatus.value = '';
  uploadProgress.value = 0;
  if (fileInput.value) fileInput.value.value = '';
};
// 选择文件
const handleFileSelect = (e) => {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      alert('文件大小不能超过10MB');
      selectedFile.value = null;
      e.target.value = '';
      return;
    }
    selectedFile.value = file;
    uploadStatus.value = '准备上传：' + file.name;
  }
};

// 执行上传
const handleUpload = async () => {
  if (!selectedFile.value) return alert('请先选择文件');

  const formData = new FormData();
  formData.append('file', selectedFile.value);
  formData.append('examId', examId.value);

  try {
    // 1. 文件上传
    const uploadResp = await request.post('common/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      onUploadProgress: progressEvent => {
        uploadProgress.value = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
      }
    });

    // 处理上传失败
    if (uploadResp.data.code !== 200) {
      throw new Error(uploadResp.data.msg || '上传失败');
    }

    // 2. 更新数据库记录
    const updateData = {

      studentId: localStorage.getItem('studentId'),
      name:localStorage.getItem('name'),
      examId: examId.value,
      subPath: uploadResp.data.fileName,
      coursesExamName: examTitle.value || '考试页面',
      coursesName: courseName.value || '未指定课程'
    };

    const updateResp = await request.post('edu/examFilelib', updateData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });

    // 处理更新失败
    if (updateResp.data.code !== 200) {
      throw new Error('数据库更新失败: ' + updateResp.data.msg);
    }
    alert('上传试卷成功!');
    window.location.reload();
  } catch (error) {
    console.error('上传全过程失败:', error);
    alert(`上传失败: ${error.message}`);
  } finally {
    selectedFile.value = null;
    uploadProgress.value = 0;
  }
};


// 获取状态标签和颜色
const getStatusLabel = (status) => {
  const statusMap = {
    'not_started': { label: '未开始', color: '#999' },
    'in_progress': { label: '进行中', color: '#1890ff' },
    'completed': { label: '已完成', color: '#52c41a' },
    'waiting_for_review': { label: '等待老师批改', color: '#faad14' }
  }
  return statusMap[status] || { label: '未知', color: '#999' }
}

// 获取按钮状态
const getButtonStatus = (exam) => {
  if (!exam.submission) {
    return { status: 0, label: '开始考试' };
  } else if (exam.submission && !exam.submission.correctPath) {
    return { status: 1, label: '等待老师批改' };
  } else {
    return {
      status: 2,
      label: '查看分析',
      action: () => handleDownload(exam.submission.correctPath)
    };
  }
}


</script>

<style scoped>
.file-container {
  max-width: 600px;
  height: 100vh;
  margin: 2rem auto;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.upload-section, .download-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

}

h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
}

.file-input {
  display: block;
  margin: 1rem 0;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
}

.upload-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.upload-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.upload-btn:hover:not(:disabled) {
  background: #2980b9;
}

.progress-bar {
  height: 8px;
  background: #eee;
  border-radius: 4px;
  margin-top: 1rem;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: #27ae60;
  transition: width 0.3s ease;
}

.file-list {
  list-style: none;
  padding: 0;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem;
  margin: 0.5rem 0;
  background: #f8f9fa;
  border-radius: 4px;
}

.file-name {
  flex-grow: 1;
  margin-right: 1rem;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.download-btn {
  background: #2ecc71;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.download-btn:hover {
  background: #27ae60;
}
h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-align: center;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #eee;
}
.status-waiting {
  color: #faad14;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
}

.status-icon {
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: #faad14;
  border-radius: 50%;
  margin-right: 8px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.exam-image {
  width: 30px;
  margin: 0 10px;
  height: auto;
  border-radius: 4px;
  object-fit: cover;
}
</style>
