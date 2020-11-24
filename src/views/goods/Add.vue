<template>
  <div>
    <!--面包屑导航栏-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图-->
    <el-card>
      <el-alert title="添加商品信息" type="info" center :closable="false" show-icon></el-alert>
      <!--步骤-->
      <el-steps :space="200" :active="activeIndex -0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!--tabs区域-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" class="demo-ruleForm"
               label-position="top">
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTableLeave" @tab-click="tabClick">
          <el-tab-pane label="基本信息" name="0">

            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <!--选择商品分类的级联选择框-->
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="{expandTrigger: 'hover' ,value: 'cat_id',label: 'cat_name', children: 'children'}"
                @change="handleChange"></el-cascader>
            </el-form-item>

          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border v-for="(cd,i) in item.attr_vals" :label="cd" :key="i"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :on-success="handleSuccsee"
              :headers="headerObj">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>

    </el-card>
    <!--图片预览-->
    <el-dialog
      title="图片预览"
      :visible.sync="previewDialogVisible"
      width="50%">
      <img :src="previewPath" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash"

export default {
  name: "Add",
  data() {
    return {
      activeIndex: "0",
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        //商品分类参数数组
        goods_cat: [],
        //上传图片数组
        pics: [],
        //商品描述
        goods_introduce: "",
        attrs: []
      },
      //表单验证规则
      addFormRules: {
        goods_name: [
          {required: true, message: '请输入商品名称', trigger: 'blur'},
        ],
        goods_price: [
          {required: true, message: '请输入商品价格', trigger: 'blur'},
        ],
        goods_number: [
          {required: true, message: '请输入商品数量', trigger: 'blur'},
        ],
        goods_weight: [
          {required: true, message: '请输入商品重量', trigger: 'blur'},
        ],
        goods_cat: [
          {required: true, message: '请选中商品分类', trigger: 'blur'},
        ]
      },
      //分类参数
      cateList: [],
      //动态列表数据
      manyTableData: [],
      //静态属性数据
      onlyTableData: [],
      //图片上传地址
      uploadURL: "http://127.0.0.1:8888/api/private/v1/upload",
      //图片上传组件的headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem("token")
      },
      //获取图片的url
      previewPath: "",
      //控制图片预览的显示与隐藏
      previewDialogVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //获取所有商品分类的参数
    async getCateList() {
      const {data: res} = await this.$http.get("categories")
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类参数失败")
      }
      //console.log(res)
      this.cateList = res.data
    },
    //级联选项框选中项变化，会触发这个
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    beforeTableLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请先选择商品分类！")
        return false
      }
    },
    //动态获取参数列表
    async tabClick() {
      if (this.activeIndex === '1') {
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {sel: 'many'}
        })
        if (res.meta.status !== 200) {
          return this.$message.error("获取参数列表失败")
        }
        //console.log(res.data)
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ")
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {sel: 'only'}
        })
        if (res.meta.status !== 200) {
          return this.$message.error("获取静态属性列表失败")
        }
        console.log(res.data)
        // res.data.forEach(item => {
        //   item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ")
        // })
        this.onlyTableData = res.data
      }
    },
    //处理图片预览操作
    handlePreview(file) {
      //console.log(file)
      this.previewPath = file.response.data.url
      this.previewDialogVisible = true
    },
    //处理移除图片操作
    handleRemove(file) {
      //1.获取将要移除图片的路径
      const filePath = file.response.data.tmp_path
      //2.从pics数组中，找到这个图片对应的索引值
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      //3.调用数组的splice 方法，把图片信息对象从pics数组中移除
      this.addForm.pics.splice(i, 1)
      // console.log(this.addForm)
    },
    //监听图片上传成功
    handleSuccsee(response) {
      //1.拼接得到一个图片信息对象
      const picsInfo = {pic: response.data.tmp_path}
      //2.将图片对象push到pisc数组中
      this.addForm.pics.push(picsInfo)
      //console.log(this.addForm)
    },
    //添加商品
    async add() {
      //console.log(this.addForm)
      this.$refs.addFormRef.validate(valid => {
        if (!valid) {
          return this.$message.error("请填写必要的表单项！")
        }
      })
      //执行添加的业务逻辑
      const form = _.cloneDeep(this.addForm)
      form.goods_cat = form.goods_cat.join(',')
      //处理动态参数
      this.manyTableData.forEach(item => {
        const newInfo = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals.join(' ')
        }
        this.addForm.attrs.push(newInfo)
      })
      //处理静态属性
      this.onlyTableData.forEach(item => {
        const newInfo = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals
        }
        this.addForm.attrs.push(newInfo)
      })
      form.attrs = this.addForm.attrs
      //发送网络请求
      const {data: res} = await this.$http.post("goods", form)
      if (res.meta.status!==201){
        return this.$message.error("添加商品失败")
      }
      this.$message.success("添加商品成功")
      this.$router.push("/goods")
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style scoped>

.el-checkbox {
  margin: 5px 10px 0 0 !important;
}

.previewImg {
  width: 100%;
}

.btnAdd {
  margin-top: 20px;
}
</style>
