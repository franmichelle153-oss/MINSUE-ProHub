using Microsoft.AspNetCore.Mvc;

namespace MINSUE_ProHub.Controllers
{
    public class UserController : Controller
    {
        // GET: /User/homepage
        public IActionResult homepage()
        {
            return View();
        }

        // GET: /User/About
        public IActionResult About()
        {
            // TODO: Create About page
            return View();
        }

        // GET: /User/Product
        public IActionResult Product()
        {
            // TODO: Create Product page
            return View();
        }

        // GET: /User/Contact
        public IActionResult Contact()
        {
            // TODO: Create Contact page
            return View();
        }

        // GET: /User/Profile
        public IActionResult Profile()
        {
            // TODO: Create Profile page
            return View();
        }

        // GET: /User/Order
        public IActionResult Order()
        {
            // TODO: Create Order page
            return View();
        }

        // GET: /User/Index
        public IActionResult Index()
        {
            return RedirectToAction("homepage");
        }
    }
}