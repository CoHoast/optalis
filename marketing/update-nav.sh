#!/bin/bash

OLD_NAV='<ul class="nav-links">
                    <li><a href="services.html">Care Services</a></li>
                    <li><a href="locations.html">Find a Location</a></li>
                    <li><a href="resources.html">Resources</a></li>
                    <li><a href="about.html">About</a></li>
                    <li><a href="careers.html">Careers</a></li>
                    <li><a href="contact.html" class="nav-cta">Contact Us</a></li>
                </ul>'

NEW_NAV='<ul class="nav-links">
                    <li class="has-dropdown">
                        <a href="services.html">Care Services <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></a>
                        <div class="dropdown">
                            <a href="rehab.html">Rehabilitation \&amp; Therapy</a>
                            <a href="skilled-nursing.html">Skilled Nursing</a>
                            <a href="assisted-living.html">Assisted Living</a>
                            <a href="independent-living.html">Independent Living</a>
                            <a href="memory-care.html">Memory Care</a>
                            <a href="specialized-care.html">Specialized Care</a>
                            <a href="respite-care.html">Respite Care</a>
                            <a href="veterans.html">Veterans Care</a>
                        </div>
                    </li>
                    <li class="has-dropdown">
                        <a href="locations.html">Find a Location <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></a>
                        <div class="dropdown dropdown-locations">
                            <div class="dropdown-col">
                                <span class="dropdown-header">Michigan</span>
                                <a href="locations.html#ann-arbor">Ann Arbor</a>
                                <a href="locations.html#canton">Canton</a>
                                <a href="locations.html#grand-rapids">Grand Rapids</a>
                                <a href="locations.html#troy">Troy</a>
                            </div>
                            <div class="dropdown-col">
                                <span class="dropdown-header">Ohio</span>
                                <a href="locations.html#dublin">Dublin</a>
                                <a href="locations.html#akron">Akron</a>
                            </div>
                            <a href="locations.html" class="dropdown-view-all">View All 30+ Locations →</a>
                        </div>
                    </li>
                    <li class="has-dropdown">
                        <a href="resources.html">Resources <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></a>
                        <div class="dropdown">
                            <a href="what-to-expect.html">What to Expect</a>
                            <a href="cost.html">Cost \&amp; Insurance</a>
                            <a href="insurance.html">Managed Care Benefits</a>
                            <a href="pre-surgery.html">Pre-Surgery Planning</a>
                        </div>
                    </li>
                    <li><a href="about.html">About</a></li>
                    <li><a href="careers.html">Careers</a></li>
                    <li><a href="contact.html" class="nav-cta">Contact Us</a></li>
                </ul>'

for file in *.html; do
    if [ "$file" != "index.html" ]; then
        # Check if file has the old nav pattern
        if grep -q '<li><a href="services.html">Care Services</a></li>' "$file"; then
            echo "Updating $file..."
            python3 -c "
import re
with open('$file', 'r') as f:
    content = f.read()

old_pattern = r'<ul class=\"nav-links\">.*?</ul>'
new_nav = '''$NEW_NAV'''

content = re.sub(old_pattern, new_nav, content, flags=re.DOTALL)

with open('$file', 'w') as f:
    f.write(content)
"
        fi
    fi
done
echo "Done updating navigation!"
