 <script setup>
import { ref,onMounted } from 'vue';
import VChart from "vue-echarts";
import * as echarts from 'echarts'; // 新增echarts全局导入
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from "echarts/components";
import request from '@/utils/request'

const loading = ref(true)
const error = ref(null)
const userProfile = ref({
  basicInfo: {
    name: '',
    studentId: '',
    gender: '',
    age: '',
    email: '',
    phone: ''
  },
  education: {
    school: '',
    major: '',
    grade: '',
    class: ''
  },
  stats: {
    coursesCount: 0,
    exercisesCount: 0,
    examCount: 0,
    averageScore: 0
  }
});

const learningData = ref({
  personalAnalysis: {
    learningAbility: 0,
    logicalThinking: 0,
    codingSpeed: 0
  },
  learningTips: [] // 添加学习建议数组
});
// 注册必须的组件
use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
]);

// 修改分析图表配置动画和交互样式
const analysisOption = ref({
  title: { text: "个人情况分析" }, // 新增标题
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: '#ddd',
    padding: [8, 12],
    textStyle: { color: '#333' }
  },
  xAxis: { // 原yAxis内容
    type: "category",
    data: ["编程能力", "学习能力", "逻辑思维"], // 更新类目顺序
    axisLabel: {
      fontSize: 10,
      interval: 0,
      formatter: value => value.length >4 ? value.substring(0,4)+'\n'+value.substring(4) : value
    },
    axisLine: {
      show: true,
      lineStyle: { color: '#999' }
    },
    axisTick: { show: false }
  },
  yAxis: { // 原xAxis内容
    type: "value",
    name: "评分",
    splitLine: {
      lineStyle: { type: 'dashed', color: '#eee' }
    },
    axisLine: {
      show: true,
      lineStyle: { color: '#999' }
    }
  },
  series: [{
    name: "能力评分",
    type: "bar",
    data: [], // 动态数据（初始化为空）
    barWidth: '60%',
    // 旋转后需调整柱子方向
    barCategoryGap: '40%', // 增加类目间距
    itemStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
        offset: 0, color: '#5470c6'
      }, {
        offset: 1, color: '#91cc75'
      }]),
      borderRadius: [0, 20, 20, 0],
      borderColor: '#fff',
      borderWidth: 2
    },
    emphasis: {
      itemStyle: {
        color: '#2f4554',
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, 0.3)'
      }
    },
    label: {
      show: true,
      position: 'top',
      color: '#666'
    }
  }],
  animation: true,
  animationDurationUpdate: 1000,
})

// 修改学习概览图表配置动画和交互样式
const studyOverviewOption = ref({ // 改为响应式对象
  title: { text: "今日学习概览" }, // 新增标题
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: '#ddd',
    padding: [8, 12],
    textStyle: { color: '#333' }
  },
  xAxis: { // 原yAxis内容
    type: "category",
    data: ["学习时长", "任务完成"],
    axisLabel: {
      fontSize: 10,
      interval: 0,
      formatter: value => value.length >4 ? value.substring(0,4)+'\n'+value.substring(4) : value
    },
    axisLine: {
      show: true,
      lineStyle: { color: '#999' }
    }
  },
  yAxis: { 
    type: "value",
    name: "评分",
    splitLine: {
      lineStyle: { type: 'dashed', color: '#eee' }
    }
  },
  series: [{
    name: "评分",
    type: "bar",
    data: [3,5], 
    barWidth: '60%',
    barCategoryGap: '40%' ,
    itemStyle: {
      color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
        offset: 0, color: '#91cc75'
      }, {
        offset: 1, color: '#fac858'
      }]),
      borderRadius: [20, 0, 0, 20],
      borderColor: '#fff',
      borderWidth: 2
    },
    emphasis: {
      itemStyle: {
        color: '#6abf4c',
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, 0.3)'
      }
    },
    label: {
      show: true,
      position: 'insideRight',
      color: '#666'
    }
  }],
  animation: true,
  animationEasing: 'elasticOut',
})

const fetchData = async () => {
  try {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    request.get('edu/student/list', {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
    .then(response => {
      // console.log('学生列表数据:', response.data.rows);
      const targetStudent = response.data.rows.find(item => 
        item.phoneNumber === username 
      );
      console.log('找到的学生:', targetStudent);
      localStorage.setItem('avatarUrl',targetStudent.url)
      if (targetStudent) {
        request.get(`edu/student/${targetStudent.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(response => {
          const studentDetail = response.data.data.eduStudentDetailsList[0];
          console.log('学生详情:', studentDetail);
          localStorage.setItem('studentId', studentDetail.studentId);
          localStorage.setItem('name', targetStudent.name);
          // 基本信息
          userProfile.value = {
            basicInfo: {
              name: targetStudent.name || '未填写',
              studentId: studentDetail.studentId || '未填写',
              gender: targetStudent.sex === '0' ? '女' : '男',
              age: studentDetail.age || '未填写',
              email: studentDetail.email || '未填写',
              phone: targetStudent.phoneNumber || '未填写'
            },
            education: {
              school: studentDetail.school || '未填写',
              major: studentDetail.major || '未填写',
              grade: studentDetail.grade || '未填写',
              class: studentDetail.classinfo || '未填写'
            },
            stats: {
              coursesCount: 2, // 根据实际接口补充
              exercisesCount: 35,
              examCount: 2,
              averageScore: 78
            }
          };
          // 分析数据
          learningData.value = {
            personalAnalysis: {
              learningAbility: studentDetail.studyAbility || 0,
              logicalThinking: studentDetail.thinkingAbility || 0,
              codingSpeed: studentDetail.codeAbility || 0
            },
            learningTips: generateLearningTips(studentDetail)
          };
          // 分析图表
          analysisOption.value.series[0].data = [
            studentDetail.codeAbility || 0,
            studentDetail.studyAbility || 0,
            studentDetail.thinkingAbility || 0
          ];
        })
        .catch(error => {
          console.error('请求失败:', error);
        });
      } else {
        error.value = '未找到匹配的学生信息';
        console.error('未找到匹配的学生信息');
      }
    })
    .catch(error => {
      console.error('请求失败:', error);
    });
  } catch (err) {
    error.value = '数据加载失败，请检查网络连接';
    console.error('API Error:', err);
  } finally {
    loading.value = false;
  }
}

onMounted(fetchData)

const generateLearningTips = (data) => {
              const tips = [];
              if (data.codeAbility < 40) tips.push("建议加强代码实践练习，每日至少完成2道编程题");
              if (data.studyAbility < 60) tips.push("推荐使用番茄工作法提升学习效率");
              if (data.thinkingAbility < 50) tips.push("每周进行逻辑思维训练，建议完成3道算法题");
              return tips.length > 0 ? tips : ["各项能力均衡，继续保持！"];
            }
            
            

</script>

<template>
  <div class="user-profile">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <template v-else>
      <h2 class="page-title">个人档案</h2>

      <!-- 基本信息卡片 -->
      <div class="profile-card">
        <h3 class="card-title">基本信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">姓名：</span>
            <span class="value">{{ userProfile.basicInfo.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">学号：</span>
            <span class="value">{{ userProfile.basicInfo.studentId }}</span>
          </div>
          <div class="info-item">
            <span class="label">性别：</span>
            <span class="value">{{ userProfile.basicInfo.gender }}</span>
          </div>
          <div class="info-item">
            <span class="label">年龄：</span>
            <span class="value">{{ userProfile.basicInfo.age }}</span>
          </div>
          <div class="info-item">
            <span class="label">邮箱：</span>
            <span class="value">{{ userProfile.basicInfo.email }}</span>
          </div>
          <div class="info-item">
            <span class="label">手机：</span>
            <span class="value">{{ userProfile.basicInfo.phone }}</span>
          </div>
        </div>
      </div>

      <!-- 教育信息卡片 -->
      <div class="profile-card">
        <h3 class="card-title">教育信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">学校：</span>
            <span class="value">{{ userProfile.education.school }}</span>
          </div>
          <div class="info-item">
            <span class="label">专业：</span>
            <span class="value">{{ userProfile.education.major }}</span>
          </div>
          <div class="info-item">
            <span class="label">年级：</span>
            <span class="value">{{ userProfile.education.grade }}</span>
          </div>
          <div class="info-item">
            <span class="label">班级：</span>
            <span class="value">{{ userProfile.education.class }}</span>
          </div>
        </div>
      </div>

      <!-- 学习统计卡片 -->
      <div class="profile-card">
        <h3 class="card-title">学习统计</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ userProfile.stats.coursesCount }}</div>
            <div class="stat-label">已学课程</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ userProfile.stats.exercisesCount }}</div>
            <div class="stat-label">练习题数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ userProfile.stats.examCount }}</div>
            <div class="stat-label">考试次数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ userProfile.stats.averageScore }}</div>
            <div class="stat-label">平均分</div>
          </div>
        </div>
      </div>

      
      <div class="charts-container">
        <!-- 恢复被注释的图表 -->
        <div class="chart-item dashboard-card">
          <h3 class="card-title">个人情况分析</h3>
          <v-chart class="chart" :option="analysisOption" />
        </div>
        
        <div class="chart-item dashboard-card">
          <h3 class="card-title">今日学习概览</h3>
          <v-chart class="chart" :option="studyOverviewOption" />
        </div>
        
        <!-- 保留学习建议卡片 -->
  <div class="chart-item dashboard-card learning-tips">
          <h3 class="card-title">学习建议</h3>
          <div class="tips-list">
            <div
              v-for="(tip, index) in learningData.learningTips"
              :key="index"
              class="tip-item"
            >
              <span class="tip-icon">💡</span>
              <span class="tip-text">{{ tip }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.dashboard-card {
  transition: all 0.3s ease;
  cursor: default;
}

.dashboard-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.chart {
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}

/* 响应式优化 */
@media (max-width: 768px) {
  .chart {
    height: 300px;
  }
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.tip-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.charts-container {
  display: flex;
  flex-direction: column; /* 垂直排列图表 */
  gap: 24px;
  margin-top: 24px;
}

.chart-item {
  flex: 1 1 100%; /* 每个图表占满一行 */
  min-width: 100%;
}

.chart {
  width: 100%;
  height: 400px; /* 缩小高度，扩大宽度 */
}

.dashboard-card {
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  width: 100%; /* 全宽显示 */
}

.user-profile {
  max-width: 1400px; /* 增加整体宽度 */
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #333;
}

.profile-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: center;
}

.label {
  color: #666;
  margin-right: 8px;
  min-width: 60px;
}

.value {
  color: #333;
  font-weight: 500;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #1890ff;
  margin-bottom: 8px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .page-title {
    color: #e0e0e0;
  }

  .profile-card {
    background: #2d2d2d;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .card-title {
    color: #e0e0e0;
    border-bottom-color: #404040;
  }

  .label {
    color: #aaa;
  }

  .value {
    color: #e0e0e0;
  }

  .stat-item {
    background: #363636;
  }

  .stat-label {
    color: #aaa;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .profile-card {
    padding: 16px;
  }

  .page-title {
    font-size: 20px;
  }
}

@media (max-width: 576px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    gap: 12px;
  }

  .stat-item {
    padding: 12px;
  }

  .stat-value {
    font-size: 20px;
  }
}
.loading, .error {
  padding: 20px;
  text-align: center;
  font-size: 16px;
}
</style>
