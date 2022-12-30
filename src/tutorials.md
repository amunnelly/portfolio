---
title: Tutorials
layout: blurb.njk
---

{% for tutorial in collections.tutorials %}
[{{ tutorial.data.title }}]({{ tutorial.url }})
{% endfor %}

# Tutorials

<ul class="tutorials">
{% for tutorial in collections.tutorials %}
<li><a href="{{ tutorial.url }}">{{ tutorial.data.title }}</a></li>
{% endfor %}
</ul>