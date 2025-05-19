import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CourseDetail from '../views/course/CourseDetail.vue'
import ProfileView from '../views/profile/ProfileView.vue'
import UserAssistantChat from '../views/profile/UserAssistantChat.vue'
import CourseStady from '@/views/course/CourseStady.vue'
import Login from '@/views/login/LoginPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/course/:id',
      name: 'courseDetail',
      component: CourseDetail
    },
    {
      path: '/courseStudy/:courseId',
      name: 'CourseStudy',
      component: () => import('@/views/course/CourseStady.vue')
    },
    {
      path: '/profile',
      component: ProfileView,
      children: [
        {
          path: '',
          name: 'profile',
          component: () => import('../views/profile/UserProfile.vue')
        },
        {
          path: 'courses',
          name: 'courses',
          component: () => import('../views/profile/UserCourses.vue')
        },
        {
          path: 'exercises',
          name: 'exercises',
          component: () => import('../views/profile/UserExercises.vue')
        },
        {
          path: 'exercises/:id',
          name: 'ExerciseDetail',
          component: () => import('../views/profile/ExerciseDetail.vue')
        },
        {
          path: 'exams',
          name: 'exams',
          component: () => import('../views/profile/UserExams.vue'),
        },
        {
          path: 'exams/:examId',
          name: 'ExamPage',
          component: () => import('../views/course/videopage/ExamPage.vue'),
          props: (route) => ({
            examId: route.params.examId,
            fileUrl: route.query.fileUrl,
            correctPath: route.query.correctPath,
            subPath: route.query.subPath,
            title: route.query.title,
            courseName: route.query.courseName || null ,

          })
        },
        {
          path: 'assistant',
          name: 'assistant',
          component: () => import('../views/profile/UserAssistant.vue')
        },
        {
          path: 'chat',
          name: 'chat',
          component: UserAssistantChat
        },

      ]
    },
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue'),
    // },
  ],
})

// 添加全局前置守卫
router.beforeEach((to, from, next) => {
  const hasToken = localStorage.getItem('token');
  const publicPaths = ['/login', '/home']; // 添加免拦截的路由

  if (!publicPaths.includes(to.path) && !hasToken) {
    next('/login');
  } else {
    next();
  }
})

export default router
