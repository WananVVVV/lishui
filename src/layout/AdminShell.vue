<template>
  <div class="admin-shell">
    <header class="topbar">
      <div class="brand">溧水区城市安全电子&quot;一张图&quot;</div>
      <div class="topbar-actions">
        <router-link
          v-if="route.name === 'accident-detail'"
          to="/accidents"
          class="topbar-link"
          >← 返回列表</router-link
        >
        <span class="topbar-link">可视化大屏</span>
        <span class="region">溧水区 ▾</span>
        <el-icon><Setting /></el-icon>
        <el-icon><SwitchButton /></el-icon>
      </div>
    </header>

    <div class="shell-body" :class="{ 'detail-mode': route.meta.noSidebar }">
      <aside v-if="!route.meta.noSidebar" class="sidebar">
        <router-link to="/accidents" class="side-item active">
          <span class="side-icon">🛡️</span>
          <span>事故类比排查防控</span>
        </router-link>
      </aside>

      <main class="content">
        <div v-if="!route.meta.noSidebar" class="breadcrumb">
          <router-link to="/accidents">首页</router-link>
          <span>/</span>
          <span>事故类比排查防控</span>
        </div>
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { Setting, SwitchButton } from "@element-plus/icons-vue";

const route = useRoute();
</script>

<style scoped lang="scss">
.admin-shell {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: $canvas;
}

.topbar {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  color: #fff;
  background: $brand;
}

.brand {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 1px;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 22px;
  font-size: 14px;
}

.topbar-link {
  color: #fff;
  text-decoration: none;
  cursor: pointer;
}

.region {
  white-space: nowrap;
}

.shell-body {
  display: flex;
  height: calc(100% - 56px);
  min-height: 0;
}

.shell-body.detail-mode {
  display: block;
}

.sidebar {
  width: 220px;
  flex-shrink: 0;
  background: $sidebar-bg;
}

.side-item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 52px;
  padding: 0 22px;
  color: #94a3b8;
  text-decoration: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.side-item.active {
  color: #fff;
  background: $brand;
}

.side-item.muted {
  cursor: default;
}

.side-icon {
  width: 16px;
  text-align: center;
}

.content {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.detail-mode .content {
  height: calc(100vh - 56px);
}

.breadcrumb {
  height: 44px;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
  padding: 0 20px;
  color: $ink-muted;
  background: #fff;
  border-bottom: 1px solid $border;
  font-size: 13px;

  a {
    color: $brand;
    text-decoration: none;
  }
}
</style>
