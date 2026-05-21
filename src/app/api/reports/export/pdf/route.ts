import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import PDFDocument from "pdfkit-table";

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthUser(req);
    if (!userId) return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });

    const transactions = await prisma.transaction.findMany({
      where: { user_id: userId },
      include: { category: true },
      orderBy: { transaction_date: "desc" },
    });

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    const chunks: Buffer[] = [];
    
    doc.on('data', chunk => chunks.push(chunk));
    
    // Add title
    doc.fontSize(20).text("Laporan Transaksi Keuangan", { align: 'center' });
    doc.moveDown();

    const table = {
      title: "Daftar Transaksi",
      headers: ["Tanggal", "Kategori", "Tipe", "Nominal", "Catatan"],
      rows: transactions.map(tx => [
        tx.transaction_date.toISOString().split("T")[0],
        tx.category?.name || "-",
        tx.type === "income" ? "Pemasukan" : "Pengeluaran",
        `Rp ${Number(tx.amount).toLocaleString("id-ID")}`,
        tx.description || "-"
      ])
    };

    await doc.table(table, {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
      prepareRow: () => doc.font("Helvetica").fontSize(10)
    });

    doc.end();

    // Create promise to wait for document end
    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });

    return new Response(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="laporan-transaksi.pdf"',
      }
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
