import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthUser(req);
    if (!userId) return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });

    const transactions = await prisma.transaction.findMany({
      where: { user_id: userId },
      include: { category: true },
      orderBy: { transaction_date: "desc" },
    });

    let csvContent = "ID,Tanggal,Kategori,Tipe,Nominal,Catatan,Sumber\n";
    
    transactions.forEach(tx => {
      const date = tx.transaction_date.toISOString().split("T")[0];
      const category = tx.category?.name || "-";
      const type = tx.type === "income" ? "Pemasukan" : "Pengeluaran";
      const desc = `"${(tx.description || "").replace(/"/g, '""')}"`;
      
      csvContent += `${tx.id},${date},${category},${type},${tx.amount},${desc},${tx.source}\n`;
    });

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="laporan-transaksi.csv"',
      }
    });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
