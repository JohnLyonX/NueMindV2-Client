<template>
  <div class="video-page">
    <div class="video-description">
      <h1>{{ title }}</h1>
      
    </div>
    <div class="video-container">
      <iframe 
        width="100%" 
        height="500" 
        :src="videoUrl"
        title="Video player" 
        frameborder="0"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin" 
        allowfullscreen>
      </iframe>
    </div>
    
  </div>
</template>

<script>
export default {
  name: 'DynamicVideoPage',
  props: {
    videoUrl: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: '视频课程'
    }
  }
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

.video-container {
  width: 100%;
  margin-bottom: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.text-intro {
  line-height: 1.6;
  color: #343a40;
}

/* Responsive iframe */
@media (max-width: 768px) {
  .video-container iframe {
    height: 300px;
  }
}
</style>