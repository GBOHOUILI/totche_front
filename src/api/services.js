import api from './client'

// ─── AUTH ────────────────────────────────────────────────────
// POST /api/register
// POST /api/login
// POST /api/admin/login
// POST /api/logout
// POST /api/admin/logout
// GET  /api/me
// GET  /api/admin/me
// POST /api/update-password
// POST /api/admin/update-password
export const authApi = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  loginAdmin: (data) => api.post('/admin/login', data),
  logout: () => api.post('/logout'),
  logoutAdmin: () => api.post('/admin/logout'),
  me: () => api.get('/me'),
  updatePassword: (data) => api.post('/update-password', data),
}

// ─── PRESTATAIRES (portail SaaS) ───────────────────────────────
// POST /api/prestataire/register   { nom_entreprise, type_prestataire, email, tel?, password, password_confirmation }
// POST /api/prestataire/login      { email, password }
// GET  /api/prestataire/me
// POST /api/prestataire/logout
// POST /api/prestataire/update-password
// PUT  /api/prestataire/profil
// GET  /api/prestataire/dashboard
// GET/POST/PUT/DELETE /api/prestataire/sites, /api/prestataire/evenements
// POST/PUT/DELETE     /api/prestataire/prix
// POST/PUT/DELETE     /api/prestataire/galeries/sites, /api/prestataire/galeries/evenements
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

// ─── SITES ───────────────────────────────────────────────────
// GET  /api/sites
// GET  /api/sites/{site}
// POST /api/admin/sites         (admin)
// PUT  /api/admin/sites/{site}  (admin)
// DEL  /api/admin/sites/{site}  (admin)
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

// ─── ÉVÉNEMENTS ──────────────────────────────────────────────
// GET   /api/evenements
// GET   /api/evenements/{evenement}
// POST  /api/admin/evenements           (admin)
// PUT   /api/admin/evenements/{id}      (admin)
// DEL   /api/admin/evenements/{id}      (admin)
// PATCH /api/admin/evenements/{id}/valider (admin)
// PATCH /api/admin/evenements/{id}/rejeter (admin)
export const evenementsApi = {
  list: (params) => api.get('/evenements', { params }),
  // Tous statuts confondus (admin) - la liste publique ne renvoie que les événements validés
  adminList: (params) => api.get('/admin/evenements', { params }),
  get: (id) => api.get(`/evenements/${id}`),
  create: (data) => api.post('/admin/evenements', data),
  update: (id, data) => api.put(`/admin/evenements/${id}`, data),
  delete: (id) => api.delete(`/admin/evenements/${id}`),
  valider: (id) => api.patch(`/admin/evenements/${id}/valider`),
  rejeter: (id) => api.patch(`/admin/evenements/${id}/rejeter`),
}

// ─── HÔTELS ──────────────────────────────────────────────────
// GET   /api/hotels
// GET   /api/hotels/{hotel}
// POST  /api/admin/hotels                  (admin)
// PUT   /api/admin/hotels/{id}             (admin)
// DEL   /api/admin/hotels/{id}             (admin)
// PATCH /api/admin/hotels/{id}/valider     (admin)
// PATCH /api/admin/hotels/{id}/rejeter     (admin)
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

// ─── RESTAURANTS ─────────────────────────────────────────────
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

// ─── TRANSPORTS ──────────────────────────────────────────────
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

// ─── VILLES ──────────────────────────────────────────────────
// GET /api/villes - liste ouverte (contrairement aux régions, fixe/seedée)
export const villesApi = {
  list: () => api.get('/villes'),
  get: (id) => api.get(`/villes/${id}`),
  create: (data) => api.post('/admin/villes', data),
  update: (id, data) => api.put(`/admin/villes/${id}`, data),
  delete: (id) => api.delete(`/admin/villes/${id}`),
}

// ─── CHAMBRES (sous-entité Hôtel) ──────────────────────────────
// GET /api/chambres ?id_hotel=
export const chambresApi = {
  list: (params) => api.get('/chambres', { params }),
  get: (id) => api.get(`/chambres/${id}`),
  create: (data) => api.post('/admin/chambres', data),
  update: (id, data) => api.put(`/admin/chambres/${id}`, data),
  delete: (id) => api.delete(`/admin/chambres/${id}`),
}

// ─── PLATS (sous-entité Restaurant) ────────────────────────────
// GET /api/plats ?id_restaurant=
export const platsApi = {
  list: (params) => api.get('/plats', { params }),
  get: (id) => api.get(`/plats/${id}`),
  create: (data) => api.post('/admin/plats', data),
  update: (id, data) => api.put(`/admin/plats/${id}`, data),
  delete: (id) => api.delete(`/admin/plats/${id}`),
}

// ─── TRAJETS (sous-entité Transport) ───────────────────────────
// GET /api/trajets ?id_transport=&id_ville_depart=&id_ville_arrivee=
export const trajetsApi = {
  list: (params) => api.get('/trajets', { params }),
  get: (id) => api.get(`/trajets/${id}`),
  create: (data) => api.post('/admin/trajets', data),
  update: (id, data) => api.put(`/admin/trajets/${id}`, data),
  delete: (id) => api.delete(`/admin/trajets/${id}`),
}

// ─── CATÉGORIES SITES ────────────────────────────────────────
// GET /api/categories/sites
// GET /api/categories/sites/{catSite}
// POST   /api/admin/categories/sites         (admin)
// PUT    /api/admin/categories/sites/{id}    (admin)
// DELETE /api/admin/categories/sites/{id}    (admin)
export const categoriesApi = {
  sites: () => api.get('/categories/sites'),
  site: (id) => api.get(`/categories/sites/${id}`),
  createSite: (data) => api.post('/admin/categories/sites', data),
  updateSite: (id, data) => api.put(`/admin/categories/sites/${id}`, data),
  deleteSite: (id) => api.delete(`/admin/categories/sites/${id}`),

  // ─── CATÉGORIES ÉVÉNEMENTS ───────────────────────────────
  // GET /api/categories/evenements
  // GET /api/categories/evenements/{catEvenmt}
  // POST   /api/admin/categories/evenements      (admin)
  // PUT    /api/admin/categories/evenements/{id} (admin)
  // DELETE /api/admin/categories/evenements/{id} (admin)
  evenements: () => api.get('/categories/evenements'),
  evenement: (id) => api.get(`/categories/evenements/${id}`),
  createEvenement: (data) => api.post('/admin/categories/evenements', data),
  updateEvenement: (id, data) => api.put(`/admin/categories/evenements/${id}`, data),
  deleteEvenement: (id) => api.delete(`/admin/categories/evenements/${id}`),
}

// ─── GALERIES SITES ──────────────────────────────────────────
// GET /api/galeries/sites
// GET /api/galeries/sites/{galerieSite}
// POST   /api/admin/galeries/sites             (admin, multipart)
// PUT    /api/admin/galeries/sites/{id}        (admin)
// DELETE /api/admin/galeries/sites/{id}        (admin)
export const galeriesApi = {
  sites: (params) => api.get('/galeries/sites', { params }),
  site: (id) => api.get(`/galeries/sites/${id}`),
  createSite: (formData) => api.post('/admin/galeries/sites', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateSite: (id, data) => api.put(`/admin/galeries/sites/${id}`, data),
  deleteSite: (id) => api.delete(`/admin/galeries/sites/${id}`),

  // ─── GALERIES ÉVÉNEMENTS ─────────────────────────────────
  // GET /api/galeries/evenements
  // GET /api/galeries/evenements/{gallerieEvnmt}
  // POST   /api/admin/galeries/evenements        (admin, multipart)
  // PUT    /api/admin/galeries/evenements/{id}   (admin)
  // DELETE /api/admin/galeries/evenements/{id}   (admin)
  evenements: (params) => api.get('/galeries/evenements', { params }),
  evenement: (id) => api.get(`/galeries/evenements/${id}`),
  createEvenement: (formData) => api.post('/admin/galeries/evenements', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateEvenement: (id, data) => api.put(`/admin/galeries/evenements/${id}`, data),
  deleteEvenement: (id) => api.delete(`/admin/galeries/evenements/${id}`),

  // ─── GALERIES HÔTELS ─────────────────────────────────────
  hotels: (params) => api.get('/galeries/hotels', { params }),
  hotel: (id) => api.get(`/galeries/hotels/${id}`),
  createHotel: (formData) => api.post('/admin/galeries/hotels', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateHotel: (id, data) => api.put(`/admin/galeries/hotels/${id}`, data),
  deleteHotel: (id) => api.delete(`/admin/galeries/hotels/${id}`),

  // ─── GALERIES RESTAURANTS ────────────────────────────────
  restaurants: (params) => api.get('/galeries/restaurants', { params }),
  restaurant: (id) => api.get(`/galeries/restaurants/${id}`),
  createRestaurant: (formData) => api.post('/admin/galeries/restaurants', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateRestaurant: (id, data) => api.put(`/admin/galeries/restaurants/${id}`, data),
  deleteRestaurant: (id) => api.delete(`/admin/galeries/restaurants/${id}`),

  // ─── GALERIES TRANSPORTS ─────────────────────────────────
  transports: (params) => api.get('/galeries/transports', { params }),
  transport: (id) => api.get(`/galeries/transports/${id}`),
  createTransport: (formData) => api.post('/admin/galeries/transports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateTransport: (id, data) => api.put(`/admin/galeries/transports/${id}`, data),
  deleteTransport: (id) => api.delete(`/admin/galeries/transports/${id}`),
}

// ─── PRIX ────────────────────────────────────────────────────
// GET /api/prix              ?id_site=&id_evnmt=
// GET /api/prix/{prix}
// POST   /api/admin/prix         (admin)
// PUT    /api/admin/prix/{prix}  (admin)
// DELETE /api/admin/prix/{prix}  (admin)
// Champs : { libelle, montant, id_site, id_evnmt }
export const prixApi = {
  list: (params) => api.get('/prix', { params }),
  get: (id) => api.get(`/prix/${id}`),
  create: (data) => api.post('/admin/prix', data),
  update: (id, data) => api.put(`/admin/prix/${id}`, data),
  delete: (id) => api.delete(`/admin/prix/${id}`),
}

// ─── AVIS ────────────────────────────────────────────────────
// GET  /api/avis              public
// GET  /api/avis/{avi}        public
// POST /api/avis              auth requis
// PUT  /api/avis/{avi}        auth requis
// DEL  /api/avis/{avi}        auth requis
// PATCH /api/admin/avis/{avi}/approuver (admin)
// PATCH /api/admin/avis/{avi}/rejeter   (admin)
// Champs : { id_utilisation, message, status }
export const avisApi = {
  list: (params) => api.get('/avis', { params }),
  get: (id) => api.get(`/avis/${id}`),
  create: (data) => api.post('/avis', data),
  update: (id, data) => api.put(`/avis/${id}`, data),
  delete: (id) => api.delete(`/avis/${id}`),
  approuver: (id) => api.patch(`/admin/avis/${id}/approuver`),
  rejeter: (id) => api.patch(`/admin/avis/${id}/rejeter`),
}

// ─── RÉSERVATIONS ────────────────────────────────────────────
// GET  /api/reservations         auth requis  ?id_site=&id_evnmt=&type=
// GET  /api/reservations/{id}    auth requis
// POST /api/reservations         auth requis
// PUT  /api/reservations/{id}    auth requis
// DEL  /api/reservations/{id}    auth requis
// Champs : { type:'site'|'evenement', prix, nombre, description, id_site, id_evnmt }
// total calculé auto : prix * nombre
export const reservationsApi = {
  list: (params) => api.get('/reservations', { params }),
  get: (id) => api.get(`/reservations/${id}`),
  create: (data) => api.post('/reservations', data),
  update: (id, data) => api.put(`/reservations/${id}`, data),
  delete: (id) => api.delete(`/reservations/${id}`),
}

// ─── COMMANDES / PAIEMENTS (Kkiapay) ──────────────────────────
// GET   /api/commandes                    auth requis
// GET   /api/commandes/{id}               auth requis
// POST  /api/commandes                    auth requis  { reservation_ids: [], echelonner? }
// PATCH /api/paiements/{id}/verifier      auth requis  { transaction_id }
export const commandesApi = {
  list: () => api.get('/commandes'),
  get: (id) => api.get(`/commandes/${id}`),
  create: (reservationIds, echelonner = false) =>
    api.post('/commandes', { reservation_ids: reservationIds, echelonner }),
}

export const paiementsApi = {
  verifier: (id, transactionId) => api.patch(`/paiements/${id}/verifier`, { transaction_id: transactionId }),
}

// ─── CIRCUITS (itinéraires personnalisés) ─────────────────────
// GET    /api/circuits                              auth requis - mes circuits
// POST   /api/circuits                              auth requis  { libelle, description? }
// GET    /api/circuits/{id}                         auth requis
// PUT    /api/circuits/{id}                         auth requis  { libelle?, description? }
// DELETE /api/circuits/{id}                         auth requis
// POST   /api/circuits/{id}/etapes                  auth requis  { id_site? | id_evnmt?, ordre? }
// PATCH  /api/circuits/{id}/etapes/reordonner        auth requis  { ordre: [id_etape,...] }
// PUT    /api/etapes/{id}                           auth requis  { ordre?, id_reservation? }
// DELETE /api/etapes/{id}                           auth requis
export const circuitsApi = {
  list: () => api.get('/circuits'),
  get: (id) => api.get(`/circuits/${id}`),
  create: (data) => api.post('/circuits', data),
  update: (id, data) => api.put(`/circuits/${id}`, data),
  delete: (id) => api.delete(`/circuits/${id}`),
  reordonner: (id, ordre) => api.patch(`/circuits/${id}/etapes/reordonner`, { ordre }),
}

export const etapesApi = {
  create: (idCircuit, data) => api.post(`/circuits/${idCircuit}/etapes`, data),
  update: (id, data) => api.put(`/etapes/${id}`, data),
  delete: (id) => api.delete(`/etapes/${id}`),
}

// ─── TICKETS ─────────────────────────────────────────────────
// GET  /api/admin/tickets            (admin)
// GET  /api/admin/tickets/{id}       (admin)
// POST /api/admin/tickets            (admin)
// PUT  /api/admin/tickets/{id}       (admin)
// DEL  /api/admin/tickets/{id}       (admin)
// POST /api/tickets/verifier         public  { numero }
export const ticketsApi = {
  list: (params) => api.get('/admin/tickets', { params }),
  get: (id) => api.get(`/admin/tickets/${id}`),
  verifier: (numero) => api.post('/tickets/verifier', { numero }),
}

// ─── UTILISATIONS ────────────────────────────────────────────
// GET  /api/admin/utilisations       (admin)
// GET  /api/admin/utilisations/{id}  (admin)
// POST /api/admin/utilisations       (admin)
// PUT  /api/admin/utilisations/{id}  (admin)
// DEL  /api/admin/utilisations/{id}  (admin)
// Champs : { date_visite, heure, id_ticket }
export const utilisationsApi = {
  list: (params) => api.get('/admin/utilisations', { params }),
  get: (id) => api.get(`/admin/utilisations/${id}`),
  create: (data) => api.post('/admin/utilisations', data),
  update: (id, data) => api.put(`/admin/utilisations/${id}`, data),
  delete: (id) => api.delete(`/admin/utilisations/${id}`),
}

// ─── USERS ───────────────────────────────────────────────────
// GET    /api/admin/users              (admin)
// POST   /api/admin/users              (admin)
// DELETE /api/admin/users/{user}       (admin - supprime n'importe quel compte)
// GET    /api/users/{user}             auth requis, self uniquement
// PUT    /api/users/{user}             auth requis, self uniquement
// DELETE /api/users/{user}             auth requis, self uniquement
// Champs : { nom, prenom, tel, email, password, nationalite, longitude, latitude }
export const usersApi = {
  list: () => api.get('/admin/users'),
  get: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  // Suppression depuis l'espace personnel du touriste (self uniquement)
  deleteSelf: (id) => api.delete(`/users/${id}`),
  // Suppression depuis l'admin (n'importe quel compte)
  delete: (id) => api.delete(`/admin/users/${id}`),
}

// ─── ADMINS ──────────────────────────────────────────────────
// GET  /api/admin/admins        (admin)
// POST /api/admin/admins        (admin)
// GET  /api/admin/admins/{id}   (admin)
// PUT  /api/admin/admins/{id}   (admin)
// DEL  /api/admin/admins/{id}   (admin)
// Champs : { nom, prenom, tel, password, status }
export const adminsApi = {
  list: () => api.get('/admin/admins'),
  get: (id) => api.get(`/admin/admins/${id}`),
  create: (data) => api.post('/admin/admins', data),
  update: (id, data) => api.put(`/admin/admins/${id}`, data),
  delete: (id) => api.delete(`/admin/admins/${id}`),
}

// ─── RÉGIONS ─────────────────────────────────────────────────
// GET /api/regions - liste fixe (12 départements du Bénin), pas de mutation exposée
export const regionsApi = {
  list: () => api.get('/regions'),
}

// ─── RESPONSABLES RÉGIONAUX ────────────────────────────────────
// Gestion des comptes par un admin :
// GET/POST/PUT/DELETE /api/admin/responsables (admin) - { nom, prenom, tel, password, status, id_region? }
// Portail du responsable connecté :
// POST /api/responsable/login   { tel, password }
// GET  /api/responsable/me
// POST /api/responsable/logout
// POST /api/responsable/update-password
// GET  /api/responsable/a-valider - { sites: [...], evenements: [...] } en attente dans son périmètre
// PATCH /api/responsable/sites/{id}/valider | /rejeter
// PATCH /api/responsable/evenements/{id}/valider | /rejeter
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
  validerEvenement: (id) => api.patch(`/responsable/evenements/${id}/valider`),
  rejeterEvenement: (id) => api.patch(`/responsable/evenements/${id}/rejeter`),

  validerHotel: (id) => api.patch(`/responsable/hotels/${id}/valider`),
  rejeterHotel: (id) => api.patch(`/responsable/hotels/${id}/rejeter`),
  validerRestaurant: (id) => api.patch(`/responsable/restaurants/${id}/valider`),
  rejeterRestaurant: (id) => api.patch(`/responsable/restaurants/${id}/rejeter`),
  validerTransport: (id) => api.patch(`/responsable/transports/${id}/valider`),
  rejeterTransport: (id) => api.patch(`/responsable/transports/${id}/rejeter`),

  // Mes propres fiches (un responsable connaît son territoire) - jamais
  // auto-validées, seul un admin les valide.
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

// ─── FONCTIONNALITÉS ─────────────────────────────────────────
// GET  /api/admin/fonctionnalites       (admin)
// POST /api/admin/fonctionnalites       (admin)
// GET  /api/admin/fonctionnalites/{id}  (admin)
// PUT  /api/admin/fonctionnalites/{id}  (admin)
// DEL  /api/admin/fonctionnalites/{id}  (admin)
// POST /api/admin/fonctionnalites/{id}/assigner-admin (admin)
// POST /api/admin/fonctionnalites/{id}/assigner-user  (admin)
export const fonctionnalitesApi = {
  list: (params) => api.get('/admin/fonctionnalites', { params }),
  get: (id) => api.get(`/admin/fonctionnalites/${id}`),
  create: (data) => api.post('/admin/fonctionnalites', data),
  update: (id, data) => api.put(`/admin/fonctionnalites/${id}`, data),
  delete: (id) => api.delete(`/admin/fonctionnalites/${id}`),
  assignerAdmin: (id, data) => api.post(`/admin/fonctionnalites/${id}/assigner-admin`, data),
  assignerUser: (id, data) => api.post(`/admin/fonctionnalites/${id}/assigner-user`, data),
}

// ─── PLANS D'ABONNEMENT SaaS (module Prestataire, étape 3) ─────
// GET  /api/plans              (public)
// POST/PUT/DELETE /api/admin/plans (admin)
export const plansApi = {
  list: () => api.get('/plans'),
  create: (data) => api.post('/admin/plans', data),
  update: (id, data) => api.put(`/admin/plans/${id}`, data),
  delete: (id) => api.delete(`/admin/plans/${id}`),
}

// ─── ABONNEMENTS (Kkiapay, mêmes mécanismes que commandesApi/paiementsApi) ─
// GET   /api/prestataire/abonnement                                    { abonnement, actif }
// POST  /api/prestataire/abonnements                { id_plan }        crée/réutilise l'abonnement en_attente + une facture à payer
// PATCH /api/prestataire/factures-abonnement/{id}/verifier { transaction_id }
// GET   /api/admin/abonnements (admin)
export const abonnementsApi = {
  statut: () => api.get('/prestataire/abonnement'),
  souscrire: (idPlan) => api.post('/prestataire/abonnements', { id_plan: idPlan }),
  verifierFacture: (factureId, transactionId) =>
    api.patch(`/prestataire/factures-abonnement/${factureId}/verifier`, { transaction_id: transactionId }),
  adminList: () => api.get('/admin/abonnements'),
}