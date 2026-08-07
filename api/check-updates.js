// ================================================================
// AJP - Verificare automata portal + notificari push (OneSignal)
// Se apeleaza periodic (la 2 ore) de un serviciu extern (cron-job.org)
// Actioneaza doar intre orele 08:00 - 20:00 (ora Bucuresti)
// ================================================================

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;
const PORTAL_URL = 'https://ajp-backend.vercel.app/api/portal';
const CRON_SECRET = process.env.CRON_SECRET; // parola simpla, ca sa nu poata oricine declansa functia

// --- Lista instante (identica cu cea din index.html) ---
const INST = [
  ['curtea de apel alba iulia','CurteadeApelALBAIULIA'],['curtea de apel bacau','CurteadeApelBACAU'],
  ['curtea de apel brasov','CurteadeApelBRASOV'],['curtea de apel bucuresti','CurteadeApelBUCURESTI'],
  ['curtea de apel cluj','CurteadeApelCLUJ'],['curtea de apel constanta','CurteadeApelCONSTANTA'],
  ['curtea de apel craiova','CurteadeApelCRAIOVA'],['curtea de apel galati','CurteadeApelGALATI'],
  ['curtea de apel iasi','CurteadeApelIASI'],['curtea de apel oradea','CurteadeApelORADEA'],
  ['curtea de apel pitesti','CurteadeApelPITESTI'],['curtea de apel ploiesti','CurteadeApelPLOIESTI'],
  ['curtea de apel suceava','CurteadeApelSUCEAVA'],['curtea de apel targu mures','CurteadeApelTARGUMURES'],
  ['curtea de apel timisoara','CurteadeApelTIMISOARA'],['curtea militara','CurteaMilitaradeApelBUCURESTI'],
  ['tribunalul alba','TribunalulALBA'],['tribunalul arad','TribunalulARAD'],['tribunalul arges','TribunalulARGES'],
  ['tribunalul bacau','TribunalulBACAU'],['tribunalul bihor','TribunalulBIHOR'],['tribunalul bistrita','TribunalulBISTRITANASAUD'],
  ['tribunalul botosani','TribunalulBOTOSANI'],['tribunalul braila','TribunalulBRAILA'],['tribunalul brasov','TribunalulBRASOV'],
  ['tribunalul bucuresti','TribunalulBUCURESTI'],['tribunalul buzau','TribunalulBUZAU'],['tribunalul calarasi','TribunalulCALARASI'],
  ['tribunalul caras','TribunalulCARASSEVERIN'],['tribunalul cluj','TribunalulCLUJ'],['tribunalul constanta','TribunalulCONSTANTA'],
  ['tribunalul covasna','TribunalulCOVASNA'],['tribunalul comercial arges','TribunalulComercialARGES'],
  ['tribunalul comercial cluj','TribunalulComercialCLUJ'],['tribunalul comercial mures','TribunalulComercialMURES'],
  ['tribunalul minori brasov','TribunalulpentruminoriSifamilieBRASOV'],['tribunalul dambovita','TribunalulDAMBOVITA'],
  ['tribunalul dolj','TribunalulDOLJ'],['tribunalul galati','TribunalulGALATI'],['tribunalul giurgiu','TribunalulGIURGIU'],
  ['tribunalul gorj','TribunalulGORJ'],['tribunalul harghita','TribunalulHARGHITA'],['tribunalul hunedoara','TribunalulHUNEDOARA'],
  ['tribunalul ialomita','TribunalulIALOMITA'],['tribunalul iasi','TribunalulIASI'],['tribunalul ilfov','TribunalulILFOV'],
  ['tribunalul maramures','TribunalulMARAMURES'],['tribunalul mehedinti','TribunalulMEHEDINTI'],
  ['tribunalul militar bucuresti','TribunalulMilitarBUCURESTI'],['tribunalul militar iasi','TribunalulMilitarIASI'],
  ['tribunalul militar timisoara','TribunalulMilitarTIMISOARA'],['tribunalul militar cluj','TribunalulMilitarCLUJNAPOCA'],
  ['tribunalul militar teritorial','TribunalulMilitarTeritorialBUCURESTI'],['tribunalul mures','TribunalulMURES'],
  ['tribunalul neamt','TribunalulNEAMT'],['tribunalul olt','TribunalulOLT'],['tribunalul prahova','TribunalulPRAHOVA'],
  ['tribunalul salaj','TribunalulSALAJ'],['tribunalul satu mare','TribunalulSATUMARE'],['tribunalul sibiu','TribunalulSIBIU'],
  ['tribunalul suceava','TribunalulSUCEAVA'],['tribunalul teleorman','TribunalulTELEORMAN'],['tribunalul timis','TribunalulTIMIS'],
  ['tribunalul tulcea','TribunalulTULCEA'],['tribunalul vaslui','TribunalulVASLUI'],['tribunalul valcea','TribunalulVALCEA'],
  ['tribunalul vrancea','TribunalulVRANCEA'],['judecatoria adjud','JudecatoriaADJUD'],['judecatoria agnita','JudecatoriaAGNITA'],
  ['judecatoria aiud','JudecatoriaAIUD'],['judecatoria alba iulia','JudecatoriaALBAIULIA'],['judecatoria alesd','JudecatoriaALESD'],
  ['judecatoria alexandria','JudecatoriaALEXANDRIA'],['judecatoria arad','JudecatoriaARAD'],['judecatoria avrig','JudecatoriaAVRIG'],
  ['judecatoria babadag','JudecatoriaBABADAG'],['judecatoria bacau','JudecatoriaBACAU'],
  ['judecatoria baia de arama','JudecatoriaBAIADEARAMA'],['judecatoria baia mare','JudecatoriaBAIAMARE'],
  ['judecatoria bailesti','JudecatoriaBAILESTI'],['judecatoria balcesti','JudecatoriaBALCESTI'],['judecatoria bals','JudecatoriaBALS'],
  ['judecatoria barlad','JudecatoriaBARLAD'],['judecatoria beclean','JudecatoriaBECLEAN'],['judecatoria beius','JudecatoriaBEIUS'],
  ['judecatoria bicaz','JudecatoriaBICAZ'],['judecatoria bistrita','JudecatoriaBISTRITA'],['judecatoria blaj','JudecatoriaBLAJ'],
  ['judecatoria bolintin','JudecatoriaBOLINTINVALE'],['judecatoria botosani','JudecatoriaBOTOSANI'],
  ['judecatoria bozovici','JudecatoriaBOZOVICI'],['judecatoria brad','JudecatoriaBRAD'],['judecatoria braila','JudecatoriaBRAILA'],
  ['judecatoria brasov','JudecatoriaBRASOV'],['judecatoria brezoi','JudecatoriaBREZOI'],['judecatoria buflea','JudecatoriaBUFTEA'],
  ['judecatoria buhusi','JudecatoriaBUHUSI'],['judecatoria buzau','JudecatoriaBUZAU'],['judecatoria calafat','JudecatoriaCALAFAT'],
  ['judecatoria calarasi','JudecatoriaCALARASI'],['judecatoria campeni','JudecatoriaCAMPENI'],['judecatoria campina','JudecatoriaCAMPINA'],
  ['judecatoria campulung moldovenesc','JudecatoriaCAMPULUNGMOLDOVENESC'],['judecatoria campulung','JudecatoriaCAMPULUNG'],
  ['judecatoria caracal','JudecatoriaCARACAL'],['judecatoria caransebes','JudecatoriaCARANSEBES'],['judecatoria carei','JudecatoriaCAREI'],
  ['judecatoria chisineu cris','JudecatoriaCHISINEUCRIS'],['judecatoria cluj','JudecatoriaCLUJNAPOCA'],
  ['judecatoria constanta','JudecatoriaCONSTANTA'],['judecatoria corabia','JudecatoriaCORABIA'],['judecatoria cornetu','JudecatoriaCORNETU'],
  ['judecatoria costesti','JudecatoriaCOSTESTI'],['judecatoria craiova','JudecatoriaCRAIOVA'],
  ['judecatoria curtea de arges','JudecatoriaCURTEADEARGES'],['judecatoria darabani','JudecatoriaDarabani'],
  ['judecatoria dej','JudecatoriaDEJ'],['judecatoria deta','JudecatoriaDETA'],['judecatoria deva','JudecatoriaDEVA'],
  ['judecatoria dorohoi','JudecatoriaDOROHOI'],['judecatoria dragasani','JudecatoriaDRAGASANI'],
  ['judecatoria dragomiresti','JudecatoriaDRAGOMIRESTI'],['judecatoria drobeta','JudecatoriaDROBETATURNUSEVERIN'],
  ['judecatoria fagaras','JudecatoriaFAGARAS'],['judecatoria faget','JudecatoriaFAGET'],['judecatoria falticeni','JudecatoriaFALTICENI'],
  ['judecatoria faurei','JudecatoriaFAUREI'],['judecatoria fetesti','JudecatoriaFETESTI'],['judecatoria filiasi','JudecatoriaFILIASI'],
  ['judecatoria focsani','JudecatoriaFOCSANI'],['judecatoria gaesti','JudecatoriaGAESTI'],['judecatoria galati','JudecatoriaGALATI'],
  ['judecatoria gheorgheni','JudecatoriaGHEORGHENI'],['judecatoria gherla','JudecatoriaGHERLA'],['judecatoria giurgiu','JudecatoriaGIURGIU'],
  ['judecatoria gura humorului','JudecatoriaGURAHUMORULUI'],['judecatoria gurahont','JudecatoriaGURAHONT'],
  ['judecatoria harlau','JudecatoriaHARLAU'],['judecatoria harsova','JudecatoriaHARSOVA'],['judecatoria hateg','JudecatoriaHATEG'],
  ['judecatoria horezu','JudecatoriaHOREZU'],['judecatoria huedin','JudecatoriaHUEDIN'],['judecatoria hunedoara','JudecatoriaHUNEDOARA'],
  ['judecatoria husi','JudecatoriaHUSI'],['judecatoria iasi','JudecatoriaIASI'],['judecatoria ineu','JudecatoriaINEU'],
  ['judecatoria insuratei','JudecatoriaINSURATEI'],['judecatoria intorsura','JudecatoriaINTORSURABUZAULUI'],
  ['judecatoria jibou','JudecatoriaJIBOU'],['judecatoria lehliu','JudecatoriaLEHLIUGARA'],['judecatoria liesti','JudecatoriaLIESTI'],
  ['judecatoria lipova','JudecatoriaLIPOVA'],['judecatoria ludus','JudecatoriaLUDUS'],['judecatoria lugoj','JudecatoriaLUGOJ'],
  ['judecatoria macin','JudecatoriaMACIN'],['judecatoria mangalia','JudecatoriaMANGALIA'],['judecatoria marghita','JudecatoriaMARGHITA'],
  ['judecatoria medgidia','JudecatoriaMEDGIDIA'],['judecatoria medias','JudecatoriaMEDIAS'],
  ['judecatoria miercurea ciuc','JudecatoriaMIERCUREACIUC'],['judecatoria mizil','JudecatoriaMIZIL'],
  ['judecatoria moinesti','JudecatoriaMOINESTI'],['judecatoria moldova noua','JudecatoriaMOLDOVANOUA'],
  ['judecatoria moreni','JudecatoriaMORENI'],['judecatoria motru','JudecatoriaMOTRU'],['judecatoria murgeni','JudecatoriaMURGENI'],
  ['judecatoria nasaud','JudecatoriaNASAUD'],['judecatoria negresti','JudecatoriaNEGRESTIOAS'],['judecatoria novaci','JudecatoriaNOVACI'],
  ['judecatoria odorheiu','JudecatoriaODORHEIULSECUIESC'],['judecatoria oltenita','JudecatoriaOLTENITA'],
  ['judecatoria onesti','JudecatoriaONESTI'],['judecatoria oradea','JudecatoriaORADEA'],['judecatoria orastie','JudecatoriaORASTIE'],
  ['judecatoria oravita','JudecatoriaORAVITA'],['judecatoria orsova','JudecatoriaORSOVA'],['judecatoria panciu','JudecatoriaPANCIU'],
  ['judecatoria patarlagele','JudecatoriaPATARLAGELE'],['judecatoria pascani','JudecatoriaPASCANI'],
  ['judecatoria petrosani','JudecatoriaPETROSANI'],['judecatoria piatra neamt','JudecatoriaPIATRANEAMT'],
  ['judecatoria pitesti','JudecatoriaPITESTI'],['judecatoria ploiesti','JudecatoriaPLOIESTI'],
  ['judecatoria pogoanele','JudecatoriaPOGOANELE'],['judecatoria podu turcului','JudecatoriaPODUTURCULUI'],
  ['judecatoria pucioasa','JudecatoriaPUCIOASA'],['judecatoria racari','JudecatoriaRACARI'],['judecatoria radauti','JudecatoriaRADAUTI'],
  ['judecatoria raducaneni','JudecatoriaRADUCANENI'],['judecatoria ramnicu sarat','JudecatoriaRAMNICUSARAT'],
  ['judecatoria ramnicu valcea','JudecatoriaRAMNICUVALCEA'],['judecatoria reghin','JudecatoriaREGHIN'],
  ['judecatoria resita','JudecatoriaRESITA'],['judecatoria roman','JudecatoriaROMAN'],
  ['judecatoria rosiorii de vede','JudecatoriaROSIORIDEVEDE'],['judecatoria rupea','JudecatoriaRUPEA'],
  ['judecatoria saliste','JudecatoriaSALISTE'],['judecatoria salonta','JudecatoriaSALONTA'],
  ['judecatoria sannicolau mare','JudecatoriaSANNICOLAULMARE'],['judecatoria satu mare','JudecatoriaSATUMARE'],
  ['judecatoria saveni','JudecatoriaSAVENI'],['judecatoria sebes','JudecatoriaSEBES'],
  ['judecatoria sector 1','JudecatoriaSECTORUL1BUCURESTI'],['judecatoria sector 2','JudecatoriaSECTORUL2BUCURESTI'],
  ['judecatoria sector 3','JudecatoriaSECTORUL3BUCURESTI'],['judecatoria sector 4','JudecatoriaSECTORUL4BUCURESTI'],
  ['judecatoria sector 5','JudecatoriaSECTORUL5BUCURESTI'],['judecatoria sector 6','JudecatoriaSECTORUL6BUCURESTI'],
  ['judecatoria segarcea','JudecatoriaSEGARCEA'],['judecatoria sf gheorghe','JudecatoriaSFANTUGHEORGHE'],
  ['judecatoria sibiu','JudecatoriaSIBIU'],['judecatoria sighetu','JudecatoriaSIGHETUMARMATIEI'],
  ['judecatoria sighisoara','JudecatoriaSIGHISOARA'],['judecatoria simleul silvaniei','JudecatoriaSIMLEULSILVANIEI'],
  ['judecatoria sinaia','JudecatoriaSINAIA'],['judecatoria slatina','JudecatoriaSLATINA'],['judecatoria slobozia','JudecatoriaSLOBOZIA'],
  ['judecatoria somcuta','JudecatoriaSOMCUTAMARE'],['judecatoria strehaia','JudecatoriaSTREHAIA'],
  ['judecatoria suceava','JudecatoriaSUCEAVA'],['judecatoria targoviste','JudecatoriaTARGOVISTE'],
  ['judecatoria targu bujor','JudecatoriaTARGUBUJOR'],['judecatoria targu carbunesti','JudecatoriaTARGUCARBUNESTI'],
  ['judecatoria targu jiu','JudecatoriaTARGUJIU'],['judecatoria targu lapus','JudecatoriaTARGULAPUS'],
  ['judecatoria targu mures','JudecatoriaTARGUMURES'],['judecatoria targu neamt','JudecatoriaTARGUNEAMT'],
  ['judecatoria targu secuiesc','JudecatoriaTARGUSECUIESC'],['judecatoria tarnaveni','JudecatoriaTARNAVENI'],
  ['judecatoria tecuci','JudecatoriaTECUCI'],['judecatoria timisoara','JudecatoriaTIMISOARA'],
  ['judecatoria toplita','JudecatoriaTOPLITA'],['judecatoria topoloveni','JudecatoriaTOPOLOVENI'],
  ['judecatoria tulcea','JudecatoriaTULCEA'],['judecatoria turda','JudecatoriaTURDA'],
  ['judecatoria turnu magurele','JudecatoriaTURNUMAGURELE'],['judecatoria urziceni','JudecatoriaURZICENI'],
  ['judecatoria valenii de munte','JudecatoriaVALENIIDEMUNTE'],['judecatoria vanju mare','JudecatoriaVANJUMARE'],
  ['judecatoria vaslui','JudecatoriaVASLUI'],['judecatoria vatra dornei','JudecatoriaVATRADORNEI'],
  ['judecatoria videle','JudecatoriaVIDELE'],['judecatoria viseu','JudecatoriaVISEUDESUS'],['judecatoria zalau','JudecatoriaZALAU'],
  ['judecatoria zarnesti','JudecatoriaZARNESTI'],['judecatoria zimnicea','JudecatoriaZIMNICEA']
];

function normTxt(s) {
  return (s || '').toLowerCase()
    .replace(/ă|Ă/g, 'a').replace(/â|Â/g, 'a').replace(/î|Î/g, 'i')
    .replace(/ș|Ș|ş|Ş/g, 's').replace(/ț|Ț|ţ|Ţ/g, 't')
    .replace(/[^a-z0-9\s]/g, '');
}
function detInst(s) {
  const n = normTxt(s);
  for (const [key, code] of INST) { if (n.indexOf(key) !== -1) return code; }
  return null;
}
function isoToDT(iso, ora) {
  if (!iso) return '';
  const d = iso.split('T')[0];
  if (ora && /^\d{1,2}:\d{2}/.test(ora)) {
    const p = ora.split(':');
    return d + 'T' + String(parseInt(p[0])).padStart(2,'0') + ':' + String(parseInt(p[1])).padStart(2,'0');
  }
  return d + 'T09:00';
}
function fmtPortal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear();
}

async function apeleazaPortal(body) {
  const r = await fetch(PORTAL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const j = await r.json();
  if (!j.ok) throw new Error(j.eroare || 'Eroare server portal');
  return j.result;
}

async function sendPush(externalId, title, message) {
  try {
    await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Key ' + ONESIGNAL_API_KEY
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        include_aliases: { external_id: [externalId] },
        target_channel: 'push',
        headings: { en: title },
        contents: { en: message }
      })
    });
  } catch (e) { console.error('Eroare trimitere push:', e); }
}

async function supaGet(path) {
  const r = await fetch(SUPABASE_URL + '/rest/v1/' + path, {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY
    }
  });
  return r.json();
}
async function supaPatch(userId, payload) {
  await fetch(SUPABASE_URL + '/rest/v1/stare_aplicatie?user_id=eq.' + userId, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ date: payload, updated_at: new Date().toISOString() })
  });
}

function oraBucuresti() {
  const now = new Date();
  const s = now.toLocaleString('en-US', { timeZone: 'Europe/Bucharest', hour: '2-digit', hour12: false });
  return parseInt(s);
}
function dataBucurestiStr() {
  const now = new Date();
  return now.toLocaleDateString('sv-SE', { timeZone: 'Europe/Bucharest' }); // format YYYY-MM-DD
}

// Ruleaza cate 5 verificari simultan, in loc de una cate una, ca sa nu depaseasca limita de timp
async function ruleazaInLoturi(items, marimeLot, fn) {
  for (let i = 0; i < items.length; i += marimeLot) {
    const lot = items.slice(i, i + marimeLot);
    await Promise.all(lot.map(fn));
  }
}

module.exports.config = { maxDuration: 60 };

module.exports = async function handler(req, res) {
  try {
  // Protectie simpla - doar cine stie parola poate declansa functia
  if (CRON_SECRET && req.query.secret !== CRON_SECRET) {
    return res.status(401).json({ ok: false, eroare: 'Neautorizat' });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) {
    return res.status(200).json({ ok: false, eroare: 'Lipsesc variabile de mediu', detalii: {
      SUPABASE_URL: !!SUPABASE_URL, SUPABASE_SERVICE_KEY: !!SUPABASE_SERVICE_KEY,
      ONESIGNAL_APP_ID: !!ONESIGNAL_APP_ID, ONESIGNAL_API_KEY: !!ONESIGNAL_API_KEY
    }});
  }

  const ora = oraBucuresti();
  if (ora < 8 || ora >= 20) {
    return res.status(200).json({ ok: true, mesaj: 'In afara intervalului 08:00-20:00, nu se face nimic.' });
  }

  const rows = await supaGet('stare_aplicatie?select=user_id,date');
  if (!Array.isArray(rows)) {
    return res.status(200).json({ ok: false, eroare: 'Nu s-au putut citi datele din Supabase', detalii: rows });
  }

  const azi = dataBucurestiStr();
  let totalNotificari = 0;

  for (const row of rows) {
    const userId = row.user_id;
    const d = row.date || {};
    const dosare = d.dosare || [];
    const dosareLucru = d.dosareLucru || [];
    const termene = d.termene || [];
    let schimbat = false;

    // --- 1. Verificare portal pentru termene/solutii noi (in loturi de 5, in paralel) ---
    const toate = dosare.concat(dosareLucru).filter(x => detInst(x.instanta));
    const now = new Date();

    await ruleazaInLoturi(toate, 5, async (dosar) => {
      try {
        const rezultate = await apeleazaPortal({ metoda: 'CautareDosare', numarDosar: dosar.numar, institutie: detInst(dosar.instanta) });
        if (!rezultate || !rezultate.length) return;
        for (const r of rezultate) {
          const sedinte = r.sedinte || [];
          for (const s of sedinte) {
            const dt = isoToDT(s.data, s.ora);
            if (new Date(s.data) >= now) {
              const exista = termene.some(t => t.dosarId === dosar.id && t.dataOra === dt);
              if (!exista) {
                termene.push({ id: Date.now() + Math.random(), dosarId: dosar.id, dataOra: dt, tip: 'judecata', notite: s.complet ? 'Complet: ' + s.complet : '', sursa: 'portal.just.ro' });
                schimbat = true;
                totalNotificari++;
                await sendPush(userId, '📅 Termen nou - ' + dosar.numar, fmtPortal(s.data) + (s.ora ? ' ora ' + s.ora : '') + (s.complet ? ' - ' + s.complet : ''));
              }
            } else if (s.solutieSumar || s.solutie) {
              const dtS = isoToDT(s.data, s.ora);
              const idx = termene.findIndex(t => t.dosarId === dosar.id && t.dataOra === dtS && !t.solutie);
              if (idx !== -1) {
                const sol = s.solutieSumar || s.solutie;
                termene[idx].solutie = sol;
                schimbat = true;
                totalNotificari++;
                await sendPush(userId, '📋 Solutie noua - ' + dosar.numar, sol);
              }
            }
          }
        }
      } catch (e) {
        console.error('Eroare verificare dosar ' + dosar.numar + ':', e.message);
      }
    });

    // --- 2. Rezumat de dimineata (o singura data pe zi, doar in fereastra 08-10) ---
    if (ora >= 8 && ora < 10 && d.lastSummaryDate !== azi) {
      const today0 = new Date(); today0.setHours(0,0,0,0);
      const tomorrow0 = new Date(today0.getTime() + 86400000);
      const termeneAzi = termene.filter(t => { const td = new Date(t.dataOra); return td >= today0 && td < tomorrow0; });
      const termeneMaine = termene.filter(t => { const td = new Date(t.dataOra); return td >= tomorrow0 && td < new Date(tomorrow0.getTime()+86400000); });
      if (termeneAzi.length) {
        await sendPush(userId, '📅 ' + (termeneAzi.length===1?'Termen AZI':termeneAzi.length+' termene AZI'), termeneAzi.map(t => { const dos = toate.find(x=>x.id===t.dosarId); return dos ? dos.numar : 'dosar'; }).join(', '));
        totalNotificari++;
      }
      if (termeneMaine.length) {
        await sendPush(userId, '⏰ ' + (termeneMaine.length===1?'Termen MAINE':termeneMaine.length+' termene MAINE'), termeneMaine.map(t => { const dos = toate.find(x=>x.id===t.dosarId); return dos ? dos.numar : 'dosar'; }).join(', '));
        totalNotificari++;
      }
      d.lastSummaryDate = azi;
      schimbat = true;
    }

    if (schimbat) {
      d.termene = termene;
      await supaPatch(userId, d);
    }
  }

  return res.status(200).json({ ok: true, useriVerificati: rows.length, notificariTrimise: totalNotificari });
  } catch (e) {
    return res.status(200).json({ ok: false, eroare: e.message, stack: e.stack });
  }
};
