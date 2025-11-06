using Microsoft.AspNetCore.Mvc;

namespace YourProjectName.Controllers
{
    public class LoadingController : Controller
    {
        public IActionResult Index()
        {
            return View("~/Views/Loading/loading.cshtml");
        }


    }
}