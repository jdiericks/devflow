<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useNodeStore } from '../stores/node'
import { useProjectStore } from '../stores/project'
import { useWorkspaceStore } from '../stores/workspace'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const nodeStore = useNodeStore()
const projectStore = useProjectStore()
const workspaceStore = useWorkspaceStore()
const auth = useAuthStore()

const pageId = computed(() => Number(route.params.id))
const page = computed(() => nodeStore.nodes.find(n => n.id === pageId.value))

// Add name ref
const name = ref(page.value?.name || '')

// Get breadcrumb path
const breadcrumbs = computed(() => {
  if (!page.value) return []
  
  const path = []
  let current = page.value
  
  // Get all parent folders
  while (current.parent_id) {
    const parent = nodeStore.nodes.find(n => n.id === current.parent_id)
    if (parent) {
      path.unshift(parent)
      current = parent
    } else {
      break
    }
  }
  
  // Add project name at the start
  const project = projectStore.projects.find(p => p.id === page.value.project_id)
  if (project) path.unshift({ name: project.name, id: 'project' })
  
  // Add the current page at the end
  path.push(page.value)
  
  return path
})

const content = ref(page.value?.data?.content || '')
const status = ref(page.value?.status || 'in_progress')
const dueDate = ref(page.value?.due_date || '')
const assignees = ref(page.value?.assignees ? [...page.value.assignees] : [])
const saved = ref(true)
let saveTimeout = null
let isFirstSave = !page.value?.data?.content && !page.value?.status && !page.value?.due_date && (!page.value?.assignees || page.value.assignees.length === 0)

const statusOptions = [
  { value: 'in_progress', label: 'Content in progress' },
  { value: 'review', label: 'Ready for review' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'production', label: 'Ready for production' },
  { value: 'client', label: 'Ready for client' },
  { value: 'do_not_use', label: 'Do not use' },
]

const activeTab = ref('preview')

const previewRef = ref(null)

// Set initial content on mount
onMounted(() => {
  if (previewRef.value) {
    previewRef.value.innerHTML = content.value
  }
})

// Watch for changes and auto-save
watch([content, status, dueDate, assignees], async ([newContent, newStatus, newDueDate, newAssignees], [oldContent, oldStatus, oldDueDate, oldAssignees]) => {
  saved.value = false
  if (saveTimeout) clearTimeout(saveTimeout)
  
  saveTimeout = setTimeout(async () => {
    try {
      // Update the node in Supabase
      await nodeStore.updateNode(pageId.value, {
        data: { content: newContent },
        status: newStatus,
        due_date: newDueDate === '' ? null : newDueDate,
        assignees: newAssignees,
        updated: new Date().toISOString()
      })

      // Log activities for each change
      const userId = auth.user?.id || 1
      const userName = auth.user?.email || 'Anonymous'
      
      // Log content changes
      if (newContent !== oldContent) {
        nodeStore.addActivity({
          project_id: page.value.project_id,
          user_id: userId,
          user_name: userName,
          action: isFirstSave ? 'created' : 'updated',
          node_id: pageId.value,
          node_name: page.value.name,
          timestamp: new Date().toISOString(),
          details: isFirstSave ? 'Created new page' : 'Edited page content'
        })
      }

      // Log status changes
      if (newStatus !== oldStatus) {
        nodeStore.addActivity({
          project_id: page.value.project_id,
          user_id: userId,
          user_name: userName,
          action: 'status',
          node_id: pageId.value,
          node_name: page.value.name,
          timestamp: new Date().toISOString(),
          details: `Changed status to ${newStatus}`
        })
      }

      // Log due date changes
      if (newDueDate !== oldDueDate) {
        nodeStore.addActivity({
          project_id: page.value.project_id,
          user_id: userId,
          user_name: userName,
          action: 'due_date',
          node_id: pageId.value,
          node_name: page.value.name,
          timestamp: new Date().toISOString(),
          details: newDueDate ? `Set due date to ${new Date(newDueDate).toLocaleDateString()}` : 'Removed due date'
        })
      }

      // Log assignee changes
      if (JSON.stringify(newAssignees) !== JSON.stringify(oldAssignees)) {
        const added = newAssignees.filter(id => !oldAssignees.includes(id))
        const removed = oldAssignees.filter(id => !newAssignees.includes(id))
        
        added.forEach(userId => {
          nodeStore.addActivity({
            project_id: page.value.project_id,
            user_id: userId,
            user_name: userName,
            action: 'assigned',
            node_id: pageId.value,
            node_name: page.value.name,
            timestamp: new Date().toISOString(),
            details: `Assigned to ${getUserName(userId)}`
          })
        })

        removed.forEach(userId => {
          nodeStore.addActivity({
            project_id: page.value.project_id,
            user_id: userId,
            user_name: userName,
            action: 'unassigned',
            node_id: pageId.value,
            node_name: page.value.name,
            timestamp: new Date().toISOString(),
            details: `Unassigned ${getUserName(userId)}`
          })
        })
      }
      
      isFirstSave = false
      saved.value = true
    } catch (error) {
      console.error('Error saving page:', error)
      saved.value = false
    }
  }, 1000) // Debounce for 1 second
})

// Watch for external content changes (e.g. switching tabs, loading new page)
watch(page, (newPage) => {
  if (newPage) {
    name.value = newPage.name || ''
    content.value = newPage.data?.content || ''
    status.value = newPage.status || 'in_progress'
    dueDate.value = newPage.due_date || ''
    assignees.value = newPage.assignees ? [...newPage.assignees] : []
    saved.value = true
  }
}, { immediate: true })

// Watch for name changes
watch(name, async (newName) => {
  if (!page.value) return
  saved.value = false
  if (saveTimeout) clearTimeout(saveTimeout)
  
  saveTimeout = setTimeout(async () => {
    try {
      await nodeStore.updateNode(pageId.value, {
        name: newName,
        updated: new Date().toISOString()
      })
      saved.value = true
    } catch (error) {
      console.error('Error saving page name:', error)
      saved.value = false
    }
  }, 1000)
})

// Clean up timeout on component unmount
onUnmounted(() => {
  if (saveTimeout) clearTimeout(saveTimeout)
})

function goBack() {
  router.back()
}

// Formatting helpers
const textareaRef = ref(null)
function wrapSelection(tag, attrs = '') {
  if (activeTab.value !== 'html') return
  const textarea = textareaRef.value
  if (!textarea) return
  const [start, end] = [textarea.selectionStart, textarea.selectionEnd]
  const before = content.value.slice(0, start)
  const selected = content.value.slice(start, end)
  const after = content.value.slice(end)
  let openTag = `<${tag}${attrs ? ' ' + attrs : ''}>`
  let closeTag = `</${tag}>`
  // Self-closing tags
  if (['hr'].includes(tag)) {
    content.value = before + `<${tag}${attrs ? ' ' + attrs : ''}/>` + after
    return
  }
  // Special case for link
  if (tag === 'a') {
    const url = prompt('Enter URL:', 'https://')
    if (!url) return
    openTag = `<a href=\"${url}\">`
    closeTag = '</a>'
  }
  content.value = before + openTag + selected + closeTag + after
  // Restore selection
  setTimeout(() => {
    textarea.focus()
    textarea.selectionStart = start + openTag.length
    textarea.selectionEnd = end + openTag.length
  }, 0)
}

function onPreviewInput(e) {
  content.value = e.target.innerHTML
}

const workspaceMembers = computed(() => {
  const project = projectStore.projects.find(p => p.id === page.value?.project_id)
  const workspace = workspaceStore.workspaces.find(w => w.id === project?.workspace_id)
  return workspace ? workspace.members : []
})

function getUserName(userId) {
  const member = workspaceMembers.value.find(m => m.id === userId)
  return member ? member.name : 'Unknown'
}

function getUserAvatar(userId) {
  // Placeholder avatar logic
  return `https://randomuser.me/api/portraits/men/${userId * 7 % 100}.jpg`
}
</script>
<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <!-- Header -->
    <header class="bg-white shadow px-6 py-4">
      <div class="flex items-center gap-4 mb-2">
        <button @click="goBack" class="text-blue-600 hover:underline font-semibold">&larr; Back</button>
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-gray-900">{{ page?.name }}</h1>
          <div class="flex items-center text-sm text-gray-500 mt-1">
            <template v-for="(crumb, index) in breadcrumbs" :key="crumb.id">
              <span v-if="index > 0" class="mx-2">/</span>
              <span>{{ crumb.name }}</span>
            </template>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Due Date:</span>
            <input 
              type="date" 
              v-model="dueDate" 
              class="border rounded px-2 py-1 text-sm"
              :class="{ 'text-gray-400': !dueDate }"
            />
          </div>
          <select v-model="status" class="border rounded px-2 py-1">
            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <span v-if="saved" class="text-green-500 text-xs ml-2">Saved</span>
          <span v-else class="text-gray-400 text-xs ml-2">Saving...</span>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Assignees:</span>
            <div class="flex -space-x-2">
              <img v-for="userId in assignees" :key="userId" :src="getUserAvatar(userId)" class="w-6 h-6 rounded-full border-2 border-white" :title="getUserName(userId)" />
            </div>
            <select multiple v-model="assignees" class="border rounded px-2 py-1 text-sm">
              <option v-for="member in workspaceMembers" :key="member.id" :value="member.id">{{ member.name }}</option>
            </select>
          </div>
        </div>
      </div>
    </header>
    <!-- Toolbar -->
    <div class="bg-white border-b px-6 py-2 flex gap-2 items-center flex-wrap">
      <button class="px-2 py-1 rounded hover:bg-gray-200 font-bold" @click.prevent="wrapSelection('b')">B</button>
      <button class="px-2 py-1 rounded hover:bg-gray-200 italic" @click.prevent="wrapSelection('i')">I</button>
      <button class="px-2 py-1 rounded hover:bg-gray-200 underline" @click.prevent="wrapSelection('u')">U</button>
      <button class="px-2 py-1 rounded hover:bg-gray-200 line-through" @click.prevent="wrapSelection('s')">S</button>
      <button class="px-2 py-1 rounded hover:bg-gray-200" @click.prevent="wrapSelection('h1')">H1</button>
      <button class="px-2 py-1 rounded hover:bg-gray-200" @click.prevent="wrapSelection('h2')">H2</button>
      <button class="px-2 py-1 rounded hover:bg-gray-200" @click.prevent="wrapSelection('h3')">H3</button>
      <button class="px-2 py-1 rounded hover:bg-gray-200" @click.prevent="wrapSelection('ul')">UL</button>
      <button class="px-2 py-1 rounded hover:bg-gray-200" @click.prevent="wrapSelection('ol')">OL</button>
      <button class="px-2 py-1 rounded hover:bg-gray-200" @click.prevent="wrapSelection('blockquote')">❝</button>
      <button class="px-2 py-1 rounded hover:bg-gray-200" @click.prevent="wrapSelection('code')">&lt;/&gt;</button>
      <button class="px-2 py-1 rounded hover:bg-gray-200" @click.prevent="wrapSelection('hr')">HR</button>
      <button class="px-2 py-1 rounded hover:bg-gray-200" @click.prevent="wrapSelection('a')">🔗</button>
    </div>
    <!-- Tabs -->
    <div class="flex justify-center mt-4 mb-2">
      <button @click="activeTab = 'preview'" :class="['px-4 py-2 rounded-t', activeTab === 'preview' ? 'bg-white border-t border-x border-b-0 font-semibold' : 'bg-gray-100 text-gray-500']">Preview</button>
      <button @click="activeTab = 'html'" :class="['px-4 py-2 rounded-t', activeTab === 'html' ? 'bg-white border-t border-x border-b-0 font-semibold' : 'bg-gray-100 text-gray-500']">HTML</button>
    </div>
    <div class="flex-1 p-6 flex flex-col items-center">
      <div class="w-full max-w-2xl">
        <template v-if="!page?.template">
          <div class="mb-4">
            <label class="block text-gray-700 font-semibold mb-1">Page Title</label>
            <input 
              type="text" 
              v-model="name" 
              class="w-full border rounded px-3 py-2 text-lg font-bold bg-gray-50" 
              placeholder="Enter page title..."
            />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 font-semibold mb-1">Main Content</label>
            <div v-if="activeTab === 'preview'">
              <div
                ref="previewRef"
                class="border rounded p-4 bg-white min-h-[200px] prose max-w-none focus:outline-none"
                contenteditable
                @input="onPreviewInput"
                style="outline: none;"
              ></div>
            </div>
            <div v-else>
              <textarea ref="textareaRef" v-model="content" class="w-full h-64 p-4 border rounded resize-none text-base font-mono bg-white" placeholder="Write HTML content..."></textarea>
            </div>
          </div>
        </template>
        <template v-else>
          <!-- Template-based editing can go here -->
          <textarea ref="textareaRef" v-model="content" class="w-full h-96 p-4 border rounded resize-none text-lg" placeholder="Start writing..."></textarea>
        </template>
      </div>
    </div>
  </div>
</template> 