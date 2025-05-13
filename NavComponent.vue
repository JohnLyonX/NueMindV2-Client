<template>
  <nav :class="{ 'nav-background': isScrolled }" class="nav-container">
    <div class="logo">
      <RouterLink to="/home" @click.prevent="handleNavClick('/home')">NueMind</RouterLink>
    </div>
    <div class="user">
      <RouterLink to="/profile" @click.prevent="handleNavClick('/profile')">
      </RouterLink>
      <button @click="handleLogout" class="logout-btn">退出</button>
    </div>
  </nav>
</template>

<style scoped>
RouterLink * {
  color: white;
}
</style>
