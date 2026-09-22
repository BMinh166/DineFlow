import { useState, type FormEvent } from 'react'
import { CheckCircle2, KeyRound } from 'lucide-react'

import { Badge, Button, Input, Modal, useToast } from '../../components/ui'
import { useCustomerSession } from '../../hooks/useCustomerSession'
import { getCustomerJoinErrorKind } from '../../services/customer-session-api'

type JoinTableCardProps = {
  tableId: string
}

const joinErrorMessages = {
  'invalid-code': 'Mã vào bàn không đúng. Vui lòng thử lại.',
  cooldown: 'Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau.',
  unavailable: 'Bàn hiện chưa được nhân viên mở. Vui lòng liên hệ nhân viên.',
  unexpected: 'Không thể vào bàn lúc này. Vui lòng thử lại.',
} as const

export function JoinTableCard({ tableId }: JoinTableCardProps) {
  const { isAuthorizedForTable, join, status } = useCustomerSession()
  const toast = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [code, setCode] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCooldown, setIsCooldown] = useState(false)
  const isJoined = isAuthorizedForTable(tableId)
  const canSubmit = code.length === 4 && !isSubmitting && !isCooldown

  function openModal() {
    setIsCooldown(false)
    setErrorMessage(null)
    setIsModalOpen(true)
  }

  function closeModal() {
    if (isSubmitting) return
    setIsModalOpen(false)
  }

  function handleCodeChange(value: string) {
    setCode(value.replace(/\D/g, '').slice(0, 4))
    setErrorMessage(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) return

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await join(tableId, Number(code))
      setCode('')
      setIsModalOpen(false)
      toast.success('Bạn đã vào bàn thành công.')
    } catch (error) {
      const kind = getCustomerJoinErrorKind(error)
      setIsCooldown(kind === 'cooldown')
      setErrorMessage(joinErrorMessages[kind])
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isJoined) {
    return (
      <section className="rounded-card border border-success/30 bg-success/10 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-success" />
          <div>
            <Badge variant="success">Đã vào bàn</Badge>
            <p className="mt-2 text-body text-content-secondary">Bạn đã được xác nhận cho bàn này.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="rounded-card border border-border bg-surface p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-subsection text-content">Vào bàn</h2>
            <p className="mt-1 text-compact text-content-secondary">Nhập mã 4 chữ số do nhân viên cung cấp để xác nhận phục vụ tại bàn.</p>
          </div>
          <Button disabled={status === 'restoring'} onClick={openModal}><KeyRound aria-hidden="true" className="size-4" />Nhập mã bàn</Button>
        </div>
        {status === 'restoring' && <p className="mt-3 text-caption text-content-secondary" role="status">Đang kiểm tra trạng thái vào bàn...</p>}
      </section>

      <Modal
        dismissible={!isSubmitting}
        footer={<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button disabled={isSubmitting} onClick={closeModal} variant="secondary">Hủy</Button><Button disabled={!canSubmit} form="join-table-form" loading={isSubmitting} type="submit">Vào bàn</Button></div>}
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Nhập mã vào bàn"
      >
        <form className="space-y-4" id="join-table-form" onSubmit={handleSubmit}>
          <p className="text-body text-content-secondary">Vui lòng nhập mã gồm 4 chữ số mà nhân viên đã cung cấp.</p>
          <div aria-live="polite">
            <Input
              autoComplete="off"
              disabled={isSubmitting || isCooldown}
              error={errorMessage ?? undefined}
              inputMode="numeric"
              label="Mã vào bàn"
              maxLength={4}
              onChange={event => handleCodeChange(event.target.value)}
              pattern="[0-9]*"
              placeholder="0000"
              required
              value={code}
            />
          </div>
          {isCooldown && <p className="text-caption text-content-secondary">Bạn có thể tiếp tục xem thực đơn trong khi chờ thử lại.</p>}
        </form>
      </Modal>
    </>
  )
}
