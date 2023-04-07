#from aiohttp import web
from aiohttp_admin2.views import Admin, DashboardView
from aiohttp_admin2.views.aiohttp.views.template_view import TemplateView

class CustomDashboard(DashboardView):
    # redefine `template_name` attribute to your own
    template_name = 'my_custom_dashboard.html'

class CustomAdmin(Admin):
    dashboard_class = CustomDashboard

from aiohttp_admin2.views.aiohttp.views.template_view import TemplateView


class FirstCustomView(TemplateView):
    name = 'Template view'