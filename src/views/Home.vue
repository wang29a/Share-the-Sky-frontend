<template>
  <n-page-header subtitle="「同一片天空下」" @back="handleBack">
    <template #title>
      <a
        href="https://github.com/bridge71/Share-the-Sky"
        style="text-decoration: none; color: inherit"
      >Share-the-Sky</a>
    </template>
    <!-- <template #footer>
      <n-breadcrumb>
        <n-breadcrumb-item :clickable="true" :href="1">播客</n-breadcrumb-item>
        <n-breadcrumb-item>精选</n-breadcrumb-item>
        <n-breadcrumb-item>超级精选</n-breadcrumb-item>
        <n-breadcrumb-item>Share-the-Sky</n-breadcrumb-item>
      </n-breadcrumb>
    </template> -->
    <template #extra>
      <n-space>
      <n-dropdown :options="options" @select="handleSelect">
        <n-button>用户</n-button>
      </n-dropdown>
      </n-space>
    </template>
    <!-- <template #avatar>
      <n-avatar
        src="https://cdnimg103.lizhi.fm/user/2017/02/04/2583325032200238082_160x160.jpg"
      />
    </template> -->
  </n-page-header>
    <n-layout>
      <n-layout-content style="padding: 24px;">
        <!-- <div>
          <n-upload >
            <n-button @click="upLoadFile">点击上传文件</n-button>
          </n-upload>
        </div> -->
        <div>
          <label for="uploadPath">上传路径:</label>
          <input type="text" id="uploadPath" v-model="uploadPath">
        </div>
        <div>
          <input type="file" @change="handleFileChange" ref="fileInput">
          <n-button @click="upLoadFile">上传文件</n-button>
        </div>
        <n-data-table
          :columns="columns"
          :data="data"
          :pagination="pagination"
          :bordered="false"
        />
      </n-layout-content>
    </n-layout>
</template>

<script>
import { h, defineComponent, computed, onMounted, ref } from "vue";
import { NIcon, NDropdown, NButton } from "naive-ui";
import { useRouter } from 'vue-router';
import axios from 'axios';
import {
  PersonCircleOutline as UserIcon,
  Pencil as EditIcon,
  LogOutOutline as LogoutIcon
} from "@vicons/ionicons5";

const renderIcon = (icon) => {
  return () => {
    return h(NIcon, null, {
      default: () => h(icon)
    });
  };
};

export default defineComponent({
  setup() {
    const router = useRouter();
    const isAdmin = computed(() => sessionStorage.getItem("isAdmin") === "true");
    const data = ref([]);
    const selectedFile = ref(null);
    const fileInput = ref(null);
    const uploadPath = ref(''); // 上传路径
    
    const fetchFiles = async () => {
      try {
        console.log("get file list");
        console.log("check Login Status, token:", sessionStorage.getItem('userToken'));
        const userToken = sessionStorage.getItem('userToken');
        console.log("path:", "/");
        const response = await 
        axios.post('/file/list', {path:"/", userId:userToken});
        data.value = response.data; // 使用后端返回的文件列表
      } catch (error) {
        console.error('获取文件列表失败:', error);
      }
    };

    const checkLoginStatus = () => {
      const token = sessionStorage.getItem('userToken');
      console.log("check Login Status, token:", sessionStorage.getItem('userToken'))
      if (token == null) {
        router.push({ name: 'Login' });
      }
    }
    
    onMounted(fetchFiles);
    onMounted(checkLoginStatus);


    const downloadFile = (row) => {
      // 实现下载文件的逻辑
      const userToken = sessionStorage.getItem('userToken');
      console.log("下载文件:", row.fileName, row.fileId, userToken);
      axios.get('/file/download', {
        params: {
          userid: userToken,
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

    const deleteFile = (row) => {
      // 实现删除文件的逻辑
      console.log("删除文件:", row.fileName);
      const userToken = sessionStorage.getItem("userToken")
      axios.post('file/delete', {
        "userId":userToken,
        "fileId":row.fileId
      }).then(response => {
        console.log("删除成功", response);
      }).catch(error => {
        console.log("删除失败", error);
      });
    };

    // 处理文件选择事件
    const handleFileChange = (event) => {
      selectedFile.value = event.target.files[0];
    };
    // 处理文件上传
    const upLoadFile = () => {
      if (selectedFile.value && uploadPath.value) {
        const formData = new FormData();
        formData.append('file', selectedFile.value);
        console.log("file:", selectedFile.value)
        console.log("path:", uploadPath.value)
        console.log("userId:", sessionStorage.getItem("userToken"))
        const userToken = sessionStorage.getItem('userToken');
        formData.append('path', uploadPath.value); // 添加上传路径到 FormData
        formData.append('userId', userToken); // 添加上传路径到 FormData
        axios.post('/file/add', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
        }).then(response => {
          console.log('上传成功', response);
        }).catch(error => {
          console.error('上传失败', error);
        });
      } else {
        console.log('请选择文件和设置上传路径');
      }
      fetchFiles();
    };

    const createColumns = () => {
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


    const handleSelect = (key) => {
      console.log("key:", key)
      switch (key) {
        case 'profile':
          // 执行查看用户资料的逻辑
          console.log('查看用户资料');
          break;
        case 'editProfile':
          // 执行编辑用户资料的逻辑
          console.log('编辑用户资料');
          router.push('/edit-profile');
          break;
        case 'admin':
          // 后台管理
          // sessionStorage.setItem("isAdmin", true);
          console.log('后台管理');
          if (isAdmin.value) {
            router.push('/admin');
          }
          break;
        case 'logout':
          // 执行退出登录的逻辑
          console.log('退出登录');
          sessionStorage.removeItem("userToken");
          sessionStorage.removeItem("isAdmin");
          router.push('/login');
          break;
        default:
          console.log('未知操作');
      }
    };

    const options = computed(() => [
      {
        label: "用户资料",
        key: "profile",
        icon: renderIcon(UserIcon)
      },
      {
        label: "编辑用户资料",
        key: "editProfile",
        icon: renderIcon(EditIcon)
      },
      {
        label: "后台管理",
        key: "admin",
        icon: renderIcon(EditIcon),
        show: isAdmin.value
      },
      {
        label: "退出登录",
        key: "logout",
        icon: renderIcon(LogoutIcon)
      }
    ]);

        
    return {
      data,
      columns: createColumns(),
      pagination: false,
      fileInput,
      selectedFile,
      uploadPath,
      upLoadFile,
      handleFileChange,
      options,
      handleSelect,
    };
  }
});
</script>