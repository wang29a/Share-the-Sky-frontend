<template>
    <n-layout>
      <n-layout-header>
        <n-menu mode="horizontal">
          <n-menu-item>首页</n-menu-item>
          <n-menu-item>关于</n-menu-item>
          <!-- 其他导航项 -->
        </n-menu>
        <!-- 用户信息、登出按钮等 -->
      </n-layout-header>
  
      <n-layout-content style="padding: 24px;">
        <div>
          <n-upload >
            <n-button @click="upLoadFile">点击上传文件</n-button>
          </n-upload>
        </div>
            <!-- <input type="file" @change="handleFileChange" ref="fileInput"> -->
            <!-- <n-button @click="uploadFile">上传文件</n-button> -->
  
        <!-- <n-data-table :columns="columns" :data="fileList">
        </n-data-table> -->
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
import { h, defineComponent, ref, onMounted } from "vue";
import { NButton } from "naive-ui";
import axios from 'axios';

export default defineComponent({
  setup() {
    const data = ref([]);
    const selectedFile = ref(null);
    const fileInput = ref(null);
    const uploadPath = ref(''); // 上传路径

    const fetchFiles = async () => {
      try {
        const response = await 
        axios.post('/file/list', {path:"/img"});

        data.value = response.data; // 使用后端返回的文件列表
      } catch (error) {
        console.error('获取文件列表失败:', error);
      }
    };

    onMounted(fetchFiles);

    const downloadFile = (row) => {
      // 实现下载文件的逻辑
      console.log("下载文件:", row.fileName, row.MD5);
      axios.get('/file/download', {
        params: {
          "MD5": row.MD5
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
        formData.append('path', uploadPath.value); // 添加上传路径到 FormData
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

    return {
      data,
      columns: createColumns(),
      pagination: false,
      fileInput,
      selectedFile,
      uploadPath,
      upLoadFile,
      handleFileChange,
    };
  }
});
</script>