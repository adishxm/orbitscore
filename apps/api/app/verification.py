import json
from pathlib import Path
from .engine import evaluate_mission, load_profiles
from .provenance import append_event, verify_chain
ROOT=Path(__file__).resolve().parents[3]

def main():
    catalog=load_profiles(); report={'verification_date':'2026-10-20','method':'Executed deterministic Python engine on each supplied mission fixture under each selectable profile; no fixture expected_statuses are consumed.','matrix':[],'provenance':[]}
    events=[]
    for mid in ('mission_complete','mission_gap_heavy','mission_conflict'):
        mission=json.loads((ROOT/'fixtures'/f'{mid}.json').read_text())
        for pid in catalog['profiles']:
            result=evaluate_mission(mission,pid)
            row={'mission_id':mid,'profile_id':pid,'msri_band':result['msri']['band'],'findings':{f['rule_id']:f['status'] for f in result['findings']}}
            report['matrix'].append(row)
            append_event(events,'fixture_evaluated',{'mission_id':mid,'profile_id':pid,'result':row})
    report['provenance']=events
    report['provenance_verification']=verify_chain(events)
    (ROOT/'fixtures'/'evaluation_verification_report.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
    print(json.dumps({'evaluations':len(report['matrix']),'provenance_events':len(events),'valid':report['provenance_verification']['valid']}))
if __name__=='__main__':main()
