from analysis import get_patches_data, get_relevent_champions
from analysisv2 import get_true_winrate_per_patch
from analysisv2 import get_matchup_values
from analysisv2 import get_synergie_values
from analysis import get_overall_tier_winrate
from utils import LANES
import requests
import json
import pickle
import os

from bs4 import BeautifulSoup
from urllib.parse import urljoin


def download_data_from_gdrive(file_id, output_path):
    if os.path.exists(output_path):
        print(f"File already exists: {output_path}")
        return

    session = requests.Session()

    url = "https://drive.google.com/uc"
    params = {
        "export": "download",
        "id": file_id
    }

    response = session.get(url, params=params)
    response.raise_for_status()

    # Parse Google's confirmation page
    soup = BeautifulSoup(response.text, "html.parser")
    form = soup.find("form", {"id": "download-form"})

    if form:
        download_url = urljoin(response.url, form["action"])

        form_data = {
            inp["name"]: inp.get("value", "")
            for inp in form.find_all("input")
            if inp.get("name")
        }

        response = session.get(
            download_url,
            params=form_data,
            stream=True
        )
    else:
        # No confirmation page: download directly
        response = session.get(
            url,
            params=params,
            stream=True
        )

    response.raise_for_status()

    content_type = response.headers.get("Content-Type", "")

    if "text/html" in content_type.lower():
        raise ValueError(
            f"Still receiving HTML instead of the file. "
            f"URL: {response.url}"
        )

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)

    with open(output_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=1024 * 1024):
            if chunk:
                f.write(chunk)

    response.close()
    print(f"Downloaded: {output_path}")

DATA_DIR = "data"
os.makedirs(DATA_DIR, exist_ok=True)

FILES = {
    "1IRfOvfR31A3RG6X150QvTH5szXlrzf50": "accepted_cpl.pkl",
    "13ch5vi_74zAfm95SVdVW0w6s71V_OqVR": "lolalytics_data_15.17_emerald_plus_all.json",#2 change
    "1xUpsyqm4FElsNixb0uIJ-QhBHuREMBI9": "matchup_d2_data.json",
    "1WTi9Ubda_txMuHP33BD-hpO9xzDjNBAG": "synergie_d2_data.json"
}

for file_id, name in FILES.items():
    output_path = os.path.join(DATA_DIR, name)
    download_data_from_gdrive(file_id, output_path)


def list2dic(list,accepted_cpl):
    final_dic = {}
    for i,lane in enumerate(LANES):
        final_dic[lane] = {}
        for j,val in enumerate(list[i]):
            final_dic[lane][accepted_cpl[i][j][0]] = val
    return final_dic


url = "https://ddragon.leagueoflegends.com/cdn/15.17.1/data/en_US/champion.json"
response = requests.get(url)
champion_data = response.json()

# Create a mapping: "name" -> "id"
name_to_id = {}
for champ_id, champ_info in champion_data['data'].items():
    name_to_id[champ_info['name']] = champ_info['id']

patches = ['15.17']

#patches2 = ['15.17','15.16','15.15','15.14','15.13','15.12','15.11','15.10','15.8','15.7','15.6','15.5','15.4','15.3','15.2','15.1']

patches_data = get_patches_data(patches)

#accepted_cpl = get_relevent_champions(patches2,patches_data,min_playrate=0.2,patch_penality=0)

# with open("data/accepted_cpl.pkl", "wb") as f:
#     pickle.dump(accepted_cpl, f)

with open("data/accepted_cpl.pkl", "rb") as f:
    accepted_cpl = pickle.load(f)

#print(accepted_cpl==accepted_cpl2)

champ_wr_pp =  get_true_winrate_per_patch(patches_data,patches,accepted_cpl)[0]

tier_wr_last_patch = get_overall_tier_winrate(patches,patches_data)
tier_delta = tier_wr_last_patch-50

possible_champs = [[c[0] for c in accepted_cpl[i]] for i in range(len(LANES))]


with open('data/synergie_d2_data.json', 'r') as f:
    synergie_d2_dic = json.load(f)

with open('data/matchup_d2_data.json', 'r') as f:
    matchup_d2_dic = json.load(f)


