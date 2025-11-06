using System;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using MINSUE_ProHub.Models;

namespace MINSUE_ProHub.Controllers
{
    public class AccountController : Controller
    {
        private readonly IConfiguration Configuration;

        public AccountController(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        [HttpGet]
        public IActionResult Login()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            if (!ModelState.IsValid)
                return View(model);

            string connectionString = Configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrEmpty(connectionString))
            {
                ModelState.AddModelError(string.Empty, "Database connection not configured.");
                return View(model);
            }

            using (var sqlConnection = new SqlConnection(connectionString))
            {
                await sqlConnection.OpenAsync();
                string query = "SELECT Email, Username FROM Users WHERE Email = @Email AND Password = @Password";
                using (var cmd = new SqlCommand(query, sqlConnection))
                {
                    cmd.Parameters.AddWithValue("@Email", model.Email ?? string.Empty);
                    cmd.Parameters.AddWithValue("@Password", HashPassword(model.Password ?? string.Empty));

                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            var email = reader.GetString(0);
                            var username = reader.GetString(1);

                            var claims = new List<Claim>
                            {
                                new Claim(ClaimTypes.Name, email),
                                new Claim("Username", username),
                                new Claim(ClaimTypes.Role, "User")
                            };

                            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                            var authProperties = new AuthenticationProperties
                            {
                                IsPersistent = model.RememberMe
                            };

                            await HttpContext.SignInAsync(
                                CookieAuthenticationDefaults.AuthenticationScheme,
                                new ClaimsPrincipal(claimsIdentity),
                                authProperties);

                            return RedirectToAction("homepage", "User");
                        }
                        else
                        {
                            ModelState.AddModelError(string.Empty, "Invalid login attempt.");
                            return View(model);
                        }
                    }
                }
            }
        }

        [HttpPost]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return RedirectToAction("Login");
        }

        [HttpGet]
        public IActionResult Register()
        {
            return View();
        }

        [HttpGet]
        public IActionResult ForgotPassword()
        {
            return View();
        }

        public IActionResult SignUp()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> SignUp(SignUpViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            string connectionString = Configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrEmpty(connectionString))
            {
                ModelState.AddModelError(string.Empty, "Database connection not configured.");
                return View(model);
            }

            using (var con = new SqlConnection(connectionString))
            {
                await con.OpenAsync();

                // First check if email already exists
                string checkQuery = "SELECT COUNT(1) FROM Users WHERE Email = @Email";
                using (var checkCmd = new SqlCommand(checkQuery, con))
                {
                    checkCmd.Parameters.AddWithValue("@Email", model.Email ?? string.Empty);
                    int exists = Convert.ToInt32(await checkCmd.ExecuteScalarAsync());
                    if (exists > 0)
                    {
                        ModelState.AddModelError("Email", "This email is already registered.");
                        return View(model);
                    }
                }

                string query = "INSERT INTO Users (Username, StudentEmployeeId, Email, Password) VALUES (@Username, @StudentEmployeeId, @Email, @Password)";
                using (var cmd = new SqlCommand(query, con))
                {
                    cmd.Parameters.AddWithValue("@Username", model.Username ?? string.Empty);
                    cmd.Parameters.AddWithValue("@StudentEmployeeId", model.StudentEmployeeId ?? string.Empty);
                    cmd.Parameters.AddWithValue("@Email", model.Email ?? string.Empty);
                    cmd.Parameters.AddWithValue("@Password", HashPassword(model.Password ?? string.Empty));

                    await cmd.ExecuteNonQueryAsync();
                }
            }

            return RedirectToAction("Login", "Account");
        }

        private static string HashPassword(string password)
        {
            using (var sha = SHA256.Create())
            {
                var bytes = Encoding.UTF8.GetBytes(password);
                var hash = sha.ComputeHash(bytes);
                return Convert.ToBase64String(hash);
            }
        }
    }
}
