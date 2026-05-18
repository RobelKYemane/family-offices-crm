import { useState, lazy, Suspense } from 'react'
import { CheckSquare, Square, Pencil, Trash2, Plus, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useStore, useAllTasks, useAllFOs } from '@/lib/store'
import type { Task } from '@/data/familyOffices'
import { cn, formatDate } from '@/lib/utils'

const TaskDialog = lazy(() =>
  import('@/components/TaskDialog').then((m) => ({ default: m.TaskDialog }))
)

type Filter = 'open' | 'done' | 'all'
type ScopeFilter = 'all' | 'scoped' | 'unscoped'

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function dueDateColor(dueDate: string | null, done: boolean): string {
  if (done || !dueDate) return 'text-muted-foreground'
  const today = todayISO()
  if (dueDate < today) return 'text-red-500 dark:text-red-400 font-medium'
  // within 3 days
  const diff =
    (new Date(dueDate + 'T00:00:00').getTime() - new Date(today + 'T00:00:00').getTime()) /
    (1000 * 60 * 60 * 24)
  if (diff <= 3) return 'text-amber-500 dark:text-amber-400 font-medium'
  return 'text-muted-foreground'
}

function TaskRow({
  task,
  foName,
  onEdit,
  onDelete,
  onToggle,
}: {
  task: Task
  foName: string | null
  onEdit: (t: Task) => void
  onDelete: (t: Task) => void
  onToggle: (id: string) => void
}) {
  const dateColor = dueDateColor(task.dueDate, task.done)
  return (
    <div className="group flex items-start gap-3 py-3 border-b border-border last:border-0">
      <button
        onClick={() => onToggle(task.id)}
        aria-label={task.done ? 'Mark as open' : 'Mark as done'}
        className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors"
      >
        {task.done ? (
          <CheckSquare className="h-4 w-4 text-primary" />
        ) : (
          <Square className="h-4 w-4" />
        )}
      </button>

      <div className="flex-1 min-w-0 space-y-0.5">
        <p className={cn('text-sm font-medium text-foreground', task.done && 'line-through text-muted-foreground')}>
          {task.title}
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
          {foName && (
            <span className="text-muted-foreground">{foName}</span>
          )}
          {task.dueDate && (
            <span className={dateColor}>
              Due {formatDate(task.dueDate)}
            </span>
          )}
          {task.done && task.doneAt && (
            <span className="text-muted-foreground">
              Done {new Date(task.doneAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>
        {task.notes && (
          <p className="text-xs text-muted-foreground leading-relaxed">{task.notes}</p>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => onEdit(task)}
          aria-label="Edit task"
          className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(task)}
          aria-label="Delete task"
          className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export function Tasks() {
  const allTasks = useAllTasks()
  const allFOs = useAllFOs()
  const toggleTaskDone = useStore((s) => s.toggleTaskDone)
  const deleteTask = useStore((s) => s.deleteTask)

  const [filter, setFilter] = useState<Filter>('open')
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all')
  const [addOpen, setAddOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)

  function getFOName(foId: string | null): string | null {
    if (!foId) return null
    return allFOs.find((f) => f.id === foId)?.name ?? foId
  }

  // Sort: open first by dueDate asc (undated last), then done by doneAt desc
  const sorted = [...allTasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    if (!a.done) {
      // both open — due date asc, undated last
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return a.dueDate.localeCompare(b.dueDate)
    }
    // both done — doneAt desc
    const aAt = a.doneAt ?? ''
    const bAt = b.doneAt ?? ''
    return bAt.localeCompare(aAt)
  })

  const visible = sorted.filter((t) => {
    if (filter === 'open' && t.done) return false
    if (filter === 'done' && !t.done) return false
    if (scopeFilter === 'scoped' && !t.familyOfficeId) return false
    if (scopeFilter === 'unscoped' && t.familyOfficeId) return false
    return true
  })

  const openCount = allTasks.filter((t) => !t.done).length
  const doneCount = allTasks.filter((t) => t.done).length

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {openCount} open &middot; {doneCount} completed
          </p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          New task
        </Button>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1 border border-border rounded-full p-0.5">
          {(['open', 'done', 'all'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-full px-3 py-0.5 text-xs font-medium transition-colors capitalize',
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 border border-border rounded-full p-0.5">
          {(['all', 'scoped', 'unscoped'] as ScopeFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setScopeFilter(s)}
              className={cn(
                'rounded-full px-3 py-0.5 text-xs font-medium transition-colors',
                scopeFilter === s
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {s === 'scoped' ? 'Has FO' : s === 'unscoped' ? 'Unscoped' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      {visible.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center space-y-2">
          <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            {allTasks.length === 0
              ? 'No tasks yet. Create your first task.'
              : 'No tasks match your current filters.'}
          </p>
          {allTasks.length === 0 && (
            <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add task
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <div className="px-4">
            {visible.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                foName={getFOName(task.familyOfficeId)}
                onEdit={setEditingTask}
                onDelete={setDeletingTask}
                onToggle={toggleTaskDone}
              />
            ))}
          </div>
        </div>
      )}

      {/* Dialogs — lazy loaded */}
      {addOpen && (
        <Suspense fallback={null}>
          <TaskDialog
            open={addOpen}
            onOpenChange={setAddOpen}
            mode="create"
          />
        </Suspense>
      )}

      {editingTask && (
        <Suspense fallback={null}>
          <TaskDialog
            open={!!editingTask}
            onOpenChange={(open) => { if (!open) setEditingTask(null) }}
            mode="edit"
            initial={editingTask}
          />
        </Suspense>
      )}

      {deletingTask && (
        <ConfirmDialog
          open={!!deletingTask}
          onOpenChange={(open) => { if (!open) setDeletingTask(null) }}
          title="Delete task?"
          description={`Remove "${deletingTask.title}"?`}
          confirmLabel="Delete"
          destructive
          onConfirm={() => deleteTask(deletingTask.id)}
        />
      )}
    </div>
  )
}
