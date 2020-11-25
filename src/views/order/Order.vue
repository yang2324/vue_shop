<template>
  <div>
    <!--面包屑导航栏-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图-->
    <el-card>
      <!--搜索输入框-->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrdersList">
            <el-button slot="append" icon="el-icon-search" @click="getOrdersList"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!--列表数据-->
      <el-table :data="ordersList" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price" width="80px"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status" width="80px">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.pay_status === '0'">未付款</el-tag>
            <el-tag type="success" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send" width="80px"></el-table-column>
        <el-table-column label="下单时间" prop="create_time" width="160px">
          <template slot-scope="scope">
            {{ scope.row.create_time | showDate }}
          </template>
        </el-table-column>
        <!--操作-->
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!--修改按钮-->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog"></el-button>
            <!--物流信息-->
            <el-button type="success" icon="el-icon-location-outline" size="mini"
                       @click="showLogistics"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!--底部分页码-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!--修改弹出对话框-->
    <el-dialog
      title="修改地址"
      :visible.sync="showEditDialogVisible"
      width="50%" @close="addressClose">
      <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader :options="cityData" v-model="addressForm.address1"
                       :props="{expandTrigger: 'hover' }"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="showEditDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="showEditDialogVisible = false">确 定</el-button>
  </span>
    </el-dialog>

    <!--物流信息对话框-->
    <el-dialog
      title="物流信息"
      :visible.sync="progressDialogVisible"
      width="50%">
      <span>获取物流信息接口数据无效</span>
    </el-dialog>
  </div>
</template>

<script>
import {formatDate} from "../../common/utils";
import cityData from "../../common/citydata";

export default {
  name: "Order",
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      ordersList: [],
      showEditDialogVisible: false,
      //表单数据
      addressForm: {
        address1: [],
        address2: ""
      },
      //表单验证
      addressFormRules: {
        address1: [
          {required: true, message: '请选择省市区/县', trigger: 'blur'}
        ],
        address2: [
          {required: true, message: '请输入详细地址', trigger: 'blur'}
        ]
      },
      cityData,
      progressDialogVisible:false,
      progressInfo: []
    }
  },
  created() {
    this.getOrdersList()
  },
  methods: {
    async getOrdersList() {
      const {data: res} = await this.$http.get("orders", {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error("获取订单列表失败")
      }
      //console.log(res.data)
      this.total = res.data.total
      this.ordersList = res.data.goods
    },
    //监听pageSize改变事件
    handleSizeChange(newSize) {
      //console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getOrdersList()
    },
    //监听 页码值 的改变事件
    handleCurrentChange(newPage) {
      //console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getOrdersList()
    },
    //点击编辑弹出对话框
    showEditDialog() {
      this.showEditDialogVisible = true
    },
    //重置表单
    addressClose() {
      this.$refs.addressFormRef.resetFields()
    },
    //点击显示物流信息对话框  获取物流信息数据
    async showLogistics() {
      // const {data: res} = await this.$http.get("/kuaidi/1106975712662")
      // if (res.meta.status !== 200) {
      //   return this.$message.error("获取物流信息失败")
      // }
      // this.progressInfo = res.data
      this.progressDialogVisible = true
    }
  },
  filters: {
    //时间格式化
    showDate: function (value) {
      let date = new Date(value * 1000);
      return formatDate(date, "yyyy-MM-dd hh:mm");
    }
  }
}
</script>

<style scoped>
.el-cascader {
  width: 100%;
}
</style>
