import { useEffect, useState, type FormEvent } from 'react'
import { Banknote } from 'lucide-react'

import { Button, Card, EmptyState, ErrorState, FilterBar, Input, PageHeader, PageLoading, Select } from '../../components/ui'
import { getManagerRevenue } from '../../services/manager-revenue-api'
import type { ManagerRevenuePeriod, ManagerRevenueQuery, ManagerRevenueSummary } from '../../types/manager-revenue'
import { getApiErrorMessage } from '../../utils/api-error'
import { formatVnd } from '../../utils/format-vnd'

const periodLabels: Record<ManagerRevenuePeriod, string> = {
  TODAY: 'Hôm nay',
  LAST_7_DAYS: '7 ngày gần nhất',
  CUSTOM_RANGE: 'Khoảng tùy chỉnh',
}

function summaryIsEmpty(summary: ManagerRevenueSummary): boolean {
  return summary.totalRevenue === 0 && summary.closedOrderCount === 0
}

export function ManagerRevenuePage() {
  const [selectedPeriod, setSelectedPeriod] = useState<ManagerRevenuePeriod>('TODAY')
  const [appliedQuery, setAppliedQuery] = useState<ManagerRevenueQuery>({ period: 'TODAY' })
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [dateRangeError, setDateRangeError] = useState<string | null>(null)
  const [summary, setSummary] = useState<ManagerRevenueSummary | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadRevenue() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const result = await getManagerRevenue(appliedQuery, controller.signal)
        if (!controller.signal.aborted) setSummary(result)
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(getApiErrorMessage(error, 'Không thể tải doanh thu. Vui lòng thử lại.'))
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    void loadRevenue()
    return () => controller.abort()
  }, [appliedQuery, reloadKey])

  function selectPeriod(period: ManagerRevenuePeriod) {
    setSelectedPeriod(period)
    setDateRangeError(null)
    if (period !== 'CUSTOM_RANGE') setAppliedQuery({ period })
  }

  function applyCustomRange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!dateFrom || !dateTo) {
      setDateRangeError('Vui lòng chọn đầy đủ Từ ngày và Đến ngày.')
      return
    }
    if (dateFrom > dateTo) {
      setDateRangeError('Từ ngày không được sau Đến ngày.')
      return
    }

    setDateRangeError(null)
    setAppliedQuery({ period: 'CUSTOM_RANGE', dateFrom, dateTo })
  }

  const customRangeIsUnapplied = selectedPeriod === 'CUSTOM_RANGE'
    && (appliedQuery.period !== 'CUSTOM_RANGE'
      || appliedQuery.dateFrom !== dateFrom
      || appliedQuery.dateTo !== dateTo)
  const showSummary = !isLoading && !errorMessage && !customRangeIsUnapplied && summary

  return (
    <div className="space-y-6">
      <PageHeader
        description="Theo dõi doanh thu từ các đơn đã đóng theo khoảng thời gian được chọn."
        title="Doanh thu"
      />

      <Card className="p-4 sm:p-5">
        <FilterBar>
          <div className="w-full sm:w-64">
            <Select label="Khoảng thời gian" onChange={event => selectPeriod(event.target.value as ManagerRevenuePeriod)} value={selectedPeriod}>
              <option value="TODAY">Hôm nay</option>
              <option value="LAST_7_DAYS">7 ngày gần nhất</option>
              <option value="CUSTOM_RANGE">Khoảng tùy chỉnh</option>
            </Select>
          </div>
        </FilterBar>

        {selectedPeriod === 'CUSTOM_RANGE' && (
          <form className="mt-4" onSubmit={applyCustomRange}>
            <FilterBar>
              <div className="w-full sm:w-52">
                <Input label="Từ ngày" max={dateTo || undefined} onChange={event => setDateFrom(event.target.value)} type="date" value={dateFrom} />
              </div>
              <div className="w-full sm:w-52">
                <Input error={dateRangeError ?? undefined} label="Đến ngày" min={dateFrom || undefined} onChange={event => setDateTo(event.target.value)} type="date" value={dateTo} />
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <Button type="submit">Áp dụng</Button>
              </div>
            </FilterBar>
          </form>
        )}
      </Card>

      {isLoading && <PageLoading label="Đang tải doanh thu" />}
      {!isLoading && errorMessage && (
        <ErrorState
          description={errorMessage}
          onRetry={() => setReloadKey(key => key + 1)}
          title="Không thể tải doanh thu"
        />
      )}
      {!isLoading && !errorMessage && customRangeIsUnapplied && (
        <EmptyState
          description="Chọn Từ ngày và Đến ngày, sau đó nhấn Áp dụng để xem doanh thu."
          icon={Banknote}
          title="Chọn khoảng thời gian"
        />
      )}
      {showSummary && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-5">
              <p className="text-label text-content-secondary">Tổng doanh thu</p>
              <p className="mt-2 text-2xl font-semibold text-content">{formatVnd(summary.totalRevenue)}</p>
            </Card>
            <Card className="p-5">
              <p className="text-label text-content-secondary">Đơn đã đóng</p>
              <p className="mt-2 text-2xl font-semibold text-content">{summary.closedOrderCount}</p>
            </Card>
          </div>
          {summaryIsEmpty(summary) && (
            <EmptyState
              description={`Chưa có đơn đã đóng trong khoảng ${periodLabels[summary.period].toLowerCase()}.`}
              icon={Banknote}
              title="Chưa có doanh thu"
            />
          )}
        </>
      )}
    </div>
  )
}
