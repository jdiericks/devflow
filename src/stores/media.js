import { defineStore } from 'pinia'

export const useMediaStore = defineStore('media', {
  state: () => ({
    mediaItems: [
      { id: 1, name: 'mountain.jpg', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=256&q=80', date: '2024-03-20' },
      { id: 2, name: 'beach.png', url: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=facearea&w=256&q=80', date: '2024-03-19' },
    ],
  }),
  actions: {
    addMedia(media) {
      this.mediaItems.push(media)
    },
  },
}) 