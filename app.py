from flask import Flask, render_template, request, jsonify
import io
import base64
from flask import Response
from drafting import calculate_team_winrate, get_champion_suggestions, sort_by_winrate, get_matchup_performance_graph, get_synergie_performance_graph


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
