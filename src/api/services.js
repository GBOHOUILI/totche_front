import api from './client'

export const authApi = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  loginAdmin: (data) => api.post('/admin/login', data),
  logout: () => api.post('/logout'),
  logoutAdmin: () => api.post('/admin/logout'),
  me: () => api.get('/me'),
  updatePassword: (data) => api.post('/update-password', data),
}

// Recouvrement par email pour les 4 types de comptes, même si la connexion
// se fait par tel pour admin/responsable. demander() répond toujours pareil
// (compte trouvé ou non) pour ne jamais laisser deviner un email existant.
export const passwordResetApi = {
  demander: (type, email) => api.post('/mot-de-passe/oublie', { type, email }),
  reinitialiser: (data) => api.post('/mot-de-passe/reinitialiser', data),
}

export const prestatairesApi = {
  register: (data) => api.post('/prestataire/register', data),
  login: (data) => api.post('/prestataire/login', data),
  logout: () => api.post('/prestataire/logout'),
  me: () => api.get('/prestataire/me'),
  updatePassword: (data) => api.post('/prestataire/update-password', data),
  updateProfil: (data) => api.put('/prestataire/profil', data),
  dashboard: () => api.get('/prestataire/dashboard'),

  mesSites: () => api.get('/prestataire/sites'),
  createSite: (data) => api.post('/prestataire/sites', data),
  updateSite: (id, data) => api.put(`/prestataire/sites/${id}`, data),
  deleteSite: (id) => api.delete(`/prestataire/sites/${id}`),

  mesEvenements: () => api.get('/prestataire/evenements'),
  createEvenement: (data) => api.post('/prestataire/evenements', data),
  updateEvenement: (id, data) => api.put(`/prestataire/evenements/${id}`, data),
  deleteEvenement: (id) => api.delete(`/prestataire/evenements/${id}`),

  mesHotels: () => api.get('/prestataire/hotels'),
  createHotel: (data) => api.post('/prestataire/hotels', data),
  updateHotel: (id, data) => api.put(`/prestataire/hotels/${id}`, data),
  deleteHotel: (id) => api.delete(`/prestataire/hotels/${id}`),

  mesRestaurants: () => api.get('/prestataire/restaurants'),
  createRestaurant: (data) => api.post('/prestataire/restaurants', data),
  updateRestaurant: (id, data) => api.put(`/prestataire/restaurants/${id}`, data),
  deleteRestaurant: (id) => api.delete(`/prestataire/restaurants/${id}`),

  mesTransports: () => api.get('/prestataire/transports'),
  createTransport: (data) => api.post('/prestataire/transports', data),
  updateTransport: (id, data) => api.put(`/prestataire/transports/${id}`, data),
  deleteTransport: (id) => api.delete(`/prestataire/transports/${id}`),

  createPrix: (data) => api.post('/prestataire/prix', data),
  updatePrix: (id, data) => api.put(`/prestataire/prix/${id}`, data),
  deletePrix: (id) => api.delete(`/prestataire/prix/${id}`),

  createChambre: (data) => api.post('/prestataire/chambres', data),
  updateChambre: (id, data) => api.put(`/prestataire/chambres/${id}`, data),
  deleteChambre: (id) => api.delete(`/prestataire/chambres/${id}`),

  createPlat: (data) => api.post('/prestataire/plats', data),
  updatePlat: (id, data) => api.put(`/prestataire/plats/${id}`, data),
  deletePlat: (id) => api.delete(`/prestataire/plats/${id}`),

  createTrajet: (data) => api.post('/prestataire/trajets', data),
  updateTrajet: (id, data) => api.put(`/prestataire/trajets/${id}`, data),
  deleteTrajet: (id) => api.delete(`/prestataire/trajets/${id}`),

  createGalerieSite: (formData) => api.post('/prestataire/galeries/sites', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteGalerieSite: (id) => api.delete(`/prestataire/galeries/sites/${id}`),
  createGalerieEvenement: (formData) => api.post('/prestataire/galeries/evenements', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteGalerieEvenement: (id) => api.delete(`/prestataire/galeries/evenements/${id}`),
  createGalerieHotel: (formData) => api.post('/prestataire/galeries/hotels', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteGalerieHotel: (id) => api.delete(`/prestataire/galeries/hotels/${id}`),
  createGalerieRestaurant: (formData) => api.post('/prestataire/galeries/restaurants', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteGalerieRestaurant: (id) => api.delete(`/prestataire/galeries/restaurants/${id}`),
  createGalerieTransport: (formData) => api.post('/prestataire/galeries/transports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteGalerieTransport: (id) => api.delete(`/prestataire/galeries/transports/${id}`),
}

export const sitesApi = {
  list: (params) => api.get('/sites', { params }),
  // Tous statuts confondus (admin) - la liste publique ne renvoie que les sites validés
  adminList: (params) => api.get('/admin/sites', { params }),
  get: (id) => api.get(`/sites/${id}`),
  create: (data) => api.post('/admin/sites', data),
  update: (id, data) => api.put(`/admin/sites/${id}`, data),
  delete: (id) => api.delete(`/admin/sites/${id}`),
  valider: (id) => api.patch(`/admin/sites/${id}/valider`),
  rejeter: (id) => api.patch(`/admin/sites/${id}/rejeter`),
}

export const evenementsApi = {
  list: (params) => api.get('/evenements', { params }),
  adminList: (params) => api.get('/admin/evenements', { params }),
  get: (id) => api.get(`/evenements/${id}`),
  create: (data) => api.post('/admin/evenements', data),
  update: (id, data) => api.put(`/admin/evenements/${id}`, data),
  delete: (id) => api.delete(`/admin/evenements/${id}`),
  valider: (id) => api.patch(`/admin/evenements/${id}/valider`),
  rejeter: (id) => api.patch(`/admin/evenements/${id}/rejeter`),
}

export const hotelsApi = {
  list: (params) => api.get('/hotels', { params }),
  adminList: (params) => api.get('/admin/hotels', { params }),
  get: (id) => api.get(`/hotels/${id}`),
  create: (data) => api.post('/admin/hotels', data),
  update: (id, data) => api.put(`/admin/hotels/${id}`, data),
  delete: (id) => api.delete(`/admin/hotels/${id}`),
  valider: (id) => api.patch(`/admin/hotels/${id}/valider`),
  rejeter: (id) => api.patch(`/admin/hotels/${id}/rejeter`),
}

export const restaurantsApi = {
  list: (params) => api.get('/restaurants', { params }),
  adminList: (params) => api.get('/admin/restaurants', { params }),
  get: (id) => api.get(`/restaurants/${id}`),
  create: (data) => api.post('/admin/restaurants', data),
  update: (id, data) => api.put(`/admin/restaurants/${id}`, data),
  delete: (id) => api.delete(`/admin/restaurants/${id}`),
  valider: (id) => api.patch(`/admin/restaurants/${id}/valider`),
  rejeter: (id) => api.patch(`/admin/restaurants/${id}/rejeter`),
}

export const transportsApi = {
  list: (params) => api.get('/transports', { params }),
  adminList: (params) => api.get('/admin/transports', { params }),
  get: (id) => api.get(`/transports/${id}`),
  create: (data) => api.post('/admin/transports', data),
  update: (id, data) => api.put(`/admin/transports/${id}`, data),
  delete: (id) => api.delete(`/admin/transports/${id}`),
  valider: (id) => api.patch(`/admin/transports/${id}/valider`),
  rejeter: (id) => api.patch(`/admin/transports/${id}/rejeter`),
}

export const villesApi = {
  list: () => api.get('/villes'),
  get: (id) => api.get(`/villes/${id}`),
  create: (data) => api.post('/admin/villes', data),
  update: (id, data) => api.put(`/admin/villes/${id}`, data),
  delete: (id) => api.delete(`/admin/villes/${id}`),
}

export const chambresApi = {
  list: (params) => api.get('/chambres', { params }),
  get: (id) => api.get(`/chambres/${id}`),
  create: (data) => api.post('/admin/chambres', data),
  update: (id, data) => api.put(`/admin/chambres/${id}`, data),
  delete: (id) => api.delete(`/admin/chambres/${id}`),
}

export const platsApi = {
  list: (params) => api.get('/plats', { params }),
  get: (id) => api.get(`/plats/${id}`),
  create: (data) => api.post('/admin/plats', data),
  update: (id, data) => api.put(`/admin/plats/${id}`, data),
  delete: (id) => api.delete(`/admin/plats/${id}`),
}

export const trajetsApi = {
  list: (params) => api.get('/trajets', { params }),
  get: (id) => api.get(`/trajets/${id}`),
  create: (data) => api.post('/admin/trajets', data),
  update: (id, data) => api.put(`/admin/trajets/${id}`, data),
  delete: (id) => api.delete(`/admin/trajets/${id}`),
}

export const categoriesApi = {
  sites: () => api.get('/categories/sites'),
  site: (id) => api.get(`/categories/sites/${id}`),
  createSite: (data) => api.post('/admin/categories/sites', data),
  updateSite: (id, data) => api.put(`/admin/categories/sites/${id}`, data),
  deleteSite: (id) => api.delete(`/admin/categories/sites/${id}`),

  evenements: () => api.get('/categories/evenements'),
  evenement: (id) => api.get(`/categories/evenements/${id}`),
  createEvenement: (data) => api.post('/admin/categories/evenements', data),
  updateEvenement: (id, data) => api.put(`/admin/categories/evenements/${id}`, data),
  deleteEvenement: (id) => api.delete(`/admin/categories/evenements/${id}`),
}

export const galeriesApi = {
  sites: (params) => api.get('/galeries/sites', { params }),
  site: (id) => api.get(`/galeries/sites/${id}`),
  createSite: (formData) => api.post('/admin/galeries/sites', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateSite: (id, data) => api.put(`/admin/galeries/sites/${id}`, data),
  deleteSite: (id) => api.delete(`/admin/galeries/sites/${id}`),

  evenements: (params) => api.get('/galeries/evenements', { params }),
  evenement: (id) => api.get(`/galeries/evenements/${id}`),
  createEvenement: (formData) => api.post('/admin/galeries/evenements', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateEvenement: (id, data) => api.put(`/admin/galeries/evenements/${id}`, data),
  deleteEvenement: (id) => api.delete(`/admin/galeries/evenements/${id}`),

  hotels: (params) => api.get('/galeries/hotels', { params }),
  hotel: (id) => api.get(`/galeries/hotels/${id}`),
  createHotel: (formData) => api.post('/admin/galeries/hotels', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateHotel: (id, data) => api.put(`/admin/galeries/hotels/${id}`, data),
  deleteHotel: (id) => api.delete(`/admin/galeries/hotels/${id}`),

  restaurants: (params) => api.get('/galeries/restaurants', { params }),
  restaurant: (id) => api.get(`/galeries/restaurants/${id}`),
  createRestaurant: (formData) => api.post('/admin/galeries/restaurants', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateRestaurant: (id, data) => api.put(`/admin/galeries/restaurants/${id}`, data),
  deleteRestaurant: (id) => api.delete(`/admin/galeries/restaurants/${id}`),

  transports: (params) => api.get('/galeries/transports', { params }),
  transport: (id) => api.get(`/galeries/transports/${id}`),
  createTransport: (formData) => api.post('/admin/galeries/transports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateTransport: (id, data) => api.put(`/admin/galeries/transports/${id}`, data),
  deleteTransport: (id) => api.delete(`/admin/galeries/transports/${id}`),
}

export const prixApi = {
  list: (params) => api.get('/prix', { params }),
  get: (id) => api.get(`/prix/${id}`),
  create: (data) => api.post('/admin/prix', data),
  update: (id, data) => api.put(`/admin/prix/${id}`, data),
  delete: (id) => api.delete(`/admin/prix/${id}`),
}

// id_reservation doit référencer une réservation confirmée appartenant à
// l'utilisateur connecté. list() accepte aussi { id_site } ou { id_evnmt }.
export const avisApi = {
  list: (params) => api.get('/avis', { params }),
  get: (id) => api.get(`/avis/${id}`),
  create: (data) => api.post('/avis', data),
  update: (id, data) => api.put(`/avis/${id}`, data),
  delete: (id) => api.delete(`/avis/${id}`),
  approuver: (id) => api.patch(`/admin/avis/${id}/approuver`),
  rejeter: (id) => api.patch(`/admin/avis/${id}/rejeter`),
}

// total calculé côté serveur (prix * nombre), jamais confié au client
export const reservationsApi = {
  list: (params) => api.get('/reservations', { params }),
  get: (id) => api.get(`/reservations/${id}`),
  create: (data) => api.post('/reservations', data),
  update: (id, data) => api.put(`/reservations/${id}`, data),
  delete: (id) => api.delete(`/reservations/${id}`),
}

export const commandesApi = {
  list: () => api.get('/commandes'),
  get: (id) => api.get(`/commandes/${id}`),
  create: (reservationIds, echelonner = false) =>
    api.post('/commandes', { reservation_ids: reservationIds, echelonner }),
}

export const paiementsApi = {
  verifier: (id, transactionId) => api.patch(`/paiements/${id}/verifier`, { transaction_id: transactionId }),
}

export const circuitsApi = {
  list: () => api.get('/circuits'),
  get: (id) => api.get(`/circuits/${id}`),
  create: (data) => api.post('/circuits', data),
  update: (id, data) => api.put(`/circuits/${id}`, data),
  delete: (id) => api.delete(`/circuits/${id}`),
  reordonner: (id, ordre) => api.patch(`/circuits/${id}/etapes/reordonner`, { ordre }),
  // Public, ne persiste rien - renvoie une proposition {titre, budget_estime, etapes}
  // que l'appelant intègre au brouillon existant (même flux que la composition manuelle).
  genererIA: (contraintes) => api.post('/circuits/generer-ia', contraintes),
}

// Chat libre (pas de contraintes structurées), même contrat de circuit que
// circuitsApi.genererIA quand l'assistant en propose un dans sa réponse.
export const assistantApi = {
  chat: (messages) => api.post('/assistant/chat', { messages }),
}

export const etapesApi = {
  create: (idCircuit, data) => api.post(`/circuits/${idCircuit}/etapes`, data),
  update: (id, data) => api.put(`/etapes/${id}`, data),
  delete: (id) => api.delete(`/etapes/${id}`),
}

export const favorisApi = {
  list: () => api.get('/favoris'),
  add: (type, id) => api.post('/favoris', { type, id }),
  remove: (favoriId) => api.delete(`/favoris/${favoriId}`),
}

export const ticketsApi = {
  list: (params) => api.get('/admin/tickets', { params }),
  get: (id) => api.get(`/admin/tickets/${id}`),
  verifier: (numero) => api.post('/tickets/verifier', { numero }),
}

export const utilisationsApi = {
  list: (params) => api.get('/admin/utilisations', { params }),
  get: (id) => api.get(`/admin/utilisations/${id}`),
  create: (data) => api.post('/admin/utilisations', data),
  update: (id, data) => api.put(`/admin/utilisations/${id}`, data),
  delete: (id) => api.delete(`/admin/utilisations/${id}`),
}

export const usersApi = {
  list: () => api.get('/admin/users'),
  get: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  deleteSelf: (id) => api.delete(`/users/${id}`),
  delete: (id) => api.delete(`/admin/users/${id}`),
}

export const adminsApi = {
  list: () => api.get('/admin/admins'),
  get: (id) => api.get(`/admin/admins/${id}`),
  create: (data) => api.post('/admin/admins', data),
  update: (id, data) => api.put(`/admin/admins/${id}`, data),
  delete: (id) => api.delete(`/admin/admins/${id}`),
}

export const regionsApi = {
  list: () => api.get('/regions'),
}

export const adminResponsablesApi = {
  list: () => api.get('/admin/responsables'),
  get: (id) => api.get(`/admin/responsables/${id}`),
  create: (data) => api.post('/admin/responsables', data),
  update: (id, data) => api.put(`/admin/responsables/${id}`, data),
  delete: (id) => api.delete(`/admin/responsables/${id}`),
}

export const responsablesApi = {
  login: (data) => api.post('/responsable/login', data),
  logout: () => api.post('/responsable/logout'),
  me: () => api.get('/responsable/me'),
  updatePassword: (data) => api.post('/responsable/update-password', data),
  aValider: () => api.get('/responsable/a-valider'),
  validerSite: (id) => api.patch(`/responsable/sites/${id}/valider`),
  rejeterSite: (id) => api.patch(`/responsable/sites/${id}/rejeter`),
  demanderPrecisionsSite: (id, commentaire) => api.patch(`/responsable/sites/${id}/demander-precisions`, { commentaire }),
  validerEvenement: (id) => api.patch(`/responsable/evenements/${id}/valider`),
  rejeterEvenement: (id) => api.patch(`/responsable/evenements/${id}/rejeter`),
  demanderPrecisionsEvenement: (id, commentaire) => api.patch(`/responsable/evenements/${id}/demander-precisions`, { commentaire }),

  validerHotel: (id) => api.patch(`/responsable/hotels/${id}/valider`),
  rejeterHotel: (id) => api.patch(`/responsable/hotels/${id}/rejeter`),
  demanderPrecisionsHotel: (id, commentaire) => api.patch(`/responsable/hotels/${id}/demander-precisions`, { commentaire }),
  validerRestaurant: (id) => api.patch(`/responsable/restaurants/${id}/valider`),
  rejeterRestaurant: (id) => api.patch(`/responsable/restaurants/${id}/rejeter`),
  demanderPrecisionsRestaurant: (id, commentaire) => api.patch(`/responsable/restaurants/${id}/demander-precisions`, { commentaire }),
  validerTransport: (id) => api.patch(`/responsable/transports/${id}/valider`),
  rejeterTransport: (id) => api.patch(`/responsable/transports/${id}/rejeter`),
  demanderPrecisionsTransport: (id, commentaire) => api.patch(`/responsable/transports/${id}/demander-precisions`, { commentaire }),

  // Fiches créées par le responsable lui-même - jamais auto-validées, seul un admin les valide.
  mesSites: () => api.get('/responsable/sites'),
  createSite: (data) => api.post('/responsable/sites', data),
  updateSite: (id, data) => api.put(`/responsable/sites/${id}`, data),
  deleteSite: (id) => api.delete(`/responsable/sites/${id}`),

  mesEvenements: () => api.get('/responsable/evenements'),
  createEvenement: (data) => api.post('/responsable/evenements', data),
  updateEvenement: (id, data) => api.put(`/responsable/evenements/${id}`, data),
  deleteEvenement: (id) => api.delete(`/responsable/evenements/${id}`),

  mesHotels: () => api.get('/responsable/hotels'),
  createHotel: (data) => api.post('/responsable/hotels', data),
  updateHotel: (id, data) => api.put(`/responsable/hotels/${id}`, data),
  deleteHotel: (id) => api.delete(`/responsable/hotels/${id}`),

  mesRestaurants: () => api.get('/responsable/restaurants'),
  createRestaurant: (data) => api.post('/responsable/restaurants', data),
  updateRestaurant: (id, data) => api.put(`/responsable/restaurants/${id}`, data),
  deleteRestaurant: (id) => api.delete(`/responsable/restaurants/${id}`),

  mesTransports: () => api.get('/responsable/transports'),
  createTransport: (data) => api.post('/responsable/transports', data),
  updateTransport: (id, data) => api.put(`/responsable/transports/${id}`, data),
  deleteTransport: (id) => api.delete(`/responsable/transports/${id}`),

  createPrix: (data) => api.post('/responsable/prix', data),
  updatePrix: (id, data) => api.put(`/responsable/prix/${id}`, data),
  deletePrix: (id) => api.delete(`/responsable/prix/${id}`),

  createChambre: (data) => api.post('/responsable/chambres', data),
  updateChambre: (id, data) => api.put(`/responsable/chambres/${id}`, data),
  deleteChambre: (id) => api.delete(`/responsable/chambres/${id}`),

  createPlat: (data) => api.post('/responsable/plats', data),
  updatePlat: (id, data) => api.put(`/responsable/plats/${id}`, data),
  deletePlat: (id) => api.delete(`/responsable/plats/${id}`),

  createTrajet: (data) => api.post('/responsable/trajets', data),
  updateTrajet: (id, data) => api.put(`/responsable/trajets/${id}`, data),
  deleteTrajet: (id) => api.delete(`/responsable/trajets/${id}`),

  createGalerieSite: (formData) => api.post('/responsable/galeries/sites', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteGalerieSite: (id) => api.delete(`/responsable/galeries/sites/${id}`),
  createGalerieEvenement: (formData) => api.post('/responsable/galeries/evenements', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteGalerieEvenement: (id) => api.delete(`/responsable/galeries/evenements/${id}`),
  createGalerieHotel: (formData) => api.post('/responsable/galeries/hotels', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteGalerieHotel: (id) => api.delete(`/responsable/galeries/hotels/${id}`),
  createGalerieRestaurant: (formData) => api.post('/responsable/galeries/restaurants', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteGalerieRestaurant: (id) => api.delete(`/responsable/galeries/restaurants/${id}`),
  createGalerieTransport: (formData) => api.post('/responsable/galeries/transports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteGalerieTransport: (id) => api.delete(`/responsable/galeries/transports/${id}`),
}

export const fonctionnalitesApi = {
  list: (params) => api.get('/admin/fonctionnalites', { params }),
  get: (id) => api.get(`/admin/fonctionnalites/${id}`),
  create: (data) => api.post('/admin/fonctionnalites', data),
  update: (id, data) => api.put(`/admin/fonctionnalites/${id}`, data),
  delete: (id) => api.delete(`/admin/fonctionnalites/${id}`),
  assignerAdmin: (id, data) => api.post(`/admin/fonctionnalites/${id}/assigner-admin`, data),
  assignerUser: (id, data) => api.post(`/admin/fonctionnalites/${id}/assigner-user`, data),
}

export const plansApi = {
  list: () => api.get('/plans'),
  create: (data) => api.post('/admin/plans', data),
  update: (id, data) => api.put(`/admin/plans/${id}`, data),
  delete: (id) => api.delete(`/admin/plans/${id}`),
}

export const temoignagesApi = {
  list: () => api.get('/temoignages'),
  adminList: () => api.get('/admin/temoignages'),
  create: (formData) => api.post('/admin/temoignages', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  // POST + _method=PUT (method-spoofing Laravel) : seul moyen de recevoir
  // un fichier multipart sur une route PUT en PHP.
  update: (id, formData) => {
    formData.append('_method', 'PUT')
    return api.post(`/admin/temoignages/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  delete: (id) => api.delete(`/admin/temoignages/${id}`),
}

export const abonnementsApi = {
  statut: () => api.get('/prestataire/abonnement'),
  souscrire: (idPlan) => api.post('/prestataire/abonnements', { id_plan: idPlan }),
  verifierFacture: (factureId, transactionId) =>
    api.patch(`/prestataire/factures-abonnement/${factureId}/verifier`, { transaction_id: transactionId }),
  adminList: () => api.get('/admin/abonnements'),
}

// Même contrôleur backend monté sous les 4 guards - seul le préfixe change
// selon le rôle connecté (AuthContext user.role).
const PREFIX_NOTIFICATIONS = { user: '', admin: '/admin', prestataire: '/prestataire', responsable: '/responsable' }
export const notificationsApi = {
  list: (role) => api.get(`${PREFIX_NOTIFICATIONS[role] || ''}/mes-notifications`),
  nonLues: (role) => api.get(`${PREFIX_NOTIFICATIONS[role] || ''}/mes-notifications/non-lues`),
  marquerLu: (role, id) => api.patch(`${PREFIX_NOTIFICATIONS[role] || ''}/mes-notifications/${id}/lu`),
  marquerToutesLues: (role) => api.patch(`${PREFIX_NOTIFICATIONS[role] || ''}/mes-notifications/tout-lire`),
}
