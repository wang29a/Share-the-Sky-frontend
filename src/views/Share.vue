<template>
  <n-card title="文件分享" style="margin-bottom: 16px">
    <n-form
      ref="formRef"
      inline
      :label-width="80"
      :model="formValue"
      :rules="rules"
      :size="size"
    >
      <n-form-item label="ID" path="share.id">
        <n-input v-model:value="formValue.shareId" placeholder="输入ID" />
      </n-form-item>
      <n-form-item label="code" path="share.code">
        <n-input v-model:value="formValue.code" placeholder="输入code" />
      </n-form-item>
      <n-form-item>
        <n-button attr-type="button" @click="handleValidateClick">
          获取
        </n-button>
      </n-form-item>
    </n-form>
    <n-data-table v-data-table:show="false"
      :columns="shareColumns"
      :data="shareData"
      :pagination="pagination"
      :bordered="false"
    />
    </n-card>
  <!-- <pre>{{ JSON.stringify(formValue, null, 2) }}
  </pre> -->
</template>

<script>
import { defineComponent, ref, h } from "vue";
import { useMessage } from "naive-ui";
import { NIcon, NDropdown, NButton } from "naive-ui";
import axios from "axios"; // 引入axios
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
    const formRef = ref(null);
    const message = useMessage();
    const formValue = ref({
      shareId: "",
      code: ""
    });
    const shareData = ref([]);
    
    const saveFile = (row) => {
      //转存文件的逻辑
      try {
        console.log("转存文件");
        console.log("check Login Status, token:", sessionStorage.getItem('userToken'));
        console.log("path:");
        console.log("fileExtension:", row.fileExtension);
        console.log("fileId:", parseInt(row.fileId));
        console.log("fileName:", row.fileName);
        console.log("fileSize:", parseInt(row.fileSize));
        const response = 
        axios.post('/share/save', {
          path:"/2/", 
          fileExtension: row.fileExtension,
          fileId: parseInt(row.fileId),
          fileName: row.fileName,
          fileSize: parseInt(row.fileSize),
          // userId: parseInt(sessionStorage.getItem("userToken")),
          userId: 3,
        });
        console.log("response:", response);
          message.success("转存文件成功");
      } catch (error) {
        console.error('转存文件失败:', error);
        message.error("转存文件失败");
      }
    }

    const createShareColumns = () => {
      return [
        {
          title: "名称",
          key: "fileName",
          render(row) {
            const isFolder = 0; // 假设 0 代表文件夹
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
                  onClick: () => saveFile(row)
                },
                { default: () => "转存" }
              ),
            ];
          }
        }
      ];
    };
    return {
      shareData,
      shareColumns: createShareColumns(),
      formRef,
      size: ref("medium"),
      formValue,
      rules: {
        shareId: {
          required: true,
          message: "请输入分享ID",
          trigger: "blur"
        },
        code: {
          required: true,
          message: "请输入分享code",
          trigger: ["input", "blur"]
        }
      },
      handleValidateClick(e) {
        e.preventDefault();
        formRef.value?.validate(async (errors) => {
          console.log("fromValue:", formValue._value);
          console.log("shareId:", parseInt(formValue._value.shareId));
          console.log("coce:", formValue._value.code);
          if (!errors) {
            try {
              // 使用axios发送请求到后端
              const response = await axios.post('/share/acquire', {
                shareId: parseInt(formValue._value.shareId),
                code: formValue._value.code
              });
              shareData.value = [response.data];

              if (response.data) {
                message.success("获取成功");
                // 在这里处理更多的逻辑
              } else {
                message.error(response.data.message || "获取失败");
              }
            } catch (error) {
              console.log(error)
              message.error("网络错误或服务器问题");
            }
          } else {
            console.log(errors);
            message.error("Invalid");
          }
        });
      },
      warning () {
        message.warning('...')
      }
    };
  }
});
</script>

<style scoped>
.card-tabs .n-tabs-nav--bar-type {
  padding-left: 4px;
}
</style>