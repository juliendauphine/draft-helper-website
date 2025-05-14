from flask import Flask, render_template, request, jsonify
import io
import base64
from flask import Response
from drafting import calculate_team_winrate, get_champion_suggestions, sort_by_winrate, get_matchup_performance_graph, get_synergie_performance_graph
import os
import requests

def download_data_from_gdrive(file_id, output_path):
    # Check if the file already exists
    if os.path.exists(output_path):
        print(f"File already exists: {output_path}")
        return

    # Otherwise, download it from Google Drive
    url = f"https://drive.google.com/uc?export=download&id={file_id}"
    response = requests.get(url)
    if response.status_code == 200:
        with open(output_path, 'wb') as f:
            f.write(response.content)
        print(f"Downloaded: {output_path}")
    else:
        print(f"Failed to download file ({response.status_code}): {output_path}")

DATA_DIR = "data"
os.makedirs(DATA_DIR, exist_ok=True)

FILES = {
    "1LQ2QIRBhmWnbFbhYEVBad8rpQBXvatSW": "lolalytics_data_15.1_emerald_plus_all.json",
    "1JCROLg--z3sCcGKuRy3WXo1MAxr-tVFL": "lolalytics_data_15.2_emerald_plus_all.json",
    "1-aU4jBkx5nj1QJoDmwUggcqMHecsJQXr": "lolalytics_data_15.3_emerald_plus_all.json",
    "1EDAQnlRNmyVu4VGL4vcS5n23c3mgBnfe": "lolalytics_data_15.4_emerald_plus_all.json",
    "1YB9wDmzJrf4OKTfRluDwL84U08e2jx20": "lolalytics_data_15.5_emerald_plus_all.json",
    "1eSeDp_Amyd7EBbPLpxRa3Hjf0fmZdaxR": "lolalytics_data_15.6_emerald_plus_all.json",
    "1Ot3GmOLQecbdCXMQgHaNykqf1ODxWQFt": "lolalytics_data_15.7_emerald_plus_all.json",
    "16bmlC4OQsycyP4dIaP2OE0Tt9Z7kgezb": "lolalytics_data_15.8_emerald_plus_all.json",
    "1xUpsyqm4FElsNixb0uIJ-QhBHuREMBI9": "matchup_d2_data.json",
    "1WTi9Ubda_txMuHP33BD-hpO9xzDjNBAG": "synergie_d2_data.json",
}

for file_id, name in FILES.items():
    output_path = os.path.join(DATA_DIR, name)
    download_data_from_gdrive(file_id, output_path)


app = Flask(__name__)

# Home route that renders the HTML page
@app.route('/')
def home():
    return render_template('index.html')

# Analyse route that processes selected champions and returns winrate info
@app.route('/analyse', methods=['POST'])
def analyse():
    # Get the selected champions and lanes for both teams (Assuming they are sent as JSON)
    team_1 = request.json.get('team1', [])
    team_2 = request.json.get('team2', [])

    # print(team_1)
    # print(team_2)

    team_1_winrate,individual_winrates = calculate_team_winrate(team_1,team_2)
    team_2_winrate = 100 - team_1_winrate
    # Sort the draft data again by winrate (in descending order) to update the champion list
    # sorted_champions = sort_by_winrate(draft_data)
    # print(team_1_winrate,team_2_winrate)
    #print(individual_winrates)
    #print(sorted_champions)
    return jsonify({
        'team_1_winrate': team_1_winrate,
        'team_2_winrate': team_2_winrate,#,
        'indiv_winrates':individual_winrates
        #'champion_list': sorted_champions  # New champion list for populating the table
    })

@app.route('/reco', methods=['POST'])
def reco():
    # Get the selected champions and lanes for both teams (Assuming they are sent as JSON)
    team1ispicking = request.json.get('team1ispicking', False)
    if team1ispicking:
        ally_team = request.json.get('team1', [])
        opponent_team = request.json.get('team2', [])
    else:
        ally_team = request.json.get('team2', [])
        opponent_team = request.json.get('team1', [])
    
    draft_data = get_champion_suggestions(ally_team,opponent_team)
    
    # Sort the draft data again by winrate (in descending order) to update the champion list
    sorted_champions = sort_by_winrate(draft_data)
    #print(sorted_champions)
    return jsonify({
        'champion_list': sorted_champions  # New champion list for populating the table
    })


@app.route('/matchup', methods=['POST'])
def graph():
    lane = request.json.get('lane', 'top')
    champ = request.json.get('champion', 'Aatrox')
    lane2check = request.json.get('lane2check', 'top')
    fig = get_matchup_performance_graph(lane, champ, lane2check)

    buf = io.BytesIO()
    fig.savefig(buf, format='png')
    buf.seek(0)

    image_base64 = base64.b64encode(buf.read()).decode('utf-8')

    return image_base64

@app.route('/synergie', methods=['POST'])
def graph2():
    lane = request.json.get('lane', 'top')
    champ = request.json.get('champion', 'Aatrox')
    lane2check = request.json.get('lane2check', 'top')
    fig = get_synergie_performance_graph(lane, champ, lane2check)
    if fig:
        buf = io.BytesIO()
        fig.savefig(buf, format='png')
        buf.seek(0)

        image_base64 = base64.b64encode(buf.read()).decode('utf-8')

        return image_base64
    return Response('No graph generated', status=400)

if __name__ == '__main__':
    # Development server only
    app.run(host='0.0.0.0', port=5000, debug=True)
