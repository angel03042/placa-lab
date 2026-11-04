import { guides } from '../workshop/guides.js'
import { orders } from '../game/orders.js'

// Public hashes are part of the app's API: bookmarks predate the view split.
export const routes = [
  { id: 'home', name: 'Portada', primary: true, load: () => import('../views/HomeView.vue') },
  {
    id: 'turno',
    name: 'Turno de taller',
    primary: true,
    load: () => import('../views/WorkshopShiftView.vue'),
    sections: orders.map((order) => order.id),
  },
  {
    id: 'workshop',
    name: 'Mantenimiento',
    primary: true,
    load: () => import('../views/MaintenanceView.vue'),
    sections: guides.map((guide) => guide.id),
    defaultSection: 'limpieza',
  },
  {
    id: 'fit',
    name: 'Compatibilidad',
    primary: true,
    load: () => import('../views/CompatibilityView.vue'),
    sections: ['ram', 'ssd'],
    defaultSection: 'ram',
    cache: true,
  },
  {
    id: 'lab',
    name: 'Laboratorio 3D',
    primary: true,
    load: () => import('../views/LabView.vue'),
    sections: ['energia', 'calor'],
    title: 'Laboratorio de placas.',
    subtitle: 'Explora cada componente y descubre cómo todo trabaja en conjunto.',
  },
  {
    id: 'library',
    name: 'Componentes',
    load: () => import('../views/ComponentLibraryView.vue'),
    title: 'Catálogo de componentes.',
    subtitle: 'Cada componente tiene una función. Aprende a reconocerla.',
    cache: true,
  },
  {
    id: 'diagnostics',
    name: 'Diagnóstico',
    load: () => import('../views/DiagnosticsView.vue'),
    title: 'Mesa de diagnóstico.',
    subtitle: 'Practica con fallas guiadas y aprende a respaldar tus hipótesis.',
  },
  {
    id: 'lessons',
    name: 'Ruta de aprendizaje',
    load: () => import('../views/LessonsView.vue'),
    title: 'Ruta de aprendizaje.',
    subtitle: 'Seis lecciones para construir una forma de pensar, paso a paso.',
  },
  {
    id: 'glossary',
    name: 'Glosario técnico',
    load: () => import('../views/GlossaryView.vue'),
    title: 'Glosario técnico.',
    subtitle: 'Conceptos claros para entender lo que sucede en una placa.',
    cache: true,
  },
]

export function resolveHash(hash) {
  const [id, requested] = hash.replace(/^#\/?/, '').split('/')
  const page = routes.find((entry) => entry.id === id) ?? routes[0]
  const section = page.sections?.includes(requested) ? requested : (page.defaultSection ?? '')
  return { page, section, hash: '#' + page.id + (section ? '/' + section : '') }
}
