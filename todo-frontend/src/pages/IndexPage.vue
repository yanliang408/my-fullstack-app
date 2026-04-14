<template>
  <q-page class="page-container">
    <div class="todo-wrapper">
      <div class="header-row">
        <div>
          <h1>Todo Test Environment</h1>
          <p>Testing environment with Quasar + NestJS + Supabase</p>
        </div>
        <div class="btn-group">
          <q-btn icon="person" label="Profile" color="secondary" @click="goToProfile" />
          <q-btn icon="logout" label="Logout" color="negative" @click="logout" />
        </div>
      </div>

      <div class="input-row">
        <q-input
          v-model="newTodoTitle"
          placeholder="Enter a todo item"
          outlined
          dense
          debounce="300"
          @keyup.enter="addTodo"
          class="todo-input"
        />
        <q-input
          v-model="newTodoDueDate"
          type="date"
          outlined
          dense
          label="Due date (optional)"
          class="due-date-input"
        />
        <q-select
          v-model="selectedAssigneeId"
          :options="memberOptions"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          outlined
          dense
          clearable
          label="Assign to teammate"
          class="assignee-select"
        />
        <q-btn icon="add" label="Add" color="primary" @click="addTodo" class="add-btn" />
      </div>

      <q-banner v-if="error" class="bg-red text-white q-my-md" dense>
        {{ error }}
      </q-banner>

      <q-spinner-dots v-if="loading" color="primary" class="q-mt-lg" />

      <q-list v-if="!loading" class="todo-list q-pa-none">
        <q-item v-for="todo in todos" :key="todo.id" clickable>
          <q-item-section avatar>
            <q-icon
              name="check_circle"
              :color="todo.completed ? 'green' : 'grey'"
              @click.stop="toggleTodo(todo.id, !todo.completed)"
              class="todo-icon"
            />
          </q-item-section>

          <q-item-section>
            <q-item-label :class="{ completed: todo.completed }">{{ todo.title }}</q-item-label>
            <q-item-label caption>
              Assigned to: {{ todo.assignee?.fullName || todo.assignee?.email || 'Unassigned' }}
            </q-item-label>
            <q-item-label caption>
              Created: {{ formatDate(todo.createdAt) }} | Due: {{ formatDate(todo.dueDate) }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-btn flat dense round color="negative" icon="delete" @click.stop="deleteTodo(todo.id)" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

export default {
  name: 'IndexPage',
  setup() {
    const router = useRouter()
    const todos = ref([])
    const newTodoTitle = ref('')
    const newTodoDueDate = ref('')
    const selectedAssigneeId = ref(null)
    const memberOptions = ref([])
    const loading = ref(false)
    const error = ref(null)

    const fetchTodos = async () => {
      loading.value = true
      error.value = null
      try {
        const response = await api.get('/todos')
        todos.value = response.data
      } catch (err) {
        error.value = 'Failed to load todos'
        console.error(err)
      } finally {
        loading.value = false
      }
    }

    const fetchCompanyMembers = async () => {
      try {
        const response = await api.get('/profile/company-members')
        memberOptions.value = response.data.map((member) => ({
          label: member.fullName || member.email,
          value: member.id,
        }))
      } catch (err) {
        console.error(err)
      }
    }

    const addTodo = async () => {
      if (!newTodoTitle.value.trim()) return

      try {
        const response = await api.post('/todos', {
          title: newTodoTitle.value,
          assignedToId: selectedAssigneeId.value,
          dueDate: newTodoDueDate.value || null,
        })
        todos.value.unshift(response.data)
        newTodoTitle.value = ''
        newTodoDueDate.value = ''
        selectedAssigneeId.value = null
      } catch (err) {
        error.value = 'Failed to add todo, please try again'
        console.error(err)
      }
    }

    const toggleTodo = async (id, completed) => {
      try {
        const response = await api.put(`/todos/${id}`, {
          completed,
        })
        const index = todos.value.findIndex((t) => t.id === id)
        if (index !== -1) {
          todos.value[index] = response.data
        }
      } catch (err) {
        error.value = 'Failed to update todo, please try again'
        console.error(err)
      }
    }

    const deleteTodo = async (id) => {
      try {
        await api.delete(`/todos/${id}`)
        todos.value = todos.value.filter((t) => t.id !== id)
      } catch (err) {
        error.value = 'Failed to delete todo, please try again'
        console.error(err)
      }
    }

    onMounted(() => {
      fetchTodos()
      fetchCompanyMembers()
    })

    const logout = () => {
      localStorage.removeItem('authToken')
      router.push('/login')
    }

    const goToProfile = () => {
      router.push('/profile')
    }

    const formatDate = (value) => {
      if (!value) return 'No due date'
      return new Date(value).toLocaleDateString()
    }

    return {
      todos,
      newTodoTitle,
      newTodoDueDate,
      selectedAssigneeId,
      memberOptions,
      loading,
      error,
      addTodo,
      toggleTodo,
      deleteTodo,
      goToProfile,
      formatDate,
      logout,
    }
  },
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  padding: 24px;
  background-color: #f4f7fb;
}

.todo-wrapper {
  max-width: 760px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 16px 40px rgba(25, 118, 210, 0.08);
  padding: 24px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.btn-group {
  display: flex;
  gap: 8px;
}

h1 {
  margin: 0;
  font-size: 28px;
}

p {
  margin: 6px 0 0;
  color: #606770;
}

.input-row {
  margin-bottom: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.todo-list {
  margin-top: 16px;
}

.assignee-select {
  flex: 1 1 240px;
  min-width: 220px;
}

.due-date-input {
  flex: 0 1 220px;
  min-width: 180px;
}

.todo-input {
  flex: 1 1 260px;
  min-width: 220px;
}

.add-btn {
  height: 40px;
  flex: 0 0 auto;
  white-space: nowrap;
}

@media (max-width: 900px) {
  .input-row {
    flex-direction: column;
    align-items: stretch;
  }

  .assignee-select,
  .due-date-input,
  .todo-input {
    min-width: 100%;
  }

  .add-btn {
    width: 100%;
  }
}

.todo-item {
  border-bottom: 1px solid #eff2f7;
}

.todo-icon {
  cursor: pointer;
}

.completed {
  text-decoration: line-through;
  color: #8a8f98;
}
</style>
