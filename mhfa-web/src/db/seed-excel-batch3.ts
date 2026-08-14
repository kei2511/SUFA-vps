import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

interface UserSeedData {
  no: number;
  name: string;
  phone?: string;
  email: string;
  role: "Konselor" | "Konseli";
  counselorNo?: number; // link konseli to konselor by NO in this batch
}

const DEFAULT_PASSWORD = "password123";

const batch3Users: UserSeedData[] = [
  // Group 1 - Konselor: ABIYYU HANIF KAMIL (NO 1)
  { no: 1, name: "ABIYYU HANIF KAMIL", phone: "081294873183", email: "Abiyyuherni03@gmail.com", role: "Konselor" },
  { no: 2, name: "AFIFA FAIZA MAHIRA", phone: "085805717442", email: "mafifafaiza@gmail.com", role: "Konseli", counselorNo: 1 },
  { no: 3, name: "Andhika Dimas Akbar", phone: "089322831643", email: "dikaajoe5@gmail.com", role: "Konseli", counselorNo: 1 },
  { no: 4, name: "ANINDYA NAIFA BASYASYA", email: "anindyanaifabasyasya@gmail.com", role: "Konseli", counselorNo: 1 },

  // Group 2 - Konselor: AQILLA ELBY NABHAN (NO 5)
  { no: 5, name: "AQILLA ELBY NABHAN", phone: "085841613433", email: "Aqillaelbynabhan@gmail.com", role: "Konselor" },
  { no: 6, name: "ASYIFA DWI UTAMI", phone: "08826102193", email: "Asyifadwiutami_urss@gmail.com", role: "Konseli", counselorNo: 5 },
  { no: 7, name: "AURA SELLA VITA", email: "aurasellavita@gmail.com", role: "Konseli", counselorNo: 5 },

  // Group 3 - Konselor: AWANGGA FAZZRI SUDIRO (NO 8)
  { no: 8, name: "AWANGGA FAZZRI SUDIRO", phone: "08977835594", email: "awanggafazzril12@gmail.com", role: "Konselor" },
  { no: 9, name: "AYU NINGTHIYAS", phone: "089626051832", email: "ayuningthyas2708@gmail.com", role: "Konseli", counselorNo: 8 },
  { no: 10, name: "BALQIS ALYA ZAKIA", phone: "08386417349", email: "hydratbluee@gmail.com", role: "Konseli", counselorNo: 8 },
  { no: 11, name: "CANTIKA NATASYA", phone: "089528903662", email: "cantikanatasya195@gmail.com", role: "Konseli", counselorNo: 8 },

  // Group 4 - Konselor: CLARA MAHDALENA (NO 12)
  { no: 12, name: "CLARA MAHDALENA", phone: "081273144655", email: "claramahdalena51@gmail.com", role: "Konselor" },
  { no: 13, name: "DHIA NAILLAH FARRAS", phone: "082279918545", email: "dhianaillahfarras12@gmail.com", role: "Konseli", counselorNo: 12 },
  { no: 14, name: "DZAKY NUR SHABRANI", phone: "085609260863", email: "dzakynurnur@gmail.com", role: "Konseli", counselorNo: 12 },
  { no: 15, name: "FARA WATI", phone: "089617381212", email: "faramanis@gmail.com", role: "Konseli", counselorNo: 12 },

  // Group 5 - Konselor: FIRQOH NAJIYAH (NO 16)
  { no: 16, name: "FIRQOH NAJIYAH", phone: "088975635206", email: "FirqohNajiyah92@gmail.com", role: "Konselor" },
  { no: 17, name: "JESICA CARREN ANASTASYA", phone: "088975635206", email: "jessicacarrenanastasya@gmail.com", role: "Konseli", counselorNo: 16 },
  { no: 18, name: "Karina Azzahra", phone: "089528481170", email: "karinaazzahra798@gmail.com", role: "Konseli", counselorNo: 16 },

  // Group 6 - Konselor: M. DECO SAPUTRA (NO 19)
  { no: 19, name: "M. DECO SAPUTRA", phone: "083191147993", email: "MDecoSaputra86@gmail.com", role: "Konselor" },
  { no: 20, name: "M. REIHAN SYAH PRABU UTHAMA", phone: "082189006175", email: "reihansyahprabu22@gmail.com", role: "Konseli", counselorNo: 19 },
  { no: 21, name: "M. SACHIO PUTRA BATORO", email: "msachioputrabatoro@gmail.com", role: "Konseli", counselorNo: 19 },

  // Group 7 - Konselor: META WAHYUNING SETIYAWATI (NO 22)
  { no: 22, name: "META WAHYUNING SETIYAWATI", phone: "082235819145", email: "MetaWSetiyawati@gmail.com", role: "Konselor" },
  { no: 23, name: "Muhammad Rafif Surya Abdika", phone: "088286758160", email: "muhammadrafifsuryaabdika@gmail.com", role: "Konseli", counselorNo: 22 },
  { no: 24, name: "Muhammad Rafli Santoso", phone: "085715825136", email: "muhammadrafli.santoso78@gmail.com", role: "Konseli", counselorNo: 22 },
  { no: 25, name: "NADA FITRIYA GUSTOMY", phone: "08983301630", email: "kittycuties101@gmail.com", role: "Konseli", counselorNo: 22 },

  // Group 8 - Konselor: NAYIRA KHANSA PUTRI DERDYA (NO 26)
  { no: 26, name: "NAYIRA KHANSA PUTRI DERDYA", phone: "085768266523", email: "nayirakhansa30@gmail.com", role: "Konselor" },
  { no: 27, name: "NUR AZIZAH", phone: "082373382675", email: "nurazizah20237@gmail.com", role: "Konseli", counselorNo: 26 },
  { no: 28, name: "Okta Riani", phone: "082184005308", email: "Okta77607@gmail.com", role: "Konseli", counselorNo: 26 },
  { no: 29, name: "RADIT ANGGARA", phone: "083118117722", email: "raditanggara.x9@gmail.com", role: "Konseli", counselorNo: 26 },

  // Group 9 - Konselor: RAHMA KHOIRUNNISA (NO 30)
  { no: 30, name: "RAHMA KHOIRUNNISA", phone: "085789177214", email: "Nisarahmaa089@gmail.com", role: "Konselor" },
  { no: 31, name: "RISKI PRATAMA SIAGIAN", phone: "085171205132", email: "riskiqiasudoku@gmail.com", role: "Konseli", counselorNo: 30 },
  { no: 32, name: "Saffa Adinda Putri Ariyadi", phone: "082181085202", email: "saffamarwa1012@gmail.com", role: "Konseli", counselorNo: 30 },

  // Group 10 - Konselor: SARAH RAMADANI (NO 33)
  { no: 33, name: "SARAH RAMADANI", phone: "089653276828", email: "sarahramadani09@icloud.com", role: "Konselor" },
  { no: 34, name: "SHAKILA AHZA DAMAKYNA", email: "shakilaahzadamakyna@gmail.com", role: "Konseli", counselorNo: 33 },
  { no: 35, name: "SUCI RAHMA SARI", phone: "089510832942", email: "rahmasuci1683@gmail.com", role: "Konseli", counselorNo: 33 },
  { no: 36, name: "ZAHIRAH AFTANI ILMI", phone: "085764684970", email: "selanddo.0@gmail.com", role: "Konseli", counselorNo: 33 },
];

async function seedBatch3Users() {
  const { db } = await import("./index");
  const { user } = await import("./schema");
  const { auth } = await import("../lib/auth");
  const { eq } = await import("drizzle-orm");

  console.log(`=== BATCH 3 EXCEL USER IMPORT (${batch3Users.length} USERS TOTAL) ===`);
  console.log(`Default Password for all accounts: '${DEFAULT_PASSWORD}'\n`);

  const counselorIdMap = new Map<number, string>();

  // 1. Process Konselor first
  const counselors = batch3Users.filter(u => u.role === "Konselor");
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
      const codeToUse = existing.counselorCode || `KSL-B3-${String(c.no).padStart(3, "0")}`;
      await db.update(user).set({
        name: c.name,
        role: "Konselor",
        phone: c.phone || null,
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
          phone: c.phone || null,
          status: "Aktif",
        }
      } as any);

      if (!res || !(res as any).user) {
        console.error(`❌ [FAILED] Could not sign up ${c.name}`);
        continue;
      }

      userId = (res as any).user.id;
      const codeToUse = `KSL-B3-${String(c.no).padStart(3, "0")}`;
      await db.update(user).set({
        role: "Konselor",
        counselorCode: codeToUse,
        phone: c.phone || null,
      }).where(eq(user.id, userId));
    }

    counselorIdMap.set(c.no, userId);
  }

  // 2. Process Konseli next and assign to respective Konselor
  const konselis = batch3Users.filter(u => u.role === "Konseli");
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
        phone: k.phone || null,
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
          phone: k.phone || null,
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
          phone: k.phone || null,
        }).where(eq(user.id, userId));
      }
    }
  }

  console.log("\n==============================================");
  console.log(`🎉 ALL ${batch3Users.length} ACCOUNTS PROCESSED & INPUTTED TO DB SUCCESSFULLY!`);
  console.log("==============================================");
  process.exit(0);
}

seedBatch3Users().catch(err => {
  console.error("Fatal error during batch 3 seed:", err);
  process.exit(1);
});
