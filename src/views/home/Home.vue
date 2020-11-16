<template>
  <!--主体-->
  <el-container class="home-container">
    <!--头部内容-->
    <el-header>
      <div class="header-context">
        <img src="~assets/img/logo.png"/>
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!--主体内容-->
    <el-container>
      <!--左边菜单栏-->
      <el-aside :width="isCollapse? '64px': '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
          text-color="#fff"
          active-text-color="#409eff"
          :default-active="activePath"
          unique-opened
          class="el-menu-vertical-demo"
          background-color="#2c3e50"
          :collapse="isCollapse"
          :collapse-transition="false"
          router>
          <!--一级菜单-->
          <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="iconList[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <!--二级菜单-->
            <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="activeState('/'+subItem.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!--对应左边菜单栏内容-->
      <el-main>
        <router-view/>
      </el-main>
    </el-container>
  </el-container>

</template>

<script>
export default {
  name: "Home",
  data() {
    return {
      menuList: [],
      iconList: {
        '125': 'iconfont iconguwen1',
        '103': 'iconfont iconrenzheng',
        '101': 'iconfont iconablum',
        '102': 'iconfont icondaishouhuo',
        '145': 'iconfont iconliuyan1'
      },
      isCollapse: false,
      activePath:""
    }
  },
  created() {
    this.getMenuList();
    this.activePath =window.sessionStorage.getItem("activePath")
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login")
    },
    async getMenuList() {
      const {data: res} = await this.$http.get("menus")
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
      console.log(res)
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    activeState(activePath){
      window.sessionStorage.setItem("activePath",activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style scoped>
.home-container {
  height: 100vh;
}

.el-header {
  background-color: #666666;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
}

.header-context {
  display: flex;
  align-items: center;
}

.header-context img {
  width: 45px;
  height: 45px;
}

.header-context span {
  font-size: 20px;
  color: #fff;
  margin-left: 15px;
}

.el-aside {
  background-color: #2c3e50;
}

.el-aside .el-menu {
  border-right: none;
}

.el-main {
  background-color: #eeeeee;
}

.iconfont {
  margin-right: 15px;
}

.toggle-button {
  background-color: #4A5064;
  font-size: 14px;
  color: #fff;
  text-align: center;
  line-height: 26px;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
