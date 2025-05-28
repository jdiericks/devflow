<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <!-- Top Nav -->
    <nav class="bg-white border-b border-gray-200 flex items-center px-8 h-16 justify-between w-full">
      <div class="flex items-center gap-6">
        <div class="relative workspace-dropdown">
          <button 
            class="font-bold text-lg text-blue-600 flex items-center gap-2 hover:text-blue-700"
            @click.stop="toggleDropdown"
          >
            <span class="bg-blue-100 p-1 rounded"><svg xmlns='http://www.w3.org/2000/svg' class='h-6 w-6 text-blue-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 4v16m8-8H4'/></svg></span>
            {{ currentWorkspace?.name || 'Workspace' }}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div 
            v-if="isDropdownOpen"
            class="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          >
            <div class="p-2">
              <div class="text-xs font-semibold text-gray-500 mb-1 px-2">WORKSPACE</div>
              <div class="text-sm font-medium text-gray-900 px-2 py-1">{{ currentWorkspace?.name }}</div>
              <button
                class="w-full mt-2 px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded flex items-center gap-1"
                @click.stop="showWorkspaceSettings = true; closeDropdown()"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Workspace Settings
              </button>
              <div class="border-t border-gray-200 my-2"></div>
              <div class="text-xs font-semibold text-gray-500 mb-1 px-2">PROJECTS</div>
              <div v-for="project in projectsInWorkspace" :key="project.id" 
                class="px-2 py-1 text-sm hover:bg-gray-100 rounded cursor-pointer flex items-center justify-between"
                :class="{ 'bg-blue-50 text-blue-700': selectedProjectId === project.id }"
              >
                <span @click="selectedProjectId = project.id; closeDropdown()">
                  {{ project.name }}
                </span>
                <button
                  class="text-gray-400 hover:text-gray-600"
                  @click.stop="showProjectSettings = true; selectedProjectId = project.id; closeDropdown()"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              <button
                class="w-full mt-2 px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded flex items-center gap-1"
                @click.stop="onAddProject"
              >
                <svg xmlns='http://www.w3.org/2000/svg' class='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 4v16m8-8H4'/></svg>
                New Project
              </button>
            </div>
          </div>
        </div>
        <ul class="flex gap-4 text-gray-700 font-medium">
          <li 
            class="cursor-pointer" 
            :class="activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'hover:text-blue-600'"
            @click="activeTab = 'overview'"
          >
            Overview
          </li>
          <li 
            class="cursor-pointer" 
            :class="activeTab === 'content' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'hover:text-blue-600'"
            @click="activeTab = 'content'"
          >
            Content
          </li>
          <li class="hover:text-blue-600 cursor-pointer">Settings</li>
        </ul>
      </div>
      <div class="flex items-center gap-4">
        <input type="text" placeholder="Search..." class="border rounded px-2 py-1 text-sm" />
        <div class="flex items-center gap-2">
          <img src="https://randomuser.me/api/portraits/men/32.jpg" class="w-8 h-8 rounded-full" />
          <button 
            @click="logout" 
            class="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </nav>

    <div class="flex flex-1 w-full">
      <!-- Sidebar -->
      <aside class="w-64 bg-white border-r border-gray-200 p-4 flex flex-col min-h-0 overflow-hidden">
        <!-- All Items Button -->
        <div class="mb-4">
          <button
            class="w-full text-left px-2 py-2 rounded font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 mb-2"
            :class="{ 'bg-blue-200': nodeStore.showAllItems }"
            @click="nodeStore.setShowAllItems(true)"
          >
            All items
          </button>
        </div>
        <!-- Folder/Page Tree -->
        <div class="mb-6 flex-1 overflow-y-auto overflow-x-hidden">
          <div class="flex items-center mb-2">
            <label class="block font-semibold text-gray-700 flex-1">Structure</label>
            <button class="ml-2 p-1 rounded hover:bg-blue-100" @click="addRootFolder">
              <svg class="w-4 h-4 text-gray-500 hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            </button>
          </div>
          <ul class="overflow-x-hidden">
            <Draggable
              v-model="nodeTreeProxy"
              :group="'folders'"
              item-key="id"
              :animation="200"
              @end="onRootDrop"
            >
              <template #item="{ element }">
                <TreeNode :node="element" :selected-folder-id="nodeStore.selectedFolderId" @select-folder="nodeStore.selectFolder" />
              </template>
            </Draggable>
          </ul>
        </div>
      </aside>
      <!-- Main Content -->
      <main class="flex-1 overflow-x-auto">
        <Overview v-if="activeTab === 'overview'" />
        <MediaLibrary v-else-if="activeTab === 'media'" />
        <div v-else class="p-10">
          <div v-if="nodeStore.showAllItems">
            <h2 class="text-2xl font-bold mb-4">All Pages in Project</h2>
            <div class="bg-white rounded shadow overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-gray-50 text-gray-500">
                    <th class="px-4 py-2 font-semibold text-left">Name</th>
                    <th class="px-4 py-2 font-semibold text-left">Template</th>
                    <th class="px-4 py-2 font-semibold text-left">Due Date</th>
                    <th class="px-4 py-2 font-semibold text-left">Updated</th>
                    <th class="px-4 py-2 font-semibold text-left">Folder</th>
                    <th class="px-4 py-2 font-semibold text-left">Comments</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="page in allPagesInProject" :key="page.id" class="border-b hover:bg-gray-50 cursor-pointer" @click="goToPage(page.id)">
                    <td class="flex items-center gap-3 px-4 py-3">
                      <span :class="['w-3 h-3 rounded-full', statusColor(page.status)]"></span>
                      <span class="font-medium text-gray-900">{{ page.name }}</span>
                    </td>
                    <td class="px-4 py-3 text-gray-400">{{ page.template || 'No template' }}</td>
                    <td class="px-4 py-3 text-gray-400">{{ page.dueDate }}</td>
                    <td class="px-4 py-3 text-gray-400">{{ page.updated }}</td>
                    <td class="px-4 py-3 text-gray-400">{{ getFolderName(page.parent_id) }}</td>
                    <td class="px-4 py-3 text-gray-400 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2M15 3h-6a2 2 0 00-2 2v3a2 2 0 002 2h6a2 2 0 002-2V5a2 2 0 00-2-2z" /></svg>
                      <span>{{ page.comments }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-else-if="!nodeStore.selectedFolderId" class="text-gray-500 text-lg">Select a folder to view its pages.</div>
          <div v-else>
            <nav class="mb-4 text-gray-500 text-sm flex items-center gap-2">
              <template v-for="(crumb, idx) in selectedFolderBreadcrumb" :key="crumb.id">
                <span v-if="idx !== 0" class="mx-1">/</span>
                <span :class="[idx === selectedFolderBreadcrumb.length - 1 ? 'font-bold text-gray-900' : 'hover:underline cursor-pointer']">
                  {{ crumb.name }}
                </span>
              </template>
              <button
                class="ml-auto px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center gap-1"
                @click="addNewPage"
              >
                <svg xmlns='http://www.w3.org/2000/svg' class='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 4v16m8-8H4'/></svg>
                New Page
              </button>
            </nav>
            <div v-if="pagesInSelectedFolder.length > 0" class="bg-white rounded shadow overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-gray-50 text-gray-500">
                    <th class="px-4 py-2 font-semibold text-left">Name</th>
                    <th class="px-4 py-2 font-semibold text-left">Template</th>
                    <th class="px-4 py-2 font-semibold text-left">Due Date</th>
                    <th class="px-4 py-2 font-semibold text-left">Updated</th>
                    <th class="px-4 py-2 font-semibold text-left"></th>
                    <th class="px-4 py-2 font-semibold text-left">Comments</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="page in pagesInSelectedFolder" :key="page.id" class="border-b hover:bg-gray-50 cursor-pointer" @click="goToPage(page.id)">
                    <td class="flex items-center gap-3 px-4 py-3">
                      <span :class="['w-3 h-3 rounded-full', statusColor(page.status)]"></span>
                      <span class="font-medium text-gray-900">{{ page.name }}</span>
                    </td>
                    <td class="px-4 py-3 text-gray-400">{{ page.template || 'No template' }}</td>
                    <td class="px-4 py-3 text-gray-400">{{ page.dueDate }}</td>
                    <td class="px-4 py-3 text-gray-400">{{ page.updated }}</td>
                    <td class="px-4 py-3 text-gray-400"></td>
                    <td class="px-4 py-3 text-gray-400 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2M15 3h-6a2 2 0 00-2 2v3a2 2 0 002 2h6a2 2 0 002-2V5a2 2 0 00-2-2z" /></svg>
                      <span>{{ page.comments }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-gray-400 italic text-center py-12">No pages in this folder.</div>
          </div>
        </div>
      </main>
    </div>

    <!-- Project Settings Modal -->
    <div v-if="showProjectSettings" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div class="p-4 border-b flex justify-between items-center">
          <h2 class="text-xl font-semibold">Project Settings</h2>
          <button @click="showProjectSettings = false" class="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <ProjectAccessControl :project-id="selectedProjectId" />
      </div>
    </div>

    <!-- Workspace Settings Modal -->
    <div v-if="showWorkspaceSettings" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div class="p-4 border-b flex justify-between items-center">
          <h2 class="text-xl font-semibold">Workspace Settings</h2>
          <button @click="showWorkspaceSettings = false" class="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <WorkspaceAccessControl :workspace-id="currentWorkspace?.id" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useWorkspaceStore } from '../stores/workspace'
import { useProjectStore } from '../stores/project'
import { useNodeStore } from '../stores/node'
import { useAuthStore } from '../stores/auth'
import TreeNode from './TreeNode.vue'
import Overview from './Overview.vue'
import MediaLibrary from './MediaLibrary.vue'
import { useRouter } from 'vue-router'
import Draggable from 'vuedraggable'
import ProjectAccessControl from './ProjectAccessControl.vue'
import WorkspaceAccessControl from './WorkspaceAccessControl.vue'

const workspaceStore = useWorkspaceStore()
const projectStore = useProjectStore()
const nodeStore = useNodeStore()
const auth = useAuthStore()
const router = useRouter()

const isDropdownOpen = ref(false)
const activeTab = ref('content') // 'content' or 'overview'
const showProjectSettings = ref(false)
const showWorkspaceSettings = ref(false)

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
}

function closeDropdown() {
  isDropdownOpen.value = false
}

// Close dropdown when clicking outside
function handleClickOutside(event) {
  const dropdown = document.querySelector('.workspace-dropdown')
  if (dropdown && !dropdown.contains(event.target)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const currentWorkspace = computed(() =>
  workspaceStore.workspaces.find(w => w.id === workspaceStore.selectedWorkspaceId)
)

const currentUserId = computed(() => auth.user?.id)
const projectsInWorkspace = computed(() =>
  projectStore.projects.filter(p =>
    p.workspace_id === workspaceStore.selectedWorkspaceId &&
    (!p.allowed_user_ids || p.allowed_user_ids.includes(currentUserId.value))
  )
)

const selectedProjectId = computed({
  get: () => nodeStore.selectedProjectId,
  set: async (id) => {
    nodeStore.selectedProjectId = id
    await nodeStore.fetchNodes()
  }
})

const nodesInProject = computed(() => {
  const nodes = nodeStore.nodes.filter(n => n.project_id === selectedProjectId.value)
  console.log('Nodes in project:', nodes)
  return nodes
})

function buildTree(nodes, parentId = null) {
  const filtered = nodes.filter(n => n.parent_id === parentId && n.type === 'folder')
  console.log('Building tree for parentId:', parentId, 'Filtered nodes:', filtered)
  return filtered
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(n => ({
      ...n,
      children: buildTree(nodes, n.id)
    }))
}

const nodeTree = computed(() => {
  const tree = buildTree(nodesInProject.value)
  console.log('Final tree:', tree)
  return tree
})

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

async function addNewPage() {
  if (!nodeStore.selectedFolderId) return
  const newPage = {
    project_id: nodeStore.selectedProjectId,
    parent_id: nodeStore.selectedFolderId,
    type: 'page',
    name: 'Untitled Page',
    template_id: null,
    due_date: null,
    updated: new Date().toISOString(),
    status: 'in_progress',
    sort_order: 999,
    assignees: [],
    data: {}
  }
  await nodeStore.addNode(newPage)
  // Find the new page by name/parent (last added)
  const created = nodeStore.nodes.find(
    n => n.name === 'Untitled Page' && n.parent_id === nodeStore.selectedFolderId && n.type === 'page'
  )
  if (created) goToPage(created.id)
}

async function addRootFolder() {
  await nodeStore.addNode({
    project_id: nodeStore.selectedProjectId,
    parent_id: null,
    type: 'folder',
    name: 'New Folder',
    sort_order: 999,
  })
  await nodeStore.fetchNodes()
}

const nodeTreeProxy = computed({
  get: () => nodeTree.value,
  set: (val) => {
    // This is a proxy for Draggable, but we update sort_order in onRootDrop
  }
})

function onRootDrop(evt) {
  // evt.newIndex, evt.oldIndex, evt.item
  nodeTree.value.forEach((node, idx) => {
    const folder = nodeStore.nodes.find(n => n.id === node.id)
    if (folder) folder.sort_order = idx + 1
  })
}

function onAddProject() {
  const name = prompt('Project name:')
  if (name) {
    projectStore.createProject(name).then(() => projectStore.fetchProjects())
    closeDropdown()
  }
}

async function logout() {
  await auth.logout()
  router.push('/login')
}
</script>

<style scoped>
/* Custom styles for scrollbar, etc. */
</style> 