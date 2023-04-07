import json
from transliterate import slugify, translit

from aiogram.webhook.aiohttp_server import SimpleRequestHandler
from aiohttp.web import RouteTableDef, AbstractRouteDef
from pathlib import Path
from aiohttp.web_fileresponse import FileResponse
from aiohttp.web_request import Request
from aiohttp.web_response import json_response
from aiogram.utils.web_app import check_webapp_signature, safe_parse_webapp_init_data, parse_webapp_init_data
from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    InlineQueryResultArticle,
    InputTextMessageContent,
    WebAppInfo,
)

from app import exceptions
from app.dispatcher import views
from app.database.models import  tg_user_is_db, add_tg_user, TgUser, add_img_product, get_img_product, add_product, row_is_db

#routes = RouteTableDef()

STATIC_PATH = str(Path('main.py').parent.resolve()) + '/app/public'

# @routes.get('/css', name='uri_css')
# async def get_handler_css(request):
# 	return FileResponse(STATIC_PATH + '/css/*.*')


# настраиваем пути, которые будут вести к нашей странице
def setup_routes(app, _dispatcher, bot):
    app.router.add_get("/", views.index)

    app.router.add_static('/css-static/', path=STATIC_PATH + '/css/', name='css_static')
    app.router.add_static('/js-static/', path=STATIC_PATH + '/js/', name='js_static')
    app.router.add_static('/src-static/', path=STATIC_PATH + '/src/', name='src_static')
    app.router.add_static('/img-static/', path=STATIC_PATH + '/img/', name='img_static')
    #app.router.add_get("/", demo_handler)
    app.router.add_post("/zakazDataForm", zakaz_data_form_handler)#/src/sendMessage
    app.router.add_post("/checkData", check_data_handler)#/src/checkData
    app.router.add_post("/sendMessage", send_message_handler)#/src/sendMessage
    app.router.add_post("/sendDataDB", send_data_json_for_db_handler)#/src/sendMessage

    SimpleRequestHandler(
        dispatcher=_dispatcher,
        bot=bot,
    ).register(app, path="/webhook")


async def zakaz_data_form_handler(request: Request):
    bot: Bot = request.app["bot"]

    data = await request.post()
    data1=[]
    data1= [str(i[0]).split(':') for i in data.items()]
    data2= [l[0]+':'+ l[1][3:] for l in data1]
    data3=data2[:-4].extend(data2[-2:])
    # for l in data2.items():
    #     product={}
    #     product[]=

    #print('Order', data3,data1)
    #add_img_product(STATIC_PATH + '/img/3.png')
    #get_img_product(1)
    if data == None:
        return json_response({"ok": False, "err": "Unauthorized"}, status=401)
    # await bot.answer_web_app_query(
    #     web_app_query_id=web_app_init_data.query_id,
    #     result=InlineQueryResultArticle(
    #         id=web_app_init_data.query_id,
    #         title="Demo",
    #         input_message_content=InputTextMessageContent(
    #             message_text='''Уважаемая {id}.\nВаш заказ принят, ожидайте оповещения!\n
                

    #             ''',
    #        ),
    #         reply_markup=reply_markup,
    #     ),
    # ) #             parse_mode=None
    return json_response({"ok": True})


async def check_data_handler(request: Request):
    bot: Bot = request.app["bot"]

    data = await request.post()
    _parse_webapp_init_data = parse_webapp_init_data(init_data=data["_auth"])

    print('OOOO', dict(_parse_webapp_init_data.user))
    tg_user_data = dict(_parse_webapp_init_data.user)

    _tg_user_is_base = tg_user_is_db(dict(_parse_webapp_init_data.user))

    #add_img(STATIC_PATH + '/img/3.png')
    #print(_tg_user_is_base)
    if _tg_user_is_base == False:
        try:
            print(tg_user_data)
            add_tg_user(tg_user_data)
        except exceptions.NotCorrectMessage as e:
            print('eeeee')
    print(TgUser.is_bot)
    if check_webapp_signature(bot.token, data["_auth"]):
        return json_response({"ok": True})

    return json_response({"ok": False, "err": "Unauthorized"}, status=401)


async def send_message_handler(request: Request):
    bot: Bot = request.app["bot"]
    data = await request.post()
    #print(data)
    try:
        web_app_init_data = safe_parse_webapp_init_data(token=bot.token, init_data=data["_auth"])
    except ValueError:
        return json_response({"ok": False, "err": "Unauthorized"}, status=401)

    w_a_i_d = json.loads(data['msg_id'])
    print('ppp', data['msg_id'], type(w_a_i_d))
    d= w_a_i_d.get('Аттрибут') if w_a_i_d.get('Аттрибут') else '--'	
    reply_markup = None
    await bot.send_message(chat_id=web_app_init_data.user.id,
            text=f'''Уважаемый {web_app_init_data.user.username}.\nВаш заказ принят, ожидайте,
             наш курьер свяжется с вами!\n        ------------------------------         \nИнформация о вашем заказе:\n                 \nИмя закащика: {w_a_i_d['Имя']}\nИзделие: {w_a_i_d['Товар']}\nРазмер: {d}\nКол-во:  {w_a_i_d['Количество']}\nЦена:  {w_a_i_d['Цена']} руб.\nОбщая сумма: {w_a_i_d['Общая сумма']} руб.\n''',)


    if data["with_webview"] == "1":
        reply_markup = InlineKeyboardMarkup(
            inline_keyboard=[
                [
                    InlineKeyboardButton(
                        text="Open",
                        web_app=WebAppInfo(url=str(request.url.with_scheme("https"))),
                    )
                ]
            ]
        )
    # await bot.answer_web_app_query(
    #     web_app_query_id=web_app_init_data.query_id,
    #     result=InlineQueryResultArticle(
    #         id=web_app_init_data.query_id,
    #         title="Demo",
    #         input_message_content=InputTextMessageContent(message_text=f'''Уважаемая {web_app_init_data.user.username}.\nВаш заказ принят, ожидайте оповещения!\n
    #             ''',
    #         parse_mode=None,
    #        ),
    #         reply_markup=reply_markup,
    #     ),
    # ) #             parse_mode=None,
    
    return json_response({"ok": True})


async def send_data_json_for_db_handler(request: Request):
    from urllib.parse import parse_qs

    bot: Bot = request.app["bot"]

    data = await request.post()
    parse_data = json.loads(data["my_data"])
    if parse_data.get('product'):
        _data_product = parse_data.get('product')
        attribut = _data_product['attribute'] if _data_product['attribute'] != None else 'X'
        data_product = {
        "name": _data_product['name'],
        "attribute": attribut,
        "description": str(_data_product['description'] + ' ').strip(),
        "price": _data_product['price'],
        "category": translit(_data_product['category'], 'ru'),
        "slug": slugify(_data_product['name']) + '-' + (slugify(attribut) if (attribut != '') else 'X')
        }
        print(174, data_product['attribute'])
        Product=row_is_db('product', ('slug', data_product.get('slug')))
        if Product == None:
            add_product(data_product)
            print('такой еще нет', data_product)
        else:
           print('такая уже есть', Product.id)



    # d={}
    # for k, v in data:
    #     d[k]=v
    #parsed_data = json.loads(data)
    # with open('routes.json', 'wb') as file:
    #     json.loads(data)
       # file.write(parsed_data)
    #for item in parsed_data.items():
    #add_img_product(STATIC_PATH + '/img/3.png')
    if data == None:
        return json_response({"ok": False, "err": "Unauthorized"}, status=401)

    return json_response({"ok": True})



