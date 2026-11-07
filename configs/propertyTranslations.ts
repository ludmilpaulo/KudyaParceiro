import type { SupportedLocale } from "./translations";

export type PropertyTranslationKey =
  | "propertyDashboardTitle"
  | "propertyBrand"
  | "listings"
  | "enquiries"
  | "profile"
  | "logout"
  | "languageSettings"
  | "loadingDashboard"
  | "dashboardLoadError"
  | "totalListings"
  | "activeListings"
  | "approvedListings"
  | "pendingListings"
  | "pendingEnquiries"
  | "recentEnquiries"
  | "noListings"
  | "noEnquiries"
  | "addListing"
  | "cancel"
  | "fillAllFields"
  | "listingTitle"
  | "listingCity"
  | "listingAddress"
  | "listingPrice"
  | "listingType"
  | "saveListing"
  | "createListing"
  | "listingSaved"
  | "listingFailed"
  | "toggleAvailability"
  | "available"
  | "unavailable"
  | "approved"
  | "pending"
  | "rejected"
  | "viewEnquiries"
  | "respond"
  | "markResponded"
  | "markScheduled"
  | "markClosed"
  | "enquiryUpdated"
  | "quickActions"
  | "manageListings"
  | "reviewEnquiries"
  | "listingTypeRentDaily"
  | "listingTypeRentMonthly"
  | "listingTypeBuy"
  | "enquiryTypeGeneral"
  | "enquiryTypeViewing"
  | "enquiryTypeOffer"
  | "enquiryTypeRentalApplication"
  | "statusPending"
  | "statusResponded"
  | "statusScheduled"
  | "statusApproved"
  | "statusRejected"
  | "statusClosed"
  | "approvalPending"
  | "approvalApproved"
  | "approvalRejected"
  | "approvalSuspended"
  | "overview"
  | "analyticsTitle"
  | "enquiriesTrend"
  | "listingsByType"
  | "enquiriesByStatus"
  | "listingsByApproval"
  | "noAnalyticsData"
  | "last7Days"
  | "days30"
  | "days90"
  | "topListingsByEnquiries"
  | "vsPreviousPeriod"
  | "comparisonTitle"
  | "exportCsv"
  | "exportPdf"
  | "listingsCreated"
  | "enquiriesMetric"
  | "listingDescription"
  | "bedroomsLabel"
  | "bathroomsLabel"
  | "propertyTypeLabel"
  | "addFirstListing"
  | "createListingHint"
  | "addPhotos"
  | "addVideo"
  | "photosSelected"
  | "videoSelected"
  | "removeMedia"
  | "mediaHint"
  | "hasVideo"
  | "photoCount"
  | "properties"
  | "addProperty"
  | "managePropertiesSubtitle"
  | "goodMorning"
  | "goodAfternoon"
  | "goodEvening"
  | "dashboardGreetingSubtitle"
  | "helloLandlord"
  | "landlordHomeSubtitle"
  | "pillProperties"
  | "pillBookings"
  | "pillLeases"
  | "pillMessages"
  | "menuListProperty"
  | "menuBookings"
  | "menuLeases"
  | "menuRequests"
  | "menuCalendar"
  | "menuAnalytics"
  | "languageAutomatic"
  | "languagePreviewLine"
  | "propertyOverview"
  | "totalProperties"
  | "activeProperties"
  | "pendingReview"
  | "needsAttention"
  | "ofListings"
  | "statusActive"
  | "statusPendingReview"
  | "statusDraft"
  | "statusInactive"
  | "statusChangesRequired"
  | "statusSuspended"
  | "tabAll"
  | "tabActive"
  | "tabPending"
  | "tabDraft"
  | "tabInactive"
  | "searchProperties"
  | "purposeRent"
  | "purposeStay"
  | "purposeSale"
  | "purposeAll"
  | "manageProperty"
  | "pauseListing"
  | "activateListing"
  | "perDayShort"
  | "perMonthShort"
  | "emptyPropertiesTitle"
  | "emptyPropertiesSubtitle"
  | "tryAgain"
  | "continueListing"
  | "savedAutomatically"
  | "wizardStepOf"
  | "wizardPurposeTitle"
  | "wizardPurposeSubtitle"
  | "wizardTypeTitle"
  | "wizardDetailsTitle"
  | "wizardLocationTitle"
  | "wizardPricingTitle"
  | "wizardPhotosTitle"
  | "wizardReviewTitle"
  | "nextStep"
  | "backStep"
  | "submitForApproval"
  | "saveDraft"
  | "suburbLabel"
  | "parkingSpaces"
  | "areaLabel"
  | "furnished"
  | "amenities"
  | "depositLabel"
  | "currencyLabel"
  | "coverPhoto"
  | "reviewSummary"
  | "whatAreYouListing"
  | "enquiriesInbox"
  | "enquiryTabAll"
  | "enquiryTabNew"
  | "enquiryTabResponded"
  | "enquiryTabClosed"
  | "emptyEnquiriesTitle"
  | "emptyEnquiriesSubtitle"
  | "attentionBanner"
  | "viewPending"
  | "analytics"
  | "sortNewest"
  | "filterPurpose"
  | "noMatchFilters"
  | "clearFilters"
  | "listingSubmitted"
  | "applications"
  | "applicationsSubtitle"
  | "applicationTabAll"
  | "applicationTabNew"
  | "applicationTabReviewing"
  | "applicationTabApproved"
  | "applicationTabRejected"
  | "applicationsLoadError"
  | "emptyApplicationsTitle"
  | "emptyApplicationsSubtitle"
  | "applicationRentNotProvided"
  | "applicationDetails"
  | "applicationLoadError"
  | "applicationApplicant"
  | "applicationName"
  | "applicationEmail"
  | "applicationPhone"
  | "applicationEmployment"
  | "applicationAddress"
  | "applicationOccupants"
  | "applicationAdults"
  | "applicationChildren"
  | "applicationRental"
  | "applicationMoveIn"
  | "applicationPeriod"
  | "applicationRent"
  | "applicationDeposit"
  | "applicationStartReview"
  | "applicationReviewStarted"
  | "applicationDecision"
  | "applicationProposedRent"
  | "applicationProposedDeposit"
  | "applicationSpecialConditions"
  | "applicationApprove"
  | "applicationApproved"
  | "applicationRejectionReason"
  | "applicationReject"
  | "applicationRejected"
  | "applicationViewings"
  | "applicationViewing"
  | "applicationCompleteViewing"
  | "applicationViewingCompleted"
  | "applicationViewingDateHint"
  | "applicationViewingLocation"
  | "applicationViewingNotes"
  | "applicationProposeViewing"
  | "applicationViewingProposed"
  | "applicationDocuments"
  | "applicationNoDocuments"
  | "applicationVerifyDocument"
  | "applicationDocumentVerified"
  | "applicationDocumentReason"
  | "applicationRejectDocument"
  | "applicationDocumentRejected"
  | "applicationLease"
  | "applicationGenerateLease"
  | "applicationLeaseGenerated"
  | "applicationSignatureName"
  | "applicationSignLease"
  | "applicationLeaseSigned"
  | "applicationActionFailed"
  | "stayBookings"
  | "stayBookingsSubtitle"
  | "stayBookingsLoadError"
  | "stayBookingsToday"
  | "stayBookingsUpcoming"
  | "stayBookingsThisMonth"
  | "emptyStayBookingsTitle"
  | "emptyStayBookingsSubtitle"
  | "stayNights"
  | "stayAdults"
  | "stayChildren"
  | "availability"
  | "availabilitySubtitle"
  | "availabilityLoadError"
  | "selectStayListing"
  | "noStayListingsTitle"
  | "noStayListingsSubtitle"
  | "blockDates"
  | "blockReason"
  | "blockedDatesList"
  | "noBlockedDates"
  | "unblockDates"
  | "stayBlockCreated"
  | "stayBlockFailed"
  | "stayBlockInvalidRange"
  | "stayStatusAvailable"
  | "stayStatusBlocked"
  | "stayStatusBooked"
  | "stayStatusPending"
  | "manageStayAvailability"
  | "nightlyPriceLabel"
  | "monthlyRentLabel"
  | "weekendPriceLabel"
  | "cleaningFeeLabel"
  | "minNightsLabel"
  | "maxGuestsLabel"
  | "allowedLeaseMonthsLabel"
  | "monthsChip";

type PropertyTranslationMap = Record<PropertyTranslationKey, string>;

const en: PropertyTranslationMap = {
  propertyDashboardTitle: "Property Dashboard",
  propertyBrand: "Kudya Property",
  listings: "Listings",
  enquiries: "Enquiries",
  profile: "Profile",
  logout: "Log out",
  languageSettings: "Language",
  loadingDashboard: "Loading dashboard…",
  dashboardLoadError: "Could not load property dashboard.",
  totalListings: "Total listings",
  activeListings: "Active listings",
  approvedListings: "Approved listings",
  pendingListings: "Pending approval",
  pendingEnquiries: "Pending enquiries",
  recentEnquiries: "Recent enquiries",
  noListings: "No property listings yet.",
  noEnquiries: "No enquiries yet.",
  addListing: "Add listing",
  cancel: "Cancel",
  fillAllFields: "Please fill in all required fields.",
  listingTitle: "Title",
  listingCity: "City",
  listingAddress: "Address",
  listingPrice: "Price",
  listingType: "Listing type",
  saveListing: "Save listing",
  createListing: "Create listing",
  listingSaved: "Listing saved.",
  listingFailed: "Could not save listing.",
  toggleAvailability: "Toggle availability",
  available: "Available",
  unavailable: "Unavailable",
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
  viewEnquiries: "View enquiries",
  respond: "Respond",
  markResponded: "Mark responded",
  markScheduled: "Schedule viewing",
  markClosed: "Close enquiry",
  enquiryUpdated: "Enquiry updated.",
  quickActions: "Quick actions",
  manageListings: "Manage listings",
  reviewEnquiries: "Review enquiries",
  listingTypeRentDaily: "Rent per day",
  listingTypeRentMonthly: "Rent per month",
  listingTypeBuy: "For sale",
  enquiryTypeGeneral: "General enquiry",
  enquiryTypeViewing: "Viewing request",
  enquiryTypeOffer: "Offer interest",
  enquiryTypeRentalApplication: "Rental application",
  statusPending: "Pending",
  statusResponded: "Responded",
  statusScheduled: "Viewing scheduled",
  statusApproved: "Approved",
  statusRejected: "Rejected",
  statusClosed: "Closed",
  approvalPending: "Pending approval",
  approvalApproved: "Approved",
  approvalRejected: "Rejected",
  approvalSuspended: "Suspended",
  overview: "Overview",
  analyticsTitle: "Analytics",
  enquiriesTrend: "Enquiries (last 7 days)",
  listingsByType: "Listings by type",
  enquiriesByStatus: "Enquiries by status",
  listingsByApproval: "Listings by approval",
  noAnalyticsData: "No activity yet — charts will appear once you have listings or enquiries.",
  last7Days: "Last 7 days",
  days30: "Last 30 days",
  days90: "Last 90 days",
  topListingsByEnquiries: "Top listings by enquiries",
  vsPreviousPeriod: "Compared with previous period",
  comparisonTitle: "Period comparison",
  exportCsv: "Export CSV",
  exportPdf: "Export PDF",
  listingsCreated: "Listings created",
  enquiriesMetric: "Enquiries",
  listingDescription: "Description",
  bedroomsLabel: "Bedrooms",
  bathroomsLabel: "Bathrooms",
  propertyTypeLabel: "Property type",
  addFirstListing: "Add your first listing",
  createListingHint: "Fill in the details below to publish a new property listing.",
  addPhotos: "Add photos",
  addVideo: "Add video",
  photosSelected: "photos selected",
  videoSelected: "Video selected",
  removeMedia: "Remove",
  mediaHint: "Add up to 12 photos (JPG/PNG) and one video (MP4/MOV, max 50MB).",
  hasVideo: "Has video",
  photoCount: "photos",
  properties: "Properties",
  addProperty: "Add Property",
  managePropertiesSubtitle: "Manage your properties, listings and availability.",
  goodMorning: "Good morning",
  goodAfternoon: "Good afternoon",
  goodEvening: "Good evening",
  dashboardGreetingSubtitle: "Manage your properties and enquiries.",
  helloLandlord: "Hello, {name}",
  landlordHomeSubtitle: "Manage your properties, bookings and leases.",
  pillProperties: "Properties",
  pillBookings: "Bookings",
  pillLeases: "Leases",
  pillMessages: "Messages",
  menuListProperty: "List a property",
  menuBookings: "Bookings (short-term)",
  menuLeases: "Leases (long-term)",
  menuRequests: "Tenants and requests",
  menuCalendar: "Availability",
  menuAnalytics: "Analytics",
  languageAutomatic: "Automatic",
  languagePreviewLine: "Find your next home",
  propertyOverview: "Property overview",
  totalProperties: "Total properties",
  activeProperties: "Active",
  pendingReview: "Pending review",
  needsAttention: "Needs attention",
  ofListings: "of listings",
  statusActive: "Active",
  statusPendingReview: "Pending review",
  statusDraft: "Draft",
  statusInactive: "Inactive",
  statusChangesRequired: "Changes required",
  statusSuspended: "Suspended",
  tabAll: "All",
  tabActive: "Active",
  tabPending: "Pending",
  tabDraft: "Draft",
  tabInactive: "Inactive",
  searchProperties: "Search properties…",
  purposeRent: "Rent",
  purposeStay: "Stay",
  purposeSale: "Sale",
  purposeAll: "All",
  manageProperty: "Manage property",
  pauseListing: "Pause listing",
  activateListing: "Activate",
  perDayShort: "day",
  perMonthShort: "month",
  emptyPropertiesTitle: "No properties yet",
  emptyPropertiesSubtitle: "Start by adding your first property and reach customers on Kudya.",
  tryAgain: "Try again",
  continueListing: "Continue listing",
  savedAutomatically: "Saved automatically",
  wizardStepOf: "Step {{current}} of {{total}}",
  wizardPurposeTitle: "What are you listing?",
  wizardPurposeSubtitle: "Choose how customers will find this property.",
  wizardTypeTitle: "Property type",
  wizardDetailsTitle: "Basic information",
  wizardLocationTitle: "Location",
  wizardPricingTitle: "Pricing",
  wizardPhotosTitle: "Photos & amenities",
  wizardReviewTitle: "Review listing",
  nextStep: "Continue",
  backStep: "Back",
  submitForApproval: "Submit for approval",
  saveDraft: "Save draft",
  suburbLabel: "Suburb / neighbourhood",
  parkingSpaces: "Parking spaces",
  areaLabel: "Area (m²)",
  furnished: "Furnished",
  amenities: "Amenities",
  depositLabel: "Deposit",
  currencyLabel: "Currency",
  coverPhoto: "Cover",
  reviewSummary: "Review your details before submitting.",
  whatAreYouListing: "What are you listing?",
  enquiriesInbox: "Enquiries",
  enquiryTabAll: "All",
  enquiryTabNew: "New",
  enquiryTabResponded: "Responded",
  enquiryTabClosed: "Closed",
  emptyEnquiriesTitle: "No enquiries yet",
  emptyEnquiriesSubtitle: "When customers contact you, their messages will appear here.",
  attentionBanner: "You have listings that need attention",
  viewPending: "View pending",
  analytics: "Analytics",
  sortNewest: "Recently added",
  filterPurpose: "Purpose",
  noMatchFilters: "No properties match these filters.",
  clearFilters: "Clear filters",
  listingSubmitted: "Listing submitted for approval.",
  applications: "Applications",
  applicationsSubtitle: "Review rental applications and manage the next steps.",
  applicationTabAll: "All",
  applicationTabNew: "New",
  applicationTabReviewing: "Reviewing",
  applicationTabApproved: "Approved",
  applicationTabRejected: "Rejected",
  applicationsLoadError: "Could not load applications.",
  emptyApplicationsTitle: "No applications yet",
  emptyApplicationsSubtitle: "New rental applications will appear here.",
  applicationRentNotProvided: "Rent not provided",
  applicationDetails: "Application details",
  applicationLoadError: "Could not load this application.",
  applicationApplicant: "Applicant",
  applicationName: "Name",
  applicationEmail: "Email",
  applicationPhone: "Phone",
  applicationEmployment: "Employment",
  applicationAddress: "Address",
  applicationOccupants: "Occupants",
  applicationAdults: "adults",
  applicationChildren: "children",
  applicationRental: "Rental details",
  applicationMoveIn: "Move-in date",
  applicationPeriod: "Rental period (months)",
  applicationRent: "Proposed rent",
  applicationDeposit: "Proposed deposit",
  applicationStartReview: "Start review",
  applicationReviewStarted: "Application moved to review.",
  applicationDecision: "Decision",
  applicationProposedRent: "Proposed rent",
  applicationProposedDeposit: "Proposed deposit",
  applicationSpecialConditions: "Special conditions",
  applicationApprove: "Approve application",
  applicationApproved: "Application approved.",
  applicationRejectionReason: "Reason for rejection",
  applicationReject: "Reject application",
  applicationRejected: "Application rejected.",
  applicationViewings: "Viewings",
  applicationViewing: "Viewing",
  applicationCompleteViewing: "Complete viewing",
  applicationViewingCompleted: "Viewing completed.",
  applicationViewingDateHint: "Scheduled date and time (ISO 8601)",
  applicationViewingLocation: "Viewing location",
  applicationViewingNotes: "Notes (optional)",
  applicationProposeViewing: "Propose viewing",
  applicationViewingProposed: "Viewing proposed.",
  applicationDocuments: "Documents",
  applicationNoDocuments: "No documents have been uploaded.",
  applicationVerifyDocument: "Verify document",
  applicationDocumentVerified: "Document verified.",
  applicationDocumentReason: "Reason for rejection",
  applicationRejectDocument: "Reject document",
  applicationDocumentRejected: "Document rejected.",
  applicationLease: "Lease",
  applicationGenerateLease: "Generate lease",
  applicationLeaseGenerated: "Lease generated.",
  applicationSignatureName: "Full name for signature",
  applicationSignLease: "Sign lease",
  applicationLeaseSigned: "Lease signed.",
  applicationActionFailed: "Could not complete this action.",
  stayBookings: "Stay bookings",
  stayBookingsSubtitle: "Guest reservations for your short-stay listings.",
  stayBookingsLoadError: "Could not load stay bookings.",
  stayBookingsToday: "Check-ins today",
  stayBookingsUpcoming: "Upcoming",
  stayBookingsThisMonth: "This month",
  emptyStayBookingsTitle: "No stay bookings yet",
  emptyStayBookingsSubtitle: "Confirmed and pending guest stays will appear here.",
  stayNights: "nights",
  stayAdults: "adults",
  stayChildren: "children",
  availability: "Availability",
  availabilitySubtitle: "View calendar and block dates for stay listings.",
  availabilityLoadError: "Could not load availability.",
  selectStayListing: "Select stay listing",
  noStayListingsTitle: "No stay listings",
  noStayListingsSubtitle: "Create a stay listing to manage availability.",
  blockDates: "Block dates",
  blockReason: "Reason (optional)",
  blockedDatesList: "Blocked dates",
  noBlockedDates: "No blocked date ranges.",
  unblockDates: "Unblock",
  stayBlockCreated: "Dates blocked.",
  stayBlockFailed: "Could not update blocked dates.",
  stayBlockInvalidRange: "End date must be on or after start date.",
  stayStatusAvailable: "Available",
  stayStatusBlocked: "Blocked",
  stayStatusBooked: "Booked",
  stayStatusPending: "Hold",
  manageStayAvailability: "Calendar",
  nightlyPriceLabel: "Price per night",
  monthlyRentLabel: "Monthly rent",
  weekendPriceLabel: "Weekend nightly price (optional)",
  cleaningFeeLabel: "Cleaning fee (optional)",
  minNightsLabel: "Minimum nights",
  maxGuestsLabel: "Maximum guests",
  allowedLeaseMonthsLabel: "Allowed lease terms",
  monthsChip: "{{n}} months",
};

const pt: PropertyTranslationMap = {
  ...en,
  propertyDashboardTitle: "Painel de Imóveis",
  propertyBrand: "Kudya Imóveis",
  listings: "Anúncios",
  enquiries: "Pedidos",
  profile: "Perfil",
  logout: "Sair",
  languageSettings: "Idioma",
  loadingDashboard: "A carregar painel…",
  dashboardLoadError: "Não foi possível carregar o painel de imóveis.",
  totalListings: "Total de anúncios",
  activeListings: "Anúncios activos",
  approvedListings: "Anúncios aprovados",
  pendingListings: "Aguardando aprovação",
  pendingEnquiries: "Pedidos pendentes",
  recentEnquiries: "Pedidos recentes",
  noListings: "Ainda não há anúncios.",
  noEnquiries: "Ainda não há pedidos.",
  addListing: "Adicionar anúncio",
  cancel: "Cancelar",
  fillAllFields: "Por favor, preencha todos os campos obrigatórios.",
  listingTitle: "Título",
  listingCity: "Cidade",
  listingAddress: "Morada",
  listingPrice: "Preço",
  listingType: "Tipo de anúncio",
  saveListing: "Guardar anúncio",
  createListing: "Criar anúncio",
  listingSaved: "Anúncio guardado.",
  listingFailed: "Não foi possível guardar o anúncio.",
  toggleAvailability: "Alternar disponibilidade",
  available: "Disponível",
  unavailable: "Indisponível",
  approved: "Aprovado",
  pending: "Pendente",
  rejected: "Rejeitado",
  viewEnquiries: "Ver pedidos",
  respond: "Responder",
  markResponded: "Marcar respondido",
  markScheduled: "Agendar visita",
  markClosed: "Fechar pedido",
  enquiryUpdated: "Pedido actualizado.",
  quickActions: "Acções rápidas",
  manageListings: "Gerir anúncios",
  reviewEnquiries: "Rever pedidos",
  listingTypeRentDaily: "Arrendamento diário",
  listingTypeRentMonthly: "Arrendamento mensal",
  listingTypeBuy: "Venda",
  enquiryTypeGeneral: "Pedido geral",
  enquiryTypeViewing: "Pedido de visita",
  enquiryTypeOffer: "Interesse em compra",
  enquiryTypeRentalApplication: "Candidatura de arrendamento",
  statusPending: "Pendente",
  statusResponded: "Respondido",
  statusScheduled: "Visita agendada",
  statusApproved: "Aprovado",
  statusRejected: "Rejeitado",
  statusClosed: "Fechado",
  approvalPending: "Aguardando aprovação",
  approvalApproved: "Aprovado",
  approvalRejected: "Rejeitado",
  approvalSuspended: "Suspenso",
  overview: "Visão geral",
  analyticsTitle: "Análises",
  enquiriesTrend: "Pedidos (últimos 7 dias)",
  listingsByType: "Anúncios por tipo",
  enquiriesByStatus: "Pedidos por estado",
  listingsByApproval: "Anúncios por aprovação",
  noAnalyticsData: "Ainda sem actividade — os gráficos aparecerão quando houver anúncios ou pedidos.",
  last7Days: "Últimos 7 dias",
  days30: "Últimos 30 dias",
  days90: "Últimos 90 dias",
  topListingsByEnquiries: "Anúncios com mais pedidos",
  vsPreviousPeriod: "Comparado com o período anterior",
  comparisonTitle: "Comparação do período",
  exportCsv: "Exportar CSV",
  exportPdf: "Exportar PDF",
  listingsCreated: "Anúncios criados",
  enquiriesMetric: "Pedidos",
  listingDescription: "Descrição",
  bedroomsLabel: "Quartos",
  bathroomsLabel: "Casas de banho",
  propertyTypeLabel: "Tipo de imóvel",
  addFirstListing: "Adicionar o primeiro anúncio",
  createListingHint: "Preencha os detalhes abaixo para publicar um novo anúncio.",
  addPhotos: "Adicionar fotos",
  addVideo: "Adicionar vídeo",
  photosSelected: "fotos selecionadas",
  videoSelected: "Vídeo selecionado",
  removeMedia: "Remover",
  mediaHint: "Adicione até 12 fotos (JPG/PNG) e um vídeo (MP4/MOV, máx. 50MB).",
  hasVideo: "Tem vídeo",
  photoCount: "fotos",
  properties: "Propriedades",
  addProperty: "Adicionar propriedade",
  managePropertiesSubtitle: "Gira as suas propriedades, anúncios e disponibilidade.",
  goodMorning: "Bom dia",
  goodAfternoon: "Boa tarde",
  goodEvening: "Boa noite",
  dashboardGreetingSubtitle: "Gira as suas propriedades e pedidos.",
  helloLandlord: "Olá, {name}",
  landlordHomeSubtitle: "Gira propriedades, reservas e contratos.",
  pillProperties: "Propriedades",
  pillBookings: "Reservas",
  pillLeases: "Contratos",
  pillMessages: "Mensagens",
  menuListProperty: "Anunciar propriedade",
  menuBookings: "Reservas (curta duração)",
  menuLeases: "Contratos (longa duração)",
  menuRequests: "Inquilinos e pedidos",
  menuCalendar: "Disponibilidade",
  menuAnalytics: "Análises",
  languageAutomatic: "Automático",
  languagePreviewLine: "Encontre a sua próxima casa",
  propertyOverview: "Visão geral",
  totalProperties: "Total de propriedades",
  activeProperties: "Activas",
  pendingReview: "Em análise",
  needsAttention: "Precisa de atenção",
  ofListings: "dos anúncios",
  statusActive: "Activo",
  statusPendingReview: "Em análise",
  statusDraft: "Rascunho",
  statusInactive: "Inactivo",
  statusChangesRequired: "Alterações necessárias",
  statusSuspended: "Suspenso",
  tabAll: "Todos",
  tabActive: "Activos",
  tabPending: "Pendentes",
  tabDraft: "Rascunhos",
  tabInactive: "Inactivos",
  searchProperties: "Pesquisar propriedades…",
  purposeRent: "Arrendar",
  purposeStay: "Estadia",
  purposeSale: "Venda",
  purposeAll: "Todos",
  manageProperty: "Gerir propriedade",
  pauseListing: "Pausar anúncio",
  activateListing: "Activar",
  perDayShort: "dia",
  perMonthShort: "mês",
  emptyPropertiesTitle: "Ainda sem propriedades",
  emptyPropertiesSubtitle: "Comece por adicionar a primeira propriedade e chegue a clientes no Kudya.",
  tryAgain: "Tentar novamente",
  continueListing: "Continuar anúncio",
  savedAutomatically: "Guardado automaticamente",
  wizardStepOf: "Passo {{current}} de {{total}}",
  wizardPurposeTitle: "O que está a anunciar?",
  wizardPurposeSubtitle: "Escolha como os clientes encontrarão esta propriedade.",
  wizardTypeTitle: "Tipo de imóvel",
  wizardDetailsTitle: "Informação básica",
  wizardLocationTitle: "Localização",
  wizardPricingTitle: "Preços",
  wizardPhotosTitle: "Fotos e comodidades",
  wizardReviewTitle: "Rever anúncio",
  nextStep: "Continuar",
  backStep: "Voltar",
  submitForApproval: "Enviar para aprovação",
  saveDraft: "Guardar rascunho",
  suburbLabel: "Bairro",
  parkingSpaces: "Lugares de estacionamento",
  areaLabel: "Área (m²)",
  furnished: "Mobilado",
  amenities: "Comodidades",
  depositLabel: "Caução",
  currencyLabel: "Moeda",
  coverPhoto: "Capa",
  reviewSummary: "Reveja os detalhes antes de enviar.",
  whatAreYouListing: "O que está a anunciar?",
  enquiriesInbox: "Consultas",
  enquiryTabAll: "Todas",
  enquiryTabNew: "Novas",
  enquiryTabResponded: "Respondidas",
  enquiryTabClosed: "Fechadas",
  emptyEnquiriesTitle: "Ainda sem consultas",
  emptyEnquiriesSubtitle: "Quando os clientes o contactarem, as mensagens aparecem aqui.",
  attentionBanner: "Tem anúncios que precisam de atenção",
  viewPending: "Ver pendentes",
  analytics: "Análises",
  sortNewest: "Mais recentes",
  filterPurpose: "Finalidade",
  noMatchFilters: "Nenhuma propriedade corresponde aos filtros.",
  clearFilters: "Limpar filtros",
  listingSubmitted: "Anúncio enviado para aprovação.",
  applications: "Candidaturas",
  applicationsSubtitle: "Analise candidaturas de arrendamento e faça a gestão dos próximos passos.",
  applicationTabNew: "Novas",
  applicationTabReviewing: "Em análise",
  applicationTabApproved: "Aprovadas",
  applicationTabRejected: "Rejeitadas",
  applicationsLoadError: "Não foi possível carregar as candidaturas.",
  emptyApplicationsTitle: "Ainda não há candidaturas",
  emptyApplicationsSubtitle: "As novas candidaturas de arrendamento aparecerão aqui.",
  applicationDetails: "Detalhes da candidatura",
  applicationApplicant: "Candidato",
  applicationRental: "Detalhes do arrendamento",
  applicationStartReview: "Iniciar análise",
  applicationApprove: "Aprovar candidatura",
  applicationReject: "Rejeitar candidatura",
  applicationViewings: "Visitas",
  applicationDocuments: "Documentos",
  applicationLease: "Contrato",
  applicationGenerateLease: "Gerar contrato",
  applicationSignLease: "Assinar contrato",
  stayBookings: "Reservas de estadia",
  stayBookingsSubtitle: "Reservas de hóspedes nos seus anúncios de curta duração.",
  stayBookingsLoadError: "Não foi possível carregar as reservas.",
  stayBookingsToday: "Check-ins hoje",
  stayBookingsUpcoming: "Próximas",
  stayBookingsThisMonth: "Este mês",
  emptyStayBookingsTitle: "Ainda sem reservas",
  emptyStayBookingsSubtitle: "As estadias confirmadas e pendentes aparecem aqui.",
  stayNights: "noites",
  stayAdults: "adultos",
  stayChildren: "crianças",
  availability: "Disponibilidade",
  availabilitySubtitle: "Veja o calendário e bloqueie datas dos anúncios de estadia.",
  availabilityLoadError: "Não foi possível carregar a disponibilidade.",
  selectStayListing: "Seleccionar anúncio de estadia",
  noStayListingsTitle: "Sem anúncios de estadia",
  noStayListingsSubtitle: "Crie um anúncio de estadia para gerir a disponibilidade.",
  blockDates: "Bloquear datas",
  blockReason: "Motivo (opcional)",
  blockedDatesList: "Datas bloqueadas",
  noBlockedDates: "Não há intervalos bloqueados.",
  unblockDates: "Desbloquear",
  stayBlockCreated: "Datas bloqueadas.",
  stayBlockFailed: "Não foi possível actualizar as datas bloqueadas.",
  stayBlockInvalidRange: "A data final deve ser igual ou posterior à inicial.",
  stayStatusAvailable: "Disponível",
  stayStatusBlocked: "Bloqueado",
  stayStatusBooked: "Reservado",
  stayStatusPending: "Hold",
  manageStayAvailability: "Calendário",
  nightlyPriceLabel: "Preço por noite",
  monthlyRentLabel: "Renda mensal",
  weekendPriceLabel: "Preço de fim de semana (opcional)",
  cleaningFeeLabel: "Taxa de limpeza (opcional)",
  minNightsLabel: "Noites mínimas",
  maxGuestsLabel: "Máximo de hóspedes",
  allowedLeaseMonthsLabel: "Prazos de arrendamento",
  monthsChip: "{{n}} meses",
};

const fr: PropertyTranslationMap = {
  ...en,
  propertyDashboardTitle: "Tableau de bord immobilier",
  propertyBrand: "Kudya Immobilier",
  listings: "Annonces",
  enquiries: "Demandes",
  profile: "Profil",
  logout: "Se déconnecter",
  languageSettings: "Langue",
  loadingDashboard: "Chargement du tableau de bord…",
  dashboardLoadError: "Impossible de charger le tableau de bord immobilier.",
  totalListings: "Total des annonces",
  activeListings: "Annonces actives",
  approvedListings: "Annonces approuvées",
  pendingListings: "En attente d'approbation",
  pendingEnquiries: "Demandes en attente",
  recentEnquiries: "Demandes récentes",
  noListings: "Aucune annonce pour le moment.",
  noEnquiries: "Aucune demande pour le moment.",
  addListing: "Ajouter une annonce",
  cancel: "Annuler",
  fillAllFields: "Veuillez remplir tous les champs obligatoires.",
  listingTitle: "Titre",
  listingCity: "Ville",
  listingAddress: "Adresse",
  listingPrice: "Prix",
  listingType: "Type d'annonce",
  saveListing: "Enregistrer l'annonce",
  createListing: "Créer l'annonce",
  listingSaved: "Annonce enregistrée.",
  listingFailed: "Impossible d'enregistrer l'annonce.",
  toggleAvailability: "Changer la disponibilité",
  available: "Disponible",
  unavailable: "Indisponible",
  approved: "Approuvé",
  pending: "En attente",
  rejected: "Rejeté",
  viewEnquiries: "Voir les demandes",
  respond: "Répondre",
  markResponded: "Marquer comme répondu",
  markScheduled: "Planifier une visite",
  markClosed: "Fermer la demande",
  enquiryUpdated: "Demande mise à jour.",
  quickActions: "Actions rapides",
  manageListings: "Gérer les annonces",
  reviewEnquiries: "Examiner les demandes",
  listingTypeRentDaily: "Location à la journée",
  listingTypeRentMonthly: "Location mensuelle",
  listingTypeBuy: "À vendre",
  enquiryTypeGeneral: "Demande générale",
  enquiryTypeViewing: "Demande de visite",
  enquiryTypeOffer: "Intérêt d'achat",
  enquiryTypeRentalApplication: "Demande de location",
  statusPending: "En attente",
  statusResponded: "Répondu",
  statusScheduled: "Visite planifiée",
  statusApproved: "Approuvé",
  statusRejected: "Rejeté",
  statusClosed: "Fermé",
  approvalPending: "En attente d'approbation",
  approvalApproved: "Approuvé",
  approvalRejected: "Rejeté",
  approvalSuspended: "Suspendu",
  overview: "Aperçu",
  analyticsTitle: "Analyses",
  enquiriesTrend: "Demandes (7 derniers jours)",
  listingsByType: "Annonces par type",
  enquiriesByStatus: "Demandes par statut",
  listingsByApproval: "Annonces par approbation",
  noAnalyticsData: "Pas encore d'activité — les graphiques apparaîtront avec des annonces ou demandes.",
  last7Days: "7 derniers jours",
  days30: "30 derniers jours",
  days90: "90 derniers jours",
  topListingsByEnquiries: "Annonces les plus demandées",
  vsPreviousPeriod: "Comparé à la période précédente",
  comparisonTitle: "Comparaison de période",
  exportCsv: "Exporter CSV",
  exportPdf: "Exporter PDF",
  listingsCreated: "Annonces créées",
  enquiriesMetric: "Demandes",
  listingDescription: "Description",
  bedroomsLabel: "Chambres",
  bathroomsLabel: "Salles de bain",
  propertyTypeLabel: "Type de bien",
  addFirstListing: "Ajouter votre première annonce",
  createListingHint: "Remplissez les détails ci-dessous pour publier une nouvelle annonce.",
  addPhotos: "Ajouter des photos",
  addVideo: "Ajouter une vidéo",
  photosSelected: "photos sélectionnées",
  videoSelected: "Vidéo sélectionnée",
  removeMedia: "Retirer",
  mediaHint: "Ajoutez jusqu'à 12 photos (JPG/PNG) et une vidéo (MP4/MOV, max 50MB).",
  hasVideo: "Avec vidéo",
  photoCount: "photos",
  properties: "Propriétés",
  addProperty: "Ajouter une propriété",
  managePropertiesSubtitle: "Gérez vos propriétés, annonces et disponibilités.",
  goodMorning: "Bonjour",
  goodAfternoon: "Bon après-midi",
  goodEvening: "Bonsoir",
  dashboardGreetingSubtitle: "Gérez vos propriétés et demandes.",
  helloLandlord: "Bonjour, {name}",
  landlordHomeSubtitle: "Gérez vos biens, réservations et baux.",
  pillProperties: "Biens",
  pillBookings: "Réservations",
  pillLeases: "Baux",
  pillMessages: "Messages",
  menuListProperty: "Publier un bien",
  menuBookings: "Réservations (court séjour)",
  menuLeases: "Baux (longue durée)",
  menuRequests: "Locataires et demandes",
  menuCalendar: "Disponibilité",
  menuAnalytics: "Analyses",
  languageAutomatic: "Automatique",
  languagePreviewLine: "Trouvez votre prochain logement",
  propertyOverview: "Aperçu des propriétés",
  totalProperties: "Total des propriétés",
  activeProperties: "Actives",
  pendingReview: "En cours d'examen",
  needsAttention: "Nécessite une attention",
  ofListings: "des annonces",
  statusActive: "Actif",
  statusPendingReview: "En cours d'examen",
  statusDraft: "Brouillon",
  statusInactive: "Inactif",
  statusChangesRequired: "Modifications requises",
  statusSuspended: "Suspendu",
  tabAll: "Tous",
  tabActive: "Actifs",
  tabPending: "En attente",
  tabDraft: "Brouillons",
  tabInactive: "Inactifs",
  searchProperties: "Rechercher des propriétés…",
  purposeRent: "Location",
  purposeStay: "Séjour",
  purposeSale: "Vente",
  purposeAll: "Tous",
  manageProperty: "Gérer la propriété",
  pauseListing: "Mettre en pause",
  activateListing: "Activer",
  perDayShort: "jour",
  perMonthShort: "mois",
  emptyPropertiesTitle: "Aucune propriété",
  emptyPropertiesSubtitle: "Commencez par ajouter votre première propriété sur Kudya.",
  tryAgain: "Réessayer",
  continueListing: "Continuer l'annonce",
  savedAutomatically: "Enregistré automatiquement",
  wizardStepOf: "Étape {{current}} sur {{total}}",
  wizardPurposeTitle: "Que proposez-vous ?",
  wizardPurposeSubtitle: "Choisissez comment les clients trouveront ce bien.",
  wizardTypeTitle: "Type de bien",
  wizardDetailsTitle: "Informations de base",
  wizardLocationTitle: "Localisation",
  wizardPricingTitle: "Tarification",
  wizardPhotosTitle: "Photos et équipements",
  wizardReviewTitle: "Vérifier l'annonce",
  nextStep: "Continuer",
  backStep: "Retour",
  submitForApproval: "Soumettre pour approbation",
  saveDraft: "Enregistrer le brouillon",
  suburbLabel: "Quartier",
  parkingSpaces: "Places de parking",
  areaLabel: "Surface (m²)",
  furnished: "Meublé",
  amenities: "Équipements",
  depositLabel: "Caution",
  currencyLabel: "Devise",
  coverPhoto: "Couverture",
  reviewSummary: "Vérifiez les détails avant de soumettre.",
  whatAreYouListing: "Que proposez-vous ?",
  enquiriesInbox: "Demandes",
  enquiryTabAll: "Toutes",
  enquiryTabNew: "Nouvelles",
  enquiryTabResponded: "Répondues",
  enquiryTabClosed: "Fermées",
  emptyEnquiriesTitle: "Aucune demande",
  emptyEnquiriesSubtitle: "Lorsque des clients vous contactent, leurs messages apparaissent ici.",
  attentionBanner: "Des annonces nécessitent votre attention",
  viewPending: "Voir les en attente",
  analytics: "Analyses",
  sortNewest: "Plus récents",
  filterPurpose: "Objectif",
  noMatchFilters: "Aucune propriété ne correspond aux filtres.",
  clearFilters: "Effacer les filtres",
  listingSubmitted: "Annonce soumise pour approbation.",
  applications: "Candidatures",
  applicationsSubtitle: "Examinez les demandes de location et gérez les prochaines étapes.",
  applicationTabNew: "Nouvelles",
  applicationTabReviewing: "En cours",
  applicationTabApproved: "Approuvées",
  applicationTabRejected: "Rejetées",
  applicationsLoadError: "Impossible de charger les candidatures.",
  emptyApplicationsTitle: "Aucune candidature",
  emptyApplicationsSubtitle: "Les nouvelles demandes de location apparaîtront ici.",
  applicationDetails: "Détails de la candidature",
  applicationApplicant: "Candidat",
  applicationRental: "Détails de location",
  applicationStartReview: "Commencer l'examen",
  applicationApprove: "Approuver la candidature",
  applicationReject: "Rejeter la candidature",
  applicationViewings: "Visites",
  applicationDocuments: "Documents",
  applicationLease: "Bail",
  applicationGenerateLease: "Générer le bail",
  applicationSignLease: "Signer le bail",
  stayBookings: "Réservations séjour",
  stayBookingsSubtitle: "Réservations clients pour vos annonces de courte durée.",
  stayBookingsLoadError: "Impossible de charger les réservations.",
  stayBookingsToday: "Arrivées aujourd'hui",
  stayBookingsUpcoming: "À venir",
  stayBookingsThisMonth: "Ce mois",
  emptyStayBookingsTitle: "Aucune réservation",
  emptyStayBookingsSubtitle: "Les séjours confirmés et en attente apparaîtront ici.",
  stayNights: "nuits",
  stayAdults: "adultes",
  stayChildren: "enfants",
  availability: "Disponibilité",
  availabilitySubtitle: "Calendrier et blocage de dates pour les annonces séjour.",
  availabilityLoadError: "Impossible de charger la disponibilité.",
  selectStayListing: "Choisir une annonce séjour",
  noStayListingsTitle: "Aucune annonce séjour",
  noStayListingsSubtitle: "Créez une annonce séjour pour gérer la disponibilité.",
  blockDates: "Bloquer des dates",
  blockReason: "Motif (optionnel)",
  blockedDatesList: "Dates bloquées",
  noBlockedDates: "Aucune période bloquée.",
  unblockDates: "Débloquer",
  stayBlockCreated: "Dates bloquées.",
  stayBlockFailed: "Impossible de mettre à jour les dates bloquées.",
  stayBlockInvalidRange: "La date de fin doit être postérieure ou égale à la date de début.",
  stayStatusAvailable: "Disponible",
  stayStatusBlocked: "Bloqué",
  stayStatusBooked: "Réservé",
  stayStatusPending: "Hold",
  manageStayAvailability: "Calendrier",
  nightlyPriceLabel: "Prix par nuit",
  monthlyRentLabel: "Loyer mensuel",
  weekendPriceLabel: "Prix week-end (optionnel)",
  cleaningFeeLabel: "Frais de ménage (optionnel)",
  minNightsLabel: "Nuits minimum",
  maxGuestsLabel: "Voyageurs maximum",
  allowedLeaseMonthsLabel: "Durées de bail autorisées",
  monthsChip: "{{n}} mois",
};

const es: PropertyTranslationMap = {
  ...en,
  propertyDashboardTitle: "Panel de propiedades",
  propertyBrand: "Kudya Propiedades",
  listings: "Anuncios",
  enquiries: "Consultas",
  profile: "Perfil",
  logout: "Cerrar sesión",
  languageSettings: "Idioma",
  loadingDashboard: "Cargando panel…",
  dashboardLoadError: "No se pudo cargar el panel de propiedades.",
  totalListings: "Total de anuncios",
  activeListings: "Anuncios activos",
  approvedListings: "Anuncios aprobados",
  pendingListings: "Pendiente de aprobación",
  pendingEnquiries: "Consultas pendientes",
  recentEnquiries: "Consultas recientes",
  noListings: "Aún no hay anuncios.",
  noEnquiries: "Aún no hay consultas.",
  addListing: "Añadir anuncio",
  cancel: "Cancelar",
  fillAllFields: "Completa todos los campos obligatorios.",
  listingTitle: "Título",
  listingCity: "Ciudad",
  listingAddress: "Dirección",
  listingPrice: "Precio",
  listingType: "Tipo de anuncio",
  saveListing: "Guardar anuncio",
  createListing: "Crear anuncio",
  listingSaved: "Anuncio guardado.",
  listingFailed: "No se pudo guardar el anuncio.",
  toggleAvailability: "Cambiar disponibilidad",
  available: "Disponible",
  unavailable: "No disponible",
  approved: "Aprobado",
  pending: "Pendiente",
  rejected: "Rechazado",
  viewEnquiries: "Ver consultas",
  respond: "Responder",
  markResponded: "Marcar respondido",
  markScheduled: "Programar visita",
  markClosed: "Cerrar consulta",
  enquiryUpdated: "Consulta actualizada.",
  quickActions: "Acciones rápidas",
  manageListings: "Gestionar anuncios",
  reviewEnquiries: "Revisar consultas",
  listingTypeRentDaily: "Alquiler por día",
  listingTypeRentMonthly: "Alquiler mensual",
  listingTypeBuy: "En venta",
  enquiryTypeGeneral: "Consulta general",
  enquiryTypeViewing: "Solicitud de visita",
  enquiryTypeOffer: "Interés de compra",
  enquiryTypeRentalApplication: "Solicitud de alquiler",
  statusPending: "Pendiente",
  statusResponded: "Respondido",
  statusScheduled: "Visita programada",
  statusApproved: "Aprobado",
  statusRejected: "Rechazado",
  statusClosed: "Cerrado",
  approvalPending: "Pendiente de aprobación",
  approvalApproved: "Aprobado",
  approvalRejected: "Rechazado",
  approvalSuspended: "Suspendido",
  overview: "Resumen",
  analyticsTitle: "Análisis",
  enquiriesTrend: "Consultas (últimos 7 días)",
  listingsByType: "Anuncios por tipo",
  enquiriesByStatus: "Consultas por estado",
  listingsByApproval: "Anuncios por aprobación",
  noAnalyticsData: "Sin actividad aún — los gráficos aparecerán cuando haya anuncios o consultas.",
  last7Days: "Últimos 7 días",
  days30: "Últimos 30 días",
  days90: "Últimos 90 días",
  topListingsByEnquiries: "Anuncios con más consultas",
  vsPreviousPeriod: "Comparado con el período anterior",
  comparisonTitle: "Comparación del período",
  exportCsv: "Exportar CSV",
  exportPdf: "Exportar PDF",
  listingsCreated: "Anuncios creados",
  enquiriesMetric: "Consultas",
  listingDescription: "Descripción",
  bedroomsLabel: "Habitaciones",
  bathroomsLabel: "Baños",
  propertyTypeLabel: "Tipo de propiedad",
  addFirstListing: "Añadir tu primer anuncio",
  createListingHint: "Completa los datos abajo para publicar un nuevo anuncio.",
  addPhotos: "Añadir fotos",
  addVideo: "Añadir vídeo",
  photosSelected: "fotos seleccionadas",
  videoSelected: "Vídeo seleccionado",
  removeMedia: "Quitar",
  mediaHint: "Añade hasta 12 fotos (JPG/PNG) y un vídeo (MP4/MOV, máx. 50MB).",
  hasVideo: "Tiene vídeo",
  photoCount: "fotos",
  properties: "Propiedades",
  addProperty: "Añadir propiedad",
  managePropertiesSubtitle: "Gestiona tus propiedades, anuncios y disponibilidad.",
  goodMorning: "Buenos días",
  goodAfternoon: "Buenas tardes",
  goodEvening: "Buenas noches",
  dashboardGreetingSubtitle: "Gestiona tus propiedades y consultas.",
  helloLandlord: "Hola, {name}",
  landlordHomeSubtitle: "Gestiona propiedades, reservas y contratos.",
  pillProperties: "Propiedades",
  pillBookings: "Reservas",
  pillLeases: "Contratos",
  pillMessages: "Mensajes",
  menuListProperty: "Publicar propiedad",
  menuBookings: "Reservas (corta estancia)",
  menuLeases: "Contratos (larga duración)",
  menuRequests: "Inquilinos y solicitudes",
  menuCalendar: "Disponibilidad",
  menuAnalytics: "Analítica",
  languageAutomatic: "Automático",
  languagePreviewLine: "Encuentra tu próximo hogar",
  propertyOverview: "Resumen de propiedades",
  totalProperties: "Total de propiedades",
  activeProperties: "Activas",
  pendingReview: "En revisión",
  needsAttention: "Requiere atención",
  ofListings: "de los anuncios",
  statusActive: "Activo",
  statusPendingReview: "En revisión",
  statusDraft: "Borrador",
  statusInactive: "Inactivo",
  statusChangesRequired: "Cambios requeridos",
  statusSuspended: "Suspendido",
  tabAll: "Todos",
  tabActive: "Activos",
  tabPending: "Pendientes",
  tabDraft: "Borradores",
  tabInactive: "Inactivos",
  searchProperties: "Buscar propiedades…",
  purposeRent: "Alquiler",
  purposeStay: "Estancia",
  purposeSale: "Venta",
  purposeAll: "Todos",
  manageProperty: "Gestionar propiedad",
  pauseListing: "Pausar anuncio",
  activateListing: "Activar",
  perDayShort: "día",
  perMonthShort: "mes",
  emptyPropertiesTitle: "Aún no hay propiedades",
  emptyPropertiesSubtitle: "Empieza añadiendo tu primera propiedad en Kudya.",
  tryAgain: "Reintentar",
  continueListing: "Continuar anuncio",
  savedAutomatically: "Guardado automáticamente",
  wizardStepOf: "Paso {{current}} de {{total}}",
  wizardPurposeTitle: "¿Qué vas a publicar?",
  wizardPurposeSubtitle: "Elige cómo encontrarán los clientes esta propiedad.",
  wizardTypeTitle: "Tipo de propiedad",
  wizardDetailsTitle: "Información básica",
  wizardLocationTitle: "Ubicación",
  wizardPricingTitle: "Precios",
  wizardPhotosTitle: "Fotos y amenidades",
  wizardReviewTitle: "Revisar anuncio",
  nextStep: "Continuar",
  backStep: "Atrás",
  submitForApproval: "Enviar para aprobación",
  saveDraft: "Guardar borrador",
  suburbLabel: "Barrio",
  parkingSpaces: "Plazas de aparcamiento",
  areaLabel: "Área (m²)",
  furnished: "Amueblado",
  amenities: "Amenidades",
  depositLabel: "Depósito",
  currencyLabel: "Moneda",
  coverPhoto: "Portada",
  reviewSummary: "Revisa los detalles antes de enviar.",
  whatAreYouListing: "¿Qué vas a publicar?",
  enquiriesInbox: "Consultas",
  enquiryTabAll: "Todas",
  enquiryTabNew: "Nuevas",
  enquiryTabResponded: "Respondidas",
  enquiryTabClosed: "Cerradas",
  emptyEnquiriesTitle: "Aún no hay consultas",
  emptyEnquiriesSubtitle: "Cuando los clientes te contacten, sus mensajes aparecerán aquí.",
  attentionBanner: "Tienes anuncios que requieren atención",
  viewPending: "Ver pendientes",
  analytics: "Análisis",
  sortNewest: "Más recientes",
  filterPurpose: "Finalidad",
  noMatchFilters: "Ninguna propiedad coincide con los filtros.",
  clearFilters: "Limpiar filtros",
  listingSubmitted: "Anuncio enviado para aprobación.",
  applications: "Solicitudes",
  applicationsSubtitle: "Revisa las solicitudes de alquiler y gestiona los siguientes pasos.",
  applicationTabNew: "Nuevas",
  applicationTabReviewing: "En revisión",
  applicationTabApproved: "Aprobadas",
  applicationTabRejected: "Rechazadas",
  applicationsLoadError: "No se pudieron cargar las solicitudes.",
  emptyApplicationsTitle: "Aún no hay solicitudes",
  emptyApplicationsSubtitle: "Las nuevas solicitudes de alquiler aparecerán aquí.",
  applicationDetails: "Detalles de la solicitud",
  applicationApplicant: "Solicitante",
  applicationRental: "Detalles del alquiler",
  applicationStartReview: "Iniciar revisión",
  applicationApprove: "Aprobar solicitud",
  applicationReject: "Rechazar solicitud",
  applicationViewings: "Visitas",
  applicationDocuments: "Documentos",
  applicationLease: "Contrato",
  applicationGenerateLease: "Generar contrato",
  applicationSignLease: "Firmar contrato",
  stayBookings: "Reservas de estancia",
  stayBookingsSubtitle: "Reservas de huéspedes en tus anuncios de corta estancia.",
  stayBookingsLoadError: "No se pudieron cargar las reservas.",
  stayBookingsToday: "Check-ins hoy",
  stayBookingsUpcoming: "Próximas",
  stayBookingsThisMonth: "Este mes",
  emptyStayBookingsTitle: "Aún no hay reservas",
  emptyStayBookingsSubtitle: "Las estancias confirmadas y pendientes aparecerán aquí.",
  stayNights: "noches",
  stayAdults: "adultos",
  stayChildren: "niños",
  availability: "Disponibilidad",
  availabilitySubtitle: "Calendario y bloqueo de fechas para anuncios de estancia.",
  availabilityLoadError: "No se pudo cargar la disponibilidad.",
  selectStayListing: "Seleccionar anuncio de estancia",
  noStayListingsTitle: "Sin anuncios de estancia",
  noStayListingsSubtitle: "Crea un anuncio de estancia para gestionar la disponibilidad.",
  blockDates: "Bloquear fechas",
  blockReason: "Motivo (opcional)",
  blockedDatesList: "Fechas bloqueadas",
  noBlockedDates: "No hay rangos bloqueados.",
  unblockDates: "Desbloquear",
  stayBlockCreated: "Fechas bloqueadas.",
  stayBlockFailed: "No se pudieron actualizar las fechas bloqueadas.",
  stayBlockInvalidRange: "La fecha final debe ser igual o posterior a la inicial.",
  stayStatusAvailable: "Disponible",
  stayStatusBlocked: "Bloqueado",
  stayStatusBooked: "Reservado",
  stayStatusPending: "Hold",
  manageStayAvailability: "Calendario",
  nightlyPriceLabel: "Precio por noche",
  monthlyRentLabel: "Alquiler mensual",
  weekendPriceLabel: "Precio de fin de semana (opcional)",
  cleaningFeeLabel: "Tarifa de limpieza (opcional)",
  minNightsLabel: "Noches mínimas",
  maxGuestsLabel: "Huéspedes máximos",
  allowedLeaseMonthsLabel: "Plazos de arrendamiento",
  monthsChip: "{{n}} meses",
};

const propertyTranslations: Record<SupportedLocale, PropertyTranslationMap> = {
  en,
  pt,
  fr,
  es,
};

export function propertyT(key: PropertyTranslationKey, locale: SupportedLocale): string {
  return propertyTranslations[locale]?.[key] ?? propertyTranslations.en[key] ?? key;
}

export function listingTypeLabel(type: string, locale: SupportedLocale): string {
  const map: Record<string, PropertyTranslationKey> = {
    rent_daily: "listingTypeRentDaily",
    rent_monthly: "listingTypeRentMonthly",
    buy: "listingTypeBuy",
  };
  const key = map[type];
  return key ? propertyT(key, locale) : type;
}

export function approvalStatusLabel(status: string, locale: SupportedLocale): string {
  const map: Record<string, PropertyTranslationKey> = {
    draft: "statusDraft",
    pending: "approvalPending",
    under_review: "statusPendingReview",
    approved: "approvalApproved",
    rejected: "statusChangesRequired",
    suspended: "approvalSuspended",
  };
  const key = map[status];
  return key ? propertyT(key, locale) : status;
}

export function enquiryStatusLabel(status: string, locale: SupportedLocale): string {
  const map: Record<string, PropertyTranslationKey> = {
    pending: "statusPending",
    responded: "statusResponded",
    scheduled: "statusScheduled",
    approved: "statusApproved",
    rejected: "statusRejected",
    closed: "statusClosed",
  };
  const key = map[status];
  return key ? propertyT(key, locale) : status;
}

export function enquiryTypeLabel(type: string, locale: SupportedLocale): string {
  const map: Record<string, PropertyTranslationKey> = {
    general: "enquiryTypeGeneral",
    viewing: "enquiryTypeViewing",
    offer: "enquiryTypeOffer",
    rental_application: "enquiryTypeRentalApplication",
  };
  const key = map[type];
  return key ? propertyT(key, locale) : type;
}

const PROPERTY_TYPE_LABELS: Record<SupportedLocale, Record<string, string>> = {
  en: {
    apartment: "Apartment",
    house: "House",
    villa: "Villa",
    townhouse: "Townhouse",
    room: "Room",
    studio: "Studio",
    office: "Office",
    commercial: "Commercial",
    land: "Land",
    hotel: "Hotel",
    guest_house: "Guest House",
    lodge: "Lodge",
    other: "Other",
  },
  pt: {
    apartment: "Apartamento",
    house: "Casa",
    villa: "Vila",
    townhouse: "Moradia",
    room: "Quarto",
    studio: "Estúdio",
    office: "Escritório",
    commercial: "Comercial",
    land: "Terreno",
    hotel: "Hotel",
    guest_house: "Casa de hóspedes",
    lodge: "Lodge",
    other: "Outro",
  },
  fr: {
    apartment: "Appartement",
    house: "Maison",
    villa: "Villa",
    townhouse: "Maison de ville",
    room: "Chambre",
    studio: "Studio",
    office: "Bureau",
    commercial: "Commercial",
    land: "Terrain",
    hotel: "Hôtel",
    guest_house: "Maison d'hôtes",
    lodge: "Lodge",
    other: "Autre",
  },
  es: {
    apartment: "Apartamento",
    house: "Casa",
    villa: "Villa",
    townhouse: "Adosado",
    room: "Habitación",
    studio: "Estudio",
    office: "Oficina",
    commercial: "Comercial",
    land: "Terreno",
    hotel: "Hotel",
    guest_house: "Casa de huéspedes",
    lodge: "Lodge",
    other: "Otro",
  },
};

const AMENITY_LABELS: Record<SupportedLocale, Record<string, string>> = {
  en: {
    wifi: "Wi‑Fi",
    parking: "Parking",
    pool: "Swimming Pool",
    security: "24/7 Security",
    generator: "Generator",
    air_conditioning: "Air Conditioning",
    furnished: "Furnished",
    balcony: "Balcony",
    elevator: "Elevator",
    gym: "Gym",
    garden: "Garden",
    water_tank: "Water Tank",
  },
  pt: {
    wifi: "Wi‑Fi",
    parking: "Estacionamento",
    pool: "Piscina",
    security: "Segurança 24h",
    generator: "Gerador",
    air_conditioning: "Ar condicionado",
    furnished: "Mobilado",
    balcony: "Varanda",
    elevator: "Elevador",
    gym: "Ginásio",
    garden: "Jardim",
    water_tank: "Cisterna",
  },
  fr: {
    wifi: "Wi‑Fi",
    parking: "Parking",
    pool: "Piscine",
    security: "Sécurité 24h/24",
    generator: "Générateur",
    air_conditioning: "Climatisation",
    furnished: "Meublé",
    balcony: "Balcon",
    elevator: "Ascenseur",
    gym: "Salle de sport",
    garden: "Jardin",
    water_tank: "Réservoir d'eau",
  },
  es: {
    wifi: "Wi‑Fi",
    parking: "Aparcamiento",
    pool: "Piscina",
    security: "Seguridad 24h",
    generator: "Generador",
    air_conditioning: "Aire acondicionado",
    furnished: "Amueblado",
    balcony: "Balcón",
    elevator: "Ascensor",
    gym: "Gimnasio",
    garden: "Jardín",
    water_tank: "Depósito de agua",
  },
};

function titleCaseKey(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function propertyTypeLabel(type: string, locale: SupportedLocale): string {
  return (
    PROPERTY_TYPE_LABELS[locale]?.[type] ??
    PROPERTY_TYPE_LABELS.en[type] ??
    titleCaseKey(type)
  );
}

export function amenityLabel(key: string, locale: SupportedLocale): string {
  return (
    AMENITY_LABELS[locale]?.[key] ??
    AMENITY_LABELS.en[key] ??
    titleCaseKey(key)
  );
}

export function purposeLabel(purpose: string, locale: SupportedLocale): string {
  if (purpose === "rent") return propertyT("purposeRent", locale);
  if (purpose === "stay") return propertyT("purposeStay", locale);
  if (purpose === "sale") return propertyT("purposeSale", locale);
  return purpose;
}

export default propertyTranslations;
