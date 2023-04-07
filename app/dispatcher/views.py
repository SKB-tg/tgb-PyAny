import aiohttp_jinja2
from aiohttp.web_fileresponse import FileResponse

# создаем функцию, которая будет отдавать html-файл
@aiohttp_jinja2.template("index.html")
async def index(request):

	return {'css_stat': '/css-static/', 'src_stat': '/src-static/', 'img_stat': '/img-static/', 'js_stat': '/js-static/',}

@aiohttp_jinja2.template("modal.html")
async def modal(request):
	return {'css_stat': '/css-static/', 'src_stat': '/src-static/', 'img_stat': '/img-static/',}

# @aiohttp_jinja2.template("css/style.css")
# async def get_handler_css(request):
# 	print('result')
