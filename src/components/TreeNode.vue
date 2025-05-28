<script setup>
import { ref, computed } from 'vue'
import { useNodeStore } from '../stores/node'
import TreeNode from './TreeNode.vue'
import Draggable from 'vuedraggable'

const props = defineProps({
  node: Object,
  selectedFolderId: Number,
})
const emit = defineEmits(['select-folder'])
const nodeStore = useNodeStore()

const isRenaming = ref(false)
const renameValue = ref('')

// Add computed property to check if this folder is in the selected folder's path
const isInSelectedPath = computed(() => {
  if (!props.selectedFolderId || nodeStore.showAllItems) return true
  
  let current = nodeStore.nodes.find(n => n.id === props.selectedFolderId)
  while (current) {
    if (current.id === props.node.id) return true
    current = nodeStore.nodes.find(n => n.id === current.parent_id)
  }
  return false
})

function handleClick() {
  if (props.node.type === 'folder') {
    emit('select-folder', props.node.id)
  }
}

async function addSubfolder() {
  await nodeStore.addNode({
    project_id: nodeStore.selectedProjectId,
    parent_id: props.node.id,
    type: 'folder',
    name: 'New Folder',
    sort_order: 999,
  })
}

async function saveRename() {
  if (renameValue.value.trim()) {
    await nodeStore.updateNode(props.node.id, { name: renameValue.value.trim() })
  }
  isRenaming.value = false
}

function onDrop(evt) {
  // evt.newIndex, evt.oldIndex, evt.item, evt.to, evt.from
  // Update parent_id and sort_order for all children
  const children = nodeStore.nodes.filter(n => n.parent_id === props.node.id)
  children.forEach((child, idx) => {
    child.sort_order = idx + 1
    child.parent_id = props.node.id
  })
}

// Always sort children by sort_order before rendering
const sortedChildren = computed(() => {
  return (props.node.children || []).slice().sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
})
</script>
<template>
  <li class="ml-2">
    <div class="flex items-center group">
      <span
        class="flex-1 cursor-pointer flex items-center"
        :class="{ 'font-bold text-blue-700': node.id === selectedFolderId }"
        @click="$emit('select-folder', node.id)"
      >
        <svg v-if="node.type === 'folder'" class="w-4 h-4 text-yellow-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7a2 2 0 012-2h3.172a2 2 0 011.414.586l1.828 1.828A2 2 0 0012.828 8H19a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
        </svg>
        <span v-if="!isRenaming" class="truncate ml-1 max-w-[120px]">{{ node.name }}</span>
        <input v-else v-model="renameValue" @keyup.enter="saveRename" @blur="saveRename" class="border rounded px-1 text-sm w-24 ml-1" />
      </span>
      <button v-if="node.type === 'folder'" class="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" @click.stop="addSubfolder">
        <svg class="w-4 h-4 text-gray-400 hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
      </button>
      <button v-if="node.type === 'folder'" class="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" @click.stop="isRenaming = true; renameValue = node.name">
        <svg class="w-4 h-4 text-gray-400 hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 17v-2a4 4 0 014-4h10a4 4 0 014 4v2" /></svg>
      </button>
    </div>
    <Draggable
      v-if="sortedChildren.length && (isInSelectedPath || nodeStore.showAllItems)"
      v-model="sortedChildren"
      :group="'folders'"
      item-key="id"
      :animation="200"
      class="ml-4"
      @end="onDrop"
    >
      <template #item="{ element }">
        <TreeNode
          :node="element"
          :selected-folder-id="selectedFolderId"
          @select-folder="emit('select-folder', $event)"
        />
      </template>
    </Draggable>
  </li>
</template> 