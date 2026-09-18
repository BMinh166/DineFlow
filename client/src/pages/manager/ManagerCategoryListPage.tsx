import { useEffect, useState, type FormEvent } from 'react'
import { FolderOpen } from 'lucide-react'
import { Button, Card, ConfirmDialog, EmptyState, ErrorState, Input, Modal, PageHeader, PageLoading, StatusBadge, Textarea, useToast } from '../../components/ui'
import { activateManagerCategory, createManagerCategory, deactivateManagerCategory, getManagerCategories, updateManagerCategory } from '../../services/manager-category-api'
import type { Category } from '../../types/category'
import { getApiErrorMessage } from '../../utils/api-error'

type CategoryFormState = {
  category?: Category
  description: string
  name: string
}

export function ManagerCategoryListPage() {
  const toast = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryToDeactivate, setCategoryToDeactivate] = useState<Category | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [formState, setFormState] = useState<CategoryFormState | null>(null)
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [lifecycleCategoryId, setLifecycleCategoryId] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isCurrent = true

    async function loadCategories() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const result = await getManagerCategories()
        if (isCurrent) setCategories(result)
      } catch (error) {
        if (isCurrent) setErrorMessage(getApiErrorMessage(error, 'Không thể tải danh mục. Vui lòng thử lại.'))
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    void loadCategories()
    return () => {
      isCurrent = false
    }
  }, [reloadKey])

  function openCreateForm() {
    setFormError(null)
    setFormState({ name: '', description: '' })
  }

  function openEditForm(category: Category) {
    setFormError(null)
    setFormState({ category, name: category.name, description: category.description ?? '' })
  }

  function closeForm() {
    if (isFormSubmitting) return
    setFormError(null)
    setFormState(null)
  }

  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!formState || isFormSubmitting) return

    if (!formState.name) {
      setFormError('Vui lòng nhập tên danh mục.')
      return
    }

    setFormError(null)
    setIsFormSubmitting(true)

    try {
      if (formState.category) {
        await updateManagerCategory(formState.category.id, {
          name: formState.name,
          description: formState.description,
        })
        toast.success('Đã cập nhật danh mục.')
      } else {
        await createManagerCategory({
          name: formState.name,
          ...(formState.description ? { description: formState.description } : {}),
        })
        toast.success('Đã thêm danh mục.')
      }

      setFormState(null)
      setReloadKey(key => key + 1)
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Không thể lưu danh mục. Vui lòng thử lại.'))
    } finally {
      setIsFormSubmitting(false)
    }
  }

  async function handleActivate(category: Category) {
    if (lifecycleCategoryId) return

    setLifecycleCategoryId(category.id)
    try {
      await activateManagerCategory(category.id)
      toast.success('Đã kích hoạt danh mục.')
      setReloadKey(key => key + 1)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể kích hoạt danh mục. Vui lòng thử lại.'))
    } finally {
      setLifecycleCategoryId(null)
    }
  }

  async function handleDeactivate() {
    if (!categoryToDeactivate || lifecycleCategoryId) return

    setLifecycleCategoryId(categoryToDeactivate.id)
    try {
      await deactivateManagerCategory(categoryToDeactivate.id)
      toast.success('Đã vô hiệu hóa danh mục.')
      setReloadKey(key => key + 1)
    } finally {
      setLifecycleCategoryId(null)
    }
  }

  const isEditing = Boolean(formState?.category)

  return (
    <div className="space-y-6">
      <PageHeader
        actions={<Button onClick={openCreateForm}>Thêm danh mục</Button>}
        description="Quản lý các nhóm món ăn trong thực đơn."
        title="Danh mục"
      />

      {isLoading && <PageLoading label="Đang tải danh mục" />}
      {!isLoading && errorMessage && <ErrorState description={errorMessage} onRetry={() => setReloadKey(key => key + 1)} title="Không thể tải danh mục" />}
      {!isLoading && !errorMessage && categories.length === 0 && (
        <EmptyState description="Tạo danh mục đầu tiên để bắt đầu tổ chức thực đơn." icon={FolderOpen} title="Chưa có danh mục" />
      )}
      {!isLoading && !errorMessage && categories.length > 0 && (
        <Card className="overflow-hidden">
          <ul aria-label="Danh sách danh mục" className="divide-y divide-border">
            {categories.map(category => {
              const isLifecyclePending = lifecycleCategoryId === category.id

              return (
                <li className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between" key={category.id}>
                  <div className="min-w-0">
                    <h2 className="text-card-title text-content">{category.name}</h2>
                    <p className="mt-1 text-compact text-content-secondary">{category.description || 'Chưa có mô tả.'}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge entity="category" status={category.active ? 'ACTIVE' : 'INACTIVE'} />
                    <Button disabled={Boolean(lifecycleCategoryId)} onClick={() => openEditForm(category)} size="sm" variant="secondary">Chỉnh sửa</Button>
                    {category.active ? (
                      <Button disabled={isLifecyclePending} loading={isLifecyclePending} onClick={() => setCategoryToDeactivate(category)} size="sm" variant="secondary">Vô hiệu hóa</Button>
                    ) : (
                      <Button disabled={isLifecyclePending} loading={isLifecyclePending} onClick={() => void handleActivate(category)} size="sm">Kích hoạt</Button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>
      )}

      <Modal
        dismissible={!isFormSubmitting}
        footer={(
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button disabled={isFormSubmitting} onClick={closeForm} variant="secondary">Hủy</Button>
            <Button form="category-form" loading={isFormSubmitting} type="submit">{isEditing ? 'Lưu thay đổi' : 'Thêm danh mục'}</Button>
          </div>
        )}
        isOpen={Boolean(formState)}
        onClose={closeForm}
        title={isEditing ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'}
      >
        <form className="space-y-4" id="category-form" onSubmit={handleFormSubmit}>
          <Input
            disabled={isFormSubmitting}
            error={formError ?? undefined}
            label="Tên danh mục *"
            onChange={event => setFormState(current => current ? { ...current, name: event.target.value } : current)}
            required
            value={formState?.name ?? ''}
          />
          <Textarea
            disabled={isFormSubmitting}
            label="Mô tả"
            onChange={event => setFormState(current => current ? { ...current, description: event.target.value } : current)}
            value={formState?.description ?? ''}
          />
        </form>
      </Modal>

      <ConfirmDialog
        confirmLabel="Vô hiệu hóa"
        description={categoryToDeactivate ? `Danh mục “${categoryToDeactivate.name}” sẽ chuyển sang trạng thái không hoạt động. Dữ liệu danh mục không bị xóa.` : ''}
        isOpen={Boolean(categoryToDeactivate)}
        onClose={() => setCategoryToDeactivate(null)}
        onConfirm={handleDeactivate}
        onError={error => toast.error(getApiErrorMessage(error, 'Không thể vô hiệu hóa danh mục. Vui lòng thử lại.'))}
        title="Vô hiệu hóa danh mục?"
      />
    </div>
  )
}
