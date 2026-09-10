import { useEffect, useRef } from 'react'

export function useScrollReveal(options = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add visible class to all reveal elements within this container
            const revealEls = entry.target.querySelectorAll('.reveal, .reveal-left, .reveal-right')
            if (revealEls.length > 0) {
              revealEls.forEach((revealEl) => revealEl.classList.add('visible'))
            } else {
              entry.target.classList.add('visible')
            }
            if (!options.repeat) {
              observer.unobserve(entry.target)
            }
          } else if (options.repeat) {
            const revealEls = entry.target.querySelectorAll('.reveal, .reveal-left, .reveal-right')
            if (revealEls.length > 0) {
              revealEls.forEach((revealEl) => revealEl.classList.remove('visible'))
            } else {
              entry.target.classList.remove('visible')
            }
          }
        })
      },
      {
        threshold: options.threshold || 0.15,
        rootMargin: options.rootMargin || '0px 0px -60px 0px',
      }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [options.threshold, options.rootMargin, options.repeat])

  return ref
}

export function useCountUp(target, duration = 2000, start = false) {
  const ref = useRef(null)
  const countRef = useRef(0)
  const frameRef = useRef(null)

  useEffect(() => {
    if (!start || !ref.current) return

    const startTime = performance.now()

    const tick = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      countRef.current = Math.round(eased * target)
      if (ref.current) {
        ref.current.textContent = countRef.current.toLocaleString()
      }
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [target, duration, start])

  return ref
}
