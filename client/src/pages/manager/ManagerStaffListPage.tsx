import { useEffect, useMemo, useState } from 'react'
import { SearchX, UsersRound } from 'lucide-react'

import { Badge, Button, Card, EmptyState, ErrorState, FilterBar, PageHeader, PageLoading, SearchInput, Select } from '../../components/ui'
import { getManagerStaff } from '../../services/manager-staff-api'
import type { ManagedStaff, StaffRole } from '../../types/staff'
import { getApiErrorMessage } from '../../utils/api-error'

type RoleFilter = 'ALL' | StaffRole
type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE'

function formatCreatedAt(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
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

export function ManagerStaffListPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [staff, setStaff] = useState<ManagedStaff[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')

  useEffect(() => {
    let isCurrent = true

    async function loadStaff() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const result = await getManagerStaff()
        if (isCurrent) setStaff(result)
      } catch (error) {
        if (isCurrent) setErrorMessage(getApiErrorMessage(error, 'Không thể tải danh sách nhân viên. Vui lòng thử lại.'))
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    void loadStaff()
    return () => {
      isCurrent = false
    }
  }, [reloadKey])

  const visibleStaff = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('vi')

    return staff.filter(member => {
      const matchesSearch = !query
        || member.name.toLocaleLowerCase('vi').includes(query)
        || member.username.toLocaleLowerCase('vi').includes(query)
        || member.email.toLocaleLowerCase('vi').includes(query)
      const matchesRole = roleFilter === 'ALL' || member.role === roleFilter
      const matchesStatus = statusFilter === 'ALL'
        || (statusFilter === 'ACTIVE' && member.active)
        || (statusFilter === 'INACTIVE' && !member.active)

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [roleFilter, searchTerm, staff, statusFilter])

  const hasActiveFilters = Boolean(searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL')

  function resetFilters() {
    setRoleFilter('ALL')
    setSearchTerm('')
    setStatusFilter('ALL')
  }

  return (
    <div className="space-y-6">
      <PageHeader description="Quản lý tài khoản và vai trò của nhân viên." title="Nhân viên" />

      {isLoading && <PageLoading label="Đang tải danh sách nhân viên" />}
      {!isLoading && errorMessage && <ErrorState description={errorMessage} onRetry={() => setReloadKey(key => key + 1)} title="Không thể tải danh sách nhân viên" />}
      {!isLoading && !errorMessage && staff.length === 0 && (
        <EmptyState description="Chưa có tài khoản nhân viên nào để hiển thị." icon={UsersRound} title="Chưa có nhân viên" />
      )}
      {!isLoading && !errorMessage && staff.length > 0 && (
        <>
          <FilterBar aria-label="Tìm kiếm và lọc nhân viên">
            <SearchInput className="sm:min-w-72" onChange={event => setSearchTerm(event.target.value)} onClear={() => setSearchTerm('')} placeholder="Tìm nhân viên..." value={searchTerm} />
            <Select className="sm:w-44" label="Vai trò" onChange={event => setRoleFilter(event.target.value as RoleFilter)} value={roleFilter}>
              <option value="ALL">Tất cả vai trò</option>
              <option value="WAITER">Phục vụ</option>
              <option value="KITCHEN">Bếp</option>
              <option value="MANAGER">Quản lý</option>
            </Select>
            <Select className="sm:w-44" label="Trạng thái" onChange={event => setStatusFilter(event.target.value as StatusFilter)} value={statusFilter}>
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Không hoạt động</option>
            </Select>
            {hasActiveFilters && <Button onClick={resetFilters} size="sm" variant="secondary">Xóa bộ lọc</Button>}
          </FilterBar>

          {visibleStaff.length === 0 ? (
            <EmptyState description="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để xem nhân viên khác." icon={SearchX} title="Không tìm thấy nhân viên phù hợp" />
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
                  <thead className="border-b border-border bg-surface-muted text-caption font-semibold text-content-secondary">
                    <tr>
                      <th className="px-5 py-3" scope="col">Tên</th>
                      <th className="px-5 py-3" scope="col">Tên đăng nhập / Email</th>
                      <th className="px-5 py-3" scope="col">Vai trò</th>
                      <th className="px-5 py-3" scope="col">Trạng thái</th>
                      <th className="px-5 py-3" scope="col">Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {visibleStaff.map(member => (
                      <tr className="align-top" key={member.id}>
                        <td className="px-5 py-4 text-compact font-medium text-content">{member.name}</td>
                        <td className="px-5 py-4 text-compact text-content-secondary"><p className="font-medium text-content">{member.username}</p><p className="mt-1 break-all">{member.email}</p></td>
                        <td className="px-5 py-4"><Badge variant={roleBadgeVariant(member.role)}>{roleLabel(member.role)}</Badge></td>
                        <td className="px-5 py-4"><Badge variant={member.active ? 'success' : 'neutral'}>{member.active ? 'Hoạt động' : 'Không hoạt động'}</Badge></td>
                        <td className="whitespace-nowrap px-5 py-4 text-compact text-content-secondary">{formatCreatedAt(member.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
