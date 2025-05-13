<template>
  <div class="Typing-effect">
    <div>{{ displayText }}</div>
  </div>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      index: 0,
      displayText: ''
    };
  },
  mounted() {
    this.interval = setInterval(() => {
      this.autoTyping();
    }, 150);
  },
  methods: {
    autoTyping() {
      this.index++;
      if (this.index <= this.text.length) {
        this.displayText = this.text.slice(0, this.index) + '_'; // 更新 displayText
      } else {
        this.displayText = this.text.slice(0, this.index); // 更新 displayText
      }
      if (this.index > this.text.length) {
        clearInterval(this.interval);
        setTimeout(() => {
          this.index = 0;
          this.interval = setInterval(() => {
            this.autoTyping();
          }, 150);
        }, 3000);
      }
    }
  }
};
</script>
<style>
.Typing-effect {
  font-family: inherit; /* 继承父元素字体 */
}

/* 光标闪烁动画 */
.Typing-effect div::after {
  
  animation: blink 1s infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}
</style>
