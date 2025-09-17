"use client"
import { useEffect, useRef } from "react"

export function ScrollEffects() {
  const rafIdRef = useRef<number | null>(null)
  const lastScrollTopRef = useRef(0)
  
  useEffect(() => {
    const bar = document.querySelector<HTMLDivElement>(".read-progress")
    const topbar = document.querySelector<HTMLElement>(".topbar")
    if (!bar) return

    const updateScrollEffects = () => {
      const h = document.documentElement
      const scrollTop = h.scrollTop || document.body.scrollTop
      
      // Only update if scroll position changed significantly
      if (Math.abs(scrollTop - lastScrollTopRef.current) < 1) {
        rafIdRef.current = null
        return
      }
      
      lastScrollTopRef.current = scrollTop
      
      const scrollHeight = h.scrollHeight - h.clientHeight
      const pct = Math.max(0, Math.min(1, scrollTop / scrollHeight))
      bar.style.width = `${pct * 100}%`
      
      if (topbar) {
        if (scrollTop > 8) topbar.classList.add("shrink")
        else topbar.classList.remove("shrink")
      }
      
      rafIdRef.current = null
    }

    const onScroll = () => {
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(updateScrollEffects)
      }
    }
    
    // Initial call
    updateScrollEffects()
    
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [])
  return null
}
