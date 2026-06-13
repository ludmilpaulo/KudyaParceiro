import type { SupportedLocale } from "./translations";

export type DoctorTranslationKey =
  | "doctorDashboardTitle"
  | "verificationRequired"
  | "uploadDocuments"
  | "submitForReview"
  | "profileApproved"
  | "profileRejected"
  | "newBooking"
  | "setAvailability"
  | "appointments"
  | "patients"
  | "reviews"
  | "services"
  | "profile"
  | "notifications"
  | "languageSettings"
  | "statusDraft"
  | "statusPendingReview"
  | "statusApproved"
  | "statusRejected"
  | "statusSuspended"
  | "underReviewMessage"
  | "suspendedMessage"
  | "verificationProgress"
  | "saveAvailability"
  | "previewSlots"
  | "availabilitySaved"
  | "availabilityFailed"
  | "noAppointments"
  | "confirmAppointment"
  | "cancelAppointment"
  | "completeAppointment"
  | "noShow"
  | "loading"
  | "error"
  | "success"
  | "docIdPassport"
  | "docMedicalLicence"
  | "docQualification"
  | "docRegistration"
  | "docBackgroundConsent"
  | "docOther"
  | "selectDocumentType"
  | "chooseFile"
  | "adminFeedback"
  | "newBookingAlert"
  | "viewAppointments"
  | "weeklyAvailability"
  | "slotRules"
  | "calendarSlots"
  | "savedRules"
  | "noSlotsYet"
  | "addService"
  | "serviceName"
  | "servicePrice"
  | "emptyPatients"
  | "emptyReviews"
  | "preferredLanguage"
  | "saveProfile"
  | "profileUpdated"
  | "profileDescription"
  | "clinicNameLabel"
  | "professionalTitleLabel"
  | "languagesLabel"
  | "licenseNumberLabel"
  | "consultationFeeLabel"
  | "yearsExperienceLabel"
  | "biographyLabel"
  | "onlineConsultation"
  | "physicalConsultation"
  | "addConsultationService"
  | "yourServices"
  | "noServicesYet"
  | "durationMinutesLabel"
  | "deleteLabel"
  | "filterAll"
  | "filterToday"
  | "filterUpcoming"
  | "filterPending"
  | "filterCompleted"
  | "filterCancelled"
  | "searchPatient"
  | "noAppointmentsFilter"
  | "statusLabel"
  | "patientNote"
  | "appointmentDetails"
  | "todaysAppointments"
  | "pendingRequests"
  | "availableSlotsWeek"
  | "monthlyEarnings"
  | "recentActivity"
  | "quickActions"
  | "completeProfileAction"
  | "manageServicesAction"
  | "reviewAppointmentsAction"
  | "setWeeklyAvailability"
  | "noUpcomingAppointments"
  | "loadingDashboard"
  | "dashboardLoadError"
  | "signIn"
  | "markAllRead"
  | "unreadCount"
  | "noNotificationsYet"
  | "newBookingsSection"
  | "openAction"
  | "readAction"
  | "slotAvailable"
  | "slotBooked"
  | "slotBlocked"
  | "blockSlot"
  | "unblockSlot"
  | "removeLabel"
  | "generatingPreview"
  | "previewBeforeSave"
  | "noAvailabilityConfigured"
  | "slotPreviewTitle"
  | "blockSlotsHint"
  | "businessProfile"
  | "businessProfileDesc"
  | "verifiedLabel"
  | "activeLabel"
  | "inactiveLabel"
  | "profileCompletionLabel"
  | "ratingLabel"
  | "logout"
  | "healthcarePartner"
  | "verificationGateMessage"
  | "camera"
  | "gallery"
  | "selectDate"
  | "fillTestLogin"
  | "backToVerification"
  | "openProfileEditor"
  | "saveProfileBasics"
  | "fileLabel"
  | "viewDocument";

export type DoctorTranslations = Record<SupportedLocale, Record<DoctorTranslationKey, string>>;

const doctorTranslations: DoctorTranslations = {
  en: {
    doctorDashboardTitle: "Doctor Dashboard",
    verificationRequired: "Verification Required",
    uploadDocuments: "Upload Documents",
    submitForReview: "Submit for Review",
    profileApproved: "Your profile has been approved.",
    profileRejected: "Your profile needs attention.",
    newBooking: "New Booking",
    setAvailability: "Set Availability",
    appointments: "Appointments",
    patients: "Patients",
    reviews: "Reviews",
    services: "Services",
    profile: "Profile",
    notifications: "Notifications",
    languageSettings: "Language",
    statusDraft: "Draft",
    statusPendingReview: "Pending Review",
    statusApproved: "Approved",
    statusRejected: "Rejected",
    statusSuspended: "Suspended",
    underReviewMessage: "Your profile is currently under review by the platform admin.",
    suspendedMessage: "Your account has been suspended. Contact Kudya support.",
    verificationProgress: "Verification progress",
    saveAvailability: "Save availability",
    previewSlots: "Preview slots",
    availabilitySaved: "Availability saved and future slots generated.",
    availabilityFailed: "Failed to save availability.",
    noAppointments: "No appointments yet.",
    confirmAppointment: "Confirm",
    cancelAppointment: "Cancel",
    completeAppointment: "Complete",
    noShow: "No show",
    loading: "Loading...",
    error: "Something went wrong.",
    success: "Success",
    docIdPassport: "ID document or passport",
    docMedicalLicence: "Medical licence / practice licence",
    docQualification: "Medical qualification certificate",
    docRegistration: "Professional registration certificate",
    docBackgroundConsent: "Background check consent document",
    docOther: "Other supporting document",
    selectDocumentType: "Document type",
    chooseFile: "Choose file",
    adminFeedback: "Admin feedback",
    newBookingAlert: "New booking received",
    viewAppointments: "View appointments",
    weeklyAvailability: "Weekly availability",
    slotRules: "60-minute consultations with 10-minute breaks. One patient per slot.",
    calendarSlots: "Calendar slots",
    savedRules: "Saved weekly rules",
    noSlotsYet: "No generated slots for this date.",
    addService: "Add service",
    serviceName: "Service name",
    servicePrice: "Price",
    emptyPatients: "Patient history will appear here as bookings grow.",
    emptyReviews: "Reviews will appear here.",
    preferredLanguage: "Preferred language",
    saveProfile: "Save profile",
    profileUpdated: "Profile updated.",
    profileDescription: "Specialty, bio, qualifications, languages, and consultation settings.",
    clinicNameLabel: "Clinic name",
    professionalTitleLabel: "Professional title",
    languagesLabel: "Languages",
    licenseNumberLabel: "License number",
    consultationFeeLabel: "Consultation fee",
    yearsExperienceLabel: "Years of experience",
    biographyLabel: "Biography",
    onlineConsultation: "Online consultation",
    physicalConsultation: "Physical consultation",
    addConsultationService: "Add consultation service",
    yourServices: "Your services",
    noServicesYet: "No services yet. Add your first consultation offering.",
    durationMinutesLabel: "Duration (minutes)",
    deleteLabel: "Delete",
    filterAll: "All",
    filterToday: "Today",
    filterUpcoming: "Upcoming",
    filterPending: "Pending",
    filterCompleted: "Completed",
    filterCancelled: "Cancelled",
    searchPatient: "Search patient...",
    noAppointmentsFilter: "No appointments found for this filter.",
    statusLabel: "Status",
    patientNote: "Patient note",
    appointmentDetails: "Appointment details",
    todaysAppointments: "Today's appointments",
    pendingRequests: "Pending requests",
    availableSlotsWeek: "Available slots this week",
    monthlyEarnings: "Monthly earnings",
    recentActivity: "Recent activity",
    quickActions: "Quick actions",
    completeProfileAction: "Complete profile",
    manageServicesAction: "Manage services",
    reviewAppointmentsAction: "Review appointments",
    setWeeklyAvailability: "Set weekly availability",
    noUpcomingAppointments: "No upcoming appointments yet.",
    loadingDashboard: "Loading healthcare dashboard...",
    dashboardLoadError: "Unable to load the doctor dashboard. Please sign in with a doctor or clinic account.",
    signIn: "Sign in",
    markAllRead: "Mark all read",
    unreadCount: "unread",
    noNotificationsYet: "No notifications yet.",
    newBookingsSection: "New bookings",
    openAction: "Open",
    readAction: "Read",
    slotAvailable: "Available",
    slotBooked: "Booked",
    slotBlocked: "Blocked",
    blockSlot: "Block",
    unblockSlot: "Unblock",
    removeLabel: "Remove",
    generatingPreview: "Generating preview...",
    previewBeforeSave: "Preview slots before saving.",
    noAvailabilityConfigured: "No availability configured yet.",
    slotPreviewTitle: "Generated slots preview",
    blockSlotsHint: "Block slots or review bookings for a specific day.",
    businessProfile: "Business profile",
    businessProfileDesc: "Your profile is active on the platform. Manage services, availability, and appointments from this dashboard.",
    verifiedLabel: "Verified",
    activeLabel: "Active",
    inactiveLabel: "Inactive",
    profileCompletionLabel: "Profile completion",
    ratingLabel: "Rating",
    logout: "Logout",
    healthcarePartner: "Healthcare partner",
    verificationGateMessage: "Your doctor profile must be reviewed and activated by the platform admin before you can receive bookings or manage availability.",
    camera: "Camera",
    gallery: "Gallery",
    selectDate: "Select date",
    fillTestLogin: "Fill test doctor login",
    backToVerification: "Back to verification",
    openProfileEditor: "Open profile editor",
    saveProfileBasics: "Save profile basics",
    fileLabel: "File",
    viewDocument: "View",
  },
  pt: {
    doctorDashboardTitle: "Painel do Médico",
    verificationRequired: "Verificação Necessária",
    uploadDocuments: "Carregar Documentos",
    submitForReview: "Enviar para Revisão",
    profileApproved: "O seu perfil foi aprovado.",
    profileRejected: "O seu perfil precisa de atenção.",
    newBooking: "Nova Marcação",
    setAvailability: "Definir Disponibilidade",
    appointments: "Consultas",
    patients: "Pacientes",
    reviews: "Avaliações",
    services: "Serviços",
    profile: "Perfil",
    notifications: "Notificações",
    languageSettings: "Idioma",
    statusDraft: "Rascunho",
    statusPendingReview: "Em Revisão",
    statusApproved: "Aprovado",
    statusRejected: "Rejeitado",
    statusSuspended: "Suspenso",
    underReviewMessage: "O seu perfil está em revisão pelo administrador da plataforma.",
    suspendedMessage: "A sua conta foi suspensa. Contacte o suporte Kudya.",
    verificationProgress: "Progresso da verificação",
    saveAvailability: "Guardar disponibilidade",
    previewSlots: "Pré-visualizar horários",
    availabilitySaved: "Disponibilidade guardada e horários gerados.",
    availabilityFailed: "Falha ao guardar disponibilidade.",
    noAppointments: "Ainda não há consultas.",
    confirmAppointment: "Confirmar",
    cancelAppointment: "Cancelar",
    completeAppointment: "Concluir",
    noShow: "Não compareceu",
    loading: "A carregar...",
    error: "Ocorreu um erro.",
    success: "Sucesso",
    docIdPassport: "Documento de identidade ou passaporte",
    docMedicalLicence: "Licença médica / licença de exercício",
    docQualification: "Certificado de qualificação médica",
    docRegistration: "Certificado de registo profissional",
    docBackgroundConsent: "Consentimento de verificação de antecedentes",
    docOther: "Outro documento de apoio",
    selectDocumentType: "Tipo de documento",
    chooseFile: "Escolher ficheiro",
    adminFeedback: "Feedback do administrador",
    newBookingAlert: "Nova marcação recebida",
    viewAppointments: "Ver consultas",
    weeklyAvailability: "Disponibilidade semanal",
    slotRules: "Consultas de 60 minutos com 10 minutos de intervalo. Um paciente por horário.",
    calendarSlots: "Horários do calendário",
    savedRules: "Regras semanais guardadas",
    noSlotsYet: "Sem horários gerados para esta data.",
    addService: "Adicionar serviço",
    serviceName: "Nome do serviço",
    servicePrice: "Preço",
    emptyPatients: "O histórico de pacientes aparecerá aqui.",
    emptyReviews: "As avaliações aparecerão aqui.",
    preferredLanguage: "Idioma preferido",
    saveProfile: "Guardar perfil",
    profileUpdated: "Perfil atualizado.",
    profileDescription: "Especialidade, bio, qualificações, idiomas e definições de consulta.",
    clinicNameLabel: "Nome da clínica",
    professionalTitleLabel: "Título profissional",
    languagesLabel: "Idiomas",
    licenseNumberLabel: "Número de licença",
    consultationFeeLabel: "Taxa de consulta",
    yearsExperienceLabel: "Anos de experiência",
    biographyLabel: "Biografia",
    onlineConsultation: "Consulta online",
    physicalConsultation: "Consulta presencial",
    addConsultationService: "Adicionar serviço de consulta",
    yourServices: "Os seus serviços",
    noServicesYet: "Ainda não há serviços. Adicione a sua primeira consulta.",
    durationMinutesLabel: "Duração (minutos)",
    deleteLabel: "Eliminar",
    filterAll: "Todos",
    filterToday: "Hoje",
    filterUpcoming: "Próximas",
    filterPending: "Pendentes",
    filterCompleted: "Concluídas",
    filterCancelled: "Canceladas",
    searchPatient: "Pesquisar paciente...",
    noAppointmentsFilter: "Nenhuma consulta encontrada para este filtro.",
    statusLabel: "Estado",
    patientNote: "Nota do paciente",
    appointmentDetails: "Detalhes da consulta",
    todaysAppointments: "Consultas de hoje",
    pendingRequests: "Pedidos pendentes",
    availableSlotsWeek: "Horários disponíveis esta semana",
    monthlyEarnings: "Ganhos mensais",
    recentActivity: "Atividade recente",
    quickActions: "Ações rápidas",
    completeProfileAction: "Completar perfil",
    manageServicesAction: "Gerir serviços",
    reviewAppointmentsAction: "Rever consultas",
    setWeeklyAvailability: "Definir disponibilidade semanal",
    noUpcomingAppointments: "Ainda não há consultas próximas.",
    loadingDashboard: "A carregar painel médico...",
    dashboardLoadError: "Não foi possível carregar o painel médico. Inicie sessão com uma conta médica.",
    signIn: "Iniciar sessão",
    markAllRead: "Marcar tudo como lido",
    unreadCount: "não lidas",
    noNotificationsYet: "Ainda não há notificações.",
    newBookingsSection: "Novas marcações",
    openAction: "Abrir",
    readAction: "Lido",
    slotAvailable: "Disponível",
    slotBooked: "Reservado",
    slotBlocked: "Bloqueado",
    blockSlot: "Bloquear",
    unblockSlot: "Desbloquear",
    removeLabel: "Remover",
    generatingPreview: "A gerar pré-visualização...",
    previewBeforeSave: "Pré-visualize os horários antes de guardar.",
    noAvailabilityConfigured: "Ainda não há disponibilidade configurada.",
    slotPreviewTitle: "Pré-visualização de horários",
    blockSlotsHint: "Bloqueie horários ou reveja marcações para um dia específico.",
    businessProfile: "Perfil comercial",
    businessProfileDesc: "O seu perfil está ativo na plataforma. Gerencie serviços, disponibilidade e consultas neste painel.",
    verifiedLabel: "Verificado",
    activeLabel: "Ativo",
    inactiveLabel: "Inativo",
    profileCompletionLabel: "Conclusão do perfil",
    ratingLabel: "Avaliação",
    logout: "Terminar sessão",
    healthcarePartner: "Parceiro de saúde",
    verificationGateMessage: "O seu perfil médico deve ser revisto e ativado pelo administrador antes de receber marcações.",
    camera: "Câmara",
    gallery: "Galeria",
    selectDate: "Selecionar data",
    fillTestLogin: "Preencher login de teste (médico)",
    backToVerification: "Voltar à verificação",
    openProfileEditor: "Abrir editor de perfil",
    saveProfileBasics: "Guardar dados básicos do perfil",
    fileLabel: "Ficheiro",
    viewDocument: "Ver",
  },
  fr: {
    doctorDashboardTitle: "Tableau de Bord du Médecin",
    verificationRequired: "Vérification Requise",
    uploadDocuments: "Téléverser les Documents",
    submitForReview: "Soumettre pour Vérification",
    profileApproved: "Votre profil a été approuvé.",
    profileRejected: "Votre profil nécessite votre attention.",
    newBooking: "Nouvelle Réservation",
    setAvailability: "Définir la Disponibilité",
    appointments: "Rendez-vous",
    patients: "Patients",
    reviews: "Avis",
    services: "Services",
    profile: "Profil",
    notifications: "Notifications",
    languageSettings: "Langue",
    statusDraft: "Brouillon",
    statusPendingReview: "En Cours de Vérification",
    statusApproved: "Approuvé",
    statusRejected: "Rejeté",
    statusSuspended: "Suspendu",
    underReviewMessage: "Votre profil est en cours de vérification par l'administrateur.",
    suspendedMessage: "Votre compte a été suspendu. Contactez le support Kudya.",
    verificationProgress: "Progression de la vérification",
    saveAvailability: "Enregistrer la disponibilité",
    previewSlots: "Aperçu des créneaux",
    availabilitySaved: "Disponibilité enregistrée et créneaux générés.",
    availabilityFailed: "Échec de l'enregistrement de la disponibilité.",
    noAppointments: "Aucun rendez-vous pour le moment.",
    confirmAppointment: "Confirmer",
    cancelAppointment: "Annuler",
    completeAppointment: "Terminer",
    noShow: "Absent",
    loading: "Chargement...",
    error: "Une erreur s'est produite.",
    success: "Succès",
    docIdPassport: "Pièce d'identité ou passeport",
    docMedicalLicence: "Licence médicale / licence d'exercice",
    docQualification: "Certificat de qualification médicale",
    docRegistration: "Certificat d'enregistrement professionnel",
    docBackgroundConsent: "Consentement de vérification des antécédents",
    docOther: "Autre document justificatif",
    selectDocumentType: "Type de document",
    chooseFile: "Choisir un fichier",
    adminFeedback: "Retour administrateur",
    newBookingAlert: "Nouvelle réservation reçue",
    viewAppointments: "Voir les rendez-vous",
    weeklyAvailability: "Disponibilité hebdomadaire",
    slotRules: "Consultations de 60 minutes avec 10 minutes de pause. Un patient par créneau.",
    calendarSlots: "Créneaux du calendrier",
    savedRules: "Règles hebdomadaires enregistrées",
    noSlotsYet: "Aucun créneau généré pour cette date.",
    addService: "Ajouter un service",
    serviceName: "Nom du service",
    servicePrice: "Prix",
    emptyPatients: "L'historique des patients apparaîtra ici.",
    emptyReviews: "Les avis apparaîtront ici.",
    preferredLanguage: "Langue préférée",
    saveProfile: "Enregistrer le profil",
    profileUpdated: "Profil mis à jour.",
    profileDescription: "Spécialité, bio, qualifications, langues et paramètres de consultation.",
    clinicNameLabel: "Nom de la clinique",
    professionalTitleLabel: "Titre professionnel",
    languagesLabel: "Langues",
    licenseNumberLabel: "Numéro de licence",
    consultationFeeLabel: "Frais de consultation",
    yearsExperienceLabel: "Années d'expérience",
    biographyLabel: "Biographie",
    onlineConsultation: "Consultation en ligne",
    physicalConsultation: "Consultation physique",
    addConsultationService: "Ajouter un service de consultation",
    yourServices: "Vos services",
    noServicesYet: "Aucun service pour le moment. Ajoutez votre première consultation.",
    durationMinutesLabel: "Durée (minutes)",
    deleteLabel: "Supprimer",
    filterAll: "Tous",
    filterToday: "Aujourd'hui",
    filterUpcoming: "À venir",
    filterPending: "En attente",
    filterCompleted: "Terminés",
    filterCancelled: "Annulés",
    searchPatient: "Rechercher un patient...",
    noAppointmentsFilter: "Aucun rendez-vous trouvé pour ce filtre.",
    statusLabel: "Statut",
    patientNote: "Note du patient",
    appointmentDetails: "Détails du rendez-vous",
    todaysAppointments: "Rendez-vous du jour",
    pendingRequests: "Demandes en attente",
    availableSlotsWeek: "Créneaux disponibles cette semaine",
    monthlyEarnings: "Revenus mensuels",
    recentActivity: "Activité récente",
    quickActions: "Actions rapides",
    completeProfileAction: "Compléter le profil",
    manageServicesAction: "Gérer les services",
    reviewAppointmentsAction: "Voir les rendez-vous",
    setWeeklyAvailability: "Définir la disponibilité hebdomadaire",
    noUpcomingAppointments: "Aucun rendez-vous à venir.",
    loadingDashboard: "Chargement du tableau de bord...",
    dashboardLoadError: "Impossible de charger le tableau de bord médecin. Connectez-vous avec un compte médecin.",
    signIn: "Se connecter",
    markAllRead: "Tout marquer comme lu",
    unreadCount: "non lus",
    noNotificationsYet: "Aucune notification pour le moment.",
    newBookingsSection: "Nouvelles réservations",
    openAction: "Ouvrir",
    readAction: "Lu",
    slotAvailable: "Disponible",
    slotBooked: "Réservé",
    slotBlocked: "Bloqué",
    blockSlot: "Bloquer",
    unblockSlot: "Débloquer",
    removeLabel: "Retirer",
    generatingPreview: "Génération de l'aperçu...",
    previewBeforeSave: "Aperçu des créneaux avant enregistrement.",
    noAvailabilityConfigured: "Aucune disponibilité configurée.",
    slotPreviewTitle: "Aperçu des créneaux générés",
    blockSlotsHint: "Bloquez des créneaux ou consultez les réservations pour un jour donné.",
    businessProfile: "Profil professionnel",
    businessProfileDesc: "Votre profil est actif sur la plateforme. Gérez services, disponibilité et rendez-vous ici.",
    verifiedLabel: "Vérifié",
    activeLabel: "Actif",
    inactiveLabel: "Inactif",
    profileCompletionLabel: "Complétion du profil",
    ratingLabel: "Note",
    logout: "Déconnexion",
    healthcarePartner: "Partenaire santé",
    verificationGateMessage: "Votre profil médecin doit être vérifié et activé par l'administrateur avant de recevoir des rendez-vous.",
    camera: "Caméra",
    gallery: "Galerie",
    selectDate: "Sélectionner la date",
    fillTestLogin: "Remplir connexion test (médecin)",
    backToVerification: "Retour à la vérification",
    openProfileEditor: "Ouvrir l'éditeur de profil",
    saveProfileBasics: "Enregistrer les bases du profil",
    fileLabel: "Fichier",
    viewDocument: "Voir",
  },
  es: {
    doctorDashboardTitle: "Panel del Médico",
    verificationRequired: "Verificación Requerida",
    uploadDocuments: "Subir Documentos",
    submitForReview: "Enviar para Revisión",
    profileApproved: "Su perfil ha sido aprobado.",
    profileRejected: "Su perfil necesita atención.",
    newBooking: "Nueva Reserva",
    setAvailability: "Configurar Disponibilidad",
    appointments: "Citas",
    patients: "Pacientes",
    reviews: "Reseñas",
    services: "Servicios",
    profile: "Perfil",
    notifications: "Notificaciones",
    languageSettings: "Idioma",
    statusDraft: "Borrador",
    statusPendingReview: "En Revisión",
    statusApproved: "Aprobado",
    statusRejected: "Rechazado",
    statusSuspended: "Suspendido",
    underReviewMessage: "Su perfil está en revisión por el administrador de la plataforma.",
    suspendedMessage: "Su cuenta ha sido suspendida. Contacte al soporte Kudya.",
    verificationProgress: "Progreso de verificación",
    saveAvailability: "Guardar disponibilidad",
    previewSlots: "Vista previa de horarios",
    availabilitySaved: "Disponibilidad guardada y horarios generados.",
    availabilityFailed: "Error al guardar disponibilidad.",
    noAppointments: "Aún no hay citas.",
    confirmAppointment: "Confirmar",
    cancelAppointment: "Cancelar",
    completeAppointment: "Completar",
    noShow: "No asistió",
    loading: "Cargando...",
    error: "Algo salió mal.",
    success: "Éxito",
    docIdPassport: "Documento de identidad o pasaporte",
    docMedicalLicence: "Licencia médica / licencia de práctica",
    docQualification: "Certificado de calificación médica",
    docRegistration: "Certificado de registro profesional",
    docBackgroundConsent: "Consentimiento de verificación de antecedentes",
    docOther: "Otro documento de apoyo",
    selectDocumentType: "Tipo de documento",
    chooseFile: "Elegir archivo",
    adminFeedback: "Comentarios del administrador",
    newBookingAlert: "Nueva reserva recibida",
    viewAppointments: "Ver citas",
    weeklyAvailability: "Disponibilidad semanal",
    slotRules: "Consultas de 60 minutos con 10 minutos de descanso. Un paciente por horario.",
    calendarSlots: "Horarios del calendario",
    savedRules: "Reglas semanales guardadas",
    noSlotsYet: "No hay horarios generados para esta fecha.",
    addService: "Agregar servicio",
    serviceName: "Nombre del servicio",
    servicePrice: "Precio",
    emptyPatients: "El historial de pacientes aparecerá aquí.",
    emptyReviews: "Las reseñas aparecerán aquí.",
    preferredLanguage: "Idioma preferido",
    saveProfile: "Guardar perfil",
    profileUpdated: "Perfil actualizado.",
    profileDescription: "Especialidad, bio, calificaciones, idiomas y ajustes de consulta.",
    clinicNameLabel: "Nombre de la clínica",
    professionalTitleLabel: "Título profesional",
    languagesLabel: "Idiomas",
    licenseNumberLabel: "Número de licencia",
    consultationFeeLabel: "Tarifa de consulta",
    yearsExperienceLabel: "Años de experiencia",
    biographyLabel: "Biografía",
    onlineConsultation: "Consulta en línea",
    physicalConsultation: "Consulta presencial",
    addConsultationService: "Agregar servicio de consulta",
    yourServices: "Sus servicios",
    noServicesYet: "Aún no hay servicios. Agregue su primera consulta.",
    durationMinutesLabel: "Duración (minutos)",
    deleteLabel: "Eliminar",
    filterAll: "Todos",
    filterToday: "Hoy",
    filterUpcoming: "Próximas",
    filterPending: "Pendientes",
    filterCompleted: "Completadas",
    filterCancelled: "Canceladas",
    searchPatient: "Buscar paciente...",
    noAppointmentsFilter: "No se encontraron citas para este filtro.",
    statusLabel: "Estado",
    patientNote: "Nota del paciente",
    appointmentDetails: "Detalles de la cita",
    todaysAppointments: "Citas de hoy",
    pendingRequests: "Solicitudes pendientes",
    availableSlotsWeek: "Horarios disponibles esta semana",
    monthlyEarnings: "Ingresos mensuales",
    recentActivity: "Actividad reciente",
    quickActions: "Acciones rápidas",
    completeProfileAction: "Completar perfil",
    manageServicesAction: "Gestionar servicios",
    reviewAppointmentsAction: "Revisar citas",
    setWeeklyAvailability: "Configurar disponibilidad semanal",
    noUpcomingAppointments: "Aún no hay citas próximas.",
    loadingDashboard: "Cargando panel médico...",
    dashboardLoadError: "No se pudo cargar el panel médico. Inicie sesión con una cuenta médica.",
    signIn: "Iniciar sesión",
    markAllRead: "Marcar todo como leído",
    unreadCount: "no leídas",
    noNotificationsYet: "Aún no hay notificaciones.",
    newBookingsSection: "Nuevas reservas",
    openAction: "Abrir",
    readAction: "Leído",
    slotAvailable: "Disponible",
    slotBooked: "Reservado",
    slotBlocked: "Bloqueado",
    blockSlot: "Bloquear",
    unblockSlot: "Desbloquear",
    removeLabel: "Eliminar",
    generatingPreview: "Generando vista previa...",
    previewBeforeSave: "Vista previa de horarios antes de guardar.",
    noAvailabilityConfigured: "Aún no hay disponibilidad configurada.",
    slotPreviewTitle: "Vista previa de horarios generados",
    blockSlotsHint: "Bloquee horarios o revise reservas para un día específico.",
    businessProfile: "Perfil comercial",
    businessProfileDesc: "Su perfil está activo en la plataforma. Gestione servicios, disponibilidad y citas desde este panel.",
    verifiedLabel: "Verificado",
    activeLabel: "Activo",
    inactiveLabel: "Inactivo",
    profileCompletionLabel: "Completitud del perfil",
    ratingLabel: "Calificación",
    logout: "Cerrar sesión",
    healthcarePartner: "Socio de salud",
    verificationGateMessage: "Su perfil médico debe ser revisado y activado por el administrador antes de recibir reservas.",
    camera: "Cámara",
    gallery: "Galería",
    selectDate: "Seleccionar fecha",
    fillTestLogin: "Rellenar login de prueba (médico)",
    backToVerification: "Volver a verificación",
    openProfileEditor: "Abrir editor de perfil",
    saveProfileBasics: "Guardar datos básicos del perfil",
    fileLabel: "Archivo",
    viewDocument: "Ver",
  },
};

export default doctorTranslations;

export function doctorT(key: DoctorTranslationKey, locale: SupportedLocale): string {
  return doctorTranslations[locale]?.[key] ?? doctorTranslations.en[key] ?? key;
}

export function verificationStatusLabel(status: string, locale: SupportedLocale): string {
  const map: Record<string, DoctorTranslationKey> = {
    draft: "statusDraft",
    pending_review: "statusPendingReview",
    approved: "statusApproved",
    rejected: "statusRejected",
    suspended: "statusSuspended",
  };
  const translationKey = map[status];
  return translationKey ? doctorT(translationKey, locale) : status;
}
