<template>
  <div>
    <!--面包屑导航栏-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图-->
    <el-card>
      <!--添加按钮-->
      <el-row>
        <el-col>
          <el-button type="primary" @click="rolesDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!--角色列表-->
      <el-table :data="rolesList" border stripe>
        <!--展开-->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['dbbottom',i1===0 ? 'dborder':'','vcenter']" v-for="(item1,i1) in scope.row.children"
                    :key="item1.id">
              <!--渲染一级权限-->
              <el-col :span="5">
                <el-tag closable @close="removeRolesById(scope.row,item1.id)">{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--渲染二，三级权限-->
              <el-col :span="19">
                <el-row :class="[i2===0 ?'':'dborder','vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRolesById(scope.row,item2.id)">{{
                        item2.authName
                      }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" v-for="(item3,i3) in item2.children" :key="item3.id"
                            closable @close="removeRolesById(scope.row,item3.id)">{{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!--索引-->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑
            </el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeUserById(scope.row.id)">删除
            </el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--添加角色弹出对话框-->
    <el-dialog
      title="添加角色" @close="addRolesDialogClosed"
      :visible.sync="rolesDialogVisible"
      width="50%">
      <!--文本内容-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!--底部按钮-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="rolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!--修改用户弹出对话框-->
    <el-dialog
      title="修改角色信息"
      :visible.sync="editDialogVisible"
      width="50%" @close="editDialogClose">
      <!--表单验证-->
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName" prop="roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editRolesInfo">确 定</el-button>
  </span>
    </el-dialog>
    <!--分配权限弹出对话框-->
    <el-dialog
      title="提示"
      :visible.sync="setRightDialogVisible"
      width="50%" @close="setRightDialogClose">
      <!--分配权限的树形控件-->
      <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all
               :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Roles",
  data() {
    return {
      rolesList: [],
      //控制添加角色对象的显示与隐藏
      rolesDialogVisible: false,
      //添加角色的表单数据
      addForm: {},
      //添加角色表单的验证规则对象
      addFormRules: {
        roleName: [
          {required: true, message: '请输入角色名称', trigger: 'blur'},
          {min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur'}
        ],
        roleDesc: [
          {required: true, message: '请输入角色描述', trigger: 'blur'},
          {min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur'}
        ]
      },
      //控制修改角色对象的显示与隐藏
      editDialogVisible: false,
      //查询角色信息列表
      editForm: {},
      //分配权限对象的显示与隐藏
      setRightDialogVisible: false,
      //所有权限的数据
      rightsList: [],
      //树形控件的属性对象
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      //默认选择节点
      defKeys: [],
      //当前分配权限的id
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    //获取角色列表
    async getRolesList() {
      const {data: res} = await this.$http.get("roles")
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败！")
      }
      //this.$message.success("获取角色列表成功")
      //console.log(res)
      this.rolesList = res.data
    },
    //添加角色弹窗关闭事件
    addRolesDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    //添加角色
    addRoles() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        //发起添加角色的网络请求
        const {data: res} = await this.$http.post("roles", this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error("添加角色失败！")
        }
        this.$message.success("添加角色成功！")
        this.getRolesList()
        this.rolesDialogVisible = false
      })
    },
    //修改角色弹窗关闭事件
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    //点击修改按钮显示对话框
    async showEditDialog(id) {
      const {data: res} = await this.$http.get("roles/" + id)
      if (res.meta.status !== 200) {
        return this.$message.error("查询角色信息失败")
      }
      console.log(res)
      this.editForm = res.data
      this.editDialogVisible = true
    },
    //修改角色信息
    editRolesInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        //发起修改角色的网络请求
        const {data: res} = await this.$http.put("roles/" + this.editForm.roleId, {
          roleName: this.editForm.roleName,
          roleDesc: this.editForm.roleDesc
        })
        if (res.meta.status !== 200) {
          return this.$message.error("修改角色信息失败！")
        }
        this.$message.success("修改用户信息成功！")
        //从新获取列表信息
        this.getRolesList()
        //关闭对话框
        this.editDialogVisible = false
      })
    },
    //根据id删除角色
    async removeUserById(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err);
      if (confirmResult !== 'confirm') {
        return this.$message.info("已取消删除")
      }
      //发送网络请求
      const {data: res} = await this.$http.delete("roles/" + id)
      if (res.meta.status !== 200) {
        return this.$message.error("删除用户失败！")
      }
      this.$message.success("删除用户成功！")
      this.getRolesList()
    },
    //根据id删除权限
    async removeRolesById(roles, rightId) {
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info("取消了删除！")
      }
      const {data: res} = await this.$http.delete(`roles/${roles.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error("删除权限失败！")
      }

      roles.children = res.data
    },
    //分配权限
    async showSetRightDialog(role) {
      this.roleId = role.id
      const {data: res} = await this.$http.get("rights/tree ")
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限数据失败！")
      }
      this.rightsList = res.data
      //console.log(this.rightsList)
      //递归获取三级节点的id
      this.getLeafKey(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    //通过递归形式获取角色下所有三级权限的id，并保存在defKeys数值中
    getLeafKey(node, arr) {
      //如果当前节点node没有children 则为三级权限
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKey(item, arr))
    },
    //监听分配权限的关闭事件
    setRightDialogClose() {
      this.defKeys = []
    },
    //分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids: idStr})
      if (res.meta.status!==200){
        return this.$message.error("分配权限失败！")
      }
      this.$message.success("分配权限成功！")
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style scoped>
.el-tag {
  margin: 10px;
}

.dborder {
  border-top: 1px solid #eee;
}

.dbbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
