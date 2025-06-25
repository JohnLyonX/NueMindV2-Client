import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/utils/request'
import { storageAvatar, storageName } from '@/utils/storageAvatar'
export const useProfileStore = defineStore('profile', {
  state: () => ({
    loaded: false,
    basicInfo: {},
    education: {},
    stats: {},
    error: null,
    loading: false,
    userProfile: ref({}),
    learningData: ref({}),
    analysisOption: ref({ series: [{ data: [] }] })
  }),
  actions: {
    async fetchData() {
  try {
    const token = localStorage.getItem('token');
    
    // 1. 获取当前学生基本信息
    const detailResponse = await request.get('/edu/student/getCurrentStudentInfo', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const currentStudent = detailResponse.data.data;
    console.log('当前学生信息:', currentStudent); // 正确输出当前学生信息
    
    if (!currentStudent) {
      throw new Error('未找到当前学生信息');
    }

    // 2. 获取学生详细信息 (如果需要)
    const studentDetail = currentStudent.eduStudentDetailsList?.[0]|| {
      studentId: '',
      age: '',
      email: '',
      school: '',
      major: '',
      grade: '',
      classinfo: '',
      studyAbility: 0,
      thinkingAbility: 0,
      codeAbility: 0
    };

    localStorage.setItem('studentId', studentDetail.studentId || '');
    
    // 3. 更新存储和状态
    await Promise.all([
      storageAvatar.setAvatar(request.defaults.baseURL + (currentStudent.url || '')),
      storageName.setName(currentStudent.name || ''),
      new Promise(resolve => {
        this.userProfile = {
          basicInfo: {
            name: currentStudent.name || '未填写',
            studentId: studentDetail.studentId || '未填写',
            gender: currentStudent.sex === '0' ? '女' : '男',
            age: studentDetail.age || '未填写',
            email: studentDetail.email || '未填写',
            phone: currentStudent.phoneNumber || '未填写'
          },
          education: {
            school: studentDetail.school || '未填写',
            major: studentDetail.major || '未填写',
            grade: studentDetail.grade || '未填写',
            class: studentDetail.classinfo || '未填写'
          },
          stats: {
            coursesCount: 2, 
            exercisesCount: 35,
            examCount: 2,
            averageScore: 78
          }
        };
        this.learningData = {
          personalAnalysis: {
            learningAbility: studentDetail.studyAbility || 0,
            logicalThinking: studentDetail.thinkingAbility || 0,
            codingSpeed: studentDetail.codeAbility || 0
          },
          learningTips: this.generateLearningTips(studentDetail)
        };
        this.analysisOption.series[0].data = [
          studentDetail.codeAbility || 0,
          studentDetail.studyAbility || 0,
          studentDetail.thinkingAbility || 0
        ];
        resolve();
      })
    ]);
    
    this.loaded = true;
    window.dispatchEvent(new CustomEvent('profile-data-ready'));
  } catch (err) {
    console.error('请求失败:', err);
    this.error = err.message || '数据加载失败';
    throw err; // 抛出错误让调用方可以捕获
  } finally {
    this.loading = false;
  }
},
    generateLearningTips(data) {
        const tips = []
            if (data.codeAbility < 40) tips.push("建议加强代码实践练习，每日至少完成2道编程题")
            if (data.studyAbility < 60) tips.push("推荐使用番茄工作法提升学习效率")
            if (data.thinkingAbility < 50) tips.push("每周进行逻辑思维训练，建议完成3道算法题")
        return tips.length > 0 ? tips : ["各项能力均衡，继续保持！"]
    }
  }
})
