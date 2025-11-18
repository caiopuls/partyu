import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ ticketId: string }> },
) {
  const { ticketId } = await context.params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Buscar dados do perfil para exibir nome e CPF/documento
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .single();

  const { data: ticket, error } = await supabase
    .from("user_tickets")
    .select(
      `
      *,
      events(*),
      event_ticket_types(*)
    `,
    )
    .eq("id", ticketId)
    .eq("user_id", user.id)
    .single();

  if (error || !ticket) {
    console.error("Error fetching ticket for PDF:", error);
    return new Response("Ticket not found", { status: 404 });
  }

  const event = ticket.events;
  const ticketType = ticket.event_ticket_types;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 840]);
  const { width, height } = page.getSize();

  const fontTitle = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontBody = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Faixa superior minimalista (inspirada no header)
  page.drawRectangle({
    x: 0,
    y: height - 80,
    width,
    height: 80,
    color: rgb(0.06, 0.07, 0.11),
  });

  // Logo PartyU
  const logoText = "PARTYU";
  const logoSize = 24;
  page.drawText(logoText, {
    x: 70,
    y: height - 50,
    size: logoSize,
    font: fontTitle,
    color: rgb(0.64, 0.47, 1),
  });

  page.drawText("Ingresso digital", {
    x: 70,
    y: height - 72,
    size: 12,
    font: fontBody,
    color: rgb(0.88, 0.88, 0.95),
  });

  // Event info
  const eventTitle = event?.title ?? "Evento";
  page.drawText(eventTitle, {
    x: 70,
    y: height - 130,
    size: 18,
    font: fontTitle,
    color: rgb(1, 1, 1),
    maxWidth: 360,
  });

  const eventDate = event?.event_date
    ? new Date(event.event_date).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Data a definir";

  const eventLocation = event
    ? `${event.venue ? event.venue + " - " : ""}${event.city}, ${event.state}`
    : "Local a definir";

  page.drawText(`Data: ${eventDate}`, {
    x: 70,
    y: height - 160,
    size: 12,
    font: fontBody,
    color: rgb(0.8, 0.8, 0.9),
  });

  page.drawText(`Local: ${eventLocation}`, {
    x: 70,
    y: height - 180,
    size: 12,
    font: fontBody,
    color: rgb(0.8, 0.8, 0.9),
  });

  // User info
  // Titular do ingresso (nome + CPF/documento)
  const holderName = profile?.full_name || "Nome não informado";
  const rawCpf = profile?.phone || "";
  const cpfDigits = rawCpf.replace(/\D/g, "");
  const cpfFormatted =
    cpfDigits.length === 11
      ? `${cpfDigits.slice(0, 3)}.${cpfDigits.slice(3, 6)}.${cpfDigits.slice(
          6,
          9,
        )}-${cpfDigits.slice(9)}`
      : rawCpf || "CPF não informado";

  page.drawText("Titular do ingresso", {
    x: 70,
    y: height - 220,
    size: 11,
    font: fontBody,
    color: rgb(0.4, 0.4, 0.5),
  });

  page.drawText(holderName, {
    x: 70,
    y: height - 238,
    size: 12,
    font: fontTitle,
    color: rgb(1, 1, 1),
  });

  page.drawText(`CPF: ${cpfFormatted}`, {
    x: 70,
    y: height - 256,
    size: 10,
    font: fontBody,
    color: rgb(0.45, 0.45, 0.55),
  });

  // Ticket info
  const ticketLabel = ticketType?.name || "Ingresso";
  const ticketNumber = ticket.ticket_number || ticket.id;

  page.drawText("Tipo de ingresso", {
    x: 70,
    y: height - 290,
    size: 11,
    font: fontBody,
    color: rgb(0.7, 0.7, 0.85),
  });

  page.drawText(ticketLabel, {
    x: 70,
    y: height - 308,
    size: 12,
    font: fontTitle,
    color: rgb(1, 1, 1),
  });

  page.drawText("Número do ingresso", {
    x: 70,
    y: height - 340,
    size: 11,
    font: fontBody,
    color: rgb(0.7, 0.7, 0.85),
  });

  page.drawText(ticketNumber, {
    x: 70,
    y: height - 358,
    size: 12,
    font: fontTitle,
    color: rgb(1, 1, 1),
  });

  // Identificadores
  page.drawText("Identificadores únicos", {
    x: 70,
    y: height - 390,
    size: 11,
    font: fontBody,
    color: rgb(0.7, 0.7, 0.85),
  });

  page.drawText(`Ticket ID: ${ticket.id}`, {
    x: 70,
    y: height - 408,
    size: 10,
    font: fontBody,
    color: rgb(0.85, 0.85, 0.95),
  });

  page.drawText(`Evento ID: ${event?.id ?? "-"}`, {
    x: 70,
    y: height - 424,
    size: 10,
    font: fontBody,
    color: rgb(0.85, 0.85, 0.95),
  });

  // QR Code
  const qrPayload = JSON.stringify({
    type: "ticket",
    ticketId: ticket.id,
    ticketNumber,
    eventId: event?.id,
  });

  const qrDataUrl = await QRCode.toDataURL(qrPayload, {
    width: 260,
    margin: 1,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });

  const qrBase64 = qrDataUrl.split(",")[1];
  const qrImageBytes = Uint8Array.from(
    Buffer.from(qrBase64 ?? "", "base64"),
  );
  const qrImage = await pdfDoc.embedPng(qrImageBytes);

  const qrSize = 180;
  const qrX = width - qrSize - 90;
  const qrY = height - qrSize - 220;

  page.drawRectangle({
    x: qrX - 10,
    y: qrY - 10,
    width: qrSize + 20,
    height: qrSize + 20,
    color: rgb(0.05, 0.05, 0.09),
    borderColor: rgb(0.6, 0.5, 1),
    borderWidth: 1,
  });

  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: qrSize,
    height: qrSize,
  });

  page.drawText("Apresente este QR code na entrada do evento.", {
    x: qrX - 20,
    y: qrY - 28,
    size: 9,
    font: fontBody,
    color: rgb(0.8, 0.8, 0.9),
  });

  // Footer / certification
  page.drawText("Certificação PartyU", {
    x: 70,
    y: 120,
    size: 11,
    font: fontBody,
    color: rgb(0.7, 0.7, 0.85),
  });

  page.drawText(
    "Este ingresso é único, nominal e verificado pela PartyU. Qualquer tentativa de cópia será automaticamente bloqueada.",
    {
      x: 70,
      y: 104,
      size: 9,
      font: fontBody,
      color: rgb(0.78, 0.78, 0.9),
      maxWidth: width - 140,
    },
  );

  page.drawText("party u . io", {
    x: width - 140,
    y: 90,
    size: 9,
    font: fontBody,
    color: rgb(0.5, 0.5, 0.85),
  });

  const pdfBytes = await pdfDoc.save();

  return new Response(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=partyU-ticket-${ticket.id}.pdf`,
    },
  });
}
