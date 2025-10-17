from flask import Flask, render_template, abort, url_for, jsonify, request
from products import PRODUCTS
import os
from dotenv import load_dotenv
import asyncio
from aiogram import Bot
import traceback


app = Flask(__name__, static_folder="static", template_folder="templates")


# ------------------------------ APP --------------------------------


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


# ------------------------------ TG --------------------------------


@app.route('/submit_request', methods=['POST'])
async def submit_request():
    data = request.get_json()
    name = data['name']
    phone = data['phone']
    product_title = data.get('productTitle') or ''

    message_text = f"""
📩 Новая заявка
👤 Имя: {name}
📞 Телефон: {phone}
🕓 {data.get('timestamp', '')}
{"📦 Товар: " + product_title if product_title else ""}
    """

    try:
        await send_message(message_text)
        return jsonify({'result': True})
    except Exception as e:
        print(traceback.format_exc())  # Для диагностики ошибок
        return jsonify({'result': False}), 500


@app.route('/consultation_form', methods=['POST'])
async def consultation_form():
    data = request.get_json()
    name = data['name']
    phone = data['phone']

    message_text = f"""
📩 Новая заявка (форма консультации)
👤 Имя: {name}
📞 Телефон: {phone}
    """

    try:
        await send_message(message_text)
        return jsonify({'result': True})
    except Exception as e:
        print(traceback.format_exc())  # Для диагностики ошибок
        return jsonify({'result': False}), 500


@app.route('/price_request', methods=['POST'])
async def price_request():
    data = request.get_json()
    name = data['name']
    phone = data['phone']
    product_title = data['productTitle']

    message_text = f"""
🧾 Запрос цены
📦 Товар: {escape_markdown_v2(product_title)}
👤 Имя: {escape_markdown_v2(name)}
📞 Телефон: {escape_markdown_v2(phone)}
    """

    try:
        await send_message(message_text)
        return jsonify({'result': True})
    except Exception as e:
        print(traceback.format_exc())  # Для диагностики ошибок
        return jsonify({'result': False}), 500


def escape_markdown_v2(text):
    special_chars = r'\_*[]()~`>#+-=|{}.'
    for char in special_chars:
        text = text.replace(char, '\\' + char)
    return text


async def send_message(text):
    load_dotenv()

    bot = Bot(token=os.getenv('TELEGRAM_BOT_TOKEN'))
    CHAT_ID = os.getenv('CHAT_ID')

    safe_text = escape_markdown_v2(text)
    print('\n')
    print('\n')
    print(safe_text)
    print('\n')
    print('\n')
    await bot.send_message(CHAT_ID, safe_text, parse_mode='MarkdownV2')


# ------------------------------ DEBUG --------------------------------


if __name__ == "__main__":
    app.run(debug=True)
