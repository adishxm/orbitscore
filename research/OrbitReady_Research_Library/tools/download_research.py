import os
import sys
import ssl
import json
import urllib.request
import urllib.error
import shutil
import hashlib

ctx = ssl._create_unverified_context()

BASE_DIR = "/home/user/OrbitReady_Research_Library"

# Define directory structure
DIRS = [
    f"{BASE_DIR}/01_Academic_Literature/Orbital_Debris_and_Astrodynamics",
    f"{BASE_DIR}/01_Academic_Literature/AI_Explainability_and_HCI",
    f"{BASE_DIR}/02_Policy_and_Standards/International_and_Agency_Standards",
    f"{BASE_DIR}/02_Policy_and_Standards/Regulatory_Rulings_and_Frameworks",
    f"{BASE_DIR}/03_Agency_Technical_Reports/NASA_Technical_Reports",
    f"{BASE_DIR}/03_Agency_Technical_Reports/ESA_Technical_Reports",
    f"{BASE_DIR}/04_Data_and_Tools_Documentation/Astrodynamics_and_Catalogs",
    f"{BASE_DIR}/04_Data_and_Tools_Documentation/Commercial_STM_Platforms",
    f"{BASE_DIR}/05_Hackathon_and_Source_Dossiers/Hackyard_2026_Official_Docs",
    f"{BASE_DIR}/05_Hackathon_and_Source_Dossiers/Original_OrbitReady_Dossiers",
]

for d in DIRS:
    os.makedirs(d, exist_ok=True)

# List of files to download
# Each entry: (category_relpath, filename, primary_url, fallback_url, description)
DOWNLOADS = [
    # 01. Academic: Orbital Debris & Astrodynamics
    (
        "01_Academic_Literature/Orbital_Debris_and_Astrodynamics",
        "Kessler_CourPalais_1978_Collision_Frequency_Artificial_Satellites.pdf",
        "https://archive.org/download/kesslercollisionfrequency1978/Kessler_Collision_Frequency_1978.pdf",
        "https://web.archive.org/web/20110515132446id_/http://webpages.charter.net/dkessler/files/Collision%20Frequency.pdf",
        "Kessler & Cour-Palais (1978) - Collision Frequency of Artificial Satellites: The Creation of a Debris Belt"
    ),
    (
        "01_Academic_Literature/Orbital_Debris_and_Astrodynamics",
        "Kessler_1991_Collisional_Cascading_Limits_Population_Growth.pdf",
        "https://web.archive.org/web/20100714011651id_/http://webpages.charter.net/dkessler/files/Critical%20Density%201991.pdf",
        None,
        "Kessler (1981/1991) - Collisional Cascading: The Limits of Population Growth in Low Earth Orbit"
    ),
    (
        "01_Academic_Literature/Orbital_Debris_and_Astrodynamics",
        "Kessler_2010_The_Kessler_Syndrome_Implications_AAS.pdf",
        "https://aquarid.physics.uwo.ca/kessler/Kessler%20Syndrome-AAS%20Paper.pdf",
        None,
        "Kessler (2010) - The Kessler Syndrome: Implications to Future Space Operations (AAS Paper)"
    ),
    (
        "01_Academic_Literature/Orbital_Debris_and_Astrodynamics",
        "Liou_Johnson_2006_Risks_in_Space_from_Orbiting_Debris.pdf",
        "https://orbitaldebris.jsc.nasa.gov/library/sciencemag-risks-in-space-from-orbiting.pdf",
        None,
        "Liou & Johnson (2006) - Risks in Space from Orbiting Debris (Science)"
    ),
    (
        "01_Academic_Literature/Orbital_Debris_and_Astrodynamics",
        "Liou_Johnson_2006_LEO_Satellite_Postmission_Disposal_Study_LEGEND.pdf",
        "https://ntrs.nasa.gov/api/citations/20060055229/downloads/20060055229.pdf",
        None,
        "Liou & Johnson (2005/2009) - A LEO Satellite Postmission Disposal Study using LEGEND"
    ),
    (
        "01_Academic_Literature/Orbital_Debris_and_Astrodynamics",
        "Liou_2011_Active_Debris_Removal_Challenges_Remediation.pdf",
        "https://ntrs.nasa.gov/api/citations/20120013266/downloads/20120013266.pdf",
        None,
        "Liou (2011/2012) - Active Debris Removal and the Challenges for Environment Remediation"
    ),
    (
        "01_Academic_Literature/Orbital_Debris_and_Astrodynamics",
        "Liou_2021_Orbital_Debris_Mitigation_Long_Term_Environment.pdf",
        "https://ntrs.nasa.gov/api/citations/20210010605/downloads/Orbital%20debris%20mitigation%20(Liou)_final.pdf",
        None,
        "Liou (2021) - Orbital Debris Mitigation and the Long-Term Environment"
    ),
    (
        "01_Academic_Literature/Orbital_Debris_and_Astrodynamics",
        "Liou_et_al_2013_Stability_Future_LEO_Environment_IADC_Study.pdf",
        "https://conference.sdo.esoc.esa.int/proceedings/sdc6/paper/199/sdc6-paper199.pdf",
        None,
        "Liou et al. (2013) - Stability of the Future LEO Environment: An IADC Comparison Study"
    ),
    (
        "01_Academic_Literature/Orbital_Debris_and_Astrodynamics",
        "Krisko_Flegel_2015_ORDEM3_and_MASTER2009_Population_Comparison.pdf",
        "https://ntrs.nasa.gov/api/citations/20140011874/downloads/20140011874.pdf",
        None,
        "Krisko & Flegel (2014/2015) - ORDEM 3.0 and MASTER-2009 Modeled Small Debris Population Comparison"
    ),
    (
        "01_Academic_Literature/Orbital_Debris_and_Astrodynamics",
        "Braun_et_al_2020_DRAMA3_Upgrade_Space_Debris_Mitigation.pdf",
        "https://www.hou.usra.edu/meetings/orbitaldebris2019/pdf/6136.pdf",
        "https://www.hou.usra.edu/meetings/orbitaldebris2019/orbital2019paper/pdf/6136.pdf",
        "Braun et al. (2019/2020) - DRAMA 3.0: Upgrade of ESA's Debris Risk Assessment and Mitigation Analysis Tool Suite"
    ),
    (
        "01_Academic_Literature/Orbital_Debris_and_Astrodynamics",
        "Hull_Schonberg_2021_Spacecraft_Passivation_Overview_Requirements.pdf",
        "https://ntrs.nasa.gov/api/citations/20210019018/downloads/Hull%20Schonberg%20Draft%20v5-clean.docx.pdf",
        None,
        "Hull & Schonberg (2021) - Spacecraft Passivation: An Overview of Requirements and Practices"
    ),
    (
        "01_Academic_Literature/Orbital_Debris_and_Astrodynamics",
        "Schonberg_2019_Soft_Passivation_Spacecraft_Pressure_Vessels.pdf",
        "https://www.hou.usra.edu/meetings/orbitaldebris2019/orbital2019paper/pdf/6042.pdf",
        None,
        "Schonberg (2019/2020) - Soft Passivation of Spacecraft Pressure Vessels"
    ),
    (
        "01_Academic_Literature/Orbital_Debris_and_Astrodynamics",
        "Schonberg_Hull_2023_Passivation_Spacecraft_Pressure_Vessels.pdf",
        "https://ntrs.nasa.gov/api/citations/20230014779/downloads/20230014779.pdf",
        None,
        "Schonberg & Hull (2023) - Passivation of Spacecraft Pressure Vessels: Comments on Requirements, Principles, Practices"
    ),
    (
        "01_Academic_Literature/Orbital_Debris_and_Astrodynamics",
        "Moreschi_et_al_2025_Implications_Space_Debris_Mitigation_SDC9.pdf",
        "https://conference.sdo.esoc.esa.int/proceedings/sdc9/paper/306/SDC9-paper306.pdf",
        None,
        "Moreschi et al. (2025) - Implications of Space Debris Mitigation Measures (ESA SDC9)"
    ),

    # 01. Academic: AI, Explainability, and HCI
    (
        "01_Academic_Literature/AI_Explainability_and_HCI",
        "Wachter_Mittelstadt_Russell_2018_Counterfactual_Explanations.pdf",
        "https://jolt.law.harvard.edu/assets/articlePDFs/v31/Counterfactual-Explanations-without-Opening-the-Black-Box-Sandra-Wachter-et-al.pdf",
        None,
        "Wachter, Mittelstadt & Russell (2018) - Counterfactual Explanations without Opening the Black Box"
    ),
    (
        "01_Academic_Literature/AI_Explainability_and_HCI",
        "Ribeiro_Singh_Guestrin_2016_Why_Should_I_Trust_You_LIME.pdf",
        "https://arxiv.org/pdf/1602.04938.pdf",
        None,
        "Ribeiro, Singh & Guestrin (2016) - 'Why Should I Trust You?': Explaining the Predictions of Any Classifier (LIME)"
    ),
    (
        "01_Academic_Literature/AI_Explainability_and_HCI",
        "Lundberg_Lee_2017_Unified_Approach_Interpreting_Model_Predictions_SHAP.pdf",
        "https://proceedings.neurips.cc/paper/2017/file/8a20a8621978632d76c43dfd28b67767-Paper.pdf",
        None,
        "Lundberg & Lee (2017) - A Unified Approach to Interpreting Model Predictions (SHAP, NeurIPS)"
    ),
    (
        "01_Academic_Literature/AI_Explainability_and_HCI",
        "Miller_2019_Explanation_in_AI_Social_Sciences.pdf",
        "https://arxiv.org/pdf/1706.07269.pdf",
        None,
        "Miller (2019) - Explanation in Artificial Intelligence: Insights from the Social Sciences"
    ),
    (
        "01_Academic_Literature/AI_Explainability_and_HCI",
        "Guidotti_et_al_2018_Survey_Methods_Explaining_Black_Box_Models.pdf",
        "https://arxiv.org/pdf/1802.01933.pdf",
        None,
        "Guidotti et al. (2018) - A Survey of Methods for Explaining Black Box Models"
    ),
    (
        "01_Academic_Literature/AI_Explainability_and_HCI",
        "Guo_et_al_2017_Calibration_of_Modern_Neural_Networks.pdf",
        "https://proceedings.mlr.press/v70/guo17a/guo17a.pdf",
        None,
        "Guo et al. (2017) - On Calibration of Modern Neural Networks (ICML)"
    ),
    (
        "01_Academic_Literature/AI_Explainability_and_HCI",
        "Ovadia_et_al_2019_Can_You_Trust_Your_Models_Uncertainty.pdf",
        "https://papers.nips.cc/paper_files/paper/2019/file/8558cb408c1d76621371888657d2eb1d-Paper.pdf",
        None,
        "Ovadia et al. (2019) - Can You Trust Your Model's Uncertainty? (NeurIPS)"
    ),
    (
        "01_Academic_Literature/AI_Explainability_and_HCI",
        "Lewis_et_al_2020_Retrieval_Augmented_Generation_NLP.pdf",
        "https://arxiv.org/pdf/2005.11401.pdf",
        None,
        "Lewis et al. (2020) - Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (NeurIPS)"
    ),
    (
        "01_Academic_Literature/AI_Explainability_and_HCI",
        "Gao_et_al_2023_RAG_for_LLMs_Survey.pdf",
        "https://arxiv.org/pdf/2312.10997.pdf",
        None,
        "Gao et al. (2023) - Retrieval-Augmented Generation for Large Language Models: A Survey"
    ),
    (
        "01_Academic_Literature/AI_Explainability_and_HCI",
        "Wang_et_al_2024_DocLLM_Layout_Aware_Generative_Language_Model.pdf",
        "https://aclanthology.org/2024.acl-long.463.pdf",
        None,
        "Wang et al. (2024) - DocLLM: A Layout-Aware Generative Language Model for Multimodal Document Understanding (ACL)"
    ),
    (
        "01_Academic_Literature/AI_Explainability_and_HCI",
        "Buneman_Khanna_Tan_2001_Why_and_Where_Characterization_Data_Provenance.pdf",
        "https://repository.upenn.edu/cgi/viewcontent.cgi?article=1210&context=cis_papers",
        None,
        "Buneman, Khanna & Tan (2001) - Why and Where: A Characterization of Data Provenance"
    ),
    (
        "01_Academic_Literature/AI_Explainability_and_HCI",
        "Amershi_et_al_2019_Guidelines_for_Human_AI_Interaction.pdf",
        "http://teevan.org/publications/papers/chi19-guidelines.pdf",
        "https://haoyuma20492350.github.io/data/papers_pdf/AmershiSaleema2019Gfhi.pdf",
        "Amershi et al. (2019) - Guidelines for Human-AI Interaction (CHI 2019)"
    ),
    (
        "01_Academic_Literature/AI_Explainability_and_HCI",
        "Parasuraman_Sheridan_Wickens_2000_Model_Types_Levels_Human_Automation_Interaction.pdf",
        "https://www.cs.uml.edu/~holly/91.550/papers/sheridan-autonomy.pdf",
        None,
        "Parasuraman, Sheridan & Wickens (2000) - A Model for Types and Levels of Human Interaction with Automation"
    ),
    (
        "01_Academic_Literature/AI_Explainability_and_HCI",
        "Sculley_et_al_2015_Hidden_Technical_Debt_in_Machine_Learning_Systems.pdf",
        "https://papers.nips.cc/paper_files/paper/2015/file/86df7dcfd896fcaf2674f757a2463eba-Paper.pdf",
        None,
        "Sculley et al. (2015) - Hidden Technical Debt in Machine Learning Systems (NeurIPS)"
    ),

    # 02. Policy and Standards: International & Agency Standards
    (
        "02_Policy_and_Standards/International_and_Agency_Standards",
        "UN_COPUOS_2010_Space_Debris_Mitigation_Guidelines_ST_SPACE_49.pdf",
        "https://www.unoosa.org/pdf/publications/st_space_49E.pdf",
        None,
        "UN COPUOS Space Debris Mitigation Guidelines (UNOOSA ST/SPACE/49)"
    ),
    (
        "02_Policy_and_Standards/International_and_Agency_Standards",
        "IADC_2020_Space_Debris_Mitigation_Guidelines_IADC_02_01.pdf",
        "https://www.iadc-home.org/documents_public/file_down/id/5836",
        None,
        "IADC Space Debris Mitigation Guidelines (IADC-02-01, Rev 2)"
    ),
    (
        "02_Policy_and_Standards/International_and_Agency_Standards",
        "ESA_2023_Space_Debris_Mitigation_Requirements_ESSB_ST_U_007.pdf",
        "https://technology.esa.int/upload/media/ESA-Space-Debris-Mitigation-Requirements-ESSB-ST-U-007-Issue1.pdf",
        None,
        "ESA Space Debris Mitigation Requirements (ESSB-ST-U-007 Issue 1)"
    ),
    (
        "02_Policy_and_Standards/International_and_Agency_Standards",
        "UN_COPUOS_2025_Space_Debris_Compendium.pdf",
        "https://www.unoosa.org/documents/pdf/spacelaw/sd/Space_Debris_Compendium_COPUOS_2_May_2025.pdf",
        None,
        "UN COPUOS Space Debris Compendium of Standards (May 2025)"
    ),
    (
        "02_Policy_and_Standards/International_and_Agency_Standards",
        "ISO_24113_2023_Space_Debris_Mitigation_Requirements_Standard.pdf",
        "https://cdn.standards.iteh.ai/samples/83494/dcb00a9e0adf4e9399dae46af3aac277/ISO-24113-2023.pdf",
        None,
        "ISO 24113:2023 Space systems — Space debris mitigation requirements (Standard Publication)"
    ),

    # 02. Policy and Standards: Regulatory Rulings and Frameworks
    (
        "02_Policy_and_Standards/Regulatory_Rulings_and_Frameworks",
        "NASA_NPR_8715_6E_Orbital_Debris_Mitigation_2024.pdf",
        "https://nodis3.gsfc.nasa.gov/npg_img/N_PR_8715_006E_/N_PR_8715_006E_.pdf",
        None,
        "NASA Procedural Requirements NPR 8715.6E - Orbital Debris Mitigation (2024-2029)"
    ),
    (
        "02_Policy_and_Standards/Regulatory_Rulings_and_Frameworks",
        "NASA_STD_8719_14C_Process_for_Limiting_Orbital_Debris.pdf",
        "https://standards.nasa.gov/sites/default/files/standards/NASA/C/0/nasa-std-871914c.pdf",
        None,
        "NASA Technical Standard NASA-STD-8719.14C - Process for Limiting Orbital Debris"
    ),
    (
        "02_Policy_and_Standards/Regulatory_Rulings_and_Frameworks",
        "US_Government_2019_ODMSP_Orbital_Debris_Mitigation_Standard_Practices.pdf",
        "https://orbitaldebris.jsc.nasa.gov/library/usg_orbital_debris_mitigation_standard_practices_november_2019.pdf",
        None,
        "U.S. Government Orbital Debris Mitigation Standard Practices (ODMSP, Nov 2019 Update)"
    ),
    (
        "02_Policy_and_Standards/Regulatory_Rulings_and_Frameworks",
        "FCC_22_74_Five_Year_Deorbit_Rule_Order_2022.pdf",
        "https://docs.fcc.gov/public/attachments/FCC-22-74A1.pdf",
        None,
        "FCC 22-74 Second Report and Order - Five-Year Deorbit Rule for Satellites"
    ),
    (
        "02_Policy_and_Standards/Regulatory_Rulings_and_Frameworks",
        "NIST_AI_100_1_AI_Risk_Management_Framework.pdf",
        "https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf",
        None,
        "NIST AI 100-1 - Artificial Intelligence Risk Management Framework (AI RMF 1.0)"
    ),
    (
        "02_Policy_and_Standards/Regulatory_Rulings_and_Frameworks",
        "FAA_2023_Upper_Stage_Orbital_Debris_Mitigation_NPRM.pdf",
        "https://www.faa.gov/newsroom/Orbital-Debris_NPRM-Issuance.pdf",
        None,
        "FAA Notice of Proposed Rulemaking (NPRM): Upper Stage Space Debris Mitigation (RIN 2120-AK81)"
    ),
    (
        "02_Policy_and_Standards/Regulatory_Rulings_and_Frameworks",
        "FAA_2023_Report_to_Congress_Reentry_Disposal_Satellites.pdf",
        "https://www.faa.gov/sites/faa.gov/files/Report_to_Congress_Reentry_Disposal_of_Satellites.pdf",
        None,
        "FAA Report to Congress: Risks Associated with Reentry Disposal of Satellites from Large Constellations"
    ),

    # 03. Agency Technical Reports: NASA
    (
        "03_Agency_Technical_Reports/NASA_Technical_Reports",
        "NASA_TP_20250011033_DAS_3_2_Debris_Assessment_Software_Users_Guide.pdf",
        "https://orbitaldebris.jsc.nasa.gov/library/das/DAS3.2_UsersGuide.pdf",
        None,
        "NASA TP-20250011033 - Debris Assessment Software (DAS 3.2) User's Guide"
    ),
    (
        "03_Agency_Technical_Reports/NASA_Technical_Reports",
        "NASA_TP_20220004345_ORDEM_3_1_Model_Process_Document.pdf",
        "https://ntrs.nasa.gov/api/citations/20220004345/downloads/TP-20220004345_ORDEM31_Process_Doc_final_20220314.pdf",
        None,
        "NASA TP-20220004345 - Orbital Debris Engineering Model (ORDEM) 3.1 Model Process Document"
    ),
    (
        "03_Agency_Technical_Reports/NASA_Technical_Reports",
        "NASA_TP_20220002309_ORDEM_3_1_Model_Verification_and_Validation.pdf",
        "https://ntrs.nasa.gov/api/citations/20220002309/downloads/ORDEM31_Model_VnV_v3_20220224_corrected%20final_for%20STRIVES.pdf",
        None,
        "NASA TP-20220002309 - ORDEM 3.1: Model Verification and Validation (V&V)"
    ),
    (
        "03_Agency_Technical_Reports/NASA_Technical_Reports",
        "NASA_DAS_3_2_7_Software_Release_Notes.txt",
        "https://orbitaldebris.jsc.nasa.gov/library/das/das3_release_notes.txt",
        None,
        "NASA ODPO DAS 3.2.7 Software Release Notes & Python API Documentation"
    ),

    # 03. Agency Technical Reports: ESA
    (
        "03_Agency_Technical_Reports/ESA_Technical_Reports",
        "ESA_2026_Annual_Space_Environment_Report_GEN_DB_LOG_00288_OPS_SD.pdf",
        "https://www.sdo.esoc.esa.int/environment_report/Space_Environment_Report_latest.pdf",
        None,
        "ESA Space Debris Office - Annual Space Environment Report (GEN-DB-LOG-00288-OPS-SD)"
    ),

    # 04. Data and Tools Documentation: Astrodynamics and Catalogs
    (
        "04_Data_and_Tools_Documentation/Astrodynamics_and_Catalogs",
        "UCS_Satellite_Database_Quick_Guide.pdf",
        "https://s3.amazonaws.com/ucs-documents/nuclear-weapons/sat-database/quick-guide-to-using-the-database.pdf",
        None,
        "Union of Concerned Scientists (UCS) Satellite Database Quick Guide"
    ),
    (
        "04_Data_and_Tools_Documentation/Astrodynamics_and_Catalogs",
        "UCS_Satellite_Database_Full_User_Guide_wAppendix.pdf",
        "https://s3.amazonaws.com/ucs-documents/nuclear-weapons/sat-database/4-11-17-update/User+Guide+1-1-17+wAppendix.pdf",
        None,
        "UCS Satellite Database Full User Guide and Definitions Manual"
    ),
    (
        "04_Data_and_Tools_Documentation/Astrodynamics_and_Catalogs",
        "Poliastro_Astrodynamics_Library_Reference.md",
        "https://raw.githubusercontent.com/poliastro/poliastro/main/README.md",
        None,
        "poliastro - Python Astrodynamics Library Specification and README"
    ),
]

# Run downloader
success_count = 0
failed_count = 0
results = []

for rel_dir, filename, url, fallback, desc in DOWNLOADS:
    target_path = os.path.join(BASE_DIR, rel_dir, filename)
    print(f"[*] Downloading: {filename} ...")
    
    downloaded = False
    for try_url in [url, fallback]:
        if not try_url:
            continue
        try:
            req = urllib.request.Request(
                try_url,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
            )
            with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
                content = resp.read()
                # Verify non-empty
                if len(content) > 100:
                    with open(target_path, "wb") as f:
                        f.write(content)
                    size = os.path.getsize(target_path)
                    print(f"    [+] SUCCESS: {filename} ({size:,} bytes) from {try_url}")
                    results.append({
                        "file": filename,
                        "path": os.path.relpath(target_path, BASE_DIR),
                        "size": size,
                        "status": "OK",
                        "url": try_url,
                        "desc": desc
                    })
                    downloaded = True
                    success_count += 1
                    break
                else:
                    print(f"    [-] Content too small ({len(content)} bytes), skipping")
        except Exception as e:
            print(f"    [-] Failed {try_url}: {e}")
            
    if not downloaded:
        print(f"    [!] FAILED: {filename}")
        results.append({
            "file": filename,
            "path": os.path.relpath(target_path, BASE_DIR),
            "size": 0,
            "status": "FAILED",
            "url": url,
            "desc": desc
        })
        failed_count += 1

print(f"\nFinished initial batch: {success_count} succeeded, {failed_count} failed.")
