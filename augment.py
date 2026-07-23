import re

file_path = "/home/cipl1168/Music/Articles/2026/07/23/editorials/the-cockroach-dilemma-facing-indias-political-parties.html"
with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# We need to map 60 terms and inject spans
terms = [
    ("Cockroach protest", "கரப்பான் பூச்சி போராட்டம்", "– a demonstration or dissent mocked or characterized by resilience and self-deprecation.", "dissent, mobilization, rally"),
    ("Political landscape", "அரசியல் நிலப்பரப்பு", "– the current state of political affairs and the underlying dynamics within a region.", "political scenario, environment, climate"),
    ("self-deprecating", "சுய எள்ளல் / தன்னைத்தானே தாழ்த்திக்கொள்ளும்", "– modest about or critical of oneself, especially humorously so.", "modest, unassuming, belittling"),
    ("cannibalise", "உள்வாங்கி அழித்தல்", "– to reduce the sales or impact of one's own by introducing a similar alternative.", "consume, devour, absorb"),
    ("election strategist", "தேர்தல் வியூகவாதி", "– an expert coordinating and directing political campaigns.", "campaign manager, political consultant, planner"),
    ("second fiddle", "இரண்டாம் கட்டப் பங்கு", "– a subordinate role to someone else.", "subordinate, lower rank, secondary role"),
    ("political mobilisation", "அரசியல் திரட்டல்", "– the process of organizing large groups of people for a political purpose.", "political rallying, organizing, public gathering"),
    ("apolitical mobilisation", "அரசியல்சாரா திரட்டல்", "– the gathering of people for a cause without direct alignment with political parties.", "non-partisan gathering, civic rallying"),
    ("sectional interests", "குறிப்பிட்ட சமூக நலம்", "– the advantages or goals of a particular group rather than society as a whole.", "factional goals, localized interests, group benefits"),
    ("demographic bulge", "மக்கள் தொகை பெருக்கம்", "– a temporary increase in the size of a specific age cohort, typically the youth.", "youth bulge, population surge"),
    ("communal polarisation", "மதரீதியான துருவமயமாக்கல்", "– the division of a society into sharply contrasting religious or community factions.", "religious devision, social division, sectarianism"),
    ("counter-consolidation", "எதிர் ஒருங்கிணைப்பு", "– the act of unifying an opposing group in response to an adversary's gathering.", "counter-unification, opposing rally, reactionary alignment"),
    ("collective psyche", "கூட்டு மனநிலை", "– the shared mindset, beliefs, and attitudes of a large group or society.", "shared mindset, public consciousness, common mentality"),
    ("political inheritance", "அரசியல் பாரம்பரியம்", "– the values, allegiances, or systems passed down across generations within politics.", "political legacy, ancestral allegiance, heritage"),
    ("mass mobilisation", "மக்கள் பெருந்திரள் திரட்டல்", "– moving and organizing a significant portion of a population for a united cause.", "mass movement, widespread rally, collective action"),
    ("democratic disarray", "ஜனநாயக சீர்குலைவு", "– a state of confusion, conflict, or malfunction within a democratic system.", "democratic dysfunction, systemic chaos, institutional breakdown"),
    ("Opposition space", "எதிர்க்கட்சி இடைவெளி", "– the political ground or opportunity available for non-ruling parties to operate.", "political vacuum, dissent ground, alternative space"),
    ("public resentment", "பொதுமக்கள் ஆத்திரம்", "– widespread feeling of anger and unfairness among the citizens.", "popular anger, public outrage, mass discontent"),
    ("electoral outcome", "தேர்தல் முடிவு", "– the eventual result or consequence of an election.", "election result, voting verdict, poll outcome"),
    ("Apoliticism", "அரசியல்சாராத் தன்மை", "– apathy or antipathy toward political affiliations or institutions.", "political apathy, non-partisanship, political indifference"),
    ("examination irregularities", "தேர்வு முறைகேடுகள்", "– malpractices and flaws observed during academic tests or evaluations.", "test fraud, evaluation anomalies, academic malpractice"),
    ("horizontal segment", "கிடைமட்ட சமூகப் பிரிவு", "– a broad cross-section of society existing at the same level of hierarchy.", "broad demographic, cross-sectional group"),
    ("Hindi heartland", "ஹிந்தி மையப்பகுதி", "– the structurally and politically dominant Hindi-speaking geographical region.", "Hindi belt, central India, dominant states"),
    ("ideological appeal", "கொள்கை கவர்ச்சி", "– the power of a specific belief system or ideology to attract supporters.", "dogmatic attraction, belief charm, ideological pull"),
    ("vote-to-seat ratio", "வாக்குக்கும் தொகுதிக்குமான விகிதம்", "– the proportion outlining how efficiently received votes convert into parliamentary seats.", "electoral efficiency, representation index"),
    ("Leader of the Opposition", "எதிர்க்கட்சித் தலைவர்", "– the primary leader of the largest political party not in government.", "opposition chief, shadow leader"),
    ("state power", "அரசு அதிகாரம்", "– the authority and regulatory force wielded by a government.", "government authority, institutional force, executive muscle"),
    ("secular middle ground", "மதச்சார்பற்ற நடுநிலைத் தளம்", "– the moderate political space advocating for separation of religion and state.", "moderate sphere, non-religious center, pluralistic base"),
    ("occasional outbursts", "அவ்வப்போது ஏற்படும் கொந்தளிப்புகள்", "– sudden and unpredictable expressions of collective emotion or anger.", "random eruptions, periodic flare-ups, sudden outcry"),
    ("democratic societies", "ஜனநாயக சமூகங்கள்", "– populations governed efficiently by representatives elected by the people.", "free societies, representative nations, self-ruled states"),
    ("electoral consequences", "தேர்தல் விளைவுகள்", "– the impacts and repercussions a movement has on upcoming elections.", "voting impact, poll repercussions, electoral effects"),
    ("diffused", "பரவலாக்கப்பட்ட / சிதறடிக்கப்பட்ட", "– spread over a wide area or a large number of people; weakened in focus.", "scattered, dispersed, dissipated"),
    ("averting", "தவிர்த்தல்", "– preventing or warding off an undesirable event.", "preventing, avoiding, dodging"),
    ("snowballing", "பனிப்பந்து போலப் பெருகும்", "– increasing rapidly in size, intensity, or importance.", "escalating, multiplying, growing rapidly"),
    ("apolitical", "அரசியல் ஈடுபாடற்ற", "– not interested or involved in politics.", "non-partisan, unaligned, neutral"),
    ("social composition", "சமூகக் கட்டமைப்பு / சேர்க்கை", "– the demographic and structural makeup of a particular group.", "demographic makeup, societal structure, group fabric"),
    ("prosperous", "செழிப்பான", "– successful in material terms; flourishing financially.", "wealthy, affluent, thriving"),
    ("communalism", "வகுப்புவாதம்", "– allegiance to one's own ethnic or religious group rather than to the wider society.", "sectarianism, religious bigotry, factionalism"),
    ("illegitimate", "சட்டவிரோதமான / செல்லாத", "– not authorized by the law; not fundamentally valid.", "unlawful, invalid, illegal"),
    ("cynicism", "நம்பிக்கையின்மை", "– an inclination to believe that people are motivated purely by self-interest.", "skepticism, doubt, pessimism"),
    ("unprecedented", "முன்னெப்போதும் இல்லாத", "– never done or known before.", "unparalleled, unequaled, unmatched"),
    ("demographic", "மக்கள்தொகை சார்ந்த", "– relating to the structure of populations.", "populational, statistical, sociological"),
    ("socially diverse", "சமூகரீதியாக பன்முகத்தன்மை கொண்ட", "– encompassing a wide variety of social, cultural, and economic backgrounds.", "heterogeneous, varied, multicultural"),
    ("spectrum", "பல்வகைமை / விரிவான எல்லை", "– a wide range of different but related ideas or objects.", "range, gambit, scope"),
    ("preempting", "முன்கூட்டியே தடுத்தல்", "– taking action in order to prevent an anticipated event from happening.", "forestalling, preventing, anticipating"),
    ("undermine", "பலவீனப்படுத்துதல்", "– lessen the effectiveness, power, or ability of.", "sabotage, weaken, subvert"),
    ("ideological", "கொள்கை சார்ந்த", "– based on or relating to a system of ideas and ideals.", "doctrinal, philosophical, dogmatic"),
    ("dynamism", "இயக்கவியல் / சுறுசுறுப்பு", "– the quality of being characterized by vigorous activity and progress.", "energy, vitality, vigor"),
    ("toolkits", "வழிகாட்டிகள் / உத்திகளின் தொகுப்பு", "– a set of resources or strategies designed to assist in responding to specific situations.", "strategies, resource kits, tactical plans"),
    ("generational", "தலைமுறை சார்ந்த", "– relating to or characteristic of a particular generation.", "age-based, cohort-related"),
    ("sporadic", "அவ்வப்போது நிகழும்", "– occurring at irregular intervals or only in a few places.", "occasional, infrequent, random"),
    ("untidy", "ஒழுங்கற்ற / குழப்பமான", "– not arranged neatly and in order; somewhat messy or chaotic.", "messy, chaotic, disorganized"),
    ("democratic", "ஜனநாயக", "– relating to or supporting democracy or its principles.", "egalitarian, representative, populist"),
    ("disarray", "சீர்குலைவு", "– a state of disorganization or untidiness.", "chaos, disorder, confusion"),
    ("symptom", "அறிகுறி", "– an indication of the existence of something, especially of an undesirable situation.", "sign, indication, warning")
]

# Note: Some already have tags: diametrically opposite, galvanised, precarity, fizzled out, disenchantment, coalesced, delimitation

def replace_with_vocab(match, word, tamil, meaning, synonyms):
    orig = match.group(0)
    # Check if already tagged:
    if 'vocab-words' in orig: return orig
    return f'<span class="vocab-words" data-modal-title="{word} (noun/verb/adj) {tamil}" data-modal-meaning="{meaning}" data-modal-synonyms="{synonyms}">{orig}</span>'

modified = text
import re

for term, tamil, meaning, syn in terms:
    pattern = re.compile(r'\b(' + re.escape(term) + r')\b', re.IGNORECASE)
    # We only want to replace in paragraph texts, not tags. A simple heuristic is avoiding if inside <...> 
    # But since Python regex doesn't support variable length lookbehinds easily without regex module:
    
    def repl(m):
        orig = m.group(1)
        return f'<span class="vocab-words" data-modal-title="{term} {tamil}" data-modal-meaning="{meaning}" data-modal-synonyms="{syn}">{orig}</span>'

    # Do a split by > and < to only replace in text nodes
    parts = re.split(r'(<[^>]+>)', modified)
    for i in range(len(parts)):
        if not parts[i].startswith('<') and term.lower() in parts[i].lower():
            # If word found inside this text node, replace it avoiding existing spans.
            parts[i] = pattern.sub(repl, parts[i])
    modified = "".join(parts)


# Now update the glossary list
list_items = ""
for i, (term, tamil, meaning, syn) in enumerate(terms, start=1):
    list_items += f"                <li><strong>{term.capitalize()}</strong> ({tamil})</li>\n"

glossary_regex = re.compile(r'<ol[^>]*>.*?</ol>', re.DOTALL)
new_ol = '<ol class="key-terms-list">\n' + list_items + '            </ol>'
modified = glossary_regex.sub(new_ol, modified)


with open(file_path, "w", encoding="utf-8") as f:
    f.write(modified)

