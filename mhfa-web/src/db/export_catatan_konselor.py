import json
import pandas as pd
import os

json_path = os.path.join(os.path.dirname(__file__), 'counselor_notes_report.json')

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

notes = data.get('notes', [])

rows = []
for idx, item in enumerate(notes, 1):
    note_raw = item.get('note', '')
    symptoms = ''
    assessment = ''
    recommendation = ''
    
    if note_raw:
        try:
            parsed = json.loads(note_raw)
            if isinstance(parsed, dict):
                symptoms = parsed.get('symptoms', '')
                assessment = parsed.get('assessment', '')
                recommendation = parsed.get('recommendation', '')
            else:
                symptoms = str(parsed)
        except Exception:
            symptoms = note_raw
            
    rows.append({
        'No': idx,
        'Tanggal Catatan': item.get('createdAt', ''),
        'Kode Konselor': item.get('counselorCode', '-'),
        'Nama Konselor': item.get('counselorName', '-'),
        'Nama Konseli (Pasien)': item.get('patientName', '-'),
        'Email Konseli': item.get('patientEmail', '-'),
        'Keluhan / Gejala (Symptoms)': symptoms,
        'Asesmen (Assessment)': assessment,
        'Rekomendasi (Recommendation)': recommendation,
        'Tipe Sesi': item.get('sessionType', '-'),
        'Status Sesi': item.get('sessionStatus', '-'),
        'Sesi Dimulai': item.get('startedAt', ''),
        'Sesi Selesai': item.get('endedAt', '')
    })

df = pd.DataFrame(rows)

excel_path = os.path.join(os.path.dirname(__file__), 'Catatan_Konselor_MHFA.xlsx')

with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
    df.to_excel(writer, index=False, sheet_name='Catatan Konselor')

print(f"Excel file successfully generated at: {excel_path}")
