import { inject, onBeforeUnmount, provide, shallowRef } from 'vue'
import { resolveHash } from './routes.js'

const routerKey = Symbol('router')

export function provideRouter() {
  const readLocation = () => ({
    ...resolveHash(window.location.hash),
    intent: window.history.state?.placaLab ?? {},
  })
  const route = shallowRef(readLocation())
  const lastSection = new Map()
  function remember() {
    if (route.value.page.defaultSection) lastSection.set(route.value.page.id, route.value.section)
  }
  function restore() {
    route.value = readLocation()
    remember()
  }
  function go(id, section, { replace = false, intent = {} } = {}) {
    const sub = section ?? lastSection.get(id)
    const next = resolveHash('#' + id + (sub ? '/' + sub : ''))
    const method = replace || window.location.hash === next.hash ? 'replaceState' : 'pushState'
    window.history[method]({ ...window.history.state, placaLab: intent }, '', next.hash)
    route.value = { ...next, intent }
    remember()
    if (!replace) window.scrollTo(0, 0)
  }
  remember()
  // hashchange also covers manually edited anchors and browser Back/Forward.
  window.addEventListener('hashchange', restore)
  onBeforeUnmount(() => window.removeEventListener('hashchange', restore))
  const router = {
    route,
    go,
    inspect: (part, focus = false) => go('lab', '', { intent: { part, focus } }),
  }
  provide(routerKey, router)
  return router
}

export const useRouter = () => inject(routerKey)
