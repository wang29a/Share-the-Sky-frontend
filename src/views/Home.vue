<template>
  <n-page-header subtitle="「同一片天空下」" @back="handleBack">
    <template #title>
      <a
        href="https://github.com/bridge71/Share-the-Sky"
        style="text-decoration: none; color: inherit"
      >Share-the-Sky</a>
    </template>
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

        <n-button @click="goBack">返回上一层</n-button>
        <n-breadcrumb>
          <n-breadcrumb-item
            v-for="(item, index) in currentPath"
            :key="index"
            @click="navigateTo(item, index)"
          >
            {{ item.name }}
          </n-breadcrumb-item>
        </n-breadcrumb>

        <n-data-table
          :columns="columns"
          :data="data"
          :pagination="pagination"
          :bordered="false"
        />
      </n-layout-content>
    </n-layout>
  <n-modal v-model:show="shareModelShowModel.value">
    <n-card
      style="width: 600px"
      title="文件分享链接"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
      {{ shareHref }}
    </n-card>
  </n-modal>
</template>

<script>
import { h, defineComponent, computed, onMounted, ref } from "vue";
import { NIcon, NDropdown, NButton } from "naive-ui";
import { useRouter } from 'vue-router';
import axios from 'axios';
import {
  PersonCircleOutline as UserIcon,
  Pencil as EditIcon,
  LogOutOutline as LogoutIcon,
  FolderOutline as FolderIcon,
  DocumentTextOutline as FileIcon
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
    const shareHref = ref('');
    const shareModelShowModel = ref([]);
    const currentPath = ref([{ name: '根目录', id: sessionStorage.getItem("root") }]);
    
    const fetchFiles = async () => {
      try {
        console.log("get file list");
        console.log("check Login Status, token:", sessionStorage.getItem('userToken'));
        const root = sessionStorage.getItem('root');
        console.log("path:", "/");
        const response = await 
        axios.post('/file/list', {path:"/", folderId: parseInt(root)});
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

    const shareFile = (row) => {
      // 实现分享文件的逻辑
      console.log("分享文件:", row.fileName);
      const userToken = sessionStorage.getItem("userToken")
      // axios.post('share/', {
      //   "userId":userToken,
      //   "fileId":row.fileId
      // }).then(response => {
        // console.log("分享成功", response);
        console.log("分享成功");
        shareModelShowModel.value = true;
      // }).catch(error => {
      //   console.log("分享失败", error);
      // });
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
      currentPath.value = currentPath.value.slice(0, 1);
    };

    const enterFolder = async (folder) => {
      console.log("进入文件夹:", folder.folderName);
      console.log("userId:", sessionStorage.getItem('userToken'));
      console.log("path:", );
      console.log("folderId:", folder.folderId);
      // 更新文件列表以显示文件夹内容
      try {
          const userToken = sessionStorage.getItem('userToken');
          const response = await axios.post('/file/list', {
            // userId: userToken,
            folderId: parseInt(folder.folderId) // 假设 folder 对象有 folderId 属性
          });
          data.value = response.data; // 更新文件列表
          currentPath.value.push({ name: folder.folderName, id: folder.folderId });
        } catch (error) {
          console.error('获取文件列表失败:', error);
        }
    };

    const navigateTo = async (item, index) => {
      // 更新当前路径到点击的面包屑项目
      currentPath.value = currentPath.value.slice(0, index + 1);

      console.log("进入文件夹:", item.name);
      console.log("userId:", sessionStorage.getItem('userToken'));
      console.log("path:", );
      console.log("folderId:", item.id);
      // 更新文件列表以显示文件夹内容
      try {
          const response = await axios.post('/file/list', {
            // userId: userToken,
            folderId: parseInt(item.id) // 假设 folder 对象有 folderId 属性
          });
          data.value = response.data; // 更新文件列表
        } catch (error) {
          console.error('获取文件列表失败:', error);
        }
    };
    
    const goBack = async () => {
      if (currentPath.value.length > 1) {
        currentPath.value.pop(); // 移除当前路径的最后一个元素
        const currentFolder = currentPath.value[currentPath.value.length - 1];
        try {
          // 根据新的当前文件夹获取文件列表
          // 如果根目录 id 为 null，需要相应处理
          const folderId = currentFolder.id;
          // 发送请求获取文件列表
          const response = await axios.post('/file/list', {
            // userId: userToken,
            folderId: parseInt(folderId) // 假设 folder 对象有 folderId 属性
          });
          data.value = response.data; // 更新文件列表
        } catch (error) {
          console.error('获取文件列表失败:', error);
        }
      }
    };

    const createColumns = () => {
      return [
        {
          title: "名称",
          key: "name",
          render(row) {
            const isFolder = row.type === "0"; // 假设 0 代表文件夹
            return h(
              'div',
              null,
              [
                h(
                  NIcon,
                  { size: '20' }, // 例如设置图标大小为 20
                  { default: () => isFolder ? h(FolderIcon) : h(FileIcon) }
                ),
                h('span', null, isFolder ? row.folderName : row.fileName)
              ]
            );
          }
        },
        // {
        //   title: "类型",
        //   key: "fileType"
        // },
        {
          title: "操作",
          key: "actions",
          render(row) {
            const isFolder = row.type === "0"; // 假设 0 代表文件夹
            if (isFolder) {
              return h(
                NButton,
                {
                  strong: true,
                  tertiary: true,
                  size: "small",
                  onClick: () => enterFolder(row)
                },
                { default: () => "进入" }
              );
            } else {
              return [
                h(
                  NButton,
                  {
                    strong: true,
                    tertiary: true,
                    size: "small",
                    onClick: () => downloadFile(row)
                  },
                  { default: () => "下载" }
                ),
                h(
                  NButton,
                  {
                    strong: true,
                    tertiary: true,
                    size: "small",
                    onClick: () => shareFile(row)
                  },
                  { default: () => "分享" }
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
                  { default: () => "删除" }
                )
              ];
            }
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
      shareModelShowModel,
      currentPath,
      enterFolder,
      navigateTo,
      goBack,
    };
  }
});
</script>