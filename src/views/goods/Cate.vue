<template>
  <div>
    <!--面包屑导航栏-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图-->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!--商品列表区域-->
      <tree-table class="treeTable" :data="cateList" :columns="columns" :selection-type="false" :expand-type="false"
                  show-index
                  index-text="#"
                  :show-row-hover="false" border>
        <!--是否有效-->
        <template slot="isOk" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!--排序-->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!--操作-->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCateDialog(scope.row.cat_id)">编辑
          </el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>

      <!--页码区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!--添加分类弹出对话框-->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%" @close="cateDialogClose">
      <!--表单-->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px"
               class="demo-ruleForm">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
            clearable
            v-model="selectedKeys"
            :options="parentCateList"
            :props="{checkStrictly: true,expandTrigger: 'hover' ,value: 'cat_pid',
          label: 'cat_name',
          children: 'children'}"
            @change="parentCateChange"></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
    </el-dialog>

    <!--编辑分类弹出对话框-->
    <el-dialog
      title="修改分类"
      :visible.sync="editCateDialogVisible"
      width="50%" @close="editDialogClose">
      <!--表单验证-->
      <el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef" label-width="100px"
               class="demo-ruleForm">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editCate">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Cate",
  data() {
    return {
      //获取商品列表的参数对象
      queryInfo: {
        type: 3,
        //当前页数
        pagenum: 1,
        //页面数大小
        pagesize: 5
      },
      //商品列表数据
      cateList: [],
      //商品总条数
      total: 0,
      columns: [
        {
          label: '商品分类',
          prop: 'cat_name'
        }, {
          label: '是否有效',
          type: 'template',
          template: 'isOk'
        }, {
          label: '排序',
          type: 'template',
          template: 'order'
        }, {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      //添加分类对话框显示与隐藏
      addCateDialogVisible: false,
      //表单添加分类数据对象
      addCateForm: {
        cat_name: "",
        cat_pid: 0,
        cat_level: 0
      },
      //添加分类表单校验规则
      addCateFormRules: {
        cat_name: [
          {required: true, message: '请输入分类名称', trigger: 'blur'}
        ],
      },
      //父级分类列表
      parentCateList: [],
      cascaderProps: {
        value: 'cat_pid',
        label: 'cat_name',
        children: 'children'
      },
      selectedKeys: [],
      //编辑分类弹出框显示与隐藏
      editCateDialogVisible: false,
      //查询分类数据列表
      editCateForm: {},
      //修改分类表单验证规则对象
      editCateFormRules: {
        cat_name: [
          {required: true, message: '请输入分类名称', trigger: 'blur'},
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const {data: res} = await this.$http.get("categories", {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表数据失败")
      }
      this.cateList = res.data.result
      this.total = res.data.total
      //console.log(res)
    },
    //监听 pagesize 事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    //监听 pagenum 事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    //点击添加分类显示对话框
    addCateDialog() {
      //调用
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    //获取父级分类列表数据
    async getParentCateList() {
      const {data: res} = await this.$http.get("categories", {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类列表数据失败")
      }
      this.parentCateList = res.data
      //console.log(res.data)
    },
    parentCateChange() {
      console.log(this.selectedKeys)
      if (this.selectedKeys.length > 0) {
        //父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        //等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
        return

      } else {
        //父级分类的id
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    //点击对话框确定按钮
    addCate() {
      //console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        //发送真正的网络请求
        const {data: res} = await this.$http.post("categories", this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error("添加分类失败！")
        }
        this.addCateDialogVisible = false
        this.getCateList()
        this.$message.success("添加分类成功！")
      })
    },
    //关闭对话框事件 重置表单数据
    cateDialogClose() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    //点击编辑分类按钮，弹出对应的对话框
    async showEditCateDialog(id) {
      //根据id查询分类
      const {data: res} = await this.$http.get("categories/" + id)
      if (res.meta.status !== 200) {
        return this.$message.error("查询分类失败")
      }
      this.editCateForm = res.data
      this.editCateDialogVisible = true
      console.log(this.editCateForm)
    },
    //修改分类对话框的关闭事件
    editDialogClose() {
      this.$refs.editCateFormRef.resetFields()
    },
    //点击修改分类确定按钮
    editCate() {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        //发送真正的网络请求
        const {data: res} = await this.$http.put("categories/" + this.editCateForm.cat_id, {
          cat_name: this.editCateForm.cat_name
        })
        if (res.meta.status !== 200) {
          return this.$message.error("修改分类失败！")
        }
        this.editCateDialogVisible = false
        this.getCateList()
        this.$message.success("修改分类成功")
      })
    },
    //根据id删除分类
    async removeCate(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info("取消删除")
      }
      //发送真正的网络请求
      const {data: res} = await this.$http.delete("categories/" + id)
      if (res.meta.status !== 200) {
        return this.$message.error("删除分类失败")
      }
      this.getCateList()
      this.$message.success("删除分类成功")
    }
  }
}
</script>

<style scoped>
.treeTable {
  margin-top: 20px;
}

.el-cascader {
  width: 100%;
}
</style>
