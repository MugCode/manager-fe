<template>
	<div class="dept-manager">
		<div class="query-form">
			<el-form
				:inline="true"
				ref="queryForm"
				:model="queryForm"
			>
				<el-form-item label="部门名称">
					<el-input
						placeholder="请输入部门名称"
						v-model="queryForm.deptName"
					/>
				</el-form-item>
				<el-form-item>
					<el-button
						type="primary"
						@click="getDeptList"
						>查询</el-button
					>
					<el-button
						type="danger"
						@click="handleReset('queryForm')"
						>重置</el-button
					>
				</el-form-item>
			</el-form>
		</div>
		<div class="base-table">
			<div class="action">
				<el-button
					type="primary"
					@click="handleOpen"
					>创建</el-button
				>
			</div>
			<el-table
				:data="deptList"
				row-key="_id"
				:tree-props="{ children: 'children' }"
				stripe
			>
				<el-table-column
					v-for="item in columns"
					:key="item.prop"
					v-bind="item"
				></el-table-column>
				<el-table-column label="操作">
					<template #default="scope">
						<el-button
							size="small"
							type="primary"
							@click="handleEdit(scope.row)"
							>编辑
						</el-button>
						<el-button
							size="small"
							type="danger"
							@click="handleDel(scope.row)"
							>删除
						</el-button>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<el-dialog
			:title="action == 'create' ? '创建部门' : '编辑部门'"
			v-model="dialogVisible"
		>
			<el-form
				ref="dialogForm"
				:model="deptForm"
				:rules="rules"
				label-width="100"
			>
				<el-form-item label="上级部门">
					<el-cascader
						placeholder="请选择上级部门"
						v-model="deptForm.parentId"
						:props="{ checkStrictly: true, value: '_id', label: 'deptName' }"
						:options="deptList"
						:show-all-levels="true"
						:collapse-tags="false"
						clearable
					></el-cascader>
				</el-form-item>
				<el-form-item
					label="部门名称"
					prop="deptName"
				>
					<el-input
						placeholder="请输入部门名称"
						v-model="deptForm.deptName"
					></el-input>
				</el-form-item>
				<el-form-item
					label="负责人"
					prop="user"
				>
					<el-select
						placeholder="请选择部门负责人"
						v-model="deptForm.user"
						@change="handleUser"
					>
						<el-option
							v-for="item in userList"
							:key="item.userId"
							:label="item.userName"
							:value="`${item.userId}/${item.userName}/${item.userEmail}`"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item
					label="负责人邮箱"
					prop="userEmail"
				>
					<el-input
						placeholder="请输入负责人邮箱"
						v-model="deptForm.userEmail"
						disabled
					></el-input>
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="handleClose">取消</el-button>
					<el-button
						type="primary"
						@click="handleSubmit"
						>确定</el-button
					>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script>
import util from '@/utils/toolUtils'
export default {
	name: 'Dept',
	data() {
		return {
			pager: {
				pageSize: 10,
				pageNum: 1,
			},
			deptList: [],
			userList: [],
			queryForm: {
				deptName: '',
			},
			columns: [
				{
					label: '部门名称',
					prop: 'deptName',
				},
				{
					label: '负责人',
					prop: 'userName',
				},
				{
					label: '更新时间',
          prop: 'updateTime',
          formatter(row, column, val) {
						return util.formateDate(new Date(val))
					}
				},
				{
					label: '创建时间',
          prop: 'createTime',
          formatter(row, column, val) {
						return util.formateDate(new Date(val))
					},
				},
			],
			rules: {
				parentId: [
					{ required: true, message: '请选择上级部门', trigger: 'blur' },
				],
				deptName: [
					{ required: true, message: '请输入部门名称', trigger: 'blur' },
				],
				user: [
					{ required: true, message: '请选择部门负责人', trigger: 'blur' },
				],
			},
			action: '',
			dialogVisible: false,
			deptForm: {
				parentId: [null],
			},
		}
	},
	mounted() {
		this.getDeptList()
		this.getUserList()
	},
	methods: {
		async getDeptList() {
			let list = await this.$api.getDeptList(this.queryForm)
			this.deptList = list
		},
		async getUserList() {
			let list = await this.$api.getAllUserList()
			this.userList = list
		},
		handleEdit(row) {
			this.action = 'edit'
			this.dialogVisible = true
			this.$nextTick(() => {
				Object.assign(this.deptForm, row, {
					user: `${row.userId}/${row.userName}/${row.userEmail}`,
				})
			})
		},
		async handleDel(_id) {
			let res = await this.$api.deptSubmit({ _id, action: 'delete' })
			this.$message.success('删除成功')
			this.getDeptList()
		},
		handleReset(form) {
			this.$refs[form].resetFields()
		},
		handleOpen() {
			this.action = 'create'
			this.dialogVisible = true
		},
		handleClose() {
			this.dialogVisible = false
			this.handleReset('dialogForm')
		},
		handleSubmit() {
			this.$refs.dialogForm.validate(async (valid) => {
				if (valid) {
					let params = { ...this.deptForm, action: this.action }
					delete params.user
          await this.$api.deptSubmit(params);
          params.action == 'create' ? this.$message.success('创建成功') : this.$message.success('编辑成功');
          this.handleClose();
          this.getDeptList();
				}
			})
		},
		handleUser(val) {
			const [userId, userName, userEmail] = val.split('/')
			Object.assign(this.deptForm, { userId, userName, userEmail })
		},
	},
}
</script>

<style lang="scss"></style>
