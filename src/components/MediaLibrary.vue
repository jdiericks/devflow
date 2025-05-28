<template>
  <div class="p-10">
    <h2 class="text-2xl font-bold mb-6">Media Library</h2>
    <div class="mb-6">
      <label class="block mb-2 font-semibold text-gray-700">Upload Media</label>
      <input type="file" multiple @change="onFileChange" class="block" />
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div v-for="media in mediaStore.mediaItems" :key="media.id" class="bg-white rounded-lg shadow p-4 flex flex-col items-center">
        <img :src="media.url" alt="media preview" class="w-32 h-32 object-cover rounded mb-2 border" />
        <div class="font-medium text-gray-800 truncate w-full text-center">{{ media.name }}</div>
        <div class="text-xs text-gray-400 mt-1">{{ media.date }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useMediaStore } from '../stores/media'
const mediaStore = useMediaStore()

function onFileChange(e) {
  const files = Array.from(e.target.files)
  files.forEach(file => {
    const reader = new FileReader()
    reader.onload = (event) => {
      mediaStore.addMedia({
        id: Date.now() + Math.random(),
        name: file.name,
        url: event.target.result,
        date: new Date().toISOString().slice(0, 10),
      })
    }
    reader.readAsDataURL(file)
  })
}
</script>

<style scoped>
</style> 