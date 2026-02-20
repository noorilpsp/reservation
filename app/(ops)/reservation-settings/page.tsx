"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  BarChart3,
  Bell,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  CreditCard,
  LayoutGrid,
  Loader2,
  RotateCcw,
  Save,
  Settings,
  Share2,
  Shield,
  Timer,
} from "lucide-react"
import { defaultSettings, settingsSections } from "@/lib/reservation-settings-data"
import type { ReservationSettings, SettingsSectionId } from "@/lib/reservation-settings-data"
import { ServicePeriodsSection } from "@/components/reservation-settings/service-periods-section"
import { TurnTimesSection } from "@/components/reservation-settings/turn-times-section"
import { BookingWindowSection } from "@/components/reservation-settings/booking-window-section"
import { CapacityPacingSection } from "@/components/reservation-settings/capacity-pacing-section"
import { ChannelAllocationSection } from "@/components/reservation-settings/channel-allocation-section"
import { DepositsFeesSection } from "@/components/reservation-settings/deposits-fees-section"
import { ConfirmationsSection } from "@/components/reservation-settings/confirmations-section"
import { GuestPoliciesSection } from "@/components/reservation-settings/guest-policies-section"
import { NotificationsSection } from "@/components/reservation-settings/notifications-section"
import { TableConfigSection } from "@/components/reservation-settings/table-config-section"

const sectionIcons: Record<string, React.ReactNode> = {
  clock: <Clock className="h-3.5 w-3.5" />,
  timer: <Timer className="h-3.5 w-3.5" />,
  calendar: <Calendar className="h-3.5 w-3.5" />,
  "bar-chart": <BarChart3 className="h-3.5 w-3.5" />,
  "share-2": <Share2 className="h-3.5 w-3.5" />,
  "credit-card": <CreditCard className="h-3.5 w-3.5" />,
  "check-circle": <CheckCircle className="h-3.5 w-3.5" />,
  shield: <Shield className="h-3.5 w-3.5" />,
  bell: <Bell className="h-3.5 w-3.5" />,
  "layout-grid": <LayoutGrid className="h-3.5 w-3.5" />,
}

export default function ReservationSettingsPage() {
  const [settings, setSettings] = useState<ReservationSettings>(structuredClone(defaultSettings))
  const [savedSettings, setSavedSettings] = useState<ReservationSettings>(structuredClone(defaultSettings))
  const [activeSection, setActiveSection] = useState<SettingsSectionId>("service-periods")
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(savedSettings)

  const handleSave = useCallback(async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 1200))
    setSavedSettings(structuredClone(settings))
    setSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }, [settings])

  const handleDiscard = useCallback(() => {
    setSettings(structuredClone(savedSettings))
  }, [savedSettings])

  function scrollToSection(id: SettingsSectionId) {
    setActiveSection(id)
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  // Track scroll position to update active sidebar item on desktop
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as SettingsSectionId)
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    )
    for (const id of settingsSections.map((s) => s.id)) {
      const el = sectionRefs.current[id]
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  const lastSaved = new Date(settings.lastSavedAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
  })

  function renderSection(id: SettingsSectionId) {
    switch (id) {
      case "service-periods":
        return <ServicePeriodsSection periods={settings.servicePeriods} onChange={(v) => setSettings({ ...settings, servicePeriods: v })} />
      case "turn-times":
        return <TurnTimesSection turnTimes={settings.turnTimes} onChange={(v) => setSettings({ ...settings, turnTimes: v })} />
      case "booking-window":
        return <BookingWindowSection bookingWindow={settings.bookingWindow} onChange={(v) => setSettings({ ...settings, bookingWindow: v })} />
      case "capacity-pacing":
        return <CapacityPacingSection capacity={settings.capacity} onChange={(v) => setSettings({ ...settings, capacity: v })} />
      case "channel-allocation":
        return <ChannelAllocationSection channels={settings.channels} onChange={(v) => setSettings({ ...settings, channels: v })} />
      case "deposits-fees":
        return <DepositsFeesSection deposits={settings.deposits} onChange={(v) => setSettings({ ...settings, deposits: v })} />
      case "confirmations":
        return <ConfirmationsSection confirmations={settings.confirmations} onChange={(v) => setSettings({ ...settings, confirmations: v })} />
      case "guest-policies":
        return <GuestPoliciesSection guestPolicies={settings.guestPolicies} onChange={(v) => setSettings({ ...settings, guestPolicies: v })} />
      case "notifications":
        return <NotificationsSection notifications={settings.notifications} onChange={(v) => setSettings({ ...settings, notifications: v })} />
      case "table-config":
        return <TableConfigSection tables={settings.tables} onChange={(v) => setSettings({ ...settings, tables: v })} />
      default:
        return null
    }
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-30 flex shrink-0 items-center justify-between border-b border-border/20 bg-background/95 px-4 py-3 backdrop-blur-md md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/60">
            <Settings className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold text-foreground">Reservation Settings</h1>
            <span className="text-[10px] text-muted-foreground">
              Last saved: {lastSaved} by {settings.lastSavedBy}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button variant="ghost" size="sm" className="gap-1 text-xs text-amber-400 hover:text-amber-300" onClick={handleDiscard}>
              <RotateCcw className="h-3 w-3" />
              <span className="hidden sm:inline">Discard Changes</span>
            </Button>
          )}
          <Button
            size="sm"
            disabled={!hasChanges || saving}
            onClick={handleSave}
            className={`gap-1.5 text-xs transition-colors ${
              hasChanges && !saving && !saveSuccess
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : saveSuccess
                ? "bg-emerald-600 text-white"
                : ""
            }`}
            aria-label={hasChanges ? "Save button, changes pending" : "Save button"}
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : saveSuccess ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {saving ? "Saving..." : saveSuccess ? "Saved" : "Save"}
          </Button>
        </div>
      </div>

      {/* Desktop Layout: Sidebar + Content */}
      <div className="hidden flex-1 overflow-hidden xl:flex">
        {/* Sidebar Navigation */}
        <nav className="w-56 shrink-0 border-r border-border/20 bg-background" aria-label="Settings sections">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-0.5 p-3">
              <span className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Settings</span>
              {settingsSections.map((section) => {
                const isActive = activeSection === section.id
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    }`}
                  >
                    <span className={isActive ? "text-primary" : "text-muted-foreground/60"}>{sectionIcons[section.icon]}</span>
                    {section.label}
                    {hasChanges && isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400" />}
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        </nav>

        {/* Content Area */}
        <ScrollArea className="flex-1">
          <div className="mx-auto max-w-3xl p-6">
            <div className="flex flex-col gap-10">
              {settingsSections.map((section) => (
                <div
                  key={section.id}
                  id={section.id}
                  ref={(el) => { sectionRefs.current[section.id] = el }}
                >
                  {renderSection(section.id)}
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Tablet/Mobile Layout: Accordion */}
      <ScrollArea className="flex-1 xl:hidden">
        <div className="mx-auto max-w-3xl p-4">
          <Accordion type="single" collapsible defaultValue="service-periods" className="flex flex-col gap-2">
            {settingsSections.map((section) => (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="overflow-hidden rounded-lg border border-border/20 bg-secondary/10"
              >
                <AccordionTrigger className="px-4 py-3 text-xs font-semibold text-foreground hover:no-underline [&[data-state=open]]:bg-secondary/20">
                  <div className="flex items-center gap-2.5">
                    <span className="text-muted-foreground/60">{sectionIcons[section.icon]}</span>
                    {section.label}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 pt-2">
                  {renderSection(section.id)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  )
}
