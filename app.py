from flask import Flask, render_template, abort, url_for
from products import PRODUCTS

app = Flask(__name__, static_folder="static", template_folder="templates")

CAT_TITLES = {
    'anti-ice':   'Противогололёдные реагенты',
    'oilgas':     'Промышленная химия для нефтегазовой отрасли',
    'wide-chem':  'Химия широкого спектра',
    'dispersions': 'Дисперсии и материалы для декора',
    'bulk':       'Сыпучие материалы и декор',
    'marble':     'Мрамор молотый фракционный',
}


def _product_name(p: dict, pid: int) -> str:
    return p.get('title') or p.get('name') or f'Товар {pid}'


def _similar_products(pid: int, k: int = 6):
    """Подбор похожих товаров в рамках той же категории.
    Сортировка: схожесть по тегам (Jaccard), затем «близость по id»."""
    cur = PRODUCTS.get(pid)
    if not cur:
        return []

    cat = cur.get('category')
    cur_tags = set(cur.get('tags') or [])
    # кандидаты той же категории, кроме текущего
    items = [p for p in PRODUCTS.values() if p.get(
        'category') == cat and p.get('id') != pid]

    def score(p):
        tags = set(p.get('tags') or [])
        inter = len(cur_tags & tags)
        union = len(cur_tags | tags) or 1
        jaccard = inter / union
        near_id = -abs((p.get('id') or 0) - pid)  # ближе по id — выше
        return (jaccard, near_id)

    items.sort(key=score, reverse=True)
    return items[:k]


@app.route("/", endpoint="index")
def home():
    return render_template("index.html")


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/contact")
def contact():
    return render_template("contact.html")


@app.route("/privacy")
def privacy():
    return render_template("privacy.html")


@app.route("/catalog", endpoint="catalog")
def catalog():
    return render_template("catalog.html", breadcrumbs=[('Каталог', None)])


@app.route("/product/<int:pid>")
def product_page(pid: int):
    product = PRODUCTS.get(pid)
    if not product:
        abort(404)

    cat_title = CAT_TITLES.get(product.get('category'), 'Каталог')
    product_name = _product_name(product, pid)

    breadcrumbs = [
        ('Каталог', url_for('catalog')),
        (product_name, None),
    ]

    similars = _similar_products(pid)

    return render_template(
        "product.html",
        product=product,
        cat_title=cat_title,
        product_name=product_name,
        breadcrumbs=breadcrumbs,
        related=similars
    )


if __name__ == "__main__":
    app.run(debug=True)
