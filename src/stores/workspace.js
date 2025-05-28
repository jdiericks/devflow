import { defineStore } from 'pinia'
import { supabase } from '../supabase'
import { useAuthStore } from './auth'

export const useWorkspaceStore = defineStore('workspace', {
  state: () => ({
    workspaces: [],
    selectedWorkspaceId: null,
    loading: false,
    error: null,
  }),
  actions: {
    async fetchWorkspaces() {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const userId = auth.user?.id
      if (!userId) {
        this.workspaces = []
        this.loading = false
        return
      }
      // Get workspace IDs where user is a member
      const { data: memberships, error: memberErr } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', userId)
      if (memberErr) {
        this.error = memberErr.message
        this.loading = false
        return
      }
      const workspaceIds = memberships.map(m => m.workspace_id)
      // Fetch workspaces
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .in('id', workspaceIds)
      if (error) {
        this.error = error.message
        this.workspaces = []
      } else {
        this.workspaces = data
        if (!this.selectedWorkspaceId && data.length) {
          this.selectedWorkspaceId = data[0].id
        }
      }
      this.loading = false
    },
    async createWorkspace(name) {
      this.loading = true
      this.error = null
      const auth = useAuthStore()
      const userId = auth.user?.id
      if (!userId) {
        this.error = 'Not logged in'
        this.loading = false
        return
      }
      // Create workspace
      const { data: ws, error } = await supabase
        .from('workspaces')
        .insert([{ name, owner_id: userId }])
        .select()
        .single()
      if (error) {
        this.error = error.message
        this.loading = false
        return
      }
      // Add user as admin member
      await supabase.from('workspace_members').insert({ workspace_id: ws.id, user_id: userId, role: 'admin' })
      this.workspaces.push(ws)
      this.selectedWorkspaceId = ws.id
      this.loading = false
    },
    selectWorkspace(id) {
      this.selectedWorkspaceId = id
    },
  },
}) 