using Microsoft.AspNetCore.Mvc;
using MINSUE_ProHub.Models;
using MINSUE_ProHub.Controllers.DBCLASSES;

namespace MINSUE_ProHub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservationApiController : ControllerBase
    {
        private readonly ReservationLogicDb _reservationLogic;

        public ReservationApiController(ReservationLogicDb reservationLogic)
        {
            _reservationLogic = reservationLogic;
        }

        [HttpPost("Create")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([FromBody] ReservationModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var success = await _reservationLogic.CreateReservation(model);
                if (success)
                {
                    return Ok(new { message = "Reservation created successfully" });
                }
                return BadRequest(new { message = "Failed to create reservation" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}