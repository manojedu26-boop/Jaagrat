import urllib.request, json
url = 'https://api.github.com/repos/manojedu26-boop/Jaagrat/actions/runs/39906343150/jobs'
req = urllib.request.Request(url, headers={'User-Agent': 'JaagratCLI'})
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode())
    jobs = data.get('jobs', [])
    for j in jobs:
        print("Job ID:", j.get('id'), "Check run ID:", j.get('check_run_url'))
