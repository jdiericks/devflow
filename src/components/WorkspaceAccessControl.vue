<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWorkspaceStore } from '../stores/workspace'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  workspaceId: {
    type: Number,
    required: true
  }
})

const workspaceStore = useWorkspaceStore()
const auth = useAuthStore()

const workspace = computed(() => workspaceStore.workspaces.find(w => w.id === props.workspaceId))
const isOwner = computed(() => workspace.value?.owner_id === auth.user?.id)

const newMemberEmail = ref('')
const newMemberRole = ref('viewer')
const isInviting = ref(false)

const roleOptions = [
  { value: 'admin', label: 'Administrator' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' }
]

async function inviteMember() {
  if (!newMemberEmail.value || !newMemberRole.value) return
  
  isInviting.value = true
  try {
    await workspaceStore.inviteMember(props.workspaceId, newMemberEmail.value, newMemberRole.value)
    newMemberEmail.value = ''
    newMemberRole.value = 'viewer'
  } catch (error) {
    console.error('Error inviting member:', error)
  } finally {
    isInviting.value = false
  }
}

async function updateMemberRole(memberId, newRole) {
  if (!isOwner.value) return
  
  try {
    await workspaceStore.updateMemberRole(props.workspaceId, memberId, newRole)
  } catch (error) {
    console.error('Error updating member role:', error)
  }
}

async function removeMember(memberId) {
  if (!isOwner.value) return
  
  try {
    await workspaceStore.removeMember(props.workspaceId, memberId)
  } catch (error) {
    console.error('Error removing member:', error)
  }
}
</script>

<template>
  <div class="p-6">
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-2">Workspace Access Control</h2>
      <p class="text-gray-600">Manage who has access to this workspace</p>
    </div>

    <div v-if="isOwner" class="space-y-6">
      <!-- Invite New Member -->
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="font-medium mb-3">Invite New Member</h3>
        <div class="flex gap-3">
          <input type="email" 
                 v-model="newMemberEmail"
                 placeholder="Enter email address"
                 class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          <select v-model="newMemberRole"
                  class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option v-for="role in roleOptions" 
                    :key="role.value" 
                    :value="role.value">
              {{ role.label }}
            </option>
          </select>
          <button @click="inviteMember"
                  :disabled="isInviting || !newMemberEmail"
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
            {{ isInviting ? 'Inviting...' : 'Invite' }}
          </button>
        </div>
      </div>

      <!-- Current Members -->
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="font-medium mb-3">Current Members</h3>
        <div class="space-y-2">
          <div v-for="member in workspace?.members" :key="member.id" 
               class="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
            <div class="flex items-center gap-3">
              <img :src="member.avatar || `https://ui-avatars.com/api/?name=${member.name}`" 
                   class="w-8 h-8 rounded-full" />
              <div>
                <div class="font-medium">{{ member.name }}</div>
                <div class="text-sm text-gray-500">{{ member.email }}</div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <select v-model="member.role"
                      @change="updateMemberRole(member.id, member.role)"
                      :disabled="member.id === workspace.owner_id"
                      class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option v-for="role in roleOptions" 
                        :key="role.value" 
                        :value="role.value">
                  {{ role.label }}
                </option>
              </select>
              <button v-if="member.id !== workspace.owner_id"
                      @click="removeMember(member.id)"
                      class="text-red-600 hover:text-red-700">
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-gray-600">
      Only workspace owners can manage workspace access.
    </div>
  </div>
</template> 