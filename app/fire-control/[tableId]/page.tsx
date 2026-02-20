"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { FireControlTopBar } from "@/components/fire-control/fire-control-top-bar"
import { WaveProgressTimeline } from "@/components/fire-control/wave-progress-timeline"
import { WaveCard } from "@/components/fire-control/wave-card"
import { TableInfoPanel } from "@/components/fire-control/table-info-panel"
import { FireControlActionBar } from "@/components/fire-control/fire-control-action-bar"
import { FireWaveDialog } from "@/components/fire-control/fire-wave-dialog"
import { RushWaveDialog } from "@/components/fire-control/rush-wave-dialog"
import { MessageKitchenDialog } from "@/components/fire-control/message-kitchen-dialog"
import { fireControlData, getHeldWaves } from "@/lib/fire-control-data"
import type { Wave } from "@/lib/fire-control-data"

export default function FireControlPage() {
  const { toast } = useToast()
  const [data, setData] = useState(fireControlData)
  
  // Dialog states
  const [fireWave, setFireWave] = useState<Wave | null>(null)
  const [rushWave, setRushWave] = useState<Wave | null>(null)
  const [messageWave, setMessageWave] = useState<Wave | null>(null)
  const [showMessageDialog, setShowMessageDialog] = useState(false)

  const heldWaves = getHeldWaves(data.waves)

  // Handlers
  const handleFire = (wave: Wave) => {
    setFireWave(wave)
  }

  const handleConfirmFire = () => {
    if (!fireWave) return

    // Update wave status to fired
    setData((prev) => ({
      ...prev,
      waves: prev.waves.map((w) =>
        w.id === fireWave.id
          ? { ...w, status: "preparing" as const, startedAt: new Date().toISOString(), eta: 8 }
          : w
      ),
    }))

    toast({
      title: "🔥 Wave fired!",
      description: `${fireWave.label} wave sent to kitchen.`,
    })
    setFireWave(null)
  }

  const handleMarkServed = (wave: Wave) => {
    setData((prev) => ({
      ...prev,
      waves: prev.waves.map((w) =>
        w.id === wave.id
          ? { ...w, status: "served" as const, servedAt: new Date().toISOString() }
          : w
      ),
    }))

    toast({
      title: "✅ Wave served!",
      description: `${wave.label} wave marked as served.`,
    })
  }

  const handleRush = (wave: Wave) => {
    setRushWave(wave)
  }

  const handleConfirmRush = (reason: string) => {
    if (!rushWave) return

    toast({
      title: "🚀 Wave rushed!",
      description: `Kitchen notified to prioritize ${rushWave.label} wave.`,
    })
    setRushWave(null)
  }

  const handleMessage = (wave: Wave) => {
    setMessageWave(wave)
    setShowMessageDialog(true)
  }

  const handleMessageKitchen = () => {
    setMessageWave(null)
    setShowMessageDialog(true)
  }

  const handleSendMessage = (message: string) => {
    toast({
      title: "💬 Message sent",
      description: `Kitchen has been notified: "${message}"`,
    })
  }

  const handleFireAll = () => {
    if (heldWaves.length === 0) return

    // Fire all held waves
    setData((prev) => ({
      ...prev,
      waves: prev.waves.map((w) =>
        w.status === "held"
          ? { ...w, status: "preparing" as const, startedAt: new Date().toISOString(), eta: 8 }
          : w
      ),
    }))

    toast({
      title: "🔥 All held waves fired!",
      description: `${heldWaves.length} ${heldWaves.length === 1 ? "wave" : "waves"} sent to kitchen.`,
    })
  }

  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* Top Bar */}
      <FireControlTopBar data={data} onMessageKitchen={handleMessageKitchen} />

      {/* Wave Progress Timeline */}
      <WaveProgressTimeline waves={data.waves} />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile: Single Column (< 640px) */}
        <div className="flex flex-1 flex-col overflow-y-auto sm:hidden">
          <div className="space-y-4 p-4">
            {data.waves.map((wave) => (
              <WaveCard
                key={wave.id}
                wave={wave}
                onFire={handleFire}
                onMarkServed={handleMarkServed}
                onRush={handleRush}
                onMessage={handleMessage}
              />
            ))}
          </div>
        </div>

        {/* Tablet: Split View (640px - 1023px) */}
        <div className="hidden flex-1 flex-col sm:flex lg:hidden">
          <div className="flex flex-1 overflow-hidden">
            {/* Wave Cards */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {data.waves.map((wave) => (
                  <WaveCard
                    key={wave.id}
                    wave={wave}
                    onFire={handleFire}
                    onMarkServed={handleMarkServed}
                    onRush={handleRush}
                    onMessage={handleMessage}
                  />
                ))}
              </div>
            </div>

            {/* Table Info */}
            <aside className="w-80 overflow-y-auto border-l p-4">
              <TableInfoPanel data={data} />
            </aside>
          </div>
        </div>

        {/* Desktop: Horizontal Cards (1024px+) */}
        <div className="hidden flex-1 overflow-y-auto lg:block">
          <div className="p-6">
            <div className="grid grid-cols-3 gap-6">
              {data.waves.map((wave) => (
                <WaveCard
                  key={wave.id}
                  wave={wave}
                  onFire={handleFire}
                  onMarkServed={handleMarkServed}
                  onRush={handleRush}
                  onMessage={handleMessage}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <FireControlActionBar
        tableId={data.table.id}
        heldWaves={heldWaves}
        onFireAll={handleFireAll}
        onMessageKitchen={handleMessageKitchen}
      />

      {/* Dialogs */}
      <FireWaveDialog
        wave={fireWave}
        open={!!fireWave}
        onOpenChange={(open) => !open && setFireWave(null)}
        onConfirm={handleConfirmFire}
      />
      <RushWaveDialog
        wave={rushWave}
        open={!!rushWave}
        onOpenChange={(open) => !open && setRushWave(null)}
        onConfirm={handleConfirmRush}
      />
      <MessageKitchenDialog
        wave={messageWave}
        tableNumber={data.table.number}
        open={showMessageDialog}
        onOpenChange={setShowMessageDialog}
        onSend={handleSendMessage}
      />
    </div>
  )
}
