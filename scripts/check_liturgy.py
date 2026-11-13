#!/usr/bin/env python3
"""Validate generated calendar coverage and complete lesson text before publishing."""
import datetime as dt, json, pathlib, re
root=pathlib.Path(__file__).resolve().parents[1]/'data'/'liturgy'
index=json.loads((root/'index.json').read_text())
dates=[d['date'] for d in index['days']]
assert len(dates)==len(set(dates)), 'Duplicate dates'
assert dates==sorted(dates), 'Dates out of order'
start,end=map(dt.date.fromisoformat,(dates[0],dates[-1]))
assert len(dates)==(end-start).days+1, 'Gap in the generated calendar'
hours={'Missa','Matutinum','Laudes','Prima','Tertia','Sexta','Nona','Vespera','Completorium'}
sections=lessons=0
for entry in index['days']:
    day=json.loads((root/f'{entry["date"]}.json').read_text())
    assert day['date']==entry['date'] and day['rubrics']=='1960'
    assert set(day['hours'])==hours, f'Missing hour: {day["date"]}'
    assert day['title'] and 'Top Next' not in day['context']
    for name,hour in day['hours'].items():
        assert hour['sections'], (day['date'],name)
        for section in hour['sections']:
            sections+=1
            assert section['title'] and len(section['text'])>5
            assert not re.search(r'Software error:|Can.t open.*\.txt|Undefined subroutine',section['text'])
            if section['reading']:
                lessons+=1
                assert len(section['text'])>100, (day['date'],name,section['title'])
                assert all(ref in section['text'] for ref in section['references'])
    mass=day['hours']['Missa']['sections']
    assert any(s['reading'] for s in mass), f'No Mass lesson: {day["date"]}'
    assert entry['readings']==[{'title':s['title'],'references':s['references']} for s in mass if s['reading']]
# Ordinary weekday: both Mass selections and all three Matins readings.
if '2026-11-13' in dates:
    d=json.loads((root/'2026-11-13.json').read_text())
    refs=[r for s in d['hours']['Missa']['sections'] if s['reading'] for r in s['references']]
    assert '1 Cor. 4:9-14' in refs and 'Luke 12:32-34' in refs
    assert len([s for s in d['hours']['Matutinum']['sections'] if s['reading']])==3
# The Easter Vigil must include its four readings as well as the Epistle and Gospel.
for special in ['2026-04-04','2027-03-27']:
    if special in dates:
        d=json.loads((root/f'{special}.json').read_text())
        assert len([s for s in d['hours']['Missa']['sections'] if s['reading']])>=6, special
print(f'Validated {len(dates)} consecutive days, {len(dates)*len(hours)} offices/Masses, {sections:,} sections and {lessons:,} lessons.')
