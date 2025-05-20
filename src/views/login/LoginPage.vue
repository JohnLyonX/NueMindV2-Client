<template>
    <div class="container-login">
        <TypingEffect :text="'欢迎来到NueMind新智伙伴'" class="welcome-title"/>
      <div class="alert" :class="[alertClass, { show: showAlert }]">
        {{ alertMessage }}
      </div>
      <div class="form_wrap">
        <form @submit.prevent="handleLogin">
          <!-- 表单内容 -->
          <div class="mb-3">
            <label for="username" class="form-label">账号名</label>
            <input v-model="form.username" type="text" class="form-control">
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">密码</label>
            <input v-model="form.password" type="password" class="form-control">
          </div>
          <div class="mb-3 d-flex align-items-center gap-2">
            <input 
              v-model="form.code"
              type="text"
              class="form-control flex-grow-1"
              placeholder="验证码"
              @keyup.enter.native="handleLogin"
            >
            <div class="login-code-img-wrap flex-shrink-0">
              <img 
                :src="codeUrl" 
                @click="getCode"
                class="login-code-img"
                style="height: 38px; cursor: pointer"
              >
            </div>
          </div>
          <div class="btn-container">
            <button type="submit" class="btn btn-primary">登 录</button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
<script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import TypingEffect from '@/components/TypingEffect.vue'
  import request from '@/utils/request'
  const router = useRouter()
  const codeUrl=ref('')
  const captchaEnabled = ref(true)
  const form = ref({
    username: '19838472634',
    password: 'admin123123',
    rememberMe: false,
    code: "",
    uuid: ""
  })
  // 获取验证码
  const getCodeImg = async () => {
    try {
      const response = await request.get('captchaImage')
      codeUrl.value = "data:image/gif;base64," + response.data.img
      form.value.uuid = response.data.uuid
      captchaEnabled.value = response.data.captchaEnabled !== false
    } catch (error) {
      console.error('获取验证码失败:', error)
    }
  }
  onMounted(() => {
    getCodeImg()
  })


  const showAlert = ref(false)
  const alertMessage = ref('')
  const alertClass = ref('')

   const handleLogin = async () => {
    // 验证逻辑
    if (form.value.username.length < 3) {
      showAlertFn('用户名必须大于等于3位', false)
      return
    }
    if (form.value.password.length < 6) {
      showAlertFn('密码必须大于等于6位', false)
      return
    }
    // 张三
    // 19838472634
    // admin123123
    // 梁展波
    // 13345678910
    // 123456
    
    try {
      localStorage.removeItem('token')
      const response = await request.post('login', {
        username: form.value.username,
        password: form.value.password,
        code: form.value.code,
        uuid: form.value.uuid
      })
      
      if (response.data.code !== 200) {
      throw new Error(response.data.msg || '登录失败');
      }
      // 提取 token 和 userId
    const token = response.data.token || response.data.data?.token;
    const userId = response.data.userId; 
    if (!token) throw new Error('Token缺失');
      
    // 存储token
      localStorage.setItem('token', token)
      localStorage.setItem('username', form.value.username);
      if (userId) {
        localStorage.setItem('userId', userId);
      } else {
        console.warn('未获取到用户ID');
      }
      showAlertFn('登录成功', true)
      // 登录成功跳转
      router.push('/home')

    } catch (error) {
        // 登录失败时刷新验证码
        getCodeImg()
        form.value.code = ""
        const msg = (error.response && error.response.data && error.response.data.msg) || error.message;
        showAlertFn(msg, false);
    }
  }
  
  const showAlertFn = (msg, isSuccess) => {
    alertMessage.value = msg
    alertClass.value = isSuccess ? 'alert-success' : 'alert-danger'
    showAlert.value = true
    setTimeout(() => {
      showAlert.value = false
    }, 2000)
  }
</script>
  <style>
   .container-login {
    background-color: #EDF0F5;
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  }

  .container-login h3 {
    font-weight: 900;
  }

  .form_wrap {
    color: #8B929D !important;
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
  }

  .form-text {
    color: #8B929D !important;
  }

  .form-control {
    border-radius: 8px;
    padding: 0.75rem;
    border: 1px solid #e0e3eb;
    transition: all 0.25s ease;
  }

  .form-control:focus {
    border-color: #3e7afe;
    box-shadow: 0 0 0 3px rgba(62, 122, 254, 0.15);
    outline: none;
  }

  .btn-container {
    display: flex;
    justify-content: center;
    margin-top: 1.5rem;
  }

  .btn-primary {
    background: linear-gradient(135deg, #3e7afe, #3568e4);
    border: none;
    border-radius: 8px;
    padding: 0.75rem 2rem;
    font-size: 1rem;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(62, 122, 254, 0.2);
  }

  .btn-primary:active {
    transform: translateY(1px);
  }

  .alert {
    transition: .5s;
    opacity: 0;
  }

  .alert.show {
    opacity: 1;
  }

@media (max-width: 768px) {
  .container-login {
    padding: 2rem 1rem;
  }
  .form_wrap {
    max-width: 100%;
    width: 100%;
  }
  .login-code-img-wrap {
    margin-top: 0.5rem;
    flex-basis: 100%;
  }
  .login-code-img {
    width: 100%;
    height: auto;
  }
  .welcome-title {
    font-size: 2.5rem;
  }
}

@media (max-width: 576px) {
  .container-login {
    padding: 1.5rem;
  }
  .form-control {
    font-size: 0.9rem;
  }
  .btn-primary {
    width: 100%;
    font-size: 0.9rem;
  }
  .alert {
    margin-bottom: 1rem;
    padding: 0.5rem 1rem;
  }
}
.welcome-title {
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 1.5rem;
  min-height: 2em;
  color: #1a1a1a;
}
.login-code-img {
  border-radius: 6px;
  border: 1px solid #e0e3eb;
}

.login-code-img:hover {
  filter: brightness(0.98);
}
</style>
