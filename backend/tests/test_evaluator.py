import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from fastapi.testclient import TestClient
from app.engine import evaluate_mission, run_counterfactual
from app.provenance import append_event, verify_chain
from app.main import app, missions, reviews, evaluations, events
ROOT=Path(__file__).resolve().parents[2]
FIX=ROOT/'fixtures'
def fixture(name): return json.loads((FIX/f'{name}.json').read_text(encoding='utf-8'))

def test_all_fixture_evaluations_all_profiles():
    profiles=json.loads((FIX/'rules_profiles.json').read_text(encoding='utf-8'))['profiles']
    for mission_id in ('mission_complete','mission_gap_heavy','mission_conflict'):
        for profile in profiles:
            result=evaluate_mission(fixture(mission_id),profile)
            assert result['findings'] and all(f['status'] in {'PASS_UNDER_PROFILE','WARNING','NEEDS_EVIDENCE','CONFLICT','NOT_EVALUATED'} for f in result['findings'])
    assert evaluate_mission(fixture('mission_conflict'),'nasa-std-8719-14c-inspired')['conflicts']

def test_profile_switch_changes_eight_point_four_year_disposal():
    m=fixture('mission_complete')
    nasa=evaluate_mission(m,'nasa-std-8719-14c-inspired')
    fcc=evaluate_mission(m,'fcc-22-74-inspired')
    assert next(f for f in nasa['findings'] if f['rule_id']=='NASA-4.6-LIFETIME')['status']=='PASS_UNDER_PROFILE'
    assert next(f for f in fcc['findings'] if f['rule_id']=='FCC-22-74-5YR')['status']=='WARNING'

def test_unconfirmed_fields_are_not_used():
    m=fixture('mission_gap_heavy')
    r=evaluate_mission(m,'fcc-22-74-inspired')
    assert next(f for f in r['findings'] if f['rule_id']=='FCC-22-74-5YR')['status']=='NEEDS_EVIDENCE'

def test_bounded_illustrative_counterfactual():
    m=fixture('mission_complete'); ev=evaluate_mission(m,'fcc-22-74-inspired'); target=next(f for f in ev['findings'] if f['rule_id']=='FCC-22-74-5YR')
    cf=run_counterfactual(m,'fcc-22-74-inspired',target['finding_id'],'lower disposal duration',4.9)
    assert cf['synthetic'] and cf['before_status']=='WARNING' and cf['after_status']=='PASS_UNDER_PROFILE'

def test_provenance_detects_exact_tampering_sequence():
    events=[]; append_event(events,'created',{'mission':'a'}); append_event(events,'evaluated',{'status':'pass'})
    assert verify_chain(events)['valid']
    events[1]['payload']['status']='fail'
    assert verify_chain(events)['tampered_sequence']==2

def test_review_gate_locks_export_until_every_finding_decided():
    client=TestClient(app); missions.clear(); reviews.clear(); evaluations.clear(); events.clear()
    mission=fixture('mission_gap_heavy'); missions[mission['mission_id']]=mission
    result=client.post('/missions/mission_gap_heavy/evaluate',json={'profile_id':'fcc-22-74-inspired'}).json()
    locked=client.get('/export/mission_gap_heavy')
    assert locked.status_code==423 and locked.json()['detail']['code']=='EXPORT_LOCKED'
    for finding in result['findings']:
        resp=client.post(f"/missions/mission_gap_heavy/findings/{finding['finding_id']}/decision",json={'decision':'APPROVED','note':'Reviewed synthetic evidence'})
        assert resp.status_code==200
    assert client.get('/export/mission_gap_heavy').status_code==200

def test_endpoints_and_provenance():
    client=TestClient(app); events.clear()
    r=client.post('/missions/mission_complete/evaluate',json={'profile_id':'nasa-std-8719-14c-inspired'})
    assert r.status_code==200
    assert client.get('/provenance').json()['verification']['valid']

def test_list_missions_and_field_update():
    client=TestClient(app)
    client.post('/reset')
    missions_list = client.get('/missions').json()
    assert len(missions_list) >= 3
    patch_resp = client.patch('/missions/mission_complete/fields/disposal_lifetime_years', json={'value': 4.5, 'human_confirmed': True})
    assert patch_resp.status_code == 200
    m = client.get('/missions/mission_complete').json()
    field = next(f for f in m['fields'] if f['field'] == 'disposal_lifetime_years')
    assert field['value'] == 4.5 and field['human_confirmed'] is True

