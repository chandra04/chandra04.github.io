from flask import Flask, render_template
import bibtexparser
import os
from datetime import datetime

app = Flask(__name__)


TARGET_AUTHOR = "Navin Chandra"   # name to highlight


def load_publications():

    with open("publications.bib") as bibtex_file:
        bib_database = bibtexparser.load(bibtex_file)

    publications = []

    

    for entry in bib_database.entries:

        authors = entry.get("author", "")

        # bold only the exact target author string
        authors = authors.replace(TARGET_AUTHOR, f"<b>{TARGET_AUTHOR}</b>")

        pub = {
            "title": entry.get("title", ""),
            "author_html": authors,
            "year": entry.get("year", ""),
            "volume": entry.get("volume", ""),
            "journal": entry.get("journal", entry.get("booktitle", "")),
            "doi": entry.get("doi", "")
        }

        publications.append(pub)

    publications = sorted(publications, key=lambda x: x["year"], reverse=True)

    return publications

def load_report():
    with open('reports.bib') as report_file:
        rep_database =  bibtexparser.load(report_file)

    reports = []
    for entry in rep_database.entries:

        authors = entry.get("author", "")

        # highlight target author
        authors = authors.replace(TARGET_AUTHOR, f"<b>{TARGET_AUTHOR}</b>")

        rep = {
            "title": entry.get("title", ""),
            "author_html": authors,
            "year": entry.get("year", ""),
            "doi": entry.get("doi", "")
        }
        reports.append(rep)

    reports = sorted(reports, key=lambda x: x["year"],reverse=True)

    return reports


def load_conference():
    with open('conference.bib') as conference_file:
        conf_database =  bibtexparser.load(conference_file)

    conference = []
    for entry in conf_database.entries:
        authors = entry.get("author", "")

        authors = authors.replace(TARGET_AUTHOR, f"<b>{TARGET_AUTHOR}</b>")

        rep = {
            "title": entry.get("title", ""),
            "author_html": authors,
            "year": entry.get("year", ""),
            "doi": entry.get("doi", ""),
            "booktitle": entry.get("booktitle", "")
        }
        conference.append(rep)

    conference = sorted(conference, key=lambda x: x["year"],reverse=True)

    return conference

@app.context_processor
def inject_cv_update():
    cv_path = os.path.join(app.static_folder, "CV.pdf")
    
    if os.path.exists(cv_path):
        timestamp = os.path.getmtime(cv_path)
        cv_update = datetime.fromtimestamp(timestamp).strftime("%B %Y")
    else:
        cv_update = "Unknown"
        
    return dict(cv_update=cv_update)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/education")
def education():
    return render_template("education.html")


@app.route("/research")
def research():
    return render_template("research.html")


@app.route("/experience")
def teaching():
    return render_template("experience.html")


@app.route("/publications")
def publications():

    pubs = load_publications()
    repo = load_report()
    conf = load_conference()

    return render_template("publications.html", publications=pubs, reports=repo, conference=conf)


@app.route("/contact")
def contact():
    return render_template("contact.html")


if __name__ == "__main__":
    app.run(debug=True)
