import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { SearchX, UsersRound } from 'lucide-react'

import { Badge, Button, Card, ConfirmDialog, EmptyState, ErrorState, FilterBar, Input, Modal, PageHeader, PageLoading, PasswordInput, SearchInput, Select, Switch, useToast } from '../../components/ui'
import { activateManagerStaff, createManagerStaff, deactivateManagerStaff, getManagerStaff, updateManagerStaff, type CreateStaffInput, type UpdateStaffInput } from '../../services/manager-staff-api'
import type { ManagedStaff, StaffRole } from '../../types/staff'
import { getApiErrorCode, getApiErrorMessage } from '../../utils/api-error'

type RoleFilter = 'ALL' | StaffRole
type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE'
type LifecycleAction = 'activate' | 'deactivate'
type StaffFormState = { active: boolean; email: string; name: string; password?: string; role: StaffRole; staff?: ManagedStaff; username: string }
type LifecycleTarget = { action: LifecycleAction; staff: ManagedStaff }

function formatCreatedAt(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

function roleLabel(role: StaffRole): string {
  if (role === 'WAITER') return 'Phục vụ'
  if (role === 'KITCHEN') return 'Bếp'
  return 'Quản lý'
}

function roleBadgeVariant(role: StaffRole): 'brand' | 'info' | 'warning' {
  if (role === 'WAITER') return 'info'
  if (role === 'KITCHEN') return 'warning'
  return 'brand'
}

function getStaffErrorMessage(error: unknown, fallback: string): string {
  const code = getApiErrorCode(error)
  if (code === 'USERNAME_ALREADY_EXISTS') return 'Tên đăng nhập đã tồn tại.'
  if (code === 'EMAIL_ALREADY_EXISTS') return 'Email đã tồn tại.'
  if (code === 'STAFF_IDENTIFIER_ALREADY_EXISTS') return 'Tên đăng nhập hoặc email đã tồn tại.'
  if (code === 'STAFF_NOT_FOUND') return 'Không tìm thấy nhân viên. Danh sách sẽ được tải lại.'
  if (code === 'VALIDATION_ERROR') return 'Thông tin nhân viên chưa hợp lệ.'
  return getApiErrorMessage(error, fallback)
}

function isValidEmail(email: string): boolean {
  return /^\S+@\S+\.\S+$/.test(email)
}

export function ManagerStaffListPage() {
  const toast = useToast()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [formState, setFormState] = useState<StaffFormState | null>(null)
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [lifecycleTarget, setLifecycleTarget] = useState<LifecycleTarget | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [staff, setStaff] = useState<ManagedStaff[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')

  useEffect(() => {
    let isCurrent = true
    async function loadStaff() {
      setIsLoading(true); setErrorMessage(null)
      try { const result = await getManagerStaff(); if (isCurrent) setStaff(result) }
      catch (error) { if (isCurrent) setErrorMessage(getStaffErrorMessage(error, 'Không thể tải danh sách nhân viên. Vui lòng thử lại.')) }
      finally { if (isCurrent) setIsLoading(false) }
    }
    void loadStaff()
    return () => { isCurrent = false }
  }, [reloadKey])

  const visibleStaff = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('vi')
    return staff.filter(member => {
      const matchesSearch = !query || member.name.toLocaleLowerCase('vi').includes(query) || member.username.toLocaleLowerCase('vi').includes(query) || member.email.toLocaleLowerCase('vi').includes(query)
      const matchesRole = roleFilter === 'ALL' || member.role === roleFilter
      const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' && member.active) || (statusFilter === 'INACTIVE' && !member.active)
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [roleFilter, searchTerm, staff, statusFilter])

  const isEditing = Boolean(formState?.staff)
  const hasActiveFilters = Boolean(searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL')
  const hasEditChanges = Boolean(formState?.staff && (
    formState.name.trim() !== formState.staff.name
    || formState.username.trim() !== formState.staff.username
    || formState.email.trim() !== formState.staff.email
    || formState.role !== formState.staff.role
  ))

  function resetFilters() { setRoleFilter('ALL'); setSearchTerm(''); setStatusFilter('ALL') }
  function openCreateForm() { setFormError(null); setFormState({ active: true, email: '', name: '', password: '', role: 'WAITER', username: '' }) }
  function openEditForm(member: ManagedStaff) { setFormError(null); setFormState({ active: member.active, email: member.email, name: member.name, role: member.role, staff: member, username: member.username }) }
  function closeForm() { if (!isFormSubmitting) { setFormError(null); setFormState(null) } }

  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!formState || isFormSubmitting) return
    const name = formState.name.trim()
    const username = formState.username.trim()
    const email = formState.email.trim()
    if (!name || !username || !email || (!formState.staff && !formState.password)) { setFormError('Vui lòng điền đầy đủ các trường bắt buộc.'); return }
    if (!isValidEmail(email)) { setFormError('Email chưa đúng định dạng.'); return }
    if (formState.staff && !hasEditChanges) return

    setFormError(null); setIsFormSubmitting(true)
    try {
      if (formState.staff) {
        const update: UpdateStaffInput = {}
        if (name !== formState.staff.name) update.name = name
        if (username !== formState.staff.username) update.username = username
        if (email !== formState.staff.email) update.email = email
        if (formState.role !== formState.staff.role) update.role = formState.role
        if (Object.keys(update).length === 0) {
          setFormState(null)
          return
        }
        await updateManagerStaff(formState.staff.id, update)
        toast.success('Đã cập nhật nhân viên.')
      } else {
        const input: CreateStaffInput = { name, username, email, password: formState.password ?? '', role: formState.role, active: formState.active }
        await createManagerStaff(input)
        toast.success('Đã thêm nhân viên.')
      }
      setFormState(null)
      setReloadKey(key => key + 1)
    } catch (error) {
      if (getApiErrorCode(error) === 'STAFF_NOT_FOUND') {
        setFormState(null); setReloadKey(key => key + 1); toast.error(getStaffErrorMessage(error, 'Không thể cập nhật nhân viên.'))
      } else setFormError(getStaffErrorMessage(error, 'Không thể lưu nhân viên. Vui lòng thử lại.'))
    } finally { setIsFormSubmitting(false) }
  }

  async function handleLifecycleConfirm() {
    if (!lifecycleTarget) return
    const { action, staff: member } = lifecycleTarget
    try {
      if (action === 'activate') { await activateManagerStaff(member.id); toast.success('Đã kích hoạt tài khoản nhân viên.') }
      else { await deactivateManagerStaff(member.id); toast.success('Đã vô hiệu hóa tài khoản nhân viên.') }
      setReloadKey(key => key + 1)
    } catch (error) {
      if (getApiErrorCode(error) === 'STAFF_NOT_FOUND') { setLifecycleTarget(null); setReloadKey(key => key + 1) }
      throw error
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader actions={<Button onClick={openCreateForm}>Thêm nhân viên</Button>} description="Quản lý tài khoản và vai trò của nhân viên." title="Nhân viên" />
      {isLoading && <PageLoading label="Đang tải danh sách nhân viên" />}
      {!isLoading && errorMessage && <ErrorState description={errorMessage} onRetry={() => setReloadKey(key => key + 1)} title="Không thể tải danh sách nhân viên" />}
      {!isLoading && !errorMessage && staff.length === 0 && <EmptyState action={<Button onClick={openCreateForm}>Thêm nhân viên</Button>} description="Thêm tài khoản nhân viên đầu tiên để bắt đầu phân công vận hành." icon={UsersRound} title="Chưa có nhân viên" />}
      {!isLoading && !errorMessage && staff.length > 0 && <>
        <FilterBar aria-label="Tìm kiếm và lọc nhân viên">
          <SearchInput className="sm:min-w-72" onChange={event => setSearchTerm(event.target.value)} onClear={() => setSearchTerm('')} placeholder="Tìm nhân viên..." value={searchTerm} />
          <Select className="sm:w-44" label="Vai trò" onChange={event => setRoleFilter(event.target.value as RoleFilter)} value={roleFilter}><option value="ALL">Tất cả vai trò</option><option value="WAITER">Phục vụ</option><option value="KITCHEN">Bếp</option><option value="MANAGER">Quản lý</option></Select>
          <Select className="sm:w-44" label="Trạng thái" onChange={event => setStatusFilter(event.target.value as StatusFilter)} value={statusFilter}><option value="ALL">Tất cả trạng thái</option><option value="ACTIVE">Đang hoạt động</option><option value="INACTIVE">Không hoạt động</option></Select>
          {hasActiveFilters && <Button onClick={resetFilters} size="sm" variant="secondary">Xóa bộ lọc</Button>}
        </FilterBar>
        {visibleStaff.length === 0 ? <EmptyState description="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để xem nhân viên khác." icon={SearchX} title="Không tìm thấy nhân viên phù hợp" /> : (
          <Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[860px] text-left"><thead className="border-b border-border bg-surface-muted text-caption font-semibold text-content-secondary"><tr><th className="px-5 py-3" scope="col">Tên</th><th className="px-5 py-3" scope="col">Tên đăng nhập / Email</th><th className="px-5 py-3" scope="col">Vai trò</th><th className="px-5 py-3" scope="col">Trạng thái</th><th className="px-5 py-3" scope="col">Ngày tạo</th><th className="px-5 py-3" scope="col">Thao tác</th></tr></thead><tbody className="divide-y divide-border">
            {visibleStaff.map(member => <tr className="align-top" key={member.id}><td className="px-5 py-4 text-compact font-medium text-content">{member.name}</td><td className="px-5 py-4 text-compact text-content-secondary"><p className="font-medium text-content">{member.username}</p><p className="mt-1 break-all">{member.email}</p></td><td className="px-5 py-4"><Badge variant={roleBadgeVariant(member.role)}>{roleLabel(member.role)}</Badge></td><td className="px-5 py-4"><Badge variant={member.active ? 'success' : 'neutral'}>{member.active ? 'Hoạt động' : 'Không hoạt động'}</Badge></td><td className="whitespace-nowrap px-5 py-4 text-compact text-content-secondary">{formatCreatedAt(member.createdAt)}</td><td className="px-5 py-4"><div className="flex flex-wrap gap-2"><Button aria-label={`Chỉnh sửa ${member.name}`} onClick={() => openEditForm(member)} size="sm" variant="secondary">Chỉnh sửa</Button>{member.active ? <Button aria-label={`Vô hiệu hóa ${member.name}`} onClick={() => setLifecycleTarget({ action: 'deactivate', staff: member })} size="sm" variant="secondary">Vô hiệu hóa</Button> : <Button aria-label={`Kích hoạt ${member.name}`} onClick={() => setLifecycleTarget({ action: 'activate', staff: member })} size="sm">Kích hoạt</Button>}</div></td></tr>)}
          </tbody></table></div></Card>
        )}
      </>}
      <Modal dismissible={!isFormSubmitting} footer={<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button disabled={isFormSubmitting} onClick={closeForm} variant="secondary">Hủy</Button><Button disabled={isEditing && !hasEditChanges} form="staff-form" loading={isFormSubmitting} type="submit">{isEditing ? 'Lưu thay đổi' : 'Thêm nhân viên'}</Button></div>} isOpen={Boolean(formState)} onClose={closeForm} title={isEditing ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên'}>
        <form className="space-y-4" id="staff-form" onSubmit={handleFormSubmit}>
          <Input disabled={isFormSubmitting} error={formError ?? undefined} label="Tên *" onChange={event => setFormState(current => current ? { ...current, name: event.target.value } : current)} required value={formState?.name ?? ''} />
          <Input disabled={isFormSubmitting} label="Tên đăng nhập *" onChange={event => setFormState(current => current ? { ...current, username: event.target.value } : current)} required value={formState?.username ?? ''} />
          <Input disabled={isFormSubmitting} label="Email *" onChange={event => setFormState(current => current ? { ...current, email: event.target.value } : current)} required type="email" value={formState?.email ?? ''} />
          {!isEditing && <PasswordInput disabled={isFormSubmitting} label="Mật khẩu *" onChange={event => setFormState(current => current ? { ...current, password: event.target.value } : current)} required value={formState?.password ?? ''} />}
          <Select disabled={isFormSubmitting} label="Vai trò *" onChange={event => setFormState(current => current ? { ...current, role: event.target.value as StaffRole } : current)} value={formState?.role ?? 'WAITER'}><option value="WAITER">Phục vụ</option><option value="KITCHEN">Bếp</option><option value="MANAGER">Quản lý</option></Select>
          {!isEditing && <Switch checked={formState?.active ?? true} disabled={isFormSubmitting} label="Tài khoản đang hoạt động" onChange={event => setFormState(current => current ? { ...current, active: event.target.checked } : current)} />}
        </form>
      </Modal>
      <ConfirmDialog confirmLabel={lifecycleTarget?.action === 'activate' ? 'Kích hoạt' : 'Vô hiệu hóa'} description={lifecycleTarget ? lifecycleTarget.action === 'activate' ? `Tài khoản “${lifecycleTarget.staff.name}” sẽ có thể sử dụng lại quyền truy cập theo vai trò ${roleLabel(lifecycleTarget.staff.role)}.` : `Tài khoản “${lifecycleTarget.staff.name}” sẽ không thể đăng nhập hoặc sử dụng khu vực nhân viên sau khi vô hiệu hóa.` : ''} destructive={lifecycleTarget?.action === 'deactivate'} isOpen={Boolean(lifecycleTarget)} onClose={() => setLifecycleTarget(null)} onConfirm={handleLifecycleConfirm} onError={error => toast.error(getStaffErrorMessage(error, 'Không thể thay đổi trạng thái nhân viên. Vui lòng thử lại.'))} title={lifecycleTarget?.action === 'activate' ? 'Kích hoạt nhân viên?' : 'Vô hiệu hóa nhân viên?'} />
    </div>
  )
}
