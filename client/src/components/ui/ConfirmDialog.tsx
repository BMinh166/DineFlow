import { useEffect, useState, type ReactNode } from 'react'
import { Button } from './Button'
import { Modal } from './Modal'

type ConfirmDialogProps = {
  cancelLabel?: string
  confirmLabel?: string
  description: ReactNode
  destructive?: boolean
  isOpen: boolean
  onCancel?: () => void
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: ReactNode
}

export function ConfirmDialog({
  cancelLabel = 'Hủy',
  confirmLabel = 'Xác nhận',
  description,
  destructive = false,
  isOpen,
  onCancel,
  onClose,
  onConfirm,
  title,
}: ConfirmDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false)

  useEffect(() => {
    if (!isOpen) setIsConfirming(false)
  }, [isOpen])

  async function handleConfirm() {
    setIsConfirming(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setIsConfirming(false)
    }
  }

  function handleCancel() {
    if (isConfirming) return
    onCancel?.()
    onClose()
  }

  return (
    <Modal
      dismissible={!isConfirming}
      footer={(
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button disabled={isConfirming} onClick={handleCancel} variant="secondary">{cancelLabel}</Button>
          <Button loading={isConfirming} onClick={() => void handleConfirm()} variant={destructive ? 'danger' : 'primary'}>{confirmLabel}</Button>
        </div>
      )}
      isOpen={isOpen}
      onClose={handleCancel}
      title={title}
    >
      <p className="text-body text-content-secondary">{description}</p>
    </Modal>
  )
}
