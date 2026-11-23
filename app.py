from flask import Flask, render_template, request, jsonify
import io
import base64
from flask import Response
from drafting import calculate_team_winrate, get_champion_suggestions, sort_by_winrate, get_matchup_performance_graph, get_synergie_performance_graph
from drafting import get_scaling_over_time, get_damage_share
import numpy as np

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
    use_champion_strength = request.json.get('use_champion_strength', True)

    # print(team_1)
    # print(team_2)

    team_1_winrate,individual_winrates, team_overview = calculate_team_winrate(team_1,team_2,use_champ_winrate=use_champion_strength)
    team_2_winrate = 100 - team_1_winrate
    # Sort the draft data again by winrate (in descending order) to update the champion list
    # sorted_champions = sort_by_winrate(draft_data)
    # print(team_1_winrate,team_2_winrate)
    #print(individual_winrates)
    #print(sorted_champions)
    wrot1= get_scaling_over_time(team_1)
    wrot2= get_scaling_over_time(team_2)

    # # Moyenne globale des 14 valeurs
    # moyenne = np.mean(np.concatenate([wrot1, wrot2]))

    # # Décalage nécessaire pour atteindre 50
    # decalage = moyenne - 50

    # # Application du même décalage aux deux listes
    # wrot1 = (np.array(wrot1) - decalage).tolist()
    # wrot2 = (np.array(wrot2) - decalage).tolist()

    dms = get_damage_share(team_1)
    dms2 = get_damage_share(team_2)
    print(dms)
    print(dms2)
    return jsonify({
        'team_1_winrate': team_1_winrate,
        'team_2_winrate': team_2_winrate,#,
        'indiv_winrates':individual_winrates,
        'team_overview':team_overview,
        'scaling': {
            'team1': wrot1,
            'team2': wrot2
        },
        'damage': {
            'team1': {'physical': dms[0], 'magical': dms[1], 'true': dms[2]},
            'team2': {'physical': dms2[0], 'magical': dms2[1], 'true': dms2[2]}
        }
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

    min_playrate = request.json.get('min_playrate', 0)
    use_champion_strength = request.json.get('use_champion_strength', True)

    bans = request.json.get('bans', [])
    
    draft_data = get_champion_suggestions(ally_team,opponent_team,min_playrate=min_playrate,use_champion_strength=use_champion_strength, bans=bans)
    
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
