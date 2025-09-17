import { useEffect, useRef } from "react"

export function useScrollReveal(selector = "[data-reveal], [data-reveal-stagger]", options?: IntersectionObserverInit) {
  const retryCountRef = useRef(0)
  const maxRetries = 5
  
  useEffect(() => {
    let io: IntersectionObserver | null = null
    let retryTimeout: NodeJS.Timeout | null = null
    
    const setupReveals = () => {
      const els = Array.from(document.querySelectorAll<HTMLElement>(selector))
      
      if (els.length === 0) {
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++
          retryTimeout = setTimeout(setupReveals, 200)
        }
        return
      }
      
      // Reset retry count on success
      retryCountRef.current = 0
      
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("is-visible")
              // stagger simples por data-reveal-delay
              const d = (e.target as HTMLElement).dataset.revealDelay
              if (d) (e.target as HTMLElement).style.animationDelay = d
              io?.unobserve(e.target)
            }
          })
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.15, ...options }
      )
      
      els.forEach((el) => {
        io?.observe(el)
      })
    }
    
    setupReveals()
    
    return () => {
      if (io) io.disconnect()
      if (retryTimeout) clearTimeout(retryTimeout)
    }
  }, [selector, options])
}
