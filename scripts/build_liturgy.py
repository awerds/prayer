#!/usr/bin/env python3
"""Generate static English liturgy from a pinned Divinum Officium checkout.
Requires Python stdlib, Perl and CGI.pm. No runtime backend or remote requests.
"""
import argparse, concurrent.futures, datetime as dt, html.parser, json, os, pathlib, re, subprocess, time
ROOT=pathlib.Path(__file__).resolve().parents[1]
HOURS={'Matutinum':'Matins','Laudes':'Lauds','Prima':'Prime','Tertia':'Terce','Sexta':'Sext','Nona':'None','Vespera':'Vespers','Completorium':'Compline','Missa':'Mass'}
PIN='e8feeaeddca16e27e6eb349dcfb29c795d62198a'
LESSON_PATTERN=r'Lesson(?: \d+)?|Epistle|Reading \d+|(?:Last )?Gospel|The (?:first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth) reading|Prophecy(?: \d+)?|Passion'
class TextParser(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True); self.hour='Missa';self.h2=False;self.head=[];self.in_cell=False;self.depth=0;self.skip=0;self.parts=[];self.sections={};self.prelude=[];self.header_parts=None;self.latest_header='';self.hour_titles={}
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='p' and not self.in_cell:self.header_parts=[]
        if tag=='h2':
            self.h2=True;self.hour=a.get('id','Missatop').replace('top','');self.head=[];self.hour_titles[self.hour]=self.latest_header
        if tag=='td':
            if not self.in_cell:self.in_cell=True;self.parts=[];self.skip=0
            self.depth+=1
        if self.in_cell:
            if tag in ('script','style','div'):self.skip+=1
            if tag in ('br','p') and not self.skip:self.parts.append('\n')
    def handle_endtag(self,tag):
        if tag=='p' and self.header_parts is not None:
            header=' '.join(''.join(self.header_parts).split())
            if '~' in header:self.latest_header=header
            self.header_parts=None
        if tag=='h2':self.h2=False
        if self.in_cell:
            if tag in ('script','style','div') and self.skip:self.skip-=1
            if tag=='td':
                self.depth-=1
                if self.depth==0:
                    self.in_cell=False
                    text=''.join(self.parts).replace('\xa0',' ')
                    lines=[re.sub(r'[ \t]+',' ',s).strip() for s in text.splitlines()]
                    lines=[s for s in lines if s]
                    if lines:
                        first=lines[0];m=re.search(r'(Psalm \d+(?:\([^)]*\))?)',text)
                        title=re.sub(r'\s*\{.*','',first).strip() if len(first)<100 else (m.group(1) if m else 'Prayer')
                        if first.startswith(('Ant.','℣.','P.','S.','℟.')):title=m.group(1) if m else 'Versicle & response'
                        references=list(dict.fromkeys(s for s in lines if re.match(r'^(?:[1-3] ?)?[A-Za-z][A-Za-z .]+ \d+[:(,]\s*\d',s) and len(s)<85))
                        lesson=next((s for s in lines if re.fullmatch(LESSON_PATTERN,s,re.I)),None)
                        if not lesson and self.hour=='Missa' and re.search(r'holy Gospel according to',text,re.I):lesson='Last Gospel'
                        reading=lesson is not None
                        if lesson:title=lesson
                        self.sections.setdefault(self.hour,[]).append({'title':title,'text':'\n'.join(lines),'references':references,'reading':reading})
    def handle_data(self,data):
        if self.header_parts is not None and not self.in_cell:self.header_parts.append(data)
        if self.in_cell:
            if not self.skip:self.parts.append(data)
        elif not self.sections and not self.h2:self.prelude.append(data)
def generate(source,date):
    md=f'{date.month}-{date.day}-{date.year}';common={'version':'Rubrics 1960 - 1960','lang1':'English','lang2':'English','content':'1','expand':'all','priest':'0'}
    from urllib.parse import urlencode
    result={'date':date.isoformat(),'rubrics':'1960','hours':{}}
    for kind,command in [('missa','praySancta Missa'),('horas','pray'+''.join(k for k in HOURS if k!='Missa'))]:
        query={**common,'command':command,'date' if kind=='missa' else 'date1':md}
        script=source/'web'/'cgi-bin'/kind/('missa.pl' if kind=='missa' else 'officium.pl')
        env={**os.environ,'REQUEST_METHOD':'GET','QUERY_STRING':urlencode(query),'SCRIPT_NAME':'/'+str(script.name),'HTTP_COOKIE':''}
        run=subprocess.run(['perl',str(script)],cwd=script.parent,env=env,capture_output=True,text=True,timeout=90)
        if run.returncode or 'Software error:' in run.stdout:raise RuntimeError(f'{date} {kind}: {run.stderr[:500]} {run.stdout[:200]}')
        p=TextParser();p.feed(run.stdout)
        if kind=='missa':
            head=' '.join(''.join(p.prelude).split());head=re.sub(r'^Content-type: text/html; charset=utf-8\s*','',head)
            result['title']=head.split('Scriptura:')[0].strip();result['context']=head.split('Scriptura:')[-1].strip() if 'Scriptura:' in head else ''
        result['hours'].update({k:{'name':HOURS[k],'title':p.hour_titles.get(k,''),'sections':v} for k,v in p.sections.items()})
    if set(result['hours'])!=set(HOURS):raise RuntimeError(f'{date}: missing hours {set(HOURS)-set(result["hours"])}')
    if not any(s['reading'] for s in result['hours']['Missa']['sections']):raise RuntimeError(f'{date}: no Mass readings')
    return result

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--source',type=pathlib.Path,required=True);ap.add_argument('--start',default='2026-01-01');ap.add_argument('--end',default='2027-12-31');ap.add_argument('--workers',type=int,default=6);ap.add_argument('--force',action='store_true');args=ap.parse_args()
    sha=subprocess.check_output(['git','-C',str(args.source),'rev-parse','HEAD'],text=True).strip()
    if sha!=PIN:raise SystemExit(f'Expected source commit {PIN}, got {sha}')
    out=ROOT/'data'/'liturgy';out.mkdir(parents=True,exist_ok=True)
    (out/'LICENSE.txt').write_text((args.source/'LICENSE').read_text())
    start=dt.date.fromisoformat(args.start);end=dt.date.fromisoformat(args.end);dates=[start+dt.timedelta(days=i) for i in range((end-start).days+1)]
    pending=[d for d in dates if args.force or not (out/f'{d}.json').exists()]
    started=time.time()
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures={pool.submit(generate,args.source.resolve(),d):d for d in pending}
        for n,f in enumerate(concurrent.futures.as_completed(futures),1):
            data=f.result();(out/f'{data["date"]}.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n')
            if n%25==0 or n==len(pending):print(f'Generated {n}/{len(pending)} days ({time.time()-started:.0f}s)',flush=True)
    entries=[]
    for p in sorted(out.glob('????-??-??.json')):
        d=json.loads(p.read_text())
        d['context']=re.sub(r'\s*Top Next$','',d['context'])
        for hour_name,hour in d['hours'].items():
            for section in hour['sections']:
                lesson=next((line for line in section['text'].splitlines() if re.fullmatch(LESSON_PATTERN,line,re.I)),None)
                if not lesson and hour_name=='Missa' and re.search(r'holy Gospel according to',section['text'],re.I):lesson='Last Gospel'
                section['references']=list(dict.fromkeys(line for line in section['text'].splitlines() if re.match(r'^(?:[1-3] ?)?[A-Za-z][A-Za-z .]+ \d+[:(,]\s*\d',line) and len(line)<85))
                section['reading']=lesson is not None
                if lesson:section['title']=lesson
        p.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':'))+'\n')
        entries.append({'date':d['date'],'title':d['title'],'context':d['context'],'readings':[{'title':s['title'],'references':s['references']} for s in d['hours']['Missa']['sections'] if s['reading']]})
    (out/'index.json').write_text(json.dumps({'source':'Divinum Officium','sourceCommit':sha,'rubrics':'1960','language':'English','days':entries},ensure_ascii=False,separators=(',',':'))+'\n')
    print(f'Indexed {len(entries)} days.',flush=True)
if __name__=='__main__':main()
