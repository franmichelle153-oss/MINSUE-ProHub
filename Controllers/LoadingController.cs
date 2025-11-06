using Microsoft.AspNetCore.Mvc;

namespace MINSUE_ProHub.Controllers
{
    public class LoadingController : Controller
    {
        public IActionResult Index()
        {
            return View("~/Views/Loading/loading.cshtml");
        }


    }
}