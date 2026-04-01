"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Bot, Send, Sparkles, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { DashboardOverviewResponse, DashboardStatsResponse } from "@/services/api"

interface AssistantMessage {
  id: string
  role: "assistant" | "user"
  text: string
}

interface DashboardChatbotProps {
  stats: DashboardStatsResponse["stats"] | null | undefined
  overview: DashboardOverviewResponse | null
  linkLoadCount: number
}

function buildAssistantReply(
  input: string,
  stats: DashboardStatsResponse["stats"] | null | undefined,
  overview: DashboardOverviewResponse | null,
  linkLoadCount: number
) {
  const text = input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

  const totalDevices = stats?.total_devices ?? 0
  const totalHosts = overview?.hosts?.total ?? 0
  const totalFlows = stats?.total_flows ?? 0
  const activeAlerts = stats?.active_alerts ?? 0
  const activeApps = overview?.applications?.active ?? 0
  const totalApps = overview?.applications?.total ?? 0
  const onlineNodes = overview?.cluster?.online ?? 0
  const totalNodes = overview?.cluster?.total ?? 0
  const controllerVersion = overview?.controller?.version || "inconnue"
  const activeLinks = stats?.active_links ?? 0

  if (
    text.includes("summary") ||
    text.includes("network") ||
    text.includes("resume") ||
    text.includes("situation") ||
    text.includes("apercu")
  ) {
    return `Resume actuel: ${totalDevices} equipements, ${totalHosts} hotes, ${totalFlows} flux et ${activeAlerts} alertes ouvertes.`
  }

  if (text.includes("alert") || text.includes("alerte")) {
    return `Le dashboard affiche actuellement ${activeAlerts} alertes actives.`
  }

  if (
    text.includes("device") ||
    text.includes("switch") ||
    text.includes("host") ||
    text.includes("equipement") ||
    text.includes("hote")
  ) {
    return `La plateforme montre ${totalDevices} equipements reseau et ${totalHosts} hotes decouverts.`
  }

  if (text.includes("app") || text.includes("application")) {
    return `ONOS signale ${activeApps} applications actives sur ${totalApps} installees.`
  }

  if (
    text.includes("cluster") ||
    text.includes("controller") ||
    text.includes("controleur")
  ) {
    return `Etat du cluster: ${onlineNodes} noeuds en ligne sur ${totalNodes}, version du controleur ${controllerVersion}.`
  }

  if (
    text.includes("topology") ||
    text.includes("topologie") ||
    text.includes("link") ||
    text.includes("lien")
  ) {
    return `La topologie expose ${activeLinks} liens actifs et ${linkLoadCount} mesures de charge sur les liens.`
  }

  if (
    text.includes("flow") ||
    text.includes("flux") ||
    text.includes("intent") ||
    text.includes("intention")
  ) {
    return `Instantane trafic: ${totalFlows} flux sont visibles dans le dashboard et le resume des intents est pret dans le panneau dedie.`
  }

  if (
    text.includes("help") ||
    text.includes("aide") ||
    text.includes("que peux tu faire") ||
    text.includes("what can you do")
  ) {
    return "Je peux resumer rapidement les alertes, les equipements, les applications, l'etat du controleur, les liens et la topologie du dashboard."
  }

  return "Essayez par exemple: resume reseau, alertes actives, applications ONOS, etat du controleur ou topologie."
}

export function DashboardChatbot({ stats, overview, linkLoadCount }: DashboardChatbotProps) {
  const [draft, setDraft] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Assistant IA pret. Je peux vous donner un resume rapide des alertes, des equipements, des applications et de la topologie.",
    },
  ])
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)

  const quickPrompts = useMemo(
    () => ["Resume reseau", "Alertes actives", "Applications ONOS", "Etat du controleur"],
    []
  )

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const container = messagesContainerRef.current
    if (!container) {
      return
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    })
  }, [isOpen, messages])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const submitMessage = (value?: string) => {
    const content = (value ?? draft).trim()

    if (!content) {
      return
    }

    const userMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: content,
    }

    const assistantMessage: AssistantMessage = {
      id: `assistant-${Date.now() + 1}`,
      role: "assistant",
      text: buildAssistantReply(content, stats, overview, linkLoadCount),
    }

    setMessages((current) => [...current, userMessage, assistantMessage])
    setDraft("")
    setIsOpen(true)
  }

  const headerStats = [
    { label: "Devices", value: stats?.total_devices ?? 0 },
    { label: "Alerts", value: stats?.active_alerts ?? 0 },
    { label: "Apps", value: overview?.applications?.active ?? 0 },
  ]

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {isOpen && (
        <div className="pointer-events-auto animate-in fade-in zoom-in-95 slide-in-from-bottom-4 w-[calc(100vw-1.5rem)] max-w-[400px] overflow-hidden rounded-[30px] border border-white/60 bg-white/78 shadow-[0_30px_80px_-30px_rgba(14,165,233,0.55)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/82">
          <div className="relative overflow-hidden border-b border-slate-200/70 px-5 pb-5 pt-5 dark:border-slate-800/80">
            <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.28),_transparent_56%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.22),_transparent_42%)]" />

            <div className="relative flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a,#0891b2_58%,#67e8f9)] text-white shadow-[0_18px_35px_-18px_rgba(8,145,178,0.9)]">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.32em] text-cyan-700 dark:text-cyan-300">
                    Assistant IA
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
                    PlatformSDN Copilot
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Cliquez sur une suggestion ou posez une question rapide sur le dashboard.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/75 text-slate-500 transition-colors hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:text-white"
                aria-label="Fermer le chatbot"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative mt-4 grid grid-cols-3 gap-2">
              {headerStats.map((entry) => (
                <div
                  key={entry.label}
                  className="rounded-2xl border border-white/70 bg-white/70 px-3 py-3 shadow-sm dark:border-white/10 dark:bg-slate-900/65"
                >
                  <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                    {entry.label}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
                    {entry.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 px-4 pb-4 pt-4">
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => submitMessage(prompt)}
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-200/80 bg-cyan-50/90 px-3 py-2 text-xs font-medium text-cyan-900 transition-colors hover:bg-cyan-100 dark:border-cyan-900/60 dark:bg-cyan-950/35 dark:text-cyan-100 dark:hover:bg-cyan-950/60"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {prompt}
                </button>
              ))}
            </div>

            <div className="rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(248,250,252,0.92),rgba(240,249,255,0.92))] p-3 shadow-inner dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.86),rgba(8,47,73,0.8))]">
              <div
                ref={messagesContainerRef}
                className="flex max-h-[340px] min-h-[300px] flex-col gap-3 overflow-y-auto pr-1"
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn("flex", message.role === "assistant" ? "justify-start" : "justify-end")}
                  >
                    <div
                      className={cn(
                        "max-w-[86%] rounded-[24px] px-4 py-3 shadow-sm",
                        message.role === "assistant"
                          ? "bg-[linear-gradient(135deg,#0f172a,#155e75)] text-white"
                          : "border border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      )}
                    >
                      <div
                        className={cn(
                          "mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.24em]",
                          message.role === "assistant" ? "text-cyan-100/80" : "text-slate-500 dark:text-slate-400"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full",
                            message.role === "assistant"
                              ? "bg-white/12 text-cyan-100"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200"
                          )}
                        >
                          {message.role === "assistant" ? (
                            <Bot className="h-3.5 w-3.5" />
                          ) : (
                            <User className="h-3.5 w-3.5" />
                          )}
                        </div>
                        {message.role === "assistant" ? "Assistant" : "Vous"}
                      </div>
                      <p className="text-sm leading-6">{message.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form
              className="rounded-[24px] border border-slate-200/80 bg-white/88 p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
              onSubmit={(event) => {
                event.preventDefault()
                submitMessage()
              }}
            >
              <div className="flex items-center gap-2">
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Ex: donne-moi un resume reseau"
                  className="h-12 flex-1 border-none bg-transparent px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-11 w-11 rounded-2xl bg-[linear-gradient(135deg,#0891b2,#2563eb)] text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.85)] hover:opacity-95"
                  aria-label="Envoyer le message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!isOpen && (
        <div className="pointer-events-auto hidden rounded-full border border-white/60 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-lg backdrop-blur xl:block dark:border-white/10 dark:bg-slate-900/75 dark:text-slate-300">
          Ouvrir l'assistant IA
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Fermer l'assistant IA" : "Ouvrir l'assistant IA"}
        className="pointer-events-auto group relative flex h-16 w-16 items-center justify-center rounded-[24px] bg-[linear-gradient(135deg,#020617,#0ea5e9_58%,#67e8f9)] text-white shadow-[0_26px_55px_-24px_rgba(8,145,178,0.95)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_65px_-24px_rgba(14,165,233,0.95)]"
      >
        <span className="absolute inset-0 rounded-[24px] border border-white/20" />
        <Bot className="h-7 w-7 transition-transform duration-300 group-hover:scale-110" />
        <span className="absolute -right-1 -top-1 rounded-full border border-cyan-200/20 bg-slate-950 px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.24em] text-cyan-200 shadow-lg dark:bg-white dark:text-slate-950">
          AI
        </span>
      </button>
    </div>
  )
}
