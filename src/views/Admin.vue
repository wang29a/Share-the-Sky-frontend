<template>
  <n-page-header subtitle="后台管理" @back="handleBack">
    <template #title>
      <a
        href="https://github.com/bridge71/Share-the-Sky"
        style="text-decoration: none; color: inherit"
      >Share-the-Sky</a>
    </template>
  </n-page-header>
  <n-layout style="height: 100vh;" has-sider>
    <n-layout-sider bordered width="200px">
      <n-menu 
        default-value="1" 
        default-expand-all="true"
        @update:value="handleMenuSelect"
        :options="menuOptions" 
      />
    </n-layout-sider>
    <n-layout-content>
      <div v-if="selectedMenu === 'default'">
        <n-space vertical>
          <n-card title="小卡片" size="small">
            在线文件管理系统,基于drogon的C++,vue前端
          </n-card>
          <n-card title="中卡片" size="medium">
            卡片内容
          </n-card>
          <n-card title="大卡片" size="large">
            卡片内容
          </n-card>
          <n-card title="超大卡片" size="huge">
            卡片内容
          </n-card>
          <n-card title="卡片" hoverable>
            卡片内容
          </n-card>
        </n-space>
      </div>
      <div v-if="selectedMenu === 'user-manage'">
        <!-- 用户管理相关内容 -->
        <n-data-table
          :columns="userColumns"
          :data="userData"
          :pagination="pagination"
          :bordered="false"
        />
      </div>
      <div v-if="selectedMenu === 'import'">
        <!-- 用户添加相关内容 -->
        <n-form
          ref="addUserFormRef"
          inline
          :label-width="80"
          :model="addUserFormValue"
          :size="size"
        >
          <n-form-item label="用户" path="user.name">
            <n-input v-model:value="addUserFormValue.userName" placeholder="输入userName" />
          </n-form-item>
          <n-form-item label="密码" path="user.password">
            <n-input v-model:value="addUserFormValue.passWord" placeholder="输入password" />
          </n-form-item>
          <n-form-item label="邮箱" path="user.email">
            <n-input v-model:value="addUserFormValue.email" placeholder="输入email" />
          </n-form-item>
          <n-form-item>
            <n-button attr-type="button" @click="addUser">
              添加用户
            </n-button>
          </n-form-item>
        </n-form>
      </div>
      <div v-if="selectedMenu === 'file-management'">
        <!-- 文件管理相关内容 -->
        <n-data-table
          :columns="fileColumns"
          :data="fileData"
          :pagination="pagination"
          :bordered="false"
        />
      </div>
    </n-layout-content>
  </n-layout>
  <n-modal v-model:show="showModal">
    <n-card
      style="width: 600px"
      title="拥有此文件的用户"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
      <n-data-table
        :columns="ownerColumns"
        :data="ownerData"
        :pagination="pagination"
        :bordered="false"
      />
    </n-card>
  </n-modal>
  <n-modal v-model:show="modifyUserShowModal">
    <n-card
      style="width: 600px"
      title="修改用户信息"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
    <n-form
      ref="userFormRef"
      inline
      :label-width="80"
      :model="userFormValue"
      :size="size"
    >
      <n-form-item label="用户" path="user.name">
        <n-input v-model:value="userFormValue.userName" placeholder="输入userName" />
      </n-form-item>
      <n-form-item label="密码" path="user.password">
        <n-input v-model:value="userFormValue.passWord" placeholder="输入password" />
      </n-form-item>
      <n-form-item label="邮箱" path="user.email">
        <n-input v-model:value="userFormValue.email" placeholder="输入email" />
      </n-form-item>
      <n-form-item>
        <n-button attr-type="button" @click="modifyUser">
          修改
        </n-button>
      </n-form-item>
    </n-form>
    </n-card>
  </n-modal>
</template>

<script>
import { ref, defineComponent, h, onMounted, computed } from 'vue';
import { NIcon, create, NDropdown, NButton } from "naive-ui";
import axios from 'axios';
import { useRouter } from 'vue-router';

import { useMessage } from "naive-ui";
import {
  BookOutline as BookIcon,
  PersonOutline as PersonIcon,
  WineOutline as WineIcon
} from "@vicons/ionicons5";

function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

const menuOptions = [
  {
    label: "用户管理",
    key: "user-management",
    icon: renderIcon(PersonIcon),
    children: [
      {
        label: "管理",
        key: "user-manage"
      },
      {
        label: "导入",
        key: "import"
      },
    ]
  },
  {
    label: "文件管理",
    key: "file-management",
    icon: renderIcon(BookIcon),
  },
];

export default defineComponent({
  setup() {
    const router = useRouter();
    const userData = ref([]);
    const fileData = ref([]);
    const ownerData = ref([]);
    const message = useMessage();
    const selectedMenu = ref('default');
    const ShowModel = ref(false);
    const modifyUserShowModel = ref(false);
    const userFormRef = ref(null);
    const userFormValue = ref({
      userId: "",
      userName:"",
      passWord:"",
      email:"",
    });
    const addUserFormRef = ref(null);
    const addUserFormValue = ref({
      userId: "",
      userName:"",
      passWord:"",
      email:"",
    });


    const handleMenuSelect = (key) => {
      console.log("menu key:", key)
      selectedMenu.value = key;
    };
    
    const fetchFiles = async () => {
      try {
        console.log("get file list");
        console.log("check Login Status, token:", sessionStorage.getItem('userToken'));
        const userToken = sessionStorage.getItem('userToken');
        console.log("path:", "/");
        const response = await 
        axios.post('/file/alllist', {userId:userToken});
        fileData.value = response.data; // 使用后端返回的文件列表
      } catch (error) {
        message.error("获取文件按列表失败");
        console.error('获取文件列表失败:', error);
      }
    };

    const fetchUser = async () => {
      try {
        console.log("get user list");
        console.log("check Login Status, token:", sessionStorage.getItem('userToken'));
        const userToken = sessionStorage.getItem('userToken');
        console.log("path:", "/");
        const response = await 
        axios.post('/drogon/user/listall', {path:"/", userId:userToken});
        userData.value = response.data; // 使用后端返回的用户列表
      } catch (error) {
        console.error('获取用户列表失败:', error);
        message.error("获取用户列表失败");
      }
    };
    onMounted(fetchFiles);
    onMounted(fetchUser);
    const downloadFile = (row) => {
      console.log("fileId:", row.fileId);
      axios.get('/file/download/admin', {
        params: {
          fileid: row.fileId
        },
        responseType: 'blob' // 重要: 设置响应类型为 blob
      }).then(response => {
        // console.log("下载中",response);
        const url = window.URL.createObjectURL(new Blob([response.data]));
        // 创建一个链接用于下载
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', row.fileName); // 设置下载文件名
        document.body.appendChild(link);
        link.click(); // 模拟点击进行下载
        document.body.removeChild(link); // 下载完成后移除元素
        window.URL.revokeObjectURL(url); // 释放URL对象
      }).catch(error => {
        message.error("出错了");
        console.log("出错了", error);
      });
    };

    const handleBack = () => {
      router.push({name: 'Home'});
    }

    const viewFile = (row) => {
      console.log("查看文件信息：", row.fileId);
      console.log("文件名：", row.fileName);
      console.log("文件信息：", row.fileType);
      axios.post("/file/list/owners", {
        "fileId" : parseInt(row.fileId),
        "userId" : sessionStorage.getItem("userToken")
      })
      .then(response => {
          console.log("展示")
          console.log(response.data);
          ownerData.value = response.data;
          ShowModel.value = true;
      })
      .catch(error => {
        message.error("查看失败");
        console.error("查看失败", error)
      });
    };

    const deleteFile = (row) => {
      console.log("删除文件信息：", row.fileId);
      console.log("文件名：", row.fileName);
      console.log("文件信息：", row.fileType);
      axios.post("/file/deleteadmin", {
        "fileId" : row.fileId
       // "userId" : sessionStorage.getItem("userToken")
      })
      .then(response => {
        if (response.data.status == 0){
          message.success("删除成功");
          console.log("删除成功")
          fetchFiles();
        }else{
          message.error("删除失败");
        }
      })
      .catch(error => {
         message.error("删除失败");
        console.error("删除文件失败", error)
      });

    };

    const setAdmin = (row) => {
      console.log("用户信息：", row.userId);
      console.log("用户名：", row.userName);
      console.log("用户信息：", row.userType);
      axios.post("/drogon/user/modify/permissions", {
        "userIdM" : row.userId,
        "userId" : sessionStorage.getItem("userToken"),
        "permission": "1",
      })
      .then(response => {
        if (response.data.status == 0){
          message.success("设置成功");
          console.log("设置成功")
          fetchUser();
        }
      })
      .catch(error => {
        message.error("设置失败");
        console.error("设置失败", error)
      });
    };

    const removeAdmin = (row) => {
      console.log("用户信息：", row.userId);
      console.log("用户名：", row.userName);
      console.log("用户信息：", row.userType);
      axios.post("/drogon/user/modify/permissions", {
        "userIdM" : row.userId,
        "userId" : sessionStorage.getItem("userToken"),
        "permission": "2",
      })
      .then(response => {
        if (response.data.status == 0){
          message.success("取消管理员成功");
          console.log("取消管理员成功")
          fetchUser();
        }else{
           message.error("取消管理员失败");
        }

      })
      .catch(error => {
        message.error("取消管理员失败");
        console.error("取消管理员失败", error)
      });
    };

    const deleteUser = (row) => {
      console.log("删除用户信息：", row.userId);
      console.log("用户名：", row.userName);
      console.log("用户信息：", row.userType);
      axios.post("/drogon/user/remove", {
        "removeUserId" : row.userId,
        "userId" : sessionStorage.getItem("userToken")
      })
      .then(response => {
        if (response.data.status == 0){
          message.success("删除用户成功");
          console.log("删除成功")
          fetchUser();
        }else{
          message.error("删除用户失败");
        }
      })
      .catch(error => {
        message.error("删除用户失败");
        console.error("删除用户失败", error)
      });
    };

    const showModifyUser = (row) => {
      console.log("修改用户信息：", row.userId);
      console.log("用户名：", row.userName);
      console.log("用户信息：", row.userType);
      userFormValue._value.userId = row.userId;
      userFormValue._value.userName = row.userName;
      userFormValue._value.passWord = row.passWord;
      userFormValue._value.email = row.email;
      modifyUserShowModel.value = true;
    };
    
    const modifyUser = () => {
      console.log(userFormValue._value.userName);
      console.log(userFormValue._value.passWord);
      console.log(userFormValue._value.email);
      axios.post("/drogon/user/modify", {
        "userIdM" : userFormValue._value.userId,
        "userId" : sessionStorage.getItem("userToken"),
        "userName" : userFormValue._value.userName,
        "passWord" : userFormValue._value.passWord,
        "email" : userFormValue._value.email,
      })
      .then(response => {
        if (response.data.status == 0){
          message.success("修改用户信息成功");
          console.log("修改成功")
          fetchUser();
        }else{
          message.error("修改用户信息失败，用户名/邮箱重复");
        }
      })
      .catch(error => {
        message.error("修改用户信息失败，用户名/邮箱重复");
        console.error("修改用户失败", error)
      });
    }

    const addUser = () => {
      console.log(addUserFormValue._value.userName);
      console.log(addUserFormValue._value.passWord);
      console.log(addUserFormValue._value.email);
      axios.post("/drogon/user/add", {
        "userId" : sessionStorage.getItem("userToken"),
        "userName" : addUserFormValue._value.userName,
        "passWord" : addUserFormValue._value.passWord,
        "email" : addUserFormValue._value.email,
      })
      .then(response => {
        if (response.data.status == 0){
          message.success("添加用户成功");
          console.log("添加成功")
          fetchUser();
        }else{
          message.error("添加用户失败，用户名/邮箱重复");
        }
      })
      .catch(error => {
        message.error("添加用户失败，用户名/邮箱重复");
        console.error("添加用户失败", error)
      });

    }

    const userTypeToString = (type) => {
      const typeMap = {
        '1': '管理员',
        '2': '普通用户',
        // 其他映射...
      };
      return typeMap[type] || '未知类型';
    };

    const createFileColumns = () => {
      return [
        {
          title: "文件名",
          key: "fileName"
        },
        {
          title: "类型",
          key: "fileType"
        },
        {
          title: "操作",
          key: "actions",
          render(row) {
            return [
              h(
                NButton,
                {
                  strong: true,
                  tertiary: true,
                  size: "small",
                  onClick: () => downloadFile(row)
                },
                { default: () => "Download" }
              ),
              h(
                NButton,
                {
                  strong: true,
                  tertiary: true,
                  size: "small",
                  onClick: () => viewFile(row)
                },
                { default: () => "Details" }
              ),
              h(
                NButton,
                {
                  strong: true,
                  tertiary: true,
                  type: "error",
                  size: "small",
                  onClick: () => deleteFile(row)
                },
                { default: () => "Delete" }
              )
            ];
          }
        }
      ];
    };
    const createUserColumns = () => {
      return [
        {
          title: "用户名",
          key: "userName"
        },
        {
          title: "类型",
          key: "userType",
          render(row) {
            return h('div', null, userTypeToString(row.userType));
          }
        },
        {
          title: "操作",
          key: "actions",
          render(row) {
            // 检查用户是否为管理员
            const isAdmin = row.userType === 1; // 假设管理员的 userType 为 '管理员'
            return [
              h(
                NButton,
                {
                  strong: true,
                  tertiary: true,
                  size: "small",
                  // onClick: () => setAdmin(row)
                  onClick: () => isAdmin ? removeAdmin(row) : setAdmin(row) // 如果是管理员则执行 removeAdmin，否则执行 setAdmin
                },
                // { default: () => "设为管理员" }
                { default: () => isAdmin ? "取消管理员" : "设为管理员" } // 按钮文本根据是否为管理员而变化
              ),
              h(
                NButton,
                {
                  strong: true,
                  tertiary: true,
                  type: "error",
                  size: "small",
                  onClick: () => showModifyUser(row)
                },
                { default: () => "修改" }
              ),
              h(
                NButton,
                {
                  strong: true,
                  tertiary: true,
                  type: "error",
                  size: "small",
                  onClick: () => deleteUser(row)
                },
                { default: () => "删除" }
              )
            ];
          }
        }
      ];
    };

    const createOwnerColumns = () => {
      return [
        {
          title: "用户名",
          key: "userName"
        },
      ];
    };

    return {
      selectedMenu,
      handleMenuSelect,
      activeKey: ref(null),
      collapsed: ref(true),
      menuOptions,
      userData,
      setAdmin,
      fileData,
      ownerData,
      fileColumns: createFileColumns(),
      userColumns: createUserColumns(),
      ownerColumns: createOwnerColumns(),
      handleBack,
      showModal: ShowModel,
      modifyUserShowModal: modifyUserShowModel,
      userFormRef,
      userFormValue,
      size: ref("medium"),
      modifyUser,
      addUserFormRef,
      addUserFormValue,
      addUser,
    };
  }
});
</script>
