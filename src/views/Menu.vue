<template>
	<div class="menu-manager">
		<div class="query-form">
			<el-form
				ref="form"
				:inline="true"
				:model="queryForm"
			>
				<el-form-item
					label="菜单名称"
					prop="menuName"
				>
					<el-input
						v-model="queryForm.menuName"
						placeholder="请输入菜单名称"
					/>
				</el-form-item>
				<el-form-item
					label="菜单状态"
					prop="menuState"
				>
					<el-select v-model="queryForm.menuState">
						<el-option
							:value="1"
							label="正常"
						></el-option>
						<el-option
							:value="2"
							label="停用"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button
						type="primary"
						@click="handleQuery"
						>查询</el-button
					>
					<el-button
						type="danger"
						@click="handleReset('form')"
						>重置</el-button
					>
				</el-form-item>
			</el-form>
		</div>
		<div class="base-table">
			<div class="action">
				<el-button
					type="primary"
					@click="handleAdd(1)"
					>新增</el-button
				>
			</div>
			<el-table
				:data="menuList"
				row-key="_id"
				:tree-props="{ children: 'children' }"
			>
				<el-table-column
					v-for="item in columns"
					:key="item.prop"
					:prop="item.prop"
					:label="item.label"
					:width="item.width"
					:formatter="item.formatter"
				/>
				<el-table-column
					fixed="right"
					label="操作"
					width="250"
				>
					<template #default="scope">
						<el-button
							type="primary"
							size="small"
							@click="handleAdd(2, scope.row)"
							>新增</el-button
						>
						<el-button
							type="primary"
							size="small"
							@click="handleEdit(scope.row)"
							>编辑</el-button
						>
						<el-button
							type="danger"
							size="small"
							@click="handleDel(scope.row._id)"
							>删除</el-button
						>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<el-dialog
			:title="action ? '菜单新增' : '编辑菜单'"
			v-model="dialogVisible"
		>
			<el-form
				ref="dialogForm"
				:model="menuForm"
				label-width="100px"
				:rules="rules"
			>
				<el-form-item
					label="父级菜单"
					prop="parentId"
				>
					<el-cascader
						v-model="menuForm.parentId"
						:options="menuList"
						:props="{ checkStrictly: true, value: '_id', label: 'menuName' }"
						clearable
					/>
					<span>默认创建一级菜单</span>
				</el-form-item>
				<el-form-item
					label="菜单类型"
					prop="menuType"
				>
					<el-radio-group v-model="menuForm.menuType">
						<el-radio :label="1">菜单</el-radio>
						<el-radio :label="2">按钮</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item
					label="菜单名称"
					prop="menuName"
				>
					<el-input
						v-model="menuForm.menuName"
						placeholder="请输入菜单名称"
					/>
				</el-form-item>
				<el-form-item
					label="菜单图标"
					prop="icon"
					v-show="menuForm.menuType == 1"
				>
					<el-input
						v-model="menuForm.icon"
						placeholder="请输入图标"
					/>
				</el-form-item>
				<el-form-item
					label="路由地址"
					prop="path"
					v-show="menuForm.menuType == 1"
				>
					<el-input
						v-model="menuForm.path"
						placeholder="请输入路由地址"
					/>
				</el-form-item>
				<el-form-item
					label="权限标识"
					prop="menuCode"
					v-show="menuForm.menuType == 2"
				>
					<el-input
						v-model="menuForm.menuCode"
						placeholder="请输入权限标识"
					/>
				</el-form-item>
				<el-form-item
					label="组件路径"
					prop="component"
					v-show="menuForm.menuType == 1"
				>
					<el-input
						v-model="menuForm.component"
						placeholder="请输入组件路径"
					/>
				</el-form-item>
				<el-form-item
					label="菜单状态"
					prop="menuState"
				>
					<el-radio-group v-model="menuForm.menuState">
						<el-radio :label="1">正常</el-radio>
						<el-radio :label="2">停用</el-radio>
					</el-radio-group>
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
import util from '@/utils/toolUtils'
export default {
	name: 'Menu',
	data() {
		return {
			dialogVisible: false,
			action: '',
			queryForm: {
				menuState: 1,
			},
			menuList: [],
			columns: [
				{
					label: '菜单名称',
					prop: 'menuName',
					width: 180,
				},
				{
					label: '图标',
					prop: 'icon',
				},
				{
					label: '菜单类型',
					prop: 'menuType',
					formatter(row, column, val) {
						return {
							1: '菜单',
							2: '按钮',
						}[val]
					},
				},
				{
					label: '权限标识',
					prop: 'menuCode',
				},
				{
					label: '路由地址',
					prop: 'path',
				},
				{
					label: '组件路径',
					prop: 'component',
				},
				{
					label: '菜单状态',
					prop: 'menuState',
					formatter(row, column, val) {
						return {
							1: '正常',
							2: '停用',
						}[val]
					},
				},
				{
					label: '创建时间',
					prop: 'createTime',
					formatter(row, column, val) {
						return util.formateDate(new Date(val))
					},
				},
			],
			menuForm: {
        parentId: [null],
        menuType: 1,
        menuState: 1,
      },
			rules: {
				menuName: [
					{
						required: true,
						message: '请输入菜单名称',
						trigger: 'blur',
					},
					{
						min: 2,
						max: 10,
						message: '长度在2-10个字符',
						trigger: 'blur',
					},
				],
			},
		}
	},
	mounted() {
		this.getMenuList()
	},
	methods: {
		//菜单列表初始化
		async getMenuList() {
			try {
				let list = await this.$api.getmenuList(this.queryForm)
				this.menuList = list
			} catch (error) {
				throw new Error(error)
			}
		},
		handleQuery() {
			this.getMenuList()
		},
		handleReset(form) {
			this.$refs[form].resetFields()
		},
		handleAdd(type, row) {
			this.dialogVisible = true
			this.action = 'add'
			if (type == 2) {
				this.menuForm.parentId = [...row.parentId, row._id].filter(
					(item) => item
				)
			}
		},
		handleEdit(row) {
			this.dialogVisible = true
			this.action = 'edit'
			this.$nextTick(() => {
				Object.assign(this.menuForm, row)
			})
		},
		async handleDel(_id) {
			await this.$api.menuSubmit({ _id, action: 'delete' })
			this.$message.success('删除成功')
			this.getMenuList()
		},
		handleSubmit() {
			this.$refs.dialogForm.validate(async (valid) => {
				if (valid) {
					let { action, menuForm } = this
					let params = {
						...menuForm,
						action,
					}
					await this.$api.menuSubmit(params)
					this.dialogVisible = false
					action == 'add' ? this.$message.success("新增成功") : this.$message.success("编辑成功")
					this.handleReset('dialogForm')
					this.getMenuList()
				}
			})
		},
		handleClose() {
			this.dialogVisible = false
			this.handleReset('dialogForm')
		}
	},
}
</script>

<style lang="scss"></style>
