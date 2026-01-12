import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { ZodError } from "zod";
import { sendCreditEmail } from "@/lib/email";

/**
 * POST /api/register
 * Registra un usuario elegible y asigna un crédito disponible
 * Solo usuarios pre-aprobados del evento pueden obtener créditos
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar input
    const validatedData = registerSchema.parse(body);
    const { name, email } = validatedData;
    const normalizedEmail = email.toLowerCase().trim();
    
    // Obtener locale del request (default: pt-BR)
    const locale = (body.locale === "en" ? "en" : "pt-BR") as "pt-BR" | "en";

    console.log(`📝 [REGISTER] Intento de registro: ${normalizedEmail}`);

    // 1. Verificar si el email está en la lista de usuarios elegibles
    const eligibleUser = await prisma.eligibleUser.findUnique({
      where: { email: normalizedEmail },
      include: { credit: true },
    });

    // Usuario NO está en la lista de elegibles
    if (!eligibleUser) {
      console.log(`❌ [REGISTER] Email no elegible: ${normalizedEmail}`);
      return NextResponse.json(
        {
          success: false,
          error: "Este email no está registrado en el evento Cafe Cursor. Solo los asistentes aprobados pueden obtener créditos.",
          code: "NOT_ELIGIBLE",
        },
        { status: 403 }
      );
    }

    // Usuario no está aprobado
    if (eligibleUser.approvalStatus !== "approved") {
      console.log(`⚠️ [REGISTER] Usuario no aprobado: ${normalizedEmail} (status: ${eligibleUser.approvalStatus})`);
      return NextResponse.json(
        {
          success: false,
          error: "Tu registro en el evento aún no ha sido aprobado. Por favor contacta al organizador.",
          code: "NOT_APPROVED",
        },
        { status: 403 }
      );
    }

    // 2. Verificar si ya reclamó su crédito
    if (eligibleUser.hasClaimed && eligibleUser.credit) {
      console.log(`⚠️ [REGISTER] Usuario ya reclamó crédito: ${normalizedEmail}`);
      return NextResponse.json(
        {
          success: true,
          message: "¡Ya reclamaste tu crédito! Aquí está nuevamente:",
          credit: eligibleUser.credit.link,
          isExisting: true,
          user: {
            name: eligibleUser.name,
            email: eligibleUser.email,
          },
        },
        { status: 200 }
      );
    }

    // 3. Determinar si es usuario de test
    const isTestUser = eligibleUser.company === "Test Company";

    // 4. Buscar un crédito disponible (test para usuarios test, real para usuarios reales)
    const availableCredit = await prisma.credit.findFirst({
      where: { 
        isUsed: false,
        isTest: isTestUser,  // Test users get test credits, real users get real credits
      },
      orderBy: { createdAt: "asc" },
    });

    if (!availableCredit) {
      console.log(`❌ [REGISTER] No hay créditos disponibles (isTest: ${isTestUser})`);
      return NextResponse.json(
        {
          success: false,
          error: "Lo sentimos, no hay créditos disponibles en este momento. Por favor contacta al organizador.",
          code: "NO_CREDITS",
        },
        { status: 503 }
      );
    }

    // 5. Asignar crédito en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Actualizar usuario como que ya reclamó
      const updatedUser = await tx.eligibleUser.update({
        where: { id: eligibleUser.id },
        data: {
          name: name || eligibleUser.name, // Actualizar nombre si se proporcionó
          hasClaimed: true,
          claimedAt: new Date(),
          creditId: availableCredit.id,
        },
      });

      // Marcar crédito como usado
      await tx.credit.update({
        where: { id: availableCredit.id },
        data: {
          isUsed: true,
          assignedAt: new Date(),
        },
      });

      return updatedUser;
    });

    console.log(`✅ [REGISTER] Crédito asignado: ${normalizedEmail} -> ${availableCredit.code} (test: ${isTestUser})`);

    // 6. Enviar email de confirmación (en background, no bloqueante)
    sendCreditEmail({
      to: normalizedEmail,
      name: result.name,
      creditLink: availableCredit.link,
      creditCode: availableCredit.code,
      company: result.company || undefined,
      isTest: isTestUser,
      locale,
    }).catch((err) => {
      console.error(`⚠️ [REGISTER] Error enviando email (no bloqueante):`, err);
    });

    return NextResponse.json(
      {
        success: true,
        message: "¡Felicidades! Aquí está tu crédito de Cursor:",
        credit: availableCredit.link,
        isTest: isTestUser,
        user: {
          name: result.name,
          email: result.email,
          company: result.company,
        },
        emailSent: true,
      },
      { status: 201 }
    );
  } catch (error) {
    // Error de validación
    if (error instanceof ZodError) {
      console.log(`⚠️ [REGISTER] Error de validación:`, error.errors);
      return NextResponse.json(
        {
          success: false,
          error: error.errors[0]?.message || "Datos inválidos",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    // Error general
    console.error(`❌ [REGISTER] Error interno:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor. Por favor intenta de nuevo.",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/register
 * Obtiene estadísticas públicas (sin datos sensibles)
 */
export async function GET() {
  try {
    const [availableReal, availableTest, totalEligible, claimed] = await Promise.all([
      prisma.credit.count({ where: { isUsed: false, isTest: false } }),
      prisma.credit.count({ where: { isUsed: false, isTest: true } }),
      prisma.eligibleUser.count({ where: { approvalStatus: "approved" } }),
      prisma.eligibleUser.count({ where: { hasClaimed: true } }),
    ]);

    return NextResponse.json({
      available: availableReal > 0,
      remaining: availableReal,
      stats: {
        totalEligible,
        claimed,
        pending: totalEligible - claimed,
      },
    });
  } catch (error) {
    console.error(`❌ [STATS] Error:`, error);
    return NextResponse.json(
      { available: false, remaining: 0 },
      { status: 500 }
    );
  }
}
