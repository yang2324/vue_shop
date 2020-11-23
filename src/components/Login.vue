<template>
  <div class="login">
    <div class="login-box">
      <!--logo-->
      <div class="login-img">
        <img src="../assets/img/logo.jpg">
      </div>
      <!--表单-->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0px" class="login-form">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont iconiconfontcolor19-copy"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="iconfont iconsuo" type="password"></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login">确定</el-button>
          <el-button type="info" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      //表单数据绑定
      loginForm: {
        username: "admin",
        password: "123456"
      },
      //表单校验
      loginFormRules: {
        username: [
          {required: true, message: '请输入用户名称', trigger: 'blur'},
          {min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur'}
        ],
        password: [
          {required: true, message: '请输入用户密码', trigger: 'blur'},
          {min: 6, max: 10, message: '长度在 6 到 10 个字符', trigger: 'blur'}
        ]
      }
    }
  },
  methods: {
    //表单重置函数resetFields（）
    resetForm() {
      this.$refs.loginFormRef.resetFields();
    },
    login() {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return;
        const {data: res} = await this.$http.post("login", this.loginForm);
        console.log(res)
        if (res.meta.status !== 200) return this.$message({
          showClose: true,
          message: '登录失败',
          type: 'error'
        });
        this.$message(
          {
            showClose: true,
            message: '登录成功',
            type: 'success'
          }
        );
        //1.登录成功后的token,保存在客户端sessionStorage
        window.sessionStorage.setItem("token",res.data.token);
        //2.通过编程式导航跳转到home
        await this.$router.push("/home")
      })
    }
  }
}
</script>

<style scoped>
.login {
  background-color: #2c3e50;
  height: 100vh;
}
.login-box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.login-img {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  border: 1px solid #eeeeee;
  padding: 10px;
  box-shadow: 0 0 10px #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
}
.login-img img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #eeeeee;
}
.login-form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
.btns {
  display: flex;
  justify-content: flex-end;
}
</style>
