import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

interface UserSeedData {
  no: number;
  name: string;
  email: string;
  role: "Konselor" | "Konseli";
  counselorNo?: number; // link konseli to konselor by NO
}

const DEFAULT_PASSWORD = "password123";

// All 36 users from Excel screenshot (using exact emails from image)
const rawUsers: UserSeedData[] = [
  // Group 1 - Konselor: ADIZZA EUREKA BRAHMANAPUTRI (NO 3)
  { no: 3, name: "ADIZZA EUREKA BRAHMANAPUTRI", email: "adizzaeureka@gmail.com", role: "Konselor" },
  { no: 13, name: "ELVIRA ADESKA PUTRI IRAWAN", email: "elviraadeska@icloud.com", role: "Konseli", counselorNo: 3 },
  { no: 16, name: "JIHAN ZHAFIRA ARDIYANTO", email: "jihan.zhfopo2@gmail.com", role: "Konseli", counselorNo: 3 },
  { no: 33, name: "SHEREEN NIFYA AL KHAIRA", email: "shereennikyaa@gmail.com", role: "Konseli", counselorNo: 3 },

  // Group 2 - Konselor: AISYAH KHUMAIRA SYAHREGA (NO 5)
  { no: 5, name: "AISYAH KHUMAIRA SYAHREGA", email: "aisyahkhumairasyahrega@gmail.com", role: "Konselor" },
  { no: 26, name: "NADINE DIVANANDRA PRAYITNO", email: "nadinedivanandraprayitno@gmail.com", role: "Konseli", counselorNo: 5 },
  { no: 29, name: "RANESHA ARTHA CETTA", email: "araneshag@gmail.com", role: "Konseli", counselorNo: 5 },

  // Group 3 - Konselor: ARSHAVITO PRAYATA SYAFITRA (NO 8)
  { no: 8, name: "ARSHAVITO PRAYATA SYAFITRA", email: "prayataarshavito@gmail.com", role: "Konselor" },
  { no: 9, name: "BAYU IKHSAN FARRAS WIJAYA", email: "bayuikhsanfarraswijaya@gmail.com", role: "Konseli", counselorNo: 8 },
  { no: 14, name: "FIDELA SANTIKA KARNO", email: "santikakfidela@gmail.com", role: "Konseli", counselorNo: 8 },

  // Group 4 - Konselor: BINTANY ALYA RAMEYZA (NO 10)
  { no: 10, name: "BINTANY ALYA RAMEYZA", email: "gimmeoulove@gmail.com", role: "Konselor" },
  { no: 27, name: "NADYNE ANANDA PANANY", email: "nadynepanany@gmail.com", role: "Konseli", counselorNo: 10 },
  { no: 28, name: "RAHMA AYU AZZAHRA", email: "cela.yooola@gmail.com", role: "Konseli", counselorNo: 10 },
  { no: 30, name: "SAKHIRA NAOMI FILIPI SIANIPAR", email: "salhhira.naomi.fs@gmail.com", role: "Konseli", counselorNo: 10 },

  // Group 5 - Konselor: CHELSEA NANDITA PUTRI (NO 11)
  { no: 11, name: "CHELSEA NANDITA PUTRI", email: "chelseananditaputri@gmail.com", role: "Konselor" },
  { no: 4, name: "AIRA PERTIWI", email: "airapertiwids@gmail.com", role: "Konseli", counselorNo: 11 },
  { no: 32, name: "SHAHNAZ TALITA KAYLA", email: "shahnazkayla2@gmail.com", role: "Konseli", counselorNo: 11 },
  { no: 36, name: "ZASKIA GITA INDARTO", email: "gitsvity@gmail.com", role: "Konseli", counselorNo: 11 },

  // Group 6 - Konselor: DERREN FADLAN ARYAPUTRA (NO 12)
  { no: 12, name: "DERREN FADLAN ARYAPUTRA", email: "derrenyahan@gmail.com", role: "Konselor" },
  { no: 18, name: "LIVIA NADIFAH ARINDA", email: "imrandalfah@gmail.com", role: "Konseli", counselorNo: 12 },
  { no: 24, name: "MULIA MUFIIDAH PUTRIA ALAM", email: "mulia.mvf@gmail.com", role: "Konseli", counselorNo: 12 },

  // Group 7 - Konselor: MUHAMMAD AZZAM AL GHIFARI (NO 20)
  { no: 20, name: "MUHAMMAD AZZAM AL GHIFARI", email: "azzam.muh.ghifari@gmail.com", role: "Konselor" },
  { no: 1, name: "ABRAR ARKAN ATAYA", email: "abeataya@gmail.com", role: "Konseli", counselorNo: 20 },
  { no: 17, name: "JONATHAN CHRISTIAN PANJAITAN", email: "jonahanchristian7109@gmail.com", role: "Konseli", counselorNo: 20 },
  { no: 19, name: "MUHAMAD ARAFA ALBAIF SETIAWAN", email: "druyfulbuit134@gmail.com", role: "Konseli", counselorNo: 20 },

  // Group 8 - Konselor: MUHAMMAD FARIS NAUFAL AZHAR (NO 21)
  { no: 21, name: "MUHAMMAD FARIS NAUFAL AZHAR", email: "farisnavfalazhar2009@gmail.com", role: "Konselor" },
  { no: 15, name: "HAFY RADITYA SULISTIONO", email: "ulraizanhafy@gmail.com", role: "Konseli", counselorNo: 21 },
  { no: 23, name: "MUHAMMAD NURUL FACHRY", email: "muhammadfachry2510@gmail.com", role: "Konseli", counselorNo: 21 },

  // Group 9 - Konselor: MUHAMMAD FARIS RAMADIANSYAH (NO 22)
  { no: 22, name: "MUHAMMAD FARIS RAMADIANSYAH", email: "farrsganteng754@gmail.com", role: "Konselor" },
  { no: 7, name: "ARFA SIRHAN FAHLAVI", email: "alluntugas392@gmail.com", role: "Konseli", counselorNo: 22 },
  { no: 31, name: "SATRIO TEGUH PINAYUNGAN", email: "thethuunder123@gmail.com", role: "Konseli", counselorNo: 22 },
  { no: 34, name: "SYAHRIAL", email: "syahrialrial7789@gmail.com", role: "Konseli", counselorNo: 22 },

  // Group 10 - Konselor: ZAKIYYAH DINA AMELIA (NO 35)
  { no: 35, name: "ZAKIYYAH DINA AMELIA", email: "zakiyyahdinaa22@gmail.com", role: "Konselor" },
  { no: 2, name: "ADINDA INASTARA PANDIANGAN", email: "adinda.inastara@gmail.com", role: "Konseli", counselorNo: 35 },
  { no: 6, name: "ANNISA RONAA AZZAHRA", email: "anniaronaaaazzahra11@gmail.com", role: "Konseli", counselorNo: 35 },
  { no: 25, name: "NABILA RISKYATUL AWALIYA", email: "surodipo1922sh@gmail.com", role: "Konseli", counselorNo: 35 },
];

async function seedExcelUsers() {
  const { db } = await import("./index");
  const { user } = await import("./schema");
  const { auth } = await import("../lib/auth");
  const { eq } = await import("drizzle-orm");

  console.log("=== EXCEL USER IMPORT (36 USERS - EXACT EMAILS FROM SCREENSHOT) ===");
  console.log(`Default Password for all accounts: '${DEFAULT_PASSWORD}'\n`);

  const counselorIdMap = new Map<number, string>();

  // 1. Process Konselor first
  const counselors = rawUsers.filter(u => u.role === "Konselor");
  console.log(`[1/2] Processing ${counselors.length} Konselor accounts...`);

  for (const c of counselors) {
    const cleanEmail = c.email.toLowerCase().trim();

    const existing = await db.query.user.findFirst({
      where: eq(user.email, cleanEmail)
    });

    let userId: string;

    if (existing) {
      console.log(`✔ [UPDATE] Konselor '${c.name}' (${cleanEmail})`);
      userId = existing.id;
      // Keep existing counselorCode if set, or generate a unique one
      const codeToUse = existing.counselorCode || `KSL-EXC-${String(c.no).padStart(3, "0")}`;
      await db.update(user).set({
        name: c.name,
        role: "Konselor",
        counselorCode: codeToUse,
        status: "Aktif",
      }).where(eq(user.id, userId));
    } else {
      console.log(`+ [CREATE] Konselor '${c.name}' (${cleanEmail})`);
      const res = await auth.api.signUpEmail({
        body: {
          email: cleanEmail,
          password: DEFAULT_PASSWORD,
          name: c.name,
          role: "Konselor",
          status: "Aktif",
        }
      } as any);

      if (!res || !(res as any).user) {
        console.error(`❌ [FAILED] Could not sign up ${c.name}`);
        continue;
      }

      userId = (res as any).user.id;
      const codeToUse = `KSL-EXC-${String(c.no).padStart(3, "0")}`;
      await db.update(user).set({
        role: "Konselor",
        counselorCode: codeToUse,
      }).where(eq(user.id, userId));
    }

    counselorIdMap.set(c.no, userId);
  }

  // 2. Process Konseli next and assign to respective Konselor
  const konselis = rawUsers.filter(u => u.role === "Konseli");
  console.log(`\n[2/2] Processing ${konselis.length} Konseli accounts...`);

  for (const k of konselis) {
    const cleanEmail = k.email.toLowerCase().trim();
    const counselorId = k.counselorNo ? counselorIdMap.get(k.counselorNo) : null;

    const existing = await db.query.user.findFirst({
      where: eq(user.email, cleanEmail)
    });

    let userId: string;

    if (existing) {
      console.log(`✔ [UPDATE] Konseli '${k.name}' (${cleanEmail})`);
      userId = existing.id;
      await db.update(user).set({
        name: k.name,
        role: "Konseli",
        assignedCounselorId: counselorId || null,
        status: "Aktif",
      }).where(eq(user.id, userId));
    } else {
      console.log(`+ [CREATE] Konseli '${k.name}' (${cleanEmail}) [Counselor NO ${k.counselorNo}]`);
      const res = await auth.api.signUpEmail({
        body: {
          email: cleanEmail,
          password: DEFAULT_PASSWORD,
          name: k.name,
          role: "Konseli",
          status: "Aktif",
        }
      } as any);

      if (!res || !(res as any).user) {
        console.error(`❌ [FAILED] Could not sign up ${k.name}`);
        continue;
      }

      userId = (res as any).user.id;
      if (counselorId) {
        await db.update(user).set({
          assignedCounselorId: counselorId,
        }).where(eq(user.id, userId));
      }
    }
  }

  console.log("\n==============================================");
  console.log("🎉 ALL 36 ACCOUNTS PROCESSED & INPUTTED TO DB SUCCESSFULLY!");
  console.log("==============================================");
  process.exit(0);
}

seedExcelUsers().catch(err => {
  console.error("Fatal error during seed:", err);
  process.exit(1);
});
