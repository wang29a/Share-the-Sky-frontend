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
          <n-button @click="jumpToShare">获得分享</n-button>
        </div>
        <div>
           <n-progress type="line" :percentage="percentage" processing/>
         </div>
         <n-row>
              <n-statistic label="剩余时间(秒)":value="duration">
              </n-statistic>
              <n-statistic label="速度(KiB/s)":value="speed">
              </n-statistic>
         </n-row>
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
    <n-modal
      v-model:show="showModal"
      :mask-closable="false"
      preset="card"
      title="文件分享"
      content="你确认"
    >
      <n-card
        style="width: 600px"
        title="文件分享信息"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <!-- <template #header-extra>
          噢！
        </template> -->
        <div>
          code:
          {{ shareHref.code }}
        </div>
        <div>
          id:
          {{ shareHref.id }}
        </div>
        
        <!-- <template #footer>
          尾部
        </template> -->
      </n-card>
    </n-modal>
  <n-modal v-model:show="userShowModal">
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
      disabled="true"
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
      </n-form-item>
    </n-form>
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
  <n-modal v-model:show="renameFolderShowModal">
    <n-card
      style="width: 600px"
      title="修改文件夹名"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
    <n-form
      ref="folderFormRef"
      inline
      :label-width="80"
      :model="folderFormValue"
      :size="size"
    >
      <n-form-item label="文件夹名" path="folder.name">
        <n-input v-model:value="folderFormValue.folderName" placeholder="输入folderName" />
      </n-form-item>
      <n-form-item>
        <n-button attr-type="button" @click="renameFolder">
          修改
        </n-button>
      </n-form-item>
    </n-form>
    </n-card>
  </n-modal>
</template>

<script>
import { h, defineComponent, computed, onMounted, ref } from "vue";
import { NIcon, NDropdown, NButton } from "naive-ui";
import { useRouter } from 'vue-router';
import { useMessage } from "naive-ui";
import axios from 'axios';
//import { defineComponent } from 'vue'
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
    const percentageRef = ref(0);
    const durationRef = ref(0);
    const speedRef = ref(0);
    const isAdmin = computed(() => sessionStorage.getItem("isAdmin") === "true");
    const data = ref([]);
    const selectedFile = ref(null);
    const fileInput = ref(null);
    const uploadPath = ref(''); // 上传路径
    const shareHref = ref('');
    const shareModelShowModel = ref(false);
    const currentPath = ref([{ name: '根目录', id: sessionStorage.getItem("root") }]);
    const message = useMessage();
    const modifyUserShowModel = ref(false);
    const UserShowModel = ref(false);
    const userFormRef = ref(null);
    const userFormValue = ref({
      userId: "",
      userName:"",
      passWord:"",
      email:"",
    });
    const renameFolderShowModel = ref(false);
    const folderFormRef = ref(null);
    const folderFormValue = ref({
      folderName:""
    });
    
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

      const startTime = new Date().getTime(); // 记录下载开始的时间
      let lastUpdateTime = startTime; // 上次更新时间
      const updateInterval = 1000; // 更新间隔（毫秒），这里设置为1秒
      console.log("下载文件:", row.fileName, row.fileId, userToken);
      axios.get('/file/download', {
        params: {
          userid: userToken,
          fileid: row.fileId
        },
        responseType: 'blob', // 重要: 设置响应类型为 blob

        onDownloadProgress: progressEvent => {
           const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
           console.log(`下载进度: ${percentCompleted}%`);
           percentageRef.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
           const currentTime = new Date().getTime();
           if (currentTime - lastUpdateTime > updateInterval) {
               lastUpdateTime = currentTime; // 更新上次更新时间
               const elapsed = (currentTime - startTime) / 1000; // 已经过去的时间（秒）
               const speed = progressEvent.loaded / elapsed; // 每秒下载字节数
               const remaining = progressEvent.total - progressEvent.loaded; // 剩余字节数
               const remainingTime = (remaining / speed).toFixed(2); // 剩余时间（秒）
           if(remainingTime < 1){
                   remainingTime = 0;
                   speed = 0;
           }
               durationRef.value = remainingTime;
               speedRef.value = (speed / 1024).toFixed(1);
               console.log(`剩余时间: ${remainingTime}秒`);
               console.log(`hh: ${speed}`);
           }
        }
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
        if(response.data.status == 0){
            message.success("删除成功");
        }else if(response.data.status == 2){
            message.error(response.data.error); 
        }
        console.log("删除成功", response);
        fetchFiles()
      }).catch(error => {
        console.log("删除失败", error);
      });
    };

    const shareFile = (row) => {
      // 实现分享文件的逻辑
      console.log("分享文件:", row.fileName);
      const userToken = sessionStorage.getItem("userToken");
      console.log("分享文件Id:", row.fileId);
      console.log("分享文件UserId:", userToken);
      console.log("分享文件:", row.fileName);
      axios.post('share', {
        "userId":parseInt(userToken),
        "fileId":parseInt(row.fileId),
        "time": 7*24,
        "fileName": row.fileName
      }).then(response => {
        console.log("分享成功", response);
        console.log("分享成功");
        shareModelShowModel.value = true;
        shareHref.value = {
          code : response.data.code,
          id : response.data.shareId
        }
      }).catch(error => {
        console.log("分享失败", error);
      });
    };
    const jumpToShare = () => {
        router.push('/sf');
        //router.push({name: 'Share'});
      
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

        onUploadProgress: progressEvent => {
           const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
           percentageRef.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
           console.log(`上传进度: ${percentCompleted}%`); 
           const currentTime = new Date().getTime();
           if (currentTime - lastUpdateTime > updateInterval) {
               lastUpdateTime = currentTime; // 更新上次更新时间
               const elapsed = (currentTime - startTime) / 1000; // 已经过去的时间（秒）
               const speed = progressEvent.loaded / elapsed; // 每秒下载字节数
               const remaining = progressEvent.total - progressEvent.loaded; // 剩余字节数
               const remainingTime = (remaining / speed).toFixed(2); // 剩余时间（秒）
               if(remainingTime < 1){
                       remainingTime = 0;
                       speed = 0;
               }
               durationRef.value = remainingTime;
               speedRef.value = (speed / 1024).toFixed(1);
               console.log(`剩余时间: ${remainingTime}秒`);
               console.log(`剩余时间hh: ${durationRef.value}秒`);
           }

        }    
        }).then(response => {
          
          console.log('上传成功', response);
          fetchFiles();
        }).catch(error => {
          console.error('上传失败', error);
        });
      } else if(selectedFile.value) {
        const formData = new FormData();
        formData.append('file', selectedFile.value);
        console.log("file:", selectedFile.value)
        console.log("path:", uploadPath.value)
        console.log("userId:", sessionStorage.getItem("userToken"))
        const userToken = sessionStorage.getItem('userToken');
        formData.append('path', "/"); // 添加上传路径到 FormData
        formData.append('userId', userToken); // 添加上传路径到 FormData
        axios.post('/file/add', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
        onUploadProgress: progressEvent => {
           const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
           percentageRef.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
           console.log(`上传进度: ${percentCompleted}%`); 
           const currentTime = new Date().getTime();
           if (currentTime - lastUpdateTime > updateInterval) {
               lastUpdateTime = currentTime; // 更新上次更新时间
               const elapsed = (currentTime - startTime) / 1000; // 已经过去的时间（秒）
               const speed = progressEvent.loaded / elapsed; // 每秒下载字节数
               const remaining = progressEvent.total - progressEvent.loaded; // 剩余字节数
               const remainingTime = (remaining / speed).toFixed(2); // 剩余时间（秒）
               if(remainingTime < 1){
                       remainingTime = 0;
                       speed = 0;
               }
               durationRef.value = remainingTime;
               speedRef.value = (speed / 1024).toFixed(1);
               console.log(`剩余时间: ${remainingTime}秒`);
               console.log(`剩余时间hh: ${durationRef.value}秒`);
           }

        }
        }).then(response => {
          if(response.data.status == 0){
              message.success("上传成功");
          }else if(response.data.status == 1){
              message.error(response.data.warning); 
          }else{
              message.error(response.data.error); 
          }
          console.log('上传成功', response);
          fetchFiles();
        }).catch(error => {
          console.error('上传失败', error);
        });
      } else {
        console.log('请选择文件和设置上传路径');
        message.error('请选择文件和设置上传路径');
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
          if(response.data.status == 1){
            message.warning(response.data.warning);
          }else{
              data.value = response.data; // 更新文件列表
              currentPath.value.push({ name: folder.folderName, id: folder.folderId });
          }
        } catch (error) {
          console.error('获取文件列表失败:', error);
        }
    };

    const showFolderRename = (row) => {
        console.log("id:", row.folderId)
        console.log("name:", row.folderName)
        folderFormValue._value.folderName = row.folderName;
        folderFormValue._value.folderId = row.folderId;
        renameFolderShowModel.value = true;
    }

    const renameFolder = async () => {
      console.log("进入文件夹:", );
      console.log("userId:", sessionStorage.getItem('userToken'));
      console.log("folderId:", folderFormValue._value.folderId);
      console.log("folder新名:", folderFormValue._value.folderName);
      try {
          const userToken = sessionStorage.getItem('userToken');
          const response = await axios.post('/folder/rename', {
            // userId: userToken,
            folderName: folderFormValue._value.folderName,
            folderId: parseInt(folderFormValue._value.folderId) // 假设 folder 对象有 folderId 属性
          });
          if(response.data.status == 1){
            message.warning(response.data.warning);
          }else{
            fetchFiles();
          }
        } catch (error) {
          console.error('获取文件列表失败:', error);
        }
    };
    const deleteFolder = async (row) => {
      console.log("进入文件夹:", row.folderName);
      console.log("userId:", sessionStorage.getItem('userToken'));
      console.log("folderId:", row.folderId);
      try {
          const userToken = sessionStorage.getItem('userToken');
          const response = await axios.post('/folder/delete', {
            // userId: userToken,
            folderId: parseInt(row.folderId) // 假设 folder 对象有 folderId 属性
          });
          if(response.data.status == 1){
            message.warning(response.data.warning);
          }else{
            fetchFiles();
          }
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
              return [ 
                h(
                  NButton,
                  {
                    strong: true,
                    tertiary: true,
                    size: "small",
                    onClick: () => enterFolder(row)
                  },
                  { default: () => "进入" }
                ),
                h(
                  NButton,
                  {
                    strong: true,
                    tertiary: true,
                    size: "small",
                    onClick: () => showFolderRename(row)
                  },
                  { default: () => "重命名" }
                ),
                h(
                  NButton,
                  {
                    strong: true,
                    tertiary: true,
                      type: "error",
                    size: "small",
                    onClick: () => deleteFolder(row)
                  },
                  { default: () => "删除" }
                )
              ];
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

    const check = () => {
      axios.post("/drogon/user/select",{
        userId: parseInt(sessionStorage.getItem("userToken"))
      }).then(response => {
        console.log(response.data.data);
        userFormValue._value.userId = response.data.data.userId;
        userFormValue._value.userName = response.data.data.userName;
        userFormValue._value.passWord = response.data.data.passWord;
        userFormValue._value.email = response.data.data.email;
        UserShowModel.value = true;
      })
      .catch(error => {

      });
    }

    const showModifyUser = () => {
      axios.post("/drogon/user/select",{
        userId: parseInt(sessionStorage.getItem("userToken"))
      }).then(response => {
        console.log("修改用户信息：", sessionStorage.getItem("userToken"));
        console.log("用户名：", response.data.data.userName);
        userFormValue._value.userId = response.data.data.userId;
        userFormValue._value.userName = response.data.data.userName;
        userFormValue._value.passWord = response.data.data.passWord;
        userFormValue._value.email = response.data.data.email;
        modifyUserShowModel.value = true;
      })
      .catch(error => {

      });
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
        }else{
          message.error("修改用户信息失败，用户名/邮箱重复");
        }
      })
      .catch(error => {
        message.error("修改用户信息失败，用户名/邮箱重复");
        console.error("修改用户失败", error)
      });
    }

    const handleSelect = (key) => {
      console.log("key:", key)
      switch (key) {
        case 'profile':
          // 执行查看用户资料的逻辑
          console.log('查看用户资料');
          check();

          break;
        case 'editProfile':
          // 执行编辑用户资料的逻辑
          console.log('编辑用户资料');
          showModifyUser();
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
      percentage: percentageRef,                                
      duration: durationRef,
      speed: speedRef,
      uploadPath,
      upLoadFile,
      handleFileChange,
      options,
      handleSelect,
      currentPath,
      enterFolder,
      navigateTo,
      jumpToShare,
      goBack,
      shareHref,
      shareFile,
      showModal: shareModelShowModel,
      modifyUserShowModal:modifyUserShowModel,
      userShowModal:UserShowModel,
      userFormRef,
      userFormValue,
      renameFolderShowModal :renameFolderShowModel,
      folderFormRef,
      folderFormValue,
      renameFolder,
      modifyUser,
      check,
      onNegativeClick() {
        message.success("Cancel");
        shareModelShowModel.value = false;
      },
      onPositiveClick() {
        message.success("Submit");
        shareModelShowModel.value = false;
      }
    };
  }
});
</script>
