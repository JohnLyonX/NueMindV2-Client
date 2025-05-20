<template>
  <div class="exercise-container">
    <!-- 左边答题区 -->
    <div class="answer-area">
      <div class="header-info">
        <h1 class="chapter-title">章节名称：C语言基础</h1>
        <p class="chapter-meta">题目数量：20题 ｜ 满分：100分 ｜ 作答时间：30分钟</p>
      </div>

      <!-- 题目列表 -->
     <div class="question-panel">
        <h2 class="panel-title">单选题</h2>
        <div class="question-list">
          <div
            v-for="(question, index) in singleQuestions"
            :key="'single-' + index"
            class="question-item"
          >
            <h3 class="question-title">{{ index + 1 }}. {{ question.text }}</h3>
            <div class="option-list">
              <div
                v-for="(option, optionIndex) in question.options"
                :key="'option-' + optionIndex"
                class="option-item"
                :class="{ 'selected': answers[index] === optionIndex }"
                @click="selectAnswer(index, optionIndex)"
              >
                <input
                  type="radio"
                  :name="'question-' + index"
                  :value="optionIndex"
                  v-model="answers[index]"
                  hidden
                />
                <span>{{ option }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 交卷按钮 -->
      <div class="submit-container">
        <button class="submit-btn" @click="submitAnswers">交卷</button>
      </div>
    </div>

    <!-- 右边题号导航 -->
     <div class="question-panel">
      <h2 class="panel-title">单选题</h2>
      <div class="question-grid">
        <div
          v-for="(question, index) in singleQuestions"
          :key="'single-' + index"
          class="question-number"
          :class="{
            'bg-blue-500 text-white': answered[index],
            'hover:bg-blue-100': !answered[index]
          }"
          @click="scrollToQuestion(index)"
        >
          {{ index + 1 }} (ID: {{ question.id }})
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import request from '@/utils/request';
import { useRouter } from 'vue-router';

const router = useRouter();
const questions = ref([]);
const answers = ref([]);
const answered = ref([]);
const questionRefs = ref([]);

const singleQuestions = computed(() => questions.value);

const fetchExerciseQuestions = async (exerciseId) => {
  try {
    const correlationResponse = await request.get(`edu/correlation/list`, {
      params: { exerciseId }
    });
    const correlationData = correlationResponse.data.rows;
    const questionIds = correlationData.map(row => row.questionId);
    const questionsData = [];
    for (const id of questionIds) {
      const questionResponse = await request.get(`edu/questions/${id}`);
      questionsData.push(questionResponse.data);
    }

    return questionsData;
  } catch (err) {
    console.error('获取练习题目失败:', err);
    throw err;
  }
};
onMounted(async () => {
  try {
    const exerciseId = parseInt(router.currentRoute.value.params.id);
    const questionsData = await fetchExerciseQuestions(exerciseId);
    console.log('questionsData:', questionsData); // 调试数据
    questions.value = questionsData.map(item => ({
      id: item.data.questionId, 
      text: item.data.questionText, 
      options: [item.data.optionA, item.data.optionB, item.data.optionC, item.data.optionD] 
    }));
    console.log('questions:', questions); // 调试处理后的数据
  } catch (error) {
    console.error('Failed to fetch questions:', error);
  }
});
function selectAnswer(questionIndex, optionIndex) {
  answers.value[questionIndex] = optionIndex; // 保存用户选择的答案
  markAnswered(questionIndex); 
}
function markAnswered(index) {
  answered.value[index] = answers.value[index] !== null;
}
function scrollToQuestion(index) {
  questionRefs.value[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
const submitAnswers = async () => {
  const confirmed = window.confirm("确定要交卷吗？提交后将无法修改答案。");
  if (confirmed) {
    try {
      const exerciseId = parseInt(router.currentRoute.value.params.id);
      const studentId = 100; 
      const answerTime = new Date().toISOString();
      const answersData = questions.value.map((question, index) => {
        let selectedAnswer = '';
        if (answers.value[index] === 0) {
          selectedAnswer = 'A';
        } else if (answers.value[index] === 1) {
          selectedAnswer = 'B';
        } else if (answers.value[index] === 2) {
          selectedAnswer = 'C';
        } else if (answers.value[index] === 3) {
          selectedAnswer = 'D';
        }
        return {
          studentId: studentId,
          exerciseId: exerciseId,
          questionId: question.id,
          selectedAnswer: selectedAnswer,
          answerTime: answerTime,
        };
      });
      const response = await request.post(`edu/answers`, answersData);
      console.log("提交成功：", response.data);
      alert(`已交卷，您共作答 ${answered.value.filter(v => v).length} 题。`);
    } catch (err) {
      console.error('提交答案失败:', err);
      alert('提交答案失败，请稍后重试。');
    }
  }
};
</script>

<style scoped>
.exercise-container {
  display: flex;
  height: 100vh;
  gap: 1.5rem;
  overflow: hidden;
}

.answer-area {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background-color: #ffffff;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.answer-area::-webkit-scrollbar {
  display: none;
}

/* 顶部章节标题样式 */
.header-info {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #f3f4f6;
  border-radius: 0.75rem;
  border-left: 6px solid #2563eb;
}
.chapter-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1e3a8a;
}
.chapter-meta {
  font-size: 0.9rem;
  color: #4b5563;
  margin-top: 0.5rem;
}

/* 题目样式，去掉背景色和阴影，放大字体 */
.question-item {
  margin-bottom: 2rem;
  padding: 1.5rem 0; /* 取消背景和边框，保留上下间距 */
  border: none;
  border-radius: 0;
  background-color: transparent;
  box-shadow: none;
}

.question-title {
  font-size: 1.3rem; /* 放大字体 */
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.2rem;
}

/* 选项样式：丰富视觉效果，增加悬停和选中状态 */
.option-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem;
  border: 2px solid #d1d5db;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  max-width: 500px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  background-color: #fff;
  font-size: 1.1rem;
  font-weight: 500;
  color: #374151;
  user-select: none;
}

/* 鼠标悬停，改变边框和背景色 */
.option-item:hover {
  background-color: #eff6ff;
  border-color: #3b82f6;
  color: #1e40af;
}

/* 选中时样式，针对单选和多选input */
.option-item input:checked + span {
  font-weight: 700;
  color: #1e40af;
}

/* 美化单选框和多选框 */
.option-item input {
  width: 20px;
  height: 20px;
  accent-color: #2563eb;
  cursor: pointer;
}

/* 交卷按钮 */
.submit-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}
.submit-btn {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background-color: #2563eb;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.submit-btn:hover {
  background-color: #1e40af;
}

/* 右侧题号导航样式保持不变 */
.question-panel {
  width: 370px;
  height: 20vh;
  background-color: #f9fafb;
  border-left: 1px solid #e5e7eb;
  padding: 1rem;
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.panel-title {
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: #1f2937;
}
.mt-4 {
  margin-top: 1rem;
}

.question-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 22px;
  overflow-y: auto;
  max-height: calc(100vh - 3rem);
  padding-right: 4px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.question-grid::-webkit-scrollbar {
  display: none;
}
.question-number {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.question-number.bg-blue-500 {
  background-color: #1e40af;
  color: white;
}
.option-item.selected {
  border-color: #3b82f6;
  background-color: #eff6ff;
  color: #1e40af;
}
.option-item:hover {
  border-color: #3b82f6;
  background-color: #eff6ff;
  color: #1e40af;
}
</style>
