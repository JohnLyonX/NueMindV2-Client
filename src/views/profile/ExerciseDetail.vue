<template>
  <div class="exercise-container">
    <!-- 左边答题区 -->
    <div class="answer-area">
      <div class="header-info">
        <h1 class="chapter-title">章节名称：C语言基础</h1>
        <p class="chapter-meta">题目数量：20题 ｜ 满分：100分 ｜ 作答时间：30分钟</p>
      </div>

      <!-- 题目列表 -->
      <div
        v-for="(question, index) in questions"
        :key="question.id"
        class="question-item"
        :ref="el => questionRefs[index] = el"
      >
        <p class="question-title">{{ index + 1 }}. {{ question.text }}</p>
        <div class="option-list">
          <label
            v-for="option in question.options"
            :key="option"
            class="option-item"
          >
            <input
              :type="question.type === 'single' ? 'radio' : 'checkbox'"
              :name="'question-' + index"
              :value="option"
              v-model="answers[index]"
              @change="markAnswered(index)"
            />
            <span>{{ option }}</span>
          </label>
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
          {{ index + 1 }}
        </div>
      </div>

      <h2 class="panel-title mt-4">多选题</h2>
      <div class="question-grid">
        <div
          v-for="(question, index) in multipleQuestions"
          :key="'multiple-' + index"
          class="question-number"
          :class="{
            'bg-blue-500 text-white': answered[singleQuestions.length + index],
            'hover:bg-blue-100': !answered[singleQuestions.length + index]
          }"
          @click="scrollToQuestion(singleQuestions.length + index)"
        >
          {{ singleQuestions.length + index + 1 }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const questions = ref([
  ...Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    text: '以下哪个选项是合法的C语言变量名？（单选题）',
    type: 'single',
    options: ['1abc', 'abc1', '_abc', 'a-b']
  })),
  ...Array.from({ length: 10 }, (_, i) => ({
    id: i + 11,
    text: '以下哪些是C语言的关键字？（多选题）',
    type: 'multiple',
    options: ['int', 'return', 'function', 'loop']
  }))
]);

const answers = ref(
  questions.value.map(q => (q.type === 'multiple' ? [] : null))
);

const answered = ref(Array(20).fill(false));
const questionRefs = ref([]);

const singleQuestions = computed(() => questions.value.filter(q => q.type === 'single'));
const multipleQuestions = computed(() => questions.value.filter(q => q.type === 'multiple'));

function markAnswered(index) {
  const val = answers.value[index];
  if ((Array.isArray(val) && val.length > 0) || (!Array.isArray(val) && val !== null)) {
    answered.value[index] = true;
  } else {
    answered.value[index] = false;
  }
}

function scrollToQuestion(index) {
  questionRefs.value[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function submitAnswers() {
  const confirmed = window.confirm("确定要交卷吗？提交后将无法修改答案。");
  if (confirmed) {
    const result = {
      total: questions.value.length,
      answeredCount: answered.value.filter(v => v).length,
      answers: answers.value
    };
    console.log("提交成功：", result);
    alert(`已交卷，您共作答 ${result.answeredCount} 题。`);
  }
}
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
  height: 37vh;
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

</style>
