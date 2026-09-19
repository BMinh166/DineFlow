import { useEffect, useState, type FormEvent } from 'react'
import axios from 'axios'
import { Plus, TableProperties } from 'lucide-react'
import { Badge, Button, Card, ConfirmDialog, EmptyState, ErrorState, Input, Modal, PageHeader, PageLoading, StatusBadge, useToast } from '../../components/ui'
import { activateManagerTable, createManagerTable, deactivateManagerTable, getManagerTables, updateManagerTable } from '../../services/manager-table-api'
import type { ManagerTable } from '../../types/table'
import { getApiErrorMessage } from '../../utils/api-error'

type TableFormState = {
  number: string
  table?: ManagerTable
}

function getTableErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback

  const code = error.response?.data?.code
  if (code === 'TABLE_NUMBER_ALREADY_EXISTS') return 'Số bàn đã tồn tại.'
  if (code === 'TABLE_OCCUPIED') return 'Bàn đang được sử dụng và không thể vô hiệu hóa.'
  if (code === 'TABLE_HAS_ACTIVE_SESSION') return 'Bàn đang có phiên hoạt động và không thể vô hiệu hóa.'
  if (code === 'TABLE_NOT_FOUND') return 'Không tìm thấy bàn. Vui lòng tải lại danh sách.'

  return getApiErrorMessage(error, fallback)
}

function getDeactivationReason(table: ManagerTable): string | null {
  if (table.status === 'OCCUPIED') return 'Bàn đang được sử dụng.'
  if (table.hasActiveSession) return 'Bàn đang có phiên hoạt động.'
  return null
}

export function ManagerTableListPage() {
  const toast = useToast()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [formState, setFormState] = useState<TableFormState | null>(null)
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [mutationTableId, setMutationTableId] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [tableToDeactivate, setTableToDeactivate] = useState<ManagerTable | null>(null)
  const [tables, setTables] = useState<ManagerTable[]>([])

  useEffect(() => {
    let isCurrent = true

    async function loadTables() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const result = await getManagerTables()
        if (isCurrent) setTables(result)
      } catch (error) {
        if (isCurrent) setErrorMessage(getTableErrorMessage(error, 'Không thể tải danh sách bàn. Vui lòng thử lại.'))
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    void loadTables()
    return () => {
      isCurrent = false
    }
  }, [reloadKey])

  function openCreateForm() {
    setFormError(null)
    setFormState({ number: '' })
  }

  function openEditForm(table: ManagerTable) {
    setFormError(null)
    setFormState({ table, number: String(table.number) })
  }

  function closeForm() {
    if (isFormSubmitting) return
    setFormError(null)
    setFormState(null)
  }

  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!formState || isFormSubmitting) return

    const number = Number(formState.number)
    if (!Number.isInteger(number) || number <= 0) {
      setFormError('Số bàn phải là số nguyên dương.')
      return
    }

    setFormError(null)
    setIsFormSubmitting(true)

    try {
      if (formState.table) {
        await updateManagerTable(formState.table.id, { number })
        toast.success('Đã cập nhật số bàn.')
      } else {
        await createManagerTable({ number })
        toast.success('Đã thêm bàn mới.')
      }

      setFormState(null)
      setReloadKey(key => key + 1)
    } catch (error) {
      setFormError(getTableErrorMessage(error, 'Không thể lưu bàn. Vui lòng thử lại.'))
    } finally {
      setIsFormSubmitting(false)
    }
  }

  async function mutateTable(tableId: string, mutation: () => Promise<ManagerTable>, successMessage: string) {
    if (mutationTableId) return

    setMutationTableId(tableId)
    try {
      await mutation()
      toast.success(successMessage)
      setReloadKey(key => key + 1)
    } catch (error) {
      setReloadKey(key => key + 1)
      throw error
    } finally {
      setMutationTableId(null)
    }
  }

  const isEditing = Boolean(formState?.table)

  return (
    <div className="space-y-6">
      <PageHeader actions={<Button onClick={openCreateForm}><Plus aria-hidden="true" className="size-4" />Thêm bàn</Button>} description="Quản lý bàn và theo dõi trạng thái vận hành hiện tại." title="Bàn" />

      {isLoading && <PageLoading label="Đang tải danh sách bàn" />}
      {!isLoading && errorMessage && <ErrorState description={errorMessage} onRetry={() => setReloadKey(key => key + 1)} title="Không thể tải danh sách bàn" />}
      {!isLoading && !errorMessage && tables.length === 0 && <EmptyState action={<Button onClick={openCreateForm}>Thêm bàn</Button>} description="Thêm bàn đầu tiên để bắt đầu quản lý khu vực phục vụ." icon={TableProperties} title="Chưa có bàn" />}
      {!isLoading && !errorMessage && tables.length > 0 && (
        <ul aria-label="Danh sách bàn" className="grid gap-4 lg:grid-cols-2">
          {tables.map(table => {
            const deactivationReason = getDeactivationReason(table)
            const isPending = mutationTableId === table.id

            return (
              <li key={table.id}>
                <Card className="h-full p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-subsection text-content">Bàn {table.number}</h2>
                      <p className="mt-1 text-compact text-content-secondary">Thông tin quản lý và trạng thái hiện tại.</p>
                    </div>
                    <div className="flex flex-wrap gap-2" aria-label={`Trạng thái bàn ${table.number}`}>
                      <StatusBadge entity="table" status={table.status} />
                      <StatusBadge entity="category" status={table.active ? 'ACTIVE' : 'INACTIVE'} />
                      <Badge variant={table.hasActiveSession ? 'info' : 'neutral'}>Phiên hiện tại: {table.hasActiveSession ? 'Có' : 'Không'}</Badge>
                    </div>
                  </div>
                  <dl className="mt-5 grid grid-cols-1 gap-3 border-y border-border py-4 text-compact sm:grid-cols-3">
                    <div><dt className="text-content-muted">Trạng thái vận hành</dt><dd className="mt-1 font-medium text-content">{table.status === 'AVAILABLE' ? 'Trống' : 'Đang sử dụng'}</dd></div>
                    <div><dt className="text-content-muted">Vòng đời</dt><dd className="mt-1 font-medium text-content">{table.active ? 'Hoạt động' : 'Không hoạt động'}</dd></div>
                    <div><dt className="text-content-muted">Phiên hiện tại</dt><dd className="mt-1 font-medium text-content">{table.hasActiveSession ? 'Có' : 'Không'}</dd></div>
                  </dl>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button disabled={Boolean(mutationTableId)} onClick={() => openEditForm(table)} size="sm" variant="secondary">Chỉnh sửa</Button>
                    {table.active ? (
                      <Button disabled={Boolean(mutationTableId) || Boolean(deactivationReason)} loading={isPending} onClick={() => setTableToDeactivate(table)} size="sm" title={deactivationReason ?? undefined} variant="secondary">Vô hiệu hóa</Button>
                    ) : (
                      <Button disabled={Boolean(mutationTableId)} loading={isPending} onClick={() => void mutateTable(table.id, () => activateManagerTable(table.id), 'Đã kích hoạt bàn.').catch(error => toast.error(getTableErrorMessage(error, 'Không thể kích hoạt bàn. Vui lòng thử lại.')))} size="sm">Kích hoạt</Button>
                    )}
                  </div>
                  {table.active && deactivationReason && <p className="mt-3 text-compact text-warning">Không thể vô hiệu hóa: {deactivationReason}</p>}
                </Card>
              </li>
            )
          })}
        </ul>
      )}

      <Modal
        dismissible={!isFormSubmitting}
        footer={<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button disabled={isFormSubmitting} onClick={closeForm} variant="secondary">Hủy</Button><Button form="table-form" loading={isFormSubmitting} type="submit">{isEditing ? 'Lưu thay đổi' : 'Thêm bàn'}</Button></div>}
        isOpen={Boolean(formState)}
        onClose={closeForm}
        title={isEditing ? 'Chỉnh sửa bàn' : 'Thêm bàn'}
      >
        <form className="space-y-4" id="table-form" onSubmit={handleFormSubmit}>
          <Input disabled={isFormSubmitting} error={formError ?? undefined} inputMode="numeric" label="Số bàn *" min="1" onChange={event => setFormState(current => current ? { ...current, number: event.target.value } : current)} required step="1" type="number" value={formState?.number ?? ''} />
        </form>
      </Modal>

      <ConfirmDialog
        confirmLabel="Vô hiệu hóa"
        description={tableToDeactivate ? `Bàn ${tableToDeactivate.number} sẽ chuyển sang trạng thái không hoạt động. Trạng thái vận hành không thay đổi.` : ''}
        isOpen={Boolean(tableToDeactivate)}
        onClose={() => setTableToDeactivate(null)}
        onConfirm={() => tableToDeactivate ? mutateTable(tableToDeactivate.id, () => deactivateManagerTable(tableToDeactivate.id), 'Đã vô hiệu hóa bàn.') : Promise.resolve()}
        onError={error => toast.error(getTableErrorMessage(error, 'Không thể vô hiệu hóa bàn. Vui lòng thử lại.'))}
        title="Vô hiệu hóa bàn?"
      />
    </div>
  )
}
