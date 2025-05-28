import { defineStore } from 'pinia'
import { supabase } from '../supabase'
import { useProjectStore } from './project'

export const useNodeStore = defineStore('node', {
  state: () => ({
    nodes: [],
    activities: [],
    selectedProjectId: null,
    selectedFolderId: null,
    showAllItems: false,
    loading: false,
    error: null,
  }),
  actions: {
    async fetchNodes() {
      this.loading = true
      this.error = null
      const projectId = this.selectedProjectId
      console.log('Fetching nodes for project:', projectId)
      if (!projectId) {
        this.nodes = []
        this.loading = false
        return
      }
      const { data, error } = await supabase
        .from('nodes')
        .select('*')
        .eq('project_id', projectId)
      if (error) {
        console.error('Error fetching nodes:', error)
        this.error = error.message
        this.nodes = []
      } else {
        console.log('Fetched nodes:', data)
        this.nodes = data
      }
      this.loading = false
    },
    async addNode(node) {
      this.loading = true
      this.error = null
      if (!node.assignees) node.assignees = []
      const { data, error } = await supabase
        .from('nodes')
        .insert([node])
        .select()
        .single()
      if (error) {
        this.error = error.message
        this.loading = false
        return
      }
      this.nodes.push(data)
      this.loading = false
      // Log activity for new page
      if (data.type === 'page') {
        this.activities.unshift({
          id: Date.now() + Math.random(),
          project_id: data.project_id,
          user_id: 1, // TODO: Replace with real user id
          user_name: 'Alice', // TODO: Replace with real user name
          action: 'created',
          node_id: data.id,
          node_name: data.name,
          timestamp: new Date().toISOString(),
          details: 'Created new page',
        })
      }
    },
    async updateNode(id, updates) {
      this.loading = true
      this.error = null
      try {
        // If we're updating data, merge it with existing data
        if (updates.data) {
          const existingNode = this.nodes.find(n => n.id === id)
          if (existingNode && existingNode.data) {
            updates.data = { ...existingNode.data, ...updates.data }
          }
        }

        const { data, error } = await supabase
          .from('nodes')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (error) {
          console.error('Error updating node:', error)
          this.error = error.message
          this.loading = false
          return
        }

        const idx = this.nodes.findIndex(n => n.id === id)
        if (idx !== -1) this.nodes[idx] = data
        this.loading = false
      } catch (error) {
        console.error('Error in updateNode:', error)
        this.error = error.message
        this.loading = false
      }
    },
    async deleteNode(id) {
      this.loading = true
      this.error = null
      const { error } = await supabase
        .from('nodes')
        .delete()
        .eq('id', id)
      if (error) {
        this.error = error.message
        this.loading = false
        return
      }
      this.nodes = this.nodes.filter(n => n.id !== id)
      this.loading = false
    },
    async fetchActivities() {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(50)

        if (error) {
          console.error('Error fetching activities:', error)
          this.error = error.message
          this.activities = []
        } else {
          this.activities = data
        }
      } catch (error) {
        console.error('Error in fetchActivities:', error)
        this.error = error.message
        this.activities = []
      }
      this.loading = false
    },
    async logActivity(activity) {
      try {
        console.log('Logging activity to Supabase:', activity)
        const { data, error } = await supabase
          .from('activities')
          .insert([{
            project_id: activity.project_id,
            user_id: activity.user_id,
            user_name: activity.user_name,
            action: activity.action,
            node_id: activity.node_id,
            node_name: activity.node_name,
            timestamp: activity.timestamp,
            details: activity.details
          }])
          .select()
          .single()

        if (error) {
          console.error('Error logging activity:', error)
          this.error = error.message
          return null
        }

        // Add to local activities array
        this.activities.unshift(data)
        return data
      } catch (error) {
        console.error('Error in logActivity:', error)
        this.error = error.message
        return null
      }
    },
    selectProject(id) {
      this.selectedProjectId = id
      this.selectedFolderId = null
      this.showAllItems = false
      this.fetchNodes()
    },
    selectFolder(id) {
      this.selectedFolderId = id
      this.showAllItems = false
    },
    setShowAllItems(val) {
      this.showAllItems = val
      if (val) this.selectedFolderId = null
    },
    async addActivity(activity) {
      return await this.logActivity(activity)
    },
    updatePageDueDate(pageId, dueDate) {
      this.updateNode(pageId, { due_date: dueDate })
    },
    logAssignment({ project_id, user_id, user_name, node_id, node_name, assigned, assignee_name }) {
      this.activities.unshift({
        id: Date.now() + Math.random(),
        project_id,
        user_id,
        user_name,
        action: assigned ? 'assigned' : 'unassigned',
        node_id,
        node_name,
        timestamp: new Date().toISOString(),
        details: assigned ? `Assigned to ${assignee_name}` : `Unassigned ${assignee_name}`
      })
    },
  },
}) 