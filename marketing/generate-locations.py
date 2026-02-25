#!/usr/bin/env python3
import os

# Location data: name, slug, state, address, image
locations = [
    # Michigan
    ("Ann Arbor", "ann-arbor", "Michigan", "4701 E Huron River Dr, Ann Arbor, MI 48105", "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&h=500&fit=crop"),
    ("Canton", "canton", "Michigan", "7025 Lilley Rd, Canton, MI 48187", "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=500&fit=crop"),
    ("Grand Rapids", "grand-rapids", "Michigan", "2042 E Beltline Ave NE, Grand Rapids, MI 49525", "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=500&fit=crop"),
    ("Troy", "troy", "Michigan", "2601 John R Rd, Troy, MI 48083", "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=500&fit=crop"),
    ("Allen Park", "allen-park", "Michigan", "14650 Southfield Rd, Allen Park, MI 48101", "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&h=500&fit=crop"),
    ("Belle Fountain", "belle-fountain", "Michigan", "17601 W 13 Mile Rd, Southfield, MI 48076", "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&h=500&fit=crop"),
    ("Bloomfield Hills", "bloomfield-hills", "Michigan", "2975 N Adams Rd, Bloomfield Hills, MI 48304", "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=500&fit=crop"),
    ("Dearborn Heights", "dearborn-heights", "Michigan", "26001 Ford Rd, Dearborn Heights, MI 48127", "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&h=500&fit=crop"),
    ("Evergreen", "evergreen", "Michigan", "19933 W 13 Mile Rd, Southfield, MI 48076", "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=500&fit=crop"),
    ("Fountain Bleu", "fountain-bleu", "Michigan", "42600 Cherry Hill Rd, Canton, MI 48187", "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=500&fit=crop"),
    ("Four Seasons", "four-seasons", "Michigan", "8365 Newburgh Rd, Westland, MI 48185", "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&h=500&fit=crop"),
    ("Greenfield", "greenfield", "Michigan", "25340 Greenfield Rd, Oak Park, MI 48237", "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&h=500&fit=crop"),
    ("Grosse Pointe Woods", "grosse-pointe-woods", "Michigan", "21017 Mack Ave, Grosse Pointe Woods, MI 48236", "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=500&fit=crop"),
    ("Ionia", "ionia", "Michigan", "461 Lafayette St, Ionia, MI 48846", "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&h=500&fit=crop"),
    ("Kent-Crossing", "kent-crossing", "Michigan", "350 N Center St, Lowell, MI 49331", "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=500&fit=crop"),
    ("Kingsford", "kingsford", "Michigan", "931 W Boulevard, Kingsford, MI 49802", "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=500&fit=crop"),
    ("Lakeland", "lakeland", "Michigan", "1717 E Laketon Ave, Muskegon, MI 49442", "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&h=500&fit=crop"),
    ("Leonard", "leonard", "Michigan", "355 W Elmwood Ave, Leonard, MI 48367", "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&h=500&fit=crop"),
    ("Muskegon", "muskegon", "Michigan", "1680 E Sherman Blvd, Muskegon, MI 49444", "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=500&fit=crop"),
    ("Shelby", "shelby", "Michigan", "51850 Dequindre Rd, Shelby Township, MI 48316", "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&h=500&fit=crop"),
    ("ShorePointe", "shorepointe", "Michigan", "26001 Jefferson Ave, St. Clair Shores, MI 48081", "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=500&fit=crop"),
    ("Sterling Heights", "sterling-heights", "Michigan", "36500 Van Dyke Ave, Sterling Heights, MI 48312", "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=500&fit=crop"),
    ("St. Francis", "st-francis", "Michigan", "915 N River Rd, St. Clair, MI 48079", "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&h=500&fit=crop"),
    ("Three Rivers", "three-rivers", "Michigan", "725 N Main St, Three Rivers, MI 49093", "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&h=500&fit=crop"),
    ("Whitehall", "whitehall", "Michigan", "503 E Colby St, Whitehall, MI 49461", "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=500&fit=crop"),
    ("Woodward Hills", "woodward-hills", "Michigan", "39312 Woodward Ave, Bloomfield Hills, MI 48304", "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&h=500&fit=crop"),
    ("Wyoming", "wyoming", "Michigan", "2380 44th St SW, Wyoming, MI 49519", "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=500&fit=crop"),
    # Ohio
    ("The GRAND of Dublin", "grand-dublin", "Ohio", "5765 Venture Dr, Dublin, OH 43017", "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=500&fit=crop"),
    ("Abbyshire Place", "abbyshire-place", "Ohio", "4850 Knightsbridge Blvd, Columbus, OH 43214", "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&h=500&fit=crop"),
    ("Canal Winchester", "canal-winchester", "Ohio", "6570 Winchester Blvd, Canal Winchester, OH 43110", "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&h=500&fit=crop"),
    ("Mill Run", "mill-run", "Ohio", "3725 W Dublin Granville Rd, Columbus, OH 43235", "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=500&fit=crop"),
    ("Monterey", "monterey", "Ohio", "2800 Fisher Rd, Columbus, OH 43204", "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&h=500&fit=crop"),
    ("New Albany", "new-albany", "Ohio", "7223 New Albany Links Dr, New Albany, OH 43054", "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=500&fit=crop"),
    ("Pickaway Manor", "pickaway-manor", "Ohio", "375 Clark Dr, Circleville, OH 43113", "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=500&fit=crop"),
    ("Riverview", "riverview", "Ohio", "8180 Caring Place, Powell, OH 43065", "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&h=500&fit=crop"),
    ("West Park", "west-park", "Ohio", "3305 W 25th St, Cleveland, OH 44109", "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&h=500&fit=crop"),
]

# Services HTML
services_html = '''
                <div class="card">
                    <div class="card-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                    </div>
                    <h3>Rehabilitation & Therapy</h3>
                    <p>Physical, occupational, and speech therapy to help you recover and return home stronger.</p>
                </div>
                <div class="card">
                    <div class="card-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </div>
                    <h3>Skilled Nursing</h3>
                    <p>Round-the-clock nursing care and support for those requiring ongoing medical attention.</p>
                </div>
                <div class="card">
                    <div class="card-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                    </div>
                    <h3>Memory Care</h3>
                    <p>Specialized care for those living with Alzheimer's or dementia in a safe environment.</p>
                </div>
'''

# Read template
with open('location-template.html', 'r') as f:
    template = f.read()

# Generate each location page
for name, slug, state, address, image in locations:
    content = template
    content = content.replace('{{NAME}}', name)
    content = content.replace('{{TITLE}}', f'Optalis of {name}')
    content = content.replace('{{DESCRIPTION}}', f'Skilled nursing, rehabilitation, and memory care at Optalis of {name}, {state}. Schedule a tour today.')
    content = content.replace('{{STATE}}', state)
    content = content.replace('{{ADDRESS}}', address)
    content = content.replace('{{IMAGE}}', image)
    content = content.replace('{{SERVICES}}', services_html)
    
    filename = f'location-{slug}.html'
    with open(filename, 'w') as f:
        f.write(content)
    print(f'Created {filename}')

print(f'\nGenerated {len(locations)} location pages!')
