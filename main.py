import logging
from os import getenv

from aiohttp.web import run_app, RouteTableDef
from aiohttp.web_app import Application
import jinja2  # шаблонизатор jinja2
import aiohttp_jinja2  # адаптация jinja2 к aiohttp

from aiohttp_admin2 import setup_admin
from app.admin import CustomAdmin
from app.admin import CustomDashboard
from app.admin import FirstCustomView
# from app.admin import UserView
# from app.admin import PostView
# from .tables import postgres_injector
# from .auth import admin_access_middleware
# from .auth import login_page
# from .auth import login_post
# from .auth import logout_page
# from .auth import AuthorizationPolicy


# class CustomDashboard(DashboardView):
#     # redefine `template_name` attribute to your own
#     template_name = 'my_custom_dashboard.html'

# class CustomAdmin(Admin):
#     dashboard_class = CustomDashboard
    
from app.dispatcher import routes
from app.handlers.handler import my_router
#from app.handlers.routes import check_data_handler, demo_handler, send_message_handler
from app.settings import config, BASE_DIR

from aiogram import Bot, Dispatcher
from aiogram.types import MenuButtonWebApp, WebAppInfo
from aiogram.webhook.aiohttp_server import setup_application #, SimpleRequestHandler

TELEGRAM_TOKEN = os.getenv(TELEGRAM_API_TOKEN)
APP_BASE_URL = "https://ashop-tg-hansrubinok.amvera.io" #"https://5c23-46-56-244-132.eu.ngrok.io" #getenv("URL")


async def on_startup(bot: Bot, base_url: str):
    await bot.set_webhook(f"{base_url}/webhook", drop_pending_updates=True)
    await bot.set_chat_menu_button(
        menu_button=MenuButtonWebApp(text="Open Menu", web_app=WebAppInfo(url=f"{base_url}"))
    )

def setup_config(application):
    application["config"] = config
# в этой функции производится настройка url-путей для всего приложения
def setup_routes(application, _dispatcher, bot):
   from app.dispatcher.routes import setup_routes as setup_dispatcher_routes
   setup_dispatcher_routes(application, _dispatcher, bot)  # настраиваем url-пути приложения forum

def setup_external_libraries(application: Application) -> None:
   # указываем шаблонизатору, что html-шаблоны надо искать в папке templates
   aiohttp_jinja2.setup(application, loader=jinja2.FileSystemLoader("app/public"))

def setup_app(application, _dispatcher, bot):
   # настройка всего приложения состоит из:
   setup_external_libraries(application)  # настройки внешних библиотек, например шаблонизатора
   setup_routes(application, _dispatcher, bot)  # настройки роутера приложения
   for resource in application.router.resources():
      print(resource)


def main():
    bot = Bot(token=TELEGRAM_TOKEN, parse_mode="HTML")

    _dispatcher = Dispatcher()
    _dispatcher["base_url"] = APP_BASE_URL
    _dispatcher.startup.register(on_startup)

    _dispatcher.include_router(my_router)

    app = Application() # создаем наш веб-сервер
    app["bot"] = bot

    
    setup_app(app, _dispatcher, bot)  # настраиваем приложение
    setup_application(app, _dispatcher, bot=bot)
    
    setup_admin(app, admin_class=CustomAdmin,  # put here your new template view to register it
    views=[FirstCustomView,])


    run_app(app, host="127.0.0.1", port=8000) #config["common"]["port"])

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    main()
