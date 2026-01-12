import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { sendCreditEmail } from "@/lib/email";

/**
 * POST /api/admin/actions - Ejecutar acciones administrativas
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, data } = body;

    console.log(`⚡ [ADMIN] Acción: ${action}`);

    switch (action) {
      case "ASSIGN_CREDIT": {
        // Asignar crédito manualmente a un usuario
        const { email, useTestCredit } = data;
        
        const eligibleUser = await prisma.eligibleUser.findUnique({
          where: { email },
        });

        if (!eligibleUser) {
          return NextResponse.json(
            { error: "Usuario no encontrado" },
            { status: 404 }
          );
        }

        if (eligibleUser.hasClaimed) {
          return NextResponse.json(
            { error: "El usuario ya tiene un crédito asignado" },
            { status: 400 }
          );
        }

        // Buscar crédito disponible
        const credit = await prisma.credit.findFirst({
          where: {
            isUsed: false,
            isTest: useTestCredit || false,
          },
          orderBy: { createdAt: "asc" },
        });

        if (!credit) {
          return NextResponse.json(
            { error: "No hay créditos disponibles" },
            { status: 400 }
          );
        }

        // Asignar crédito
        await prisma.$transaction([
          prisma.eligibleUser.update({
            where: { id: eligibleUser.id },
            data: {
              hasClaimed: true,
              claimedAt: new Date(),
              creditId: credit.id,
            },
          }),
          prisma.credit.update({
            where: { id: credit.id },
            data: {
              isUsed: true,
              assignedAt: new Date(),
            },
          }),
        ]);

        console.log(`✅ [ADMIN] Crédito asignado manualmente: ${email} -> ${credit.code}`);

        return NextResponse.json({
          success: true,
          message: `Crédito ${credit.code} asignado a ${email}`,
          credit: credit.link,
        });
      }

      case "REVOKE_CREDIT": {
        // Revocar crédito de un usuario
        const { userId } = data;

        const user = await prisma.eligibleUser.findUnique({
          where: { id: userId },
          include: { credit: true },
        });

        if (!user) {
          return NextResponse.json(
            { error: "Usuario no encontrado" },
            { status: 404 }
          );
        }

        if (!user.hasClaimed || !user.creditId) {
          return NextResponse.json(
            { error: "El usuario no tiene crédito asignado" },
            { status: 400 }
          );
        }

        // Revocar crédito
        await prisma.$transaction([
          prisma.eligibleUser.update({
            where: { id: userId },
            data: {
              hasClaimed: false,
              claimedAt: null,
              creditId: null,
            },
          }),
          prisma.credit.update({
            where: { id: user.creditId },
            data: {
              isUsed: false,
              assignedAt: null,
            },
          }),
        ]);

        console.log(`🔄 [ADMIN] Crédito revocado: ${user.email}`);

        return NextResponse.json({
          success: true,
          message: `Crédito revocado de ${user.email}`,
        });
      }

      case "ADD_ELIGIBLE_USER": {
        // Agregar usuario elegible manualmente
        const { email, name, company, approvalStatus } = data;

        const existing = await prisma.eligibleUser.findUnique({
          where: { email },
        });

        if (existing) {
          return NextResponse.json(
            { error: "El usuario ya existe" },
            { status: 400 }
          );
        }

        const newUser = await prisma.eligibleUser.create({
          data: {
            email,
            name,
            company: company || null,
            approvalStatus: approvalStatus || "approved",
          },
        });

        console.log(`➕ [ADMIN] Usuario elegible agregado: ${email}`);

        return NextResponse.json({
          success: true,
          message: `Usuario ${email} agregado`,
          user: newUser,
        });
      }

      case "UPDATE_USER_STATUS": {
        // Actualizar estado de aprobación de usuario
        const { userId, approvalStatus } = data;

        await prisma.eligibleUser.update({
          where: { id: userId },
          data: { approvalStatus },
        });

        console.log(`📝 [ADMIN] Estado de usuario actualizado: ${userId} -> ${approvalStatus}`);

        return NextResponse.json({
          success: true,
          message: `Estado actualizado a ${approvalStatus}`,
        });
      }

      case "ADD_CREDIT": {
        // Agregar crédito manualmente
        const { code, link, isTest } = data;

        const existing = await prisma.credit.findFirst({
          where: { code },
        });

        if (existing) {
          return NextResponse.json(
            { error: "El código de crédito ya existe" },
            { status: 400 }
          );
        }

        const newCredit = await prisma.credit.create({
          data: {
            code,
            link,
            isTest: isTest || false,
          },
        });

        console.log(`➕ [ADMIN] Crédito agregado: ${code}`);

        return NextResponse.json({
          success: true,
          message: `Crédito ${code} agregado`,
          credit: newCredit,
        });
      }

      case "DELETE_CREDIT": {
        // Eliminar crédito (solo si no está asignado)
        const { creditId } = data;

        const credit = await prisma.credit.findUnique({
          where: { id: creditId },
        });

        if (!credit) {
          return NextResponse.json(
            { error: "Crédito no encontrado" },
            { status: 404 }
          );
        }

        if (credit.isUsed) {
          return NextResponse.json(
            { error: "No se puede eliminar un crédito asignado" },
            { status: 400 }
          );
        }

        await prisma.credit.delete({
          where: { id: creditId },
        });

        console.log(`🗑️ [ADMIN] Crédito eliminado: ${credit.code}`);

        return NextResponse.json({
          success: true,
          message: `Crédito ${credit.code} eliminado`,
        });
      }

      case "SEND_CREDIT_EMAIL": {
        // Enviar/reenviar email con el link del crédito
        const { userId, locale } = data;

        const user = await prisma.eligibleUser.findUnique({
          where: { id: userId },
          include: { credit: true },
        });

        if (!user) {
          return NextResponse.json(
            { error: "Usuario no encontrado" },
            { status: 404 }
          );
        }

        if (!user.hasClaimed || !user.credit) {
          return NextResponse.json(
            { error: "El usuario no tiene crédito asignado" },
            { status: 400 }
          );
        }

        // Enviar email
        const emailResult = await sendCreditEmail({
          to: user.email,
          name: user.name,
          creditLink: user.credit.link,
          creditCode: user.credit.code,
          company: user.company || undefined,
          isTest: user.credit.isTest,
          locale: locale || "pt-BR",
        });

        if (!emailResult.success) {
          console.error(`❌ [ADMIN] Error enviando email a ${user.email}:`, emailResult.error);
          return NextResponse.json(
            { error: `Error enviando email: ${emailResult.error}` },
            { status: 500 }
          );
        }

        console.log(`📧 [ADMIN] Email enviado manualmente a: ${user.email}`);

        return NextResponse.json({
          success: true,
          message: `Email enviado a ${user.email}`,
        });
      }

      default:
        return NextResponse.json(
          { error: "Acción no válida" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("❌ [ADMIN] Error ejecutando acción:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
