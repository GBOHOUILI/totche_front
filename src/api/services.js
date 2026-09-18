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

  createPrix: (data) => api.post('/prestataire/prix', data),
  updatePrix: (id, data) => api.put(`/prestataire/prix/${id}`, data),
  deletePrix: (id) => api.delete(`/prestataire/prix/${id}`),

  createGalerieSite: (formData) => api.post('/prestataire/galeries/sites', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteGalerieSite: (id) => api.delete(`/prestataire/galeries/sites/${id}`),
  createGalerieEvenement: (formData) => api.post('/prestataire/galeries/evenements', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteGalerieEvenement: (id) => api.delete(`/prestataire/galeries/evenements/${id}`),
}

// ─── SITES ───────────────────────────────────────────────────
// GET  /api/sites
// GET  /api/sites/{site}
// POST /api/admin/sites         (admin)
// PUT  /api/admin/sites/{site}  (admin)
// DEL  /api/admin/sites/{site}  (admin)
export const sitesApi = {
  list: (params) => api.get('/sites', { params }),
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
  get: (id) => api.get(`/evenements/${id}`),
  create: (data) => api.post('/admin/evenements', data),
  update: (id, data) => api.put(`/admin/evenements/${id}`, data),
  delete: (id) => api.delete(`/admin/evenements/${id}`),
  valider: (id) => api.patch(`/admin/evenements/${id}/valider`),
  rejeter: (id) => api.patch(`/admin/evenements/${id}/rejeter`),
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
// GET    /api/circuits                              auth requis — mes circuits
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
// DELETE /api/admin/users/{user}       (admin — supprime n'importe quel compte)
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
// GET /api/regions — liste fixe (12 départements du Bénin), pas de mutation exposée
export const regionsApi = {
  list: () => api.get('/regions'),
}

// ─── RESPONSABLES RÉGIONAUX ────────────────────────────────────
// Gestion des comptes par un admin :
// GET/POST/PUT/DELETE /api/admin/responsables (admin) — { nom, prenom, tel, password, status, id_region? }
// Portail du responsable connecté :
// POST /api/responsable/login   { tel, password }
// GET  /api/responsable/me
// POST /api/responsable/logout
// POST /api/responsable/update-password
// GET  /api/responsable/a-valider — { sites: [...], evenements: [...] } en attente dans son périmètre
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