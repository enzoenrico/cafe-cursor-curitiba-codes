import { Resend } from "resend";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// Load API key from environment or .env file
function getResendApiKey(): string | null {
	// First try from process.env (works in production)
	if (process.env.RESEND_API_KEY) {
		return process.env.RESEND_API_KEY;
	}

	// Fallback: read directly from .env file (development)
	const envPath = join(process.cwd(), ".env");
	if (existsSync(envPath)) {
		const envContent = readFileSync(envPath, "utf-8");
		const match = envContent.match(/RESEND_API_KEY=(.+)/);
		if (match && match[1]) {
			return match[1].trim();
		}
	}

	return null;
}

// Función para obtener cliente Resend (lazy initialization)
function getResendClient(): Resend | null {
	const apiKey = getResendApiKey();
	console.log(`📧 [EMAIL] Verificando API key: ${apiKey ? "✅ Configurada (" + apiKey.substring(0, 10) + "...)" : "❌ No encontrada"}`);
	if (!apiKey) {
		return null;
	}
	return new Resend(apiKey);
}

// Email del remitente (debe ser verificado en Resend)
const FROM_EMAIL = process.env.FROM_EMAIL || "Cafe Cursor <onboarding@resend.dev>";

interface SendCreditEmailParams {
	to: string;
	name: string;
	creditLink: string;
	creditCode: string;
	company?: string;
	isTest?: boolean;
	locale?: "pt-BR" | "en";
}

/**
 * Envía el correo de confirmación con el crédito
 */
export async function sendCreditEmail({
	to,
	name,
	creditLink,
	creditCode,
	company,
	isTest = false,
	locale = "pt-BR",
}: SendCreditEmailParams): Promise<{ success: boolean; error?: string }> {
	// Obtener cliente Resend (lazy)
	const resendClient = getResendClient();

	// Si no hay Resend configurado, solo logear (modo desarrollo)
	if (!resendClient) {
		console.log(`📧 [EMAIL] Modo desarrollo - Email simulado`);
		console.log(`   📬 Para: ${to}`);
		console.log(`   👤 Nombre: ${name}`);
		console.log(`   🎫 Crédito: ${creditCode}`);
		console.log(`   🔗 Link: ${creditLink}`);
		console.log(`   🏢 Empresa: ${company || "N/A"}`);
		console.log(`   🧪 Test: ${isTest}`);
		console.log(`   🌐 Locale: ${locale}`);
		console.log(`   ✅ Email simulado con éxito`);
		return { success: true };
	}

	try {
		const subject = locale === "pt-BR"
			? "🎉 Seu crédito Cursor está aqui! - Cafe Cursor Curitiba"
			: "🎉 Your Cursor credit is here! - Cafe Cursor Curitiba";

		const html = generateEmailHTML({
			name,
			creditLink,
			creditCode,
			company,
			isTest,
			locale,
		});

		console.log(`📧 [EMAIL] Enviando email real a: ${to}`);

		const { error } = await resendClient.emails.send({
			from: FROM_EMAIL,
			to: [to],
			subject,
			html,
		});

		if (error) {
			console.error(`❌ [EMAIL] Error enviando a ${to}:`, error);
			return { success: false, error: error.message };
		}

		console.log(`✅ [EMAIL] Enviado exitosamente a: ${to}`);
		return { success: true };
	} catch (error) {
		console.error(`❌ [EMAIL] Error inesperado:`, error);
		return { success: false, error: "Error al enviar el correo" };
	}
}

/**
 * Genera el HTML del correo manteniendo la estética de la landing
 */
function generateEmailHTML({
	name,
	creditLink,
	creditCode,
	company,
	isTest,
	locale,
}: Omit<SendCreditEmailParams, "to">): string {
	const isPtBR = locale === "pt-BR";

	const texts = {
		greeting: isPtBR ? `Olá, ${name}!` : `Hello, ${name}!`,
		thanks: isPtBR
			? "Obrigado por participar do Cafe Cursor Curitiba!"
			: "Thank you for joining Cafe Cursor Curitiba!",
		intro: isPtBR
			? "Estamos muito felizes em ter você na nossa comunidade. Aqui está seu crédito exclusivo do Cursor IDE:"
			: "We're thrilled to have you in our community. Here's your exclusive Cursor IDE credit:",
		yourCredit: isPtBR ? "Seu Crédito Cursor" : "Your Cursor Credit",
		code: isPtBR ? "Código" : "Code",
		useCredit: isPtBR ? "Usar Meu Crédito" : "Use My Credit",
		testWarning: isPtBR
			? "⚠️ Este é um crédito de TESTE (não válido para uso real)"
			: "⚠️ This is a TEST credit (not valid for real use)",
		howToUse: isPtBR ? "Como usar:" : "How to use:",
		step1: isPtBR
			? "Clique no botão acima ou copie o link"
			: "Click the button above or copy the link",
		step2: isPtBR
			? "Faça login ou crie sua conta no Cursor"
			: "Sign in or create your Cursor account",
		step3: isPtBR
			? "O crédito será aplicado automaticamente!"
			: "The credit will be applied automatically!",
		questions: isPtBR
			? "Dúvidas? Entre em contato com os organizadores do evento."
			: "Questions? Contact the event organizers.",
		footer: isPtBR
			? "Obrigado Chris & Alex pelo projeto para enviar os créditos e um grande obrigado a você por ter participado!"
			: "Thank you Chris & Alex for the project to send the credits and a big thank you to you for participating!",
		companyLabel: isPtBR ? "Empresa" : "Company",
	};

	return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cafe Cursor - ${texts.yourCredit}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 500px;">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <svg width="48" height="55" viewBox="0 0 466.73 532.09" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M457.43,125.94L244.42,2.96c-6.84-3.95-15.28-3.95-22.12,0L9.3,125.94c-5.75,3.32-9.3,9.46-9.3,16.11v247.99c0,6.65,3.55,12.79,9.3,16.11l213.01,122.98c6.84,3.95,15.28,3.95,22.12,0l213.01-122.98c5.75-3.32,9.3-9.46,9.3-16.11v-247.99c0-6.65-3.55-12.79-9.3-16.11ZM444.05,151.99l-205.63,356.16c-1.39,2.4-5.06,1.42-5.06-1.36v-233.21c0-4.66-2.49-8.97-6.53-11.31L24.87,145.67c-2.4-1.39-1.42-5.06,1.36-5.06h411.26c5.84,0,9.49,6.33,6.57,11.39Z" fill="#ffffff"/>
              </svg>
            </td>
          </tr>

          <!-- Título -->
          <tr>
            <td align="center" style="padding-bottom: 8px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                Cafe Cursor
              </h1>
            </td>
          </tr>

          <!-- Subtítulo -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <p style="margin: 0; font-size: 14px; color: #a3a3a3;">
                Florianópolis, Brasil
              </p>
            </td>
          </tr>

          <!-- Card principal -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #171717; border: 1px solid #262626; border-radius: 16px;">
                <tr>
                  <td style="padding: 32px;">
                    
                    <!-- Saludo -->
                    <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 600; color: #ffffff;">
                      ${texts.greeting}
                    </h2>
                    <p style="margin: 0 0 24px 0; font-size: 14px; color: #10b981; font-weight: 500;">
                      ${texts.thanks}
                    </p>
                    
                    <!-- Intro -->
                    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #a3a3a3;">
                      ${texts.intro}
                    </p>

                    <!-- Info del usuario -->
                    ${company ? `
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a; border-radius: 12px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 16px;">
                          <p style="margin: 0 0 4px 0; font-size: 12px; color: #737373; text-transform: uppercase; letter-spacing: 0.5px;">
                            ${texts.companyLabel}
                          </p>
                          <p style="margin: 0; font-size: 14px; color: #ffffff;">
                            ${company}
                          </p>
                        </td>
                      </tr>
                    </table>
                    ` : ""}

                    <!-- Warning de test -->
                    ${isTest ? `
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #78350f; border: 1px solid #92400e; border-radius: 12px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 12px 16px;">
                          <p style="margin: 0; font-size: 12px; color: #fbbf24; text-align: center;">
                            ${texts.testWarning}
                          </p>
                        </td>
                      </tr>
                    </table>
                    ` : ""}

                    <!-- Box del crédito -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a; border: 1px solid #262626; border-radius: 12px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0 0 8px 0; font-size: 10px; color: #737373; text-transform: uppercase; letter-spacing: 1px; font-weight: 500;">
                            ${texts.yourCredit}
                          </p>
                          <p style="margin: 0 0 4px 0; font-size: 12px; color: #a3a3a3;">
                            ${texts.code}: <span style="font-family: monospace; color: #ffffff;">${creditCode}</span>
                          </p>
                          <p style="margin: 0; font-size: 11px; color: #737373; word-break: break-all; font-family: monospace;">
                            ${creditLink}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Botón CTA -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center">
                          <a href="${creditLink}" target="_blank" style="display: inline-block; background-color: #ffffff; color: #0a0a0a; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 12px;">
                            ${texts.useCredit} →
                          </a>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Instrucciones -->
          <tr>
            <td style="padding: 32px 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #171717; border: 1px solid #262626; border-radius: 12px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #ffffff;">
                      ${texts.howToUse}
                    </p>
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <span style="display: inline-block; width: 20px; height: 20px; background-color: #262626; border-radius: 50%; text-align: center; line-height: 20px; font-size: 11px; color: #ffffff; margin-right: 12px;">1</span>
                          <span style="font-size: 13px; color: #a3a3a3;">${texts.step1}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <span style="display: inline-block; width: 20px; height: 20px; background-color: #262626; border-radius: 50%; text-align: center; line-height: 20px; font-size: 11px; color: #ffffff; margin-right: 12px;">2</span>
                          <span style="font-size: 13px; color: #a3a3a3;">${texts.step2}</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span style="display: inline-block; width: 20px; height: 20px; background-color: #262626; border-radius: 50%; text-align: center; line-height: 20px; font-size: 11px; color: #ffffff; margin-right: 12px;">3</span>
                          <span style="font-size: 13px; color: #a3a3a3;">${texts.step3}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 16px; border-top: 1px solid #262626;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #737373;">
                ${texts.questions}
              </p>
              <p style="margin: 0; font-size: 11px; color: #525252;">
                ${texts.footer}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}
