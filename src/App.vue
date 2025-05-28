<template>
  <Login v-if="!auth.user && !auth.loading" />
  <div v-else>
    <router-view />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useWorkspaceStore } from './stores/workspace'
import { useProjectStore } from './stores/project'
import { useNodeStore } from './stores/node'
import TreeNode from './components/TreeNode.vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import Login from './components/Login.vue'

const workspaceStore = useWorkspaceStore()
const projectStore = useProjectStore()
const nodeStore = useNodeStore()
const router = useRouter()
const auth = useAuthStore()

// Always use the current workspace (simulate user context)
const currentWorkspace = computed(() =>
  workspaceStore.workspaces.find(w => w.id === workspaceStore.selectedWorkspaceId)
)

const projectsInWorkspace = computed(() =>
  projectStore.projects.filter(p => p.workspace_id === workspaceStore.selectedWorkspaceId)
)

const selectedProjectId = computed({
  get: () => nodeStore.selectedProjectId,
  set: (id) => nodeStore.selectProject(id)
})

const nodesInProject = computed(() =>
  nodeStore.nodes.filter(n => n.project_id === selectedProjectId.value)
)

function buildTree(nodes, parentId = null) {
  return nodes
    .filter(n => n.parent_id === parentId && n.type === 'folder')
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(n => ({
      ...n,
      children: buildTree(nodes, n.id)
    }))
}

const nodeTree = computed(() => buildTree(nodesInProject.value))

// Main area: show pages in selected folder
const pagesInSelectedFolder = computed(() => {
  if (!nodeStore.selectedFolderId) return []
  return nodeStore.nodes.filter(
    n => n.parent_id === nodeStore.selectedFolderId && n.type === 'page'
  )
})

const statusColor = status => {
  switch (status) {
    case 'in_progress': return 'bg-yellow-300'
    case 'review': return 'bg-orange-400'
    case 'reviewed': return 'bg-green-400'
    case 'production': return 'bg-blue-400'
    case 'client': return 'bg-gray-400'
    case 'do_not_use': return 'bg-red-400'
    default: return 'bg-gray-200'
  }
}

const allPagesInProject = computed(() =>
  nodeStore.nodes.filter(n => n.project_id === nodeStore.selectedProjectId && n.type === 'page')
)

function getFolderName(parentId) {
  if (!parentId) return ''
  const folder = nodeStore.nodes.find(n => n.id === parentId && n.type === 'folder')
  return folder ? folder.name : ''
}

const selectedFolderBreadcrumb = computed(() => {
  if (!nodeStore.selectedFolderId) return []
  const path = []
  let current = nodeStore.nodes.find(n => n.id === nodeStore.selectedFolderId)
  while (current) {
    path.unshift(current)
    current = nodeStore.nodes.find(n => n.id === current.parent_id && n.type === 'folder')
  }
  // Add project name at the start
  const project = projectStore.projects.find(p => p.id === nodeStore.selectedProjectId)
  if (project) path.unshift({ name: project.name, id: 'project' })
  return path
})

function goToPage(pageId) {
  router.push(`/page/${pageId}`)
}

onMounted(async () => {
  await auth.restoreSession()
  if (auth.user) {
    await workspaceStore.fetchWorkspaces()
  }
})

watch(
  () => workspaceStore.selectedWorkspaceId,
  (id) => {
    if (id) projectStore.fetchProjects()
  },
  { immediate: true }
)
</script>

<style scoped>
/* Custom styles for scrollbar, etc. */
</style>
