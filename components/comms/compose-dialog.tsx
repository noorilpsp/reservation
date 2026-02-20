"use client"

import { useState } from "react"
import {
  CheckCircle2,
  Search,
  Send,
  Users,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { templates, allVariables } from "@/lib/comms-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Sample guest suggestions
const guestSuggestions = [
  { name: "Sarah Chen", phone: "+1 (555) 123-4567" },
  { name: "Kim Family", phone: "+1 (555) 234-5678" },
  { name: "Rivera", phone: "+1 (555) 345-6789" },
  { name: "Anderson", phone: "+1 (555) 456-7890" },
  { name: "Patel", phone: "+1 (555) 789-0123" },
  { name: "Baker", phone: "+1 (555) 567-8901" },
]

const quickGroups = [
  { label: "Tonight's Guests", icon: Users },
  { label: "VIPs", icon: Users },
  { label: "Waitlist", icon: Users },
]

export function ComposeDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [guestSearch, setGuestSearch] = useState("")
  const [selectedGuest, setSelectedGuest] = useState<
    (typeof guestSuggestions)[0] | null
  >(null)
  const [channel, setChannel] = useState<"sms" | "email">("sms")
  const [templateId, setTemplateId] = useState<string>("none")
  const [body, setBody] = useState("")
  const [schedule, setSchedule] = useState<"now" | "later">("now")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const charCount = body.length
  const maxChars = channel === "sms" ? 160 : 5000
  const charWarning = channel === "sms" && charCount > 140

  // Filter guests
  const filtered = guestSearch.length > 0
    ? guestSuggestions.filter(
        (g) =>
          g.name.toLowerCase().includes(guestSearch.toLowerCase()) ||
          g.phone.includes(guestSearch)
      )
    : []

  // Apply template
  function handleTemplateChange(value: string) {
    setTemplateId(value)
    if (value !== "none") {
      const t = templates.find((t) => t.id === value)
      if (t) setBody(t.body)
    }
  }

  // Preview
  const preview = body
    .replace(/\{guest_name\}/g, selectedGuest?.name ?? "Guest")
    .replace(/\{restaurant\}/g, "Chez Laurent")
    .replace(/\{date\}/g, "Friday, Jan 17")
    .replace(/\{time\}/g, "7:30 PM")
    .replace(/\{party_size\}/g, "4")
    .replace(/\{table\}/g, "T12")
    .replace(/\{server\}/g, "Alex")
    .replace(/\{wait_time\}/g, "15 min")
    .replace(/\{booking_link\}/g, "book.chezlaurent.com/xyz")
    .replace(/\{cancel_link\}/g, "cancel.chezlaurent.com/xyz")

  function handleSend() {
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setSent(true)
      setTimeout(() => {
        setSent(false)
        onClose()
        // Reset
        setBody("")
        setSelectedGuest(null)
        setGuestSearch("")
        setTemplateId("none")
      }, 1200)
    }, 600)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-border/30 bg-card/95 backdrop-blur-md sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">
            New Message
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          {/* To field */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">To</Label>
            {selectedGuest ? (
              <div className="flex items-center gap-2 rounded-md border border-border/30 bg-secondary/30 px-2 py-1.5">
                <span className="text-xs font-medium text-foreground">
                  {selectedGuest.name}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  ({selectedGuest.phone})
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedGuest(null)}
                  className="ml-auto text-muted-foreground hover:text-foreground"
                  aria-label="Remove selected guest"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={guestSearch}
                  onChange={(e) => setGuestSearch(e.target.value)}
                  className="h-8 border-border/30 bg-secondary/30 pl-7 text-xs"
                  placeholder="Search guests..."
                />
                {filtered.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-md border border-border/30 bg-popover/95 p-1 shadow-lg backdrop-blur-sm">
                    {filtered.map((g) => (
                      <button
                        key={g.phone}
                        type="button"
                        onClick={() => {
                          setSelectedGuest(g)
                          setGuestSearch("")
                        }}
                        className="flex w-full items-center gap-2 rounded-sm px-2 py-1 text-left text-xs hover:bg-accent"
                      >
                        <span className="font-medium text-foreground">{g.name}</span>
                        <span className="text-[10px] text-muted-foreground">{g.phone}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Quick groups */}
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-muted-foreground">Or:</span>
              {quickGroups.map((qg) => (
                <Button
                  key={qg.label}
                  variant="outline"
                  size="sm"
                  className="h-5 gap-1 px-1.5 text-[9px] border-border/30 text-muted-foreground hover:text-foreground"
                >
                  <qg.icon className="h-2 w-2" />
                  {qg.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Channel */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Channel</Label>
            <RadioGroup
              value={channel}
              onValueChange={(v) => setChannel(v as "sms" | "email")}
              className="flex items-center gap-4"
            >
              <label className="flex items-center gap-1.5 text-xs text-secondary-foreground">
                <RadioGroupItem value="sms" />
                SMS
              </label>
              <label className="flex items-center gap-1.5 text-xs text-secondary-foreground">
                <RadioGroupItem value="email" />
                Email
              </label>
            </RadioGroup>
          </div>

          {/* Template */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Template</Label>
            <Select value={templateId} onValueChange={handleTemplateChange}>
              <SelectTrigger className="h-8 border-border/30 bg-secondary/30 text-xs">
                <SelectValue placeholder="None (custom)" />
              </SelectTrigger>
              <SelectContent className="border-border/40 bg-popover/95 backdrop-blur-sm">
                <SelectItem value="none">None (custom)</SelectItem>
                {templates
                  .filter((t) => t.channel === channel)
                  .map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Body */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Message</Label>
            <div className="relative">
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className="resize-none border-border/30 bg-secondary/30 pb-6 text-xs leading-relaxed"
                placeholder="Type your message..."
              />
              <span
                className={cn(
                  "absolute bottom-2 right-3 text-[10px]",
                  charWarning ? "text-amber-400" : "text-muted-foreground"
                )}
              >
                {charCount}/{maxChars} chars
              </span>
            </div>
            {/* Quick variables */}
            <div className="flex flex-wrap gap-1">
              {allVariables.slice(0, 4).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setBody((p) => p + `{${v}}`)}
                  className="rounded border border-border/30 bg-secondary/30 px-1.5 py-0.5 font-mono text-[9px] text-cyan-400 transition-colors hover:border-cyan-500/40 hover:bg-cyan-500/10"
                >
                  {`{${v}}`}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Schedule</Label>
            <RadioGroup
              value={schedule}
              onValueChange={(v) => setSchedule(v as "now" | "later")}
              className="flex items-center gap-4"
            >
              <label className="flex items-center gap-1.5 text-xs text-secondary-foreground">
                <RadioGroupItem value="now" />
                Send now
              </label>
              <label className="flex items-center gap-1.5 text-xs text-secondary-foreground">
                <RadioGroupItem value="later" />
                Schedule
              </label>
            </RadioGroup>
          </div>

          {/* Preview */}
          {body.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Preview
              </span>
              <div className="rounded-lg border border-border/20 bg-background/60 p-3">
                <div className="mx-auto max-w-[280px]">
                  <div className="rounded-xl bg-emerald-600/20 px-3 py-2 text-xs leading-relaxed text-foreground">
                    {preview}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-border/20 pt-3">
            <Button
              size="sm"
              className={cn(
                "h-8 gap-1.5 text-xs font-medium transition-all",
                sent
                  ? "bg-emerald-600 text-foreground"
                  : "bg-emerald-600 text-foreground hover:bg-emerald-700",
                sending && "scale-95"
              )}
              onClick={handleSend}
              disabled={!body || sending || sent}
            >
              {sent ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Sent!
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  {sending ? "Sending..." : "Send Message"}
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-muted-foreground"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
