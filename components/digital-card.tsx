import { cn } from "@/lib/utils"

interface DigitalCardProps {
  name: string
  cardNumber: string
  documentCount: number
  validUntil: string
  className?: string
}

export function DigitalCard({ name, cardNumber, documentCount, validUntil, className }: DigitalCardProps) {
  return (
    <div
      className={cn(
        "w-full p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg text-white",
        className,
      )}
    >
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-sm font-medium opacity-80">Digital Identity Card</h3>
          <p className="text-xs opacity-60">Unified ID Solution</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{cardNumber}</p>
        </div>
      </div>
      <div className="mb-8">
        <div className="w-16 h-16 bg-white/20 rounded-full mb-4"></div>
        <h3 className="text-xl font-bold">{name}</h3>
        <p className="text-sm opacity-80">ID Verified</p>
      </div>
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <p className="opacity-70">Documents</p>
          <p className="font-medium">{documentCount} Verified</p>
        </div>
        <div>
          <p className="opacity-70">Valid Until</p>
          <p className="font-medium">{validUntil}</p>
        </div>
      </div>
    </div>
  )
}

