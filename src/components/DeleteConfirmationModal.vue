<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
      <div class="p-6">
        <h2 class="text-xl font-semibold text-red-600 mb-4">Delete {{ type }}</h2>
        <p class="text-gray-600 mb-6">
          This action cannot be undone. This will permanently delete the {{ type.toLowerCase() }} 
          <span class="font-semibold">{{ name }}</span> and all of its contents.
        </p>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Type the {{ type.toLowerCase() }} name to confirm
            </label>
            <input
              v-model="nameConfirmation"
              type="text"
              class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              :placeholder="name"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Type "delete my {{ type.toLowerCase() }}" to confirm
            </label>
            <input
              v-model="deleteConfirmation"
              type="text"
              class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              :placeholder="`delete my ${type.toLowerCase()}`"
            />
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button
            @click="$emit('close')"
            class="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
          >
            Cancel
          </button>
          <button
            @click="handleDelete"
            class="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!isValid"
          >
            Delete {{ type }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['Project', 'Workspace'].includes(value)
  },
  name: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'delete'])

const nameConfirmation = ref('')
const deleteConfirmation = ref('')

const isValid = computed(() => {
  const expectedDeleteText = `delete my ${props.type.toLowerCase()}`
  return nameConfirmation.value === props.name && 
         deleteConfirmation.value.toLowerCase() === expectedDeleteText
})

function handleDelete() {
  if (isValid.value) {
    emit('delete')
  }
}
</script> 