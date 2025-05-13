<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import { saveAs } from 'file-saver'

const router = useRouter()
const exams = ref([])
const loading = ref(true)
const error = ref(null)
const selectedFile = ref(null)
const uploadStatus = ref('')
const uploadProgress = ref(0)
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
          score: submission?.score || '0',
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
  const buttonStatus = getButtonStatus(exam);
  router.push({
    name: 'ExamPage',
    params: {
      examId: exam.id
    },
    query: {
      ...(buttonStatus.status === 2 ? {
        correctPath: exam.submission?.correctPath,
        subPath: exam.submission?.subPath
      }: buttonStatus.status === 1 ? {
        subPath: exam.submission?.subPath,
        fileUrl: exam.fileUrl
      } : {
        fileUrl: exam.fileUrl
      }),
      title: exam.title,
      courseName: exam.course || null ,

    }
  });
}
// 下载文件
const handleDownload = async (url) => {
  try {
    const fullUrl = url.startsWith('http') ? url : `http://localhost/dev-api/${url}`;
    // const fullUrl = url.startsWith('http') ? url : `http://localhost/prod-api/${url}`;
    // const fullUrl = url.startsWith('http') ? url : `http://nuemind.nuex.ltd/prod-api/${url}`;
    const response = await request.get(fullUrl, {
      responseType: 'blob'
    });
    saveAs(response.data, url.split('/').pop());
  } catch (error) {
    console.error('下载文件失败:', error);
    alert('下载文件失败，请重试。');
  }
};
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
const resetFileInput = (exam) => {
  exam.selectedFile = null;
  exam.uploadStatus = '';
  exam.uploadProgress = 0;
  const fileInput = document.querySelector(`input[type="file"][data-exam-id="${exam.id}"]`);
  if (fileInput) fileInput.value = '';
};// 选择文件
const handleFileSelect = (e, exam) => {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      alert('文件大小不能超过10MB');
      resetFileInput(exam);
      return;
    }
    exam.selectedFile = file;
    exam.uploadStatus = '准备上传：' + file.name;
  }
};

// 执行上传
const handleUpload = async (exam) => {
  if (!exam.selectedFile) return alert('请先选择文件');
  const formData = new FormData();
  formData.append('file', exam.selectedFile);
  try {
    const uploadResp = await request.post('common/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: progressEvent => {
        exam.uploadProgress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
      }
    });

    if (uploadResp.data.code !== 200) {
      throw new Error(uploadResp.data.msg || '上传失败');
    }

    const filePath = uploadResp.data.fileName;
    console.log(filePath);
    const updateData = {
      studentId: localStorage.getItem('studentId'),
      name: localStorage.getItem('name'),
      coursesExamName: exam.title,
      subPath: filePath
    };
    if (exam.submission?.id) {
      updateData.id = exam.submission.id;
    } else {
      // For new submissions, include additional fields
      updateData.coursesChapter = "Java章节二";
      updateData.coursesId = 1;
      updateData.coursesName = 'Java面向对象编程';
      updateData.courseChapterId = 2;
    }

    // 第二步：调用数据库更新接口
    const updateResp = await request.post('edu/examFilelib', updateData, {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      }
    });

    if (updateResp.data.code === 200) {
      exam.uploadStatus = exam.submission ? '文件更新成功！' : '上传成功！';
      resetFileInput(exam);
      await fetchExams(); // Refresh data
    } else {
      throw new Error(updateResp.data.msg || '更新数据库失败');
    }
  } catch (error) {
    exam.uploadStatus = `上传失败: ${error.message}`;
    console.error('上传错误:', error);
  } finally {
    setTimeout(() => {
      exam.uploadProgress = 0;
      exam.uploadStatus = '';
    }, 6000);
  }
};


// 格式化日期时间
const formatDate = (dateStr) => {
  if (!dateStr) return '未开始'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

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

    };
  }
}

onMounted(() => {
  fetchExams()
})
</script>

<template>
  <div class="user-exams">
    <h2 class="page-title">我的考试</h2>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载考试数据...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>

    <!-- 考试列表 -->
    <div v-else class="exams-list">
      <div v-for="exam in exams" :key="exam.id" class="exam-card">
        <div class="exam-header">
          <h3 class="exam-title">{{ exam.title }}</h3>
          <span class="exam-course">{{ exam.course }}</span>
        </div>

        <div class="exam-info">
          <div class="info-item">
            <span class="info-label">考试时间:</span>
            <span class="info-value">{{ formatDate(exam.examTime) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">考试时长:</span>
            <span class="info-value">{{ exam.duration }}分钟</span>
          </div>
          <div class="info-item">
            <span class="info-label">总分:</span>
            <span class="info-value">{{ exam.totalScore }}分</span>
          </div>
          <div class="info-item" v-if="exam.score !== null">
            <span class="info-label">得分:</span>
            <span class="info-value score">{{ exam.score }}分</span>
          </div>
          <div class="info-item">
            <span class="info-label">状态:</span>
            <span class="status" :style="{ color: getStatusLabel(exam.status).color }">
              {{ getStatusLabel(exam.status).label }}
            </span>
          </div>
        </div>

        <!-- 考试分析 -->
        <!-- <div v-if="exam.status === 'completed' && exam.analysis" class="exam-analysis">
          <h4 class="analysis-title">考试分析</h4>
          <div class="analysis-stats">
            <div class="stat-item correct">
              <span class="stat-value">{{ exam.analysis.correct }}</span>
              <span class="stat-label">正确</span>
            </div>
            <div class="stat-item wrong">
              <span class="stat-value">{{ exam.analysis.wrong }}</span>
              <span class="stat-label">错误</span>
            </div>
            <div class="stat-item partial">
              <span class="stat-value">{{ exam.analysis.partial }}</span>
              <span class="stat-label">部分正确</span>
            </div>
            <div class="stat-item accuracy">
              <span class="stat-value">{{ exam.analysis.accuracy }}%</span>
              <span class="stat-label">正确率</span>
            </div>
          </div>
        </div> -->

        <div class="exam-footer">
          <!-- <div class="upload-section">
            <template v-if="exam.status === 'waiting_for_review' && exam.submission?.subPath">
              <div class="submitted-file">
                <span>已提交文件: {{ getFileName(exam.submission.subPath) }}</span>
                <button @click="handleDownload(exam.submission.subPath)" class="download-btn">下载</button>
                <button @click="showFileInput(exam)" class="update-btn">更新文件</button>
              </div>
              <input
                type="file"
                class="file-input"
                @change="(e) => handleFileSelect(e, exam)"
                style="display: none;"
                :data-exam-id="exam.id"
              />
              <button
                v-if="exam.selectedFile"
                class="upload-submit-btn"
                @click="handleUpload(exam)"
              >
                确认更新
              </button>
            </template>
            <template v-else>
              <label class="upload-btn">
                选择文件
                <input
                  type="file"
                  class="file-input"
                  @change="(e) => handleFileSelect(e, exam)"
                  style="display: none;"
                  :data-exam-id="exam.id"
                />
              </label>
              <button
                class="upload-submit-btn"
                @click="handleUpload(exam)"
                :disabled="!exam.selectedFile"
              >
                上传答案
              </button>
            </template>
            <div v-if="exam.uploadStatus" class="upload-status">
              {{ exam.uploadStatus }}
              <div v-if="exam.uploadProgress > 0" class="progress-bar">
                <div
                  class="progress"
                  :style="{ width: exam.uploadProgress + '%' }"
                ></div>
              </div>
            </div>
          </div> -->
          <!-- 按钮 -->
          <button
            class="action-btn"
            :class="{
              'start-btn': getButtonStatus(exam).status === 0,
              'waiting-btn': getButtonStatus(exam).status === 1,
              'view-btn': getButtonStatus(exam).status === 2
            }"
            @click="getButtonStatus(exam).action ? getButtonStatus(exam).action() : startExam(exam)"
          >
            {{ getButtonStatus(exam).label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-exams {
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

.exams-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.exam-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: transform 0.3s ease;
}

.exam-card:hover {
  transform: translateY(-4px);
}

.exam-header {
  margin-bottom: 16px;
}

.exam-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.exam-course {
  font-size: 14px;
  color: #666;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
}

.exam-info {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-label {
  font-size: 14px;
  color: #666;
  margin-right: 8px;
  min-width: 70px;
}

.info-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.info-value.score {
  color: #1890ff;
  font-weight: 600;
}

.status {
  font-size: 14px;
  font-weight: 500;
}

.exam-analysis {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.analysis-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.analysis-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.stat-item.correct .stat-value {
  color: #52c41a;
}

.stat-item.wrong .stat-value {
  color: #f5222d;
}

.stat-item.partial .stat-value {
  color: #faad14;
}

.stat-item.accuracy .stat-value {
  color: #1890ff;
}

.exam-footer {
  display: flex;
  justify-content: flex-end;

  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
.upload-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 200px;
}

.upload-btn {
  padding: 8px 16px;
  background: #f0f0f0;
  color: #333;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid #d9d9d9;
}

.upload-btn:hover {
  background: #e6e6e6;
}

.upload-submit-btn {
  padding: 8px 16px;
  background: #722ed1;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-submit-btn:hover {
  background: #9254de;
}

.upload-submit-btn:disabled {
  background: #d3adf7;
  cursor: not-allowed;
}

.upload-status {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  margin-top: 4px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: #52c41a;
  transition: width 0.3s ease;
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

.start-btn {
  background: #52c41a;
}

.start-btn:hover {
  background: #73d13d;
}

.waiting-btn {
  background: #faad14;
}

.waiting-btn:hover {
  background: #ffc53d;
}
.submitted-file {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.download-btn, .update-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.download-btn {
  background: #1890ff;
  color: white;
}

.download-btn:hover {
  background: #40a9ff;
}

.update-btn {
  background: #faad14;
  color: white;
}

.update-btn:hover {
  background: #ffc53d;
}
/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .page-title {
    color: #e0e0e0;
  }

  .exam-card {
    background: #2d2d2d;
  }

  .exam-title {
    color: #e0e0e0;
  }

  .exam-course {
    color: #aaa;
    background: #363636;
  }

  .info-label {
    color: #aaa;
  }

  .info-value {
    color: #e0e0e0;
  }

  .exam-analysis {
    background: #363636;
  }

  .analysis-title {
    color: #e0e0e0;
  }

  .stat-label {
    color: #aaa;
  }

  .exam-footer {
    border-top-color: #404040;
  }
  .upload-btn {
    background: #363636;
    color: #e0e0e0;
    border-color: #555;
  }

  .upload-btn:hover {
    background: #404040;
  }

  .progress-bar {
    background: #404040;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .exam-info {
    grid-template-columns: 1fr;
  }

  .analysis-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
