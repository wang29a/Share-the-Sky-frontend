<template>
  <!-- <n-form ref="loginForm" @submit="submitForm">
    <n-form-item label="用户名">
      <n-input v-model:value="loginForm.username" placeholder="请输入用户名"></n-input>
    </n-form-item>
    <n-form-item label="密码">
      <n-input type="password" v-model:value="loginForm.password" placeholder="请输入密码"></n-input>
    </n-form-item>
    <n-form-item>
      <n-button type="primary" native-type="submit">登录</n-button>
    </n-form-item>
  </n-form> -->
  <n-card>
    <n-tabs
      class="card-tabs"
      default-value="signin"
      size="large"
      animated
      pane-wrapper-style="margin: 0 -4px"
      pane-style="padding-left: 4px; padding-right: 4px; box-sizing: border-box;"
    >
      <n-tab-pane name="signin" tab="登录">
        <n-form @submit="submitLoginForm">
          <n-form-item-row label="用户名">
            <n-input v-model:value="loginForm.username" placeholder="请输入用户名"/>
          </n-form-item-row>
          <n-form-item-row label="密码">
            <n-input type="password" v-model:value="loginForm.password" placeholder="请输入密码"/>
          </n-form-item-row>
        </n-form>
        <n-button type="primary" block secondary strong @click="submitLoginForm">
          登录
        </n-button>
      </n-tab-pane>
      <n-tab-pane name="signup" tab="注册">
        <n-form>
          <n-form-item-row label="用户名">
            <n-input v-model:value="signForm.username" placeholder="请输入用户名"/>
          </n-form-item-row>
          <n-form-item-row label="密码">
            <n-input type="password" v-model:value="signForm.password1" placeholder="请输入密码"/>
          </n-form-item-row>
          <n-form-item-row label="重复密码">
            <n-input type="password" v-model:value="signForm.password2" placeholder="请输入密码"/>
          </n-form-item-row>
        </n-form>
        <n-button type="primary" block secondary strong @click="submitSignForm">
          注册
        </n-button>
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<script>
import axios from 'axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
export default {
  name: 'Login',
  setup() {
    const router = useRouter();
    const loginForm = ref({
      username: '',
      password: ''
    });
    const signForm = ref({
      username: '',
      password1: '',
      password2: ''
    });

    // 定义登录方法
    const login = () => {
      axios.post('/drogon/user/login', {
        userName: loginForm.value.username,
        passWord: loginForm.value.password
      })
      .then(response => {
        console.log(response.data);
        // 处理响应，例如保存 token、跳转到其他页面等
        const token = sessionStorage.getItem('userToken');
        router.push({name: 'Home'});
      })
      .catch(error => {
        console.error('登录失败:', error);
        // 处理错误，例如显示错误消息
      });
    };

    const register = () => {
      axios.post('/drogon/user/add', {
        userName: signForm.value.username,
        passWord: signForm.value.password1
      })
      .then(response => {
        console.log(response.data);
        // 处理响应，例如保存 token、跳转到其他页面等
      })
      .catch(error => {
        console.error('注册失败:', error);
        // 处理错误，例如显示错误消息
      });
    };

    // 定义提交登录表单方法
    const submitLoginForm = () => {
      console.log(loginForm.value);

      if (loginForm.value.username.trim() === '') {
        alert('请输入用户名');
        return;
      }
      if (loginForm.value.password.trim() === '') {
        alert('请输入密码');
        return;
      }
      // 继续后续逻辑
      login();
    };

    // 定义提交注册表单方法
    const submitSignForm = () => {
      console.log(signForm.value);

      if (signForm.value.username.trim() === '') {
        alert('请输入用户名');
        return;
      }
      if (signForm.value.password1.trim() === '') {
        alert('请输入密码');
        return;
      }
      if (signForm.value.password1.trim() !== signForm.value.password2.trim()) {
        alert('两次密码不一致');
        return;
      }
      // 继续后续逻辑
      register();
    };

    // 返回需要在模板中使用的数据和方法
    return {
      loginForm,
      signForm,
      submitLoginForm,
      submitSignForm,
    };
  },
  // data() {
  //   return {
  //     loginForm: {
  //       username: '',
  //       password: ''
  //     },
  //     signForm: {
  //       username: '',
  //       password1: '',
  //       password2: ''
  //     }
  //   }
  // },
  // methods: {
  //   submitLoginForm() {
  //     console.log(this.loginForm);
  //     // 在这里添加登录逻辑
  //     if (this.loginForm.username.trim() === '') {
  //       alert('请输入用户名');
  //       return;
  //     }
  //     if (this.loginForm.password.trim() === '') {
  //       alert('请输入密码');
  //       return;
  //     }

  //     // 继续后续逻辑
  //     this.login();
  //   }, 
  //   submitSignFrom() {
  //     console.log(this.signForm);

  //     if (this.loginForm.username.trim() === '') {
  //       alert('请输入用户名');
  //       return;
  //     }
  //     if (this.loginForm.password.trim() === '') {
  //       alert('请输入密码');
  //       return;
  //     }
  //     if (this.loginForm.password1.trim() === this.loginForm.password2.trim()) {
  //       alert('请输入密码');
  //       return;
  //     }

  //   },
  //   login() {
  //     axios.post('/drogon/user/login', {
  //       userName: this.loginForm.username,
  //       passWord: this.loginForm.password
  //     })
  //     .then(response => {
  //       console.log(response.data);
  //       // 处理响应，例如保存 token、跳转到其他页面等
  //     })
  //     .catch(error => {
  //       console.error('登录失败:', error);
  //       // 处理错误，例如显示错误消息
  //     });
  //   }
  // }
}
</script>
