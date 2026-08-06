import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

interface UserSeedData {
  no: number;
  batch: number;
  name: string;
  phone: string;
  email: string;
  role: "Konselor" | "Konseli";
  counselorNo?: number; // link konseli to konselor by NO in this batch
}

const DEFAULT_PASSWORD = "password123";

const batch2Users: UserSeedData[] = [
  // ==================== IMAGE 1 ====================
  // Group 1 - Konselor: Jihan Mahira (NO 1)
  { batch: 2, no: 1, name: "Jihan Mahira", phone: "089654389778", email: "jihnmaira@gmail.com", role: "Konselor" },
  { batch: 2, no: 7, name: "Revisya Hernanda", phone: "089623081015", email: "revisyaa.h@gmail.com", role: "Konseli", counselorNo: 1 },
  { batch: 2, no: 8, name: "Salsabila Zulfa", phone: "085874040445", email: "salsa.zulfa2204@gmail.com", role: "Konseli", counselorNo: 1 },
  { batch: 2, no: 17, name: "Safa Ayu Ningtyas", phone: "089507932752", email: "safaayuningtyas@gmail.com", role: "Konseli", counselorNo: 1 },

  // Group 2 - Konselor: Azha Thalita S. (NO 2)
  { batch: 2, no: 2, name: "Azha Thalita S.", phone: "081539884773", email: "suwandithalita@gmail.com", role: "Konselor" },
  { batch: 2, no: 4, name: "Mayda Chantika S.", phone: "0895323169960", email: "maydachika044@gmail.com", role: "Konseli", counselorNo: 2 },
  { batch: 2, no: 5, name: "Anastasia Wela P.", phone: "082182226115", email: "anastasiasedayu643@gmail.com", role: "Konseli", counselorNo: 2 },

  // Group 3 - Konselor: Cantika Viola (NO 3)
  { batch: 2, no: 3, name: "Cantika Viola", phone: "08976632340", email: "fiolacantika4@gmail.com", role: "Konselor" },
  { batch: 2, no: 18, name: "Janeeta Cahyadi", phone: "088276798069", email: "janeetacahyadi999@gmail.com", role: "Konseli", counselorNo: 3 },
  { batch: 2, no: 26, name: "M. Fauzan Al Hafidz", phone: "081779175712", email: "fauzan.alhafidz2010@gmail.com", role: "Konseli", counselorNo: 3 },

  // Group 4 - Konselor: Auralyanie Althafannisa (NO 13)
  { batch: 2, no: 13, name: "Auralyanie Althafannisa", phone: "08952431980", email: "auracece0505@gmail.com", role: "Konselor" },
  { batch: 2, no: 11, name: "Aulia Suci Irawan", phone: "085709604985", email: "uciabi123@gmail.com", role: "Konseli", counselorNo: 13 },
  { batch: 2, no: 12, name: "Fani Khairunnisa", phone: "082189162310", email: "fan.khoirunnisa@gmail.com", role: "Konseli", counselorNo: 13 },
  { batch: 2, no: 25, name: "M. Bima Ramadhani", phone: "088286512171", email: "bimar8359@gmail.com", role: "Konseli", counselorNo: 13 },

  // Group 5 - Konselor: Nindhia Sharoon Jagofa (NO 14)
  { batch: 2, no: 14, name: "Nindhia Sharoon Jagofa", phone: "083147929948", email: "nindhiasharoon13@gmail.com", role: "Konselor" },
  { batch: 2, no: 9, name: "Nurisqi Amelia", phone: "08988095069", email: "nurisqiamelia88@gmail.com", role: "Konseli", counselorNo: 14 },
  { batch: 2, no: 23, name: "Fakhri Zaidan Hazman", phone: "089525787397", email: "fahri022022@gmail.com", role: "Konseli", counselorNo: 14 },
  { batch: 2, no: 24, name: "Najrar Retiawan", phone: "089517538800", email: "najrarsetiawan@gmail.com", role: "Konseli", counselorNo: 14 },

  // Group 6 - Konselor: Annisa Asri (NO 16)
  { batch: 2, no: 16, name: "Annisa Asri", phone: "083115062954", email: "anisaasri@gmail.com", role: "Konselor" },
  { batch: 2, no: 6, name: "Tiara Nurin Najwa", phone: "085209610089", email: "tiaranurinnajwa20@gmail.com", role: "Konseli", counselorNo: 16 },
  { batch: 2, no: 28, name: "Umeir Abdul Fatah", phone: "085142576314", email: "umeirabdulfatah@gmail.com", role: "Konseli", counselorNo: 16 },

  // Group 7 - Konselor: Ratna Mursita Wati (NO 19)
  { batch: 2, no: 19, name: "Ratna Mursita Wati", phone: "083822091531", email: "ratnaaa598@gmail.com", role: "Konselor" },
  { batch: 2, no: 15, name: "Yulia Dwi Tanti A.", phone: "083121848314", email: "yuliatanti2010@gmail.com", role: "Konseli", counselorNo: 19 },
  { batch: 2, no: 21, name: "Khilda Khairunisa M", phone: "088268318557", email: "khildakhairunnisa9.6@gmail.com", role: "Konseli", counselorNo: 19 },

  // Group 8 - Konselor: Rherey Ayu Zhifika (NO 20)
  { batch: 2, no: 20, name: "Rherey Ayu Zhifika", phone: "0895321370934", email: "zzhifika5@gmail.com", role: "Konselor" },
  { batch: 2, no: 10, name: "Ayu Wulandari", phone: "08177976764", email: "ayuw08005@gmail.com", role: "Konseli", counselorNo: 20 },
  { batch: 2, no: 22, name: "Dewi Artanti", phone: "082279914066", email: "artantidewi610@gmail.com", role: "Konseli", counselorNo: 20 },
  { batch: 2, no: 27, name: "Ahmad Satya Syuja'", phone: "089630701077", email: "ahmadsatya2020@gmail.com", role: "Konseli", counselorNo: 20 },

  // ==================== IMAGE 2 ====================
  // Group 9 - Konselor: Tina Rahma Dewi (NO 1 - Part 2)
  { batch: 2, no: 101, name: "Tina Rahma Dewi", phone: "082126718896", email: "tinarahma07@gmail.com", role: "Konselor" },
  { batch: 2, no: 126, name: "Zafira Naura S.", phone: "0838862616031", email: "nauralpg104@gmail.com", role: "Konseli", counselorNo: 101 },
  { batch: 2, no: 104, name: "Allysa Putri Khairina", phone: "085835404127", email: "allysaputrikhai@gmail.com", role: "Konseli", counselorNo: 101 },

  // Group 10 - Konselor: Rizka Alfa Resha A. (NO 2 - Part 2)
  { batch: 2, no: 102, name: "Rizka Alfa Resha A.", phone: "082183913027", email: "alfaresha27@gmail.com", role: "Konselor" },
  { batch: 2, no: 129, name: "Natassya Amelya", phone: "0895417649862", email: "natassyaamelya@gmail.com", role: "Konseli", counselorNo: 102 },
  { batch: 2, no: 120, name: "Shila Zahirah Z. S.", phone: "0895335302929", email: "shilazahirah20@gmail.com", role: "Konseli", counselorNo: 102 },

  // Group 11 - Konselor: Cheysa Arinta Putri (NO 3 - Part 2)
  { batch: 2, no: 103, name: "Cheysa Arinta Putri", phone: "089222828050", email: "cheysaarinta10@gmail.com", role: "Konselor" },
  { batch: 2, no: 110, name: "Salshabila Aulia A.", phone: "089630061583", email: "bila57058@gmail.com", role: "Konseli", counselorNo: 103 },
  { batch: 2, no: 114, name: "Citra Apriliyanti", phone: "083871862909", email: "citraapriliyanti024@gmail.com", role: "Konseli", counselorNo: 103 },

  // Group 12 - Konselor: Raisya Aqila Fadhia (NO 5 - Part 2)
  { batch: 2, no: 105, name: "Raisya Aqila Fadhia", phone: "089525773959", email: "raisyaaqilafadhia@gmail.com", role: "Konselor" },
  { batch: 2, no: 127, name: "Anggraini Aura Adisti", phone: "0895417307545", email: "auraadistyanggraini@gmail.com", role: "Konseli", counselorNo: 105 },

  // Group 13 - Konselor: Miena Alfathiya Malika (NO 15 - Part 2)
  { batch: 2, no: 115, name: "Miena Alfathiya Malika", phone: "084521932980", email: "alfathiyamalika@gmail.com", role: "Konselor" },
  { batch: 2, no: 111, name: "Yurika Pratiwi", phone: "085769073632", email: "ikayurika1234@gmail.com", role: "Konseli", counselorNo: 115 },

  // Group 14 - Konselor: Aliza Salsabila (NO 16 - Part 2)
  { batch: 2, no: 116, name: "Aliza Salsabila", phone: "089510670118", email: "alizasalsabila36@gmail.com", role: "Konselor" },
  { batch: 2, no: 132, name: "Bakaxia Zahran Akroihan", phone: "089675224177", email: "bakaxiaran@gmail.com", role: "Konseli", counselorNo: 116 },

  // Group 15 - Konselor: Safarotunnisa Nur F. (NO 17 - Part 2)
  { batch: 2, no: 117, name: "Safarotunnisa Nur F.", phone: "085839167670", email: "safarotunnisa91@gmail.com", role: "Konselor" },
  { batch: 2, no: 128, name: "Auren Zia Viarnes", phone: "0895417307549", email: "aurenziaviarnes@gmail.com", role: "Konseli", counselorNo: 117 },

  // Group 16 - Konselor: Juliyana (NO 18 - Part 2)
  { batch: 2, no: 118, name: "Juliyana", phone: "081541559137", email: "juliyananana5@gmail.com", role: "Konselor" },
  { batch: 2, no: 109, name: "Tefa Sekar Pralista", phone: "0895322158164", email: "tefasekar@gmail.com", role: "Konseli", counselorNo: 118 },

  // Group 17 - Konselor: Nabella Faran Az. Z. (NO 19 - Part 2)
  { batch: 2, no: 119, name: "Nabella Faran Az. Z.", phone: "085817262207", email: "nabelafarana@gmail.com", role: "Konselor" },
  { batch: 2, no: 125, name: "Adelia Tuahkusinji", phone: "082253094164", email: "adeliatsinji@gmail.com", role: "Konseli", counselorNo: 119 },

  // Group 18 - Konselor: Fransiska Calista H. (NO 21 - Part 2)
  { batch: 2, no: 121, name: "Fransiska Calista H.", phone: "083181908575", email: "fransiska17@gmail.com", role: "Konselor" },
  { batch: 2, no: 124, name: "Nazwa Aulia Putri", phone: "085185208969", email: "nazwaauliaputrii10@gmail.com", role: "Konseli", counselorNo: 121 },

  // Group 19 - Konselor: Mely Apriana (NO 22 - Part 2)
  { batch: 2, no: 122, name: "Mely Apriana", phone: "083838488303", email: "novelitanababan@gmail.com", role: "Konselor" },
  { batch: 2, no: 108, name: "Atha Azalia A.", phone: "089510633069", email: "athathomo@gmail.com", role: "Konseli", counselorNo: 122 },

  // Group 20 - Konselor: Najwa Aulia Zahra (NO 23 - Part 2)
  { batch: 2, no: 123, name: "Najwa Aulia Zahra", phone: "085609513932", email: "auliazahranajwa54@gmail.com", role: "Konselor" },
  { batch: 2, no: 113, name: "Nabila Kurniati", phone: "089635505780", email: "nabilakurniati663@gmail.com", role: "Konseli", counselorNo: 123 },
  { batch: 2, no: 112, name: "Dhea Amanda P.", phone: "082179235503", email: "dheaamandaputri78@gmail.com", role: "Konseli", counselorNo: 123 },

  // Group 21 - Konselor: Adinda Bening Kalistan (NO 30 - Part 2)
  { batch: 2, no: 130, name: "Adinda Bening Kalistan", phone: "089510791370", email: "beningkalistan08@gmail.com", role: "Konselor" },
  { batch: 2, no: 131, name: "Fadiya Asyifa Herma", phone: "082111575925", email: "fadyajanuari@gmail.com", role: "Konseli", counselorNo: 130 },

  // Group 22 - Konselor: Valdis Akhdan Abiyu (NO 35 - Part 2)
  { batch: 2, no: 135, name: "Valdis Akhdan Abiyu", phone: "08983305752", email: "valdisahhdah77@gmail.com", role: "Konselor" },
  { batch: 2, no: 106, name: "Revina Aulia P.", phone: "083126447071", email: "nrevi432@gmail.com", role: "Konseli", counselorNo: 135 },
  { batch: 2, no: 107, name: "Nabila Ramadhani P.", phone: "0895329117826", email: "nabilanabilap784@gmail.com", role: "Konseli", counselorNo: 135 },

  // Group 23 - Konselor: M. Abiyyu Atha (NO 37 - Part 2)
  { batch: 2, no: 137, name: "M. Abiyyu Atha", phone: "089508609088", email: "abiyyuatha726@gmail.com", role: "Konselor" },
  { batch: 2, no: 136, name: "Adrian Tegar Annaba", phone: "0895422125408", email: "adrian.tegar.annaba.19052010@gmail.com", role: "Konseli", counselorNo: 137 },
  { batch: 2, no: 134, name: "Rangga Zahir Kusuma", phone: "08994293393", email: "ranggazahirkusuma3101@gmail.com", role: "Konseli", counselorNo: 137 },

  // Group 24 - Konselor: Achmad Nizam (NO 38 - Part 2)
  { batch: 2, no: 138, name: "Achmad Nizam", phone: "089529282903", email: "nizam22012010@gmail.com", role: "Konselor" },
  { batch: 2, no: 133, name: "Tsaqif Fauzil Akbar", phone: "0895322117415", email: "tsaqiffauzil74@gmail.com", role: "Konseli", counselorNo: 138 },
];

async function seedBatch2Users() {
  const { db } = await import("./index");
  const { user } = await import("./schema");
  const { auth } = await import("../lib/auth");
  const { eq } = await import("drizzle-orm");

  console.log(`=== BATCH 2 EXCEL USER IMPORT (${batch2Users.length} USERS) ===`);
  console.log(`Default Password for all accounts: '${DEFAULT_PASSWORD}'\n`);

  const counselorIdMap = new Map<number, string>();

  // 1. Process Konselor first
  const counselors = batch2Users.filter(u => u.role === "Konselor");
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
      const codeToUse = existing.counselorCode || `KSL-B2-${String(c.no).padStart(3, "0")}`;
      await db.update(user).set({
        name: c.name,
        role: "Konselor",
        phone: c.phone,
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
          phone: c.phone,
          status: "Aktif",
        }
      } as any);

      if (!res || !(res as any).user) {
        console.error(`❌ [FAILED] Could not sign up ${c.name}`);
        continue;
      }

      userId = (res as any).user.id;
      const codeToUse = `KSL-B2-${String(c.no).padStart(3, "0")}`;
      await db.update(user).set({
        role: "Konselor",
        counselorCode: codeToUse,
        phone: c.phone,
      }).where(eq(user.id, userId));
    }

    counselorIdMap.set(c.no, userId);
  }

  // 2. Process Konseli next and assign to respective Konselor
  const konselis = batch2Users.filter(u => u.role === "Konseli");
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
        phone: k.phone,
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
          phone: k.phone,
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
          phone: k.phone,
        }).where(eq(user.id, userId));
      }
    }
  }

  console.log("\n==============================================");
  console.log(`🎉 ALL ${batch2Users.length} BATCH 2 ACCOUNTS PROCESSED & INPUTTED TO DB SUCCESSFULLY!`);
  console.log("==============================================");
  process.exit(0);
}

seedBatch2Users().catch(err => {
  console.error("Fatal error during batch 2 seed:", err);
  process.exit(1);
});
