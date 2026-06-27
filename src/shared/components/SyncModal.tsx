import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
} from "@/shared/components/ui/dialog"

interface SyncModalProps {
  open: boolean
}

export function SyncModal({ open }: SyncModalProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[260px] rounded-3xl border-0 shadow-2xl p-8 bg-card"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-[#6FA36A]/10 dark:bg-[#A7D878]/10">
            <Loader2 className="size-7 animate-spin text-[#6FA36A] dark:text-[#A7D878]" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Un momento, estamos subiendo los datos a la base de datos...
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
