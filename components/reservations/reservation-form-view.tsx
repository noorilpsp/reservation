"use client"

import { useState, useCallback, useMemo } from "react"
import { X, Loader2, Check, Trash2, Clock, ExternalLink, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useMediaQuery } from "@/hooks/use-media-query"
import { FormGuestSearch } from "./form-guest-search"
import { FormBookingDetails } from "./form-booking-details"
import { FormTableAssignment } from "./form-table-assignment"
import { FormTagsNotes } from "./form-tags-notes"
import { FormConfirmation } from "./form-confirmation"
import { FormSidePanels } from "./form-side-panels"
import { FormMobileWizard } from "./form-mobile-wizard"
import {
  type GuestProfile,
  type FormTag,
  type ReservationFormData,
  type EditModeData,
  type TableAssignMode,
  type BookingChannel,
  defaultFormData,
  editFormData,
  sampleEditData,
  guestDatabase,
  availableTables,
  getDurationForParty,
  getConflictsForSelection,
} from "@/lib/reservation-form-data"

interface ReservationFormViewProps {
  mode?: "create" | "edit"
}

export function ReservationFormView({ mode = "create" }: ReservationFormViewProps) {
  const isMobile = useMediaQuery("(max-width: 767px)")
  const isDesktop = useMediaQuery("(min-width: 1280px)")

  const isEdit = mode === "edit"
  const editData: EditModeData | null = isEdit ? sampleEditData : null

  const [form, setForm] = useState<ReservationFormData>(isEdit ? editFormData : defaultFormData)
  const [selectedGuest, setSelectedGuest] = useState<GuestProfile | null>(
    isEdit ? guestDatabase.find((g) => g.id === editFormData.guestId) ?? null : null
  )
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [showSidePanel, setShowSidePanel] = useState(true)

  const updateForm = useCallback((partial: Partial<ReservationFormData>) => {
    setForm((prev) => ({ ...prev, ...partial }))
  }, [])

  const handleSelectGuest = useCallback(
    (guest: GuestProfile) => {
      setSelectedGuest(guest)
      const tags: FormTag[] = [...form.tags]
      if (guest.tags.includes("vip") && !tags.includes("vip")) tags.push("vip")
      if (guest.tags.includes("high-value") && !tags.includes("high-value")) tags.push("high-value")
      if (guest.tags.includes("first-timer") && !tags.includes("first-timer")) tags.push("first-timer")
      if (guest.allergies.length > 0 && !tags.includes("allergy")) tags.push("allergy")

      updateForm({
        guestName: guest.name,
        guestId: guest.id,
        phone: guest.phone,
        email: guest.email,
        allergyDetail: guest.allergies.join(", "),
        notes: guest.preferences.length > 0
          ? `${guest.preferences.join(". ")}. ${form.notes || ""}`.trim()
          : form.notes,
        tags,
      })
    },
    [form.tags, form.notes, updateForm]
  )

  const handleClearGuest = useCallback(() => {
    setSelectedGuest(null)
    updateForm({
      guestName: "",
      guestId: null,
      phone: "",
      email: "",
      allergyDetail: "",
      tags: [],
    })
  }, [updateForm])

  const handleToggleTag = useCallback(
    (tag: FormTag) => {
      const next = form.tags.includes(tag)
        ? form.tags.filter((t) => t !== tag)
        : [...form.tags, tag]
      updateForm({ tags: next })
    },
    [form.tags, updateForm]
  )

  const handleSave = useCallback(() => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
    }, 1200)
  }, [])

  const bestTable = useMemo(
    () => availableTables.find((t) => t.matchScore >= 90),
    []
  )

  const conflicts = useMemo(
    () => getConflictsForSelection(form.time, form.assignedTable, form.partySize, selectedGuest),
    [form.time, form.assignedTable, form.partySize, selectedGuest]
  )

  // ── Mobile Wizard ────────────────────────────────────────────────────────
  if (isMobile) {
    const steps = [
      {
        label: "Guest",
        content: (
          <div className="space-y-4">
            <FormGuestSearch
              value={form.guestName}
              selectedGuest={selectedGuest}
              onNameChange={(name) => updateForm({ guestName: name })}
              onSelectGuest={handleSelectGuest}
              onClearGuest={handleClearGuest}
            />
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Phone <span className="text-red-400">*</span>
              </label>
              <Input
                value={form.phone}
                onChange={(e) => updateForm({ phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="bg-secondary/50 border-border/60"
                type="tel"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Email
              </label>
              <Input
                value={form.email}
                onChange={(e) => updateForm({ email: e.target.value })}
                placeholder="guest@email.com"
                className="bg-secondary/50 border-border/60"
                type="email"
              />
            </div>
          </div>
        ),
      },
      {
        label: "When & How Many",
        content: (
          <FormBookingDetails
            date={form.date}
            time={form.time}
            partySize={form.partySize}
            duration={form.duration}
            onDateChange={(date) => updateForm({ date })}
            onTimeChange={(time) => updateForm({ time })}
            onPartySizeChange={(partySize) => updateForm({ partySize })}
            onDurationChange={(duration) => updateForm({ duration })}
          />
        ),
      },
      {
        label: "Table & Preferences",
        content: (
          <div className="space-y-5">
            <FormTableAssignment
              mode={form.tableAssignMode}
              assignedTable={form.assignedTable}
              zonePreference={form.zonePreference}
              partySize={form.partySize}
              bestTable={bestTable}
              onModeChange={(mode) => updateForm({ tableAssignMode: mode })}
              onTableChange={(assignedTable) => updateForm({ assignedTable })}
              onZoneChange={(zonePreference) => updateForm({ zonePreference })}
            />
            <div className="border-t border-border/30 pt-4">
              <FormTagsNotes
                tags={form.tags}
                allergyDetail={form.allergyDetail}
                notes={form.notes}
                onToggleTag={handleToggleTag}
                onAllergyDetailChange={(allergyDetail) => updateForm({ allergyDetail })}
                onNotesChange={(notes) => updateForm({ notes })}
              />
            </div>
          </div>
        ),
      },
      {
        label: "Confirm",
        content: (
          <div className="space-y-5">
            <FormSidePanels
              formData={form}
              guest={selectedGuest}
              bestTable={bestTable}
              conflicts={conflicts}
            />
            <div className="border-t border-border/30 pt-4">
              <FormConfirmation
                sendSms={form.sendSms}
                sendEmail={form.sendEmail}
                requireDeposit={form.requireDeposit}
                depositAmount={form.depositAmount}
                addToCalendar={form.addToCalendar}
                channel={form.channel}
                onSmsChange={(sendSms) => updateForm({ sendSms })}
                onEmailChange={(sendEmail) => updateForm({ sendEmail })}
                onDepositChange={(requireDeposit) => updateForm({ requireDeposit })}
                onDepositAmountChange={(depositAmount) => updateForm({ depositAmount })}
                onCalendarChange={(addToCalendar) => updateForm({ addToCalendar })}
                onChannelChange={(channel) => updateForm({ channel })}
              />
            </div>
          </div>
        ),
      },
    ]

    return (
      <div className="h-full bg-background">
        <FormMobileWizard
          steps={steps}
          onSave={handleSave}
          isSaving={isSaving}
          isSaved={isSaved}
          isEdit={isEdit}
        />
      </div>
    )
  }

  // ── Desktop / Tablet Layout ──────────────────────────────────────────────
  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            {isEdit
              ? `Edit Reservation -- ${form.guestName}, ${form.partySize} guests`
              : "New Reservation"
            }
          </h1>
          {editData && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Created {editData.createdAt} via {editData.createdVia}
              {editData.lastModified && (
                <> &middot; Last modified {editData.lastModified}{editData.lastModifiedNote && ` (${editData.lastModifiedNote})`}</>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isDesktop && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSidePanel(!showSidePanel)}
              className="text-xs"
            >
              {showSidePanel ? "Hide suggestions" : "Show suggestions"}
            </Button>
          )}
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left: Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Guest Info */}
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/30">
              Guest Information
            </h2>
            <div className="space-y-4">
              <FormGuestSearch
                value={form.guestName}
                selectedGuest={selectedGuest}
                onNameChange={(name) => updateForm({ guestName: name })}
                onSelectGuest={handleSelectGuest}
                onClearGuest={handleClearGuest}
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Phone <span className="text-red-400">*</span>
                  </label>
                  <Input
                    value={form.phone}
                    onChange={(e) => updateForm({ phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="bg-secondary/50 border-border/60"
                    type="tel"
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Email <span className="text-muted-foreground/40">(optional)</span>
                  </label>
                  <Input
                    value={form.email}
                    onChange={(e) => updateForm({ email: e.target.value })}
                    placeholder="guest@email.com"
                    className="bg-secondary/50 border-border/60"
                    type="email"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Booking Details */}
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/30">
              Booking Details
            </h2>
            <FormBookingDetails
              date={form.date}
              time={form.time}
              partySize={form.partySize}
              duration={form.duration}
              onDateChange={(date) => updateForm({ date })}
              onTimeChange={(time) => updateForm({ time })}
              onPartySizeChange={(partySize) => {
                updateForm({ partySize, duration: getDurationForParty(partySize) })
              }}
              onDurationChange={(duration) => updateForm({ duration })}
            />
          </section>

          {/* Table Assignment */}
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/30">
              Table Assignment
            </h2>
            <FormTableAssignment
              mode={form.tableAssignMode}
              assignedTable={form.assignedTable}
              zonePreference={form.zonePreference}
              partySize={form.partySize}
              bestTable={bestTable}
              onModeChange={(mode: TableAssignMode) => {
                updateForm({ tableAssignMode: mode })
                if (mode === "auto" && bestTable) {
                  updateForm({ assignedTable: bestTable.id })
                } else if (mode === "unassigned") {
                  updateForm({ assignedTable: null })
                }
              }}
              onTableChange={(assignedTable) => updateForm({ assignedTable })}
              onZoneChange={(zonePreference) => updateForm({ zonePreference })}
            />
          </section>

          {/* Tags & Notes */}
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/30">
              Special Requests & Tags
            </h2>
            <FormTagsNotes
              tags={form.tags}
              allergyDetail={form.allergyDetail}
              notes={form.notes}
              onToggleTag={handleToggleTag}
              onAllergyDetailChange={(allergyDetail) => updateForm({ allergyDetail })}
              onNotesChange={(notes) => updateForm({ notes })}
            />
          </section>

          {/* Confirmation */}
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/30">
              Confirmation
            </h2>
            <FormConfirmation
              sendSms={form.sendSms}
              sendEmail={form.sendEmail}
              requireDeposit={form.requireDeposit}
              depositAmount={form.depositAmount}
              addToCalendar={form.addToCalendar}
              channel={form.channel}
              onSmsChange={(sendSms) => updateForm({ sendSms })}
              onEmailChange={(sendEmail) => updateForm({ sendEmail })}
              onDepositChange={(requireDeposit) => updateForm({ requireDeposit })}
              onDepositAmountChange={(depositAmount) => updateForm({ depositAmount })}
              onCalendarChange={(addToCalendar) => updateForm({ addToCalendar })}
              onChannelChange={(channel: BookingChannel) => updateForm({ channel })}
            />
          </section>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-4 pb-6 border-t border-border/30">
            <Button
              onClick={handleSave}
              disabled={isSaving || isSaved}
              className="gap-1.5 bg-emerald-600 text-foreground hover:bg-emerald-700 min-w-[160px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isSaved ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved
                </>
              ) : (
                isEdit ? "Update Reservation" : "Save Reservation"
              )}
            </Button>
            <Button variant="outline">Cancel</Button>

            {isEdit && (
              <>
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <ExternalLink className="h-3.5 w-3.5" />
                    View Profile
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Send className="h-3.5 w-3.5" />
                    Send Update
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Clock className="h-3.5 w-3.5" />
                    Move to Waitlist
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs text-red-400 hover:text-red-300 hover:border-red-500/40">
                    <Trash2 className="h-3.5 w-3.5" />
                    Cancel Reservation
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Suggestions (desktop always, tablet toggle) */}
        {(isDesktop || showSidePanel) && (
          <div className="w-[380px] shrink-0 border-l border-border/40 overflow-y-auto p-4 bg-background/50">
            <FormSidePanels
              formData={form}
              guest={selectedGuest}
              bestTable={bestTable}
              conflicts={conflicts}
            />
          </div>
        )}
      </div>
    </div>
  )
}
