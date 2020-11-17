<template>
  <div>
    <!--面包屑导航栏-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图-->
    <el-card class="box-card">
      <!--搜索口-->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!--列表数据-->
      <el-table :data="userList" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="mg_state">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="switchChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <!--操作-->
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!--修改按钮-->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <!--删除按钮-->
            <el-button type="danger" icon="el-icon-delete" size="mini"
                       @click="removeUserById(scope.row.id)"></el-button>
            <!--分配角色按钮-->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRoles(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!--底部分页码-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!--添加用户弹出对话框-->
    <el-dialog
      title="添加用户" @close="addDialogClosed"
      :visible.sync="dialogVisible"
      width="50%">
      <!--文本内容-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!--底部按钮-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!--修改用户弹出对话框-->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="50%" @close="editDialogClose">
      <!--表单验证-->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="名称">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserInfo">确 定</el-button>
  </span>
    </el-dialog>

    <!--分配角色弹出对话框-->
    <el-dialog
      title="角色分配"
      :visible.sync="setRoleDialogVisible"
      width="50%" @close="roleDialogClose">
      <div>
        <p>当前的用户：{{ userInfo.username }}</p>
        <p>当前的角色：{{ userInfo.role_name }}</p>
        <p>分配新角色：
          <el-select v-model="selectRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "User",
  data() {
    //验证邮箱的规则
    let checkEmail = (rule, value, cb) => {
      //邮箱的正则表达式
      const regEmail = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error("请输入合法的邮箱地址"))
    }
    //验证电话的规则
    let checkMobile = (rule, value, cb) => {
      //邮箱的正则表达式
      const regMobile = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error("请输入合法的电话号码"))
    }
    return {
      //获取用户列表的参数对象
      queryInfo: {
        query: "",
        //当前页数
        pagenum: 1,
        //页面数大小
        pagesize: 2
      },
      userList: [],
      total: 0,
      //控制添加用户对象的显示与隐藏
      dialogVisible: false,
      //控制修改用户信息的显示与隐藏
      editDialogVisible: false,
      //添加用户的表单数据
      addForm: {
        username: ''
      },
      //添加用户表单的验证规则对象
      addFormRules: {
        username: [
          {required: true, message: '请输入用户名称', trigger: 'blur'},
          {min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur'}
        ],
        password: [
          {required: true, message: '请输入用户密码', trigger: 'blur'},
          {min: 6, max: 16, message: '长度在 6 到 10 个字符', trigger: 'blur'}
        ],
        email: [
          {required: true, message: '请输入邮箱', trigger: 'blur'},
          {min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur'},
          {validator: checkEmail, trigger: 'blur'}
        ],
        mobile: [
          {required: true, message: '请输入电话号码', trigger: 'blur'},
          {min: 6, max: 20, message: '长度在 6 到 10 个字符', trigger: 'blur'},
          {validator: checkMobile, trigger: 'blur'}
        ]
      },
      //查询用户信息数据
      editForm: {},
      //修改用户表单验证规则对象
      editFormRules: {
        email: [
          {required: true, message: '请输入邮箱', trigger: 'blur'},
          {min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur'},
          {validator: checkEmail, trigger: 'blur'}
        ],
        mobile: [
          {required: true, message: '请输入电话号码', trigger: 'blur'},
          {min: 6, max: 20, message: '长度在 6 到 10 个字符', trigger: 'blur'},
          {validator: checkMobile, trigger: 'blur'}
        ]
      },
      //控制角色分配的显示与隐藏
      setRoleDialogVisible: false,
      //当前角色的信息
      userInfo: {},
      //所有角色的列表数据
      rolesList: [],
      //当前选中的角色
      selectRoleId: ''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    //获取列表数据
    async getUserList() {
      const {data: res} = await this.$http.get("users", {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        this.$message.error("获取用户列表失败")
      }
      this.userList = res.data.users
      this.total = res.data.total
      //console.log(res)
    },
    //监听pageSize改变事件
    handleSizeChange(newSize) {
      //console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    //监听 页码值 的改变事件
    handleCurrentChange(newPage) {
      //console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    //监听switch开关监听事件
    async switchChange(userInfo) {
      //console.log(userInfo)
      const {data: res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        return this.$message.error("更改状态失败！")
        userInfo.mg_state = !userInfo.mg_state
      }
      this.$message.success("更改状态成功！")
    },
    //监听关闭对话框的事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    //添加用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        //发起添加用户的网络请求
        const {data: res} = await this.$http.post("users", this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error("添加用户失败")
        }
        this.$message.success("添加用户成功")
        this.dialogVisible = false
        this.getUserList()
      })
    },

    //点击修改按钮显示对话框
    async showEditDialog(id) {
      //console.log(id)
      const {data: res} = await this.$http.get("users/" + id)
      if (res.meta.status !== 200) {
        return this.$message.error("查询用户信息失败！")
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    //修改用户对话框的关闭事件
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    //修改用户点击确定按钮事件
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        //发送修改用户信息的网络请求
        const {data: res} = await this.$http.put("users/" + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if (res.meta.status !== 200) {
          this.$message.error("修改用户信息失败！")
        }
        //关闭对话框
        this.editDialogVisible = false
        //刷新用户列表
        this.getUserList()
        //提示成功
        this.$message.success("修改用户信息成功！")
      })
    },
    //根据id删除用户
    async removeUserById(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err);
      if (confirmResult !== 'confirm') {
        return this.$message.info("已取消删除")
      }
      //发送网络请求
      const {data: res} = await this.$http.delete("users/" + id)
      if (res.meta.status !== 200) {
        return this.$message.error("删除用户失败！")
      }
      this.$message.success("删除用户成功！")
      this.getUserList()
    },
    //角色分配
    async setRoles(userInfo) {
      this.userInfo = userInfo

      const {data: res} = await this.$http.get("roles")
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败！")
      }
      this.rolesList = res.data
      this.setRoleDialogVisible = true
      // console.log(this.userInfo)
    },
    //点击确定按钮，分配角色
    async saveRoleInfo() {
      if (!this.selectRoleId) {
        return this.$message.error("请选择需要分配的角色")
      }
      const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`, {rid: this.selectRoleId})
      if (res.meta.status!==200){
        return this.$message.error("分配角色失败")
      }
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    //监听关闭对话框的事件
    roleDialogClose(){
      this.selectRoleId = ""
      this.userInfo = {}
    }
  }
}
</script>

<style scoped>
</style>
