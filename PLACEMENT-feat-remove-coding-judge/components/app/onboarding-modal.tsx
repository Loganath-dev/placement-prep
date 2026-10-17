"use client"

import * as React from "react"
import { useStoreState } from "@/lib/store"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/app/icon"

export function OnboardingModal() {
  const { state } = useStoreState()
  
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (state.onboarded && typeof window !== "undefined") {
      if (!localStorage.getItem("studybench.onboarding_modal_seen")) {
        // Show after a small delay to not flash immediately on dashboard load
        const timer = setTimeout(() => setOpen(true), 1000)
        return () => clearTimeout(timer)
      }
    }
  }, [state.onboarded])

  function handleClose() {
    setOpen(false)
    localStorage.setItem("studybench.onboarding_modal_seen", "true")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent showCloseButton={false} className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Icon name="Target" className="size-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">Set your daily goal</DialogTitle>
          <DialogDescription className="text-center">
            Consistent practice is the key to placement success. How much time can you commit today?
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-3 py-4">
          <Button variant="outline" className="h-auto justify-start gap-4 p-4 hover:border-primary/50 hover:bg-primary/5" onClick={handleClose}>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
              <Icon name="Coffee" className="size-5" />
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="font-semibold">Casual (20 XP)</span>
              <span className="text-xs text-muted-foreground">About 10 mins of quick review</span>
            </div>
          </Button>
          <Button variant="outline" className="h-auto justify-start gap-4 border-primary/40 bg-primary/5 p-4 hover:border-primary hover:bg-primary/10" onClick={handleClose}>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon name="Flame" className="size-5" />
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="font-semibold text-foreground">Regular (50 XP)</span>
              <span className="text-xs text-muted-foreground">Recommended for steady growth</span>
            </div>
          </Button>
          <Button variant="outline" className="h-auto justify-start gap-4 p-4 hover:border-primary/50 hover:bg-primary/5" onClick={handleClose}>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
              <Icon name="Zap" className="size-5" />
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="font-semibold">Intense (100 XP)</span>
              <span className="text-xs text-muted-foreground">Full placement drive mode</span>
            </div>
          </Button>
        </div>

        <DialogFooter>
          <Button className="w-full" onClick={handleClose}>Let's go</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
