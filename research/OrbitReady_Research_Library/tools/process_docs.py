import urllib.request
import re
import html
import ssl
import json
import os

ctx = ssl._create_unverified_context()
BASE_DIR = "/home/user/OrbitReady_Research_Library"

# 1. ISRO DFSM
try:
    url = "https://www.isro.gov.in/Debris_Free_Space_Missions.html"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    raw_html = urllib.request.urlopen(req, context=ctx, timeout=10).read().decode('utf-8', errors='ignore')
    
    # Simple clean up of ISRO text
    # Extract main content
    with open(f"{BASE_DIR}/02_Policy_and_Standards/Regulatory_Rulings_and_Frameworks/ISRO_2024_Debris_Free_Space_Missions_DFSM.html", "w", encoding='utf-8') as f:
        f.write(raw_html)
    print("Saved ISRO DFSM HTML")
except Exception as e:
    print(f"ISRO error: {e}")

# 2. Space-Track Documentation
try:
    url = "https://www.space-track.org/documentation"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    raw_html = urllib.request.urlopen(req, context=ctx, timeout=10).read().decode('utf-8', errors='ignore')
    with open(f"{BASE_DIR}/04_Data_and_Tools_Documentation/Astrodynamics_and_Catalogs/Space_Track_Documentation_and_API_Guide.html", "w", encoding='utf-8') as f:
        f.write(raw_html)
    print("Saved Space-Track Documentation HTML")
except Exception as e:
    print(f"Space-Track error: {e}")

# 3. CelesTrak GP Data Formats
try:
    url = "https://celestrak.org/NORAD/documentation/gp-data-formats.php"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    raw_html = urllib.request.urlopen(req, context=ctx, timeout=10).read().decode('utf-8', errors='ignore')
    with open(f"{BASE_DIR}/04_Data_and_Tools_Documentation/Astrodynamics_and_Catalogs/CelesTrak_GP_Data_Formats_and_Documentation.html", "w", encoding='utf-8') as f:
        f.write(raw_html)
    print("Saved CelesTrak GP Documentation HTML")
except Exception as e:
    print(f"CelesTrak error: {e}")

# 4. DISCOSweb API docs
try:
    url = "https://discosweb.esoc.esa.int/apidocs"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    raw_html = urllib.request.urlopen(req, context=ctx, timeout=10).read().decode('utf-8', errors='ignore')
    with open(f"{BASE_DIR}/04_Data_and_Tools_Documentation/Astrodynamics_and_Catalogs/ESA_DISCOSweb_API_Documentation.html", "w", encoding='utf-8') as f:
        f.write(raw_html)
    print("Saved DISCOSweb API docs HTML")
except Exception as e:
    print(f"DISCOSweb error: {e}")

# 5. ESA Space Debris User Portal
try:
    url = "https://sdup.esoc.esa.int/"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    raw_html = urllib.request.urlopen(req, context=ctx, timeout=10).read().decode('utf-8', errors='ignore')
    with open(f"{BASE_DIR}/04_Data_and_Tools_Documentation/Astrodynamics_and_Catalogs/ESA_Space_Debris_User_Portal_Overview.html", "w", encoding='utf-8') as f:
        f.write(raw_html)
    print("Saved ESA SDUP HTML")
except Exception as e:
    print(f"ESA SDUP error: {e}")

# 6. Slingshot Beacon Product
try:
    url = "https://www.slingshot.space/product-beacon"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    raw_html = urllib.request.urlopen(req, context=ctx, timeout=10).read().decode('utf-8', errors='ignore')
    with open(f"{BASE_DIR}/04_Data_and_Tools_Documentation/Commercial_STM_Platforms/Slingshot_Beacon_Collision_Avoidance_Platform.html", "w", encoding='utf-8') as f:
        f.write(raw_html)
    print("Saved Slingshot Beacon HTML")
except Exception as e:
    print(f"Slingshot error: {e}")

# 7. LeoLabs Space Traffic Management
try:
    url = "https://leolabs.space/space-traffic-management/"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    raw_html = urllib.request.urlopen(req, context=ctx, timeout=10).read().decode('utf-8', errors='ignore')
    with open(f"{BASE_DIR}/04_Data_and_Tools_Documentation/Commercial_STM_Platforms/LeoLabs_Space_Traffic_Management_Platform.html", "w", encoding='utf-8') as f:
        f.write(raw_html)
    print("Saved LeoLabs STM HTML")
except Exception as e:
    print(f"LeoLabs error: {e}")

# 8. Hackyard Build 2026 Overview & Guide
try:
    url = "https://hackyard.org/build2026"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    raw_html = urllib.request.urlopen(req, context=ctx, timeout=10).read().decode('utf-8', errors='ignore')
    with open(f"{BASE_DIR}/05_Hackathon_and_Source_Dossiers/Hackyard_2026_Official_Docs/Hackyard_Build_2026_Overview.html", "w", encoding='utf-8') as f:
        f.write(raw_html)
    print("Saved Hackyard 2026 Overview HTML")
except Exception as e:
    print(f"Hackyard Overview error: {e}")

try:
    url = "https://hackyard.org/build2026/guide"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    raw_html = urllib.request.urlopen(req, context=ctx, timeout=10).read().decode('utf-8', errors='ignore')
    with open(f"{BASE_DIR}/05_Hackathon_and_Source_Dossiers/Hackyard_2026_Official_Docs/Hackyard_Build_2026_Participant_Guide.html", "w", encoding='utf-8') as f:
        f.write(raw_html)
    print("Saved Hackyard 2026 Guide HTML")
except Exception as e:
    print(f"Hackyard Guide error: {e}")

# 9. Orekit Library Overview
try:
    url = "https://www.orekit.org/"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    raw_html = urllib.request.urlopen(req, context=ctx, timeout=10).read().decode('utf-8', errors='ignore')
    with open(f"{BASE_DIR}/04_Data_and_Tools_Documentation/Astrodynamics_and_Catalogs/Orekit_Space_Dynamics_Library_Overview.html", "w", encoding='utf-8') as f:
        f.write(raw_html)
    print("Saved Orekit Overview HTML")
except Exception as e:
    print(f"Orekit error: {e}")
