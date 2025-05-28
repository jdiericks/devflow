<template>
  <div class="p-6">
    <vue-cal
      style="height: 700px"
      :events="calendarEvents"
      :on-event-click="onEventClick"
      :on-cell-click="onCellClick"
      default-view="month"
      :time="false"
      :disable-views="['years', 'year', 'week', 'day', 'agenda']"
      :hide-title-bar="false"
      :hide-view-selector="true"
      :on-event-create="false"
      :on-event-drag-create="false"
      :on-event-drag="onEventDrag"
      :on-event-resize="false"
      :on-event-delete="false"
    />
    <div v-if="selectedPage" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-96 relative">
        <button class="absolute top-2 right-2 text-gray-400 hover:text-gray-600" @click="selectedPage = null">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h3 class="text-lg font-bold mb-2">{{ selectedPage.name }}</h3>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <input type="date" v-model="selectedDueDate" class="border rounded px-2 py-1 w-full" />
        </div>
        <div class="flex justify-end gap-2">
          <button class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" @click="selectedPage = null">Cancel</button>
          <button class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" @click="saveDueDate">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useNodeStore } from '../stores/node'
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'

const nodeStore = useNodeStore()

const calendarEvents = computed(() =>
  nodeStore.nodes
    .filter(n => n.type === 'page' && n.dueDate)
    .map(page => ({
      id: page.id,
      title: page.name,
      start: page.dueDate,
      end: page.dueDate,
      content: page,
      class: 'bg-blue-500 text-white',
    }))
)

const selectedPage = ref(null)
const selectedDueDate = ref('')

function onEventClick(event) {
  selectedPage.value = event.content
  selectedDueDate.value = event.content.dueDate || ''
}

function onCellClick({ date }) {
  // Optionally, open a modal to select a page to assign to this date
}

function onEventDrag({ event, start }) {
  // Update the due date when an event is dragged
  nodeStore.updatePageDueDate(event.id, start)
}

function saveDueDate() {
  if (selectedPage.value && selectedDueDate.value) {
    nodeStore.updatePageDueDate(selectedPage.value.id, selectedDueDate.value)
    selectedPage.value = null
  }
}
</script>

<style scoped>
.vuecal__event.bg-blue-500 {
  background: #3b82f6 !important;
  color: #fff !important;
  border: none !important;
}
</style> 