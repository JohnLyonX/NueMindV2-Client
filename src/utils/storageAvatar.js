export const storageAvatar = {
  getAvatar() {
    return localStorage.getItem('avatarUrl')
  },
  setAvatar(url) {
    localStorage.setItem('avatarUrl', url)
    window.dispatchEvent(new CustomEvent('storage-changed', {
      detail: { key: 'avatarUrl', value: url,timestamp: Date.now() }
    }))
  }
}
export const storageName = {
  getName() {
    return localStorage.getItem('name')
  },
  setName(name) {
    localStorage.setItem('name', name)
    window.dispatchEvent(new CustomEvent('storage-changed', {
      detail: { key: 'name', value: name }
    }))
  }
}