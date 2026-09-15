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