export type Locale = "pt-BR" | "en";

export const translations = {
  "pt-BR": {
    // Header
    title: "Cafe Cursor",
    subtitle: "Obtenha seu crédito gratuito do Cursor IDE.",
    cta: "Cadastre-se em segundos.",
    
    // Form
    nameLabel: "Nome",
    namePlaceholder: "Seu nome completo",
    emailLabel: "Email",
    emailPlaceholder: "O email que você usou no cadastro",
    emailHint: "Use o mesmo email com que você se cadastrou no Luma",
    submitButton: "Obter meu crédito",
    submitting: "Verificando...",
    
    // Footer
    footerNote: "Apenas participantes cadastrados no evento podem obter créditos.",
    onePerPerson: "Um crédito por pessoa.",
    madeBy: "Feito por",
    ambassadors: "Chris & Alex",
    ambassadorTitle: "Cursor Ambassador Brasil",
    poweredBy: "Powered by",
    
    // Badge
    creditsAvailable: "créditos disponíveis",
    noCredits: "Sem créditos disponíveis",
    loading: "Carregando...",
    alreadyClaimed: "participantes já resgataram",
    of: "de",
    
    // Success
    successTitle: "Crédito atribuído!",
    alreadyHaveCredit: "Você já tem seu crédito!",
    congratsMessage: "Parabéns! Aqui está seu crédito do Cursor:",
    registeredAs: "Cadastrado como:",
    testWarning: "⚠️ Este é um crédito de TESTE (não válido para uso real)",
    yourCredit: "Seu crédito do Cursor",
    copyLink: "Copiar link",
    useCredit: "Usar crédito →",
    saveLink: "Guarde este link, é único e pessoal.",
    
    // Errors
    notEligible: "Este email não está cadastrado no evento Cafe Cursor. Apenas participantes aprovados podem obter créditos.",
    notApproved: "Seu cadastro no evento ainda não foi aprovado. Por favor, entre em contato com o organizador.",
    noCreditsAvailable: "Desculpe, não há créditos disponíveis no momento. Por favor, entre em contato com o organizador.",
    networkError: "Erro de conexão. Por favor, tente novamente.",
    thinkError: "Acha que é um erro? Entre em contato com o organizador do evento.",
    pendingApproval: "Sua solicitação está pendente de aprovação.",
    tryAnotherEmail: "Tentar com outro email",
    
    // Share
    shareOnX: "Compartilhar no X",
    shareMessage: "🚀 Acabei de ganhar um crédito do @cursor_ai no Cafe Cursor Floripa! Muito obrigado à comunidade por essa oportunidade incrível de experimentar o melhor editor de código com IA. #CafeCursorFloripa #CursorAI #DevCommunity",
    
    // Email
    emailSent: "📧 Enviamos o crédito para seu email!",
  },
  "en": {
    // Header
    title: "Cafe Cursor",
    subtitle: "Get your free Cursor IDE credit.",
    cta: "Register in seconds.",
    
    // Form
    nameLabel: "Name",
    namePlaceholder: "Your full name",
    emailLabel: "Email",
    emailPlaceholder: "The email you registered with",
    emailHint: "Use the same email you registered with on Luma",
    submitButton: "Get my credit",
    submitting: "Verifying...",
    
    // Footer
    footerNote: "Only registered event attendees can get credits.",
    onePerPerson: "One credit per person.",
    madeBy: "Made by",
    ambassadors: "Chris & Alex",
    ambassadorTitle: "Cursor Ambassador Brasil",
    poweredBy: "Powered by",
    
    // Badge
    creditsAvailable: "credits available",
    noCredits: "No credits available",
    loading: "Loading...",
    alreadyClaimed: "attendees already claimed",
    of: "of",
    
    // Success
    successTitle: "Credit assigned!",
    alreadyHaveCredit: "You already have your credit!",
    congratsMessage: "Congratulations! Here's your Cursor credit:",
    registeredAs: "Registered as:",
    testWarning: "⚠️ This is a TEST credit (not valid for real use)",
    yourCredit: "Your Cursor credit",
    copyLink: "Copy link",
    useCredit: "Use credit →",
    saveLink: "Save this link, it's unique and personal.",
    
    // Errors
    notEligible: "This email is not registered for Cafe Cursor event. Only approved attendees can get credits.",
    notApproved: "Your event registration hasn't been approved yet. Please contact the organizer.",
    noCreditsAvailable: "Sorry, no credits are available at the moment. Please contact the organizer.",
    networkError: "Connection error. Please try again.",
    thinkError: "Think this is an error? Contact the event organizer.",
    pendingApproval: "Your request is pending approval.",
    tryAnotherEmail: "Try with another email",
    
    // Share
    shareOnX: "Share on X",
    shareMessage: "🚀 Just got a @cursor_ai credit at Cafe Cursor Floripa! Huge thanks to the community for this amazing opportunity to try the best AI-powered code editor. #CafeCursorFloripa #CursorAI #DevCommunity",
    
    // Email
    emailSent: "📧 We sent the credit to your email!",
  },
} as const;

export type TranslationKey = keyof typeof translations["pt-BR"];

export function getTranslation(locale: Locale, key: TranslationKey): string {
  return translations[locale][key];
}
