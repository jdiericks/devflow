<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNodeStore } from '../stores/node'
import { useProjectStore } from '../stores/project'
import { useWorkspaceStore } from '../stores/workspace'
import { useRouter } from 'vue-router'

const nodeStore = useNodeStore()
const projectStore = useProjectStore()
const workspaceStore = useWorkspaceStore()
const router = useRouter()

// Fetch activities when component mounts
onMounted(async () => {
  await nodeStore.fetchActivities()
})

// Group activities by date
const groupedActivities = computed(() => {
  const groups = {}
  nodeStore.activities.forEach(activity => {
    const date = new Date(activity.timestamp).toLocaleDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(activity)
  })
  return groups
})

// Get activity icon based on action
const getActivityIcon = (action) => {
  switch (action) {
    case 'created':
      return 'i-heroicons-plus-circle'
    case 'updated':
      return 'i-heroicons-pencil'
    case 'status':
      return 'i-heroicons-flag'
    case 'due_date':
      return 'i-heroicons-calendar'
    case 'assigned':
      return 'i-heroicons-user-plus'
    case 'unassigned':
      return 'i-heroicons-user-minus'
    default:
      return 'i-heroicons-information-circle'
  }
}

// Get activity color based on action
const getActivityColor = (action) => {
  switch (action) {
    case 'created':
      return 'text-green-500'
    case 'updated':
      return 'text-blue-500'
    case 'status':
      return 'text-purple-500'
    case 'due_date':
      return 'text-orange-500'
    case 'assigned':
      return 'text-indigo-500'
    case 'unassigned':
      return 'text-red-500'
    default:
      return 'text-gray-500'
  }
}

// Format timestamp
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Navigate to page
const goToPage = (nodeId) => {
  nodeStore.setSelectedNodeId(nodeId)
}

// Get project name
const getProjectName = (projectId) => {
  const project = projectStore.projects.find(p => p.id === projectId)
  return project?.name || 'Unknown Project'
}

const getUserName = (userId) => {
  // TODO: Implement user name lookup from workspace members
  return userId
}
</script>

<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-6">Recent Activity</h2>
    
    <div class="space-y-8">
      <div v-for="(activities, date) in groupedActivities" :key="date" class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-700">{{ date }}</h3>
        
        <div class="space-y-4">
          <div v-for="activity in activities" :key="activity.id" 
            class="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
            @click="goToPage(activity.node_id)"
          >
            <div class="flex items-start gap-4">
              <!-- User Avatar -->
              <div class="flex-shrink-0">
                <img 
                  :src="`https://randomuser.me/api/portraits/men/${activity.user_id * 7 % 100}.jpg`" 
                  class="w-10 h-10 rounded-full"
                  :alt="activity.user_name"
                />
              </div>
              
              <!-- Activity Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-medium text-gray-900">{{ activity.user_name }}</span>
                  <span class="text-gray-500">{{ activity.action }}</span>
                  <span class="font-medium text-gray-900">{{ activity.node_name }}</span>
                </div>
                
                <div class="flex items-center gap-2 text-sm text-gray-500">
                  <span>{{ formatTimestamp(activity.timestamp) }}</span>
                  <span>•</span>
                  <span>{{ getProjectName(activity.project_id) }}</span>
                  <span class="px-2 py-1 rounded-full text-xs" :class="getActivityColor(activity.action)">
                    {{ getActivityIcon(activity.action) }} {{ activity.details }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 