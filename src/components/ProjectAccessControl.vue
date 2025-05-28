<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProjectStore } from '../stores/project'
import { useWorkspaceStore } from '../stores/workspace'
import { useAuthStore } from '../stores/auth'
import DeleteConfirmationModal from './DeleteConfirmationModal.vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  projectId: {
    type: Number,
    required: true
  }
})

const projectStore = useProjectStore()
const workspaceStore = useWorkspaceStore()
const auth = useAuthStore()
const router = useRouter()

const showDeleteModal = ref(false)

const project = computed(() => projectStore.projects.find(p => p.id === props.projectId))
const workspaceMembers = computed(() => {
  const workspace = workspaceStore.workspaces.find(w => w.id === project.value?.workspace_id)
  return workspace?.members || []
})

const allowedUsers = ref([])
const isAdmin = computed(() => {
  const workspace = workspaceStore.workspaces.find(w => w.id === project.value?.workspace_id)
  const membership = workspace?.members?.find(m => m.id === auth.user?.id)
  return membership?.role === 'admin'
})

onMounted(async () => {
  if (project.value?.allowed_user_ids) {
    allowedUsers.value = [...project.value.allowed_user_ids]
  }
})

async function updateAccess() {
  if (!isAdmin.value) return
  
  try {
    await projectStore.updateProjectAccess(props.projectId, allowedUsers.value)
  } catch (error) {
    console.error('Error updating project access:', error)
  }
}

async function handleDeleteProject() {
  try {
    await projectStore.deleteProject(props.projectId)
    showDeleteModal.value = false
    router.push('/')
  } catch (error) {
    console.error('Error deleting project:', error)
  }
}

function getUserName(userId) {
  const member = workspaceMembers.value.find(m => m.id === userId)
  return member ? member.name : 'Unknown'
}

function getUserRole(userId) {
  const member = workspaceMembers.value.find(m => m.id === userId)
  return member ? member.role : 'viewer'
}
</script>

<template>
  <div class="p-6">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h2 class="text-xl font-semibold mb-2">Project Access Control</h2>
        <p class="text-gray-600">Manage who has access to this project</p>
      </div>
      <button
        v-if="isAdmin"
        @click="showDeleteModal = true"
        class="px-4 py-2 text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete Project
      </button>
    </div>

    <div v-if="isAdmin" class="space-y-4">
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="font-medium mb-3">Workspace Members</h3>
        <div class="space-y-2">
          <div v-for="member in workspaceMembers" :key="member.id" 
               class="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
            <div class="flex items-center gap-3">
              <img :src="member.avatar || `https://ui-avatars.com/api/?name=${member.name}`" 
                   class="w-8 h-8 rounded-full" />
              <div>
                <div class="font-medium">{{ member.name }}</div>
                <div class="text-sm text-gray-500">{{ member.role }}</div>
              </div>
            </div>
            <label class="flex items-center gap-2">
              <input type="checkbox" 
                     v-model="allowedUsers" 
                     :value="member.id"
                     @change="updateAccess"
                     class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span class="text-sm text-gray-600">Allow access</span>
            </label>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-gray-600">
      Only workspace administrators can manage project access.
    </div>

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmationModal
      v-if="showDeleteModal"
      type="Project"
      :name="project?.name"
      @close="showDeleteModal = false"
      @delete="handleDeleteProject"
    />
  </div>
</template> 