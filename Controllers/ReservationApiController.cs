using MINSUE_ProHub.Controllers.DBCLASSES;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using MINSUE_ProHub.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Antiforgery;

namespace MINSUE_ProHub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservationApiController : ControllerBase
    {
        private readonly ReservationLogicDb _reservationLogic;
        private readonly ILogger<ReservationApiController> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAntiforgery _antiforgery;

        public ReservationApiController(
            ReservationLogicDb reservationLogic,
            IHttpContextAccessor httpContextAccessor,
            ILogger<ReservationApiController> logger,
            IAntiforgery antiforgery)
        {
            _reservationLogic = reservationLogic;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _antiforgery = antiforgery;
        }

        [HttpPost]
        public async Task<ActionResult<object>> Create([FromBody] ReservationModel model)
        {
            try
            {
                // Validate antiforgery token from header (for AJAX requests)
                try
                {
                    await _antiforgery.ValidateRequestAsync(HttpContext);
                }
                catch (AntiforgeryValidationException afEx)
                {
                    _logger.LogWarning(afEx, "Antiforgery token validation failed");
                    return BadRequest(new { success = false, message = "Invalid antiforgery token" });
                }

                _logger.LogInformation("Attempting to create reservation: {ReservationData}", 
             JsonSerializer.Serialize(model));

                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
 
                    _logger.LogWarning("Invalid model state: {Errors}", string.Join(", ", errors));
        
                    return BadRequest(new { 
                        success = false, 
                        message = "Invalid reservation data",
                        errors = errors
                    });
                }

                // Get the current user's ID from the HttpContext. If missing, allow guest reservations.
                var userId = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    // Instead of returning an error, log and assign a guest identifier so unauthenticated users can reserve.
                    _logger.LogInformation("User not authenticated - proceeding as guest");
                    userId = "guest"; // will be stored as NULL in DB by ReservationLogicDb
                }

                var reservation = new Reservation
                {
                    StudentName = model.StudentName,
                    StudentId = model.StudentId,
                    Email = model.Email,
                    YearLevel = model.YearLevel,
                    ProductId = model.ProductId,
                    QuantityOrder = model.QuantityOrder,
                    DateToClaim = model.DateToClaim,
                    UserId = userId
                };

                // Use CreateReservationAsync which validates product existence and stock, and returns the new ID
                try
                {
                    var newId = await _reservationLogic.CreateReservationAsync(reservation);
                    _logger.LogInformation("Reservation created successfully (Id: {ReservationId}) for user {UserId}", newId, userId);

                    return Ok(new {
                        success = true,
                        message = "Reservation created successfully",
                        reservationId = newId
                    });
                }
                catch (InvalidOperationException invEx)
                {
                    // Known business/database validation (e.g., product not found, insufficient stock)
                    _logger.LogWarning(invEx, "Reservation validation failed");
                    return BadRequest(new { success = false, message = invEx.Message });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating reservation");
                // Include exception message in response for temporary debugging.
                return StatusCode(500, new {
                    success = false,
                    message = "An error occurred while processing your reservation",
                    error = ex.Message
                });
            }
        }
    }
}