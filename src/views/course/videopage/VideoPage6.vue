<template>
    <div class="video-page">
        <div class="video-description">
            <h2>C语言基础语法</h2>
        </div>
        <p></p>
        <iframe width="900px" height="500" :src="videoUrl"
      title="YouTube video player" frameborder="0"
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin" allowfullscreen>
    </iframe>
    </div>
</template>
<script>
export default {
  name: 'VideoPage6',
  props: ['videoUrl'],
}
</script>
<style scoped>
.video-page {
  padding: 20px;
  height: 90vh;
}

.video-description {
  margin-bottom: 20px;
  font-size: 16px;
  color: #666;
}

.video-player {
  width: 100%;
  margin-bottom: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.text-intro {
  line-height: 1.6;
  color: #343a40;
}</style>
