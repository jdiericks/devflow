import { defineStore } from 'pinia'
import { supabase } from '../supabase'
import { useAuthStore } from './auth'
import { useWorkspaceStore } from './workspace'

export const useProjectStore = defineStore('project', {
  state: () => ({
    projects: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchProjects() {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const workspaceStore = useWorkspaceStore()
      const userId = auth.user?.id
      const workspaceId = workspaceStore.selectedWorkspaceId
      if (!userId || !workspaceId) {
        this.projects = []
        this.loading = false
        return
      }
      // Fetch projects for workspace where user is allowed
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('workspace_id', workspaceId)
      if (error) {
        this.error = error.message
        this.projects = []
      } else {
        // Filter by allowed_user_ids
        this.projects = data.filter(p => !p.allowed_user_ids || p.allowed_user_ids.includes(userId))
      }
      this.loading = false
    },
    async createProject(name) {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const workspaceStore = useWorkspaceStore()
      const userId = auth.user?.id
      const workspaceId = workspaceStore.selectedWorkspaceId
      if (!userId || !workspaceId) {
        this.error = 'Missing workspace or user'
        this.loading = false
        return
      }
      // By default, only creator has access
      const { data: proj, error } = await supabase
        .from('projects')
        .insert([{ name, workspace_id: workspaceId, allowed_user_ids: [userId] }])
        .select()
        .single()
      if (error) {
        this.error = error.message
        this.loading = false
        return
      }
      this.projects.push(proj)
      this.loading = false
      await this.fetchProjects()
    },
    addProject(project) {
      this.projects.push(project)
    },
    async updateProjectAccess(projectId, allowedUserIds) {
      const { error } = await supabase
        .from('projects')
        .update({ allowed_user_ids: allowedUserIds })
        .eq('id', projectId)

      if (error) throw new Error('Error updating project access')

      // Update local state
      const project = this.projects.find(p => p.id === projectId)
      if (project) {
        project.allowed_user_ids = allowedUserIds
      }
    },
    async deleteProject(projectId) {
      try {
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', projectId)

        if (error) throw error

        // Remove project from local state
        this.projects = this.projects.filter(p => p.id !== projectId)
      } catch (error) {
        console.error('Error deleting project:', error)
        throw error
      }
    }
  },
}) 