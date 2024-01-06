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
          <n-carousel>
            <img
              class="carousel-img"
              src="https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel1.jpeg"
            >
            <img
              class="carousel-img"
              src="https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel2.jpeg"
            >
            <img
              class="carousel-img"
              src="https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel3.jpeg"
            >
            <img
              class="carousel-img"
              src="https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel4.jpeg"
            >
          </n-carousel>
        <n-space vertical>
          <n-card title="小卡片" size="small">
            卡片内容
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
</template>

<script>
import { ref, defineComponent, h, onMounted, computed } from 'vue';
import { NIcon, create, NDropdown, NButton } from "naive-ui";
import axios from 'axios';
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
    const userData = ref([]);
    const fileData = ref([]);
    const selectedMenu = ref('default');

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
        console.error('获取文件列表失败:', error);
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
        console.log("出错了", error);
      });
    };

    const handleBack = () => {

    }

    const viewFile = (row) => {

    };
    const deleteFile = (row) => {

    };
    const setAdmin = (row) => {

    };
    const deleteUser = (row) => {

    };

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
            return [
              h(
                NButton,
                {
                  strong: true,
                  tertiary: true,
                  size: "small",
                  onClick: () => setAdmin(row)
                },
                { default: () => "设为管理员" }
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
    return {
      selectedMenu,
      handleMenuSelect,
      activeKey: ref(null),
      collapsed: ref(true),
      menuOptions,
      userData,
      fileData,
      fileColumns: createFileColumns(),
      userColumns: createUserColumns(),
      handleBack,
    };
  }
});
</script>