<template>
  <div>
    <!--面包屑导航栏-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card>
      <!--警告区域-->
      <el-alert title="注意：只允许第三级分类设置相关参数！" type="warning" :closable="false" show-icon></el-alert>
      <!--选择商品分类区域-->
      <el-row class="cat-opt">
        <el-col>
          <span>选择商品分类：</span>
          <!--选择商品分类的级联选择框-->
          <el-cascader
            v-model="selectedKeys"
            :options="cateList"
            :props="{expandTrigger: 'hover' ,value: 'cat_pid',label: 'cat_name', children: 'children'}"
            @change="handleChange"></el-cascader>
        </el-col>
      </el-row>
      <!--页签区域-->
      <el-tabs v-model="activeName" @tab-click="handleTabsClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button :disabled="isBtnDisabled" size="mini" type="primary" @click="addDialogVisible = true">添加参数
          </el-button>

          <!--表格-->
          <el-table :data="manyTableData" border stripe>
            <!--展开行-->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag closable v-for="(item,i) in scope.row.attr_vals" :key="i" @close="handleClose(i,scope.row)">
                  {{ item }}
                </el-tag>

                <!--动态编辑-->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>

              </template>
            </el-table-column>
            <!--索引-->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">
                  编辑
                </el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button :disabled="isBtnDisabled" size="mini" type="primary" @click="addDialogVisible = true">添加属性
          </el-button>
          <!--表格-->
          <el-table :data="onlyTableData" border stripe>
            <!--展开行-->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag closable v-for="(item,i) in scope.row.attr_vals" :key="i" @close="handleClose(i,scope.row)">
                  {{ item }}
                </el-tag>

                <!--动态编辑-->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>

              </template>
            </el-table-column>
            <!--索引-->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">
                  编辑
                </el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!--添加按钮弹出对话框-->
    <el-dialog
      :title="'添加'+addTextChange"
      :visible.sync="addDialogVisible"
      width="50%" @close="dialogVisibleClose">
      <!--表单验证-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="addTextChange" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addParams">确 定</el-button>
  </span>
    </el-dialog>

    <!--编辑按钮弹出对话框-->
    <el-dialog
      :title="'编辑'+addTextChange"
      :visible.sync="editDialogVisible"
      width="50%" @close="editDialogVisibleClose">
      <!--表单验证-->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="addTextChange" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editParams">确 定</el-button>
  </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  name: "Params",
  data() {
    return {
      //分类列表数据
      cateList: [],
      selectedKeys: [],
      activeName: "many",
      //动态参数的数据
      manyTableData: [],
      //静态属性的数据
      onlyTableData: [],
      //添加弹出对话框显示与隐藏
      addDialogVisible: false,
      //表单数据
      addForm: {
        attr_name: ""
      },
      //添加表单规则对象
      addFormRules: {
        attr_name: [
          {required: true, message: '请输入内容', trigger: 'blur'}
        ]
      },
      //编辑弹出对话框显示与隐藏
      editDialogVisible: false,
      //编辑表单数据
      editForm: {},
      //编辑表单的验证规则
      editFormRules: {
        attr_name: [
          {required: true, message: '请输入内容', trigger: 'blur'}
        ]
      },
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //获取分类列表
    async getCateList() {
      const {data: res} = await this.$http.get("categories")
      if (res.meta.status !== 200) {
        return this.$message.error("获取分类列表数据失败")
      }
      this.cateList = res.data
    },
    //级联选项框选中项变化，会触发这个
    handleChange() {
      this.getParamsData()

    },
    handleTabsClick() {
      console.log(this.activeName)
      this.getParamsData()
      this.manyTableData = []
      this.onlyTableData = []
    },
    //获取参数的列表数据
    async getParamsData() {
      //证明选中的不是三级分类
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        return
      }
      //根据所选分类的id，和当前所处的面板，获取对应的参数
      const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: {sel: this.activeName}
      })

      if (res.meta.status !== 200) {
        return this.$message.error("获取参数列表失败")
      }

      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        //动态编辑显示与隐藏
        item.inputVisible = false
        item.inputValue = ""
      })
      //console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    //表单关闭，重置表单
    dialogVisibleClose() {
      this.$refs.addFormRef.resetFields()
    },
    //点击确定按钮，添加参数
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        //发送真正的网络请求
        const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) {
          return this.$message.error("添加失败")
        }
        this.addDialogVisible = false
        this.getParamsData()
        this.$message.success("添加成功")
      })
    },
    //点击显示编辑对话框
    async showEditDialog(id) {
      const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes/${id}`, {
        params: {
          attr_sel: this.activeName
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error("修改失败")
      }
      this.editForm = res.data
      this.getParamsData()
      this.editDialogVisible = true
    },
    //表单关闭，重置表单
    editDialogVisibleClose() {
      this.$refs.editFormRef.resetFields()
    },
    //点击编辑按钮，修改参数
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        //发送真正的网络请求
        const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) {
          return this.$message.error("修改失败")
        }
        this.editDialogVisible = false
        this.getParamsData()
        this.$message.success("修改成功")
      })
    },
    //根据id删除参数
    async removeParams(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err);

      if (confirmResult !== 'confirm') {
        return this.$message.info("已取消删除")
      }
      //发送真正的网络请求
      const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error("删除参数失败")
      }
      this.$message.success("删除参数成功")
      this.getParamsData()
    },
    //离开或 点击enter 按钮触发事件
    async handleInputConfirm(row) {
      //输入有内容
      if (row.inputValue.trim().length === 0) {
        row.inputVisible = false
        row.inputValue = ""
        return
      }
      //输入没有内容
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ""
      row.inputVisible = false
      //发送真正的网络请求
      this.getAttrVale(row)
      this.$message.success("添加参数成功")

    },
    //点击动态编辑时候显示输入框
    showInput(row) {
      row.inputVisible = true
      //让文本框自动获取焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    //添加参数保存在数据库中 带参使用
    async getAttrVale(row) {
      const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      //console.log(row.attr_sel)
      if (res.meta.status !== 200) {
        return this.$message.error("添加参数失败")
      }

    },
    //点击删除
    handleClose(i, row) {
      row.attr_vals.splice(i, 1)
      //保存在数据库中
      this.getAttrVale(row)
      this.$message.success("删除参数成功")
    }
  },
  computed: {
    //按钮禁用 -true ->false
    isBtnDisabled() {
      if (this.selectedKeys.length !== 3) {
        return true
      }
      return false
    },
    //当选择三级时候的id,分类id
    cateId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return null
    },
    //添加对话框标题文本
    addTextChange() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style scoped>
.cat-opt {
  margin: 20px 0;
}

.el-tag {
  margin-right: 15px;
}

.input-new-tag {
  width: 120px;
}
</style>
