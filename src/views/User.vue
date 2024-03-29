<template>
	<div class="user-manager">
		<div class="query-form">
			<query-form :form="userForm" v-model="user" @handleQuery="handleQuery"></query-form>
		</div>
		<base-table
			:columns="columns"
			:data="userList"
			:pager="pager"
			@selection-change="handleSelectChange" 
			@handleAction="handleAction"
			@handleCurrentChange="handleCurrentChange"
		>
			<template #action>
				<el-button
					type="primary"
					@click="handleCreate"
					>新增</el-button
				>
				<el-button
					type="danger"
					@click="handlePathDel"
					>批量删除</el-button
				>
			</template>
		</base-table>
		<el-dialog
			:title="action == 'add' ? '用户新增' : '编辑用户'"
			v-model="dialogVisible"
		>
			<el-form
				ref="newUserInfo"
				:model="newUserForm"
				label-width="100px"
				:rules="rules"
			>
				<el-form-item
					label="用户名"
					prop="userName"
				>
					<el-input
						v-model="newUserForm.userName"
						:disabled="action == 'edit'"
						placeholder="请输入用户名称"
					/>
				</el-form-item>
				<el-form-item
					label="邮箱"
					prop="userEmail"
				>
					<el-input
						v-model="newUserForm.userEmail"
						:disabled="action == 'edit'"
						placeholder="请输入用户邮箱"
					>
						<template
							#append
							v-if="action == 'add'"
							>@qq.com</template
						>
					</el-input>
				</el-form-item>
				<el-form-item
					label="手机号"
					prop="mobile"
				>
					<el-input
						v-model="newUserForm.mobile"
						placeholder="请输入手机号"
					/>
				</el-form-item>
				<el-form-item
					label="岗位"
					prop="job"
				>
					<el-input
						v-model="newUserForm.job"
						placeholder="请输入岗位"
					/>
				</el-form-item>
				<el-form-item
					label="状态"
					prop="state"
				>
					<el-select
						v-model="newUserForm.state"
						placeholder="请选择状态"
					>
						<el-option
							:value="1"
							label="在职"
						></el-option>
						<el-option
							:value="2"
							label="离职"
						></el-option>
						<el-option
							:value="3"
							label="试用期"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item
					label="系统角色"
					prop="roleList"
				>
					<el-select
						v-model="newUserForm.roleList"
						multiple
						style="width: 100%"
						placeholder="请选择用户系统角色"
					>
						<el-option
							v-for="role in roleList"
							:key="role._id"
							:label="role.roleName"
							:value="role._id"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item
					label="部门"
					prop="deptId"
				>
					<el-cascader
						v-model="newUserForm.deptId"
						placeholder="请选择所属部门"
						:options="deptList"
						:props="{ checkStrictly: true, value: '_id', label: 'deptName' }"
						clearable
						style="width: 100%"
					></el-cascader>
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="handleClose">取消</el-button>
					<el-button
						type="primary"
						@click="handleSubmit"
					>
						确定
					</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script>
import { getCurrentInstance, onMounted, ref, reactive, toRaw } from 'vue'
import util from '@/utils/toolUtils'
export default {
	name: 'User',
	setup() {
		const { proxy } = getCurrentInstance()
		const user = reactive({
			state: 1,
		})
		const userList = ref([])
		//定义动态表格-格式
		const columns = reactive([
			{
				type: 'selection',
			},
			{
				label: '用户ID',
				prop: 'userId',
			},
			{
				label: '用户名',
				prop: 'userName',
			},
			{
				label: '用户邮箱',
				prop: 'userEmail',
			},
			{
				label: '用户角色',
				prop: 'role',
				formatter(row, column, value) {
					return {
						0: '管理员',
						1: '普通用户',
					}[value]
				},
			},
			{
				label: '用户状态',
				prop: 'state',
				formatter(row, column, value) {
					return {
						1: '在职',
						2: '离职',
						3: '试用期',
					}[value]
				},
			},
			{
				label: '注册时间',
				prop: 'createTime',
				formatter: (row, column, val) => {
					return util.formateDate(new Date(val))
				},
			},
			{
				label: '最后登录时间',
				prop: 'lastLoginTime',
				formatter: (row, column, val) => {
					return util.formateDate(new Date(val))
				},
			},
			{
				type: 'action',
				label: '操作',
				width: 200,
				list: [
					{
						type: 'primary',
						text: '编辑',
						visible: true,
					},
					{
						type: 'danger',
						text: '删除',
						visible: true,
					},
				],
			},
		])
		const userForm = [
			{
				type: 'input',
				label: "用户ID",
				model: 'userId',
				placeholder: "请输入用户ID"
			},
			{
				type: 'input',
				label: "用户名称",
				model: 'userName',
				placeholder: "请输入用户名称"
			},
			{
				type: 'select',
				label: "状态",
				model: 'state',
				placeholder: "请选择状态",
				options: [
					{
						label: "所有",
						value: 0
					},
					{
						label: "在职",
						value: 1
					},
					{
						label: "离职",
						value: 2
					},
					{
						label: "试用期",
						value: 3
					},
				]
			},
		]
		//初始化分页对象
		const pager = reactive({
			pageNum: 1,
			pageSize: 10,
		})
		//选择用户
		const checkUser = ref([])
		onMounted(() => {
			getUserList()
			getRoleList()
			getDeptList()
		})
		//获取用户列表
		const getUserList = async () => {
			let params = { ...user.value, ...pager }
			try {
				const { list, page } = await proxy.$api.getuserList(params)
				userList.value = list
				pager.total = page.total
			} catch (error) {
				console.log(error)
			}
		}
		//查询, 获取用户列表
		const handleQuery = (values) => {
			getUserList(values)
		}
		//重置查询表单
		const handleReset = (form) => {
			proxy.$refs[form].resetFields()
		}
		//分页事件处理
		const handleCurrentChange = (current) => {
			pager.pageNum = current
		}
		//用户单个删除
		const handleDel = async (row) => {
			await proxy.$api.userDel({
				userIds: [row.userId],
			})
			proxy.$message.success('删除成功')
			getUserList()
		}
		//批量删除
		const handlePathDel = async () => {
			if (checkUser.value.length == 0) {
				proxy.$message.error('请选择要删除的用户')
				return
			}
			const res = await proxy.$api.userDel({
				userIds: checkUser.value,
			})
			if (res.nModified > 0) {
				proxy.$message.success('删除成功')
				getUserList()
			} else {
				proxy.$message.error('删除失败')
			}
		}
		//多选
		const handleSelectChange = (list) => {
			console.log(list)
			let arr = []
			list.map((item) => {
				arr.push(item.userId)
			})
			checkUser.value = arr
		}
		//新增弹框
		const dialogVisible = ref(false)
		//新增用户form对象
		const newUserForm = reactive({
			state: 3,
		})
		//定义表单校验
		const rules = reactive({
			userName: [
				{ required: true, message: '请输入用户名称', trigger: 'blur' },
			],
			userEmail: [
				{ required: true, message: '请输入用户邮箱', trigger: 'blur' },
			],
			mobile: [
				{
					pattern:
						/^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/,
					message: '请输入正确的手机号格式',
					trigger: 'blur',
				},
			],
			deptId: [{ required: true, message: '请选择部门', trigger: 'blur' }],
		})
		//用户新增
		const handleCreate = () => {
			action.value = 'add'
			dialogVisible.value = true
		}
		//所有部门
		const deptList = ref([])
		//获取部门列表
		const getDeptList = async () => {
			let list = await proxy.$api.getDeptList()
			deptList.value = list
		}
		//所有角色列表
		const roleList = ref([])
		//获取角色列表
		const getRoleList = async () => {
			let list = await proxy.$api.getRoleAllList()
			roleList.value = list
		}
		//弹窗取消
		const handleClose = () => {
			dialogVisible.value = false
			handleReset('newUserInfo')
		}
		//定义表单操作行为
		const action = ref('add')
		//用户提交
		const handleSubmit = () => {
			proxy.$refs.newUserInfo.validate(async (valid) => {
				if (valid) {
					let params = toRaw(newUserForm)
					params.userEmail += action.value == 'add' ? '@qq.com' : ''
					params.action = action.value
					let res = proxy.$api.userSubmit(params)
					if (res) {
						action.value == 'add'
							? proxy.$message.success('用户创建成功')
							: proxy.$message.success('编辑成功')
						handleClose()
						getUserList()
					}
				}
			})
		}
		//编辑用户信息
		const handleEdit = (row) => {
			action.value = 'edit'
			dialogVisible.value = true
			proxy.$nextTick(() => {
				Object.assign(newUserForm, row)
			})
		}
		const handleAction = ({ index, row }) => {
			if (index == 0) {
				handleEdit(row)
			} else if (index == 1) {
				handleDel(row)
			}
		}
		return {
			user,
			userList,
			columns,
			pager,
			checkUser,
			userForm,
			newUserForm,
			dialogVisible,
			rules,
			action,
			roleList,
			deptList,
			handleQuery,
			handleReset,
			handleCurrentChange,
			handleDel,
			handlePathDel,
			handleSelectChange,
			handleCreate,
			handleClose,
			handleSubmit,
			handleEdit,
			handleAction,
		}
	},
}
</script>

<style lang="scss"></style>
